"use server";

import { cache } from "react";
import { createServerClient, getAccessToken } from "@shared/api/server";
import { UserSchema, type User } from "../model/schema";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const accessToken = await getAccessToken();

  if (accessToken === null) {
    return null;
  }

  const client = createServerClient({
    accessToken,
  });

  try {
    const response = await client.get<User>({
      path: "/users/me",
      parse: (data) => UserSchema.parse(data),
    });

    return response.data;
  } catch {
    return null;
  }
});
