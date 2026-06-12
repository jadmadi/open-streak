import { visibleLen } from "./theme.js";

export const BOX_WIDTH = 72;

const B = {
  tl: "╭", tr: "╮", bl: "╰", br: "╯",
  h: "─", v: "│", ml: "├", mr: "┤",
};

const INNER = BOX_WIDTH - 2;

function sep(char: string): string {
  return char.repeat(INNER);
}

function border(left: string, h: string, right: string): string {
  return `${left}${sep(h)}${right}`;
}

export function top(): string {
  return `  ${border(B.tl, B.h, B.tr)}`;
}

export function mid(): string {
  return `  ${border(B.ml, B.h, B.mr)}`;
}

export function bottom(): string {
  return `  ${border(B.bl, B.h, B.br)}`;
}

export function row(inner: string): string {
  const vl = visibleLen(inner);
  const pad = Math.max(0, INNER - vl);
  return `  ${B.v} ${inner}${" ".repeat(pad)} ${B.v}`;
}

export function truncate(s: string, maxLen: number): string {
  if (visibleLen(s) <= maxLen) return s;
  // strip ANSI, truncate, re-wrap — but simpler: just cut raw chars
  const stripped = s.replace(/\u001b\[[0-9;]*m/g, "");
  const cut = stripped.slice(0, maxLen - 1) + "…";
  return cut;
}

// Fixed-width column builder
export function col(content: string, width: number, align: "left" | "right" = "left"): string {
  const vl = visibleLen(content);
  if (vl > width) return truncate(content, width);
  const pad = width - vl;
  return align === "left" ? content + " ".repeat(pad) : " ".repeat(pad) + content;
}
