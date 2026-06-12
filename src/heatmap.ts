import { DayActivity, activityThresholds, activityLevel, startOfToday, addDays, localDay } from "./stats.js";
import { theme, heatCell } from "./theme.js";

export function renderHeatmap(
  activity: Map<string, DayActivity>,
  weeks: number,
  colors: boolean
): string[] {
  const today = startOfToday();
  const thisSunday = addDays(today, -today.getDay());
  const firstSunday = addDays(thisSunday, -(weeks - 1) * 7);
  const thresholds = activityThresholds(activity);
  const monthLine = Array.from({ length: weeks }, () => " ");
  let lastMonth = -1;

  for (let week = 0; week < weeks; week += 1) {
    const date = addDays(firstSunday, week * 7);
    if (date.getMonth() !== lastMonth) {
      const label = date.toLocaleString("en", { month: "short" });
      for (let offset = 0; offset < label.length && week + offset < monthLine.length; offset += 1) {
        monthLine[week + offset] = label[offset];
      }
      lastMonth = date.getMonth();
    }
  }

  const dim = (s: string) => theme.dim(s, colors);

  const labels = ["   ", dim("Mon"), "   ", dim("Wed"), "   ", dim("Fri"), "   "];
  const lines = [`       ${dim(monthLine.join(""))}`];
  for (let weekday = 0; weekday < 7; weekday += 1) {
    let row = `  ${labels[weekday]}  `;
    for (let week = 0; week < weeks; week += 1) {
      const date = addDays(firstSunday, week * 7 + weekday);
      row += date > today ? " " : heatCell(activityLevel(activity.get(localDay(date)), thresholds), colors);
    }
    lines.push(row);
  }

  const legend = [0, 1, 2, 3, 4].map((level) => heatCell(level, colors)).join("");
  lines.push(`       ${dim("Less")} ${legend} ${dim("More")}`);
  return lines;
}
