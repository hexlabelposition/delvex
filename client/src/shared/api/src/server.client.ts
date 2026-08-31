import "server-only";

import { ApiClient } from "./client";
import { joinUrl } from "./url";

interface CreateServerClientOptions {
  accessToken?: string;
}

export function createServerClient({
  accessToken,
}: CreateServerClientOptions = {}) {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is required");
  }

  return new ApiClient({
    baseUrl: joinUrl(apiUrl, "/api"),
    defaultHeaders:
      accessToken === undefined
        ? undefined
        : {
            Authorization: `Bearer ${accessToken}`,
          },
  });
}
