import "server-only";

import { createServerClient, getAccessToken } from "@shared/api/server";
import { ShipmentPageSchema, type ShipmentPage } from "../model/schema";

interface GetAllShipmentsOptions {
  page?: number;
  size?: number;
}

export async function getAllShipments({
  page = 0,
  size = 10,
}: GetAllShipmentsOptions = {}): Promise<ShipmentPage> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Access token is required to get shipments.");
  }

  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const api = createServerClient({
    accessToken,
  });

  const response = await api.get<ShipmentPage>({
    path: `/shipments?${searchParams.toString()}`,
    parse: (data) => ShipmentPageSchema.parse(data),
    cache: "no-store",
  });

  return response.data;
}
