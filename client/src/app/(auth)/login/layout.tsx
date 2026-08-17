import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Log in",
  description: "Log in to manage your Delvex shipments.",
  path: "/login",
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
