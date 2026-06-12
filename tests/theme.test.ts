import { describe, it } from "node:test";
import assert from "node:assert";
import { visibleLen, gradientBar, heatCell, heatCellToday } from "../src/theme.js";

describe("visibleLen", () => {
  it("counts plain text correctly", () => {
    assert.strictEqual(visibleLen("hello"), 5);
  });

  it("ignores ANSI codes", () => {
    assert.strictEqual(visibleLen("\u001b[38;2;255;0;0mhello\u001b[0m"), 5);
  });
});

describe("gradientBar", () => {
  it("returns requested width", () => {
    const bar = gradientBar(0.5, 10, false);
    assert.strictEqual(bar.length, 10);
  });

  it("is empty for zero ratio", () => {
    const bar = gradientBar(0, 8, false);
    assert.strictEqual(bar, "░░░░░░░░");
  });

  it("is full for max ratio", () => {
    const bar = gradientBar(1, 8, false);
    assert.strictEqual(bar, "████████");
  });
});

describe("heatCell", () => {
  it("returns plain characters when colors disabled", () => {
    assert.strictEqual(heatCell(0, false), "·");
    assert.strictEqual(heatCell(4, false), "█");
  });
});

describe("heatCellToday", () => {
  it("returns diamond when colors disabled", () => {
    assert.strictEqual(heatCellToday(false), "◈");
  });
});
