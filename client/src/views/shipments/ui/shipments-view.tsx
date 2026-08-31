import Link from "next/link";
import {
  ArrowLeftIcon,
  CircleXIcon,
  ClockIcon,
  PackageCheckIcon,
  PackageOpenIcon,
  PlusIcon,
  TruckIcon,
} from "lucide-react";
import { countShipmentsByStatus, type ShipmentPage } from "@entities/shipment";
import { routes } from "@shared/config";
import { buttonVariants, Card, EmptyPanel, Pagination } from "@shared/ui";
import { ShipmentsTable } from "@widgets/shipments-table";

import { getPageWindow, shipmentsHref } from "../lib/pagination";
import { SHIPMENT_PAGE_SIZES } from "../model/page-size";

interface ShipmentsViewProps {
  shipments: ShipmentPage;
  /** One-based page taken from the URL. */
  page: number;
  size: number;
}

export function ShipmentsView({ shipments, page, size }: ShipmentsViewProps) {
  const { content, totalElements, totalPages } = shipments;
  const counts = countShipmentsByStatus(content);

  const from = (page - 1) * size + 1;
  const to = (page - 1) * size + content.length;

  const tiles = [
    { label: "Awaiting pickup", value: counts.awaitingPickup, Icon: ClockIcon },
    { label: "In transit", value: counts.inTransit, Icon: TruckIcon },
    { label: "Delivered", value: counts.delivered, Icon: PackageCheckIcon },
    { label: "Cancelled", value: counts.cancelled, Icon: CircleXIcon },
  ];

  return (
    <main className="flex flex-1 flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary text-sm font-medium">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Shipments
          </h1>
          <p className="text-muted-foreground mt-2">
            {totalElements} shipment{totalElements === 1 ? "" : "s"}, newest
            first
          </p>
        </div>

        <Link
          href={routes.createShipment}
          className={buttonVariants({ variant: "default" })}
        >
          <PlusIcon aria-hidden="true" /> New shipment
        </Link>
      </header>

      {content.length === 0 ? (
        totalElements === 0 ? (
          <EmptyPanel.Root>
            <EmptyPanel.Header>
              <EmptyPanel.Media>
                <PackageOpenIcon className="size-7" aria-hidden="true" />
              </EmptyPanel.Media>
              <EmptyPanel.Title>No shipments yet</EmptyPanel.Title>
              <EmptyPanel.Description>
                When you create a shipment, it lands here with its route,
                status, and schedule — newest first.
              </EmptyPanel.Description>
            </EmptyPanel.Header>

            <EmptyPanel.Content>
              <Link
                href={routes.createShipment}
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                Create shipment <PlusIcon aria-hidden="true" />
              </Link>
            </EmptyPanel.Content>
          </EmptyPanel.Root>
        ) : (
          <EmptyPanel.Root>
            <EmptyPanel.Header>
              <EmptyPanel.Media>
                <PackageOpenIcon className="size-7" aria-hidden="true" />
              </EmptyPanel.Media>
              <EmptyPanel.Title>No shipments on this page</EmptyPanel.Title>
              <EmptyPanel.Description>
                Page {page} is past the end of your list — you have{" "}
                {totalElements} shipment{totalElements === 1 ? "" : "s"} in
                total.
              </EmptyPanel.Description>
            </EmptyPanel.Header>

            <EmptyPanel.Content>
              <Link
                href={shipmentsHref({ page: 1, size })}
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                <ArrowLeftIcon aria-hidden="true" /> Back to the first page
              </Link>

              <Link
                href={routes.createShipment}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                New shipment <PlusIcon aria-hidden="true" />
              </Link>
            </EmptyPanel.Content>
          </EmptyPanel.Root>
        )
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tiles.map(({ label, value, Icon }) => (
                <Card.Root
                  key={label}
                  size="sm"
                  className="min-w-0 gap-0 px-(--card-spacing)"
                >
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      {label}
                    </dt>
                    <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                  <dd className="mt-2 text-2xl font-semibold tracking-tight">
                    {value}
                  </dd>
                </Card.Root>
              ))}
            </dl>

            <p className="text-muted-foreground text-xs">Counts on this page</p>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm">
                Showing {from}–{to} of {totalElements}
              </p>

              <div className="flex items-center gap-2">
                <span
                  className="text-muted-foreground text-xs"
                  id="rows-per-page"
                >
                  Rows per page
                </span>
                <div
                  className="flex items-center gap-1"
                  role="group"
                  aria-labelledby="rows-per-page"
                >
                  {SHIPMENT_PAGE_SIZES.map((pageSize) => (
                    <Link
                      key={pageSize}
                      href={shipmentsHref({ page: 1, size: pageSize })}
                      aria-current={pageSize === size ? "true" : undefined}
                      className={buttonVariants({
                        variant: pageSize === size ? "outline" : "ghost",
                        size: "sm",
                      })}
                    >
                      {pageSize}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <ShipmentsTable shipments={content} />

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                  Page {page} of {totalPages}
                </p>

                <Pagination.Root className="mx-0 w-auto justify-end">
                  <Pagination.Content>
                    <Pagination.Item>
                      <Pagination.Previous
                        href={shipmentsHref({
                          page: Math.max(page - 1, 1),
                          size,
                        })}
                        aria-disabled={page === 1}
                        tabIndex={page === 1 ? -1 : undefined}
                        className={
                          page === 1
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </Pagination.Item>

                    {getPageWindow(page, totalPages).map((item, index) => (
                      <Pagination.Item
                        key={item === "ellipsis" ? `ellipsis-${index}` : item}
                      >
                        {item === "ellipsis" ? (
                          <Pagination.Ellipsis />
                        ) : (
                          <Pagination.Link
                            href={shipmentsHref({ page: item, size })}
                            isActive={item === page}
                            aria-label={`Go to page ${item}`}
                          >
                            {item}
                          </Pagination.Link>
                        )}
                      </Pagination.Item>
                    ))}

                    <Pagination.Item>
                      <Pagination.Next
                        href={shipmentsHref({
                          page: Math.min(page + 1, totalPages),
                          size,
                        })}
                        aria-disabled={page >= totalPages}
                        tabIndex={page >= totalPages ? -1 : undefined}
                        className={
                          page >= totalPages
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </Pagination.Item>
                  </Pagination.Content>
                </Pagination.Root>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
