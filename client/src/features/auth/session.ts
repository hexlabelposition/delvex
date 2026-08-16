import "server-only";

import { cookies } from "next/headers";

export const REFRESH_COOKIE_NAME = "refresh_token";

function getCookieAttribute(header: string, name: string) {
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`, "i").exec(header);

  return match?.[1];
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE_NAME)?.value;
}

export async function saveRefreshCookie(setCookieHeader: string | null) {
  if (setCookieHeader === null) {
    throw new Error("Authentication response did not include a refresh cookie");
  }

  const encodedToken = getCookieAttribute(setCookieHeader, REFRESH_COOKIE_NAME);

  if (encodedToken === undefined) {
    throw new Error(
      "Authentication response included an invalid refresh cookie",
    );
  }

  const maxAgeValue = getCookieAttribute(setCookieHeader, "Max-Age");
  const maxAge = maxAgeValue === undefined ? undefined : Number(maxAgeValue);

  (await cookies()).set(REFRESH_COOKIE_NAME, decodeURIComponent(encodedToken), {
    httpOnly: true,
    maxAge: Number.isFinite(maxAge) ? maxAge : undefined,
    path: "/",
    sameSite: "lax",
    secure: /(?:^|;\s*)Secure(?:;|$)/i.test(setCookieHeader),
  });
}

export async function clearRefreshCookie() {
  (await cookies()).delete(REFRESH_COOKIE_NAME);
}

export function asBackendCookie(refreshToken: string) {
  return `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`;
}
