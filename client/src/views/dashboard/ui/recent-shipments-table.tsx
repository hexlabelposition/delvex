import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import {
  formatShipmentDate,
  ShipmentStatusBadge,
  type Shipment,
} from "@entities/shipment";
import { routes } from "@shared/config";
import { Card, Table } from "@shared/ui";

interface RecentShipmentsTableProps {
  shipments: Shipment[];
}

export function RecentShipmentsTable({ shipments }: RecentShipmentsTableProps) {
  return (
    <Card.Root className="gap-0 overflow-hidden py-0">
      <Table.Root>
        <Table.Header className="bg-muted/40">
          <Table.Row className="hover:bg-transparent">
            <Table.Head className="text-muted-foreground px-4 text-xs font-medium">
              Reference
            </Table.Head>
            <Table.Head className="text-muted-foreground px-4 text-xs font-medium">
              Route
            </Table.Head>
            <Table.Head className="text-muted-foreground px-4 text-xs font-medium">
              Status
            </Table.Head>
            <Table.Head className="text-muted-foreground hidden px-4 text-xs font-medium md:table-cell">
              Pickup
            </Table.Head>
            <Table.Head className="text-muted-foreground hidden px-4 text-xs font-medium md:table-cell">
              Created
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {shipments.map((shipment) => (
            <Table.Row
              key={shipment.id}
              className="focus-within:bg-muted/50 relative"
            >
              <Table.Cell className="px-4 py-3">
                {/* The link is stretched over the whole row so that the row is
                    clickable while staying a real anchor: middle-click, "open
                    in new tab" and keyboard navigation all keep working, and
                    the table needs no client-side JavaScript. The focus ring
                    stays on the anchor itself — on the row it would be clipped
                    by the horizontally scrollable table container. */}
                <Link
                  href={routes.shipmentDetails(shipment.id)}
                  className="focus-visible:ring-ring/50 rounded-md font-mono text-xs outline-none after:absolute after:inset-0 focus-visible:ring-3"
                >
                  <span className="sr-only">Shipment </span>
                  {shipment.referenceNumber}
                </Link>
              </Table.Cell>

              <Table.Cell className="px-4 py-3">
                <span className="flex items-center gap-2">
                  {shipment.originCity}
                  <ArrowRightIcon
                    className="text-muted-foreground size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {shipment.destinationCity}
                </span>
              </Table.Cell>

              <Table.Cell className="px-4 py-3">
                <ShipmentStatusBadge status={shipment.status} />
              </Table.Cell>

              <Table.Cell className="text-muted-foreground hidden px-4 py-3 text-xs md:table-cell">
                {formatShipmentDate(shipment.pickupAt)}
              </Table.Cell>

              <Table.Cell className="text-muted-foreground hidden px-4 py-3 text-xs md:table-cell">
                {formatShipmentDate(shipment.createdAt)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Card.Root>
  );
}
