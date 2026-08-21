import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@pages/employee-shipments", () => ({
  EmployeePage: ({
    page,
    status,
    reference,
  }: {
    page: number;
    status: string;
    reference: string;
  }) => (
    <output
      data-testid="employee-page"
      data-page={page}
      data-status={status}
      data-reference={reference}
    />
  ),
}));
vi.mock("@shared/config/site-metadata", () => ({
  createPageMetadata: vi.fn(() => ({})),
}));

import Page from "./page";

describe("employee route filters", () => {
  it("passes branch lifecycle statuses and normalized search params", async () => {
    render(
      await Page({
        searchParams: Promise.resolve({
          page: "2",
          status: "ARRIVED_AT_DESTINATION",
          reference: "  DLX-42  ",
        }),
      }),
    );

    const page = screen.getByTestId("employee-page");
    expect(page).toHaveAttribute("data-page", "2");
    expect(page).toHaveAttribute("data-status", "ARRIVED_AT_DESTINATION");
    expect(page).toHaveAttribute("data-reference", "DLX-42");
  });

  it("rejects unknown statuses and negative page numbers", async () => {
    render(
      await Page({
        searchParams: Promise.resolve({
          page: "-5",
          status: "ACCEPTED",
        }),
      }),
    );

    const page = screen.getByTestId("employee-page");
    expect(page).toHaveAttribute("data-page", "0");
    expect(page).toHaveAttribute("data-status", "");
  });
});
