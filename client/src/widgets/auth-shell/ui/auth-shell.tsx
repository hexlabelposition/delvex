import type { ReactNode } from "react";
import Link from "next/link";
import { PackageIcon, RouteIcon, ShieldCheckIcon } from "lucide-react";
import { routes } from "@shared/config";
import { LogisticsScene } from "@shared/ui";

interface AuthShellProps {
  children: ReactNode;
}

const highlights = [
  {
    Icon: RouteIcon,
    title: "Every shipment in one place",
    description: "Route, cargo, schedule, and status without the spreadsheet.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Your data stays yours",
    description: "Protected sessions and shipments scoped to your account.",
  },
];

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="bg-muted lg:bg-background relative isolate min-h-svh lg:grid lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
      {/* Below lg the scene is the page background and the form floats over it;
          from lg it becomes the left column of the split. */}
      <section className="pointer-events-none absolute inset-0 overflow-hidden lg:pointer-events-auto lg:relative lg:inset-auto lg:border-r">
        <LogisticsScene className="absolute inset-0 size-full" />

        {/* Clears a calm area under the form on small screens. */}
        <div
          className="absolute inset-0 bg-[radial-gradient(75%_55%_at_50%_50%,var(--color-background)_28%,transparent_100%)] lg:hidden"
          aria-hidden="true"
        />

        {/* Keeps the panel copy legible: the art fades out where the text sits. */}
        <div
          className="from-muted via-muted/75 pointer-events-none absolute inset-0 hidden bg-linear-to-tr to-transparent lg:block"
          aria-hidden="true"
        />

        <div className="relative hidden h-full flex-col p-10 lg:flex xl:p-14">
          <Link
            href={routes.landing}
            className="focus-visible:ring-ring flex w-fit items-center gap-2.5 rounded-lg text-lg font-semibold tracking-tight outline-none focus-visible:ring-3"
          >
            <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
              <PackageIcon className="size-5" aria-hidden="true" />
            </span>
            Delvex
          </Link>

          <div className="mt-auto max-w-md">
            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance xl:text-4xl">
              Move every shipment with clarity.
            </h2>

            <ul className="mt-8 flex flex-col gap-5">
              {highlights.map(({ Icon, title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-muted-foreground mt-0.5 text-sm leading-6">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground mt-10 text-sm">
              Shipment management, kept clear.
            </p>
          </div>
        </div>
      </section>

      <main className="relative flex min-h-svh items-center justify-center px-5 py-10 sm:py-12 lg:min-h-0">
        <div className="w-full max-w-100">
          <Link
            href={routes.landing}
            className="focus-visible:ring-ring mb-6 flex w-fit items-center gap-2 rounded-lg outline-none focus-visible:ring-3 lg:hidden"
          >
            <PackageIcon className="text-primary size-6" aria-hidden="true" />
            <span className="text-lg font-medium tracking-tight">Delvex</span>
          </Link>

          {children}
        </div>
      </main>
    </div>
  );
}
