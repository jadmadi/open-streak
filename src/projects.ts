import { ProjectRow } from "./db.js";
import { compactNumber } from "./stats.js";
import { theme, gradientBar } from "./theme.js";
import { top, mid, bottom, row, emptyRow, col, dimBorder } from "./box.js";

const BAR_W = 18;
const NAME_W = 20;
const TOK_W = 8;
const SESS_W = 7;

function projectName(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

export function renderProjects(projects: ProjectRow[], c: boolean): string[] {
  if (projects.length === 0) return [row(theme.dim("No project data available.", c))];

  const maxTokens = Math.max(...projects.map((p) => p.tokens));
  const totalTokens = projects.reduce((s, p) => s + p.tokens, 0);
  const totalSessions = projects.reduce((s, p) => s + p.sessions, 0);

  const b = (s: string) => dimBorder(s, c);
  const lines: string[] = [
    "",
    b(top()),
    row(theme.bold("PROJECT ACTIVITY", c)),
    b(mid()),
    emptyRow(),
  ];

  for (const project of projects) {
    const pct = maxTokens > 0 ? project.tokens / maxTokens : 0;
    const bar = gradientBar(pct, BAR_W, c);
    const name = theme.teal(col(projectName(project.directory ?? "unknown"), NAME_W), c);
    const tok = theme.white(col(compactNumber(project.tokens), TOK_W, "right"), c);
    const sess = theme.dim(col(`${project.sessions} sess`, SESS_W, "right"), c);
    lines.push(row(`  ${name}  ${bar}  ${tok}  ${sess}`));
  }

  lines.push(emptyRow());
  lines.push(b(mid()));
  const totBar = gradientBar(1, BAR_W, c);
  const totTok = theme.bright(col(compactNumber(totalTokens), TOK_W, "right"), c);
  const totSess = theme.dim(col(`${totalSessions} sess`, SESS_W, "right"), c);
  lines.push(row(`  ${theme.dim("TOTAL", c)}${" ".repeat(NAME_W - 5)}  ${totBar}  ${totTok}  ${totSess}`));
  lines.push(b(bottom()));
  lines.push("");
  return lines;
}
