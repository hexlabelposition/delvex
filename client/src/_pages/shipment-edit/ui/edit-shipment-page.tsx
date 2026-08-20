import { getShipment } from "@entities/shipment";
import { requireSession } from "@features/auth/server";
import { shipmentToFormValues } from "@features/shipment-form";
import { Alert, AlertDescription, Button } from "@shared/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EditShipmentForm } from "./edit-shipment-form";

interface EditShipmentPageProps {
  shipmentId: string;
}

export async function EditShipmentPage({ shipmentId }: EditShipmentPageProps) {
  const { accessToken } = await requireSession();

  let shipment;

  try {
    shipment = await getShipment(shipmentId, accessToken);
  } catch (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Could not load shipment"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Logistics has already picked the shipment up; it is no longer editable.
  if (shipment.status !== "CREATED") {
    redirect(`/shipments/${shipment.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        render={<Link href={`/shipments/${shipmentId}`} />}
      >
        <ArrowLeft /> Back to shipment
      </Button>
      <div className="mt-5">
        <h1 className="text-3xl font-semibold tracking-tight">Edit shipment</h1>
        <p className="text-muted-foreground mt-2">
          Shipment details can be edited until logistics starts processing it.
        </p>
      </div>
      <EditShipmentForm
        shipmentId={shipmentId}
        initialValues={shipmentToFormValues(shipment)}
      />
    </div>
  );
}
