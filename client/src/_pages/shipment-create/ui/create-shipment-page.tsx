"use client";

import {
  createShipmentAction,
  initialShipmentFormValues,
  shipmentFormErrors,
  type ShipmentFormField,
  ShipmentFormFields,
  shipmentFormSteps,
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";

export function CreatePage() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialShipmentFormValues);
  const [errors, setErrors] = useState<
    Partial<Record<ShipmentFormField, string>>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [pending, startTransition] = useTransition();
  const isLastStep = step === shipmentFormSteps.length - 1;

  const update = (field: ShipmentFormField, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  const next = () => {
    const nextErrors = shipmentFormErrors(
      values,
      shipmentFormSteps[step].fields,
    );
    setErrors(nextErrors);

    if (!Object.keys(nextErrors).length && !isLastStep) {
      setStep((value) => value + 1);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    // Never create from an intermediate step, even if a browser submits the
    // form after pressing Enter in one of its fields.
    if (!isLastStep) {
      next();
      return;
    }

    const nextErrors = shipmentFormErrors(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitError("");
    startTransition(async () => {
      const result = await createShipmentAction(values);
      setErrors(result.fieldErrors);
      setSubmitError(result.message);
    });
  };

  const current = shipmentFormSteps[step];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Create shipment</h1>
      <p className="text-muted-foreground mt-2">
        The reference number and status are assigned automatically. Logistics
        updates the status after creation.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {shipmentFormSteps.map((item, index) => (
          <div
            key={item.title}
            className={`rounded-lg border px-3 py-2 text-sm ${
              index === step ? "bg-muted font-medium" : "text-muted-foreground"
            }`}
          >
            <span className="bg-foreground text-background mr-2 inline-flex size-5 items-center justify-center rounded-full text-[11px]">
              {index + 1}
            </span>
            {item.title}
          </div>
        ))}
      </div>
      <form onSubmit={submit}>
        <Card className="mt-5 gap-0 py-0">
          <CardHeader className="px-5 pt-5">
            <CardTitle>{current.title}</CardTitle>
            <CardDescription>{current.hint}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
            <ShipmentFormFields
              fields={current.fields}
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
        <div className="mt-5 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            render={<Link href="/shipments" />}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((value) => value - 1)}
              >
                <ArrowLeft /> Back
              </Button>
            )}
            {!isLastStep ? (
              <Button type="button" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={pending}>
                {pending ? "Creating…" : "Create shipment"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
