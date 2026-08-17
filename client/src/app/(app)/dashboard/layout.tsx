import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View an overview of your recent Delvex shipments.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
