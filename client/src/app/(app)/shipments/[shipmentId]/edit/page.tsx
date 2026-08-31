import { notFound } from "next/navigation";
import { findShipmentById } from "@entities/shipment/server";
import { routes } from "@shared/config";
import { createMetadata, type Params } from "@shared/lib";
import { ShipmentEditView } from "@views/shipment-edit";

interface ShipmentEditPageProps {
  params: Promise<Params<{ shipmentId: string }>>;
}

export async function generateMetadata({ params }: ShipmentEditPageProps) {
  const { shipmentId } = await params;

  return createMetadata({
    title: "Edit shipment",
    description: "Update shipment addresses, cargo details, and schedule.",
    path: routes.editShipment(shipmentId),
  });
}

export default async function ShipmentEditPage({
  params,
}: ShipmentEditPageProps) {
  const { shipmentId } = await params;
  const shipment = await findShipmentById(shipmentId);

  if (!shipment) {
    notFound();
  }

  return <ShipmentEditView shipment={shipment} />;
}
