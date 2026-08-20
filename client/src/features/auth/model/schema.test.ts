import { describe, expect, it } from "vitest";

import { forgotPasswordSchema, resetPasswordSchema } from "./schema";

describe("password recovery schemas", () => {
  it("accepts a valid password reset request", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "user@example.com" }).success,
    ).toBe(true);
  });

  it("requires matching reset passwords", () => {
    const result = resetPasswordSchema.safeParse({
      token: "reset-token",
      password: "new-password",
      confirmPassword: "different-password",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});
