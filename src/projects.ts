import { ProjectRow } from "./db.js";
import { compactNumber } from "./stats.js";
import { theme, gradientBar, padR, padL } from "./theme.js";

function projectName(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

export function renderProjects(projects: ProjectRow[], c: boolean): string[] {
  if (projects.length === 0) return [theme.dim("  No project data available.", c)];

  const maxTokens = Math.max(...projects.map((p) => p.tokens));
  const totalTokens = projects.reduce((s, p) => s + p.tokens, 0);
  const totalSessions = projects.reduce((s, p) => s + p.sessions, 0);
  const W = 24;
  const border = theme.box.h.repeat(W + 44);

  const lines: string[] = [
    "",
    `  ${theme.box.tl}${border}${theme.box.tr}`,
    `  ${theme.box.v} ${theme.bold("PROJECT ACTIVITY", c)}${" ".repeat(W + 26)}${theme.box.v}`,
    `  ${theme.box.ml}${border}${theme.box.mr}`,
  ];

  for (const project of projects) {
    const pct = maxTokens > 0 ? project.tokens / maxTokens : 0;
    const bar = gradientBar(pct, 20, c);
    const name = theme.green(padR(projectName(project.directory ?? "unknown"), W), c);
    const tok = theme.white(padL(compactNumber(project.tokens), 8), c);
    const sess = theme.dim(padL(`${project.sessions} sess`, 7), c);
    lines.push(`  ${theme.box.v} ${name} ${bar} ${tok} ${sess} ${theme.box.v}`);
  }

  lines.push(`  ${theme.box.ml}${border}${theme.box.mr}`);
  const tokTotal = theme.white(padL(compactNumber(totalTokens), 8), c);
  const sessTotal = theme.dim(padL(`${totalSessions} sess`, 7), c);
  lines.push(`  ${theme.box.v} ${theme.dim("TOTAL", c)}${" ".repeat(W - 5)} ${gradientBar(1, 20, c)} ${tokTotal} ${sessTotal} ${theme.box.v}`);
  lines.push(`  ${theme.box.bl}${border}${theme.box.br}`);
  lines.push("");
  return lines;
}
