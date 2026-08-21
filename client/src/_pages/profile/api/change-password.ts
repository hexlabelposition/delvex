"use server";

import { changePassword } from "@entities/user";
import { requireSession } from "@features/auth/server";
import { ApiClientError } from "@shared/api";

export async function changePasswordAction(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  const { accessToken } = await requireSession();
  try {
    await changePassword(payload, accessToken);
    return { ok: true, message: "Password changed.", fieldErrors: {} as Record<string, string> };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not change password.",
      fieldErrors: error instanceof ApiClientError ? error.fieldErrors : {},
    };
  }
}
