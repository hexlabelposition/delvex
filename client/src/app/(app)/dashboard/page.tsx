import { DashboardPage } from "@pages/dashboard";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Dashboard",
  description: "View an overview of your recent Delvex shipments.",
  path: "/dashboard",
});

export default function Page() {
  return <DashboardPage />;
}
