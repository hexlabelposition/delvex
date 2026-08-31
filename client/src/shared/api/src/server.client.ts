import "server-only";

import { headers } from "next/headers";
import { ApiClient } from "./client";
import { joinUrl } from "./url";

interface CreateServerClientOptions {
  accessToken?: string;
  clientIp?: string;
}

const CLIENT_IP_HEADER = "X-Delvex-Client-IP";
const PROXY_SECRET_HEADER = "X-Delvex-Proxy-Secret";

export function getClientIp(
  requestHeaders: Pick<Headers, "get">,
): string | undefined {
  const clientIp = requestHeaders.get("x-real-ip")?.trim();

  if (!clientIp || clientIp.length > 64 || clientIp.includes(",")) {
    return undefined;
  }

  return clientIp;
}

export function createServerClient({
  accessToken,
  clientIp,
}: CreateServerClientOptions = {}) {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is required");
  }

  const defaultHeaders: Record<string, string> = {};

  if (accessToken !== undefined) {
    defaultHeaders.Authorization = `Bearer ${accessToken}`;
  }

  if (clientIp !== undefined) {
    const proxySecret = process.env.AUTH_RATE_LIMIT_PROXY_SECRET;

    if (!proxySecret || proxySecret.length < 32) {
      throw new Error(
        "AUTH_RATE_LIMIT_PROXY_SECRET must contain at least 32 characters",
      );
    }

    defaultHeaders[CLIENT_IP_HEADER] = clientIp;
    defaultHeaders[PROXY_SECRET_HEADER] = proxySecret;
  }

  return new ApiClient({
    baseUrl: joinUrl(apiUrl, "/api"),
    defaultHeaders:
      Object.keys(defaultHeaders).length === 0 ? undefined : defaultHeaders,
  });
}

export async function createRequestServerClient(
  options: Omit<CreateServerClientOptions, "clientIp"> = {},
) {
  const requestHeaders = await headers();

  return createServerClient({
    ...options,
    clientIp: getClientIp(requestHeaders),
  });
}
