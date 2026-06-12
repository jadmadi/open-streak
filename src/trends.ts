import { DailyRow } from "./db.js";
import { compactNumber } from "./stats.js";

const sparkChars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

export function renderTrends(daily: DailyRow[], colors: boolean): string[] {
  if (daily.length === 0) return ["  No activity data available."];

  const reset = "\u001b[0m";
  const bold = (text: string) => (colors ? `\u001b[1m${text}${reset}` : text);

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
  const sparkline = weeks
    .map((w) => {
      const level = maxTokens > 0 ? Math.min(7, Math.floor((w.tokens / maxTokens) * 7)) : 0;
      return sparkChars[level];
    })
    .join("");

  const totalTokens = daily.reduce((s, d) => s + d.tokens, 0);
  const totalCost = daily.reduce((s, d) => s + d.cost, 0);
  const activeDays = daily.filter((d) => d.turns > 0).length;

  const lines = [
    "",
    `  ${bold("Weekly Trend")}`,
    `  ${sparkline}`,
    "",
    `  ${bold("Summary")}`,
    `    Total tokens:  ${compactNumber(totalTokens)}`,
    `    Total cost:    $${totalCost.toFixed(4)}`,
    `    Active days:   ${activeDays}`,
    `    Avg/day:       ${activeDays > 0 ? compactNumber(Math.round(totalTokens / activeDays)) : "0"} tokens`,
    "",
  ];

  return lines;
}
