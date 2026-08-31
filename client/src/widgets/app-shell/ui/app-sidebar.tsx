"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon, PackageIcon } from "lucide-react";
import { logoutAction } from "@features/auth/logout";
import { routes } from "@shared/config";
import {
  Sidebar,
  sidebarMenuButtonVariants,
  Tooltip,
  useSidebar,
} from "@shared/ui";

import { navigation, navigationItems } from "../config/navigation";
import { getActiveHref } from "../lib/is-active";

interface AppSidebarProps {
  fullName: string;
  email: string;
  initials: string;
}

export function AppSidebar({ fullName, email, initials }: AppSidebarProps) {
  const pathname = usePathname();
  const { open, isMobile, setOpenMobile } = useSidebar();

  const collapsed = !isMobile && !open;
  const activeHref = getActiveHref(pathname, navigationItems);

  function handleNavigate() {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  return (
    <Tooltip.Provider>
      <Sidebar.Root>
        <Sidebar.Decoration />

        <Sidebar.Header>
          <Link
            href={routes.dashboard}
            onClick={handleNavigate}
            aria-label="Delvex dashboard"
            className="focus-visible:ring-sidebar-ring/50 flex items-center gap-3 rounded-xl p-1 outline-none group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:p-0 focus-visible:ring-3"
          >
            <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
              <PackageIcon className="size-5" aria-hidden="true" />
            </span>

            <span className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
              <span className="block truncate text-sm font-semibold tracking-tight">
                Delvex
              </span>
              <span className="text-muted-foreground block truncate text-xs">
                Logistics workspace
              </span>
            </span>
          </Link>
        </Sidebar.Header>

        <Sidebar.Content>
          {navigation.map((group) => (
            <Sidebar.Group key={group.label}>
              <Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>

              <Sidebar.Menu>
                {group.items.map(({ href, label, Icon }) => {
                  const active = href === activeHref;

                  return (
                    <Sidebar.MenuItem key={href}>
                      <Tooltip.Root disabled={!collapsed}>
                        <Tooltip.Trigger
                          render={
                            <Link
                              href={href}
                              onClick={handleNavigate}
                              data-active={active}
                              aria-current={active ? "page" : undefined}
                              className={sidebarMenuButtonVariants()}
                            >
                              <Icon aria-hidden="true" />
                              <Sidebar.Text>{label}</Sidebar.Text>
                            </Link>
                          }
                        />
                        <Tooltip.Content side="right">{label}</Tooltip.Content>
                      </Tooltip.Root>
                    </Sidebar.MenuItem>
                  );
                })}
              </Sidebar.Menu>
            </Sidebar.Group>
          ))}
        </Sidebar.Content>

        <Sidebar.Footer>
          <Sidebar.Card>
            <Tooltip.Root disabled={!collapsed}>
              <Tooltip.Trigger
                render={
                  <Link
                    href={routes.profile}
                    onClick={handleNavigate}
                    data-active={activeHref === routes.profile}
                    className={sidebarMenuButtonVariants({
                      size: "lg",
                      indicator: false,
                    })}
                  >
                    <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {initials}
                    </span>

                    <span className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
                      <span className="block truncate text-sm font-medium">
                        {fullName}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {email}
                      </span>
                    </span>
                  </Link>
                }
              />
              <Tooltip.Content side="right">{fullName}</Tooltip.Content>
            </Tooltip.Root>

            <Sidebar.Separator />

            <form action={logoutAction}>
              <Tooltip.Root disabled={!collapsed}>
                <Tooltip.Trigger
                  render={
                    <Sidebar.MenuButton
                      type="submit"
                      indicator={false}
                      tone="destructive"
                    >
                      <LogOutIcon aria-hidden="true" />
                      <Sidebar.Text>Log out</Sidebar.Text>
                    </Sidebar.MenuButton>
                  }
                />
                <Tooltip.Content side="right">Log out</Tooltip.Content>
              </Tooltip.Root>
            </form>
          </Sidebar.Card>
        </Sidebar.Footer>
      </Sidebar.Root>
    </Tooltip.Provider>
  );
}
