import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  MapPinIcon,
  PackageCheckIcon,
  PackageIcon,
  RouteIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "lucide-react";
import { createMetadata } from "@shared/lib";
import { routes } from "@shared/config";
import { buttonVariants, Card, LogisticsScene } from "@shared/ui";

export const metadata = createMetadata({
  title: "Shipment management made clear",
  description:
    "Create, track, and manage shipments from one focused logistics workspace.",
  path: routes.landing,
});

const features = [
  {
    title: "Manage shipments",
    description:
      "Create shipments with origin, destination, cargo, weight, and schedule details in one flow.",
    Icon: PackageCheckIcon,
    tone: "bg-primary/10 text-primary",
  },
  {
    title: "Follow the lifecycle",
    description:
      "Keep every shipment moving through clear created, in-transit, delivered, and cancelled states.",
    Icon: RouteIcon,
    tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  },
  {
    title: "Work securely",
    description:
      "Use protected account access and refresh sessions while shipment data stays scoped to its owner.",
    Icon: ShieldCheckIcon,
    tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
];

const heroPoints = [
  "No setup, no spreadsheets",
  "Route and schedule in one place",
  "Free while you try it",
];

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <header className="border-border/70 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href={routes.landing}
            className="focus-visible:ring-ring flex items-center gap-2.5 rounded-lg text-lg font-semibold tracking-tight outline-none focus-visible:ring-3"
            aria-label="Delvex home"
          >
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-xl">
              <PackageIcon className="size-4.5" aria-hidden="true" />
            </span>
            Delvex
          </Link>

          <nav className="flex items-center gap-2" aria-label="Primary">
            <a
              href="#features"
              className={buttonVariants({
                variant: "ghost",
                className:
                  "text-muted-foreground hover:text-foreground hidden sm:inline-flex",
              })}
            >
              Features
            </a>

            <Link
              href={routes.login}
              className={buttonVariants({
                variant: "ghost",
                className: "hidden sm:inline-flex",
              })}
            >
              Sign in
            </Link>

            <Link
              href={routes.register}
              className={buttonVariants({ variant: "default" })}
            >
              Get started <ArrowRightIcon aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b">
          {/* Kept to the right half: across the full width the scene scales up
              until the crates read as stray shapes behind the copy. */}
          <LogisticsScene className="absolute inset-y-0 right-0 hidden w-[58%] opacity-60 lg:block" />
          <div
            className="from-background via-background/70 absolute inset-0 bg-linear-to-r to-transparent"
            aria-hidden="true"
          />
          <div
            className="bg-primary/10 pointer-events-none absolute -top-24 right-0 size-80 rounded-full blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
            <div className="max-w-xl">
              <p className="border-primary/20 bg-primary/5 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
                <span className="bg-primary size-1.5 rounded-full" />
                Shipment operations, kept simple
              </p>

              <h1 className="text-4xl leading-[1.08] font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Move every shipment with{" "}
                <span className="text-primary">clarity</span>.
              </h1>

              <p className="text-muted-foreground mt-6 max-w-lg text-base leading-7 sm:text-lg">
                Delvex brings shipment creation, status tracking, and account
                management into one focused workspace.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={routes.register}
                  className={buttonVariants({
                    variant: "default",
                    size: "lg",
                    className: "sm:min-w-36",
                  })}
                >
                  Create account <ArrowRightIcon aria-hidden="true" />
                </Link>

                <Link
                  href={routes.login}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "sm:min-w-28",
                  })}
                >
                  Sign in
                </Link>
              </div>

              <ul className="text-muted-foreground mt-7 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-5">
                {heroPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <CheckCircle2Icon
                      className="text-primary size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:mx-0">
              <div
                className="border-primary/20 bg-primary/5 absolute -inset-4 -rotate-2 rounded-3xl border"
                aria-hidden="true"
              />
              <Card.Root className="relative gap-0 overflow-hidden py-0 shadow-lg">
                <Card.Header className="border-b px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Card.Description>Shipment overview</Card.Description>
                      <p className="mt-1 font-semibold">DVX-1048</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      <span className="size-1.5 rounded-full bg-current" />
                      In transit
                    </span>
                  </div>
                </Card.Header>

                <Card.Content className="px-5 py-6 sm:px-6">
                  <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Origin
                      </p>
                      <div className="mt-2 flex items-start gap-2">
                        <MapPinIcon
                          className="text-primary mt-0.5 size-4"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-medium">Wrocław</p>
                          <p className="text-muted-foreground text-xs">
                            Poland
                          </p>
                        </div>
                      </div>
                    </div>

                    <ArrowRightIcon
                      className="text-muted-foreground hidden size-4 sm:block"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Destination
                      </p>
                      <div className="mt-2 flex items-start gap-2">
                        <MapPinIcon
                          className="text-primary mt-0.5 size-4"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-medium">Berlin</p>
                          <p className="text-muted-foreground text-xs">
                            Germany
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/70 mt-6 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <TruckIcon
                          className="text-primary size-4"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-medium">Delivery progress</p>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Updated now
                      </p>
                    </div>

                    <div className="mt-4 flex items-center">
                      <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full">
                        <CheckCircle2Icon
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="bg-primary h-0.5 flex-1" />
                      <span className="border-primary bg-background ring-primary/15 size-6 rounded-full border-2 ring-4" />
                      <span className="bg-border h-0.5 flex-1" />
                      <span className="border-border bg-background size-6 rounded-full border-2" />
                    </div>

                    <div className="text-muted-foreground mt-3 grid grid-cols-3 text-[11px]">
                      <span>Created</span>
                      <span className="text-foreground text-center font-medium">
                        In transit
                      </span>
                      <span className="text-right">Delivered</span>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-primary text-sm font-medium">
                One focused workspace
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                The essentials for everyday shipment management.
              </h2>
              <p className="text-muted-foreground mt-4 leading-7">
                Delvex keeps the core logistics flow visible without adding
                unnecessary complexity.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {features.map(({ title, description, Icon, tone }) => (
                <Card.Root
                  key={title}
                  className="hover:ring-primary/30 gap-0 py-0 shadow-none transition-shadow hover:shadow-sm"
                >
                  <Card.Header className="px-5 pt-5">
                    <span
                      className={`flex size-10 items-center justify-center rounded-lg ${tone}`}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-semibold">{title}</h3>
                  </Card.Header>
                  <Card.Content className="text-muted-foreground px-5 pt-2 pb-5 text-sm leading-6">
                    {description}
                  </Card.Content>
                </Card.Root>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="bg-primary text-primary-foreground relative isolate mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl px-6 py-8 sm:px-10 sm:py-10 md:flex-row md:items-center">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              aria-hidden="true"
            >
              <svg className="size-full" fill="none">
                <defs>
                  <pattern
                    id="cta-dots"
                    width="22"
                    height="22"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1.6" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cta-dots)" />
              </svg>
            </div>

            <div className="relative">
              <h2 className="text-2xl font-semibold tracking-tight">
                Ready to organize your next shipment?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 opacity-80">
                Create your Delvex account and start with one clear logistics
                workspace.
              </p>
            </div>

            <Link
              href={routes.register}
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "relative",
              })}
            >
              Get started <ArrowRightIcon aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-border/70 border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-xl">
              <PackageIcon className="size-4.5" aria-hidden="true" />
            </span>
            Delvex
          </div>

          <p className="text-muted-foreground">
            Shipment management, kept clear.
          </p>

          <nav className="flex items-center gap-4" aria-label="Footer">
            <Link
              href={routes.login}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md outline-none focus-visible:ring-3"
            >
              Sign in
            </Link>
            <Link
              href={routes.register}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md outline-none focus-visible:ring-3"
            >
              Create account
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
