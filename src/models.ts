import { ModelRow } from "./db.js";
import { compactNumber } from "./stats.js";
import { theme, gradientBar } from "./theme.js";
import { col } from "./box.js";

const BAR_W = 20;
const NAME_W = 22;
const TOK_W = 9;
const COST_W = 9;

export function renderModels(models: ModelRow[], c: boolean): string[] {
  if (models.length === 0) return [theme.dim("No model data available.", c)];

  const maxTokens = Math.max(...models.map((m) => m.tokens));
  const totalTokens = models.reduce((s, m) => s + m.tokens, 0);
  const totalCost = models.reduce((s, m) => s + m.cost, 0);

  const lines: string[] = [
    theme.bold("MODEL BREAKDOWN", c),
    "",
  ];

  for (const model of models) {
    const pct = maxTokens > 0 ? model.tokens / maxTokens : 0;
    const bar = gradientBar(pct, BAR_W, c);
    const name = theme.teal(col(`${model.model} (${model.provider})`, NAME_W), c);
    const tok = theme.white(col(compactNumber(model.tokens), TOK_W, "right"), c);
    const cost = theme.costColor(model.cost)(col(`$${model.cost.toFixed(2)}`, COST_W, "right"), c);
    lines.push(`  ${name}  ${bar}  ${tok}  ${cost}`);
  }

  lines.push("");
  const totBar = gradientBar(1, BAR_W, c);
  const totTok = theme.bright(col(compactNumber(totalTokens), TOK_W, "right"), c);
  const totCost = theme.costColor(totalCost)(col(`$${totalCost.toFixed(2)}`, COST_W, "right"), c);
  lines.push(`  ${theme.dim("TOTAL", c)}${" ".repeat(NAME_W - 5)}  ${totBar}  ${totTok}  ${totCost}`);
  return lines;
}
