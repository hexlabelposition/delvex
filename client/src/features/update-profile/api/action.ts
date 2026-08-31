"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { updateUser } from "@entities/user/server";
import { ApiClientError } from "@shared/api";
import { routes } from "@shared/config";
import type { SubmissionResponse } from "@shared/model";
import { revalidatePath } from "next/cache";
import { UpdateProfileSchema } from "../model/schema";

export async function updateProfileAction(
  _: unknown,
  formData: FormData,
): Promise<SubmissionResponse> {
  const submission = parseWithZod(formData, { schema: UpdateProfileSchema });

  if (submission.status !== "success") {
    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["Please correct the errors below and try again."],
        resetForm: false,
      }),
    };
  }

  try {
    await updateUser(submission.value);
  } catch (error) {
    console.error("Profile update failed:", error);

    if (error instanceof ApiClientError && error.status === 401) {
      return {
        status: "error",
        submission: submission.reply({
          formErrors: ["Your session has expired. Please sign in again."],
          resetForm: false,
        }),
      };
    }

    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["Unable to update your profile. Please try again later."],
        resetForm: false,
      }),
    };
  }

  // The sidebar in the (app) layout also renders the user's name, so the
  // revalidation has to cover the layout, not just this page.
  revalidatePath(routes.profile, "layout");

  return {
    status: "success",
    submission: submission.reply({ resetForm: false }),
  };
}
