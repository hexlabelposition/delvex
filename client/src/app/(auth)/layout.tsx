import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="bg-background flex min-h-svh items-center justify-center px-5 py-12">
      {children}
    </main>
  );
}
