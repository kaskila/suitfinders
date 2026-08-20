"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { ProductStatus } from "@/generated/prisma/enums";

import { setProductStatusAction } from "./actions";

/** Publish/archive/draft controls for the admin product list — never a delete. */
function StatusActions({ id, status }: { id: string; status: ProductStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeStatus(next: ProductStatus) {
    startTransition(async () => {
      await setProductStatusAction(id, next);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "PUBLISHED" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => changeStatus("PUBLISHED")}
        >
          Publish
        </Button>
      ) : null}
      {status !== "DRAFT" ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => changeStatus("DRAFT")}
        >
          Move to draft
        </Button>
      ) : null}
      {status !== "ARCHIVED" ? (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => changeStatus("ARCHIVED")}
        >
          Archive
        </Button>
      ) : null}
    </div>
  );
}

export { StatusActions };
