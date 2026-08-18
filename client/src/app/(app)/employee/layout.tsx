import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Employee operations",
  description: "Receive shipments and manage their logistics lifecycle.",
  path: "/employee",
});

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return children;
}
