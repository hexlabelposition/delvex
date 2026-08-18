import type { ShipmentStatus } from "@/lib/api/types";

export function formatWeight(value: number) {
  return `${new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
  }).format(value)} kg`;
}

export function statusLabel(status: ShipmentStatus) {
  const [first, ...rest] = status.toLowerCase().split("_");
  return [`${first[0]?.toUpperCase()}${first.slice(1)}`, ...rest].join(" ");
}
