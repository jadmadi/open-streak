import { ModelRow } from "./db.js";
import { compactNumber } from "./stats.js";
import { theme, gradientBar, padR, padL } from "./theme.js";

export function renderModels(models: ModelRow[], c: boolean): string[] {
  if (models.length === 0) return [theme.dim("  No model data available.", c)];

  const maxTokens = Math.max(...models.map((m) => m.tokens));
  const totalTokens = models.reduce((s, m) => s + m.tokens, 0);
  const totalCost = models.reduce((s, m) => s + m.cost, 0);
  const W = 28;
  const border = theme.box.h.repeat(W + 52);

  const lines: string[] = [
    "",
    `  ${theme.box.tl}${border}${theme.box.tr}`,
    `  ${theme.box.v} ${theme.bold("MODEL BREAKDOWN", c)}${" ".repeat(W + 34)}${theme.box.v}`,
    `  ${theme.box.ml}${border}${theme.box.mr}`,
  ];

  for (const model of models) {
    const pct = maxTokens > 0 ? model.tokens / maxTokens : 0;
    const bar = gradientBar(pct, 24, c);
    const costFn = theme.costColor(model.cost);
    const name = theme.blue(padR(`${model.model} (${model.provider})`, 28), c);
    const tok = theme.white(padL(compactNumber(model.tokens), 9), c);
    const cost = costFn(padL(`$${model.cost.toFixed(2)}`, 9), c);
    lines.push(`  ${theme.box.v} ${name} ${bar} ${tok} ${cost} ${theme.box.v}`);
  }

  lines.push(`  ${theme.box.ml}${border}${theme.box.mr}`);
  const tokTotal = theme.white(padL(compactNumber(totalTokens), 9), c);
  const costTotal = theme.costColor(totalCost)(padL(`$${totalCost.toFixed(2)}`, 9), c);
  lines.push(`  ${theme.box.v} ${theme.dim("TOTAL", c)}${" ".repeat(24)} ${gradientBar(1, 24, c)} ${tokTotal} ${costTotal} ${theme.box.v}`);
  lines.push(`  ${theme.box.bl}${border}${theme.box.br}`);
  lines.push("");
  return lines;
}
