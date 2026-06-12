import { execSync } from "node:child_process";

const R = "\u001b[0m";

// Detect terminal background: true = dark, false = light
function detectDarkBg(): boolean {
  const term = process.env.TERM_PROGRAM ?? process.env.TERM ?? "";
  const fgBg = process.env.COLORFGBG ?? "";

  // COLORFGBG = "fg;bg" — if bg is 0-6 or 16-51 it's dark
  if (fgBg) {
    const parts = fgBg.split(";");
    const bg = parseInt(parts[parts.length - 1] ?? "0", 10);
    if (!isNaN(bg)) return bg <= 6 || bg >= 16;
  }

  // Try tput bg
  try {
    const cap = execSync("tput bg 2>/dev/null", { encoding: "utf8", timeout: 500 }).trim();
    if (cap === "light") return false;
  } catch {}

  // Check common terminal env vars
  const bg = process.env.MOCHA_BG ?? process.env.BACKGROUND ?? "";
  if (bg === "light") return false;

  // Default: dark
  return true;
}

const isDark = detectDarkBg();

// WCAG AAA compliant palettes (7:1 contrast ratio)
const palette = isDark ? {
  green:   [57, 211, 83] as RGB,
  yellow:  [229, 181, 57] as RGB,
  red:     [255, 123, 114] as RGB,
  blue:    [121, 192, 255] as RGB,
  teal:    [80, 220, 200] as RGB,
  amber:   [229, 181, 57] as RGB,
  white:   [230, 237, 243] as RGB,
  bright:  [255, 255, 255] as RGB,
} : {
  green:   [0, 109, 50] as RGB,
  yellow:  [145, 100, 10] as RGB,
  red:     [190, 40, 30] as RGB,
  blue:    [15, 82, 186] as RGB,
  teal:    [13, 125, 115] as RGB,
  amber:   [145, 100, 10] as RGB,
  white:   [30, 34, 42] as RGB,
  bright:  [0, 0, 0] as RGB,
};

type RGB = [number, number, number];

const heatRamp: RGB[] = isDark ? [
  [30, 34, 42],    // empty
  [14, 68, 41],    // level 1
  [0, 109, 50],    // level 2
  [38, 166, 65],   // level 3
  [57, 211, 83],   // level 4
] : [
  [220, 224, 230],  // empty
  [187, 222, 199],  // level 1
  [121, 192, 145],  // level 2
  [57, 170, 85],    // level 3
  [0, 140, 50],     // level 4
];

const gradientRamp: { start: RGB; end: RGB } = isDark ? {
  start: [14, 68, 41],
  end:   [57, 211, 83],
} : {
  start: [121, 192, 145],
  end:   [0, 109, 50],
};

function fg(c: RGB): string {
  return `\u001b[38;2;${c[0]};${c[1]};${c[2]}m`;
}

const dim256 = isDark ? 188 : 102;
const dimmer256 = isDark ? 145 : 137;

function ansi256(code: number): string {
  return `\u001b[38;5;${code}m`;
}

function wrap(color: string, s: string): string {
  return `${color}${s}${R}`;
}

export const theme = {
  green:   (s: string, c: boolean) => c ? wrap(fg(palette.green), s) : s,
  yellow:  (s: string, c: boolean) => c ? wrap(fg(palette.yellow), s) : s,
  red:     (s: string, c: boolean) => c ? wrap(fg(palette.red), s) : s,
  blue:    (s: string, c: boolean) => c ? wrap(fg(palette.blue), s) : s,
  teal:    (s: string, c: boolean) => c ? wrap(fg(palette.teal), s) : s,
  amber:   (s: string, c: boolean) => c ? wrap(fg(palette.amber), s) : s,
  dim:     (s: string, c: boolean) => c ? wrap(ansi256(dim256), s) : s,
  dimmer:  (s: string, c: boolean) => c ? wrap(ansi256(dimmer256), s) : s,
  bold:    (s: string, c: boolean) => c ? `\u001b[1m${s}${R}` : s,
  white:   (s: string, c: boolean) => c ? wrap(fg(palette.white), s) : s,
  bright:  (s: string, c: boolean) => c ? wrap(fg(palette.bright), s) : s,

  costColor: (cost: number) => {
    if (cost <= 0) return theme.dim;
    if (cost < 1) return theme.teal;
    if (cost < 10) return theme.amber;
    return theme.red;
  },
};

const blocks = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];

export function gradientBar(ratio: number, width: number, c: boolean): string {
  const r = Math.max(0, Math.min(1, ratio));
  const filled = r * width;
  const full = Math.floor(filled);
  const partial = Math.round((filled - full) * 8);
  const empty = width - full - (partial > 0 ? 1 : 0);

  let bar = "";
  if (c) {
    const [sr, sg, sb] = gradientRamp.start;
    const [er, eg, eb] = gradientRamp.end;
    for (let i = 0; i < full; i++) {
      const t = width > 1 ? i / (width - 1) : 0;
      const ri = Math.round(sr + t * (er - sr));
      const g = Math.round(sg + t * (eg - sg));
      const b = Math.round(sb + t * (eb - sb));
      bar += `\u001b[38;2;${ri};${g};${b}m█${R}`;
    }
    if (partial > 0) {
      const t = width > 1 ? full / (width - 1) : 0;
      const ri = Math.round(sr + t * (er - sr));
      const g = Math.round(sg + t * (eg - sg));
      const b = Math.round(sb + t * (eb - sb));
      bar += `\u001b[38;2;${ri};${g};${b}m${blocks[partial]}${R}`;
    }
  } else {
    bar = "█".repeat(full) + (partial > 0 ? blocks[partial] : "");
  }
  bar += "░".repeat(Math.max(0, empty));
  return bar;
}

export function heatCell(level: number, c: boolean): string {
  if (!c) return ["·", "░", "▒", "▓", "█"][level];
  const [r, g, b] = heatRamp[level];
  return `\u001b[38;2;${r};${g};${b}m■${R}`;
}

export function heatCellToday(c: boolean): string {
  if (!c) return "◈";
  const [r, g, b] = palette.green;
  return `\u001b[38;2;${r};${g};${b};1m◈${R}`;
}

export function visibleLen(s: string): number {
  return s.replace(/\u001b\[[0-9;]*m/g, "").length;
}
