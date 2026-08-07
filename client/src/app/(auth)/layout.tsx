import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="bg-muted/40 flex min-h-svh items-center justify-center px-4 py-10">
      {children}
    </main>
  );
}
