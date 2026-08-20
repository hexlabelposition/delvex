import { ApiClientError } from "@shared/api";

export function authFieldErrors(error: unknown) {
  if (!(error instanceof ApiClientError)) return undefined;
  if (Object.keys(error.fieldErrors).length === 0) return undefined;

  return Object.fromEntries(
    Object.entries(error.fieldErrors).map(([field, message]) => [
      field,
      [message],
    ]),
  );
}
