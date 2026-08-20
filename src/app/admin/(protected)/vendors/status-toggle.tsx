"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { VendorStatus } from "@/generated/prisma/enums";

import { setVendorStatusAction } from "./actions";

/** Active/Inactive toggle for the admin vendor list — never a delete, see lib/data/admin/vendors.ts. */
function VendorStatusToggle({ id, status }: { id: string; status: VendorStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next: VendorStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    startTransition(async () => {
      await setVendorStatusAction(id, next);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={status === "ACTIVE" ? "destructive" : "outline"}
      disabled={isPending}
      onClick={toggle}
    >
      {status === "ACTIVE" ? "Set inactive" : "Set active"}
    </Button>
  );
}

export { VendorStatusToggle };
