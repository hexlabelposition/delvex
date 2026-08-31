"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import {
  fromDateValue,
  getEstimatedDelivery,
  toDateValue,
  toShipmentInstant,
} from "@entities/shipment";
import { createShipment, updateShipment } from "@entities/shipment/server";
import { ApiClientError } from "@shared/api";
import { routes } from "@shared/config";
import type { SubmissionResponse } from "@shared/model";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ShipmentFormSchema } from "../model/schema";

interface Schedule {
  pickupAt: string | null;
  deliveryAt: string | null;
}

/**
 * Delivery is never submitted by the visitor: it is the pickup date plus the
 * lead time in business days, and both instants are pinned to local midday.
 */
function resolveSchedule(pickupAt: string): Schedule {
  const pickup = fromDateValue(pickupAt);

  if (!pickup) {
    return { pickupAt: null, deliveryAt: null };
  }

  return {
    pickupAt: toShipmentInstant(pickupAt),
    deliveryAt: toShipmentInstant(toDateValue(getEstimatedDelivery(pickup))),
  };
}

export async function updateShipmentAction(
  shipmentId: string,
  _: unknown,
  formData: FormData,
): Promise<SubmissionResponse> {
  const submission = parseWithZod(formData, { schema: ShipmentFormSchema });

  if (submission.status !== "success") {
    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["Please correct the errors below and try again."],
        resetForm: false,
      }),
    };
  }

  const values = submission.value;
  const schedule = resolveSchedule(values.pickupAt);

  try {
    await updateShipment(shipmentId, {
      originLocationId: values.originLocationId,
      destinationLocationId: values.destinationLocationId,
      cargoDescription: values.cargoDescription,
      weightKg: values.weightKg,
      // The API reads a missing field as "keep the current value", so an empty
      // pickup leaves the stored schedule untouched.
      pickupAt: schedule.pickupAt ?? undefined,
      deliveryAt: schedule.deliveryAt ?? undefined,
    });
  } catch (error) {
    console.error("Shipment update failed:", error);

    const message =
      error instanceof ApiClientError &&
      (error.status === 409 || error.status === 400)
        ? "This shipment is already being processed and can no longer be edited."
        : "Unable to save this shipment. Please try again.";

    return {
      status: "error",
      submission: submission.reply({
        formErrors: [message],
        resetForm: false,
      }),
    };
  }

  revalidatePath(routes.shipments);
  revalidatePath(routes.shipmentDetails(shipmentId));
  redirect(routes.shipmentDetails(shipmentId));
}

export async function createShipmentAction(
  _: unknown,
  formData: FormData,
): Promise<SubmissionResponse> {
  const submission = parseWithZod(formData, { schema: ShipmentFormSchema });

  if (submission.status !== "success") {
    return {
      status: "error",
      submission: submission.reply({
        formErrors: ["Please correct the errors below and try again."],
        resetForm: false,
      }),
    };
  }

  const values = submission.value;
  const schedule = resolveSchedule(values.pickupAt);
  let shipmentId: string;

  try {
    const shipment = await createShipment({
      originLocationId: values.originLocationId,
      destinationLocationId: values.destinationLocationId,
      cargoDescription: values.cargoDescription,
      weightKg: values.weightKg,
      pickupAt: schedule.pickupAt,
      deliveryAt: schedule.deliveryAt,
    });

    shipmentId = shipment.id;
  } catch (error) {
    console.error("Shipment creation failed:", error);

    const message =
      error instanceof ApiClientError && error.status === 400
        ? "The shipment was rejected. Please check the route and the schedule."
        : "Unable to create this shipment. Please try again.";

    return {
      status: "error",
      submission: submission.reply({ formErrors: [message], resetForm: false }),
    };
  }

  revalidatePath(routes.shipments);
  redirect(routes.shipmentDetails(shipmentId));
}
