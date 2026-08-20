import { AlertDialog } from "@base-ui/react/alert-dialog";
import type { ReactNode } from "react";

import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirming: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  children: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirming,
  onOpenChange,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <AlertDialog.Popup className="bg-card text-card-foreground w-full max-w-md rounded-xl border p-5 shadow-xl">
            <AlertDialog.Title className="text-lg font-semibold">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
              {description}
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Close
                className="border-border bg-background hover:bg-muted h-8 rounded-lg border px-2.5 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
                disabled={confirming}
              >
                Keep shipment
              </AlertDialog.Close>
              <Button
                variant="destructive"
                disabled={confirming}
                onClick={onConfirm}
              >
                {confirming ? "Working…" : confirmLabel}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
