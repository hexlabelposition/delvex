import { notFound } from "next/navigation";
import { findShipmentById } from "@entities/shipment/server";
import { routes } from "@shared/config";
import { createMetadata, type Params } from "@shared/lib";
import { ShipmentDetailsView } from "@views/shipment-details";

interface ShipmentDetailsPageProps {
  params: Promise<Params<{ shipmentId: string }>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: ShipmentDetailsPageProps) {
  const { shipmentId } = await params;

  return createMetadata({
    title: "Shipment details",
    description: "Review shipment details and update its delivery status.",
    path: routes.shipmentDetails(shipmentId),
  });
}

export default async function ShipmentDetailsPage({
  params,
  searchParams,
}: ShipmentDetailsPageProps) {
  const { shipmentId } = await params;
  const query = await searchParams;
  const paymentResult = Array.isArray(query.payment)
    ? query.payment[0]
    : query.payment;
  const shipment = await findShipmentById(shipmentId);

  if (!shipment) {
    notFound();
  }

  return (
    <ShipmentDetailsView shipment={shipment} paymentResult={paymentResult} />
  );
}
