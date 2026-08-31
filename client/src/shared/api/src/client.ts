import { readBody } from "./body";
import { ApiClientError } from "./error";
import { joinUrl } from "./url";

interface ApiClientOptions {
  baseUrl: string;
  defaultHeaders?: HeadersInit;
  fetch?: typeof globalThis.fetch;
}

interface ApiRequestOptions<T> extends Omit<
  RequestInit,
  "method" | "body" | "headers"
> {
  headers?: HeadersInit;
  parse: (value: unknown) => T;
}

interface ApiResponse<T> {
  data: T;
  headers: Headers;
  status: number;
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface InternalRequestOptions<T> extends ApiRequestOptions<T> {
  method: HttpMethod;
  path: string;
  body?: unknown;
}

interface ApiGetOptions<T> extends ApiRequestOptions<T> {
  path: string;
}

interface ApiPostOptions<T, B = unknown> extends ApiRequestOptions<T> {
  path: string;
  body?: B;
}

interface ApiPatchOptions<T, B = unknown> extends ApiRequestOptions<T> {
  path: string;
  body?: B;
}

interface ApiDeleteOptions<T> extends ApiRequestOptions<T> {
  path: string;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: HeadersInit;
  private readonly fetchImplementation: typeof globalThis.fetch;

  constructor({
    baseUrl,
    defaultHeaders = {},
    fetch: fetchImplementation = globalThis.fetch,
  }: ApiClientOptions) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
    this.fetchImplementation = fetchImplementation;
  }

  public get<T>({ path, ...options }: ApiGetOptions<T>) {
    return this.request({
      method: "GET",
      path,
      ...options,
    });
  }

  public post<T, B = unknown>({
    path,
    body,
    ...options
  }: ApiPostOptions<T, B>) {
    return this.request<T>({
      method: "POST",
      path,
      body,
      ...options,
    });
  }

  public patch<T, B = unknown>({
    path,
    body,
    ...options
  }: ApiPatchOptions<T, B>) {
    return this.request<T>({
      method: "PATCH",
      path,
      body,
      ...options,
    });
  }

  public delete<T>({ path, ...options }: ApiDeleteOptions<T>) {
    return this.request<T>({
      method: "DELETE",
      path,
      ...options,
    });
  }

  private async request<T>({
    method,
    path,
    body,
    parse,
    headers: requestHeaders,
    ...requestInit
  }: InternalRequestOptions<T>): Promise<ApiResponse<T>> {
    if (!path.startsWith("/")) {
      throw new TypeError("API path must start with '/'");
    }

    const headers = new Headers(this.defaultHeaders);

    // Request-specific headers take precedence over client-wide defaults.
    new Headers(requestHeaders).forEach((value, key) => {
      headers.set(key, value);
    });

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    if (body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await this.fetchImplementation(
      joinUrl(this.baseUrl, path),
      {
        ...requestInit,
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );

    // Treat network data as unknown until the endpoint parser validates it.
    const rawData: unknown = await readBody(response);

    if (!response.ok) {
      throw new ApiClientError(response, rawData);
    }

    const data = parse(rawData);

    return {
      data,
      headers: response.headers,
      status: response.status,
    };
  }
}
