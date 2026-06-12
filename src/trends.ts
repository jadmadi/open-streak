import { DailyRow } from "./db.js";
import { compactNumber } from "./stats.js";
import { theme, gradientBar, padR, padL } from "./theme.js";

const sparkChars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

export function renderTrends(daily: DailyRow[], c: boolean): string[] {
  if (daily.length === 0) return [theme.dim("  No activity data available.", c)];

  const weeks: { start: string; tokens: number; days: number }[] = [];
  let currentWeek: { start: string; tokens: number; days: number } | null = null;

  for (const day of daily) {
    const date = new Date(`${day.day}T00:00:00`);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());

    const weekKey = weekStart.toISOString().slice(0, 10);
    if (!currentWeek || currentWeek.start !== weekKey) {
      if (currentWeek) weeks.push(currentWeek);
      currentWeek = { start: weekKey, tokens: 0, days: 0 };
    }
    currentWeek.tokens += day.tokens;
    currentWeek.days += 1;
  }
  if (currentWeek) weeks.push(currentWeek);

  const maxTokens = Math.max(...weeks.map((w) => w.tokens));
  const trendUp = weeks.length >= 2 && weeks[weeks.length - 1].tokens >= weeks[weeks.length - 2].tokens;
  const trendColor = trendUp ? theme.green : theme.red;

  const sparkline = weeks
    .map((w) => {
      const level = maxTokens > 0 ? Math.min(7, Math.floor((w.tokens / maxTokens) * 7)) : 0;
      return sparkChars[level];
    })
    .join("");

  // Trend % change
  let trendPct = "";
  if (weeks.length >= 2) {
    const prev = weeks[weeks.length - 2].tokens;
    const curr = weeks[weeks.length - 1].tokens;
    if (prev > 0) {
      const pct = ((curr - prev) / prev) * 100;
      trendPct = trendUp ? ` ▲${Math.abs(pct).toFixed(0)}%` : ` ▼${Math.abs(pct).toFixed(0)}%`;
    }
  }

  const totalTokens = daily.reduce((s, d) => s + d.tokens, 0);
  const totalCost = daily.reduce((s, d) => s + d.cost, 0);
  const activeDays = daily.filter((d) => d.turns > 0).length;
  const avgDay = activeDays > 0 ? Math.round(totalTokens / activeDays) : 0;

  const border = theme.box.h.repeat(50);
  const lines: string[] = [
    "",
    `  ${theme.box.tl}${border}${theme.box.tr}`,
    `  ${theme.box.v} ${theme.bold("WEEKLY TREND", c)}${" ".repeat(22)}${theme.box.v}`,
    `  ${theme.box.ml}${border}${theme.box.mr}`,
    `  ${theme.box.v}  ${trendColor(sparkline, c)}${trendColor(trendPct, c)}${" ".repeat(Math.max(0, 46 - sparkline.length - trendPct.length))} ${theme.box.v}`,
    `  ${theme.box.ml}${border}${theme.box.mr}`,
    `  ${theme.box.v} ${theme.bold("SUMMARY", c)}${" ".repeat(40)}${theme.box.v}`,
    `  ${theme.box.v}                                              ${theme.box.v}`,
    `  ${theme.box.v}  ${theme.dim("TOTAL TOKENS", c)}  ${theme.white(padL(compactNumber(totalTokens), 14), c)}                    ${theme.box.v}`,
    `  ${theme.box.v}  ${theme.dim("TOTAL COST  ", c)}  ${theme.costColor(totalCost)(padL(`$${totalCost.toFixed(4)}`, 14), c)}                    ${theme.box.v}`,
    `  ${theme.box.v}  ${theme.dim("ACTIVE DAYS ", c)}  ${theme.white(padL(String(activeDays), 14), c)}                    ${theme.box.v}`,
    `  ${theme.box.v}  ${theme.dim("AVG/DAY     ", c)}  ${theme.white(padL(compactNumber(avgDay), 14), c)}                    ${theme.box.v}`,
    `  ${theme.box.v}                                              ${theme.box.v}`,
    `  ${theme.box.bl}${border}${theme.box.br}`,
    "",
  ];

  return lines;
}
