import type { ShipmentStatus } from "@shared/api";
import { Button } from "@shared/ui";

import { allowedNextStatuses, statusActionLabel } from "../model/status";

export function StatusActions({
  status,
  allowedStatuses,
  disabled,
  onSelect,
}: {
  status: ShipmentStatus;
  allowedStatuses?: readonly ShipmentStatus[];
  disabled?: boolean;
  onSelect: (status: ShipmentStatus) => void;
}) {
  const nextStatuses = allowedStatuses ?? allowedNextStatuses(status);

  return nextStatuses.map((nextStatus) => (
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
