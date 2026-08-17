import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Shipments",
  description: "Browse and manage your Delvex shipments.",
  path: "/shipments",
});

export default function ShipmentsLayout({ children }: { children: ReactNode }) {
  return children;
}
