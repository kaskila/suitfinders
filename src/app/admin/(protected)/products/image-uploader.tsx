"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2Icon, XIcon } from "lucide-react";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSignedUpload, deleteCloudinaryAsset, verifyUploadedAsset } from "@/lib/cloudinary";
import type { ProductFormInput, ProductFormValues } from "@/lib/validation/product";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Uploads go straight from the browser to Cloudinary using the signed
 * payload from createSignedUpload() — the API secret never passes through
 * this component. Every upload is then re-checked with verifyUploadedAsset()
 * before it's attached to the form: Cloudinary's signed upload API can't
 * cap file size at sign time, so that call is the actual 5MB enforcement
 * (see src/lib/cloudinary.ts and docs/architecture.md's Validation
 * Boundaries).
 */
export function ProductImageUploader({
  control,
  register,
  initialUrls,
  error,
}: {
  control: Control<ProductFormInput, unknown, ProductFormValues>;
  register: UseFormRegister<ProductFormInput>;
  initialUrls: Record<string, string>;
  error?: string;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "images" });
  const [urls, setUrls] = useState<Record<string, string>>(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    setUploading(true);

    try {
      // useFieldArray's `fields` doesn't update until React re-renders, so
      // it stays stale across every iteration of this loop within the same
      // batch — a local counter is what keeps sortOrder sequential when
      // several files are selected at once.
      let nextSortOrder = fields.length;

      for (const file of Array.from(fileList)) {
        // Client-side checks are a courtesy that saves a round trip — the
        // real enforcement is verifyUploadedAsset() after the upload.
        if (!ACCEPTED_TYPES.includes(file.type)) {
          throw new Error(`${file.name}: only JPG, PNG, or WEBP images are allowed.`);
        }
        if (file.size > MAX_BYTES) {
          throw new Error(`${file.name}: exceeds the 5MB limit.`);
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
          throw new Error(uploadJson.error?.message ?? `${file.name}: upload failed.`);
        }

        const verified = await verifyUploadedAsset(uploadJson.public_id);
        if (!verified.ok) {
          throw new Error(`${file.name}: ${verified.error}`);
        }

        setUrls((prev) => ({ ...prev, [uploadJson.public_id as string]: verified.url }));
        append({ storageRef: uploadJson.public_id, altText: "", sortOrder: nextSortOrder });
        nextSortOrder += 1;
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(index: number, storageRef: string) {
    remove(index);
    // The asset is no longer wanted regardless of whether the form is ever
    // submitted, so clean it up from Cloudinary immediately rather than
    // leaving it orphaned.
    void deleteCloudinaryAsset(storageRef);
  }

  return (
    <div className="space-y-4">
      <Label>Images</Label>

      {fields.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {fields.map((field, index) => (
            <li key={field.id} className="space-y-2 border border-border p-2">
              <div className="relative aspect-4/5 w-full bg-muted">
                {urls[field.storageRef] ? (
                  <Image
                    src={urls[field.storageRef]}
                    alt=""
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                ) : null}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="absolute top-1 right-1"
                  onClick={() => handleRemove(index, field.storageRef)}
                  aria-label="Remove image"
                >
                  <XIcon />
                </Button>
              </div>
              <Input
                placeholder="Alt text (optional)"
                {...register(`images.${index}.altText` as `images.${number}.altText`)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No images yet.</p>
      )}

      <div className="space-y-2">
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
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
