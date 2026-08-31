import { z } from "zod/v4";
import {
  EmailSchema,
  PasswordSchema,
  AccessTokenSchema,
  FirstNameSchema,
  LastNameSchema,
} from "@shared/model";

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  firstName: FirstNameSchema,
  lastName: LastNameSchema,
});

export type RegisterBody = z.infer<typeof RegisterSchema>;

export const RegisterResponseSchema = z.object({
  accessToken: AccessTokenSchema,
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
