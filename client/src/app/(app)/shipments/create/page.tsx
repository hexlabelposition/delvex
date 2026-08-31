import { createMetadata } from "@shared/lib";
import { routes } from "@shared/config";
import { ShipmentCreateView } from "@views/shipment-create";

export const metadata = createMetadata({
  title: "Create shipment",
  description: "Create a new shipment in Delvex.",
  path: routes.createShipment,
});

export default function ShipmentCreatePage() {
  return <ShipmentCreateView />;
}
