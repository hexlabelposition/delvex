import { describe, expect, it } from "vitest";

import {
  allowedNextStatuses,
  statusActionLabel,
} from "@/features/employee/status";

describe("employee shipment transitions", () => {
  it.each([
    ["CREATED", ["ACCEPTED", "CANCELLED"]],
    ["ACCEPTED", ["IN_TRANSIT", "CANCELLED"]],
    ["IN_TRANSIT", ["DELIVERED", "CANCELLED"]],
    ["DELIVERED", []],
    ["CANCELLED", []],
  ] as const)("maps %s to allowed next statuses", (status, expected) => {
    expect(allowedNextStatuses(status)).toEqual(expected);
  });

  it("provides action labels for lifecycle controls", () => {
    expect(statusActionLabel("ACCEPTED")).toBe("Accept shipment");
    expect(statusActionLabel("DELIVERED")).toBe("Mark delivered");
  });
});
