"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { createRequestServerClient } from "@shared/api/server";
import { routes } from "@shared/config";
import { redirect } from "next/navigation";
import { ResetPasswordSchema } from "../model/schema";
import { ApiClientError } from "@shared/api";
import type { SubmissionResponse } from "@shared/model";

interface ResetPasswordPayload {
  token: string;
  password: string;
}

export async function resetPasswordAction(
  _: unknown,
  formData: FormData,
): Promise<SubmissionResponse> {
  const submission = parseWithZod(formData, {
    schema: ResetPasswordSchema,
  });

  if (submission.status !== "success") {
    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["Please fix the errors below and try again."],
        resetForm: false,
      }),
    };
  }

  const payload: ResetPasswordPayload = {
    token: submission.value.token,
    password: submission.value.newPassword,
  };

  try {
    const api = await createRequestServerClient();

    await api.post<void, ResetPasswordPayload>({
      path: "/auth/reset-password",
      parse: (data) => data,
      body: payload,
    });
  } catch (error) {
    console.error("Failed to reset password:", error);

    if (error instanceof ApiClientError && error.status === 400) {
      return {
        status: "error",
        submission: submission.reply({
          formErrors: ["This password reset link is invalid or has expired."],
          resetForm: false,
        }),
      };
    }

    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["The server is unavailable. Please try again later."],
        resetForm: false,
      }),
    };
  }

  redirect(routes.login);
}
