"use server";

/**
 * Signed Cloudinary upload flow. The API secret is only ever read here,
 * server-side, to compute a signature — it never reaches the client.
 *
 * Cloudinary's signed upload API has no request parameter for a max byte
 * size (that only exists via a dashboard-configured Upload Preset), so the
 * 5MB limit can't be enforced at sign time. Instead, after the client
 * uploads directly to Cloudinary, verifyUploadedAsset() re-fetches the
 * asset from Cloudinary's Admin API (the authoritative record, not
 * whatever the client claims) and destroys it if it violates the size or
 * format limits.
 */
import { createHash } from "node:crypto";

import { storageRefToUrl } from "@/lib/data/storage";

const UPLOAD_FOLDER = "suitfinders/products";
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function sign(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

export interface SignedUploadPayload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
}

/** Generates a signed payload the client can POST directly to Cloudinary. */
export async function createSignedUpload(): Promise<SignedUploadPayload> {
  const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");

  const timestamp = Math.floor(Date.now() / 1000);
  // Only params Cloudinary will actually enforce belong here: allowed_formats
  // is validated against the file's real, detected format, not its extension.
  const paramsToSign = {
    timestamp: String(timestamp),
    folder: UPLOAD_FOLDER,
    allowed_formats: ALLOWED_FORMATS.join(","),
  };

  return {
    cloudName,
    apiKey,
    timestamp,
    signature: sign(paramsToSign, apiSecret),
    folder: UPLOAD_FOLDER,
    allowedFormats: paramsToSign.allowed_formats,
  };
}

export type VerifyUploadResult =
  | { ok: true; bytes: number; format: string; url: string }
  | { ok: false; error: string };

/**
 * Confirms an uploaded asset against Cloudinary's own record and destroys
 * it if it exceeds the 5MB limit or isn't an allowed format. This is the
 * real enforcement point for size, since the signed upload itself can't
 * cap bytes.
 */
export async function verifyUploadedAsset(publicId: string): Promise<VerifyUploadResult> {
  const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${encodeURIComponent(publicId)}`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  if (!response.ok) {
    return { ok: false, error: "Asset not found in Cloudinary." };
  }

  const asset = (await response.json()) as { bytes: number; format: string };
  const formatOk = ALLOWED_FORMATS.includes(asset.format.toLowerCase());
  const sizeOk = asset.bytes <= MAX_UPLOAD_BYTES;

  if (!formatOk || !sizeOk) {
    await deleteCloudinaryAsset(publicId);
    return {
      ok: false,
      error: !sizeOk ? "Image exceeds the 5MB limit." : "Unsupported image format.",
    };
  }

  return { ok: true, bytes: asset.bytes, format: asset.format, url: storageRefToUrl(publicId) };
}

/** Permanently removes an asset from Cloudinary. */
export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ public_id: publicId, timestamp: String(timestamp) }, apiSecret);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature,
    }),
  });
}
