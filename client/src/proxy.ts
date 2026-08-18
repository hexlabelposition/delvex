import { type NextRequest, NextResponse } from "next/server";

import { REFRESH_COOKIE_NAME } from "@/features/auth/session";

const protectedRoutes = [
  "/dashboard",
  "/shipments",
  "/create",
  "/employee",
  "/profile",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE_NAME);

  if (
    protectedRoutes.some(
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
    "/dashboard/:path*",
    "/shipments/:path*",
    "/create/:path*",
    "/employee/:path*",
    "/profile/:path*",
  ],
};
