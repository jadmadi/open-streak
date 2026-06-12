const R = "\u001b[0m";

export const theme = {
  green:   (s: string, c: boolean) => c ? `\u001b[38;2;57;211;83m${s}${R}` : s,
  yellow:  (s: string, c: boolean) => c ? `\u001b[38;2;210;153;34m${s}${R}` : s,
  red:     (s: string, c: boolean) => c ? `\u001b[38;2;248;81;73m${s}${R}` : s,
  blue:    (s: string, c: boolean) => c ? `\u001b[38;2;88;166;255m${s}${R}` : s,
  dim:     (s: string, c: boolean) => c ? `\u001b[38;5;245m${s}${R}` : s,
  bold:    (s: string, c: boolean) => c ? `\u001b[1m${s}${R}` : s,
  white:   (s: string, c: boolean) => c ? `\u001b[1;38;2;230;237;243m${s}${R}` : s,

  costColor: (cost: number) => {
    if (cost <= 0) return theme.dim;
    if (cost < 1) return theme.green;
    if (cost < 10) return theme.yellow;
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
    for (let i = 0; i < full; i++) {
      const t = width > 1 ? i / (width - 1) : 0;
      const ri = Math.round(26 + t * 31);
      const g = Math.round(127 + t * 84);
      const b = Math.round(50 + t * 1);
      bar += `\u001b[38;2;${ri};${g};${b}m█${R}`;
    }
    if (partial > 0) {
      const t = width > 1 ? full / (width - 1) : 0;
      const ri = Math.round(26 + t * 31);
      const g = Math.round(127 + t * 84);
      const b = Math.round(50 + t * 1);
      bar += `\u001b[38;2;${ri};${g};${b}m${blocks[partial]}${R}`;
    }
  } else {
    bar = "█".repeat(full) + (partial > 0 ? blocks[partial] : "");
  }
  bar += "░".repeat(Math.max(0, empty));
  return bar;
}

const heatColors = [
  [22, 27, 34],
  [14, 68, 41],
  [0, 109, 50],
  [38, 166, 65],
  [57, 211, 83],
];

export function heatCell(level: number, c: boolean): string {
  if (!c) return [" ", "░", "▒", "▓", "█"][level];
  const [r, g, b] = heatColors[level];
  return `\u001b[38;2;${r};${g};${b}m■${R}`;
}

export function visibleLen(s: string): number {
  return s.replace(/\u001b\[[0-9;]*m/g, "").length;
}
