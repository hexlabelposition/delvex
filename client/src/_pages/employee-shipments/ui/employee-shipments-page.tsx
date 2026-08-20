import { getEmployeeShipments } from "@entities/shipment";
import { requireSession } from "@features/auth/server";
import type { EmployeeShipmentPage, ShipmentStatus } from "@shared/api";
import { Button, Card, CardContent, Input, Label } from "@shared/ui";
import {
  EmployeeShipmentsState,
  EmployeeShipmentsTable,
} from "@widgets/employee-shipments-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

const statuses: readonly ShipmentStatus[] = [
  "CREATED",
  "ACCEPTED_AT_ORIGIN",
  "IN_TRANSIT",
  "ARRIVED_AT_DESTINATION",
  "DELIVERED",
  "CANCELLED",
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
  const { accessToken } = await requireSession();

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
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Shipment operations
        </h1>
        <p className="text-muted-foreground mt-2">
          Receive customer shipments and move them through the logistics
          lifecycle.
        </p>
      </div>

      <Card className="mt-7 gap-0 py-0">
        <CardContent className="p-5">
          {/* A plain GET form: the filters live in the URL, so the page they
              produce is shareable and rendered entirely on the server. */}
          <form
            action="/employee"
            method="get"
            className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]"
          >
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                name="reference"
                className="mt-2"
                defaultValue={reference}
                maxLength={40}
                placeholder="Search by reference"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                className="border-input mt-2 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm"
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
              <Button type="submit">
                <Search /> Apply
              </Button>
              {(status || reference) && (
                <Button
                  type="button"
                  variant="outline"
                  render={<Link href="/employee" />}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6">
        <EmployeeShipmentsState
          error={shipments === null}
          hasShipments={hasShipments}
        >
          {shipments !== null && hasShipments ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                  {shipments.totalElements} shipment
                  {shipments.totalElements === 1 ? "" : "s"}
                </p>
              </div>
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
