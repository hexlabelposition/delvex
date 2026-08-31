"use client";

import { Drawer } from "@base-ui/react/drawer";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { cn, type VariantProps } from "tailwind-variants";
import { useMediaQuery } from "usehooks-ts";

import { sidebarMenuButtonVariants } from "../variants/sidebar";
import { Button } from "./button";
import { Separator } from "./separator";

export const SIDEBAR_COOKIE_NAME = "sidebar_state";

const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3.5rem";
const SIDEBAR_MOBILE_QUERY = "(max-width: 767px)";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

interface SidebarContextValue {
  id: string;
  open: boolean;
  openMobile: boolean;
  isMobile: boolean;
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const context = use(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within <Sidebar.Provider>");
  }

  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  className,
  style,
  children,
  ...props
}: ComponentPropsWithoutRef<"div"> & { defaultOpen?: boolean }) {
  const id = useId();
  const isMobile = useMediaQuery(SIDEBAR_MOBILE_QUERY, {
    initializeWithValue: false,
  });

  const [open, setOpenState] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; samesite=lax`;
  }, []);

  const toggle = useCallback(() => {
    if (isMobile) {
      setOpenMobile((previous) => !previous);
      return;
    }

    setOpen(!open);
  }, [isMobile, open, setOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() !== SIDEBAR_KEYBOARD_SHORTCUT ||
        !(event.metaKey || event.ctrlKey)
      ) {
        return;
      }

      event.preventDefault();
      toggle();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  const context = useMemo(
    () => ({
      id,
      open,
      openMobile,
      isMobile,
      setOpen,
      setOpenMobile,
      toggle,
    }),
    [id, open, openMobile, isMobile, setOpen, toggle],
  );

  return (
    <SidebarContext value={context}>
      <div
        data-slot="sidebar-wrapper"
        data-state={!isMobile && !open ? "collapsed" : "expanded"}
        className={cn("group/sidebar bg-background flex min-h-svh", className)}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext>
  );
}

export function SidebarRoot({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"aside">) {
  const { id, isMobile, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Drawer.Root
        open={openMobile}
        onOpenChange={setOpenMobile}
        swipeDirection="left"
      >
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/20 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 supports-backdrop-filter:backdrop-blur-xs" />
          <Drawer.Viewport className="fixed inset-0 z-50 flex items-stretch justify-start">
            <Drawer.Popup className="bg-sidebar text-sidebar-foreground border-sidebar-border h-full w-(--sidebar-width) max-w-[85vw] [transform:translateX(var(--drawer-swipe-movement-x))] border-r shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none data-ending-style:[transform:translateX(-100%)] data-starting-style:[transform:translateX(-100%)] data-swiping:duration-0">
              <Drawer.Title className="sr-only">Navigation</Drawer.Title>
              <Drawer.Content
                data-slot="sidebar"
                className={cn("relative flex h-full flex-col", className)}
              >
                {children}
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <aside
      id={id}
      data-slot="sidebar"
      className={cn(
        "bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-svh w-(--sidebar-width) shrink-0 flex-col border-r transition-[width] duration-200 ease-out group-data-[state=collapsed]/sidebar:w-(--sidebar-width-icon) md:flex",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarDecoration() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="bg-primary/10 absolute -top-24 -right-16 size-56 rounded-full blur-3xl" />
      <div className="bg-muted absolute -bottom-20 -left-20 size-56 rounded-full blur-3xl" />
    </div>
  );
}

export function SidebarHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "relative flex flex-col gap-2 p-3 group-data-[state=collapsed]/sidebar:p-2",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "relative flex min-h-0 flex-1 flex-col gap-5 overflow-x-clip overflow-y-auto px-3 py-2 group-data-[state=collapsed]/sidebar:px-2",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "border-sidebar-border/70 relative flex flex-col gap-1 border-t p-3 group-data-[state=collapsed]/sidebar:p-2",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarCard({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-card"
      className={cn(
        "bg-sidebar-accent/30 ring-sidebar-border/70 flex flex-col gap-1 rounded-xl p-1 ring-1 transition-colors group-data-[state=collapsed]/sidebar:bg-transparent group-data-[state=collapsed]/sidebar:p-0 group-data-[state=collapsed]/sidebar:ring-0",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroup({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "text-sidebar-foreground/50 px-2.5 text-[11px] font-medium tracking-[0.08em] uppercase transition-opacity group-data-[state=collapsed]/sidebar:pointer-events-none group-data-[state=collapsed]/sidebar:h-0 group-data-[state=collapsed]/sidebar:overflow-hidden group-data-[state=collapsed]/sidebar:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenu({
  className,
  ...props
}: ComponentPropsWithoutRef<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({
  className,
  ...props
}: ComponentPropsWithoutRef<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

export function SidebarMenuButton({
  className,
  active = false,
  size,
  tone,
  indicator,
  collapsible,
  ...props
}: ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof sidebarMenuButtonVariants> & { active?: boolean }) {
  return (
    <button
      data-slot="sidebar-menu-button"
      data-active={active}
      className={sidebarMenuButtonVariants({
        size,
        tone,
        indicator,
        collapsible,
        className,
      })}
      {...props}
    />
  );
}

export function SidebarText({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      data-slot="sidebar-text"
      className={cn(
        "min-w-0 flex-1 truncate group-data-[state=collapsed]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarSeparator({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <Separator
      data-slot="sidebar-separator"
      className={cn(
        "bg-sidebar-border/70 group-data-[state=collapsed]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: Omit<ComponentPropsWithoutRef<"button">, "className"> & {
  className?: string;
}) {
  const { id, open, isMobile, openMobile, toggle } = useSidebar();
  const expanded = isMobile ? openMobile : open;
  const Icon = expanded ? PanelLeftCloseIcon : PanelLeftOpenIcon;

  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={expanded}
      aria-controls={isMobile ? undefined : id}
      onClick={(event) => {
        onClick?.(event);
        toggle();
      }}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      {...props}
    >
      <Icon />
    </Button>
  );
}

export function SidebarInset({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn("flex min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}
