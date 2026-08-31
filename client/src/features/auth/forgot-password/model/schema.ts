import { z } from "zod/v4";
import { EmailSchema } from "@shared/model";

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});
