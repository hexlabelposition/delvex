import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Shipments",
  description: "Browse and manage your Delvex shipments.",
};

export default function ShipmentsLayout({ children }: { children: ReactNode }) {
  return children;
}
