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

  // Month labels — each week column = 1 char
  const monthLine: string[] = Array.from({ length: weeks }, () => " ");
  let lastMonth = -1;
  for (let week = 0; week < weeks; week += 1) {
    const date = addDays(firstSunday, week * 7);
    if (date.getMonth() !== lastMonth) {
      const label = date.toLocaleString("en", { month: "short" });
      for (let offset = 0; offset < label.length && (week + offset) < monthLine.length; offset += 1) {
        monthLine[week + offset] = label[offset];
      }
      lastMonth = date.getMonth();
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
