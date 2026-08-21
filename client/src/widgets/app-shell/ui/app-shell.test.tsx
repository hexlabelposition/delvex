import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  logoutAction: vi.fn(),
  usePathname: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock("@features/auth", () => ({
  logoutAction: mocks.logoutAction,
  useSession: mocks.useSession,
}));
vi.mock("next/navigation", () => ({ usePathname: mocks.usePathname }));

import { AppShell } from "./app-shell";

describe("AppShell customer navigation", () => {
  beforeEach(() => {
    mocks.usePathname.mockReturnValue("/dashboard");
    mocks.useSession.mockReturnValue({
      user: {
        id: "customer-id",
        email: "customer@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        role: "CUSTOMER",
      },
    });
  });

  it("keeps customer navigation separate from operations", () => {
    render(<AppShell>content</AppShell>);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shipments" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create shipment" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Shipment queue" }),
    ).not.toBeInTheDocument();
  });
});
