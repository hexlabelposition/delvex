import "server-only";

import { createServerClient, getAccessToken } from "@shared/api/server";
import { ShipmentSchema, type Shipment } from "../model/schema";

export interface CreateShipmentData {
  originLocationId: string;
  destinationLocationId: string;
  cargoDescription: string;
  weightKg: number;
  pickupAt: string | null;
  deliveryAt: string | null;
}

export async function createShipment(
  shipmentData: CreateShipmentData,
): Promise<Shipment> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Access token is required to create a shipment.");
  }

  const api = createServerClient({
    accessToken,
  });

  const response = await api.post<Shipment, CreateShipmentData>({
    path: "/shipments",
    body: shipmentData,
    parse: (data) => ShipmentSchema.parse(data),
  });

  return response.data;
}
