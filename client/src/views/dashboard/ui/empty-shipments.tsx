import Link from "next/link";
import { ArrowRightIcon, TruckIcon } from "lucide-react";
import { routes } from "@shared/config";
import { buttonVariants, EmptyPanel } from "@shared/ui";

export function EmptyShipments() {
  return (
    <EmptyPanel.Root>
      <EmptyPanel.Header>
        <EmptyPanel.Media>
          <TruckIcon className="size-7" aria-hidden="true" />
        </EmptyPanel.Media>
        <EmptyPanel.Title>No shipments yet</EmptyPanel.Title>
        <EmptyPanel.Description>
          Create your first shipment and it will show up here with its route,
          status, and schedule.
        </EmptyPanel.Description>
      </EmptyPanel.Header>

      <EmptyPanel.Content>
        <Link
          href={routes.createShipment}
          className={buttonVariants({ variant: "default", size: "lg" })}
        >
          Create shipment <ArrowRightIcon aria-hidden="true" />
        </Link>
      </EmptyPanel.Content>
    </EmptyPanel.Root>
  );
}
