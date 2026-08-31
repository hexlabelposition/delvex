import { z } from "zod/v4";
import { IdSchema, InstantSchema } from "@shared/model";

export const ShipmentStatusSchema = z.enum([
  "CREATED",
  "ACCEPTED_AT_ORIGIN",
  "IN_TRANSIT",
  "ARRIVED_AT_DESTINATION",
  "DELIVERED",
  "CANCELLED",
]);

export const ShipmentSchema = z.object({
  id: IdSchema,
  referenceNumber: z.string(),
  status: ShipmentStatusSchema,
  originCountry: z.string(),
  originCity: z.string(),
  originPostalCode: z.string(),
  originAddress: z.string(),
  destinationCountry: z.string(),
  destinationCity: z.string(),
  destinationPostalCode: z.string(),
  destinationAddress: z.string(),
  cargoDescription: z.string(),
  weightKg: z.number().positive(),
  pickupAt: InstantSchema.nullable(),
  deliveryAt: InstantSchema.nullable(),
  version: z.number().int().nonnegative(),
  createdAt: InstantSchema,
  updatedAt: InstantSchema,
});

export const ShipmentPageSchema = z.object({
  content: z.array(ShipmentSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type ShipmentStatus = z.infer<typeof ShipmentStatusSchema>;
export type Shipment = z.infer<typeof ShipmentSchema>;
export type ShipmentPage = z.infer<typeof ShipmentPageSchema>;
