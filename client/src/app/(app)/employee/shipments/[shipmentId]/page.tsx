"use client";

import { ArrowLeft, History, PackageOpen, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/features/auth/auth-provider";
import {
  getEmployeeShipment,
  getShipmentStatusEvents,
  updateEmployeeShipmentStatus,
} from "@/features/employee/api";
import {
  allowedNextStatuses,
  statusActionLabel,
} from "@/features/employee/status";
import { formatWeight, statusLabel } from "@/features/shipments/format";
import { StatusBadge } from "@/features/shipments/status-badge";
import { ApiClientError } from "@/lib/api/client";
import type {
  EmployeeShipment,
  ShipmentStatus,
  ShipmentStatusEvent,
} from "@/lib/api/types";
import { formatDate } from "@/lib/format";

async function loadEmployeeShipment(shipmentId: string, accessToken: string) {
  const [record, events] = await Promise.all([
    getEmployeeShipment(shipmentId, accessToken),
    getShipmentStatusEvents(shipmentId, accessToken),
  ]);
  return { events, record };
}

function AddressCard({
  title,
  country,
  city,
  postalCode,
  address,
}: {
  title: string;
  country: string;
  city: string;
  postalCode: string;
  address: string;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-5 pt-5">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="mt-1 text-lg">
          {city}, {country}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground px-5 pt-3 pb-5 text-sm">
        <p>{address}</p>
        <p className="mt-1">{postalCode}</p>
      </CardContent>
    </Card>
  );
}

function StatusHistory({ events }: { events: ShipmentStatusEvent[] }) {
  return (
    <Card className="mt-5 gap-0 py-0">
      <CardHeader className="px-5 pt-5">
        <CardDescription>Audit trail</CardDescription>
        <CardTitle className="mt-1 flex items-center gap-2 text-lg">
          <History className="size-4" /> Status history
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pt-3 pb-5">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No employee status changes have been recorded yet.
          </p>
        ) : (
          <ol className="divide-y">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {statusLabel(event.previousStatus)} →{" "}
                    {statusLabel(event.newStatus)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {event.changedByFirstName} {event.changedByLastName} ·{" "}
                    {event.changedByRole.toLowerCase()}
                  </p>
                </div>
                <time className="text-muted-foreground font-mono text-xs">
                  {formatDate(event.changedAt)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export default function EmployeeShipmentPage() {
  const { session } = useAuth();
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [record, setRecord] = useState<EmployeeShipment | null>(null);
  const [events, setEvents] = useState<ShipmentStatusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<
    "not-found" | "unavailable" | null
  >(null);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ShipmentStatus | null>(
    null,
  );

  useEffect(() => {
    if (session === null || shipmentId === undefined) return;
    let cancelled = false;
    void loadEmployeeShipment(shipmentId, session.accessToken)
      .then((response) => {
        if (cancelled) return;
        setRecord(response.record);
        setEvents(response.events);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiClientError && error.status === 404
            ? "not-found"
            : "unavailable",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, shipmentId]);

  const reloadShipment = () => {
    if (session === null || shipmentId === undefined) return;
    setLoading(true);
    setLoadError(null);
    setActionError("");
    void loadEmployeeShipment(shipmentId, session.accessToken)
      .then((response) => {
        setRecord(response.record);
        setEvents(response.events);
      })
      .catch((error: unknown) => {
        setLoadError(
          error instanceof ApiClientError && error.status === 404
            ? "not-found"
            : "unavailable",
        );
      })
      .finally(() => setLoading(false));
  };

  const confirmStatusUpdate = async () => {
    if (session === null || record === null || pendingStatus === null) return;
    setActionLoading(true);
    setActionError("");
    try {
      const updated = await updateEmployeeShipmentStatus(
        record.shipment.id,
        pendingStatus,
        record.shipment.version,
        session.accessToken,
      );
      setRecord(updated);
      setEvents(
        await getShipmentStatusEvents(record.shipment.id, session.accessToken),
      );
      setPendingStatus(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Could not update shipment status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const shipment = record?.shipment;
  const customer = record?.customer;
  const nextStatuses =
    shipment === undefined ? [] : allowedNextStatuses(shipment.status);

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" size="sm" render={<Link href="/employee" />}>
        <ArrowLeft /> Back to operations
      </Button>
      <div className="mt-5">
        {loadError === "not-found" ? (
          <EmptyState
            icon={PackageOpen}
            title="Shipment not found"
            description="This shipment no longer exists."
          />
        ) : loadError === "unavailable" ? (
          <EmptyState
            icon={PackageOpen}
            title="Couldn’t load shipment"
            description="The server is unavailable. Please try again in a moment."
            action={
              <Button variant="outline" onClick={reloadShipment}>
                <RefreshCw /> Try again
              </Button>
            }
          />
        ) : loading || shipment === undefined || customer === undefined ? (
          <p className="text-muted-foreground">Loading shipment…</p>
        ) : (
          <>
            {actionError && (
              <Alert variant="destructive" className="mb-5">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-muted-foreground font-mono text-sm">
                  {shipment.referenceNumber}
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  Employee shipment view
                </h1>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <StatusBadge status={shipment.status} />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading || actionLoading}
                  onClick={reloadShipment}
                >
                  <RefreshCw /> Reload
                </Button>
                {nextStatuses.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={status === "CANCELLED" ? "destructive" : "default"}
                    disabled={actionLoading}
                    onClick={() => setPendingStatus(status)}
                  >
                    {statusActionLabel(status)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              <Card className="gap-0 py-0 md:col-span-1">
                <CardHeader className="px-5 pt-5">
                  <CardDescription>Customer</CardDescription>
                  <CardTitle className="mt-1 text-lg">
                    {customer.firstName} {customer.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground px-5 pt-3 pb-5 text-sm">
                  <p>{customer.email}</p>
                  <p className="mt-2 font-mono text-xs break-all">
                    {customer.id}
                  </p>
                </CardContent>
              </Card>
              <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                <AddressCard
                  title="Origin"
                  country={shipment.originCountry}
                  city={shipment.originCity}
                  postalCode={shipment.originPostalCode}
                  address={shipment.originAddress}
                />
                <AddressCard
                  title="Destination"
                  country={shipment.destinationCountry}
                  city={shipment.destinationCity}
                  postalCode={shipment.destinationPostalCode}
                  address={shipment.destinationAddress}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Card className="gap-0 py-0">
                <CardHeader className="px-5 pt-5">
                  <CardDescription>Cargo</CardDescription>
                  <CardTitle className="mt-1 text-lg">
                    Cargo information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pt-3 pb-5 text-sm">
                  <p>{shipment.cargoDescription}</p>
                  <p className="text-muted-foreground mt-3">
                    Weight: {formatWeight(shipment.weightKg)}
                  </p>
                </CardContent>
              </Card>
              <Card className="gap-0 py-0">
                <CardHeader className="px-5 pt-5">
                  <CardDescription>Schedule</CardDescription>
                  <CardTitle className="mt-1 text-lg">
                    Pickup and delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground grid gap-3 px-5 pt-3 pb-5 text-sm">
                  <p>
                    <span className="text-foreground font-medium">
                      Pickup:{" "}
                    </span>
                    {formatDate(shipment.pickupAt)}
                  </p>
                  <p>
                    <span className="text-foreground font-medium">
                      Delivery:{" "}
                    </span>
                    {formatDate(shipment.deliveryAt)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <StatusHistory events={events} />

            <ConfirmDialog
              open={pendingStatus !== null}
              title={
                pendingStatus === null
                  ? "Update shipment status?"
                  : `${statusActionLabel(pendingStatus)}?`
              }
              description="This transition is recorded in the shipment audit history."
              confirmLabel={
                pendingStatus === null
                  ? "Update status"
                  : statusActionLabel(pendingStatus)
              }
              confirming={actionLoading}
              onOpenChange={(open) => {
                if (!open && !actionLoading) setPendingStatus(null);
              }}
              onConfirm={() => void confirmStatusUpdate()}
            >
              <span />
            </ConfirmDialog>
          </>
        )}
      </div>
    </div>
  );
}
