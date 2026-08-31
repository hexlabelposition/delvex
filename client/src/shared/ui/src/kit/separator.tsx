import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { cn } from "tailwind-variants";

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: BaseSeparator.Props) {
  return (
    <BaseSeparator
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className,
      )}
      {...props}
    />
  );
}
