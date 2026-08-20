// @vitest-environment node

import type * as SharedApi from "@shared/api";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@shared/api", async (importOriginal) => {
  const actual = await importOriginal<typeof SharedApi>();

  return { ...actual, apiClient: { post: mocks.post } };
});

import { proxy } from "./proxy";

function accessToken(role: SharedApi.UserRole, secondsFromNow = 900) {
  const payload = Buffer.from(
    JSON.stringify({
      role,
      exp: Math.floor(Date.now() / 1000) + secondsFromNow,
    }),
  ).toString("base64url");

  return `header.${payload}.signature`;
}

function request(
  pathname: string,
  cookies: Record<string, string> = {},
): NextRequest {
  const nextRequest = new NextRequest(new URL(pathname, "https://delvex.test"));

  for (const [name, value] of Object.entries(cookies)) {
    nextRequest.cookies.set(name, value);
  }

  return nextRequest;
}

function location(response: Response) {
  const value = response.headers.get("location");

  return value === null ? null : new URL(value).pathname;
}

describe("proxy session routing", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("sends an anonymous visitor on a protected route to the login page", async () => {
    const response = await proxy(request("/dashboard"));

    expect(location(response)).toBe("/login");
  });

  it("leaves an anonymous visitor on the login page", async () => {
    const response = await proxy(request("/login"));

    expect(location(response)).toBeNull();
  });

  it("keeps a signed-in customer out of the employee workspace", async () => {
    const response = await proxy(
      request("/employee", {
        refresh_token: "refresh",
        access_token: accessToken("CUSTOMER"),
      }),
    );

    expect(location(response)).toBe("/dashboard");
  });

  it("redirects a signed-in employee away from the auth pages", async () => {
    const response = await proxy(
      request("/login", {
        refresh_token: "refresh",
        access_token: accessToken("EMPLOYEE"),
      }),
    );

    expect(location(response)).toBe("/employee");
  });

  it("lets a signed-in customer through to their own routes", async () => {
    const response = await proxy(
      request("/shipments", {
        refresh_token: "refresh",
        access_token: accessToken("CUSTOMER"),
      }),
    );

    expect(location(response)).toBeNull();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it("renews an expired access token and stores the rotated cookies", async () => {
    const renewed = accessToken("CUSTOMER");
    mocks.post.mockResolvedValue({
      data: { accessToken: renewed },
      headers: new Headers({
        "set-cookie":
          "refresh_token=rotated; Path=/; Max-Age=2592000; HttpOnly",
      }),
      status: 200,
    });

    const response = await proxy(
      request("/dashboard", { refresh_token: "refresh" }),
    );

    expect(mocks.post).toHaveBeenCalledWith("/api/auth/refresh", undefined, {
      headers: { Cookie: "refresh_token=refresh" },
    });
    expect(location(response)).toBeNull();
    expect(response.cookies.get("refresh_token")?.value).toBe("rotated");
    expect(response.cookies.get("access_token")?.value).toBe(renewed);
  });

  it("signs the visitor out when the refresh token is no longer valid", async () => {
    mocks.post.mockRejectedValue(new Error("invalid refresh token"));

    const response = await proxy(
      request("/dashboard", { refresh_token: "stale" }),
    );

    expect(location(response)).toBe("/login");
    expect(response.cookies.get("refresh_token")?.value).toBe("");
    expect(response.cookies.get("access_token")?.value).toBe("");
  });
});
