"use client";

import { StatusBadge } from "@entities/shipment";
import { ShipmentStatusControls } from "@features/shipment-status";
import type { EmployeeShipment } from "@shared/api";
import { formatDate } from "@shared/lib";
import { ArrowRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

function branchLabel(record: EmployeeShipment) {
  const { allowedStatuses = [], destinationBranch, originBranch } = record;

  if (allowedStatuses.includes("ACCEPTED_AT_ORIGIN")) {
    return `Origin · ${originBranch?.code ?? record.shipment.originCity}`;
  }

  if (allowedStatuses.includes("IN_TRANSIT")) {
    return `Origin · ${originBranch?.code ?? record.shipment.originCity}`;
  }

  if (
    allowedStatuses.includes("ARRIVED_AT_DESTINATION") ||
    allowedStatuses.includes("DELIVERED")
  ) {
    return `Destination · ${destinationBranch?.code ?? record.shipment.destinationCity}`;
  }

  return "No branch action";
}

export function EmployeeShipmentsTable({
  shipments,
}: {
  shipments: EmployeeShipment[];
}) {
  const router = useRouter();

  const openShipment = (shipmentId: string) => {
    router.push(`/employee/shipments/${shipmentId}`);
  };

  return (
    <div className="bg-background overflow-x-auto border">
      <table className="w-full min-w-[1120px] text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground text-[11px] tracking-wide uppercase">
          <tr>
            <th className="px-3 py-2 font-semibold">Reference</th>
            <th className="px-3 py-2 font-semibold">Customer</th>
            <th className="px-3 py-2 font-semibold">Route</th>
            <th className="px-3 py-2 font-semibold">Status</th>
            <th className="px-3 py-2 font-semibold">Branch task</th>
            <th className="px-3 py-2 font-semibold">Updated</th>
            <th className="px-3 py-2 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {shipments.map((record) => {
            const { customer, shipment } = record;

            return (
              <tr
                key={shipment.id}
                className="hover:bg-muted/30 focus-visible:ring-ring cursor-pointer transition-colors focus-visible:ring-2 focus-visible:outline-none"
                tabIndex={0}
                onClick={() => openShipment(shipment.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openShipment(shipment.id);
                  }
                }}
              >
                <td className="px-3 py-2.5 font-mono text-xs font-semibold">
                  {shipment.referenceNumber}
                </td>
                <td className="px-3 py-2.5">
                  <span className="block font-medium">
                    {customer.firstName} {customer.lastName}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {customer.email}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    {record.originBranch?.code ?? shipment.originCity}
                    <ArrowRight className="text-muted-foreground size-3" />
                    {record.destinationBranch?.code ?? shipment.destinationCity}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={shipment.status} />
                </td>
                <td className="text-muted-foreground px-3 py-2.5 text-xs">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {branchLabel(record)}
                  </span>
                </td>
                <td className="text-muted-foreground px-3 py-2.5 font-mono text-xs whitespace-nowrap">
                  {formatDate(shipment.updatedAt)}
                </td>
                <td
                  className="px-3 py-2.5"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <div className="flex justify-end gap-1">
                    <ShipmentStatusControls
                      shipmentId={shipment.id}
                      status={shipment.status}
                      allowedStatuses={record.allowedStatuses}
                      version={shipment.version}
                      showReload={false}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
