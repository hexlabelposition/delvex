import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Dashboard",
  description: "View an overview of your recent Delvex shipments.",
  path: "/dashboard",
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
