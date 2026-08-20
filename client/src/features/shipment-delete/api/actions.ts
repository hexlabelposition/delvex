"use server";

import { deleteShipment } from "@entities/shipment";
import { requireSession } from "@features/auth/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface DeleteShipmentResult {
  message: string;
}

export async function deleteShipmentAction(
  shipmentId: string,
): Promise<DeleteShipmentResult> {
  const { accessToken } = await requireSession();

  try {
    await deleteShipment(shipmentId, { accessToken });
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Could not delete shipment",
    };
  }

  revalidatePath("/shipments");
  redirect("/shipments?deleted=1");
}
