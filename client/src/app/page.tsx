import { LandingPage } from "@pages/landing";
import { createPageMetadata } from "@shared/config";

export const metadata = createPageMetadata({
  title: "Shipment management made clear",
  description:
    "Create, track, and manage shipments from one focused logistics workspace.",
  path: "/",
});

export default function HomePage() {
  return <LandingPage />;
}
