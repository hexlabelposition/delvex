import { Badge } from "@shared/ui";

import { statusLabel } from "../lib/format";
import type { ShipmentStatus } from "../model/schema";

const styles: Record<ShipmentStatus, string> = {
  CREATED: "bg-muted text-muted-foreground",
  ACCEPTED_AT_ORIGIN:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  IN_TRANSIT: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  ARRIVED_AT_DESTINATION:
    "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  DELIVERED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  return (
    <Badge variant="secondary" className={styles[status]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusLabel(status)}
    </Badge>
  );
}
