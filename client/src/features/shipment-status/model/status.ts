import type { ShipmentStatus } from "@shared/api";

const nextStatuses: Record<ShipmentStatus, readonly ShipmentStatus[]> = {
  CREATED: ["ACCEPTED_AT_ORIGIN", "CANCELLED"],
  ACCEPTED_AT_ORIGIN: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["ARRIVED_AT_DESTINATION"],
  ARRIVED_AT_DESTINATION: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function allowedNextStatuses(status: ShipmentStatus) {
  return nextStatuses[status];
}

export function statusActionLabel(status: ShipmentStatus) {
  switch (status) {
    case "ACCEPTED_AT_ORIGIN":
      return "Accept shipment";
    case "IN_TRANSIT":
      return "Mark in transit";
    case "ARRIVED_AT_DESTINATION":
      return "Receive at destination";
    case "DELIVERED":
      return "Mark delivered";
    case "CANCELLED":
      return "Cancel shipment";
    case "CREATED":
      return "Mark created";
  }
}
