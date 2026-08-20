import { EmployeePage } from "@pages/employee-shipments";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Employee operations",
  description: "Receive shipments and manage their logistics lifecycle.",
  path: "/employee",
});

export default function Page() {
  return <EmployeePage />;
}
