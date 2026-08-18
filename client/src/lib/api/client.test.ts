import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiClient, ApiClientError, isConflictError } from "@/lib/api/client";

describe("ApiClient", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("preserves server field errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            timestamp: new Date(0).toISOString(),
            status: 400,
            error: "Bad Request",
            message: "Validation failed",
            path: "/api/shipments",
            fieldErrors: { weightKg: "Must be positive" },
          }),
          { status: 400 },
        ),
      ),
    );

    await expect(
      new ApiClient("https://api.test").get("/api/shipments"),
    ).rejects.toMatchObject({
      fieldErrors: { weightKg: "Must be positive" },
      status: 400,
    });
  });

  it("identifies optimistic locking conflicts", () => {
    const conflict = new ApiClientError({
      timestamp: new Date(0).toISOString(),
      status: 409,
      error: "Conflict",
      message: "Shipment was updated",
      path: "/api/employee/shipments/id/status",
      fieldErrors: {},
    });

    expect(isConflictError(conflict)).toBe(true);
    expect(isConflictError(new Error("other"))).toBe(false);
  });
});
