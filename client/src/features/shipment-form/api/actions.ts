"use server";

import { createShipment, updateShipment } from "@entities/shipment";
import { requireSession } from "@features/auth/server";
import { ApiClientError } from "@shared/api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  type ShipmentFormField,
  shipmentFormSchema,
  type ShipmentFormValues,
} from "../model/shipment-form";

export interface ShipmentFormResult {
  fieldErrors: Partial<Record<ShipmentFormField, string>>;
  message: string;
}

type FieldErrors = ShipmentFormResult["fieldErrors"];

/**
 * The browser validates the same schema for instant feedback, but the values
 * arrive here over the wire, so the server re-parses them before trusting them.
 */
function parseValues(values: ShipmentFormValues) {
  const result = shipmentFormSchema.safeParse(values);

  if (!result.success) {
    return {
      payload: null,
      fieldErrors: Object.fromEntries(
        result.error.issues.map((issue) => [
          issue.path[0] as ShipmentFormField,
          issue.message,
        ]),
      ) as FieldErrors,
    };
  }

  return { payload: result.data, fieldErrors: {} as FieldErrors };
}

function failure(error: unknown, fallback: string): ShipmentFormResult {
  return {
    fieldErrors: error instanceof ApiClientError ? error.fieldErrors : {},
    message: error instanceof Error ? error.message : fallback,
  };
}

function toIsoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export async function createShipmentAction(
  values: ShipmentFormValues,
): Promise<ShipmentFormResult> {
  const { accessToken } = await requireSession();
  const { payload, fieldErrors } = parseValues(values);

  if (payload === null) {
    return { fieldErrors, message: "" };
  }

  try {
    await createShipment(
      {
        ...payload,
        cargoDescription: payload.cargoDescription.trim(),
        pickupAt: toIsoOrNull(payload.pickupAt),
        deliveryAt: toIsoOrNull(payload.deliveryAt),
      },
      { accessToken },
    );
  } catch (error) {
    return failure(error, "Could not create shipment");
  }

  revalidatePath("/shipments");
  redirect("/shipments?created=1");
}

export async function updateShipmentAction(
  shipmentId: string,
  values: ShipmentFormValues,
): Promise<ShipmentFormResult> {
  const { accessToken } = await requireSession();
  const { payload, fieldErrors } = parseValues(values);

  if (payload === null) {
    return { fieldErrors, message: "" };
  }

  try {
    await updateShipment(
      shipmentId,
      {
        ...payload,
        cargoDescription: payload.cargoDescription.trim(),
        pickupAt: toIsoOrNull(payload.pickupAt) ?? undefined,
        deliveryAt: toIsoOrNull(payload.deliveryAt) ?? undefined,
      },
      { accessToken },
    );
  } catch (error) {
    return failure(error, "Could not update shipment");
  }

  revalidatePath(`/shipments/${shipmentId}`);
  revalidatePath("/shipments");
  redirect(`/shipments/${shipmentId}`);
}
