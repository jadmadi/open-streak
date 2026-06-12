import { DailyRow } from "./db.js";
import { compactNumber } from "./stats.js";
import { theme } from "./theme.js";
import { col } from "./box.js";

const sparkChars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
const VAL_W = 14;

export function renderTrends(daily: DailyRow[], c: boolean): string[] {
  if (daily.length === 0) return [theme.dim("No activity data available.", c)];

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

  return [
    theme.bold("WEEKLY TREND", c),
    "",
    trendColor(sparkline + trendPct, c),
    "",
    theme.bold("SUMMARY", c),
    "",
    `  ${theme.dim("⚡ Tokens", c)}  ${theme.bright(col(compactNumber(totalTokens), VAL_W, "right"), c)}`,
    `  ${theme.dim("$  Cost  ", c)}  ${theme.costColor(totalCost)(col(`$${totalCost.toFixed(2)}`, VAL_W, "right"), c)}`,
    `  ${theme.dim("●  Active", c)}  ${theme.green(col(String(activeDays), VAL_W, "right"), c)}`,
    `  ${theme.dim("↕  Avg/day", c)}  ${theme.white(col(compactNumber(avgDay), VAL_W, "right"), c)}`,
  ];
}
