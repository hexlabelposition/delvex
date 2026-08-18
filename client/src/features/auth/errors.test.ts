import { describe, expect, it } from "vitest";

import { authFieldErrors } from "@/features/auth/errors";
import { ApiClientError } from "@/lib/api/client";

function apiError(fieldErrors: Record<string, string>) {
  return new ApiClientError({
    timestamp: new Date(0).toISOString(),
    status: 400,
    error: "Bad Request",
    message: "Validation failed",
    path: "/api/auth/register",
    fieldErrors,
  });
}

describe("authFieldErrors", () => {
  it("converts server field errors to Conform arrays", () => {
    expect(authFieldErrors(apiError({ email: "Already registered" }))).toEqual({
      email: ["Already registered"],
    });
  });

  it("leaves non-field errors at form level", () => {
    expect(authFieldErrors(apiError({}))).toBeUndefined();
    expect(authFieldErrors(new Error("offline"))).toBeUndefined();
  });
});
