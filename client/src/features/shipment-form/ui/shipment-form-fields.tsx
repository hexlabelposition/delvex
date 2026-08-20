import { locationSelectOptions } from "@entities/shipment";
import { Input, Label } from "@shared/ui";

import {
  type ShipmentFormField,
  shipmentFormFieldLabels,
  type ShipmentFormValues,
} from "../model/shipment-form";

export function ShipmentFormFields({
  fields,
  values,
  errors,
  onChange,
}: {
  fields: readonly ShipmentFormField[];
  values: ShipmentFormValues;
  errors: Partial<Record<ShipmentFormField, string>>;
  onChange: (field: ShipmentFormField, value: string) => void;
}) {
  return fields.map((field) => (
    <div
      key={field}
      className={field === "cargoDescription" ? "sm:col-span-2" : ""}
    >
      <Label htmlFor={field}>{shipmentFormFieldLabels[field]}</Label>
      {field.endsWith("LocationId") ? (
        <select
          id={field}
          className="border-input mt-2 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm"
          value={values[field]}
          onChange={(event) => onChange(field, event.target.value)}
        >
          <option value="">Select a point</option>
          {locationSelectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field === "cargoDescription" ? (
        <textarea
          id={field}
          value={values[field]}
          maxLength={500}
          onChange={(event) => onChange(field, event.target.value)}
          className="border-input mt-2 min-h-24 w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
        />
      ) : (
        <Input
          id={field}
          className="mt-2"
          type={field === "weightKg" ? "number" : "datetime-local"}
          min={field === "weightKg" ? "0.01" : undefined}
          step={field === "weightKg" ? "0.01" : undefined}
          value={values[field]}
          onChange={(event) => onChange(field, event.target.value)}
        />
      )}
      {errors[field] && (
        <p className="text-destructive mt-1 text-xs">{errors[field]}</p>
      )}
    </div>
  ));
}
