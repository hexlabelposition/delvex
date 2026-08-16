"use client";

import { ArrowLeft, PackageOpen, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  deleteShipment,
  getShipment,
  updateShipment,
} from "@/features/dashboard/api";
import { EmptyState } from "@/features/dashboard/empty-state";
import { formatDate, formatWeight } from "@/features/dashboard/format";
import { StatusBadge } from "@/features/dashboard/status-badge";
import { ApiClientError } from "@/lib/api/client";
import type { Shipment, ShipmentStatus } from "@/lib/api/types";

type ConfirmationAction = "cancel" | "delete";

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

function ShipmentDetails({
  shipment,
  actionLoading,
  onStatusChange,
  onConfirm,
}: {
  shipment: Shipment;
  actionLoading: boolean;
  onStatusChange: (status: ShipmentStatus) => void;
  onConfirm: (action: ConfirmationAction) => void;
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground font-mono text-sm">
            {shipment.referenceNumber}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Shipment details
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={shipment.status} />
          {shipment.status === "CREATED" && (
            <>
              <Button
                size="sm"
                disabled={actionLoading}
                onClick={() => onStatusChange("IN_TRANSIT")}
              >
                Mark in transit
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading}
                onClick={() => onConfirm("cancel")}
              >
                Cancel shipment
              </Button>
            </>
          )}
          {shipment.status === "IN_TRANSIT" && (
            <>
              <Button
                size="sm"
                disabled={actionLoading}
                onClick={() => onStatusChange("DELIVERED")}
              >
                Mark delivered
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading}
                onClick={() => onConfirm("cancel")}
              >
                Cancel shipment
              </Button>
            </>
          )}
          {(shipment.status === "CREATED" ||
            shipment.status === "IN_TRANSIT") && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionLoading}
              render={<Link href={`/shipments/${shipment.id}/edit`} />}
            >
              <Pencil /> Edit
            </Button>
          )}
          {(shipment.status === "CREATED" ||
            shipment.status === "CANCELLED") && (
            <Button
              size="sm"
              variant="destructive"
              disabled={actionLoading}
              onClick={() => onConfirm("delete")}
            >
              <Trash2 /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-2">
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

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardHeader className="px-5 pt-5">
            <CardDescription>Cargo</CardDescription>
            <CardTitle className="mt-1 text-lg">Cargo information</CardTitle>
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
            <CardTitle className="mt-1 text-lg">Pickup and delivery</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground grid gap-3 px-5 pt-3 pb-5 text-sm">
            <p>
              <span className="text-foreground font-medium">Pickup: </span>
              {formatDate(shipment.pickupAt)}
            </p>
            <p>
              <span className="text-foreground font-medium">Delivery: </span>
              {formatDate(shipment.deliveryAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5 gap-0 py-0">
        <CardHeader className="px-5 pt-5">
          <CardDescription>Record</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground grid gap-3 px-5 pt-3 pb-5 text-sm sm:grid-cols-2">
          <p>
            <span className="text-foreground font-medium">Created: </span>
            {formatDate(shipment.createdAt)}
          </p>
          <p>
            <span className="text-foreground font-medium">Last updated: </span>
            {formatDate(shipment.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </>
  );
}

export default function ShipmentDetailsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState<"not-found" | "unavailable" | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationAction | null>(
    null,
  );

  useEffect(() => {
    if (session === null || shipmentId === undefined) return;

    let cancelled = false;

    void getShipment(shipmentId, session.accessToken)
      .then((response) => {
        if (!cancelled) setShipment(response);
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        setError(
          requestError instanceof ApiClientError && requestError.status === 404
            ? "not-found"
            : "unavailable",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [session, shipmentId]);

  const updateStatus = async (status: ShipmentStatus) => {
    if (session === null || shipment === null) return;
    setActionLoading(true);
    setActionError("");
    try {
      setShipment(
        await updateShipment(
          shipment.id,
          { status },
          { accessToken: session.accessToken },
        ),
      );
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update shipment",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const confirmAction = async () => {
    if (session === null || shipment === null || confirmation === null) return;
    setActionLoading(true);
    setActionError("");
    try {
      if (confirmation === "cancel") {
        setShipment(
          await updateShipment(
            shipment.id,
            { status: "CANCELLED" },
            { accessToken: session.accessToken },
          ),
        );
        setConfirmation(null);
      } else {
        await deleteShipment(shipment.id, { accessToken: session.accessToken });
        router.push("/shipments?deleted=1");
      }
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update shipment",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" size="sm" render={<Link href="/shipments" />}>
        <ArrowLeft /> Back to shipments
      </Button>
      <div className="mt-5">
        {error === "not-found" ? (
          <EmptyState
            icon={PackageOpen}
            title="Shipment not found"
            description="This shipment is unavailable or does not belong to your account."
          />
        ) : error === "unavailable" ? (
          <EmptyState
            icon={PackageOpen}
            title="Couldn’t load shipment"
            description="The server is unavailable. Please try again in a moment."
          />
        ) : shipment === null ? (
          <p className="text-muted-foreground">Loading shipment…</p>
        ) : (
          <>
            {actionError && (
              <Alert variant="destructive" className="mb-5">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            <ShipmentDetails
              shipment={shipment}
              actionLoading={actionLoading}
              onStatusChange={(status) => void updateStatus(status)}
              onConfirm={setConfirmation}
            />
            <ConfirmDialog
              open={confirmation !== null}
              title={
                confirmation === "delete"
                  ? "Delete shipment?"
                  : "Cancel shipment?"
              }
              description={
                confirmation === "delete"
                  ? "This shipment will be permanently removed."
                  : "This shipment will be marked as cancelled and cannot be changed afterwards."
              }
              confirmLabel={
                confirmation === "delete"
                  ? "Delete shipment"
                  : "Cancel shipment"
              }
              confirming={actionLoading}
              onOpenChange={(open) => {
                if (!open && !actionLoading) setConfirmation(null);
              }}
              onConfirm={() => void confirmAction()}
            >
              <span />
            </ConfirmDialog>
          </>
        )}
      </div>
    </div>
  );
}
