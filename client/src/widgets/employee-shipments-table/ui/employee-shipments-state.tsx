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
        description="The server is unavailable. Please try again in a moment."
      />
    );
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
