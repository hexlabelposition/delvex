import { apiClient } from "@shared/api";

export async function changePassword(
  payload: { currentPassword: string; newPassword: string },
  accessToken: string,
) {
  await apiClient.patch<void>("/api/users/me/password", payload, {
    accessToken,
  });
}
