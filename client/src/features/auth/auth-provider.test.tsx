import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const replace = vi.fn();
  return {
    logoutAction: vi.fn(),
    refreshSessionAction: vi.fn(),
    replace,
    router: { replace },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
}));
vi.mock("@/features/auth/actions", () => ({
  logoutAction: mocks.logoutAction,
  refreshSessionAction: mocks.refreshSessionAction,
}));

import { AuthProvider, useAuth } from "@/features/auth/auth-provider";
import type { AuthSession } from "@/features/auth/types";

const customerSession: AuthSession = {
  accessToken: "customer-token",
  user: {
    id: "customer-id",
    email: "customer@example.com",
    firstName: "Customer",
    lastName: "User",
    role: "CUSTOMER",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-02T10:00:00Z",
  },
};

function SessionProbe() {
  const { isLoading, logout, session } = useAuth();
  return (
    <div>
      <span>
        {isLoading ? "loading" : (session?.user.role ?? "signed-out")}
      </span>
      <button onClick={() => void logout()}>Log out</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.refreshSessionAction.mockReset();
    mocks.logoutAction.mockReset();
    window.history.replaceState({}, "", "/dashboard");
  });

  it("restores a session and preserves the user role", async () => {
    mocks.refreshSessionAction.mockResolvedValue(customerSession);
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    expect(await screen.findByText("CUSTOMER")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("keeps the public landing page available to signed-in users", async () => {
    mocks.refreshSessionAction.mockResolvedValue(customerSession);
    window.history.replaceState({}, "", "/");
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    expect(await screen.findByText("CUSTOMER")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("redirects a signed-in customer away from auth pages", async () => {
    mocks.refreshSessionAction.mockResolvedValue(customerSession);
    window.history.replaceState({}, "", "/login");
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/dashboard"),
    );
  });

  it("redirects a signed-in employee away from auth pages", async () => {
    mocks.refreshSessionAction.mockResolvedValue({
      ...customerSession,
      user: { ...customerSession.user, role: "EMPLOYEE" },
    });
    window.history.replaceState({}, "", "/register");
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/employee"),
    );
  });

  it("redirects an employee away from customer actions", async () => {
    mocks.refreshSessionAction.mockResolvedValue({
      ...customerSession,
      user: { ...customerSession.user, role: "EMPLOYEE" },
    });
    window.history.replaceState({}, "", "/create");
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/employee"),
    );
  });

  it("redirects a customer away from the employee workspace", async () => {
    mocks.refreshSessionAction.mockResolvedValue(customerSession);
    window.history.replaceState({}, "", "/employee");
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/dashboard"),
    );
  });

  it("clears the session on logout", async () => {
    mocks.refreshSessionAction.mockResolvedValue(customerSession);
    mocks.logoutAction.mockResolvedValue(undefined);
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );
    await screen.findByText("CUSTOMER");
    await userEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(await screen.findByText("signed-out")).toBeInTheDocument();
    expect(mocks.logoutAction).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });
});
