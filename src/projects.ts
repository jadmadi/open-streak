import { ProjectRow } from "./db.js";
import { compactNumber, formatPath } from "./stats.js";

export function renderProjects(projects: ProjectRow[], colors: boolean): string[] {
  if (projects.length === 0) return ["  No project data available."];

  const reset = "\u001b[0m";
  const bold = (text: string) => (colors ? `\u001b[1m${text}${reset}` : text);
  const muted = (text: string) => (colors ? `\u001b[38;5;245m${text}${reset}` : text);

  const maxTokens = Math.max(...projects.map((p) => p.tokens));
  const lines = [
    "",
    `  ${bold("Project Activity")}`,
    "",
  ];

  for (const project of projects) {
    const bar = maxTokens > 0 ? Math.round((project.tokens / maxTokens) * 25) : 0;
    const barStr = "█".repeat(bar) + "░".repeat(25 - bar);
    const dir = formatPath(project.directory ?? "unknown");
    lines.push(
      `  ${dir.padEnd(35)} ${muted(barStr)} ${compactNumber(project.tokens)} tokens  ${project.sessions} sessions`
    );
  }

  lines.push("");
  return lines;
}
