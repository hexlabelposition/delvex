import type { ComponentPropsWithoutRef } from "react";
import { cn } from "tailwind-variants";

import { Empty } from "./empty";

/**
 * A full-width, page-sized presentation of the `Empty` kit: a dashed panel with
 * the same blurred accents the hero sections use. `Empty` on its own is sized
 * for slots inside cards, which reads as an afterthought when it stands in for
 * a whole page of content.
 */
function EmptyPanelRoot({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <Empty.Root
      className={cn(
        "bg-card relative min-h-88 justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-16",
        className,
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="bg-primary/10 absolute -top-28 left-1/2 size-80 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-muted absolute -bottom-28 -left-20 size-72 rounded-full blur-3xl" />
      </div>

      <div className="relative flex w-full flex-col items-center gap-7">
        {children}
      </div>
    </Empty.Root>
  );
}

function EmptyPanelHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <Empty.Header className={cn("max-w-md gap-3", className)} {...props} />
  );
}

function EmptyPanelMedia({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <Empty.Media
      variant="icon"
      className={cn(
        "bg-primary/10 text-primary ring-primary/10 mb-1 size-16 rounded-2xl ring-8",
        className,
      )}
      {...props}
    />
  );
}

function EmptyPanelTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <Empty.Title
      className={cn("text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function EmptyPanelDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <Empty.Description
      className={cn("text-base/relaxed", className)}
      {...props}
    />
  );
}

function EmptyPanelContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <Empty.Content
      className={cn(
        "max-w-none flex-col items-center gap-3 sm:flex-row sm:justify-center",
        className,
      )}
      {...props}
    />
  );
}

export const EmptyPanel = {
  Root: EmptyPanelRoot,
  Header: EmptyPanelHeader,
  Media: EmptyPanelMedia,
  Title: EmptyPanelTitle,
  Description: EmptyPanelDescription,
  Content: EmptyPanelContent,
};
