"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-provider";
import { createShipment } from "@/features/dashboard/api";
import { ApiClientError } from "@/lib/api/client";
import type { CreateShipmentPayload } from "@/lib/api/types";

type FormValues = Record<keyof CreateShipmentPayload, string>;
const initialValues: FormValues = {
  originCountry: "",
  originCity: "",
  originPostalCode: "",
  originAddress: "",
  destinationCountry: "",
  destinationCity: "",
  destinationPostalCode: "",
  destinationAddress: "",
  cargoDescription: "",
  weightKg: "",
  pickupAt: "",
  deliveryAt: "",
};
const steps = [
  {
    title: "Origin",
    hint: "The pickup address for this shipment.",
    fields: [
      "originCountry",
      "originCity",
      "originPostalCode",
      "originAddress",
    ] as const,
  },
  {
    title: "Destination",
    hint: "The delivery address for this shipment.",
    fields: [
      "destinationCountry",
      "destinationCity",
      "destinationPostalCode",
      "destinationAddress",
    ] as const,
  },
  {
    title: "Cargo",
    hint: "Describe the goods and give the total weight.",
    fields: ["cargoDescription", "weightKg"] as const,
  },
  {
    title: "Schedule",
    hint: "Both dates are optional and can be added later.",
    fields: ["pickupAt", "deliveryAt"] as const,
  },
];
const labels: Record<keyof CreateShipmentPayload, string> = {
  originCountry: "Country code",
  originCity: "City",
  originPostalCode: "Postal code",
  originAddress: "Address",
  destinationCountry: "Country code",
  destinationCity: "City",
  destinationPostalCode: "Postal code",
  destinationAddress: "Address",
  cargoDescription: "Cargo description",
  weightKg: "Weight (kg)",
  pickupAt: "Pickup date and time",
  deliveryAt: "Delivery date and time",
};

function validate(values: FormValues, step: number) {
  const errors: Record<string, string> = {};
  for (const field of steps[step].fields) {
    const value = values[field].trim();
    if (step < 3 && value === "") errors[field] = "This field is required";
  }
  if (step === 0) {
    if (values.originCountry && !/^[a-z]{2}$/i.test(values.originCountry))
      errors.originCountry = "Use a two-letter country code";
  }
  if (step === 1) {
    if (
      values.destinationCountry &&
      !/^[a-z]{2}$/i.test(values.destinationCountry)
    )
      errors.destinationCountry = "Use a two-letter country code";
  }
  if (
    step === 2 &&
    (Number(values.weightKg) < 0.01 ||
      !Number.isFinite(Number(values.weightKg)))
  )
    errors.weightKg = "Weight must be at least 0.01 kg";
  if (
    step === 3 &&
    values.pickupAt &&
    values.deliveryAt &&
    new Date(values.deliveryAt) < new Date(values.pickupAt)
  )
    errors.deliveryAt = "Delivery cannot be earlier than pickup";
  return errors;
}

export default function CreatePage() {
  const router = useRouter();
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const current = steps[step];
  const update = (field: keyof CreateShipmentPayload, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));
  const next = () => {
    const nextErrors = validate(values, step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStep((value) => value + 1);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values, 3);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || session === null) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await createShipment(
        {
          ...values,
          originCountry: values.originCountry.toUpperCase(),
          destinationCountry: values.destinationCountry.toUpperCase(),
          weightKg: Number(values.weightKg),
          pickupAt: values.pickupAt
            ? new Date(values.pickupAt).toISOString()
            : null,
          deliveryAt: values.deliveryAt
            ? new Date(values.deliveryAt).toISOString()
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
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Create shipment</h1>
      <p className="text-muted-foreground mt-2">
        The reference number and status are assigned automatically. New
        shipments start as Created.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {steps.map((item, index) => (
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
            <CardTitle>
              {current.title === "Origin"
                ? "Where does it start?"
                : current.title === "Destination"
                  ? "Where is it going?"
                  : current.title === "Cargo"
                    ? "What is being shipped?"
                    : "When should it move?"}
            </CardTitle>
            <CardDescription>{current.hint}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
            {current.fields.map((field) => (
              <div
                key={field}
                className={field === "cargoDescription" ? "sm:col-span-2" : ""}
              >
                <Label htmlFor={field}>{labels[field]}</Label>
                {field === "cargoDescription" ? (
                  <textarea
                    id={field}
                    value={values[field]}
                    maxLength={500}
                    onChange={(event) => update(field, event.target.value)}
                    className="border-input mt-2 min-h-24 w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
                  />
                ) : (
                  <Input
                    id={field}
                    className="mt-2"
                    type={
                      field === "weightKg"
                        ? "number"
                        : field === "pickupAt" || field === "deliveryAt"
                          ? "datetime-local"
                          : "text"
                    }
                    min={field === "weightKg" ? "0.01" : undefined}
                    step={field === "weightKg" ? "0.01" : undefined}
                    value={values[field]}
                    onChange={(event) => update(field, event.target.value)}
                  />
                )}
                {errors[field] && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}
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
            {step < 3 ? (
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
