import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  Building2Icon,
  CreditCardIcon,
  FlaskConicalIcon,
  InfoIcon,
  MapPinIcon,
  PackageIcon,
  PencilIcon,
  ScaleIcon,
  TruckIcon,
} from "lucide-react";
import {
  isShipmentDeletable,
  isShipmentEditable,
  ShipmentStatusBadge,
  shipmentStatusDescriptions,
  shipmentWeightLabel,
  type Shipment,
} from "@entities/shipment";
import { DeleteShipmentButton } from "@features/shipment-delete";
import { startPaymentCheckoutAction } from "@features/payment-checkout";
import { routes } from "@shared/config";
import { formatDate } from "@shared/lib";
import { Alert, Button, buttonVariants, Card } from "@shared/ui";

import { CopyReferenceButton } from "./copy-reference-button";
import { ShipmentTimeline } from "./shipment-timeline";

interface ShipmentDetailsViewProps {
  shipment: Shipment;
  paymentResult?: string;
}

export function ShipmentDetailsView({
  shipment,
  paymentResult,
}: ShipmentDetailsViewProps) {
  const editable = isShipmentEditable(shipment.status);
  const deletable = isShipmentDeletable(shipment.status);

  return (
    <main className="flex flex-1 flex-col gap-8">
      {paymentResult && <PaymentResultAlert result={paymentResult} />}
      <div>
        <Link
          href={routes.shipments}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "text-muted-foreground hover:text-foreground -ml-2",
          })}
        >
          <ArrowLeftIcon aria-hidden="true" /> All shipments
        </Link>
      </div>

      <section className="bg-card relative overflow-hidden rounded-2xl border">
        <div
          className="bg-primary/10 pointer-events-none absolute -top-24 right-0 size-72 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="bg-muted pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-8 px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground font-mono text-xs">
                  {shipment.referenceNumber}
                </span>
                <CopyReferenceButton reference={shipment.referenceNumber} />
              </div>

              <h1 className="mt-2 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {shipment.originCity}
                <ArrowRightIcon
                  className="text-muted-foreground size-5 shrink-0"
                  aria-hidden="true"
                />
                {shipment.destinationCity}
              </h1>

              <p className="text-muted-foreground mt-2 max-w-xl">
                {shipmentStatusDescriptions[shipment.status]}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ShipmentStatusBadge status={shipment.status} />

              {editable && (
                <Link
                  href={routes.editShipment(shipment.id)}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <PencilIcon aria-hidden="true" /> Edit
                </Link>
              )}

              {deletable && <DeleteShipmentButton shipmentId={shipment.id} />}
            </div>
          </div>

          <ShipmentTimeline status={shipment.status} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <LocationCard
          label="Origin"
          city={shipment.originCity}
          country={shipment.originCountry}
          address={shipment.originAddress}
          postalCode={shipment.originPostalCode}
        />

        <span
          className="bg-muted text-muted-foreground mx-auto flex size-9 items-center justify-center rounded-full"
          aria-hidden="true"
        >
          <TruckIcon className="size-4" />
        </span>

        <LocationCard
          label="Destination"
          city={shipment.destinationCity}
          country={shipment.destinationCountry}
          address={shipment.destinationAddress}
          postalCode={shipment.destinationPostalCode}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card.Root>
          <Card.Header>
            <Card.Description className="flex items-center gap-2">
              <PackageIcon className="text-primary size-4" aria-hidden="true" />
              Cargo
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <p className="text-sm leading-6 wrap-break-word">
              {shipment.cargoDescription}
            </p>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <ScaleIcon className="size-4" aria-hidden="true" />
              {shipmentWeightLabel(shipment.weightKg)}
            </p>
          </Card.Content>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Description className="flex items-center gap-2">
              <CalendarIcon
                className="text-primary size-4"
                aria-hidden="true"
              />
              Schedule
            </Card.Description>
          </Card.Header>
          <Card.Content className="grid gap-4 sm:grid-cols-2">
            <ScheduleValue label="Pickup" value={shipment.pickupAt} />
            <ScheduleValue label="Delivery" value={shipment.deliveryAt} />
          </Card.Content>
        </Card.Root>
      </section>

      <PaymentCard shipment={shipment} />

      <section>
        <Card.Root size="sm">
          <Card.Content className="text-muted-foreground grid gap-4 text-sm sm:grid-cols-3">
            <RecordValue
              label="Created"
              value={formatDate(shipment.createdAt)}
            />
            <RecordValue
              label="Last updated"
              value={formatDate(shipment.updatedAt)}
            />
            <RecordValue label="Shipment ID" value={shipment.id} mono />
          </Card.Content>
        </Card.Root>
      </section>
    </main>
  );
}

function PaymentResultAlert({ result }: { result: string }) {
  const content = {
    success: {
      title: "Payment submitted",
      description:
        "The payment status updates after Stripe confirms the test transaction.",
    },
    cancelled: {
      title: "Checkout cancelled",
      description: "No payment was made. You can restart test checkout below.",
    },
    unavailable: {
      title: "Checkout unavailable",
      description:
        "Stripe Sandbox could not be reached. The shipment was still created.",
    },
  }[result];

  if (!content) {
    return null;
  }

  return (
    <Alert.Root variant={result === "unavailable" ? "destructive" : "default"}>
      <InfoIcon aria-hidden="true" />
      <Alert.Title>{content.title}</Alert.Title>
      <Alert.Description>{content.description}</Alert.Description>
    </Alert.Root>
  );
}

function PaymentCard({ shipment }: { shipment: Shipment }) {
  const { payment } = shipment;
  const cardPayment = payment.method === "CARD";
  const canPay =
    cardPayment && payment.status !== "PAID" && payment.status !== "REFUNDED";
  const formatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency: payment.currency,
  });

  return (
    <section>
      <Card.Root>
        <Card.Header>
          <Card.Description className="flex items-center gap-2">
            {cardPayment ? (
              <CreditCardIcon
                className="text-primary size-4"
                aria-hidden="true"
              />
            ) : (
              <Building2Icon
                className="text-primary size-4"
                aria-hidden="true"
              />
            )}
            Payment
          </Card.Description>
          <Card.Title className="flex flex-wrap items-center justify-between gap-3 text-lg">
            <span>{formatter.format(payment.amount)}</span>
            <span className="bg-muted rounded-full px-2.5 py-1 text-xs font-medium">
              {payment.status.toLowerCase()}
            </span>
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            {cardPayment
              ? "Pay securely on the Stripe-hosted checkout page."
              : "Payment is due when the shipment is accepted at the origin branch."}
          </p>

          {cardPayment && payment.status !== "PAID" && (
            <Alert.Root>
              <FlaskConicalIcon aria-hidden="true" />
              <Alert.Title>Demo payment</Alert.Title>
              <Alert.Description>
                Stripe Sandbox is enabled. No real money is charged. Use test
                card 4242 4242 4242 4242, any future date and any CVC.
              </Alert.Description>
            </Alert.Root>
          )}

          {canPay && (
            <form action={startPaymentCheckoutAction.bind(null, shipment.id)}>
              <Button type="submit">
                <CreditCardIcon aria-hidden="true" /> Pay with test card
              </Button>
            </form>
          )}
        </Card.Content>
      </Card.Root>
    </section>
  );
}

interface LocationCardProps {
  label: string;
  city: string;
  country: string;
  address: string;
  postalCode: string;
}

function LocationCard({
  label,
  city,
  country,
  address,
  postalCode,
}: LocationCardProps) {
  return (
    <Card.Root className="min-w-0">
      <Card.Header>
        <Card.Description className="text-xs font-medium tracking-wide uppercase">
          {label}
        </Card.Description>
        <Card.Title className="flex items-center gap-2 text-lg">
          <MapPinIcon
            className="text-primary size-4 shrink-0"
            aria-hidden="true"
          />
          {city}
        </Card.Title>
      </Card.Header>
      <Card.Content className="text-muted-foreground text-sm">
        <p className="text-foreground">{address}</p>
        <p className="mt-1">
          {postalCode} · {country}
        </p>
      </Card.Content>
    </Card.Root>
  );
}

function ScheduleValue({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className={value === null ? "text-muted-foreground mt-1" : "mt-1"}>
        {value === null ? "Not scheduled" : formatDate(value)}
      </p>
    </div>
  );
}

function RecordValue({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium tracking-wide uppercase">{label}</p>
      <p
        className={
          mono
            ? "text-foreground mt-1 truncate font-mono text-xs"
            : "text-foreground mt-1"
        }
      >
        {value}
      </p>
    </div>
  );
}
