import type { ComponentPropsWithoutRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { cn, type VariantProps } from "tailwind-variants";
import { buttonVariants } from "../variants/button";
import NextLink from "next/link";

function PaginationRoot({
  className,
  ...props
}: ComponentPropsWithoutRef<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: ComponentPropsWithoutRef<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<VariantProps<typeof buttonVariants>, "size"> &
  ComponentPropsWithoutRef<typeof NextLink>;

function PaginationLink({
  isActive,
  size = "icon",
  className,
  ...props
}: PaginationLinkProps) {
  return (
    <NextLink
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
        className,
      })}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: ComponentPropsWithoutRef<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" className="cn-rtl-flip" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: ComponentPropsWithoutRef<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" className="cn-rtl-flip" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export const Pagination = {
  Root: PaginationRoot,
  Content: PaginationContent,
  Ellipsis: PaginationEllipsis,
  Item: PaginationItem,
  Link: PaginationLink,
  Next: PaginationNext,
  Previous: PaginationPrevious,
};
