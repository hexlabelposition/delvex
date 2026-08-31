export function joinUrl(baseUrl: string, path: string): string {
  if (baseUrl.length === 0) {
    throw new TypeError("API base URL must not be empty");
  }

  if (!path.startsWith("/")) {
    throw new TypeError("API path must start with '/'");
  }

  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}
