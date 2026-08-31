import { SHIPMENT_WEIGHT_OPTIONS } from "../model/weight";
import type { ShipmentStatus } from "../model/schema";

const weightFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
});

const shipmentDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export function formatWeight(value: number) {
  return `${weightFormatter.format(value)} kg`;
}

/**
 * Weights are booked as bands, so a stored 10 means "up to 10 kg" rather than
 * exactly ten. Anything outside the bands (older shipments) keeps its figure.
 */
export function shipmentWeightLabel(weightKg: number) {
  const option = SHIPMENT_WEIGHT_OPTIONS.find(
    (item) => Number(item.value) === weightKg,
  );

  return option ? option.label : formatWeight(weightKg);
}

export function formatShipmentDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return shipmentDateFormatter.format(new Date(value));
}

export function statusLabel(status: ShipmentStatus) {
  const [first, ...rest] = status.toLowerCase().split("_");

  return [`${first[0]?.toUpperCase()}${first.slice(1)}`, ...rest].join(" ");
}
