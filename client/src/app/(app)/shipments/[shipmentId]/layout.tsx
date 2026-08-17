import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Shipment details",
  description: "Review shipment details and update its delivery status.",
  path: "/shipments",
});

export default function ShipmentDetailsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
