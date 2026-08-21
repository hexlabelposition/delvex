import { EmptyState } from "@shared/ui";
import { PackageSearch } from "lucide-react";
import type { ReactNode } from "react";

export function EmployeeShipmentsState({
  error,
  hasShipments,
  children,
}: {
  error: boolean;
  hasShipments: boolean;
  children: ReactNode;
}) {
  if (error) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Couldn’t load shipments"
        description="The branch queue is unavailable. Please try again in a moment."
      />
    );
  }

  if (!hasShipments) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No matching shipments"
        description="Scan another reference or change the queue filter."
      />
    );
  }

  return children;
}
