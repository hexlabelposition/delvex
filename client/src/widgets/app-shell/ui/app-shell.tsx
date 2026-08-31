import type { ReactNode } from "react";
import type { UserEntity } from "@entities/user";
import { Sidebar } from "@shared/ui";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

interface AppShellProps {
  children: ReactNode;
  user: UserEntity;
  defaultSidebarOpen?: boolean;
}

export function AppShell({
  children,
  user,
  defaultSidebarOpen = true,
}: AppShellProps) {
  return (
    <Sidebar.Provider defaultOpen={defaultSidebarOpen}>
      <AppSidebar
        fullName={user.fullName}
        email={user.email}
        initials={user.initials}
      />

      <Sidebar.Inset>
        <AppHeader />

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:px-8 lg:py-10">
          {children}
        </div>
      </Sidebar.Inset>
    </Sidebar.Provider>
  );
}
