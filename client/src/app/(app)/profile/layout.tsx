import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and update your Delvex account details.",
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
