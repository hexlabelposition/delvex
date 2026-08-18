import { LandingPage } from "@/features/landing/landing-page";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Shipment management made clear",
  description:
    "Create, track, and manage shipments from one focused logistics workspace.",
  path: "/",
});

export default function HomePage() {
  return <LandingPage />;
}
