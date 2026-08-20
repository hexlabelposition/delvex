import { cn } from "@shared/lib";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const alertVariants = cva(
  "relative grid w-full gap-y-0.5 rounded-lg border px-3 py-2.5 text-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "border-destructive/30 bg-destructive/5 text-destructive dark:border-destructive/40",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({
  className,
  variant,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription };
