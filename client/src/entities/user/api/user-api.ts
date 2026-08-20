import type { UserResponse } from "@shared/api";
import { apiClient } from "@shared/api";

export async function updateProfile(
  payload: Pick<UserResponse, "firstName" | "lastName">,
  accessToken: string,
) {
  const response = await apiClient.patch<UserResponse>(
    "/api/users/me",
    payload,
    { accessToken },
  );
  return response.data;
}
