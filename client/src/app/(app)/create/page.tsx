import { CreatePage } from "@pages/shipment-create";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Create shipment",
  description: "Create a new shipment in Delvex.",
  path: "/create",
});

export default function Page() {
  return <CreatePage />;
}
