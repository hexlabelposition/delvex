import type * as AuthNavigation from "@features/auth/lib/navigation";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("@features/auth", async () => {
  // Only the session hook is stubbed; role routing stays real.
  const { homeForRole } = await vi.importActual<typeof AuthNavigation>(
    "@features/auth/lib/navigation",
  );

  return { homeForRole, useAuth: mocks.useAuth };
});
vi.mock("next/navigation", () => ({ usePathname: mocks.usePathname }));

import { AppShell } from "./app-shell";

const baseUser = {
  id: "user-id",
  email: "user@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
};

describe("AppShell role navigation", () => {
  beforeEach(() => {
    mocks.usePathname.mockReturnValue("/dashboard");
  });

  it("shows customer navigation only to customers", () => {
    mocks.useAuth.mockReturnValue({
      isLoading: false,
      logout: vi.fn(),
      session: {
        accessToken: "token",
        user: { ...baseUser, role: "CUSTOMER" },
      },
    });

    render(<AppShell>content</AppShell>);
    expect(screen.getByRole("link", { name: "Shipments" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create shipment" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Operations" }),
    ).not.toBeInTheDocument();
  });

  it("shows employee navigation only to employees", () => {
    mocks.useAuth.mockReturnValue({
      isLoading: false,
      logout: vi.fn(),
      session: {
        accessToken: "token",
        user: { ...baseUser, role: "EMPLOYEE" },
      },
    });

    render(<AppShell>content</AppShell>);
    expect(
      screen.getByRole("link", { name: "Operations" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Create shipment" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Employee")).toBeInTheDocument();
  });
});
