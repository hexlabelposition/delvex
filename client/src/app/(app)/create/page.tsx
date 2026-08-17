"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { z } from "zod";

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
import {
  locationSelectOptions,
  shipmentLocationIdSchema,
} from "@/features/shipments/locations";
import { ApiClientError } from "@/lib/api/client";

const formSchema = z
  .object({
    originLocationId: shipmentLocationIdSchema,
    destinationLocationId: shipmentLocationIdSchema,
    cargoDescription: z
      .string()
      .trim()
      .min(1, "This field is required")
      .max(500),
    weightKg: z.coerce
      .number()
      .finite()
      .min(0.01, "Weight must be at least 0.01 kg")
      .multipleOf(0.01),
    pickupAt: z.string(),
    deliveryAt: z.string(),
  })
  .superRefine((value, context) => {
    if (
      value.pickupAt &&
      value.deliveryAt &&
      new Date(value.deliveryAt) < new Date(value.pickupAt)
    ) {
      context.addIssue({
        code: "custom",
        path: ["deliveryAt"],
        message: "Delivery cannot be earlier than pickup",
      });
    }
  });

interface FormValues {
  originLocationId: string;
  destinationLocationId: string;
  cargoDescription: string;
  weightKg: string;
  pickupAt: string;
  deliveryAt: string;
}
type Field = keyof FormValues;
const initialValues: FormValues = {
  originLocationId: "",
  destinationLocationId: "",
  cargoDescription: "",
  weightKg: "",
  pickupAt: "",
  deliveryAt: "",
};
const steps: { title: string; hint: string; fields: readonly Field[] }[] = [
  {
    title: "Origin",
    hint: "Choose the Delvex pickup point.",
    fields: ["originLocationId"],
  },
  {
    title: "Destination",
    hint: "Choose the Delvex delivery point.",
    fields: ["destinationLocationId"],
  },
  {
    title: "Cargo",
    hint: "Describe the goods and give the total weight.",
    fields: ["cargoDescription", "weightKg"],
  },
  {
    title: "Schedule",
    hint: "Both dates are optional and can be added later.",
    fields: ["pickupAt", "deliveryAt"],
  },
];

function errorsFor(values: FormValues, fields?: readonly Field[]) {
  const result = formSchema.safeParse(values);
  if (result.success) return {} as Record<string, string>;
  return Object.fromEntries(
    result.error.issues
      .filter((issue) => !fields || fields.includes(issue.path[0] as Field))
      .map((issue) => [String(issue.path[0]), issue.message]),
  );
}

export default function CreatePage() {
  const router = useRouter();
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const update = (field: Field, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));
  const next = () => {
    const nextErrors = errorsFor(values, steps[step].fields);
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) setStep((value) => value + 1);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = errorsFor(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || session === null) return;
    const payload = formSchema.parse(values);
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
  const current = steps[step];
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Create shipment</h1>
      <p className="text-muted-foreground mt-2">
        The reference number and status are assigned automatically. Logistics
        updates the status after creation.
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
            <CardTitle>{current.title}</CardTitle>
            <CardDescription>{current.hint}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
            {current.fields.map((field) => (
              <div
                key={field}
                className={field === "cargoDescription" ? "sm:col-span-2" : ""}
              >
                <Label htmlFor={field}>
                  {field === "originLocationId"
                    ? "Pickup point"
                    : field === "destinationLocationId"
                      ? "Delivery point"
                      : field === "cargoDescription"
                        ? "Cargo description"
                        : field === "weightKg"
                          ? "Weight (kg)"
                          : field === "pickupAt"
                            ? "Pickup date and time"
                            : "Delivery date and time"}
                </Label>
                {field.endsWith("LocationId") ? (
                  <select
                    id={field}
                    className="border-input mt-2 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm"
                    value={values[field]}
                    onChange={(event) => update(field, event.target.value)}
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
                    onChange={(event) => update(field, event.target.value)}
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
            {step < steps.length - 1 ? (
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
