import type { ShipmentStatus } from "@/lib/api/types";

export function formatDate(value: string | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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
