import type { ReactNode } from "react";
import { Sidebar } from "@shared/ui";

interface AppHeaderProps {
  children?: ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="bg-background/80 border-border/70 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
      <Sidebar.Trigger />
      {children}
    </header>
  );
}
