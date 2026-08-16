import type { ReactNode } from "react";

import { AppShell } from "@/features/dashboard/app-shell";

export default function ApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
