import "server-only";

import { createServerClient, getAccessToken } from "@shared/api/server";
import { IdSchema } from "@shared/model";
import { ShipmentSchema, type Shipment } from "../model/schema";

export async function getShipmentById(shipmentId: string): Promise<Shipment> {
  const id = IdSchema.parse(shipmentId);
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Access token is required to get a shipment.");
  }

  const api = createServerClient({
    accessToken,
  });

  const response = await api.get<Shipment>({
    path: `/shipments/${id}`,
    parse: (data) => ShipmentSchema.parse(data),
    cache: "no-store",
  });

  return response.data;
}
