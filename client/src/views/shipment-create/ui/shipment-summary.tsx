import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  MapPinIcon,
  PackageIcon,
  ScaleIcon,
} from "lucide-react";
import {
  fromDateValue,
  getEstimatedDelivery,
  shipmentLocations,
  shipmentWeightLabel,
} from "@entities/shipment";
import type { ShipmentFormValues } from "@features/shipment-form";
import { Card } from "@shared/ui";
import { cn } from "tailwind-variants";

interface ShipmentSummaryProps {
  values: ShipmentFormValues;
}

const summaryDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export function ShipmentSummary({ values }: ShipmentSummaryProps) {
  const origin = findLocation(values.originLocationId);
  const destination = findLocation(values.destinationLocationId);
  const weight = parseWeight(values.weightKg);
  const pickup = fromDateValue(values.pickupAt);

  const checklist = [
    { label: "Route", done: Boolean(origin && destination) },
    {
      label: "Cargo",
      done: values.cargoDescription.trim() !== "" && weight !== null,
    },
    { label: "Schedule", done: pickup !== undefined, optional: true },
  ];

  return (
    <Card.Root className="gap-0 overflow-hidden py-0">
      <Card.Header className="bg-muted/40 border-b px-5 py-4">
        <Card.Title className="text-base">Summary</Card.Title>
        <Card.Description>
          The reference number and status are assigned on creation.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-5 px-5 py-5">
        <div className="flex flex-col gap-3">
          <SummaryPoint label="From" location={origin} />
          <ArrowRightIcon
            className="text-muted-foreground size-4 rotate-90"
            aria-hidden="true"
          />
          <SummaryPoint label="To" location={destination} />
        </div>

        <div className="flex flex-col gap-3 border-t pt-5">
          <SummaryLine
            Icon={PackageIcon}
            value={values.cargoDescription.trim()}
            placeholder="No cargo description yet"
            className="line-clamp-3"
          />
          <SummaryLine
            Icon={ScaleIcon}
            value={weight === null ? "" : shipmentWeightLabel(weight)}
            placeholder="No weight yet"
          />
          <SummaryLine
            Icon={CalendarIcon}
            value={formatSchedule(pickup)}
            placeholder="Not scheduled"
          />
        </div>

        <ul className="flex flex-col gap-2 border-t pt-5">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border",
                  item.done
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {item.done && (
                  <CheckIcon className="size-3" aria-hidden="true" />
                )}
              </span>
              <span className={item.done ? "" : "text-muted-foreground"}>
                {item.label}
              </span>
              {item.optional && (
                <span className="text-muted-foreground text-xs">optional</span>
              )}
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card.Root>
  );
}

type Location = (typeof shipmentLocations)[number];

function SummaryPoint({
  label,
  location,
}: {
  label: string;
  location: Location | undefined;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          location
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <MapPinIcon className="size-4" aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        {location ? (
          <>
            <p className="text-sm font-medium">{location.city}</p>
            <p className="text-muted-foreground truncate text-xs">
              {location.name}, {location.address}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Not chosen yet</p>
        )}
      </div>
    </div>
  );
}

function SummaryLine({
  Icon,
  value,
  placeholder,
  className,
}: {
  Icon: typeof PackageIcon;
  value: string;
  placeholder: string;
  className?: string;
}) {
  const empty = value === "";

  return (
    <p
      className={cn(
        "flex items-start gap-2 text-sm",
        empty && "text-muted-foreground",
      )}
    >
      <Icon
        className="text-muted-foreground mt-0.5 size-4 shrink-0"
        aria-hidden="true"
      />
      <span className={className}>{empty ? placeholder : value}</span>
    </p>
  );
}

function findLocation(id: string): Location | undefined {
  return shipmentLocations.find((location) => location.id === id);
}

function parseWeight(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const weight = Number(value);

  return Number.isFinite(weight) && weight > 0 ? weight : null;
}

/** Delivery is derived, so the summary shows the pair the API will receive. */
function formatSchedule(pickup: Date | undefined): string {
  if (!pickup) {
    return "";
  }

  return `${summaryDateFormatter.format(pickup)} → ${summaryDateFormatter.format(
    getEstimatedDelivery(pickup),
  )}`;
}
