import { Button } from "@/components/ui/button";
import {
  allowedNextStatuses,
  statusActionLabel,
} from "@/features/employee/status";
import type { ShipmentStatus } from "@/lib/api/types";

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
