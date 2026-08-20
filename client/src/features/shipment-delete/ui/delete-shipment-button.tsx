"use client";

import { Alert, AlertDescription, Button, ConfirmDialog } from "@shared/ui";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { deleteShipmentAction } from "../api/actions";

interface DeleteShipmentButtonProps {
  shipmentId: string;
}

export function DeleteShipmentButton({
  shipmentId,
}: DeleteShipmentButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    setError("");
    startTransition(async () => {
      // A successful delete redirects, so this only ever resolves on failure.
      const result = await deleteShipmentAction(shipmentId);
      setError(result.message);
      setConfirming(false);
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => setConfirming(true)}
      >
        <Trash2 /> Delete
      </Button>
      <ConfirmDialog
        open={confirming}
        title="Delete shipment?"
        description="This shipment will be permanently removed."
        confirmLabel="Delete shipment"
        confirming={pending}
        onOpenChange={(open) => {
          if (!open && !pending) setConfirming(false);
        }}
        onConfirm={confirm}
      >
        <span />
      </ConfirmDialog>
      {error && (
        <Alert variant="destructive" className="basis-full">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
