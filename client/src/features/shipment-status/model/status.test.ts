import { describe, expect, it } from "vitest";

import { allowedNextStatuses, statusActionLabel } from "./status";

describe("employee shipment transitions", () => {
  it.each([
    ["CREATED", ["ACCEPTED_AT_ORIGIN", "CANCELLED"]],
    ["ACCEPTED_AT_ORIGIN", ["IN_TRANSIT", "CANCELLED"]],
    ["IN_TRANSIT", ["ARRIVED_AT_DESTINATION"]],
    ["ARRIVED_AT_DESTINATION", ["DELIVERED"]],
    ["DELIVERED", []],
    ["CANCELLED", []],
  ] as const)("maps %s to allowed next statuses", (status, expected) => {
    expect(allowedNextStatuses(status)).toEqual(expected);
  });

  it("provides action labels for lifecycle controls", () => {
    expect(statusActionLabel("ACCEPTED_AT_ORIGIN")).toBe("Accept shipment");
    expect(statusActionLabel("ARRIVED_AT_DESTINATION")).toBe(
      "Receive at destination",
    );
    expect(statusActionLabel("DELIVERED")).toBe("Mark delivered");
  });
});
