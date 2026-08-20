"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2Icon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSignedUpload, deleteCloudinaryAsset, verifyUploadedAsset } from "@/lib/cloudinary";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Single-image variant of ../products/image-uploader.tsx's signed-upload
 * flow: the browser uploads straight to Cloudinary using the signed
 * payload from createSignedUpload(), then verifyUploadedAsset() re-checks
 * the asset against Cloudinary's own record before it's attached to the
 * form — the actual 5MB/format enforcement, since Cloudinary's signed
 * upload API can't cap that at sign time (see lib/cloudinary.ts).
 */
function LogoUploader({
  value,
  onChange,
  initialUrl,
  error,
}: {
  value: string;
  onChange: (storageRef: string) => void;
  initialUrl?: string;
  error?: string;
}) {
  const [url, setUrl] = useState<string | undefined>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    setUploadError(null);
    setUploading(true);

    try {
      // Client-side checks are a courtesy that saves a round trip — the
      // real enforcement is verifyUploadedAsset() after the upload.
      if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new Error("Only JPG, PNG, or WEBP images are allowed.");
      }
      if (file.size > MAX_BYTES) {
        throw new Error("Exceeds the 5MB limit.");
      }

      const signed = await createSignedUpload();
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signed.apiKey);
      form.append("timestamp", String(signed.timestamp));
      form.append("signature", signed.signature);
      form.append("folder", signed.folder);
      form.append("allowed_formats", signed.allowedFormats);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
        { method: "POST", body: form }
      );
      const uploadJson: { public_id?: string; error?: { message?: string } } = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.public_id) {
        throw new Error(uploadJson.error?.message ?? "Upload failed.");
      }

      const verified = await verifyUploadedAsset(uploadJson.public_id);
      if (!verified.ok) {
        throw new Error(verified.error);
      }

      const previousRef = value;
      setUrl(verified.url);
      onChange(uploadJson.public_id);
      // The replaced logo is no longer wanted regardless of whether the
      // form is ever submitted, so clean it up immediately.
      if (previousRef) {
        void deleteCloudinaryAsset(previousRef);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setUrl(undefined);
    onChange("");
    if (value) {
      void deleteCloudinaryAsset(value);
    }
  }

  return (
    <div className="space-y-3">
      <Label>Logo</Label>

      {url ? (
        <div className="relative aspect-square w-32 bg-muted p-2">
          <Image src={url} alt="" fill sizes="128px" className="object-contain" />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute top-1 right-1"
            onClick={handleRemove}
            aria-label="Remove logo"
          >
            <XIcon />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No logo yet.</p>
      )}

      <div className="space-y-2">
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        {uploading ? (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" /> Uploading…
          </p>
        ) : null}
        {uploadError ? (
          <p role="alert" className="text-sm text-destructive">
            {uploadError}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { LogoUploader };
