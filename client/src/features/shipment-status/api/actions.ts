"use server";

import { updateEmployeeShipmentStatus } from "@entities/shipment";
import { requireSession } from "@features/auth/server";
import { isConflictError, type ShipmentStatus } from "@shared/api";
import { revalidatePath } from "next/cache";

export interface UpdateShipmentStatusResult {
  message: string;
}

export async function updateShipmentStatusAction(
  shipmentId: string,
  status: ShipmentStatus,
  version: number,
): Promise<UpdateShipmentStatusResult> {
  const { accessToken } = await requireSession();

  try {
    await updateEmployeeShipmentStatus(
      shipmentId,
      status,
      version,
      accessToken,
    );
  } catch (error) {
    return {
      message: isConflictError(error)
        ? "This shipment was updated by someone else. Reload it and try again."
        : error instanceof Error
          ? error.message
          : "Could not update shipment status",
    };
  }

  // The shipment and its audit trail are both rendered on the detail page.
  revalidatePath(`/employee/shipments/${shipmentId}`);
  revalidatePath("/employee");

  return { message: "" };
}
