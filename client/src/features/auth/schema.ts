import { z } from "zod";

const email = z
  .string({ error: "Email is required" })
  .min(5, "Email must contain between 5 and 254 characters")
  .max(254, "Email must contain between 5 and 254 characters")
  .email("Email must be valid")
  .trim();

const password = z
  .string({ error: "Password is required" })
  .min(8, "Password must contain between 8 and 72 characters")
  .max(72, "Password must contain between 8 and 72 characters");

const name = (label: "First" | "Last") =>
  z
    .string({ error: `${label} name is required` })
    .trim()
    .min(1, `${label} name is required`)
    .max(50, `${label} name must contain between 1 and 50 characters`);

export const loginSchema = z.object({ email, password });

export const registerSchema = z.object({
  email,
  password,
  firstName: name("First"),
  lastName: name("Last"),
});
