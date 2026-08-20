import type { ShipmentStatus } from "@shared/api";

const nextStatuses: Record<ShipmentStatus, readonly ShipmentStatus[]> = {
  CREATED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function allowedNextStatuses(status: ShipmentStatus) {
  return nextStatuses[status];
}

export function statusActionLabel(status: ShipmentStatus) {
  switch (status) {
    case "ACCEPTED":
      return "Accept shipment";
    case "IN_TRANSIT":
      return "Mark in transit";
    case "DELIVERED":
      return "Mark delivered";
    case "CANCELLED":
      return "Cancel shipment";
    case "CREATED":
      return "Mark created";
  }
}
