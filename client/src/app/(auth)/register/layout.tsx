import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Delvex account to manage your shipments.",
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
