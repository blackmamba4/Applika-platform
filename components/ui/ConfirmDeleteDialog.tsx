"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";

export default function ConfirmDeleteDialog({
  trigger,
  onConfirm,
  loading = false,
  open,
  onOpenChange,
}: {
  trigger: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) {
  const [text, setText] = useState("");
  const canDelete = text.trim().toUpperCase() === "DELETE";

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content
          className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2
                     rounded-lg border bg-white p-5 shadow-xl focus:outline-none"
        >
          <AlertDialog.Title className="text-base font-semibold">
            Delete account?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-foreground/70">
            This action cannot be undone. Type <b>DELETE</b> to confirm you want
            to remove your account and all related data.
          </AlertDialog.Description>

          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="mt-3 w-full rounded-md border px-3 py-2 text-sm"
          />

          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button
                className="rounded-full border px-3 py-2 text-sm hover:bg-white"
                disabled={loading}
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={async () => {
                  if (!canDelete || loading) return;
                  await onConfirm();
                }}
                disabled={!canDelete || loading}
                className="rounded-full bg-red-600 px-3 py-2 text-sm text-white
                           hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting…" : "Delete account"}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
