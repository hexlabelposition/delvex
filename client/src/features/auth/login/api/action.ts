"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { ApiClientError } from "@shared/api";
import { redirect } from "next/navigation";
import { routes } from "@shared/config";
import { createRequestServerClient, createSession } from "@shared/api/server";
import { LoginResponseSchema, LoginSchema } from "../model/schema";
import type { SubmissionResponse } from "@shared/model";

export async function loginAction(
  _: unknown,
  formData: FormData,
): Promise<SubmissionResponse> {
  const submission = parseWithZod(formData, {
    schema: LoginSchema,
  });

  if (submission.status !== "success") {
    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["Please correct the errors below and try again."],
      }),
    };
  }

  try {
    const api = await createRequestServerClient();

    const response = await api.post({
      path: "/auth/login",
      body: submission.value,
      parse: (data) => LoginResponseSchema.parse(data),
    });

    await createSession({
      accessToken: response.data.accessToken,
      responseHeaders: response.headers,
    });
  } catch (error) {
    console.error("Login failed:", error);

    if (error instanceof ApiClientError && error.status === 401) {
      return {
        status: "error",
        submission: submission.reply({
          formErrors: ["Invalid email or password."],
        }),
      };
    }

    if (error instanceof ApiClientError && error.status === 429) {
      return {
        status: "error",
        submission: submission.reply({
          formErrors: ["Too many login attempts. Please try again later."],
        }),
      };
    }

    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["Unable to sign in. Please try again later."],
      }),
    };
  }

  redirect(routes.dashboard);
}
