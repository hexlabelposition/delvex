import type { NavigationItem } from "../config/navigation";

function matches(pathname: string, item: NavigationItem): boolean {
  if (item.match === "exact") {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Returns the href of the deepest matching item, so that `/shipments/create`
 * highlights "New shipment" instead of "Shipments".
 */
export function getActiveHref(
  pathname: string,
  items: NavigationItem[],
): string | null {
  let active: NavigationItem | null = null;

  for (const item of items) {
    if (!matches(pathname, item)) {
      continue;
    }

    if (!active || item.href.length > active.href.length) {
      active = item;
    }
  }

  return active?.href ?? null;
}
