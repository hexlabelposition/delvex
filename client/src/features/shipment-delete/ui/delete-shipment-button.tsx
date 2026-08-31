"use client";

import { Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { Alert, AlertDialog, Button } from "@shared/ui";

import { deleteShipmentAction } from "../api/action";

interface DeleteShipmentButtonProps {
  shipmentId: string;
}

export function DeleteShipmentButton({
  shipmentId,
}: DeleteShipmentButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError("");

    startTransition(async () => {
      // A successful deletion redirects, so reaching this point means the
      // action came back with something to show.
      const result = await deleteShipmentAction(shipmentId);

      setError(result.message);
      setConfirming(false);
    });
  }

  return (
    <>
      <AlertDialog.Root
        open={confirming}
        onOpenChange={(open: boolean) => {
          if (!pending) {
            setConfirming(open);
          }
        }}
      >
        <AlertDialog.Trigger
          render={<Button variant="destructive" disabled={pending} />}
        >
          <Trash2Icon aria-hidden="true" /> Delete
        </AlertDialog.Trigger>

        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Media>
              <Trash2Icon aria-hidden="true" />
            </AlertDialog.Media>
            <AlertDialog.Title>Delete this shipment?</AlertDialog.Title>
            <AlertDialog.Description>
              The shipment and its details are removed for good. This cannot be
              undone.
            </AlertDialog.Description>
          </AlertDialog.Header>

          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={pending}>
              Keep shipment
            </AlertDialog.Cancel>
            <AlertDialog.Action
              variant="destructive"
              disabled={pending}
              onClick={confirm}
            >
              {pending ? "Deleting…" : "Delete shipment"}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {error !== "" && (
        <Alert.Root variant="destructive" className="basis-full">
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      )}
    </>
  );
}
