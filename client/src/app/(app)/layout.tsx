import { SessionProvider } from "@features/auth";
import { requireSession } from "@features/auth/server";
import { AppShell } from "@widgets/app-shell";
import { EmployeeShell } from "@widgets/employee-shell";
import type { ReactNode } from "react";

interface ApplicationLayoutProps {
  children: ReactNode;
}

export default async function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  const session = await requireSession();

  return (
    <SessionProvider user={session.user}>
      {session.user.role === "EMPLOYEE" ? (
        <EmployeeShell>{children}</EmployeeShell>
      ) : (
        <AppShell>{children}</AppShell>
      )}
    </SessionProvider>
  );
}
