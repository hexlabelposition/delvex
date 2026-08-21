import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEmployeeShipments: vi.fn(),
  requireSession: vi.fn(),
}));

vi.mock("@entities/shipment", () => ({
  getEmployeeShipments: mocks.getEmployeeShipments,
}));
vi.mock("@features/auth/server", () => ({
  requireSession: mocks.requireSession,
}));
vi.mock("@widgets/employee-shipments-table", () => ({
  EmployeeShipmentsState: ({ children }: { children: ReactNode }) => children,
  EmployeeShipmentsTable: () => <div>queue results</div>,
}));

import { EmployeePage } from "./employee-shipments-page";

describe("EmployeePage queue controls", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireSession.mockResolvedValue({
      accessToken: "employee-token",
      user: {
        role: "EMPLOYEE",
        branch: { code: "WROCLAW" },
      },
    });
    mocks.getEmployeeShipments.mockResolvedValue({
      content: [{ shipment: { id: "shipment-id" } }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
  });

  it("loads normalized filters and focuses the scanner input", async () => {
    render(
      await EmployeePage({
        page: 1,
        status: "IN_TRANSIT",
        reference: "DLX-42",
      }),
    );

    expect(mocks.getEmployeeShipments).toHaveBeenCalledWith("employee-token", {
      page: 1,
      size: 20,
      status: "IN_TRANSIT",
      reference: "DLX-42",
    });
    expect(screen.getByLabelText("Scan or enter reference")).toHaveFocus();
    expect(screen.getByRole("link", { name: "Incoming" })).toHaveAttribute(
      "href",
      "/employee?status=IN_TRANSIT&reference=DLX-42",
    );
  });

  it("preserves the reference when switching operational queues", async () => {
    render(
      await EmployeePage({
        page: 0,
        status: "CREATED",
        reference: "DLX-99",
      }),
    );

    expect(
      screen.getByRole("link", { name: "Ready for delivery" }),
    ).toHaveAttribute(
      "href",
      "/employee?status=ARRIVED_AT_DESTINATION&reference=DLX-99",
    );
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
      "href",
      "/employee?reference=DLX-99",
    );
  });
});
