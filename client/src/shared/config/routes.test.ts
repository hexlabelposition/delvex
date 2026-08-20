import { describe, expect, it } from "vitest";

import { canAccessRoleRoute, homeForRole, isAuthRoute } from "./routes";

describe("role navigation", () => {
  it("selects a home route for each role", () => {
    expect(homeForRole("CUSTOMER")).toBe("/dashboard");
    expect(homeForRole("EMPLOYEE")).toBe("/employee");
  });

  it("keeps customers out of employee routes", () => {
    expect(canAccessRoleRoute("CUSTOMER", "/employee")).toBe(false);
    expect(canAccessRoleRoute("CUSTOMER", "/employee/shipments/id")).toBe(
      false,
    );
    expect(canAccessRoleRoute("CUSTOMER", "/shipments")).toBe(true);
  });

  it("keeps employees out of customer shipment actions", () => {
    expect(canAccessRoleRoute("EMPLOYEE", "/dashboard")).toBe(false);
    expect(canAccessRoleRoute("EMPLOYEE", "/create")).toBe(false);
    expect(canAccessRoleRoute("EMPLOYEE", "/shipments/id")).toBe(false);
    expect(canAccessRoleRoute("EMPLOYEE", "/profile")).toBe(true);
  });

  it("treats password recovery pages as authentication routes", () => {
    expect(isAuthRoute("/forgot-password")).toBe(true);
    expect(isAuthRoute("/reset-password")).toBe(true);
  });
});
