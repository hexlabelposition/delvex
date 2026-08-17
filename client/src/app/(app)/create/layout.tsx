import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create shipment",
  description: "Create a new shipment in Delvex.",
};

export default function CreateShipmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
