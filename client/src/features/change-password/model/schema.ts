import { z } from "zod/v4";
import { PasswordSchema } from "@shared/model";

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "Current password is required" })
      .min(1, "Current password is required")
      .max(72, "Current password must not exceed 72 characters"),
    newPassword: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine(
    ({ currentPassword, newPassword }) => currentPassword !== newPassword,
    {
      message: "New password must be different from the current one",
      path: ["newPassword"],
    },
  )
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      message: "Passwords must match",
      path: ["confirmPassword"],
    },
  );
