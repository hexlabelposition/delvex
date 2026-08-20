import { EditShipmentPage } from "@pages/shipment-edit";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Edit shipment",
  description: "Update shipment addresses, cargo details, and schedule.",
  path: "/shipments",
});

export default function Page() {
  return <EditShipmentPage />;
}
