import {
  locationSelectOptions,
  shipmentLocationIdSchema,
} from "@entities/shipment";
import type { Shipment } from "@shared/api";
import { z } from "zod";

export const shipmentFormSchema = z
  .object({
    originLocationId: shipmentLocationIdSchema,
    destinationLocationId: shipmentLocationIdSchema,
    cargoDescription: z
      .string()
      .trim()
      .min(1, "This field is required")
      .max(500),
    weightKg: z.coerce
      .number()
      .finite()
      .min(0.01, "Weight must be at least 0.01 kg")
      .multipleOf(0.01),
    pickupAt: z.string(),
    deliveryAt: z.string(),
  })
  .superRefine((value, context) => {
    if (
      value.pickupAt &&
      value.deliveryAt &&
      new Date(value.deliveryAt) < new Date(value.pickupAt)
    ) {
      context.addIssue({
        code: "custom",
        path: ["deliveryAt"],
        message: "Delivery cannot be earlier than pickup",
      });
    }
  });

export interface ShipmentFormValues {
  originLocationId: string;
  destinationLocationId: string;
  cargoDescription: string;
  weightKg: string;
  pickupAt: string;
  deliveryAt: string;
}

export type ShipmentFormField = keyof ShipmentFormValues;

export const initialShipmentFormValues: ShipmentFormValues = {
  originLocationId: "",
  destinationLocationId: "",
  cargoDescription: "",
  weightKg: "",
  pickupAt: "",
  deliveryAt: "",
};

export const shipmentFormFields: readonly ShipmentFormField[] = [
  "originLocationId",
  "destinationLocationId",
  "cargoDescription",
  "weightKg",
  "pickupAt",
  "deliveryAt",
];

export const shipmentFormSteps: readonly {
  title: string;
  hint: string;
  fields: readonly ShipmentFormField[];
}[] = [
  {
    title: "Origin",
    hint: "Choose the Delvex pickup point.",
    fields: ["originLocationId"],
  },
  {
    title: "Destination",
    hint: "Choose the Delvex delivery point.",
    fields: ["destinationLocationId"],
  },
  {
    title: "Cargo",
    hint: "Describe the goods and give the total weight.",
    fields: ["cargoDescription", "weightKg"],
  },
  {
    title: "Schedule",
    hint: "Both dates are optional and can be added later.",
    fields: ["pickupAt", "deliveryAt"],
  },
];

export const shipmentFormFieldLabels: Record<ShipmentFormField, string> = {
  originLocationId: "Pickup point",
  destinationLocationId: "Delivery point",
  cargoDescription: "Cargo description",
  weightKg: "Weight (kg)",
  pickupAt: "Pickup date and time",
  deliveryAt: "Delivery date and time",
};

export function shipmentFormErrors(
  values: ShipmentFormValues,
  fields?: readonly ShipmentFormField[],
) {
  const result = shipmentFormSchema.safeParse(values);
  if (result.success) return {} as Partial<Record<ShipmentFormField, string>>;

  return Object.fromEntries(
    result.error.issues
      .filter(
        (issue) =>
          !fields || fields.includes(issue.path[0] as ShipmentFormField),
      )
      .map((issue) => [issue.path[0] as ShipmentFormField, issue.message]),
  ) as Partial<Record<ShipmentFormField, string>>;
}

export function shipmentToFormValues(shipment: Shipment): ShipmentFormValues {
  return {
    originLocationId: locationId(shipment, "origin"),
    destinationLocationId: locationId(shipment, "destination"),
    cargoDescription: shipment.cargoDescription,
    weightKg: String(shipment.weightKg),
    pickupAt: toDateTimeInput(shipment.pickupAt),
    deliveryAt: toDateTimeInput(shipment.deliveryAt),
  };
}

function toDateTimeInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function locationId(shipment: Shipment, prefix: "origin" | "destination") {
  const city =
    prefix === "origin" ? shipment.originCity : shipment.destinationCity;
  return (
    locationSelectOptions.find((option) => option.label.includes(city))
      ?.value ?? ""
  );
}
