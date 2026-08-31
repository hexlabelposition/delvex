"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import type { VariantProps } from "tailwind-variants";
import { buttonVariants } from "../variants/button";

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: BaseButton.Props & VariantProps<typeof buttonVariants>) {
  return (
    <BaseButton
      data-slot="button"
      className={(state) =>
        buttonVariants({
          variant,
          size,
          className:
            typeof className === "function" ? className(state) : className,
        })
      }
      {...props}
    />
  );
}
