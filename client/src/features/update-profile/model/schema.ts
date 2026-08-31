import { z } from "zod/v4";
import { FirstNameSchema, LastNameSchema } from "@shared/model";

export const UpdateProfileSchema = z.object({
  firstName: FirstNameSchema,
  lastName: LastNameSchema,
});
