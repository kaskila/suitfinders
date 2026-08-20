"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { deleteBrandAction } from "./actions";

/** Hard delete for the admin brand list — blocked server-side while Product.brandId references it. */
function DeleteBrandButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteBrandAction(id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-1 text-right">
      <Button type="button" size="sm" variant="destructive" disabled={isPending} onClick={handleDelete}>
        Delete
      </Button>
      {error ? (
        <p role="alert" className="max-w-48 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { DeleteBrandButton };
