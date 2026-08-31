"use server";

import { createServerClient, getAccessToken } from "@shared/api/server";
import type { User } from "../model/schema";

export type UpdateUserData = Pick<User, "firstName" | "lastName">;

export async function updateUser(userData: UpdateUserData): Promise<User> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Access token is required to update user data.");
  }

  const api = createServerClient({
    accessToken,
  });

  const response = await api.patch<User, UpdateUserData>({
    path: "/users/me",
    parse: (data) => data as User,
    body: userData,
  });

  return response.data;
}
