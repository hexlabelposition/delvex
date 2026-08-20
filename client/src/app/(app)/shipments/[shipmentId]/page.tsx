import { ShipmentDetailsPage } from "@pages/shipment-details";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Shipment details",
  description: "Review shipment details and update its delivery status.",
  path: "/shipments",
});

export default function Page() {
  return <ShipmentDetailsPage />;
}
