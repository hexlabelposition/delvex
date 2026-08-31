/**
 * Shipments are booked by weight band rather than an exact figure. The API
 * stores a number, so each band travels as its upper bound; that keeps the
 * stored value meaningful and lets the UI map it back to the band it came from.
 */
export const SHIPMENT_WEIGHT_OPTIONS = [
  { value: "10", label: "Up to 10 kg" },
  { value: "20", label: "10–20 kg" },
  { value: "50", label: "20–50 kg" },
] as const;

export type ShipmentWeightValue =
  (typeof SHIPMENT_WEIGHT_OPTIONS)[number]["value"];

export const SHIPMENT_WEIGHT_VALUES = SHIPMENT_WEIGHT_OPTIONS.map(
  (option) => option.value,
) as unknown as [ShipmentWeightValue, ...ShipmentWeightValue[]];

/** The band a stored weight belongs to, for prefilling the form. */
export function getShipmentWeightValue(weightKg: number): string {
  const match = SHIPMENT_WEIGHT_OPTIONS.find(
    (option) => weightKg <= Number(option.value),
  );

  return match?.value ?? "";
}
