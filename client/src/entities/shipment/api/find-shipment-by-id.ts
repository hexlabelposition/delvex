import "server-only";

import { ApiClientError } from "@shared/api";
import { IdSchema } from "@shared/model";
import type { Shipment } from "../model/schema";
import { getShipmentById } from "./get-shipment-by-id";

/**
 * The nullable counterpart of `getShipmentById`: it answers null for anything a
 * visitor should simply see as missing — an id that is not a uuid, and a
 * shipment the API does not serve them (including one owned by somebody else).
 * Every other failure still throws.
 */
export async function findShipmentById(
  shipmentId: string,
): Promise<Shipment | null> {
  if (!IdSchema.safeParse(shipmentId).success) {
    return null;
  }

  try {
    return await getShipmentById(shipmentId);
  } catch (error) {
    if (
      error instanceof ApiClientError &&
      (error.status === 404 || error.status === 403)
    ) {
      return null;
    }

    throw error;
  }
}
