import type { RefreshResponse } from "@shared/api";
import { apiClient } from "@shared/api";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_LEEWAY_SECONDS,
  canAccessRoleRoute,
  homeForRole,
  isAuthRoute,
  isProtectedRoute,
  REFRESH_COOKIE_NAME,
} from "@shared/config";
import { cookieHeader, decodeAccessToken, parseSetCookie } from "@shared/lib";
import { type NextRequest, NextResponse } from "next/server";

interface RenewedSession {
  accessToken: string;
  refreshToken: string;
  refreshMaxAge?: number;
  secure: boolean;
}

/**
 * The backend rotates the refresh token on every call and revokes the previous
 * one immediately, so whoever asks for a new access token must also be able to
 * persist the replacement. Server Components cannot write cookies, which leaves
 * the proxy as the one place that may renew a session for a page render.
 */
async function renewSession(refreshToken: string): Promise<RenewedSession> {
  const response = await apiClient.post<RefreshResponse>(
    "/api/auth/refresh",
    undefined,
    { headers: { Cookie: cookieHeader(REFRESH_COOKIE_NAME, refreshToken) } },
  );
  const refreshCookie = parseSetCookie(
    response.headers.get("set-cookie") ?? "",
    REFRESH_COOKIE_NAME,
  );

  if (refreshCookie === null) {
    throw new Error("Refresh response did not include a refresh cookie");
  }

  return {
    accessToken: response.data.accessToken,
    refreshToken: refreshCookie.value,
    refreshMaxAge: refreshCookie.maxAge,
    secure: refreshCookie.secure,
  };
}

function accessCookieMaxAge(accessToken: string) {
  const claims = decodeAccessToken(accessToken);

  if (claims === null) {
    return undefined;
  }

  return Math.max(
    0,
    claims.exp - Math.floor(Date.now() / 1000) - ACCESS_TOKEN_LEEWAY_SECONDS,
  );
}

function signedOut(request: NextRequest, pathname: string) {
  const response = isProtectedRoute(pathname)
    ? NextResponse.redirect(new URL("/login", request.url))
    : NextResponse.next();

  response.cookies.delete(REFRESH_COOKIE_NAME);
  response.cookies.delete(ACCESS_COOKIE_NAME);

  return response;
}

function routeForSession(
  request: NextRequest,
  pathname: string,
  accessToken: string,
) {
  const claims = decodeAccessToken(accessToken);

  if (claims === null) {
    return null;
  }

  if (isAuthRoute(pathname) || !canAccessRoleRoute(claims.role, pathname)) {
    return new URL(homeForRole(claims.role), request.url);
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (refreshToken === undefined) {
    return signedOut(request, pathname);
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (accessToken !== undefined) {
    const destination = routeForSession(request, pathname, accessToken);

    return destination === null
      ? NextResponse.next()
      : NextResponse.redirect(destination);
  }

  let renewed: RenewedSession;

  try {
    renewed = await renewSession(refreshToken);
  } catch {
    return signedOut(request, pathname);
  }

  const destination = routeForSession(request, pathname, renewed.accessToken);

  // The renewed cookies are written onto the request as well, so the render
  // this request triggers already sees the new access token.
  request.cookies.set(REFRESH_COOKIE_NAME, renewed.refreshToken);
  request.cookies.set(ACCESS_COOKIE_NAME, renewed.accessToken);

  const response =
    destination === null
      ? NextResponse.next({ request: { headers: request.headers } })
      : NextResponse.redirect(destination);

  response.cookies.set(REFRESH_COOKIE_NAME, renewed.refreshToken, {
    httpOnly: true,
    maxAge: renewed.refreshMaxAge,
    path: "/",
    sameSite: "lax",
    secure: renewed.secure,
  });
  response.cookies.set(ACCESS_COOKIE_NAME, renewed.accessToken, {
    httpOnly: true,
    maxAge: accessCookieMaxAge(renewed.accessToken),
    path: "/",
    sameSite: "lax",
    secure: renewed.secure,
  });

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/shipments/:path*",
    "/create/:path*",
    "/employee/:path*",
    "/profile/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
