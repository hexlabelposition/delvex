import { describe, expect, it } from "vitest";
import {
  fromDateValue,
  getEstimatedDelivery,
  isBusinessDay,
  toBusinessDay,
  toDateValue,
  toShipmentInstant,
} from "./schedule";

function localDate(value: string): Date {
  const date = fromDateValue(value);

  if (!date) {
    throw new Error(`Bad fixture date: ${value}`);
  }

  return date;
}

describe("getEstimatedDelivery", () => {
  it("adds five business days, skipping the weekend", () => {
    // Monday 7 Sep 2026 → Monday 14 Sep 2026.
    expect(toDateValue(getEstimatedDelivery(localDate("2026-09-07")))).toBe(
      "2026-09-14",
    );

    // Wednesday → the next Wednesday.
    expect(toDateValue(getEstimatedDelivery(localDate("2026-09-09")))).toBe(
      "2026-09-16",
    );

    // Friday → the next Friday.
    expect(toDateValue(getEstimatedDelivery(localDate("2026-09-11")))).toBe(
      "2026-09-18",
    );
  });
});

describe("business days", () => {
  it("recognises the weekend", () => {
    expect(isBusinessDay(localDate("2026-09-11"))).toBe(true);
    expect(isBusinessDay(localDate("2026-09-12"))).toBe(false);
    expect(isBusinessDay(localDate("2026-09-13"))).toBe(false);
  });

  it("moves a weekend date to the following Monday", () => {
    expect(toBusinessDay(localDate("2026-09-12"))).toEqual(
      localDate("2026-09-14"),
    );
    expect(toBusinessDay(localDate("2026-09-11"))).toEqual(
      localDate("2026-09-11"),
    );
  });
});

describe("toShipmentInstant", () => {
  it("schedules the date at local midday", () => {
    const instant = new Date(toShipmentInstant("2026-09-09"));

    expect(instant.getHours()).toBe(12);
    expect(instant.getMinutes()).toBe(0);
    expect(toDateValue(instant)).toBe("2026-09-09");
  });

  it("refuses anything that is not a plain date", () => {
    expect(() => toShipmentInstant("2026-09-09T10:00")).toThrow(TypeError);
  });
});
