"use client";

import { useRouter } from "next/navigation";

import { StatusBadge } from "@/features/shipments/status-badge";
import type { EmployeeShipment } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

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
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-muted/30 text-muted-foreground text-xs">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Route</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Last updated</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {shipments.map(({ customer, shipment }) => (
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
              <td className="px-4 py-3 font-mono text-xs">
                {shipment.referenceNumber}
              </td>
              <td className="px-4 py-3">
                <span className="block font-medium">
                  {customer.firstName} {customer.lastName}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {customer.email}
                </span>
              </td>
              <td className="px-4 py-3">
                {shipment.originCity}, {shipment.originCountry} →{" "}
                {shipment.destinationCity}, {shipment.destinationCountry}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={shipment.status} />
              </td>
              <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                {formatDate(shipment.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
