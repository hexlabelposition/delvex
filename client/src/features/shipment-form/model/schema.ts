import { z } from "zod/v4";
import {
  getLocationIdByCity,
  getShipmentWeightValue,
  SHIPMENT_WEIGHT_VALUES,
  shipmentLocationIds,
  toDateValue,
  type Shipment,
} from "@entities/shipment";

const LocationIdSchema = z.enum(shipmentLocationIds, {
  error: "Choose a Delvex point",
});

// A plain calendar date: times are not chosen in the UI, and an empty value
// means the shipment is not scheduled yet.
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const ShipmentFormSchema = z.object({
  originLocationId: LocationIdSchema,
  destinationLocationId: LocationIdSchema,
  cargoDescription: z
    .string({ error: "Describe the cargo" })
    .trim()
    .min(1, "Describe the cargo")
    .max(500, "Cargo description must contain at most 500 characters"),
  weightKg: z
    .enum(SHIPMENT_WEIGHT_VALUES, { error: "Choose a weight range" })
    .transform(Number),
  pickupAt: z
    .string()
    .trim()
    .refine((value) => value === "" || datePattern.test(value), "Pick a date"),
});

/** What the schema produces once the string form values are parsed. */
export type ShipmentFormPayload = z.output<typeof ShipmentFormSchema>;

/**
 * A form field always holds a string, even where the schema parses a number.
 * Delivery is absent on purpose: it is derived from the pickup date.
 */
export interface ShipmentFormValues {
  originLocationId: string;
  destinationLocationId: string;
  cargoDescription: string;
  weightKg: string;
  pickupAt: string;
}

export function shipmentToFormValues(shipment: Shipment): ShipmentFormValues {
  return {
    originLocationId: getLocationIdByCity(shipment.originCity),
    destinationLocationId: getLocationIdByCity(shipment.destinationCity),
    cargoDescription: shipment.cargoDescription,
    weightKg: getShipmentWeightValue(shipment.weightKg),
    pickupAt:
      shipment.pickupAt === null
        ? ""
        : toDateValue(new Date(shipment.pickupAt)),
  };
}
