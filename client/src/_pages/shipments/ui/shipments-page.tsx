import { getShipments } from "@entities/shipment";
import { requireSession } from "@features/auth/server";
import type { ShipmentPage } from "@shared/api";
import { Button, EmptyState } from "@shared/ui";
import { ShipmentsTable } from "@widgets/shipments-table";
import { ChevronLeft, ChevronRight, PackageOpen, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface ShipmentsPageProps {
  page: number;
  created: boolean;
  deleted: boolean;
}

function PageLink({
  page,
  disabled,
  label,
  children,
}: {
  page: number;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <Button variant="outline" size="icon-sm" disabled aria-label={label}>
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={label}
      render={<Link href={`/shipments?page=${page}`} />}
    >
      {children}
    </Button>
  );
}

export async function ShipmentsPage({
  page,
  created,
  deleted,
}: ShipmentsPageProps) {
  const { accessToken } = await requireSession();

  let shipments: ShipmentPage | null = null;

  try {
    shipments = await getShipments(accessToken, page, 10);
  } catch {
    shipments = null;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground mt-2">
            {shipments === null
              ? "Shipments are unavailable right now"
              : `${shipments.totalElements} shipment${shipments.totalElements === 1 ? "" : "s"}, newest first`}
          </p>
        </div>
        <Button render={<Link href="/create" />}>
          <Plus /> New shipment
        </Button>
      </div>
      {created && (
        <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Shipment created successfully.
        </p>
      )}
      {deleted && (
        <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Shipment deleted successfully.
        </p>
      )}
      <div className="mt-7">
        {shipments === null ? (
          <EmptyState
            icon={PackageOpen}
            title="Couldn’t load shipments"
            description="The server is unavailable. Please try again in a moment."
          />
        ) : shipments.content.length > 0 ? (
          <>
            <ShipmentsTable shipments={shipments.content} />
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                Showing {page * shipments.size + 1}–
                {page * shipments.size + shipments.content.length} of{" "}
                {shipments.totalElements}
              </p>
              <div className="flex gap-2">
                <PageLink
                  page={page - 1}
                  disabled={page === 0}
                  label="Previous page"
                >
                  <ChevronLeft />
                </PageLink>
                <PageLink
                  page={page + 1}
                  disabled={page >= shipments.totalPages - 1}
                  label="Next page"
                >
                  <ChevronRight />
                </PageLink>
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
