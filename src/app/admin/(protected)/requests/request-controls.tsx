"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CustomRequestStatus } from "@/generated/prisma/enums";

import { setRequestStatusAction, updateRequestAdminNotesAction } from "./actions";

const STATUS_OPTIONS: CustomRequestStatus[] = ["NEW", "CONTACTED", "MATCHED", "CLOSED", "LOST"];

/** Per-request status control and admin notes field, each saved via its own Server Action. */
function RequestControls({
  id,
  status,
  adminNotes,
}: {
  id: string;
  status: CustomRequestStatus;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [notesDirty, setNotesDirty] = useState(false);

  function handleStatusChange(next: string) {
    startTransition(async () => {
      await setRequestStatusAction(id, next as CustomRequestStatus);
      router.refresh();
    });
  }

  function saveNotes() {
    if (!notesDirty) return;
    startTransition(async () => {
      await updateRequestAdminNotesAction(id, notes);
      setNotesDirty(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor={`status-${id}`} className="text-xs font-normal text-muted-foreground">
          Status
        </Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger id={`status-${id}`} size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isPending ? <span className="text-xs text-muted-foreground">Saving…</span> : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`notes-${id}`} className="text-xs font-normal text-muted-foreground">
          Admin notes
        </Label>
        <Textarea
          id={`notes-${id}`}
          rows={2}
          value={notes}
          placeholder="Contact attempts, vendor conversations…"
          onChange={(event) => {
            setNotes(event.target.value);
            setNotesDirty(true);
          }}
          onBlur={saveNotes}
        />
      </div>
    </div>
  );
}

export { RequestControls };
