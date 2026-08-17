import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Shipment details",
  description: "Review shipment details and update its delivery status.",
};

export default function ShipmentDetailsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
