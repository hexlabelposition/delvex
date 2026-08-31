import { CheckIcon, CircleSlashIcon } from "lucide-react";
import {
  getShipmentStatusStep,
  SHIPMENT_STATUS_FLOW,
  shipmentStatusDescriptions,
  statusLabel,
  type ShipmentStatus,
} from "@entities/shipment";
import { cn } from "tailwind-variants";

interface ShipmentTimelineProps {
  status: ShipmentStatus;
}

export function ShipmentTimeline({ status }: ShipmentTimelineProps) {
  const currentStep = getShipmentStatusStep(status);

  if (currentStep === -1) {
    return (
      <div className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3 rounded-xl border px-4 py-3">
        <CircleSlashIcon
          className="mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-medium">Cancelled</p>
          <p className="text-destructive/80 mt-1 text-sm">
            The delivery flow stopped here, and nothing further is scheduled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className="flex flex-col sm:flex-row">
      {SHIPMENT_STATUS_FLOW.map((step, index) => {
        const done = index < currentStep;
        const current = index === currentStep;
        const last = index === SHIPMENT_STATUS_FLOW.length - 1;

        return (
          <li
            key={step}
            className="flex flex-1 gap-3 sm:flex-col sm:gap-2"
            aria-current={current ? "step" : undefined}
          >
            <div className="flex flex-col items-center sm:w-full sm:flex-row">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  done && "bg-primary border-primary text-primary-foreground",
                  current && "border-primary bg-background",
                  !done && !current && "border-border bg-background",
                )}
              >
                {done ? (
                  <CheckIcon className="size-3.5" aria-hidden="true" />
                ) : (
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      current ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </span>

              {!last && (
                <span
                  className={cn(
                    "w-0.5 flex-1 sm:h-0.5 sm:w-full sm:flex-1",
                    done ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>

            <div className={cn("pb-6 sm:pr-4 sm:pb-0", last && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  !done && !current && "text-muted-foreground",
                )}
              >
                {statusLabel(step)}
              </p>
              {current && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {shipmentStatusDescriptions[step]}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
