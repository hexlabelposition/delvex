import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Profile",
  description: "View and update your Delvex account details.",
  path: "/profile",
});

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
