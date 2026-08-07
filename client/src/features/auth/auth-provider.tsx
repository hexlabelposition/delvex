"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { logoutAction, refreshSessionAction } from "@/features/auth/actions";
import type { AuthSession } from "@/features/auth/types";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void refreshSessionAction().then((refreshedSession) => {
      if (!active) {
        return;
      }

      setSessionState(refreshedSession);
      setIsLoading(false);

      if (
        refreshedSession === null &&
        window.location.pathname.startsWith("/dashboard")
      ) {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  const setSession = useCallback((newSession: AuthSession) => {
    setSessionState(newSession);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await logoutAction();
    setSessionState(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ session, isLoading, setSession, logout }),
    [isLoading, logout, session, setSession],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = use(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
