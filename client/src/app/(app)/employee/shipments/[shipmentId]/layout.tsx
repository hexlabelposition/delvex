import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Employee shipment",
  description: "Review a shipment and update its logistics status.",
  path: "/employee",
});

export default function EmployeeShipmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
