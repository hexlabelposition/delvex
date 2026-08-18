import { PackageSearch } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/empty-state";

export function EmployeeShipmentsState({
  error,
  loading,
  hasShipments,
  children,
}: {
  error: boolean;
  loading: boolean;
  hasShipments: boolean;
  children: ReactNode;
}) {
  if (error) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Couldn’t load shipments"
        description="The server is unavailable. Please try again in a moment."
      />
    );
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading shipments…</p>;
  }

  if (!hasShipments) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No matching shipments"
        description="Try changing the reference or status filter."
      />
    );
  }

  return children;
}
