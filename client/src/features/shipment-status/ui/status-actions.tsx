import type { ShipmentStatus } from "@shared/api";
import { Button } from "@shared/ui";

import { allowedNextStatuses, statusActionLabel } from "../model/status";

export function StatusActions({
  status,
  disabled,
  onSelect,
}: {
  status: ShipmentStatus;
  disabled?: boolean;
  onSelect: (status: ShipmentStatus) => void;
}) {
  return allowedNextStatuses(status).map((nextStatus) => (
    <Button
      key={nextStatus}
      size="sm"
      variant={nextStatus === "CANCELLED" ? "destructive" : "default"}
      disabled={disabled}
      onClick={() => onSelect(nextStatus)}
    >
      {statusActionLabel(nextStatus)}
    </Button>
  ));
}
