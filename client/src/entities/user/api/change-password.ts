"use server";

import { createServerClient, getAccessToken } from "@shared/api/server";

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(
  passwords: ChangePasswordData,
): Promise<void> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Access token is required to change the password.");
  }

  const api = createServerClient({
    accessToken,
  });

  await api.patch<void, ChangePasswordData>({
    path: "/users/me/password",
    parse: () => undefined,
    body: passwords,
  });
}
