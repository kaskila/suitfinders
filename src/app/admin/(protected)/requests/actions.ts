"use server";

import { revalidatePath } from "next/cache";

import type { CustomRequestStatus } from "@/generated/prisma/enums";
import { setRequestStatus, updateRequestAdminNotes } from "@/lib/data/admin/requests";

export async function setRequestStatusAction(id: string, status: CustomRequestStatus): Promise<void> {
  await setRequestStatus(id, status);
  revalidatePath("/admin/requests");
}

export async function updateRequestAdminNotesAction(id: string, notes: string): Promise<void> {
  const trimmed = notes.trim();
  await updateRequestAdminNotes(id, trimmed === "" ? null : trimmed);
  revalidatePath("/admin/requests");
}
