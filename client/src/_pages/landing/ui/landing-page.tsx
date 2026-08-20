import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@shared/ui";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  MapPin,
  PackageCheck,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Manage shipments",
    description:
      "Create shipments with origin, destination, cargo, weight, and schedule details in one flow.",
    icon: PackageCheck,
  },
  {
    title: "Follow the lifecycle",
    description:
      "Keep every shipment moving through clear created, in-transit, delivered, and cancelled states.",
    icon: Route,
  },
  {
    title: "Work securely",
    description:
      "Use protected account access and refresh sessions while shipment data stays scoped to its owner.",
    icon: ShieldCheck,
  },
];

export function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <header className="border-border/70 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="focus-visible:ring-ring flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight outline-none focus-visible:ring-2"
            aria-label="Delvex home"
          >
            <Box className="text-primary size-5" aria-hidden="true" />
            Delvex
          </Link>

          <nav className="flex items-center gap-1.5" aria-label="Primary">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground hidden rounded-md px-3 py-2 text-sm transition-colors sm:inline-flex"
            >
              Features
            </Link>
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
            <Button nativeButton={false} render={<Link href="/register" />}>
              Get started <ArrowRight aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b">
          <div
            className="bg-primary/10 pointer-events-none absolute -top-24 right-0 size-80 rounded-full blur-3xl"
            aria-hidden="true"
          />
          <div
            className="bg-muted pointer-events-none absolute bottom-0 -left-24 size-72 rounded-full blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
            <div className="max-w-xl">
              <p className="text-primary mb-5 text-sm font-medium">
                Shipment operations, kept simple
              </p>
              <h1 className="text-4xl leading-[1.08] font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Move every shipment with clarity.
              </h1>
              <p className="text-muted-foreground mt-6 max-w-lg text-base leading-7 sm:text-lg">
                Delvex brings shipment creation, status tracking, and account
                management into one focused workspace.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="sm:min-w-36"
                  nativeButton={false}
                  render={<Link href="/register" />}
                >
                  Create account <ArrowRight aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="sm:min-w-28"
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  Sign in
                </Button>
              </div>

              <p className="text-muted-foreground mt-5 text-sm">
                Create, review, and update shipments from one workspace.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:mx-0">
              <div
                className="border-primary/20 bg-primary/5 absolute -inset-4 -rotate-2 rounded-3xl border"
                aria-hidden="true"
              />
              <Card className="relative gap-0 overflow-hidden py-0 shadow-lg">
                <CardHeader className="border-b px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardDescription>Shipment overview</CardDescription>
                      <p className="mt-1 font-semibold">DVX-1048</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      <span className="size-1.5 rounded-full bg-current" />
                      In transit
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="px-5 py-6 sm:px-6">
                  <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Origin
                      </p>
                      <div className="mt-2 flex items-start gap-2">
                        <MapPin
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

                    <ArrowRight
                      className="text-muted-foreground hidden size-4 sm:block"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Destination
                      </p>
                      <div className="mt-2 flex items-start gap-2">
                        <MapPin
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
                        <Truck
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
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className="bg-primary h-0.5 flex-1" />
                      <span className="border-primary bg-background size-6 rounded-full border-2" />
                      <span className="bg-border h-0.5 flex-1" />
                      <span className="border-border bg-background size-6 rounded-full border-2" />
                    </div>

                    <div className="text-muted-foreground mt-2 grid grid-cols-3 text-[11px]">
                      <span>Created</span>
                      <span className="text-center">In transit</span>
                      <span className="text-right">Delivered</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-16 py-16 sm:py-24">
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
              {features.map(({ title, description, icon: Icon }) => (
                <Card key={title} className="gap-0 py-0 shadow-none">
                  <CardHeader className="px-5 pt-5">
                    <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-semibold">{title}</h3>
                  </CardHeader>
                  <CardContent className="text-muted-foreground px-5 pt-2 pb-5 text-sm leading-6">
                    {description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="bg-primary text-primary-foreground mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-2xl px-6 py-8 sm:px-10 sm:py-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Ready to organize your next shipment?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 opacity-80">
                Create your Delvex account and start with one clear logistics
                workspace.
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="shrink-0"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Get started <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-border/70 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="text-foreground flex items-center gap-2 font-medium">
            <Box className="text-primary size-4" aria-hidden="true" />
            Delvex
          </div>
          <p>Shipment management, kept clear.</p>
        </div>
      </footer>
    </div>
  );
}
