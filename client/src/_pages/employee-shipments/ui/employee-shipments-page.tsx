import { getEmployeeShipments } from "@entities/shipment";
import { requireSession } from "@features/auth/server";
import type { EmployeeShipmentPage, ShipmentStatus } from "@shared/api";
import { Button, Input, Label } from "@shared/ui";
import {
  EmployeeShipmentsState,
  EmployeeShipmentsTable,
} from "@widgets/employee-shipments-table";
import { ChevronLeft, ChevronRight, ScanLine, Search } from "lucide-react";
import Link from "next/link";

const statuses: readonly ShipmentStatus[] = [
  "CREATED",
  "ACCEPTED_AT_ORIGIN",
  "IN_TRANSIT",
  "ARRIVED_AT_DESTINATION",
  "DELIVERED",
  "CANCELLED",
];

const queueFilters: ReadonlyArray<{
  label: string;
  status: ShipmentStatus | "";
}> = [
  { label: "All", status: "" },
  { label: "New intake", status: "CREATED" },
  { label: "Accepted", status: "ACCEPTED_AT_ORIGIN" },
  { label: "Incoming", status: "IN_TRANSIT" },
  { label: "Ready for delivery", status: "ARRIVED_AT_DESTINATION" },
  { label: "Completed", status: "DELIVERED" },
];

interface EmployeeShipmentsPageProps {
  page: number;
  status: ShipmentStatus | "";
  reference: string;
}

function pageHref(page: number, status: string, reference: string) {
  const search = new URLSearchParams();

  if (page > 0) search.set("page", String(page));
  if (status) search.set("status", status);
  if (reference) search.set("reference", reference);

  const query = search.toString();

  return query ? `/employee?${query}` : "/employee";
}

export async function EmployeePage({
  page,
  status,
  reference,
}: EmployeeShipmentsPageProps) {
  const { accessToken, user } = await requireSession();

  let shipments: EmployeeShipmentPage | null = null;

  try {
    shipments = await getEmployeeShipments(accessToken, {
      page,
      size: 20,
      status: status || undefined,
      reference: reference || undefined,
    });
  } catch {
    shipments = null;
  }

  const hasShipments = shipments !== null && shipments.content.length > 0;

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {user.branch?.code ?? "Unassigned branch"}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Shipment queue
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {shipments === null
            ? "Queue unavailable"
            : `${shipments.totalElements} matching shipment${shipments.totalElements === 1 ? "" : "s"}`}
        </p>
      </div>

      <section className="bg-background mt-5 border">
        <form
          action="/employee"
          method="get"
          className="grid items-end gap-3 border-b p-3 lg:grid-cols-[minmax(320px,1fr)_220px_auto]"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="reference">Scan or enter reference</Label>
              <span className="text-muted-foreground hidden items-center gap-1 text-xs sm:flex">
                <ScanLine className="size-3" /> Scanner ready · Enter to search
              </span>
            </div>
            <Input
              id="reference"
              name="reference"
              className="mt-1.5 h-10 font-mono"
              defaultValue={reference}
              maxLength={40}
              placeholder="DLX-…"
              autoComplete="off"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="status">Exact status</Label>
            <select
              id="status"
              name="status"
              className="border-input mt-1.5 h-10 w-full rounded-lg border bg-transparent px-2.5 text-sm"
              defaultValue={status}
            >
              <option value="">All statuses</option>
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="h-10 px-4">
              <Search /> Search
            </Button>
            {(status || reference) && (
              <Button
                type="button"
                variant="outline"
                className="h-10"
                render={<Link href="/employee" />}
              >
                Clear
              </Button>
            )}
          </div>
        </form>

        <nav
          aria-label="Shipment queues"
          className="flex gap-1 overflow-x-auto px-3 py-2"
        >
          {queueFilters.map((queue) => (
            <Button
              key={queue.label}
              size="sm"
              variant={status === queue.status ? "secondary" : "ghost"}
              render={
                <Link href={pageHref(0, queue.status, reference)} />
              }
            >
              {queue.label}
            </Button>
          ))}
        </nav>
      </section>

      <div className="mt-4">
        <EmployeeShipmentsState
          error={shipments === null}
          hasShipments={hasShipments}
        >
          {shipments !== null && hasShipments ? (
            <>
              <EmployeeShipmentsTable shipments={shipments.content} />
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                  Showing {page * shipments.size + 1}–
                  {page * shipments.size + shipments.content.length} of{" "}
                  {shipments.totalElements}
                </p>
                <div className="flex gap-2">
                  {page === 0 ? (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled
                      aria-label="Previous page"
                    >
                      <ChevronLeft />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Previous page"
                      render={
                        <Link href={pageHref(page - 1, status, reference)} />
                      }
                    >
                      <ChevronLeft />
                    </Button>
                  )}
                  {page >= shipments.totalPages - 1 ? (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled
                      aria-label="Next page"
                    >
                      <ChevronRight />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Next page"
                      render={
                        <Link href={pageHref(page + 1, status, reference)} />
                      }
                    >
                      <ChevronRight />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </EmployeeShipmentsState>
      </div>
    </div>
  );
}
