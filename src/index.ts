#!/usr/bin/env node

import { openDb, loadSummary, loadDaily, loadModels, loadProjects, defaultDbPath, type Options } from "./db.js";
import { computeStreaks, startOfToday, addDays, localDay, compactNumber, formatPath } from "./stats.js";
import { renderHeatmap } from "./heatmap.js";
import { renderModels } from "./models.js";
import { renderProjects } from "./projects.js";
import { renderTrends } from "./trends.js";
import { top, mid, bottom, row, emptyRow, col, dimBorder } from "./box.js";
import { theme as t } from "./theme.js";

const reset = "\u001b[0m";

function usage(): string {
  return `Usage: mimo-streak [options] [command] [filter]

GitHub-style terminal activity heatmap for MiMoCode usage data.

Commands:
  trends [filter]       Show weekly trend sparkline chart
  models [filter]       Show token usage breakdown by model
  projects [filter]     Show activity breakdown by project directory

  The optional [filter] narrows results to matching names.

Options:
  --db <path>       SQLite database path (default: ~/.local/share/mimocode/mimocode.db)
  --weeks <number>  Heatmap width in weeks, from 4 to 104 (default: 52)
  --project <name>  Filter heatmap activity by project directory name
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

    if (!argument.startsWith("-")) {
      if (positionalIndex === 0) {
        options.subcommand = argument;
        positionalIndex += 1;
        continue;
      }
      if (positionalIndex === 1 && (options.subcommand === "projects" || options.subcommand === "models" || options.subcommand === "trends")) {
        options.project = argument;
        positionalIndex += 1;
        continue;
      }
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
      let models = loadModels(db, options.since, options.until);
      if (options.project) {
        const filter = options.project.toLowerCase();
        const filterSegments = filter.split("-").length;
        models = models.filter((m) => {
          const name = m.model.toLowerCase();
          if (name === filter) return true;
          if (m.provider.toLowerCase() === filter) return true;
          // "mimo" → only single-segment models whose name starts with "mimo"
          // "mimo-v2.5" → prefix match (matches mimo-v2.5 and mimo-v2.5-pro)
          if (filterSegments === 1) {
            const nameSegments = name.split("-").length;
            return nameSegments === 1 && name.startsWith(filter);
          }
          return name.startsWith(filter);
        });
      }
      if (options.json) {
        console.log(JSON.stringify(models, null, 2));
      } else {
        console.log(renderModels(models, colors).join("\n"));
      }
      return;
    }

    if (options.subcommand === "projects") {
      let projects = loadProjects(db);
      if (options.project) {
        const filter = options.project.toLowerCase();
        projects = projects.filter((p) => p.directory.toLowerCase().includes(filter));
      }
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

    const headerLine = `${t.bold("MiMoCode", colors)}  ${t.teal(compactNumber(visibleTokens), colors)} ${t.dim("tokens", colors)}  ${t.dimmer("·", colors)}  ${t.dim(`${options.weeks}w`, colors)}  ${t.dimmer("·", colors)}  ${t.dim(formatPath(options.dbPath), colors)}`;

    // Usage stats — focal point
    const usageStats = [
      `${t.green(String(visibleActiveDays), colors)}  ${t.dim("active", colors)}`,
      `${t.teal(String(streaks.current), colors)}  ${t.dim("streak", colors)}`,
      `${t.blue(String(streaks.longest), colors)}  ${t.dim("best", colors)}`,
      `${t.bright(compactNumber(summary.lifetimeTokens), colors)}  ${t.dim("all-time", colors)}`,
    ].join(`   ${t.dimmer("│", colors)}   `);

    // Meta info — secondary
    const costFn = t.costColor(summary.cost);
    const metaInfo = `${t.dim("⬡ v0.1.0", colors)}   ${t.dimmer("│", colors)}   ${t.green("●", colors)} ${t.teal(`${streaks.current}d`, colors)} ${t.dim("streak", colors)}   ${t.dimmer("│", colors)}   ${t.dim("$", colors)}${costFn(summary.cost.toFixed(2), colors)} ${t.dim("total cost", colors)}`;

    const b = (s: string) => dimBorder(s, colors);

    const output = [
      "",
      b(top()),
      row(headerLine),
      b(mid()),
      emptyRow(),
      ...renderHeatmap(activity, options.weeks, colors).map((line) => row(line.trim())),
      emptyRow(),
      b(mid()),
      emptyRow(),
      row(usageStats),
      emptyRow(),
      b(mid()),
      emptyRow(),
      row(metaInfo),
      emptyRow(),
      b(bottom()),
      "",
    ];

    console.log(output.join("\n"));
  } finally {
    db.close();
  }
}

main();
