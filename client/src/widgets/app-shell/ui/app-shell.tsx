"use client";

import { logoutAction, useSession } from "@features/auth";
import { homeForRole } from "@shared/config";
import { cn } from "@shared/lib";
import { Button } from "@shared/ui";
import {
  Box,
  CirclePlus,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const customerNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shipments", label: "Shipments", icon: Package },
  { href: "/create", label: "Create shipment", icon: CirclePlus },
  { href: "/profile", label: "Profile", icon: UserRound },
];
const employeeNavigation = [
  { href: "/employee", label: "Operations", icon: ClipboardList },
  { href: "/profile", label: "Profile", icon: UserRound },
];

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useSession();
  const home = homeForRole(user.role);
  const navigation =
    user.role === "EMPLOYEE" ? employeeNavigation : customerNavigation;

  return (
    <div className="bg-background min-h-screen md:flex">
      <aside className="bg-sidebar border-sidebar-border flex shrink-0 flex-row items-center justify-between border-b px-4 py-3 md:min-h-screen md:w-64 md:flex-col md:items-stretch md:border-r md:border-b-0 md:px-3 md:py-5">
        <div>
          <Link
            href={home}
            className="flex items-center gap-2 px-2 text-lg font-semibold tracking-tight"
          >
            <Box className="size-5" /> Delvex
          </Link>
          <nav className="mt-0 flex gap-1 overflow-x-auto md:mt-8 md:flex-col">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-sidebar-foreground hover:bg-sidebar-accent flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active && "bg-sidebar-accent font-medium",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="hidden border-t pt-4 md:block">
          <Link
            href="/profile"
            className="hover:bg-sidebar-accent mb-3 flex items-center gap-3 rounded-lg px-2 py-2"
          >
            <span className="bg-muted flex size-8 items-center justify-center rounded-full text-xs font-medium">
              {initials(user.firstName, user.lastName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-muted-foreground block truncate text-xs">
                {user.email}
              </span>
              {user.role === "EMPLOYEE" && (
                <span className="text-muted-foreground block text-[11px] font-medium tracking-wide uppercase">
                  Employee
                </span>
              )}
            </span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-full justify-start"
            onClick={() => void logoutAction()}
          >
            <LogOut /> Log out
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12">
        {children}
      </main>
    </div>
  );
}
