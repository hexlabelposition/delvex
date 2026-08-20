import { EditShipmentPage } from "@pages/shipment-edit";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Edit shipment",
  description: "Update shipment addresses, cargo details, and schedule.",
  path: "/shipments",
});

interface PageProps {
  params: Promise<{ shipmentId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { shipmentId } = await params;

  return <EditShipmentPage shipmentId={shipmentId} />;
}
