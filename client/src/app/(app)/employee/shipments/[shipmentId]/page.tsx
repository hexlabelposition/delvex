import { EmployeeShipmentPage } from "@pages/employee-shipment-details";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Employee shipment",
  description: "Review a shipment and update its logistics status.",
  path: "/employee",
});

interface PageProps {
  params: Promise<{ shipmentId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { shipmentId } = await params;

  return <EmployeeShipmentPage shipmentId={shipmentId} />;
}
