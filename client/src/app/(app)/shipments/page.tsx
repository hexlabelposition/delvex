import { ShipmentsPage } from "@pages/shipments";
import { createPageMetadata } from "@shared/config/site-metadata";

export const metadata = createPageMetadata({
  title: "Shipments",
  description: "Browse and manage your Delvex shipments.",
  path: "/shipments",
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const { created, deleted, page } = await searchParams;

  return (
    <ShipmentsPage
      page={Math.max(0, Number(page) || 0)}
      created={created === "1"}
      deleted={deleted === "1"}
    />
  );
}
