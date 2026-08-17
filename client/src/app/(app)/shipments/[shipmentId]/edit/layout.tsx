import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Edit shipment",
  description: "Update shipment addresses, cargo details, and schedule.",
};

export default function EditShipmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
