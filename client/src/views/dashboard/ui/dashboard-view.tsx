import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  PackageCheckIcon,
  PackageIcon,
  TruckIcon,
} from "lucide-react";
import { cn } from "tailwind-variants";
import type { Shipment } from "@entities/shipment";
import type { UserEntity } from "@entities/user";
import { routes } from "@shared/config";
import { buttonVariants, Card } from "@shared/ui";

import { getDashboardStats, RECENT_SHIPMENTS_LIMIT } from "../model/stats";
import { EmptyShipments } from "./empty-shipments";
import { RecentShipmentsTable } from "./recent-shipments-table";

interface DashboardViewProps {
  user: UserEntity;
  shipments: Shipment[];
  totalShipments: number;
}

export function DashboardView({
  user,
  shipments,
  totalShipments,
}: DashboardViewProps) {
  const stats = getDashboardStats(shipments, totalShipments);
  const recentShipments = shipments.slice(0, RECENT_SHIPMENTS_LIMIT);

  const tiles = [
    { label: "Total shipments", value: stats.total, Icon: PackageIcon },
    { label: "Awaiting pickup", value: stats.awaitingPickup, Icon: ClockIcon },
    { label: "In transit", value: stats.inTransit, Icon: TruckIcon },
    { label: "Delivered", value: stats.delivered, Icon: PackageCheckIcon },
  ];

  const notes: string[] = [];

  if (stats.sampled) {
    notes.push(
      `Status counts across your latest ${stats.sampleSize} shipments`,
    );
  }

  if (stats.cancelled > 0) {
    notes.push(`${stats.cancelled} cancelled`);
  }

  return (
    <main className="flex flex-1 flex-col gap-10">
      <section className="bg-card relative overflow-hidden rounded-2xl border">
        <div
          className="bg-primary/10 pointer-events-none absolute -top-24 right-0 size-72 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="bg-muted pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-7 px-6 py-8 sm:px-10 sm:py-10">
          <div>
            <p className="text-primary text-sm font-medium">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {user.firstName}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl leading-7">
              Here is where your shipments stand right now.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={routes.createShipment}
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "sm:min-w-36",
              })}
            >
              New shipment <ArrowRightIcon aria-hidden="true" />
            </Link>

            <Link
              href={routes.shipments}
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "sm:min-w-32",
              })}
            >
              All shipments
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map(({ label, value, Icon }) => (
            <Card.Root
              key={label}
              className="min-w-0 gap-0 px-(--card-spacing)"
            >
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {label}
                </dt>
                <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <dd className="mt-3 text-3xl font-semibold tracking-tight">
                {value}
              </dd>
            </Card.Root>
          ))}
        </dl>

        {notes.length > 0 && (
          <p className="text-muted-foreground text-xs">{notes.join(" · ")}</p>
        )}
      </section>

      <section
        className={cn(
          "flex flex-col gap-6",
          recentShipments.length === 0 && "flex-1",
        )}
      >
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-primary text-sm font-medium">Latest activity</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Your most recently created shipments.
            </h2>
          </div>

          {recentShipments.length > 0 && (
            <Link
              href={routes.shipments}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              View all <ArrowRightIcon aria-hidden="true" />
            </Link>
          )}
        </header>

        {recentShipments.length > 0 ? (
          <RecentShipmentsTable shipments={recentShipments} />
        ) : (
          <EmptyShipments />
        )}
      </section>
    </main>
  );
}
