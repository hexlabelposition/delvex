"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

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
import { ApiClientError } from "@/lib/api/client";
import type { Shipment, UpdateShipmentPayload } from "@/lib/api/types";

type FormValues = Record<
  Exclude<keyof UpdateShipmentPayload, "status">,
  string
>;

const labels: Record<keyof FormValues, string> = {
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

const sections = [
  {
    title: "Origin",
    description: "The pickup address for this shipment.",
    fields: [
      "originCountry",
      "originCity",
      "originPostalCode",
      "originAddress",
    ] as const,
  },
  {
    title: "Destination",
    description: "The delivery address for this shipment.",
    fields: [
      "destinationCountry",
      "destinationCity",
      "destinationPostalCode",
      "destinationAddress",
    ] as const,
  },
  {
    title: "Cargo",
    description: "Describe the goods and give the total weight.",
    fields: ["cargoDescription", "weightKg"] as const,
  },
  {
    title: "Schedule",
    description: "Dates can be updated, but existing dates cannot be cleared.",
    fields: ["pickupAt", "deliveryAt"] as const,
  },
] satisfies readonly {
  title: string;
  description: string;
  fields: readonly (keyof FormValues)[];
}[];

function toDateTimeInput(value: string | null) {
  if (value === null) return "";
  const date = new Date(value);
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );
  return localDate.toISOString().slice(0, 16);
}

function shipmentValues(shipment: Shipment): FormValues {
  return {
    originCountry: shipment.originCountry,
    originCity: shipment.originCity,
    originPostalCode: shipment.originPostalCode,
    originAddress: shipment.originAddress,
    destinationCountry: shipment.destinationCountry,
    destinationCity: shipment.destinationCity,
    destinationPostalCode: shipment.destinationPostalCode,
    destinationAddress: shipment.destinationAddress,
    cargoDescription: shipment.cargoDescription,
    weightKg: String(shipment.weightKg),
    pickupAt: toDateTimeInput(shipment.pickupAt),
    deliveryAt: toDateTimeInput(shipment.deliveryAt),
  };
}

function validate(values: FormValues) {
  const errors: Record<string, string> = {};
  const requiredFields = [
    "originCountry",
    "originCity",
    "originPostalCode",
    "originAddress",
    "destinationCountry",
    "destinationCity",
    "destinationPostalCode",
    "destinationAddress",
    "cargoDescription",
  ] as const;

  for (const field of requiredFields) {
    if (values[field].trim() === "") errors[field] = "This field is required";
  }
  if (values.originCountry && !/^[a-z]{2}$/i.test(values.originCountry)) {
    errors.originCountry = "Use a two-letter country code";
  }
  if (
    values.destinationCountry &&
    !/^[a-z]{2}$/i.test(values.destinationCountry)
  ) {
    errors.destinationCountry = "Use a two-letter country code";
  }
  if (
    Number(values.weightKg) < 0.01 ||
    !Number.isFinite(Number(values.weightKg))
  ) {
    errors.weightKg = "Weight must be at least 0.01 kg";
  }
  if (
    values.pickupAt &&
    values.deliveryAt &&
    new Date(values.deliveryAt) < new Date(values.pickupAt)
  ) {
    errors.deliveryAt = "Delivery cannot be earlier than pickup";
  }
  return errors;
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
    if (session === null || shipmentId === undefined) return;

    let cancelled = false;
    void getShipment(shipmentId, session.accessToken)
      .then((response) => {
        if (cancelled) return;
        if (
          response.status === "DELIVERED" ||
          response.status === "CANCELLED"
        ) {
          router.replace(`/shipments/${response.id}`);
          return;
        }
        setShipment(response);
        setValues(shipmentValues(response));
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        setLoadingError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load shipment",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [router, session, shipmentId]);

  const update = (field: keyof FormValues, value: string) => {
    setValues((previous) =>
      previous === null ? previous : { ...previous, [field]: value },
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (session === null || shipment === null || values === null) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const updated = await updateShipment(
        shipment.id,
        {
          ...values,
          originCountry: values.originCountry.toUpperCase(),
          destinationCountry: values.destinationCountry.toUpperCase(),
          weightKg: Number(values.weightKg),
          pickupAt: values.pickupAt
            ? new Date(values.pickupAt).toISOString()
            : undefined,
          deliveryAt: values.deliveryAt
            ? new Date(values.deliveryAt).toISOString()
            : undefined,
        },
        { accessToken: session.accessToken },
      );
      router.push(`/shipments/${updated.id}`);
    } catch (requestError) {
      setErrors(
        requestError instanceof ApiClientError ? requestError.fieldErrors : {},
      );
      setSubmitError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update shipment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingError) {
    return (
      <div className="mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertDescription>{loadingError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (values === null) {
    return <p className="text-muted-foreground">Loading shipment…</p>;
  }

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
          Update the shipment details. Status changes are available on the
          details page.
        </p>
      </div>
      <form className="mt-6" onSubmit={(event) => void submit(event)}>
        <div className="grid gap-5">
          {sections.map((section) => (
            <Card key={section.title} className="gap-0 py-0">
              <CardHeader className="px-5 pt-5">
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div
                    key={field}
                    className={
                      field === "cargoDescription" ? "sm:col-span-2" : ""
                    }
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
          ))}
        </div>
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
