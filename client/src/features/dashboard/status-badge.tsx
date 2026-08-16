import { statusLabel } from "@/features/dashboard/format";
import type { ShipmentStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const styles: Record<ShipmentStatus, string> = {
  CREATED: "bg-muted text-muted-foreground",
  IN_TRANSIT: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  DELIVERED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
        styles[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}
