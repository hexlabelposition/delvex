import type { ReactNode } from "react";
import { getCurrentUser } from "@entities/user/server";
import { AppShell } from "@widgets/app-shell";
import { redirect } from "next/navigation";
import { routes } from "@shared/config";
import { SIDEBAR_COOKIE_NAME } from "@shared/ui";
import { cookies } from "next/headers";
import { UserEntity } from "@entities/user";

interface ApplicationLayoutProps {
  children: ReactNode;
}

export default async function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.login);
  }

  const userEntity = new UserEntity(user);
  const cookieStore = await cookies();
  const defaultSidebarOpen =
    cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  return (
    <AppShell user={userEntity} defaultSidebarOpen={defaultSidebarOpen}>
      {children}
    </AppShell>
  );
}
