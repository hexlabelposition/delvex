export const REFRESH_COOKIE_NAME = "refresh_token";

// Mirrors the backend's `auth.access-token-ttl`, shortened so the proxy renews
// the token slightly before the API would start rejecting it.
export const ACCESS_COOKIE_NAME = "access_token";
export const ACCESS_TOKEN_LEEWAY_SECONDS = 30;
