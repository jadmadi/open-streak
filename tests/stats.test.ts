import { describe, it, expect } from "vitest";
import { computeStreaks, localDay, addDays } from "../src/stats.js";

describe("localDay", () => {
  it("formats date as YYYY-MM-DD", () => {
    const date = new Date(2026, 0, 15);
    expect(localDay(date)).toBe("2026-01-15");
  });

  it("pads single-digit month and day", () => {
    const date = new Date(2026, 2, 5);
    expect(localDay(date)).toBe("2026-03-05");
  });
});

describe("addDays", () => {
  it("adds days correctly", () => {
    const date = new Date(2026, 0, 1);
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(6);
    expect(result.getMonth()).toBe(0);
  });

  it("does not mutate original", () => {
    const date = new Date(2026, 0, 1);
    addDays(date, 5);
    expect(date.getDate()).toBe(1);
  });
});

describe("computeStreaks", () => {
  it("returns 0 for empty set", () => {
    const result = computeStreaks(new Set());
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
  });

  it("computes current streak ending today", () => {
    const today = localDay(new Date());
    const yesterday = localDay(addDays(new Date(), -1));
    const twoDaysAgo = localDay(addDays(new Date(), -2));
    const days = new Set([today, yesterday, twoDaysAgo]);
    const result = computeStreaks(days);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it("computes longest streak across gaps", () => {
    const days = new Set([
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      "2026-06-10",
      "2026-06-11",
      "2026-06-12",
    ]);
    const result = computeStreaks(days);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it("finds longest streak in middle of history", () => {
    const days = new Set([
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
      "2026-01-04",
      "2026-01-05",
      "2026-01-10",
      "2026-01-11",
    ]);
    const result = computeStreaks(days);
    expect(result.longest).toBe(5);
  });
});
