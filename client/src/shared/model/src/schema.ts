import { z } from "zod/v4";

export const IdSchema = z.uuid({ error: "Invalid id" });

export const EmailSchema = z
  .email({ error: "Email is required" })
  .trim()
  .min(5, "Email must contain between 5 and 254 characters")
  .max(254, "Email must contain between 5 and 254 characters");

export const PasswordSchema = z
  .string({ error: "Password is required" })
  .min(8, "Password must contain between 8 and 72 characters")
  .max(72, "Password must contain between 8 and 72 characters");

export const AccessTokenSchema = z
  .string({ error: "Access token is required" })
  .trim()
  .min(1, "Access token is required")
  .max(4096, "Access token is too long");

export const FirstNameSchema = z
  .string({ error: "First name is required" })
  .trim()
  .min(1, "First name is required")
  .max(50, "First name must contain between 1 and 50 characters");

export const LastNameSchema = z
  .string({ error: "Last name is required" })
  .trim()
  .min(1, "Last name is required")
  .max(50, "Last name must contain between 1 and 50 characters");

export const InstantSchema = z.string({ error: "Date is required" }).pipe(
  z.iso.datetime({
    offset: true,
    error: "Invalid date format",
  }),
);
