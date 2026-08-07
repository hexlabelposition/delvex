"use server";

import type { Submission } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";

import { loginSchema, registerSchema } from "@/features/auth/schema";
import {
  asBackendCookie,
  clearRefreshCookie,
  getRefreshToken,
  saveRefreshCookie,
} from "@/features/auth/session";
import type { AuthFormState, AuthSession } from "@/features/auth/types";
import { apiClient, ApiClientError } from "@/lib/api/client";
import type {
  AuthResponse,
  RefreshResponse,
  UserResponse,
} from "@/lib/api/types";

function failedSubmission<Schema, FormValue>(
  submission: Submission<Schema, string[], FormValue>,
  error: unknown,
): AuthFormState {
  if (error instanceof ApiClientError) {
    const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;
    const fieldErrors = Object.fromEntries(
      Object.entries(error.fieldErrors).map(([field, message]) => [
        field,
        [message],
      ]),
    );

    return {
      submission: submission.reply({
        fieldErrors: hasFieldErrors ? fieldErrors : undefined,
        formErrors: hasFieldErrors ? undefined : [error.message],
      }),
    };
  }

  return {
    submission: submission.reply({
      formErrors: ["The server is unavailable. Please try again later."],
    }),
  };
}

export async function loginAction(
  _previousState: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const submission = parseWithZod(formData, { schema: loginSchema });

  if (submission.status !== "success") {
    return { submission: submission.reply() };
  }

  try {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/login",
      submission.value,
    );

    await saveRefreshCookie(response.headers.get("set-cookie"));

    return {
      submission: submission.reply({ resetForm: true }),
      session: {
        accessToken: response.data.accessToken,
        user: response.data,
      },
    };
  } catch (error) {
    return failedSubmission(submission, error);
  }
}

export async function registerAction(
  _previousState: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const submission = parseWithZod(formData, { schema: registerSchema });

  if (submission.status !== "success") {
    return { submission: submission.reply() };
  }

  try {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/register",
      submission.value,
    );

    await saveRefreshCookie(response.headers.get("set-cookie"));

    return {
      submission: submission.reply({ resetForm: true }),
      session: {
        accessToken: response.data.accessToken,
        user: response.data,
      },
    };
  } catch (error) {
    return failedSubmission(submission, error);
  }
}

export async function refreshSessionAction(): Promise<AuthSession | null> {
  const refreshToken = await getRefreshToken();

  if (refreshToken === undefined) {
    return null;
  }

  try {
    const refreshResponse = await apiClient.post<RefreshResponse>(
      "/api/auth/refresh",
      undefined,
      { headers: { Cookie: asBackendCookie(refreshToken) } },
    );

    await saveRefreshCookie(refreshResponse.headers.get("set-cookie"));

    const userResponse = await apiClient.get<UserResponse>("/api/users/me", {
      accessToken: refreshResponse.data.accessToken,
    });

    return {
      accessToken: refreshResponse.data.accessToken,
      user: userResponse.data,
    };
  } catch {
    await clearRefreshCookie();
    return null;
  }
}

export async function logoutAction() {
  const refreshToken = await getRefreshToken();

  try {
    if (refreshToken !== undefined) {
      await apiClient.post<void>("/api/auth/logout", undefined, {
        headers: { Cookie: asBackendCookie(refreshToken) },
      });
    }
  } finally {
    await clearRefreshCookie();
  }
}
