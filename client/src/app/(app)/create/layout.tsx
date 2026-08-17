import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Create shipment",
  description: "Create a new shipment in Delvex.",
  path: "/create",
});

export default function CreateShipmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
