import {
  DEFAULT_PAGE_SIZE,
  normalizePageSize,
  ShipmentsView,
} from "@views/shipments";
import { createMetadata, parseIntegerParam } from "@shared/lib";
import { routes } from "@shared/config";
import { getAllShipments } from "@entities/shipment/server";

export const metadata = createMetadata({
  title: "Shipments",
  description: "Browse and manage your Delvex shipments.",
  path: routes.shipments,
});

interface ShipmentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShipmentsPage({
  searchParams,
}: ShipmentsPageProps) {
  const { page: pageParam, size: sizeParam } = await searchParams;

  // The URL is one-based so that ?page=1 is the first page; the API is not.
  const page = Math.max(parseIntegerParam(pageParam, 1), 1);
  const size = normalizePageSize(
    parseIntegerParam(sizeParam, DEFAULT_PAGE_SIZE),
  );

  const shipments = await getAllShipments({ page: page - 1, size });

  return <ShipmentsView shipments={shipments} page={page} size={size} />;
}
