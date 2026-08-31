"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import {
  RegisterSchema,
  type RegisterBody,
  type RegisterResponse,
  RegisterResponseSchema,
} from "../model/schema";
import { routes } from "@shared/config";
import { redirect } from "next/navigation";
import {
  createServerClient,
  createSession,
  getRefreshToken,
  getRefreshCookie,
  revokeSession,
} from "@shared/api/server";
import { ApiClientError } from "@shared/api";
import type { SubmissionResponse } from "@shared/model";

export async function registerAction(
  _: unknown,
  formData: FormData,
): Promise<SubmissionResponse> {
  const submission = parseWithZod(formData, { schema: RegisterSchema });

  if (submission.status !== "success") {
    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["Please fix the errors below and try again."],
      }),
    };
  }

  try {
    const client = createServerClient();

    const response = await client.post<RegisterResponse, RegisterBody>({
      path: "/auth/register",
      parse: (data) => RegisterResponseSchema.parse(data),
      body: submission.value,
    });

    const refreshCookie = getRefreshCookie(response.headers);

    if (!refreshCookie) {
      throw new Error("Registration response did not include a refresh cookie");
    }

    const previousRefreshToken = await getRefreshToken();

    if (previousRefreshToken !== null) {
      try {
        await revokeSession(previousRefreshToken);
      } catch {
        // Registration succeeded. Failure to revoke an older
        // session should not prevent saving the new session.
      }
    }

    await createSession({
      accessToken: response.data.accessToken,
      responseHeaders: response.headers,
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Registration API error:", {
        status: error.status,
        details: error.details,
      });

      if (error.status === 409) {
        return {
          status: "error",
          submission: submission.reply({
            fieldErrors: {
              email: ["An account with this email already exists."],
            },
          }),
        };
      }
    }

    console.error("Registration session error:", error);

    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["The server is unavailable. Please try again later."],
      }),
    };
  }

  redirect(routes.dashboard);
}
