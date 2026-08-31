"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "tailwind-variants";

function TooltipProvider({
  delay = 250,
  ...props
}: BaseTooltip.Provider.Props) {
  return <BaseTooltip.Provider delay={delay} {...props} />;
}

function TooltipRoot({ ...props }: BaseTooltip.Root.Props) {
  return <BaseTooltip.Root {...props} />;
}

function TooltipTrigger({ ...props }: BaseTooltip.Trigger.Props) {
  return <BaseTooltip.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 8,
  align,
  ...props
}: BaseTooltip.Popup.Props &
  Pick<BaseTooltip.Positioner.Props, "side" | "sideOffset" | "align">) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="z-50"
      >
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-sm ring-1 duration-100 outline-none",
            className,
          )}
          {...props}
        />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}

export const Tooltip = {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};
