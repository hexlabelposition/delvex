import { AppShell } from "@widgets/app-shell";
import type { ReactNode } from "react";

interface ApplicationLayoutProps {
  children: ReactNode;
}

export default function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
