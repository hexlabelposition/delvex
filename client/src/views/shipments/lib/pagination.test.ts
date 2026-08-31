import { describe, expect, it } from "vitest";
import { getPageWindow, shipmentsHref } from "./pagination";

describe("getPageWindow", () => {
  it("lists every page when they all fit", () => {
    expect(getPageWindow(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("collapses the tail while the current page is near the start", () => {
    expect(getPageWindow(2, 9)).toEqual([1, 2, 3, 4, "ellipsis", 9]);
  });

  it("collapses both sides around a middle page", () => {
    expect(getPageWindow(5, 9)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      9,
    ]);
  });

  it("collapses the head while the current page is near the end", () => {
    expect(getPageWindow(9, 9)).toEqual([1, "ellipsis", 6, 7, 8, 9]);
  });

  it("returns nothing when there are no pages", () => {
    expect(getPageWindow(1, 0)).toEqual([]);
  });
});

describe("shipmentsHref", () => {
  it("omits the default page and size", () => {
    expect(shipmentsHref({ page: 1, size: 10 })).toBe("/shipments");
  });

  it("keeps everything that differs from the default", () => {
    expect(shipmentsHref({ page: 3, size: 25 })).toBe(
      "/shipments?page=3&size=25",
    );
  });
});
