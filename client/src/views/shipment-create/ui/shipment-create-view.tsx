import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { routes } from "@shared/config";
import { buttonVariants } from "@shared/ui";

import { CreateShipmentForm } from "./create-shipment-form";

export function ShipmentCreateView() {
  return (
    <main className="flex flex-1 flex-col gap-8">
      <div className="flex flex-col gap-4">
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

        <div>
          <p className="text-primary text-sm font-medium">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            New shipment
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Pick the route, describe the cargo, and Delvex takes it from there.
            The reference number and status are assigned automatically.
          </p>
        </div>
      </div>

      <CreateShipmentForm />
    </main>
  );
}
