"use client";

import { createContext, type ReactNode, use } from "react";

import type { AuthSession } from "./types";

const SessionContext = createContext<AuthSession | null>(null);

interface SessionProviderProps {
  session: AuthSession;
  children: ReactNode;
}

/**
 * Carries the session resolved on the server down to the client components that
 * need it. It never fetches and holds no state of its own: the server layout is
 * the single source of truth, and a changed session arrives through a re-render.
 */
export function SessionProvider({ session, children }: SessionProviderProps) {
  return <SessionContext value={session}>{children}</SessionContext>;
}

export function useSession() {
  const session = use(SessionContext);

  if (session === null) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return session;
}
