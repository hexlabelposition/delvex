"use client";

import { ChevronLeft, ChevronRight, PackageOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { getShipments } from "@/features/dashboard/api";
import { EmptyState } from "@/features/dashboard/empty-state";
import { ShipmentsTable } from "@/features/dashboard/shipments-table";
import type { ShipmentPage } from "@/lib/api/types";

function ShipmentsContent() {
  const { session } = useAuth();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [data, setData] = useState<ShipmentPage | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (session === null) return;
    void getShipments(session.accessToken, page, 10)
      .then(setData)
      .catch(() => setError(true));
  }, [page, session]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground mt-2">
            {data === null
              ? "Loading shipments…"
              : `${data.totalElements} shipment${data.totalElements === 1 ? "" : "s"}, newest first`}
          </p>
        </div>
        <Button render={<Link href="/create" />}>
          <Plus /> New shipment
        </Button>
      </div>
      {searchParams.get("created") === "1" && (
        <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Shipment created successfully.
        </p>
      )}
      {searchParams.get("deleted") === "1" && (
        <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Shipment deleted successfully.
        </p>
      )}
      <div className="mt-7">
        {error ? (
          <EmptyState
            icon={PackageOpen}
            title="Couldn’t load shipments"
            description="The server is unavailable. Please try again in a moment."
          />
        ) : data !== null && data.content.length > 0 ? (
          <>
            <ShipmentsTable shipments={data.content} />
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                Showing {page * data.size + 1}–
                {page * data.size + data.content.length} of {data.totalElements}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page === 0}
                  onClick={() => setPage((value) => value - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page >= data.totalPages - 1}
                  onClick={() => setPage((value) => value + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={PackageOpen}
            title="No shipments yet"
            description="When you create a shipment, it will appear in this list."
            action={
              <Button render={<Link href="/create" />}>
                Create shipment <Plus />
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}

export default function ShipmentsPage() {
  return (
    <Suspense
      fallback={<div className="text-muted-foreground">Loading shipments…</div>}
    >
      <ShipmentsContent />
    </Suspense>
  );
}
