import "server-only";

import type { UserResponse } from "@shared/api";
import { apiClient } from "@shared/api";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_LEEWAY_SECONDS,
  REFRESH_COOKIE_NAME,
} from "@shared/config";
import { cookieHeader, decodeAccessToken, parseSetCookie } from "@shared/lib";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import type { AuthSession } from "../model/types";

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE_NAME)?.value;
}

export function asBackendCookie(refreshToken: string) {
  return cookieHeader(REFRESH_COOKIE_NAME, refreshToken);
}

/**
 * Ties the cookie's lifetime to the token's own expiry, so a missing access
 * cookie is all the proxy needs to detect that a refresh is due.
 */
export function accessCookieMaxAge(accessToken: string) {
  const claims = decodeAccessToken(accessToken);

  if (claims === null) {
    return undefined;
  }

  return Math.max(
    0,
    claims.exp - Math.floor(Date.now() / 1000) - ACCESS_TOKEN_LEEWAY_SECONDS,
  );
}

export async function saveSessionCookies(
  accessToken: string,
  setCookieHeader: string | null,
) {
  if (setCookieHeader === null) {
    throw new Error("Authentication response did not include a refresh cookie");
  }

  const refreshCookie = parseSetCookie(setCookieHeader, REFRESH_COOKIE_NAME);

  if (refreshCookie === null) {
    throw new Error(
      "Authentication response included an invalid refresh cookie",
    );
  }

  const cookieStore = await cookies();

  cookieStore.set(REFRESH_COOKIE_NAME, refreshCookie.value, {
    httpOnly: true,
    maxAge: refreshCookie.maxAge,
    path: "/",
    sameSite: "lax",
    secure: refreshCookie.secure,
  });
  cookieStore.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    maxAge: accessCookieMaxAge(accessToken),
    path: "/",
    sameSite: "lax",
    secure: refreshCookie.secure,
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(REFRESH_COOKIE_NAME);
  cookieStore.delete(ACCESS_COOKIE_NAME);
}

/**
 * Resolves the current session on the server. The proxy has already renewed the
 * access cookie when it was due, so this never has to refresh — it only turns
 * the cookie into the user behind it. `cache` keeps that to one call per
 * request no matter how many server components ask for the session.
 */
export const getSession = cache(async (): Promise<AuthSession | null> => {
  const accessToken = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;

  if (accessToken === undefined) {
    return null;
  }

  try {
    const response = await apiClient.get<UserResponse>("/api/users/me", {
      accessToken,
    });

    return { accessToken, user: response.data };
  } catch {
    return null;
  }
});

export async function requireSession() {
  const session = await getSession();

  if (session === null) {
    redirect("/login");
  }

  return session;
}
