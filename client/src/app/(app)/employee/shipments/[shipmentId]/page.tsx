import { EmployeeShipmentPage } from "@pages/employee-shipment-details";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Employee shipment",
  description: "Review a shipment and update its logistics status.",
  path: "/employee",
});

export default function Page() {
  return <EmployeeShipmentPage />;
}
