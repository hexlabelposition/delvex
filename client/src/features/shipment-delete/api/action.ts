"use server";

import { deleteShipmentById } from "@entities/shipment/server";
import { ApiClientError } from "@shared/api";
import { routes } from "@shared/config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface DeleteShipmentResult {
  message: string;
}

export async function deleteShipmentAction(
  shipmentId: string,
): Promise<DeleteShipmentResult> {
  try {
    await deleteShipmentById(shipmentId);
  } catch (error) {
    console.error("Shipment deletion failed:", error);

    if (error instanceof ApiClientError) {
      if (error.status === 409 || error.status === 400) {
        return {
          message:
            "This shipment is already being processed and can no longer be deleted.",
        };
      }

      if (error.status === 404) {
        return { message: "This shipment no longer exists." };
      }
    }

    return { message: "Unable to delete this shipment. Please try again." };
  }

  // Shipment reads are uncached, so this exists only to drop the client router
  // cache entry that would otherwise still list the deleted shipment.
  revalidatePath(routes.shipments);
  redirect(routes.shipments);
}
