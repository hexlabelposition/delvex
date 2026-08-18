"use client";

import { useRouter } from "next/navigation";

import { formatDate } from "@/lib/format";
import { formatWeight } from "@/features/shipments/format";
import { StatusBadge } from "@/features/shipments/status-badge";
import type { Shipment } from "@/lib/api/types";

export function ShipmentsTable({
  shipments,
  compact = false,
}: {
  shipments: Shipment[];
  compact?: boolean;
}) {
  const router = useRouter();

  const openShipment = (shipmentId: string) => {
    router.push(`/shipments/${shipmentId}`);
  };

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-muted/30 text-muted-foreground text-xs">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Route</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {!compact && <th className="px-4 py-3 font-medium">Weight</th>}
            <th className="px-4 py-3 font-medium">Pickup</th>
            <th className="px-4 py-3 font-medium">Delivery</th>
            {!compact && <th className="px-4 py-3 font-medium">Created</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {shipments.map((shipment) => (
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
                {shipment.originCity}, {shipment.originCountry} →{" "}
                {shipment.destinationCity}, {shipment.destinationCountry}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={shipment.status} />
              </td>
              {!compact && (
                <td className="px-4 py-3 font-mono text-xs">
                  {formatWeight(shipment.weightKg)}
                </td>
              )}
              <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                {formatDate(shipment.pickupAt)}
              </td>
              <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                {formatDate(shipment.deliveryAt)}
              </td>
              {!compact && (
                <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                  {formatDate(shipment.createdAt)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
