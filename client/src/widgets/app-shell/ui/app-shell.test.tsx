import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  logoutAction: vi.fn(),
  usePathname: vi.fn(),
  useSession: vi.fn(),
}));

// Role routing stays real; only the session and the server action are stubbed.
vi.mock("@features/auth", () => ({
  logoutAction: mocks.logoutAction,
  useSession: mocks.useSession,
}));
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
    mocks.useSession.mockReturnValue({
      user: { ...baseUser, role: "CUSTOMER" },
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
    mocks.useSession.mockReturnValue({
      user: { ...baseUser, role: "EMPLOYEE" },
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
