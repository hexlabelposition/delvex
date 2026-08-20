"use server";

import type { Submission } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import type { AuthResponse } from "@shared/api";
import { apiClient, ApiClientError } from "@shared/api";
import { homeForRole } from "@shared/config";
import { redirect } from "next/navigation";

import { authFieldErrors } from "../lib/errors";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../model/schema";
import type {
  AuthFormState,
  ForgotPasswordFormState,
} from "../model/types";
import {
  asBackendCookie,
  clearSessionCookies,
  getRefreshToken,
  saveSessionCookies,
} from "./session";

function failedSubmission<Schema, FormValue>(
  submission: Submission<Schema, string[], FormValue>,
  error: unknown,
): AuthFormState {
  if (error instanceof ApiClientError) {
    const fieldErrors = authFieldErrors(error);

    return {
      submission: submission.reply({
        fieldErrors,
        formErrors: fieldErrors === undefined ? [error.message] : undefined,
      }),
    };
  }

  return {
    submission: submission.reply({
      formErrors: ["The server is unavailable. Please try again later."],
    }),
  };
}

async function authenticate(
  path: string,
  credentials: unknown,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(path, credentials);

  await saveSessionCookies(
    response.data.accessToken,
    response.headers.get("set-cookie"),
  );

  return response.data;
}

export async function loginAction(
  _previousState: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const submission = parseWithZod(formData, { schema: loginSchema });

  if (submission.status !== "success") {
    return { submission: submission.reply() };
  }

  let user: AuthResponse;

  try {
    user = await authenticate("/api/auth/login", submission.value);
  } catch (error) {
    return failedSubmission(submission, error);
  }

  // Outside the catch: `redirect` signals through an exception of its own.
  redirect(homeForRole(user.role));
}

export async function registerAction(
  _previousState: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const submission = parseWithZod(formData, { schema: registerSchema });

  if (submission.status !== "success") {
    return { submission: submission.reply() };
  }

  let user: AuthResponse;

  try {
    user = await authenticate("/api/auth/register", submission.value);
  } catch (error) {
    return failedSubmission(submission, error);
  }

  redirect(homeForRole(user.role));
}

export async function forgotPasswordAction(
  _previousState: ForgotPasswordFormState | null,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const submission = parseWithZod(formData, { schema: forgotPasswordSchema });

  if (submission.status !== "success") {
    return { submission: submission.reply() };
  }

  try {
    await apiClient.post<void>("/api/auth/forgot-password", submission.value);
  } catch (error) {
    return failedSubmission(submission, error);
  }

  return { submission: submission.reply({ resetForm: true }), success: true };
}

export async function resetPasswordAction(
  _previousState: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const submission = parseWithZod(formData, { schema: resetPasswordSchema });

  if (submission.status !== "success") {
    return { submission: submission.reply() };
  }

  try {
    await apiClient.post<void>("/api/auth/reset-password", {
      token: submission.value.token,
      password: submission.value.password,
    });
  } catch (error) {
    return failedSubmission(submission, error);
  }

  redirect("/login?passwordReset=success");
}

export async function logoutAction() {
  const refreshToken = await getRefreshToken();

  try {
    if (refreshToken !== undefined) {
      await apiClient.post<void>("/api/auth/logout", undefined, {
        headers: { Cookie: asBackendCookie(refreshToken) },
      });
    }
  } catch {
    // A failed revoke must not strand the user in a signed-in shell; the
    // session dies with the cookies either way.
  } finally {
    await clearSessionCookies();
  }

  redirect("/login");
}
