import { apiClient } from "@/lib/api/client";
import type { UserResponse } from "@/lib/api/types";

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
