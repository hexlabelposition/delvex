import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Edit shipment",
  description: "Update shipment addresses, cargo details, and schedule.",
  path: "/shipments",
});

export default function EditShipmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
