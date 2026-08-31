export const SHIPMENT_PAGE_SIZES = [10, 25, 50] as const;

export const DEFAULT_PAGE_SIZE = SHIPMENT_PAGE_SIZES[0];

export function normalizePageSize(value: number): number {
  return SHIPMENT_PAGE_SIZES.some((size) => size === value)
    ? value
    : DEFAULT_PAGE_SIZE;
}
