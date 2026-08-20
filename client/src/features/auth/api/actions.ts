"use server";

import type { Submission } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import type { AuthResponse, RefreshResponse, UserResponse } from "@shared/api";
import { apiClient, ApiClientError } from "@shared/api";

import { authFieldErrors } from "../lib/errors";
import { loginSchema, registerSchema } from "../model/schema";
import type { AuthFormState, AuthSession } from "../model/types";
import {
  asBackendCookie,
  clearRefreshCookie,
  getRefreshToken,
  saveRefreshCookie,
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

async function loadSession(accessToken: string): Promise<AuthSession> {
  const userResponse = await apiClient.get<UserResponse>("/api/users/me", {
    accessToken,
  });

  return {
    accessToken,
    user: userResponse.data,
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
    const session = await loadSession(response.data.accessToken);

    await saveRefreshCookie(response.headers.get("set-cookie"));

    return {
      submission: submission.reply({ resetForm: true }),
      session,
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
    const session = await loadSession(response.data.accessToken);

    await saveRefreshCookie(response.headers.get("set-cookie"));

    return {
      submission: submission.reply({ resetForm: true }),
      session,
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

    return loadSession(refreshResponse.data.accessToken);
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
