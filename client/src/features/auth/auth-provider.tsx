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
import { canAccessRoleRoute, homeForRole } from "@/features/auth/navigation";
import type { AuthSession } from "@/features/auth/types";

const authRoutes = ["/login", "/register"];
const protectedRoutes = [
  "/dashboard",
  "/shipments",
  "/create",
  "/employee",
  "/profile",
];

function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

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

      const pathname = window.location.pathname;
      if (
        refreshedSession === null &&
        matchesRoute(pathname, protectedRoutes)
      ) {
        router.replace("/login");
      } else if (
        refreshedSession !== null &&
        matchesRoute(pathname, authRoutes)
      ) {
        router.replace(homeForRole(refreshedSession.user.role));
      } else if (
        refreshedSession !== null &&
        !canAccessRoleRoute(refreshedSession.user.role, pathname)
      ) {
        router.replace(homeForRole(refreshedSession.user.role));
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
