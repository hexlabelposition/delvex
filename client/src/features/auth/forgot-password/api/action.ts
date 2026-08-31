"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { ForgotPasswordSchema } from "../model/schema";
import { createServerClient } from "@shared/api/server";
import type { SubmissionResponse } from "@shared/model";

export async function forgotPasswordAction(
  _: unknown,
  formData: FormData,
): Promise<SubmissionResponse> {
  const submission = parseWithZod(formData, { schema: ForgotPasswordSchema });

  if (submission.status !== "success") {
    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["Please correct the errors in the form and try again."],
        resetForm: false,
      }),
    };
  }

  try {
    const client = createServerClient();

    await client.post({
      path: "/auth/forgot-password",
      parse: (data) => data,
      body: submission.value,
    });
  } catch {
    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["The server is unavailable. Please try again later."],
        resetForm: false,
      }),
    };
  }

  return {
    status: "success",
    submission: submission.reply({
      resetForm: true,
    }),
  };
}
