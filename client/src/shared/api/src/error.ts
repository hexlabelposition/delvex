export class ApiClientError extends Error {
  public readonly status: number;
  public readonly details: unknown;
  public readonly headers: Headers;

  constructor(response: Response, details: unknown) {
    super(`API request failed with status ${response.status}`);

    this.name = "ApiClientError";
    this.status = response.status;
    this.details = details;
    this.headers = response.headers;
  }
}
