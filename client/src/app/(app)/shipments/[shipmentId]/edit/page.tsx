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
import { useAuth } from "@/features/auth/auth-provider";
import { getShipment, updateShipment } from "@/features/shipments/api";
import {
  ShipmentFormFields,
  shipmentFormErrors,
  shipmentFormFields,
  shipmentFormSchema,
  shipmentToFormValues,
  type ShipmentFormField,
  type ShipmentFormValues,
} from "@/features/shipments/shipment-form";
import { ApiClientError } from "@/lib/api/client";
import type { Shipment } from "@/lib/api/types";

export default function EditShipmentPage() {
  const router = useRouter();
  const { session } = useAuth();
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [values, setValues] = useState<ShipmentFormValues | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<ShipmentFormField, string>>
  >({});
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
        setValues(shipmentToFormValues(response));
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
  const update = (field: ShipmentFormField, value: string) =>
    setValues((previous) => previous && { ...previous, [field]: value });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !shipment || !values) return;
    const nextErrors = shipmentFormErrors(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = shipmentFormSchema.parse(values);
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
