import { EmployeePage } from "@pages/employee-shipments";
import type { ShipmentStatus } from "@shared/api";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Employee operations",
  description: "Process shipments assigned to the current branch.",
  path: "/employee",
});

const statuses: readonly ShipmentStatus[] = [
  "CREATED",
  "ACCEPTED_AT_ORIGIN",
  "IN_TRANSIT",
  "ARRIVED_AT_DESTINATION",
  "DELIVERED",
  "CANCELLED",
];

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const { page, reference, status } = await searchParams;
  const selectedStatus =
    typeof status === "string" && statuses.includes(status as ShipmentStatus)
      ? (status as ShipmentStatus)
      : "";

  return (
    <EmployeePage
      page={Math.max(0, Number(page) || 0)}
      status={selectedStatus}
      reference={typeof reference === "string" ? reference.trim() : ""}
    />
  );
}
