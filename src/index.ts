#!/usr/bin/env node

import { openDb, loadSummary, loadDaily, loadModels, loadProjects, defaultDbPath, type Options } from "./db.js";
import { computeStreaks, startOfToday, addDays, localDay, compactNumber, formatPath } from "./stats.js";
import { renderHeatmap } from "./heatmap.js";
import { renderModels } from "./models.js";
import { renderProjects } from "./projects.js";
import { renderTrends } from "./trends.js";

const reset = "\u001b[0m";

function usage(): string {
  return `Usage: mimo-streak [options] [command]

GitHub-style terminal activity heatmap for MiMoCode usage data.

Commands:
  trends       Show weekly trend sparkline chart
  models       Show token usage breakdown by model
  projects     Show activity breakdown by project directory

Options:
  --db <path>       SQLite database path (default: ~/.local/share/mimocode/mimocode.db)
  --weeks <number>  Heatmap width in weeks, from 4 to 104 (default: 52)
  --project <name>  Filter activity by project directory name
  --json            Print computed data as JSON instead of the dashboard
  --no-color        Disable ANSI colors
  -h, --help        Show this help`;
}

function parseArgs(args: string[]): Options {
  const options: Options = {
    dbPath: defaultDbPath,
    weeks: 52,
    json: false,
    noColor: false,
    project: null,
    since: null,
    until: null,
    subcommand: null,
  };

  let positionalIndex = 0;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "-h" || argument === "--help") {
      console.log(usage());
      process.exit(0);
    }

    if (argument === "--json") {
      options.json = true;
      continue;
    }

    if (argument === "--no-color") {
      options.noColor = true;
      continue;
    }

    if (argument === "--db" || argument === "--weeks" || argument === "--project") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        console.error(`mimo-streak: missing value for ${argument}`);
        process.exit(1);
      }
      index += 1;

      if (argument === "--db") {
        options.dbPath = value.replace(/^~(?=\/)/, process.env.HOME ?? "");
      } else if (argument === "--weeks") {
        const weeks = Number.parseInt(value, 10);
        if (!Number.isInteger(weeks) || weeks < 4 || weeks > 104) {
          console.error("mimo-streak: --weeks must be an integer between 4 and 104");
          process.exit(1);
        }
        options.weeks = weeks;
      } else if (argument === "--project") {
        options.project = value;
      }
      continue;
    }

    if (!argument.startsWith("-") && positionalIndex === 0) {
      options.subcommand = argument;
      positionalIndex += 1;
      continue;
    }

    console.error(`mimo-streak: unknown option: ${argument}`);
    process.exit(1);
  }

  return options;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const colors = !options.noColor && Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
  const db = openDb(options.dbPath);

  try {
    if (options.subcommand === "models") {
      const models = loadModels(db, options.since, options.until);
      if (options.json) {
        console.log(JSON.stringify(models, null, 2));
      } else {
        console.log(renderModels(models, colors).join("\n"));
      }
      return;
    }

    if (options.subcommand === "projects") {
      const projects = loadProjects(db);
      if (options.json) {
        console.log(JSON.stringify(projects, null, 2));
      } else {
        console.log(renderProjects(projects, colors).join("\n"));
      }
      return;
    }

    if (options.subcommand === "trends") {
      const daily = loadDaily(db, options.project, options.since, options.until);
      if (options.json) {
        console.log(JSON.stringify(daily, null, 2));
      } else {
        console.log(renderTrends(daily, colors).join("\n"));
      }
      return;
    }

    const summary = loadSummary(db);
    const daily = loadDaily(db, options.project, options.since, options.until);
    const activeDays = new Set(daily.filter((d) => d.turns > 0).map((d) => d.day));
    const streaks = computeStreaks(activeDays);
    const activity = new Map(daily.map((d) => [d.day, { tokens: d.tokens, turns: d.turns }]));

    const today = startOfToday();
    const firstSunday = addDays(addDays(today, -today.getDay()), -(options.weeks - 1) * 7);
    const visibleDays = daily.filter((d) => d.day >= localDay(firstSunday) && d.day <= localDay(today));
    const visibleTokens = visibleDays.reduce((s, d) => s + d.tokens, 0);
    const visibleActiveDays = visibleDays.filter((d) => d.turns > 0).length;

    const muted = (text: string) => (colors ? `\u001b[38;5;245m${text}${reset}` : text);
    const highlight = (text: string) => (colors ? `\u001b[1;38;5;255m${text}${reset}` : text);

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            database: options.dbPath,
            generatedAt: new Date().toISOString(),
            summary: { ...summary, currentStreak: streaks.current, longestStreak: streaks.longest },
            daily,
          },
          null,
          2
        )
      );
      return;
    }

    const output = [
      "",
      `  ${highlight("MiMoCode activity")}  ${highlight(compactNumber(visibleTokens))} tokens / ${options.weeks} weeks  ${muted(formatPath(options.dbPath))}`,
      "",
      ...renderHeatmap(activity, options.weeks, colors),
      `  ${visibleActiveDays} active days  ${muted("|")}  ${streaks.current} day streak  ${muted("|")}  ${streaks.longest} best  ${muted("|")}  ${compactNumber(summary.lifetimeTokens)} all-time`,
      "",
    ];

    console.log(output.join("\n"));
  } finally {
    db.close();
  }
}

main();
