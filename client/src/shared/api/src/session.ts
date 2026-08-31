import "server-only";

import { z } from "zod/v4";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { parseSetCookie } from "cookie";
import { createServerClient, getClientIp } from "./server.client";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthRoute, isProtectedRoute, routes } from "@shared/config";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

function getAccessTokenExpiration(accessToken: string): Date | null {
  try {
    const { exp } = decodeJwt(accessToken);

    if (typeof exp !== "number" || !Number.isFinite(exp)) {
      return null;
    }

    const expiration = new Date(exp * 1000);

    return Number.isNaN(expiration.getTime()) ? null : expiration;
  } catch {
    return null;
  }
}

interface RefreshCookie {
  value: string;
  maxAge: number;
}

export function getRefreshCookie(headers: Headers): RefreshCookie | null {
  for (const setCookie of headers.getSetCookie()) {
    const cookie = parseSetCookie(setCookie);

    if (
      cookie.name === REFRESH_TOKEN_COOKIE &&
      cookie.value &&
      typeof cookie.maxAge === "number"
    ) {
      return {
        value: cookie.value,
        maxAge: cookie.maxAge,
      };
    }
  }

  return null;
}

interface CreateSessionOptions {
  accessToken: string;
  responseHeaders: Headers;
}

export async function createSession({
  accessToken,
  responseHeaders,
}: CreateSessionOptions): Promise<void> {
  const accessTokenExpiration = getAccessTokenExpiration(accessToken);

  if (!accessTokenExpiration) {
    throw new Error("Access token expiration is invalid");
  }

  const refreshCookie = getRefreshCookie(responseHeaders);

  if (!refreshCookie) {
    throw new Error("Refresh cookie is missing from the API response");
  }

  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...sessionCookieOptions,
    expires: accessTokenExpiration,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshCookie.value, {
    ...sessionCookieOptions,
    maxAge: refreshCookie.maxAge,
  });
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  return accessToken ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  return refreshToken ?? null;
}

export async function revokeSession(
  refreshToken: string | null,
): Promise<void> {
  try {
    if (refreshToken) {
      const client = createServerClient();

      await client.post({
        path: "/auth/logout",
        parse: () => ({}),
        headers: {
          Cookie: `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(refreshToken)}`,
        },
        cache: "no-store",
      });
    }
  } finally {
    await clearSessionCookies();
  }
}

interface RefreshResponse {
  accessToken: string;
  accessTokenExpiration: Date;
  refreshCookie: RefreshCookie;
}

async function refreshSession(
  refreshToken: string,
  clientIp: string | undefined,
): Promise<RefreshResponse | null> {
  const client = createServerClient({ clientIp });

  try {
    const response = await client.post({
      path: "/auth/refresh",
      parse: (data) => z.object({ accessToken: z.string() }).parse(data),
      headers: {
        Cookie: `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(refreshToken)}`,
      },
      cache: "no-store",
    });

    const refreshCookie = getRefreshCookie(response.headers);
    const accessTokenExpiration = getAccessTokenExpiration(
      response.data.accessToken,
    );

    if (!refreshCookie || !accessTokenExpiration) {
      return null;
    }

    return {
      accessToken: response.data.accessToken,
      accessTokenExpiration,
      refreshCookie,
    };
  } catch {
    return null;
  }
}

function createRouteResponse(
  request: NextRequest,
  accessToken: string | null,
): NextResponse {
  const pathname = request.nextUrl.pathname;

  if (!accessToken && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL(routes.login, request.url));
  }

  if (accessToken && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL(routes.dashboard, request.url));
  }

  return NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;

  if (accessToken) {
    return createRouteResponse(request, accessToken);
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null;

  if (!refreshToken) {
    return createRouteResponse(request, null);
  }

  const refreshedSession = await refreshSession(
    refreshToken,
    getClientIp(request.headers),
  );

  if (!refreshedSession) {
    return createRouteResponse(request, null);
  }

  // Make the rotated session visible to Server Components
  // during the current request.
  request.cookies.set(ACCESS_TOKEN_COOKIE, refreshedSession.accessToken);

  request.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshedSession.refreshCookie.value,
  );

  const response = createRouteResponse(request, refreshedSession.accessToken);

  // Persist the rotated session in the browser.
  response.cookies.set(ACCESS_TOKEN_COOKIE, refreshedSession.accessToken, {
    ...sessionCookieOptions,
    expires: refreshedSession.accessTokenExpiration,
  });

  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshedSession.refreshCookie.value,
    {
      ...sessionCookieOptions,
      maxAge: refreshedSession.refreshCookie.maxAge,
    },
  );

  return response;
}
