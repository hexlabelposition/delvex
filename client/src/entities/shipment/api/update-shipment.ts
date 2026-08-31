import "server-only";

import { createServerClient, getAccessToken } from "@shared/api/server";
import { IdSchema } from "@shared/model";
import { ShipmentSchema, type Shipment } from "../model/schema";

export interface UpdateShipmentData {
  originLocationId?: string;
  destinationLocationId?: string;
  cargoDescription?: string;
  weightKg?: number;
  pickupAt?: string;
  deliveryAt?: string;
}

export async function updateShipment(
  shipmentId: string,
  shipmentData: UpdateShipmentData,
): Promise<Shipment> {
  const id = IdSchema.parse(shipmentId);
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Access token is required to update a shipment.");
  }

  const api = createServerClient({
    accessToken,
  });

  const response = await api.patch<Shipment, UpdateShipmentData>({
    path: `/shipments/${id}`,
    body: shipmentData,
    parse: (data) => ShipmentSchema.parse(data),
  });

  return response.data;
}
