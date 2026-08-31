import Link from "next/link";
import { ArrowLeftIcon, LockIcon, PackageIcon } from "lucide-react";
import {
  isShipmentEditable,
  statusLabel,
  type Shipment,
} from "@entities/shipment";
import {
  shipmentToFormValues,
  UpdateShipmentForm,
} from "@features/shipment-form";
import { routes } from "@shared/config";
import { buttonVariants, EmptyPanel } from "@shared/ui";

interface ShipmentEditViewProps {
  shipment: Shipment;
}

export function ShipmentEditView({ shipment }: ShipmentEditViewProps) {
  const editable = isShipmentEditable(shipment.status);

  return (
    <main className="flex flex-1 flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div>
          <Link
            href={routes.shipmentDetails(shipment.id)}
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "text-muted-foreground hover:text-foreground -ml-2",
            })}
          >
            <ArrowLeftIcon aria-hidden="true" /> Back to shipment
          </Link>
        </div>

        <div>
          <p className="text-muted-foreground font-mono text-xs">
            {shipment.referenceNumber}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Edit shipment
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Details can be changed until the shipment is accepted at the origin
            point.
          </p>
        </div>
      </div>

      {editable ? (
        <UpdateShipmentForm
          shipmentId={shipment.id}
          defaultValues={shipmentToFormValues(shipment)}
        />
      ) : (
        <EmptyPanel.Root>
          <EmptyPanel.Header>
            <EmptyPanel.Media>
              <LockIcon className="size-7" aria-hidden="true" />
            </EmptyPanel.Media>
            <EmptyPanel.Title>Editing is closed</EmptyPanel.Title>
            <EmptyPanel.Description>
              This shipment is {statusLabel(shipment.status).toLowerCase()}, and
              details can only be changed while it is still created.
            </EmptyPanel.Description>
          </EmptyPanel.Header>

          <EmptyPanel.Content>
            <Link
              href={routes.shipmentDetails(shipment.id)}
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              <ArrowLeftIcon aria-hidden="true" /> View shipment
            </Link>

            <Link
              href={routes.shipments}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              All shipments <PackageIcon aria-hidden="true" />
            </Link>
          </EmptyPanel.Content>
        </EmptyPanel.Root>
      )}
    </main>
  );
}
