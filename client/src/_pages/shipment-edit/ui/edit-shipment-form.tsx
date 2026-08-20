"use client";

import {
  shipmentFormErrors,
  type ShipmentFormField,
  ShipmentFormFields,
  shipmentFormFields,
  type ShipmentFormValues,
  updateShipmentAction,
} from "@features/shipment-form";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/ui";
import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";

interface EditShipmentFormProps {
  shipmentId: string;
  initialValues: ShipmentFormValues;
}

export function EditShipmentForm({
  shipmentId,
  initialValues,
}: EditShipmentFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<ShipmentFormField, string>>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [pending, startTransition] = useTransition();

  const update = (field: ShipmentFormField, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = shipmentFormErrors(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitError("");
    startTransition(async () => {
      // A successful update redirects, so this only resolves on failure.
      const result = await updateShipmentAction(shipmentId, values);
      setErrors(result.fieldErrors);
      setSubmitError(result.message);
    });
  };

  return (
    <form className="mt-6" onSubmit={submit}>
      <Card className="gap-0 py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Shipment information</CardTitle>
          <CardDescription>
            Choose the route and provide cargo details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
          <ShipmentFormFields
            fields={shipmentFormFields}
            values={values}
            errors={errors}
            onChange={update}
          />
        </CardContent>
      </Card>
      {submitError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          render={<Link href={`/shipments/${shipmentId}`} />}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
