"use server";

import { createPaymentCheckout } from "@entities/shipment/server";
import { routes } from "@shared/config";
import { redirect } from "next/navigation";

export async function startPaymentCheckoutAction(
  shipmentId: string,
): Promise<void> {
  let destination: string;

  try {
    destination = await createPaymentCheckout(shipmentId);
  } catch (error) {
    console.error("Payment checkout creation failed:", error);
    destination = `${routes.shipmentDetails(shipmentId)}?payment=unavailable`;
  }

  redirect(destination);
}
