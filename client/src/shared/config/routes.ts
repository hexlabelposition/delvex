import type { UserRole } from "@shared/api";

const authRoutes = ["/login", "/register"];
const protectedRoutes = [
  "/dashboard",
  "/shipments",
  "/create",
  "/employee",
  "/profile",
];
const customerRoutes = ["/dashboard", "/shipments", "/create"];
const employeeRoutes = ["/employee"];

function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAuthRoute(pathname: string) {
  return matchesRoute(pathname, authRoutes);
}

export function isProtectedRoute(pathname: string) {
  return matchesRoute(pathname, protectedRoutes);
}

export function homeForRole(role: UserRole) {
  return role === "EMPLOYEE" ? "/employee" : "/dashboard";
}

export function canAccessRoleRoute(role: UserRole, pathname: string) {
  if (role === "EMPLOYEE") return !matchesRoute(pathname, customerRoutes);
  return !matchesRoute(pathname, employeeRoutes);
}
