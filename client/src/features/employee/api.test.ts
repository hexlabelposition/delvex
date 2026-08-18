import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/api/client", () => ({ apiClient: { get: mocks.get } }));

import { getEmployeeShipments } from "@/features/employee/api";

describe("getEmployeeShipments", () => {
  beforeEach(() => mocks.get.mockReset());

  it("normalizes filters and includes authorization", async () => {
    mocks.get.mockResolvedValue({ data: { content: [] } });

    await getEmployeeShipments("access-token", {
      page: 2,
      size: 50,
      status: "ACCEPTED",
      reference: "  DLV-42  ",
    });

    expect(mocks.get).toHaveBeenCalledWith(
      "/api/employee/shipments?page=2&size=50&status=ACCEPTED&reference=DLV-42",
      { accessToken: "access-token" },
    );
  });

  it("omits empty optional filters", async () => {
    mocks.get.mockResolvedValue({ data: { content: [] } });
    await getEmployeeShipments("access-token", { reference: "   " });
    expect(mocks.get).toHaveBeenCalledWith(
      "/api/employee/shipments?page=0&size=20",
      { accessToken: "access-token" },
    );
  });
});
