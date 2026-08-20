"use client";

import { getEmployeeShipments } from "@entities/shipment";
import { useAuth } from "@features/auth";
import type { EmployeeShipmentPage, ShipmentStatus } from "@shared/api";
import { Button, Card, CardContent, Input, Label } from "@shared/ui";
import {
  EmployeeShipmentsState,
  EmployeeShipmentsTable,
} from "@widgets/employee-shipments-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

const statuses: readonly ShipmentStatus[] = [
  "CREATED",
  "ACCEPTED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

interface Filters {
  status: ShipmentStatus | "";
  reference: string;
}

const initialFilters: Filters = { status: "", reference: "" };

export function EmployeePage() {
  const { session } = useAuth();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [data, setData] = useState<EmployeeShipmentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (session === null) return;
    let cancelled = false;
    void getEmployeeShipments(session.accessToken, {
      page,
      size: 20,
      status: appliedFilters.status || undefined,
      reference: appliedFilters.reference || undefined,
    })
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appliedFilters, page, session]);

  const applyFilters = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(false);
    setPage(0);
    setAppliedFilters({
      status: filters.status,
      reference: filters.reference.trim(),
    });
  };

  const clearFilters = () => {
    setLoading(true);
    setError(false);
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(0);
  };

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
          <form
            className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]"
            onSubmit={applyFilters}
          >
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                className="mt-2"
                value={filters.reference}
                maxLength={40}
                placeholder="Search by reference"
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    reference: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="border-input mt-2 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm"
                value={filters.status}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    status: event.target.value as ShipmentStatus | "",
                  }))
                }
              >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                <Search /> Apply
              </Button>
              {(filters.status || filters.reference) && (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6">
        <EmployeeShipmentsState
          error={error}
          loading={loading && data === null}
          hasShipments={data !== null && data.content.length > 0}
        >
          {data !== null && data.content.length > 0 ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                  {data.totalElements} shipment
                  {data.totalElements === 1 ? "" : "s"}
                  {loading ? " · Refreshing…" : ""}
                </p>
              </div>
              <EmployeeShipmentsTable shipments={data.content} />
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                  Showing {page * data.size + 1}–
                  {page * data.size + data.content.length} of{" "}
                  {data.totalElements}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={page === 0 || loading}
                    onClick={() => {
                      setLoading(true);
                      setError(false);
                      setPage((value) => value - 1);
                    }}
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={page >= data.totalPages - 1 || loading}
                    onClick={() => {
                      setLoading(true);
                      setError(false);
                      setPage((value) => value + 1);
                    }}
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </EmployeeShipmentsState>
      </div>
    </div>
  );
}
