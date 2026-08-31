"use client";

import {
  getTextareaProps,
  useInputControl,
  type FieldMetadata,
} from "@conform-to/react";
import { addDays, format, startOfToday } from "date-fns";
import {
  ArrowLeftRightIcon,
  CalendarIcon,
  MapPinIcon,
  TriangleAlertIcon,
  TruckIcon,
} from "lucide-react";
import {
  fromDateValue,
  getEstimatedDelivery,
  SHIPMENT_LEAD_TIME_BUSINESS_DAYS,
  SHIPMENT_WEIGHT_OPTIONS,
  shipmentLocations,
  toBusinessDay,
  toDateValue,
} from "@entities/shipment";
import { Button, Calendar, Field, Popover, Select, Textarea } from "@shared/ui";

import type { ShipmentFormValues } from "../model/schema";

type ShipmentField = FieldMetadata<string, ShipmentFormValues, string[]>;

type ShipmentFields = {
  [Key in keyof ShipmentFormValues]: ShipmentField;
};

interface SectionProps {
  fields: ShipmentFields;
}

/** Every field of the shipment form, in one column. */
export function ShipmentFormFields({ fields }: SectionProps) {
  return (
    <Field.Group className="gap-6">
      <ShipmentRouteFields fields={fields} />
      <ShipmentCargoFields fields={fields} />
      <ShipmentScheduleFields fields={fields} />
    </Field.Group>
  );
}

export function ShipmentRouteFields({ fields }: SectionProps) {
  // The controls live here rather than inside each field so that swapping can
  // write into both selects through the same mechanism that drives them.
  const originControl = useInputControl(fields.originLocationId);
  const destinationControl = useInputControl(fields.destinationLocationId);

  const origin = originControl.value ?? "";
  const destination = destinationControl.value ?? "";
  const samePoint = origin !== "" && origin === destination;

  function swap() {
    originControl.change(destination);
    destinationControl.change(origin);
  }

  return (
    <Field.Group className="gap-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end">
        <LocationField
          field={fields.originLocationId}
          control={originControl}
          label="Pickup point"
          description="Where Delvex collects the cargo."
        />

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={swap}
          aria-label="Swap pickup and delivery points"
          className="mb-6 hidden rounded-full md:inline-flex"
        >
          <ArrowLeftRightIcon aria-hidden="true" />
        </Button>

        <LocationField
          field={fields.destinationLocationId}
          control={destinationControl}
          label="Delivery point"
          description="Where the cargo is handed over."
        />
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={swap}
        className="w-full md:hidden"
      >
        <ArrowLeftRightIcon aria-hidden="true" /> Swap points
      </Button>

      {samePoint && (
        <p
          role="status"
          className="text-muted-foreground flex items-center gap-2 text-sm"
        >
          <TriangleAlertIcon
            className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          Pickup and delivery points are the same.
        </p>
      )}
    </Field.Group>
  );
}

export function ShipmentCargoFields({ fields }: SectionProps) {
  return (
    <Field.Group className="gap-5">
      <Field.Root data-invalid={Boolean(fields.cargoDescription.errors)}>
        <div className="flex items-center justify-between gap-3">
          <Field.Label htmlFor={fields.cargoDescription.id}>
            Cargo description
          </Field.Label>
          <Field.Error>{fields.cargoDescription.errors?.join(" ")}</Field.Error>
        </div>
        <Textarea
          {...getTextareaProps(fields.cargoDescription)}
          key={fields.cargoDescription.key}
          maxLength={500}
          aria-invalid={Boolean(fields.cargoDescription.errors)}
          className="min-h-24"
          placeholder="Two pallets of packaged books"
        />
        <Field.Description>Up to 500 characters.</Field.Description>
      </Field.Root>

      <WeightField field={fields.weightKg} />
    </Field.Group>
  );
}

export function ShipmentScheduleFields({
  fields,
  quickDates = false,
}: SectionProps & { quickDates?: boolean }) {
  const control = useInputControl(fields.pickupAt);
  const value = control.value ?? "";
  const pickup = fromDateValue(value);
  const delivery = pickup ? getEstimatedDelivery(pickup) : undefined;
  const invalid = Boolean(fields.pickupAt.errors);

  return (
    <Field.Group className="gap-4">
      <Field.Root data-invalid={invalid} className="md:max-w-80">
        <div className="flex items-center justify-between gap-3">
          <Field.Label htmlFor={fields.pickupAt.id}>Pickup date</Field.Label>
          <Field.Error>{fields.pickupAt.errors?.join(" ")}</Field.Error>
        </div>

        <Popover.Root>
          <Popover.Trigger
            render={
              <Button
                id={fields.pickupAt.id}
                type="button"
                variant="outline"
                aria-invalid={invalid}
                data-empty={!pickup}
                className="data-[empty=true]:text-muted-foreground h-9 w-full justify-start text-left font-normal"
              />
            }
          >
            <CalendarIcon aria-hidden="true" />
            {pickup ? format(pickup, "PPP") : "Pick a date"}
          </Popover.Trigger>

          <Popover.Content className="w-auto p-0">
            <Calendar
              mode="single"
              selected={pickup}
              defaultMonth={pickup}
              // Delvex does not collect on weekends, and a pickup in the past
              // would already be impossible to honour.
              disabled={[{ dayOfWeek: [0, 6] }, { before: startOfToday() }]}
              onSelect={(date: Date | undefined) => {
                control.change(date ? toDateValue(date) : "");
              }}
            />
          </Popover.Content>
        </Popover.Root>

        {quickDates && (
          <div className="flex flex-wrap gap-1.5">
            {quickDateOptions.map((option) => (
              <Button
                key={option.label}
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  control.change(
                    toDateValue(
                      toBusinessDay(addDays(startOfToday(), option.days)),
                    ),
                  );
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}

        <Field.Description>
          Delvex collects on business days only.
        </Field.Description>
      </Field.Root>

      <div className="bg-muted/50 flex items-start gap-3 rounded-lg border px-3.5 py-3">
        <span className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
          <TruckIcon className="size-4" aria-hidden="true" />
        </span>

        <div>
          <p className="text-sm font-medium">
            Estimated delivery
            {delivery ? ` · ${format(delivery, "PPP")}` : ""}
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {pickup
              ? `${SHIPMENT_LEAD_TIME_BUSINESS_DAYS} business days after pickup, weekends excluded.`
              : "Pick a pickup date and Delvex works out the delivery date."}
          </p>
        </div>
      </div>
    </Field.Group>
  );
}

function WeightField({ field }: { field: ShipmentField }) {
  const control = useInputControl(field);
  const value = control.value ?? "";
  const invalid = Boolean(field.errors);

  return (
    <Field.Root data-invalid={invalid} className="md:max-w-72">
      <div className="flex items-center justify-between gap-3">
        <Field.Label htmlFor={field.id}>Weight</Field.Label>
        <Field.Error>{field.errors?.join(" ")}</Field.Error>
      </div>

      <Select.Root
        value={value === "" ? null : value}
        onValueChange={(nextValue: string | null) => {
          control.change(nextValue ?? "");
        }}
        onOpenChange={(open: boolean) => {
          if (!open) {
            control.blur();
          }
        }}
      >
        <Select.Trigger id={field.id} aria-invalid={invalid} className="w-full">
          <Select.Value placeholder="Choose a weight range">
            {(selected: string | null) => (
              <span>
                {SHIPMENT_WEIGHT_OPTIONS.find(
                  (option) => option.value === selected,
                )?.label ?? "Choose a weight range"}
              </span>
            )}
          </Select.Value>
        </Select.Trigger>

        <Select.Content
          alignItemWithTrigger={false}
          className="w-(--anchor-width)"
        >
          <Select.Group>
            {SHIPMENT_WEIGHT_OPTIONS.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <Field.Description>Billed by range, not exact weight.</Field.Description>
    </Field.Root>
  );
}

interface LocationFieldProps {
  field: ShipmentField;
  // Base UI Select is not a native input, so conform drives a hidden field and
  // this control is the only way values reach it.
  control: ReturnType<typeof useInputControl<string>>;
  label: string;
  description: string;
}

function LocationField({
  field,
  control,
  label,
  description,
}: LocationFieldProps) {
  const value = control.value ?? "";
  const invalid = Boolean(field.errors);

  return (
    <Field.Root data-invalid={invalid}>
      <div className="flex items-center justify-between gap-3">
        <Field.Label htmlFor={field.id}>{label}</Field.Label>
        <Field.Error>{field.errors?.join(" ")}</Field.Error>
      </div>

      <Select.Root
        value={value === "" ? null : value}
        onValueChange={(nextValue: string | null) => {
          control.change(nextValue ?? "");
        }}
        onOpenChange={(open: boolean) => {
          if (!open) {
            control.blur();
          }
        }}
      >
        <Select.Trigger
          id={field.id}
          aria-invalid={invalid}
          className="h-auto w-full py-2"
        >
          <Select.Value placeholder="Choose a Delvex point">
            {(selected: string | null) => <LocationValue id={selected} />}
          </Select.Value>
        </Select.Trigger>

        <Select.Content
          alignItemWithTrigger={false}
          className="w-(--anchor-width)"
        >
          <Select.Group>
            {shipmentLocations.map((location) => (
              <Select.Item key={location.id} value={location.id}>
                <span className="flex min-w-0 flex-col text-left">
                  <span className="font-medium">
                    {location.name} · {location.city}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {location.address}, {location.postalCode}
                  </span>
                </span>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <Field.Description>{description}</Field.Description>
    </Field.Root>
  );
}

function LocationValue({ id }: { id: string | null }) {
  const location = shipmentLocations.find((item) => item.id === id);

  if (!location) {
    return "Choose a Delvex point";
  }

  return (
    <span className="flex min-w-0 items-center gap-2">
      <MapPinIcon className="text-primary size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">
        {location.name} · {location.city}
      </span>
    </span>
  );
}

const quickDateOptions = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "Next week", days: 7 },
];
