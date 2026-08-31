"use client";

import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, PencilIcon } from "lucide-react";
import { createColumnHelper, tableFeatures } from "@tanstack/react-table";
import {
  formatShipmentDate,
  ShipmentStatusBadge,
  shipmentWeightLabel,
  type Shipment,
} from "@entities/shipment";
import { routes } from "@shared/config";
import { buttonVariants, Tooltip } from "@shared/ui";

interface ShipmentColumnMeta {
  /** Responsive classes applied to both the header cell and the body cells. */
  className?: string;
}

// The value is phantom — TanStack only reads the type of this slot — but it
// gives every column definition a typed `meta`.
const columnMeta: ShipmentColumnMeta = {};

export const shipmentTableFeatures = tableFeatures({ columnMeta });

const columnHelper = createColumnHelper<
  typeof shipmentTableFeatures,
  Shipment
>();

export const shipmentColumns = columnHelper.columns([
  columnHelper.accessor("referenceNumber", {
    header: "Reference",
    cell: ({ row, getValue }) => (
      // The link is stretched over the whole row so that the row is clickable
      // while staying a real anchor: middle-click, "open in new tab" and
      // keyboard navigation all keep working. The focus ring stays on the
      // anchor itself — on the row it would be clipped by the horizontally
      // scrollable table container.
      <Link
        href={routes.shipmentDetails(row.original.id)}
        className="focus-visible:ring-ring/50 rounded-md font-mono text-xs outline-none after:absolute after:inset-0 focus-visible:ring-3"
      >
        <span className="sr-only">Shipment </span>
        {getValue()}
      </Link>
    ),
  }),

  columnHelper.display({
    id: "route",
    header: "Route",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        {row.original.originCity}
        <ArrowRightIcon
          className="text-muted-foreground size-3.5 shrink-0"
          aria-hidden="true"
        />
        {row.original.destinationCity}
      </span>
    ),
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <ShipmentStatusBadge status={getValue()} />,
  }),

  columnHelper.accessor("weightKg", {
    header: "Weight",
    meta: { className: "hidden xl:table-cell" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {shipmentWeightLabel(getValue())}
      </span>
    ),
  }),

  columnHelper.accessor("pickupAt", {
    header: "Pickup",
    meta: { className: "text-muted-foreground hidden text-xs md:table-cell" },
    cell: ({ getValue }) => formatShipmentDate(getValue()),
  }),

  columnHelper.accessor("deliveryAt", {
    header: "Delivery",
    meta: { className: "text-muted-foreground hidden text-xs xl:table-cell" },
    cell: ({ getValue }) => formatShipmentDate(getValue()),
  }),

  columnHelper.accessor("createdAt", {
    header: "Created",
    meta: { className: "text-muted-foreground hidden text-xs lg:table-cell" },
    cell: ({ getValue }) => formatShipmentDate(getValue()),
  }),

  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { className: "w-px" },
    cell: ({ row }) => (
      // Sits above the stretched row anchor so that the buttons stay clickable.
      <span className="relative z-10 flex items-center justify-end gap-1">
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <Link
                href={routes.shipmentDetails(row.original.id)}
                aria-label={`Open shipment ${row.original.referenceNumber}`}
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon-sm",
                })}
              >
                <ArrowUpRightIcon aria-hidden="true" />
              </Link>
            }
          />
          <Tooltip.Content>Open</Tooltip.Content>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <Link
                href={routes.editShipment(row.original.id)}
                aria-label={`Edit shipment ${row.original.referenceNumber}`}
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon-sm",
                })}
              >
                <PencilIcon aria-hidden="true" />
              </Link>
            }
          />
          <Tooltip.Content>Edit</Tooltip.Content>
        </Tooltip.Root>
      </span>
    ),
  }),
]);
