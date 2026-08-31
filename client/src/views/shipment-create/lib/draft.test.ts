import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ShipmentFormValues } from "@features/shipment-form";
import { clearDraft, readDraft, writeDraft } from "./draft";

// jsdom in this setup exposes sessionStorage but not localStorage, so the tests
// bring their own Storage; the module only ever talks to that interface.
function memoryStorage() {
  const entries = new Map<string, string>();

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
    clear: () => entries.clear(),
    key: () => null,
    length: 0,
  };
}

const values: ShipmentFormValues = {
  originLocationId: "WROCLAW",
  destinationLocationId: "WARSAW",
  cargoDescription: "Documents",
  weightKg: "10",
  pickupAt: "",
};

beforeEach(() => {
  vi.stubGlobal("localStorage", memoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("shipment draft", () => {
  it("round-trips the form values", () => {
    writeDraft(values);

    expect(readDraft()).toEqual(values);
  });

  it("forgets a draft that holds nothing", () => {
    writeDraft({
      originLocationId: "",
      destinationLocationId: "",
      cargoDescription: "",
      weightKg: "",
      pickupAt: "",
    });

    expect(readDraft()).toBeNull();
  });

  it("ignores anything that is not a usable draft", () => {
    localStorage.setItem("delvex:new-shipment-draft", "{not json");
    expect(readDraft()).toBeNull();

    localStorage.setItem("delvex:new-shipment-draft", '"a string"');
    expect(readDraft()).toBeNull();

    localStorage.setItem(
      "delvex:new-shipment-draft",
      JSON.stringify({ cargoDescription: 42, weightKg: "5" }),
    );
    expect(readDraft()).toMatchObject({ cargoDescription: "", weightKg: "5" });
  });

  it("survives storage that throws", () => {
    vi.stubGlobal("localStorage", {
      ...memoryStorage(),
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    });

    expect(() => writeDraft(values)).not.toThrow();
    expect(readDraft()).toBeNull();
  });

  it("removes the draft", () => {
    writeDraft(values);
    clearDraft();

    expect(readDraft()).toBeNull();
  });
});
