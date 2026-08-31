export type SearchParams<
  T extends Record<string, string | string[] | undefined>,
> = T;

export type Params<T extends Record<string, string | string[] | undefined>> = T;

/**
 * Reads an integer out of a Next.js search param. Repeated params arrive as an
 * array, so the first entry wins; anything that is not a whole number falls
 * back to the caller's default.
 */
export function parseIntegerParam(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }

  const parsed = Number(raw);

  return Number.isInteger(parsed) ? parsed : fallback;
}
