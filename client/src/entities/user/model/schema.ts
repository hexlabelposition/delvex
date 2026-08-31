import { z } from "zod/v4";
import {
  EmailSchema,
  FirstNameSchema,
  LastNameSchema,
  InstantSchema,
  IdSchema,
} from "@shared/model";

export const UserSchema = z.object({
  id: IdSchema,
  email: EmailSchema,
  firstName: FirstNameSchema,
  lastName: LastNameSchema,
  createdAt: InstantSchema,
  updatedAt: InstantSchema,
});

export type User = z.infer<typeof UserSchema>;
