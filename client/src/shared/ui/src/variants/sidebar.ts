import { tv } from "tailwind-variants";

export const sidebarMenuButtonVariants = tv({
  base: "group/sidebar-item text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring/50 focus-visible:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium data-[active=true]:[&_svg]:text-sidebar-primary relative flex w-full items-center gap-3 rounded-lg px-2.5 text-left text-sm transition-colors outline-none focus-visible:ring-3 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  variants: {
    size: {
      default: "h-9",
      lg: "py-2",
    },
    indicator: {
      true: "before:bg-sidebar-primary before:absolute before:top-1/2 before:-left-2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:opacity-0 before:transition-opacity data-[active=true]:before:opacity-100 group-data-[state=collapsed]/sidebar:before:hidden",
      false: "",
    },
    tone: {
      default: "",
      destructive:
        "hover:bg-destructive/10 hover:text-destructive hover:[&_svg]:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive focus-visible:ring-destructive/30 focus-visible:[&_svg]:text-destructive",
    },
    collapsible: {
      true: "group-data-[state=collapsed]/sidebar:size-9 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:gap-0 group-data-[state=collapsed]/sidebar:px-0",
      false: "",
    },
  },
  defaultVariants: {
    size: "default",
    tone: "default",
    indicator: true,
    collapsible: true,
  },
});
