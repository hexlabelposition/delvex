import type { UserRole } from "@shared/api";

interface AccessTokenClaims {
  role: UserRole;
  exp: number;
}

/**
 * Reads the claims of an access token *without verifying its signature*. The
 * API is the only authority on authorization; these claims exist so the proxy
 * can route and expire cookies without a round trip on every request.
 */
export function decodeAccessToken(token: string): AccessTokenClaims | null {
  const payload = token.split(".")[1];

  if (payload === undefined) {
    return null;
  }

  try {
    const claims = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as Partial<AccessTokenClaims>;

    if (typeof claims.exp !== "number" || claims.role === undefined) {
      return null;
    }

    return { role: claims.role, exp: claims.exp };
  } catch {
    return null;
  }
}
