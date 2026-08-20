"use client";

import { logoutAction, useSession } from "@features/auth";
import { cn } from "@shared/lib";
import { Button } from "@shared/ui";
import {
  Boxes,
  Building2,
  LogOut,
  MapPin,
  PackageSearch,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/employee", label: "Shipment queue", icon: PackageSearch },
  { href: "/profile", label: "Profile", icon: UserRound },
];

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
}

export function EmployeeShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useSession();
  const branch = user.branch;

  return (
    <div className="bg-muted/20 min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-slate-800 bg-slate-950 text-slate-100 lg:min-h-screen lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:block lg:px-3 lg:py-5">
          <Link
            href="/employee"
            className="flex items-center gap-2 px-2 text-base font-semibold tracking-tight"
          >
            <Boxes className="size-5 text-emerald-400" />
            <span>Delvex Operations</span>
          </Link>

          <nav className="flex gap-1 lg:mt-8 lg:flex-col">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white",
                    active && "bg-slate-800 font-medium text-white",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden px-3 lg:fixed lg:bottom-5 lg:block lg:w-[248px]">
          <div className="border-t border-slate-800 pt-4">
            <Link
              href="/profile"
              className="mb-2 flex items-center gap-3 rounded-md px-2 py-2 hover:bg-slate-800"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold">
                {initials(user.firstName, user.lastName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="block truncate text-xs text-slate-400">
                  Branch employee
                </span>
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-white"
              onClick={() => void logoutAction()}
            >
              <LogOut /> Log out
            </Button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="bg-background flex min-h-16 items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
              <Building2 className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {branch?.name ?? "Branch not assigned"}
              </p>
              <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                <MapPin className="size-3" />
                {branch === null || branch === undefined
                  ? "Contact an administrator"
                  : `${branch.address}, ${branch.city}`}
              </p>
            </div>
          </div>
          {branch && (
            <span className="bg-emerald-50 px-2 py-1 font-mono text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              {branch.code}
            </span>
          )}
        </header>
        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
