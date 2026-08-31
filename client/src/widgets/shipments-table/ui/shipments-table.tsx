"use client";

import { useTable } from "@tanstack/react-table";
import { cn } from "tailwind-variants";
import type { Shipment } from "@entities/shipment";
import { Card, Table, Tooltip } from "@shared/ui";

import { shipmentColumns, shipmentTableFeatures } from "../model/columns";

interface ShipmentsTableProps {
  shipments: Shipment[];
}

export function ShipmentsTable({ shipments }: ShipmentsTableProps) {
  const table = useTable({
    features: shipmentTableFeatures,
    columns: shipmentColumns,
    data: shipments,
    getRowId: (shipment) => shipment.id,
  });

  return (
    <Tooltip.Provider>
      <Card.Root className="gap-0 overflow-hidden py-0">
        <Table.Root>
          <Table.Header className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <Table.Head
                    key={header.id}
                    className={cn(
                      "text-muted-foreground px-4 text-xs font-medium",
                      header.column.columnDef.meta?.className,
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </Table.Head>
                ))}
              </Table.Row>
            ))}
          </Table.Header>

          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                key={row.id}
                className="focus-within:bg-muted/50 relative"
              >
                {row.getAllCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    className={cn(
                      "px-4 py-3",
                      cell.column.columnDef.meta?.className,
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card.Root>
    </Tooltip.Provider>
  );
}
