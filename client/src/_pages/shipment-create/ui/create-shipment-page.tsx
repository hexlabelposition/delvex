"use client";

import { createShipment } from "@entities/shipment";
import { useAuth } from "@features/auth";
import {
  initialShipmentFormValues,
  shipmentFormErrors,
  type ShipmentFormField,
  ShipmentFormFields,
  shipmentFormSchema,
  shipmentFormSteps,
} from "@features/shipment-form";
import { ApiClientError } from "@shared/api";
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
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function CreatePage() {
  const router = useRouter();
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialShipmentFormValues);
  const [errors, setErrors] = useState<
    Partial<Record<ShipmentFormField, string>>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const update = (field: ShipmentFormField, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));
  const next = () => {
    const nextErrors = shipmentFormErrors(
      values,
      shipmentFormSteps[step].fields,
    );
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) setStep((value) => value + 1);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = shipmentFormErrors(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || session === null) return;
    const payload = shipmentFormSchema.parse(values);
    setSubmitting(true);
    setSubmitError("");
    try {
      await createShipment(
        {
          ...payload,
          cargoDescription: payload.cargoDescription.trim(),
          pickupAt: payload.pickupAt
            ? new Date(payload.pickupAt).toISOString()
            : null,
          deliveryAt: payload.deliveryAt
            ? new Date(payload.deliveryAt).toISOString()
            : null,
        },
        { accessToken: session.accessToken },
      );
      router.push("/shipments?created=1");
    } catch (error) {
      if (error instanceof ApiClientError) setErrors(error.fieldErrors);
      setSubmitError(
        error instanceof Error ? error.message : "Could not create shipment",
      );
    } finally {
      setSubmitting(false);
    }
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
            className={`rounded-lg border px-3 py-2 text-sm ${index === step ? "bg-muted font-medium" : "text-muted-foreground"}`}
          >
            <span className="bg-foreground text-background mr-2 inline-flex size-5 items-center justify-center rounded-full text-[11px]">
              {index + 1}
            </span>
            {item.title}
          </div>
        ))}
      </div>
      <form onSubmit={(event) => void submit(event)}>
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
            onClick={() => router.push("/shipments")}
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
            {step < shipmentFormSteps.length - 1 ? (
              <Button type="button" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create shipment"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
