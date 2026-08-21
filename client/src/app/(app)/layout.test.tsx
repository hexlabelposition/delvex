import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(),
}));

vi.mock("@features/auth", () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@features/auth/server", () => ({
  requireSession: mocks.requireSession,
}));
vi.mock("@widgets/app-shell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="customer-shell">{children}</div>
  ),
}));
vi.mock("@widgets/employee-shell", () => ({
  EmployeeShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="employee-shell">{children}</div>
  ),
}));

import ApplicationLayout from "./layout";

const user = {
  id: "user-id",
  email: "user@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  createdAt: "2026-08-20T10:00:00Z",
  updatedAt: "2026-08-20T10:00:00Z",
};

describe("ApplicationLayout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the customer shell for a customer session", async () => {
    mocks.requireSession.mockResolvedValue({
      accessToken: "customer-token",
      user: { ...user, role: "CUSTOMER" },
    });

    render(await ApplicationLayout({ children: <p>customer page</p> }));

    expect(screen.getByTestId("customer-shell")).toHaveTextContent(
      "customer page",
    );
    expect(screen.queryByTestId("employee-shell")).not.toBeInTheDocument();
  });

  it("renders the employee shell for an employee session", async () => {
    mocks.requireSession.mockResolvedValue({
      accessToken: "employee-token",
      user: { ...user, role: "EMPLOYEE", branch: null },
    });

    render(await ApplicationLayout({ children: <p>employee page</p> }));

    expect(screen.getByTestId("employee-shell")).toHaveTextContent(
      "employee page",
    );
    expect(screen.queryByTestId("customer-shell")).not.toBeInTheDocument();
  });
});
