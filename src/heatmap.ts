import { DayActivity, activityThresholds, activityLevel, startOfToday, addDays, localDay } from "./stats.js";
import { theme, heatCell, heatCellToday } from "./theme.js";

export function renderHeatmap(
  activity: Map<string, DayActivity>,
  weeks: number,
  colors: boolean
): string[] {
  const today = startOfToday();
  const thisSunday = addDays(today, -today.getDay());
  const firstSunday = addDays(thisSunday, -(weeks - 1) * 7);
  const thresholds = activityThresholds(activity);

  const monthStarts: { week: number; label: string }[] = [];
  let lastMonth = -1;
  for (let week = 0; week < weeks; week += 1) {
    const date = addDays(firstSunday, week * 7);
    if (date.getMonth() !== lastMonth) {
      const label = date.toLocaleString("en", { month: "short" });
      monthStarts.push({ week, label });
      lastMonth = date.getMonth();
    }
  }

  const monthLine: string[] = Array.from({ length: weeks }, () => " ");
  for (let i = 0; i < monthStarts.length; i += 1) {
    const { week, label } = monthStarts[i];
    const nextWeek = monthStarts[i + 1]?.week ?? weeks;
    const available = nextWeek - week;
    const visible = label.slice(0, Math.max(1, Math.min(label.length, available)));
    for (let offset = 0; offset < visible.length; offset += 1) {
      monthLine[week + offset] = visible[offset];
    }
  }

  const dim = (s: string) => theme.dim(s, colors);
  const dimmer = (s: string) => theme.dimmer(s, colors);

  const dayLabels = ["   ", dim("Mon"), "   ", dim("Wed"), "   ", dim("Fri"), "   "];
  const lines: string[] = [
    `      ${dimmer(monthLine.join(""))}`,
  ];

  for (let weekday = 0; weekday < 7; weekday += 1) {
    let row = `  ${dayLabels[weekday]} `;
    for (let week = 0; week < weeks; week += 1) {
      const date = addDays(firstSunday, week * 7 + weekday);
      const isToday = date.getTime() === today.getTime();
      if (date > today) {
        row += " ";
      } else if (isToday) {
        row += heatCellToday(colors);
      } else {
        row += heatCell(activityLevel(activity.get(localDay(date)), thresholds), colors);
      }
    }
    lines.push(row);
  }

  const legend = [0, 1, 2, 3, 4].map((level) => heatCell(level, colors)).join(" ");
  lines.push(`      ${dim("Less")} ${legend} ${dim("More")}`);
  return lines;
}
