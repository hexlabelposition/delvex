import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  asBackendCookie: vi.fn(),
  clearRefreshCookie: vi.fn(),
  get: vi.fn(),
  getRefreshToken: vi.fn(),
  post: vi.fn(),
  saveRefreshCookie: vi.fn(),
}));

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();

  return {
    ...actual,
    apiClient: {
      get: mocks.get,
      post: mocks.post,
    },
  };
});

vi.mock("@/features/auth/session", () => ({
  asBackendCookie: mocks.asBackendCookie,
  clearRefreshCookie: mocks.clearRefreshCookie,
  getRefreshToken: mocks.getRefreshToken,
  saveRefreshCookie: mocks.saveRefreshCookie,
}));

import { loginAction, registerAction } from "@/features/auth/actions";
import type { AuthResponse, UserResponse } from "@/lib/api/types";

const accessToken = "access-token";
const setCookie = "refreshToken=refresh-token; Path=/; HttpOnly";
const authUser: AuthResponse = {
  accessToken,
  id: "user-id",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  role: "CUSTOMER",
};
const profile: UserResponse = {
  id: authUser.id,
  email: authUser.email,
  firstName: authUser.firstName,
  lastName: authUser.lastName,
  role: authUser.role,
  createdAt: "2026-08-01T10:00:00Z",
  updatedAt: "2026-08-02T10:00:00Z",
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
    mocks.get.mockResolvedValue(apiResponse(profile));
  });

  it("loads the complete user profile after login", async () => {
    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password");

    const result = await loginAction(null, formData);

    expect(mocks.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "user@example.com",
      password: "password",
    });
    expect(mocks.get).toHaveBeenCalledWith("/api/users/me", { accessToken });
    expect(mocks.saveRefreshCookie).toHaveBeenCalledWith(setCookie);
    expect(result.session).toEqual({ accessToken, user: profile });
  });

  it("loads the complete user profile after registration", async () => {
    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password");
    formData.set("firstName", "Test");
    formData.set("lastName", "User");

    const result = await registerAction(null, formData);

    expect(mocks.post).toHaveBeenCalledWith("/api/auth/register", {
      email: "user@example.com",
      password: "password",
      firstName: "Test",
      lastName: "User",
    });
    expect(mocks.get).toHaveBeenCalledWith("/api/users/me", { accessToken });
    expect(mocks.saveRefreshCookie).toHaveBeenCalledWith(setCookie);
    expect(result.session).toEqual({ accessToken, user: profile });
  });
});
