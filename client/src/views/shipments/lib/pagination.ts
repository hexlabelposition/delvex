import { routes } from "@shared/config";

import { DEFAULT_PAGE_SIZE } from "../model/page-size";

export type PageWindowItem = number | "ellipsis";

interface ShipmentsHrefOptions {
  page: number;
  size: number;
}

/**
 * Builds the list of page links to render: the first and last page are always
 * present, a window of pages surrounds the current one, and gaps collapse into
 * ellipses.
 */
export function getPageWindow(
  currentPage: number,
  totalPages: number,
  maxLinks = 5,
): PageWindowItem[] {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= maxLinks) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const innerCount = maxLinks - 2;
  let start = Math.max(2, currentPage - Math.floor((innerCount - 1) / 2));
  let end = start + innerCount - 1;

  if (end > totalPages - 1) {
    end = totalPages - 1;
    start = Math.max(2, end - innerCount + 1);
  }

  const pages: PageWindowItem[] = [1];

  if (start > 2) {
    pages.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

/** Keeps shared links clean by omitting the default page and page size. */
export function shipmentsHref({ page, size }: ShipmentsHrefOptions): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (size !== DEFAULT_PAGE_SIZE) {
    params.set("size", String(size));
  }

  const query = params.toString();

  return query ? `${routes.shipments}?${query}` : routes.shipments;
}
