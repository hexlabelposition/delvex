"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
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
import { getShipment, updateShipment } from "@/features/dashboard/api";
import {
  locationSelectOptions,
  shipmentLocationIdSchema,
} from "@/features/shipments/locations";
import { ApiClientError } from "@/lib/api/client";
import type { Shipment } from "@/lib/api/types";

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
    )
      context.addIssue({
        code: "custom",
        path: ["deliveryAt"],
        message: "Delivery cannot be earlier than pickup",
      });
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

function toDateTimeInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}
function locationId(shipment: Shipment, prefix: "origin" | "destination") {
  const city =
    prefix === "origin" ? shipment.originCity : shipment.destinationCity;
  return (
    locationSelectOptions.find((option) => option.label.includes(city))
      ?.value ?? ""
  );
}
function errorsFor(values: FormValues) {
  const result = formSchema.safeParse(values);
  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      );
}

export default function EditShipmentPage() {
  const router = useRouter();
  const { session } = useAuth();
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [values, setValues] = useState<FormValues | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loadingError, setLoadingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!session || !shipmentId) return;
    let cancelled = false;
    void getShipment(shipmentId, session.accessToken)
      .then((response) => {
        if (cancelled) return;
        if (response.status !== "CREATED") {
          router.replace(`/shipments/${response.id}`);
          return;
        }
        setShipment(response);
        setValues({
          originLocationId: locationId(response, "origin"),
          destinationLocationId: locationId(response, "destination"),
          cargoDescription: response.cargoDescription,
          weightKg: String(response.weightKg),
          pickupAt: toDateTimeInput(response.pickupAt),
          deliveryAt: toDateTimeInput(response.deliveryAt),
        });
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setLoadingError(
            error instanceof Error ? error.message : "Could not load shipment",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [router, session, shipmentId]);
  const update = (field: Field, value: string) =>
    setValues((previous) => previous && { ...previous, [field]: value });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !shipment || !values) return;
    const nextErrors = errorsFor(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = formSchema.parse(values);
    setSubmitting(true);
    setSubmitError("");
    try {
      const updated = await updateShipment(
        shipment.id,
        {
          ...payload,
          cargoDescription: payload.cargoDescription.trim(),
          pickupAt: payload.pickupAt
            ? new Date(payload.pickupAt).toISOString()
            : undefined,
          deliveryAt: payload.deliveryAt
            ? new Date(payload.deliveryAt).toISOString()
            : undefined,
        },
        { accessToken: session.accessToken },
      );
      router.push(`/shipments/${updated.id}`);
    } catch (error) {
      setErrors(error instanceof ApiClientError ? error.fieldErrors : {});
      setSubmitError(
        error instanceof Error ? error.message : "Could not update shipment",
      );
    } finally {
      setSubmitting(false);
    }
  };
  if (loadingError)
    return (
      <div className="mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertDescription>{loadingError}</AlertDescription>
        </Alert>
      </div>
    );
  if (!values)
    return <p className="text-muted-foreground">Loading shipment…</p>;
  const fields: Field[] = [
    "originLocationId",
    "destinationLocationId",
    "cargoDescription",
    "weightKg",
    "pickupAt",
    "deliveryAt",
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        render={<Link href={`/shipments/${shipmentId}`} />}
      >
        <ArrowLeft /> Back to shipment
      </Button>
      <div className="mt-5">
        <h1 className="text-3xl font-semibold tracking-tight">Edit shipment</h1>
        <p className="text-muted-foreground mt-2">
          Shipment details can be edited until logistics starts processing it.
        </p>
      </div>
      <form className="mt-6" onSubmit={(event) => void submit(event)}>
        <Card className="gap-0 py-0">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Shipment information</CardTitle>
            <CardDescription>
              Choose the route and provide cargo details.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
            {fields.map((field) => (
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
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/shipments/${shipmentId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
