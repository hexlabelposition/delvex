import type { ShipmentStatus } from "../model/schema";

/** The states a shipment moves through; CANCELLED sits outside the flow. */
export const SHIPMENT_STATUS_FLOW = [
  "CREATED",
  "ACCEPTED_AT_ORIGIN",
  "IN_TRANSIT",
  "ARRIVED_AT_DESTINATION",
  "DELIVERED",
] as const satisfies readonly ShipmentStatus[];

export const shipmentStatusDescriptions: Record<ShipmentStatus, string> = {
  CREATED: "Waiting to be handed over at the origin point.",
  ACCEPTED_AT_ORIGIN: "Accepted at the origin point and being prepared.",
  IN_TRANSIT: "On its way to the destination point.",
  ARRIVED_AT_DESTINATION: "At the destination point, ready for handover.",
  DELIVERED: "Handed over at the destination point.",
  CANCELLED: "This shipment was cancelled and is no longer moving.",
};

/** Index in `SHIPMENT_STATUS_FLOW`, or -1 for a cancelled shipment. */
export function getShipmentStatusStep(status: ShipmentStatus): number {
  return SHIPMENT_STATUS_FLOW.indexOf(
    status as (typeof SHIPMENT_STATUS_FLOW)[number],
  );
}

// Both mirror the server: Shipment.validateUpdate() and
// ShipmentStatus.canBeDeleted() only allow a shipment that has not moved yet.
export function isShipmentEditable(status: ShipmentStatus): boolean {
  return status === "CREATED";
}

export function isShipmentDeletable(status: ShipmentStatus): boolean {
  return status === "CREATED";
}
