"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { changePassword } from "@entities/user/server";
import { ApiClientError } from "@shared/api";
import { clearSessionCookies } from "@shared/api/server";
import { routes } from "@shared/config";
import type { SubmissionResponse } from "@shared/model";
import { redirect } from "next/navigation";
import { ChangePasswordSchema } from "../model/schema";

export async function changePasswordAction(
  _: unknown,
  formData: FormData,
): Promise<SubmissionResponse> {
  const submission = parseWithZod(formData, { schema: ChangePasswordSchema });

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
    await changePassword({
      currentPassword: submission.value.currentPassword,
      newPassword: submission.value.newPassword,
    });
  } catch (error) {
    console.error("Password change failed:", error);

    if (error instanceof ApiClientError && error.status === 400) {
      return {
        status: "error",
        submission: submission.reply({
          fieldErrors: {
            currentPassword: ["Current password is incorrect."],
          },
          resetForm: false,
        }),
      };
    }

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
        formErrors: ["Unable to change your password. Please try again later."],
        resetForm: false,
      }),
    };
  }

  await clearSessionCookies();
  redirect(routes.login);
}
