import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Shipment, ShipmentPage } from "@entities/shipment";
import { ShipmentsView } from "./shipments-view";

function shipment(index: number): Shipment {
  return {
    id: `${index}`,
    referenceNumber: `DVX-10${index}`,
    status: index % 2 === 0 ? "IN_TRANSIT" : "CREATED",
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
  };
}

function page(overrides: Partial<ShipmentPage> = {}): ShipmentPage {
  return {
    content: Array.from({ length: 10 }, (_, index) => shipment(index)),
    page: 0,
    size: 10,
    totalElements: 42,
    totalPages: 5,
    ...overrides,
  };
}

describe("ShipmentsView", () => {
  it("renders the current page of shipments with its range and pagination", () => {
    render(<ShipmentsView shipments={page()} page={2} size={10} />);

    expect(screen.getByText("Showing 11–20 of 42")).toBeInTheDocument();
    expect(screen.getAllByRole("row").slice(1)).toHaveLength(10);

    const pagination = screen.getByRole("navigation", { name: "pagination" });
    expect(
      within(pagination).getByRole("link", { name: "Go to page 2" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(pagination).getByRole("link", { name: "Go to previous page" }),
    ).toHaveAttribute("href", "/shipments");

    expect(
      screen.getByRole("link", { name: "Open shipment DVX-100" }),
    ).toHaveAttribute("href", "/shipments/0");
    expect(
      screen.getByRole("link", { name: "Edit shipment DVX-100" }),
    ).toHaveAttribute("href", "/shipments/0/edit");
  });

  it("marks the active page size and resets to the first page", () => {
    render(<ShipmentsView shipments={page()} page={2} size={10} />);

    expect(screen.getByRole("link", { name: "10" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "25" })).toHaveAttribute(
      "href",
      "/shipments?size=25",
    );
  });

  it("offers a way back when the page is past the end of the list", () => {
    render(
      <ShipmentsView
        shipments={page({ content: [], totalPages: 5 })}
        page={999}
        size={10}
      />,
    );

    expect(screen.getByText("No shipments on this page")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to the first page/ }),
    ).toHaveAttribute("href", "/shipments");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("invites the first shipment when the account has none", () => {
    render(
      <ShipmentsView
        shipments={page({ content: [], totalElements: 0, totalPages: 0 })}
        page={1}
        size={10}
      />,
    );

    expect(screen.getByText("No shipments yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Create shipment/ }),
    ).toHaveAttribute("href", "/shipments/create");
  });
});
