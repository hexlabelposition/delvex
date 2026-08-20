import { ShipmentDetailsPage } from "@pages/shipment-details";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Shipment details",
  description: "Review shipment details and update its delivery status.",
  path: "/shipments",
});

interface PageProps {
  params: Promise<{ shipmentId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { shipmentId } = await params;

  return <ShipmentDetailsPage shipmentId={shipmentId} />;
}
