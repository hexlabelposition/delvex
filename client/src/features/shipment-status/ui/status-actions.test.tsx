import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StatusActions } from "./status-actions";

describe("StatusActions", () => {
  it("renders only the actions allowed for the current status", async () => {
    const onSelect = vi.fn();
    render(<StatusActions status="CREATED" onSelect={onSelect} />);

    expect(
      screen.getByRole("button", { name: "Accept shipment" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancel shipment" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark delivered" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Accept shipment" }),
    );
    expect(onSelect).toHaveBeenCalledWith("ACCEPTED_AT_ORIGIN");
  });

  it.each(["DELIVERED", "CANCELLED"] as const)(
    "does not allow changes from %s",
    (status) => {
      render(<StatusActions status={status} onSelect={vi.fn()} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    },
  );
});
