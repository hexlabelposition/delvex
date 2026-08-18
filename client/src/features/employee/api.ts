import { apiClient } from "@/lib/api/client";
import type {
  EmployeeShipment,
  EmployeeShipmentPage,
  ShipmentStatus,
  ShipmentStatusEvent,
} from "@/lib/api/types";

interface EmployeeShipmentFilters {
  page?: number;
  size?: number;
  status?: ShipmentStatus;
  reference?: string;
}

export async function getEmployeeShipments(
  accessToken: string,
  { page = 0, size = 20, status, reference }: EmployeeShipmentFilters = {},
) {
  const search = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (status !== undefined) search.set("status", status);
  const normalizedReference = reference?.trim();
  if (normalizedReference) {
    search.set("reference", normalizedReference);
  }

  const response = await apiClient.get<EmployeeShipmentPage>(
    `/api/employee/shipments?${search.toString()}`,
    { accessToken },
  );
  return response.data;
}

export async function getEmployeeShipment(
  shipmentId: string,
  accessToken: string,
) {
  const response = await apiClient.get<EmployeeShipment>(
    `/api/employee/shipments/${shipmentId}`,
    { accessToken },
  );
  return response.data;
}

export async function getShipmentStatusEvents(
  shipmentId: string,
  accessToken: string,
) {
  const response = await apiClient.get<ShipmentStatusEvent[]>(
    `/api/employee/shipments/${shipmentId}/status-events`,
    { accessToken },
  );
  return response.data;
}

export async function updateEmployeeShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  version: number,
  accessToken: string,
) {
  const response = await apiClient.patch<EmployeeShipment>(
    `/api/employee/shipments/${shipmentId}/status`,
    { status, version },
    { accessToken },
  );
  return response.data;
}
