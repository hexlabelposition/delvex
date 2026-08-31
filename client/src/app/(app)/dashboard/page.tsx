import { createMetadata } from "@shared/lib";
import { routes } from "@shared/config";
import { getCurrentUser } from "@entities/user/server";
import { UserEntity } from "@entities/user";
import { redirect } from "next/navigation";
import { DashboardView } from "@views/dashboard";
import { getAllShipments } from "@entities/shipment/server";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "View an overview of your recent Delvex shipments.",
  path: routes.dashboard,
});

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.login);
  }

  const userEntity = new UserEntity(user);

  const shipmentPage = await getAllShipments({ page: 0, size: 100 });

  return (
    <DashboardView
      user={userEntity}
      shipments={shipmentPage.content}
      totalShipments={shipmentPage.totalElements}
    />
  );
}
