"use client";

import type { ShipmentStatus } from "@shared/api";
import { Alert, AlertDescription, Button, ConfirmDialog } from "@shared/ui";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateShipmentStatusAction } from "../api/actions";
import { statusActionLabel } from "../model/status";
import { StatusActions } from "./status-actions";

interface ShipmentStatusControlsProps {
  shipmentId: string;
  status: ShipmentStatus;
  version: number;
}

export function ShipmentStatusControls({
  shipmentId,
  status,
  version,
}: ShipmentStatusControlsProps) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<ShipmentStatus | null>(
    null,
  );
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    if (pendingStatus === null) return;

    startTransition(async () => {
      const result = await updateShipmentStatusAction(
        shipmentId,
        pendingStatus,
        version,
      );
      setError(result.message);
      if (result.message === "") setPendingStatus(null);
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          setError("");
          router.refresh();
        }}
      >
        <RefreshCw /> Reload
      </Button>
      <StatusActions
        status={status}
        disabled={pending}
        onSelect={(next) => {
          setError("");
          setPendingStatus(next);
        }}
      />
      <ConfirmDialog
        open={pendingStatus !== null}
        title={
          pendingStatus === null
            ? "Update shipment status?"
            : `${statusActionLabel(pendingStatus)}?`
        }
        description="This transition is recorded in the shipment audit history."
        confirmLabel={
          pendingStatus === null
            ? "Update status"
            : statusActionLabel(pendingStatus)
        }
        confirming={pending}
        onOpenChange={(open) => {
          if (!open && !pending) setPendingStatus(null);
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
