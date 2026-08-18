import type { ShipmentStatus } from "@/lib/api/types";

export function formatWeight(value: number) {
  return `${new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
  }).format(value)} kg`;
}

export function statusLabel(status: ShipmentStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}
