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

import { EmployeeShell } from "./employee-shell";

const employee = {
  id: "employee-id",
  email: "operator@example.com",
  firstName: "Grace",
  lastName: "Hopper",
  role: "EMPLOYEE",
  branch: {
    id: "branch-id",
    code: "WARSAW",
    name: "Warsaw Central",
    country: "PL",
    city: "Warszawa",
    postalCode: "00-001",
    address: "Main 1",
  },
};

describe("EmployeeShell", () => {
  beforeEach(() => {
    mocks.usePathname.mockReturnValue("/employee");
  });

  it("shows the assigned branch and operations-only navigation", () => {
    mocks.useSession.mockReturnValue({ user: employee });

    render(<EmployeeShell>queue</EmployeeShell>);

    expect(screen.getByText("Warsaw Central")).toBeInTheDocument();
    expect(screen.getByText("WARSAW")).toBeInTheDocument();
    expect(screen.getByText(/Main 1, Warszawa/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Shipment queue" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Create shipment" }),
    ).not.toBeInTheDocument();
  });

  it("makes a missing assignment visible", () => {
    mocks.useSession.mockReturnValue({
      user: { ...employee, branch: null },
    });

    render(<EmployeeShell>queue</EmployeeShell>);

    expect(screen.getByText("Branch not assigned")).toBeInTheDocument();
    expect(screen.getByText("Contact an administrator")).toBeInTheDocument();
  });
});
