import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to manage your Delvex shipments.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
