import type { ApiErrorBody } from "@/lib/api/types";

interface ApiRequestOptions extends RequestInit {
  accessToken?: string;
}

export interface ApiResponse<T> {
  data: T;
  headers: Headers;
  status: number;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(error: ApiErrorBody) {
    super(error.message);
    this.name = "ApiClientError";
    this.status = error.status;
    this.fieldErrors = error.fieldErrors;
  }
}

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  get<T>(path: string, options: ApiRequestOptions = {}) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options: ApiRequestOptions = {}) {
    return this.request<T>(path, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
      method: "POST",
    });
  }

  private async request<T>(path: string, options: ApiRequestOptions) {
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");

    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    if (options.accessToken !== undefined) {
      headers.set("Authorization", `Bearer ${options.accessToken}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      const fallback: ApiErrorBody = {
        timestamp: new Date().toISOString(),
        status: response.status,
        error: response.statusText,
        message: "The request could not be completed",
        path,
        fieldErrors: {},
      };
      const error = (await response
        .json()
        .catch(() => fallback)) as ApiErrorBody;

      throw new ApiClientError(error);
    }

    const data =
      response.status === 204
        ? (undefined as T)
        : ((await response.json()) as T);

    return { data, headers: response.headers, status: response.status };
  }
}

const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

if (apiUrl === undefined) {
  throw new Error("API_URL or NEXT_PUBLIC_API_URL is required");
}

export const apiClient = new ApiClient(apiUrl.replace(/\/$/, ""));
