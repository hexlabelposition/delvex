import { SessionProvider } from "@features/auth";
import { requireSession } from "@features/auth/server";
import { AppShell } from "@widgets/app-shell";
import type { ReactNode } from "react";

interface ApplicationLayoutProps {
  children: ReactNode;
}

export default async function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  // The proxy has already turned an anonymous request away; this second check
  // is what makes the session available to the tree below it.
  const session = await requireSession();

  return (
    <SessionProvider user={session.user}>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
