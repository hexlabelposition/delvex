import { apiClient } from "@/lib/api/client";
import type {
  CreateShipmentPayload,
  Shipment,
  ShipmentPage,
  UserResponse,
} from "@/lib/api/types";

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

export async function createShipment(
  payload: CreateShipmentPayload,
  { accessToken }: TokenOptions,
) {
  const response = await apiClient.post<Shipment>("/api/shipments", payload, {
    accessToken,
  });
  return response.data;
}

export async function updateProfile(
  payload: Pick<UserResponse, "firstName" | "lastName">,
  { accessToken }: TokenOptions,
) {
  const response = await apiClient.patch<UserResponse>(
    "/api/users/me",
    payload,
    {
      accessToken,
    },
  );
  return response.data;
}
