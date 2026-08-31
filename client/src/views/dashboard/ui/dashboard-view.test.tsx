import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Shipment } from "@entities/shipment";
// Imported from the model directly: the entity barrel also re-exports the
// server-only user API, which cannot be loaded in the test environment.
import { UserEntity } from "@entities/user/model/entity";
import { DashboardView } from "./dashboard-view";

const user = new UserEntity({
  id: "3f1a0a3e-0f6f-4f2e-8f5a-0f6f4f2e8f5a",
  email: "ada@delvex.test",
  firstName: "Ada",
  lastName: "Lovelace",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

function shipment(overrides: Partial<Shipment> & { id: string }): Shipment {
  return {
    referenceNumber: `DVX-${overrides.id}`,
    status: "CREATED",
    originCountry: "Poland",
    originCity: "Wrocław",
    originPostalCode: "50-001",
    originAddress: "Rynek 1",
    destinationCountry: "Germany",
    destinationCity: "Berlin",
    destinationPostalCode: "10115",
    destinationAddress: "Alexanderplatz 1",
    cargoDescription: "Pallets",
    weightKg: 120,
    pickupAt: null,
    deliveryAt: null,
    version: 0,
    createdAt: "2026-08-30T10:00:00Z",
    updatedAt: "2026-08-30T10:00:00Z",
    ...overrides,
  };
}

describe("DashboardView", () => {
  it("shows at most ten recent shipments and formats their cells", () => {
    const shipments = Array.from({ length: 12 }, (_, index) =>
      shipment({
        id: `${index}`,
        status: index === 0 ? "IN_TRANSIT" : "CREATED",
        pickupAt: index === 0 ? "2026-09-02T08:30:00Z" : null,
      }),
    );

    render(
      <DashboardView user={user} shipments={shipments} totalShipments={12} />,
    );

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(10);

    const firstRow = within(rows[0]);
    expect(firstRow.getByRole("link", { name: /DVX-0/ })).toHaveAttribute(
      "href",
      "/shipments/0",
    );
    expect(firstRow.getByText("In transit")).toBeInTheDocument();
    expect(firstRow.getByText("Sep 2, 2026")).toBeInTheDocument();
    expect(within(rows[1]).getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders the empty state instead of the table when there is nothing yet", () => {
    render(<DashboardView user={user} shipments={[]} totalShipments={0} />);

    expect(screen.getByText("No shipments yet")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Create shipment/ }),
    ).toHaveAttribute("href", "/shipments/create");
  });
});
