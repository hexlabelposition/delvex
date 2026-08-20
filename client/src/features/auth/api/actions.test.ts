import type * as SharedApi from "@shared/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  asBackendCookie: vi.fn(),
  clearSessionCookies: vi.fn(),
  getRefreshToken: vi.fn(),
  post: vi.fn(),
  redirect: vi.fn(),
  saveSessionCookies: vi.fn(),
}));

vi.mock("@shared/api", async (importOriginal) => {
  const actual = await importOriginal<typeof SharedApi>();

  return { ...actual, apiClient: { post: mocks.post } };
});

vi.mock("./session", () => ({
  asBackendCookie: mocks.asBackendCookie,
  clearSessionCookies: mocks.clearSessionCookies,
  getRefreshToken: mocks.getRefreshToken,
  saveSessionCookies: mocks.saveSessionCookies,
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { loginAction, logoutAction, registerAction } from "./actions";

const accessToken = "access-token";
const setCookie = "refresh_token=refresh-token; Path=/; HttpOnly";
const authUser: SharedApi.AuthResponse = {
  accessToken,
  id: "user-id",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  role: "CUSTOMER",
};

function apiResponse<T>(data: T) {
  return {
    data,
    headers: new Headers({ "set-cookie": setCookie }),
    status: 200,
  };
}

describe("auth actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.post.mockResolvedValue(apiResponse(authUser));
  });

  it("stores the session cookies and redirects a customer after login", async () => {
    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password");

    await loginAction(null, formData);

    expect(mocks.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "user@example.com",
      password: "password",
    });
    expect(mocks.saveSessionCookies).toHaveBeenCalledWith(
      accessToken,
      setCookie,
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects an employee to their own workspace after login", async () => {
    mocks.post.mockResolvedValue(
      apiResponse({
        ...authUser,
        role: "EMPLOYEE" satisfies SharedApi.UserRole,
      }),
    );
    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password");

    await loginAction(null, formData);

    expect(mocks.redirect).toHaveBeenCalledWith("/employee");
  });

  it("stores the session cookies and redirects after registration", async () => {
    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password");
    formData.set("firstName", "Test");
    formData.set("lastName", "User");

    await registerAction(null, formData);

    expect(mocks.post).toHaveBeenCalledWith("/api/auth/register", {
      email: "user@example.com",
      password: "password",
      firstName: "Test",
      lastName: "User",
    });
    expect(mocks.saveSessionCookies).toHaveBeenCalledWith(
      accessToken,
      setCookie,
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("reports a failed login without touching the cookies", async () => {
    mocks.post.mockRejectedValue(
      new (await import("@shared/api")).ApiClientError({
        timestamp: "",
        status: 401,
        error: "Unauthorized",
        message: "Invalid email or password",
        path: "/api/auth/login",
        fieldErrors: {},
      }),
    );
    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password");

    const result = await loginAction(null, formData);

    expect(result.submission.error?.[""]).toEqual([
      "Invalid email or password",
    ]);
    expect(mocks.saveSessionCookies).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("clears the cookies even when revoking the refresh token fails", async () => {
    mocks.getRefreshToken.mockResolvedValue("refresh-token");
    mocks.post.mockRejectedValue(new Error("network"));

    await logoutAction();

    expect(mocks.clearSessionCookies).toHaveBeenCalledOnce();
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
