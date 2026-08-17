import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Create account",
  description: "Create a Delvex account to manage your shipments.",
  path: "/register",
});

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
