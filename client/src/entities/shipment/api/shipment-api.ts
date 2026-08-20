import type {
  CreateShipmentPayload,
  Shipment,
  ShipmentPage,
  UpdateShipmentPayload,
} from "@shared/api";
import { apiClient } from "@shared/api";

interface TokenOptions {
  accessToken: string;
}

export async function getShipments(accessToken: string, page = 0, size = 10) {
  const response = await apiClient.get<ShipmentPage>(
    `/api/shipments?page=${page}&size=${size}`,
    { accessToken },
  );
  return response.data;
}

export async function getShipment(shipmentId: string, accessToken: string) {
  const response = await apiClient.get<Shipment>(
    `/api/shipments/${shipmentId}`,
    { accessToken },
  );
  return response.data;
}

export async function createShipment(
  payload: CreateShipmentPayload,
  { accessToken }: TokenOptions,
) {
  const response = await apiClient.post<Shipment>("/api/shipments", payload, {
    accessToken,
  });
  return response.data;
}

export async function updateShipment(
  shipmentId: string,
  payload: UpdateShipmentPayload,
  { accessToken }: TokenOptions,
) {
  const response = await apiClient.patch<Shipment>(
    `/api/shipments/${shipmentId}`,
    payload,
    { accessToken },
  );
  return response.data;
}

export async function deleteShipment(
  shipmentId: string,
  { accessToken }: TokenOptions,
) {
  await apiClient.delete<void>(`/api/shipments/${shipmentId}`, {
    accessToken,
  });
}
