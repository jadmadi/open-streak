import { describe, it } from "node:test";
import assert from "node:assert";
import { renderHeatmap } from "../src/heatmap.js";
import { DayActivity } from "../src/stats.js";

describe("renderHeatmap", () => {
  it("renders without crashing for empty activity", () => {
    const activity = new Map<string, DayActivity>();
    const lines = renderHeatmap(activity, 8, false);
    assert.ok(lines.length > 0);
    assert.ok(lines.some((l) => l.includes("Less")));
  });

  it("includes month labels", () => {
    const activity = new Map<string, DayActivity>();
    const lines = renderHeatmap(activity, 52, false);
    const monthLine = lines[0];
    // Should contain some month abbreviations (e.g. Jan, Feb, etc.)
    assert.match(monthLine, /[A-Z][a-z]{2}/);
  });

  it("does not overwrite month labels into a single string", () => {
    const activity = new Map<string, DayActivity>();
    const lines = renderHeatmap(activity, 8, false);
    const monthLine = lines[0].replace(/^\s+/, "");
    // The month line should not contain concatenated labels like "JunJul"
    assert.ok(!monthLine.includes("JunJul"));
    assert.ok(!monthLine.includes("JulAug"));
  });

  it("marks today with a diamond", () => {
    const today = new Date();
    const dayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const activity = new Map<string, DayActivity>([[dayStr, { tokens: 100, turns: 1 }]]);
    const lines = renderHeatmap(activity, 4, false);
    assert.ok(lines.some((l) => l.includes("◈")));
  });
});
