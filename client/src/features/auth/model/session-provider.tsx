"use client";

import type { UserResponse } from "@shared/api";
import { createContext, type ReactNode, use, useMemo } from "react";

interface SessionContextValue {
  user: UserResponse;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  user: UserResponse;
  children: ReactNode;
}

/**
 * Carries the signed-in user resolved on the server down to the client
 * components that need it. It never fetches and holds no state of its own: the
 * server layout is the single source of truth, and a changed user arrives
 * through a re-render. The access token deliberately stays on the server.
 */
export function SessionProvider({ user, children }: SessionProviderProps) {
  const value = useMemo(() => ({ user }), [user]);

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession() {
  const session = use(SessionContext);

  if (session === null) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return session;
}
