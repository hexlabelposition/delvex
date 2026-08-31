import { z } from "zod/v4";
import { EmailSchema, PasswordSchema, AccessTokenSchema } from "@shared/model";

export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export type LoginBody = z.infer<typeof LoginSchema>;

export const LoginResponseSchema = z.object({
  accessToken: AccessTokenSchema,
});
