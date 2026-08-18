import { type NextRequest, NextResponse } from "next/server";

import { REFRESH_COOKIE_NAME } from "@/features/auth/session";

const authRoutes = new Set(["/login", "/register"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE_NAME);

  if (pathname === "/" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (authRoutes.has(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    ["/dashboard", "/shipments", "/create", "/profile"].some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ) &&
    !hasSession
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/shipments/:path*",
    "/create/:path*",
    "/profile/:path*",
  ],
};
