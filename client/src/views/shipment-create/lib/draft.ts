import type { ShipmentFormValues } from "@features/shipment-form";

const DRAFT_KEY = "delvex:new-shipment-draft";

const DRAFT_FIELDS = [
  "originLocationId",
  "destinationLocationId",
  "cargoDescription",
  "weightKg",
  "pickupAt",
] as const satisfies readonly (keyof ShipmentFormValues)[];

/**
 * The draft is a convenience, never a source of truth: a private window, a full
 * quota, or a hand-edited entry all simply mean "there is no draft".
 */
export function readDraft(): ShipmentFormValues | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);

    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    const values = {} as ShipmentFormValues;
    let hasValue = false;

    for (const field of DRAFT_FIELDS) {
      const value = record[field];

      values[field] = typeof value === "string" ? value : "";

      if (values[field] !== "") {
        hasValue = true;
      }
    }

    return hasValue ? values : null;
  } catch {
    return null;
  }
}

export function writeDraft(values: ShipmentFormValues): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // Storage is unavailable or full; the form keeps working without a draft.
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clean up if storage cannot be reached.
  }
}
