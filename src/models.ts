import { ModelRow } from "./db.js";
import { compactNumber } from "./stats.js";

export function renderModels(models: ModelRow[], colors: boolean): string[] {
  if (models.length === 0) return ["  No model data available."];

  const reset = "\u001b[0m";
  const bold = (text: string) => (colors ? `\u001b[1m${text}${reset}` : text);
  const muted = (text: string) => (colors ? `\u001b[38;5;245m${text}${reset}` : text);

  const maxTokens = Math.max(...models.map((m) => m.tokens));
  const lines = [
    "",
    `  ${bold("Model Breakdown")}`,
    "",
  ];

  for (const model of models) {
    const bar = maxTokens > 0 ? Math.round((model.tokens / maxTokens) * 30) : 0;
    const barStr = "█".repeat(bar) + "░".repeat(30 - bar);
    const name = `${model.model} (${model.provider})`;
    lines.push(
      `  ${name.padEnd(30)} ${muted(barStr)} ${compactNumber(model.tokens)} tokens  $${model.cost.toFixed(4)}`
    );
  }

  lines.push("");
  return lines;
}
