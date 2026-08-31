import { z } from "zod/v4";
import { PasswordSchema } from "@shared/model";

export const ResetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Password reset link is invalid")
      .max(512, "Password reset link is invalid"),
    newPassword: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      message: "Passwords must match",
      path: ["confirmPassword"],
    },
  );
