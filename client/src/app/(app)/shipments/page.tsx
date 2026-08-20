import { ShipmentsPage } from "@pages/shipments";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Shipments",
  description: "Browse and manage your Delvex shipments.",
  path: "/shipments",
});

export default function Page() {
  return <ShipmentsPage />;
}
