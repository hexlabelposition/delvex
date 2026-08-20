import {
  formatWeight,
  getEmployeeShipment,
  getShipmentStatusEvents,
  StatusBadge,
  statusLabel,
} from "@entities/shipment";
import { requireSession } from "@features/auth/server";
import { ShipmentStatusControls } from "@features/shipment-status";
import {
  ApiClientError,
  type EmployeeShipment,
  type ShipmentStatusEvent,
} from "@shared/api";
import { formatDate } from "@shared/lib";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@shared/ui";
import { ArrowLeft, History, PackageOpen, RefreshCw } from "lucide-react";
import Link from "next/link";

interface EmployeeShipmentPageProps {
  shipmentId: string;
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

export async function EmployeeShipmentPage({
  shipmentId,
}: EmployeeShipmentPageProps) {
  const { accessToken } = await requireSession();

  let record: EmployeeShipment | null = null;
  let events: ShipmentStatusEvent[] = [];
  let loadError: "not-found" | "unavailable" | null = null;

  try {
    [record, events] = await Promise.all([
      getEmployeeShipment(shipmentId, accessToken),
      getShipmentStatusEvents(shipmentId, accessToken),
    ]);
  } catch (error) {
    loadError =
      error instanceof ApiClientError && error.status === 404
        ? "not-found"
        : "unavailable";
  }

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
        ) : record === null ? (
          <EmptyState
            icon={PackageOpen}
            title="Couldn’t load shipment"
            description="The server is unavailable. Please try again in a moment."
            action={
              <Button
                variant="outline"
                // A hard reload: the render failed, so there is no cached
                // payload worth reusing.
                render={<a href={`/employee/shipments/${shipmentId}`} />}
              >
                <RefreshCw /> Try again
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-muted-foreground font-mono text-sm">
                  {record.shipment.referenceNumber}
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  Employee shipment view
                </h1>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <StatusBadge status={record.shipment.status} />
                <ShipmentStatusControls
                  shipmentId={record.shipment.id}
                  status={record.shipment.status}
                  allowedStatuses={record.allowedStatuses}
                  version={record.shipment.version}
                />
              </div>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              <Card className="gap-0 py-0 md:col-span-1">
                <CardHeader className="px-5 pt-5">
                  <CardDescription>Customer</CardDescription>
                  <CardTitle className="mt-1 text-lg">
                    {record.customer.firstName} {record.customer.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground px-5 pt-3 pb-5 text-sm">
                  <p>{record.customer.email}</p>
                  <p className="mt-2 font-mono text-xs break-all">
                    {record.customer.id}
                  </p>
                </CardContent>
              </Card>
              <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                <AddressCard
                  title="Origin"
                  country={record.shipment.originCountry}
                  city={record.shipment.originCity}
                  postalCode={record.shipment.originPostalCode}
                  address={record.shipment.originAddress}
                />
                <AddressCard
                  title="Destination"
                  country={record.shipment.destinationCountry}
                  city={record.shipment.destinationCity}
                  postalCode={record.shipment.destinationPostalCode}
                  address={record.shipment.destinationAddress}
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
                  <p>{record.shipment.cargoDescription}</p>
                  <p className="text-muted-foreground mt-3">
                    Weight: {formatWeight(record.shipment.weightKg)}
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
                    {formatDate(record.shipment.pickupAt)}
                  </p>
                  <p>
                    <span className="text-foreground font-medium">
                      Delivery:{" "}
                    </span>
                    {formatDate(record.shipment.deliveryAt)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <StatusHistory events={events} />
          </>
        )}
      </div>
    </div>
  );
}
