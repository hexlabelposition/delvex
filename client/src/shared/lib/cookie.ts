export function getCookieAttribute(header: string, name: string) {
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`, "i").exec(header);

  return match?.[1];
}

export interface ParsedSetCookie {
  value: string;
  maxAge?: number;
  secure: boolean;
}

/**
 * Reads a single cookie out of an upstream `Set-Cookie` header so the value can
 * be re-issued on our own domain instead of being forwarded verbatim.
 */
export function parseSetCookie(
  header: string,
  name: string,
): ParsedSetCookie | null {
  const encodedValue = getCookieAttribute(header, name);

  if (encodedValue === undefined) {
    return null;
  }

  const maxAgeValue = getCookieAttribute(header, "Max-Age");
  const maxAge = maxAgeValue === undefined ? undefined : Number(maxAgeValue);

  return {
    value: decodeURIComponent(encodedValue),
    maxAge: Number.isFinite(maxAge) ? maxAge : undefined,
    secure: /(?:^|;\s*)Secure(?:;|$)/i.test(header),
  };
}

export function cookieHeader(name: string, value: string) {
  return `${name}=${encodeURIComponent(value)}`;
}
