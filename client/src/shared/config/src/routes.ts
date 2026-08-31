export const routes = {
  landing: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  profile: "/profile",
  shipments: "/shipments",
  createShipment: "/shipments/create",
  shipmentDetails: (id: string) => `/shipments/${id}`,
  editShipment: (id: string) => `/shipments/${id}/edit`,
} as const;

export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    routes.dashboard,
    routes.profile,
    routes.shipments,
    routes.createShipment,
  ];

  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export function isAuthRoute(pathname: string): boolean {
  const authRoutes = [
    routes.login,
    routes.register,
    routes.forgotPassword,
    routes.resetPassword,
  ];

  return authRoutes.some((route) => pathname.startsWith(route));
}
