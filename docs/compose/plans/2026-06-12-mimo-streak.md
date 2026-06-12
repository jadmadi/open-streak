# MiMo-Streak Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GitHub-style terminal activity heatmap CLI for MiMoCode usage data, with model breakdown, cost tracking, project filtering, trend charts, and date range comparison.

**Architecture:** Single-file TypeScript CLI (`src/index.ts`) that reads MiMoCode's SQLite database via better-sqlite3, computes daily activity aggregations, and renders a terminal heatmap with summary stats. Extended features via subcommands: `trends`, `models`, `projects`, `compare`.

**Tech Stack:** Node.js, TypeScript, better-sqlite3, pnpm, MIT license

---

## File Structure

```
mimo-streak/
├── package.json
├── tsconfig.json
├── LICENSE
├── README.md
├── src/
│   ├── index.ts          # CLI entry point, arg parsing, orchestration
│   ├── db.ts             # Database connection and queries
│   ├── heatmap.ts        # Heatmap rendering
│   ├── stats.ts          # Streak computation, summary stats
│   ├── trends.ts         # Trend chart rendering (sparklines)
│   ├── models.ts         # Model breakdown display
│   └── projects.ts       # Project filtering and display
└── tests/
    └── stats.test.ts     # Unit tests for streak/stats logic
```

---

### Task 1: Project Scaffolding

**Covers:** None (setup only)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `LICENSE`
- Create: `src/index.ts` (stub)

- [ ] **Step 1: Initialize project**

```bash
cd /mnt/Jad/github/lab/mimo-streak
pnpm init
pnpm add better-sqlite3
pnpm add -D typescript @types/better-sqlite3 @types/node vitest
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create LICENSE (MIT)**

```
MIT License

Copyright (c) 2026 MiMoCode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 4: Update package.json with bin and scripts**

```json
{
  "name": "mimo-streak",
  "version": "0.1.0",
  "description": "GitHub-style terminal activity heatmap for MiMoCode",
  "type": "module",
  "bin": {
    "mimo-streak": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "check": "node dist/index.js --no-color"
  },
  "keywords": ["mimocode", "cli", "sqlite", "activity", "streak", "terminal", "heatmap"],
  "license": "MIT",
  "engines": {
    "node": ">=18"
  },
  "files": ["dist"],
  "publishConfig": {
    "access": "public"
  }
}
```

- [ ] **Step 5: Create stub src/index.ts**

```typescript
#!/usr/bin/env node

console.log("mimo-streak: not yet implemented");
process.exit(0);
```

- [ ] **Step 6: Build and verify**

```bash
pnpm build
node dist/index.js
```

Expected: prints "mimo-streak: not yet implemented"

- [ ] **Step 7: Commit**

```bash
git init
echo "node_modules/\ndist/" > .gitignore
git add -A
git commit -m "chore: scaffold mimo-streak project"
```

---

### Task 2: Database Layer

**Covers:** [S1 — data access]

**Files:**
- Create: `src/db.ts`

- [ ] **Step 1: Create db.ts with types and queries**

```typescript
import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type Options = {
  dbPath: string;
  weeks: number;
  json: boolean;
  noColor: boolean;
  project: string | null;
  since: string | null;
  until: string | null;
  subcommand: string | null;
};

export type SummaryRow = {
  tasks: number;
  lifetimeTokens: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cacheTokens: number;
  cost: number;
  peakTokens: number;
  longestTaskMs: number;
};

export type DailyRow = {
  day: string;
  tokens: number;
  turns: number;
  cost: number;
};

export type ModelRow = {
  model: string;
  provider: string;
  tokens: number;
  turns: number;
  cost: number;
};

export type ProjectRow = {
  directory: string;
  tokens: number;
  turns: number;
  sessions: number;
};

export const defaultDbPath = join(homedir(), ".local", "share", "mimocode", "mimocode.db");

export function openDb(dbPath: string): Database.Database {
  if (!existsSync(dbPath)) {
    console.error(`mimo-streak: database not found: ${dbPath}`);
    process.exit(1);
  }
  return new Database(dbPath, { readonly: true });
}

function projectFilter(): string {
  return "";
}

export function loadSummary(db: Database.Database): SummaryRow {
  return db
    .prepare(
      `WITH message_usage AS (
        SELECT
          COALESCE(CAST(json_extract(data, '$.tokens.input') AS INTEGER), 0) AS input_tokens,
          COALESCE(CAST(json_extract(data, '$.tokens.output') AS INTEGER), 0) AS output_tokens,
          COALESCE(CAST(json_extract(data, '$.tokens.reasoning') AS INTEGER), 0) AS reasoning_tokens,
          COALESCE(CAST(json_extract(data, '$.tokens.cache.read') AS INTEGER), 0) +
            COALESCE(CAST(json_extract(data, '$.tokens.cache.write') AS INTEGER), 0) AS cache_tokens,
          COALESCE(CAST(json_extract(data, '$.cost') AS REAL), 0) AS cost
        FROM message
        WHERE json_extract(data, '$.role') = 'assistant'
      ),
      session_usage AS (
        SELECT
          COUNT(*) AS tasks,
          COALESCE(MAX(json_extract(data, '$.tokens.input') + json_extract(data, '$.tokens.output') + json_extract(data, '$.tokens.reasoning')), 0) AS peak_tokens,
          COALESCE(MAX(time_updated - time_created), 0) AS longest_task_ms
        FROM session
      )
      SELECT
        session_usage.tasks AS tasks,
        COALESCE(SUM(input_tokens + output_tokens + reasoning_tokens + cache_tokens), 0) AS lifetimeTokens,
        COALESCE(SUM(input_tokens), 0) AS inputTokens,
        COALESCE(SUM(output_tokens), 0) AS outputTokens,
        COALESCE(SUM(reasoning_tokens), 0) AS reasoningTokens,
        COALESCE(SUM(cache_tokens), 0) AS cacheTokens,
        COALESCE(SUM(cost), 0) AS cost,
        session_usage.peak_tokens AS peakTokens,
        session_usage.longest_task_ms AS longestTaskMs
      FROM session_usage
      LEFT JOIN message_usage ON 1 = 1`
    )
    .get() as SummaryRow;
}

export function loadDaily(
  db: Database.Database,
  project: string | null,
  since: string | null,
  until: string | null
): DailyRow[] {
  let where = "WHERE json_extract(data, '$.role') = 'assistant'";
  const params: (string | number)[] = [];

  if (project) {
    where += " AND json_extract(data, '$.path.cwd') LIKE ?";
    params.push(`%${project}%`);
  }

  return db
    .prepare(
      `SELECT
        date(COALESCE(CAST(json_extract(data, '$.time.created') AS INTEGER), time_created) / 1000, 'unixepoch', 'localtime') AS day,
        SUM(
          COALESCE(CAST(json_extract(data, '$.tokens.input') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.output') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.reasoning') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.cache.read') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.cache.write') AS INTEGER), 0)
        ) AS tokens,
        COUNT(*) AS turns,
        SUM(COALESCE(CAST(json_extract(data, '$.cost') AS REAL), 0)) AS cost
      FROM message
      ${where}
      GROUP BY day
      ORDER BY day`
    )
    .all(...params) as DailyRow[];
}

export function loadModels(
  db: Database.Database,
  since: string | null,
  until: string | null
): ModelRow[] {
  return db
    .prepare(
      `SELECT
        json_extract(data, '$.modelID') AS model,
        json_extract(data, '$.providerID') AS provider,
        SUM(
          COALESCE(CAST(json_extract(data, '$.tokens.input') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.output') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.reasoning') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.cache.read') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.cache.write') AS INTEGER), 0)
        ) AS tokens,
        COUNT(*) AS turns,
        SUM(COALESCE(CAST(json_extract(data, '$.cost') AS REAL), 0)) AS cost
      FROM message
      WHERE json_extract(data, '$.role') = 'assistant'
      GROUP BY model, provider
      ORDER BY tokens DESC`
    )
    .all() as ModelRow[];
}

export function loadProjects(db: Database.Database): ProjectRow[] {
  return db
    .prepare(
      `SELECT
        json_extract(data, '$.path.cwd') AS directory,
        SUM(
          COALESCE(CAST(json_extract(data, '$.tokens.input') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.output') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.reasoning') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.cache.read') AS INTEGER), 0) +
          COALESCE(CAST(json_extract(data, '$.tokens.cache.write') AS INTEGER), 0)
        ) AS tokens,
        COUNT(*) AS turns,
        COUNT(DISTINCT session_id) AS sessions
      FROM message
      WHERE json_extract(data, '$.role') = 'assistant'
        AND json_extract(data, '$.path.cwd') IS NOT NULL
      GROUP BY directory
      ORDER BY tokens DESC`
    )
    .all() as ProjectRow[];
}
```

- [ ] **Step 2: Verify it compiles**

```bash
pnpm build
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/db.ts
git commit -m "feat: add database layer with all query functions"
```

---

### Task 3: Stats & Streak Logic

**Covers:** [S2 — streak computation]

**Files:**
- Create: `src/stats.ts`
- Create: `tests/stats.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { computeStreaks, localDay, addDays } from "../src/stats.js";

describe("localDay", () => {
  it("formats date as YYYY-MM-DD", () => {
    const date = new Date(2026, 0, 15); // Jan 15, 2026
    expect(localDay(date)).toBe("2026-01-15");
  });

  it("pads single-digit month and day", () => {
    const date = new Date(2026, 2, 5); // Mar 5, 2026
    expect(localDay(date)).toBe("2026-03-05");
  });
});

describe("addDays", () => {
  it("adds days correctly", () => {
    const date = new Date(2026, 0, 1);
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(6);
    expect(result.getMonth()).toBe(0);
  });

  it("does not mutate original", () => {
    const date = new Date(2026, 0, 1);
    addDays(date, 5);
    expect(date.getDate()).toBe(1);
  });
});

describe("computeStreaks", () => {
  it("returns 0 for empty set", () => {
    const result = computeStreaks(new Set());
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
  });

  it("computes current streak ending today", () => {
    const today = localDay(new Date());
    const yesterday = localDay(addDays(new Date(), -1));
    const days = new Set([today, yesterday]);
    const result = computeStreaks(days);
    expect(result.current).toBe(2);
    expect(result.longest).toBe(2);
  });

  it("computes longest streak across gaps", () => {
    const today = localDay(new Date());
    const days = new Set([
      localDay(addDays(new Date(), -10)),
      localDay(addDays(new Date(), -9)),
      localDay(addDays(new Date(), -8)),
      localDay(addDays(new Date(), -3)),
      localDay(addDays(new Date(), -2)),
      localDay(addDays(new Date(), -1)),
      today,
    ]);
    const result = computeStreaks(days);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test
```

Expected: FAIL — cannot resolve `../src/stats.js`

- [ ] **Step 3: Create stats.ts**

```typescript
export type DayActivity = {
  tokens: number;
  turns: number;
};

export type Streaks = {
  current: number;
  longest: number;
};

export function localDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function computeStreaks(days: Set<string>): Streaks {
  let longest = 0;
  let run = 0;
  let previous: Date | undefined;

  for (const key of [...days].sort()) {
    const date = new Date(`${key}T00:00:00`);
    if (previous && addDays(previous, 1).getTime() === date.getTime()) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    previous = date;
  }

  let current = 0;
  let cursor = startOfToday();
  while (days.has(localDay(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, longest };
}

export function activityThresholds(activity: Map<string, DayActivity>): number[] {
  const nonzero = [...activity.values()]
    .map((v) => v.tokens)
    .filter((t) => t > 0)
    .sort((a, b) => a - b);

  if (nonzero.length === 0) return [0, 0, 0];
  const at = (q: number): number => nonzero[Math.floor((nonzero.length - 1) * q)] ?? 0;
  return [at(0.25), at(0.5), at(0.75)];
}

export function activityLevel(activity: DayActivity | undefined, thresholds: number[]): number {
  if (!activity) return 0;
  if (activity.tokens <= 0) return 1;
  if (activity.tokens <= thresholds[0]) return 1;
  if (activity.tokens <= thresholds[1]) return 2;
  if (activity.tokens <= thresholds[2]) return 3;
  return 4;
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPath(path: string): string {
  const homedir = process.env.HOME ?? "~";
  return path.startsWith(`${homedir}/`) ? path.replace(homedir, "~") : path;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/stats.ts tests/stats.test.ts
git commit -m "feat: add streak computation and stats utilities"
```

---

### Task 4: Heatmap Rendering

**Covers:** [S3 — heatmap display]

**Files:**
- Create: `src/heatmap.ts`

- [ ] **Step 1: Create heatmap.ts**

```typescript
import { DayActivity, activityThresholds, activityLevel, startOfToday, addDays, localDay } from "./stats.js";

const reset = "\u001b[0m";

function color(enabled: boolean, code: string, value: string): string {
  return enabled ? `\u001b[${code}m${value}${reset}` : value;
}

function heatCell(level: number, colors: boolean): string {
  if (!colors) return ["□", "░", "▒", "▓", "█"][level];
  const palette = ["38;5;238", "38;5;22", "38;5;28", "38;5;34", "38;5;40"];
  return color(true, palette[level], "■");
}

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

  const labels = ["   ", "Mon", "   ", "Wed", "   ", "Fri", "   "];
  const lines = [`      ${monthLine.join("")}`];
  for (let weekday = 0; weekday < 7; weekday += 1) {
    let row = `  ${labels[weekday]} `;
    for (let week = 0; week < weeks; week += 1) {
      const date = addDays(firstSunday, week * 7 + weekday);
      row += date > today ? " " : heatCell(activityLevel(activity.get(localDay(date)), thresholds), colors);
    }
    lines.push(row);
  }

  const legend = [0, 1, 2, 3, 4].map((level) => heatCell(level, colors)).join("");
  lines.push(`      Less ${legend} More`);
  return lines;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/heatmap.ts
git commit -m "feat: add terminal heatmap renderer"
```

---

### Task 5: Model Breakdown

**Covers:** [S4 — model breakdown]

**Files:**
- Create: `src/models.ts`

- [ ] **Step 1: Create models.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/models.ts
git commit -m "feat: add model breakdown display"
```

---

### Task 6: Project Filtering

**Covers:** [S5 — project filtering]

**Files:**
- Create: `src/projects.ts`

- [ ] **Step 1: Create projects.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/projects.ts
git commit -m "feat: add project activity display"
```

---

### Task 7: Trend Charts

**Covers:** [S6 — trend charts]

**Files:**
- Create: `src/trends.ts`

- [ ] **Step 1: Create trends.ts**

```typescript
import { DailyRow } from "./db.js";
import { compactNumber } from "./stats.js";

const sparkChars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

export function renderTrends(daily: DailyRow[], colors: boolean): string[] {
  if (daily.length === 0) return ["  No activity data available."];

  const reset = "\u001b[0m";
  const bold = (text: string) => (colors ? `\u001b[1m${text}${reset}` : text);
  const muted = (text: string) => (colors ? `\u001b[38;5;245m${text}${reset}` : text);

  // Group by week
  const weeks: { start: string; tokens: number; days: number }[] = [];
  let currentWeek: { start: string; tokens: number; days: number } | null = null;

  for (const day of daily) {
    const date = new Date(`${day.day}T00:00:00`);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());

    const weekKey = weekStart.toISOString().slice(0, 10);
    if (!currentWeek || currentWeek.start !== weekKey) {
      if (currentWeek) weeks.push(currentWeek);
      currentWeek = { start: weekKey, tokens: 0, days: 0 };
    }
    currentWeek.tokens += day.tokens;
    currentWeek.days += 1;
  }
  if (currentWeek) weeks.push(currentWeek);

  // Generate sparkline
  const maxTokens = Math.max(...weeks.map((w) => w.tokens));
  const sparkline = weeks
    .map((w) => {
      const level = maxTokens > 0 ? Math.min(7, Math.floor((w.tokens / maxTokens) * 7)) : 0;
      return sparkChars[level];
    })
    .join("");

  // Summary
  const totalTokens = daily.reduce((s, d) => s + d.tokens, 0);
  const totalCost = daily.reduce((s, d) => s + d.cost, 0);
  const activeDays = daily.filter((d) => d.turns > 0).length;

  const lines = [
    "",
    `  ${bold("Weekly Trend")}`,
    `  ${muted(sparkline)}`,
    "",
    `  ${bold("Summary")}`,
    `    Total tokens:  ${compactNumber(totalTokens)}`,
    `    Total cost:    $${totalCost.toFixed(4)}`,
    `    Active days:   ${activeDays}`,
    `    Avg/day:       ${activeDays > 0 ? compactNumber(Math.round(totalTokens / activeDays)) : "0"} tokens`,
    "",
  ];

  return lines;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/trends.ts
git commit -m "feat: add weekly trend sparkline chart"
```

---

### Task 8: CLI Entry Point

**Covers:** [S1, S7 — CLI and orchestration]

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Write the full CLI**

```typescript
#!/usr/bin/env node

import { openDb, loadSummary, loadDaily, loadModels, loadProjects, defaultDbPath, type Options } from "./db.js";
import { computeStreaks, startOfToday, addDays, localDay, compactNumber, formatPath } from "./stats.js";
import { renderHeatmap } from "./heatmap.js";
import { renderModels } from "./models.js";
import { renderProjects } from "./projects.js";
import { renderTrends } from "./trends.js";

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
  --since <date>    Show activity from this date (YYYY-MM-DD)
  --until <date>    Show activity until this date (YYYY-MM-DD)
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

    if (argument === "--db" || argument === "--weeks" || argument === "--project" || argument === "--since" || argument === "--until") {
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
      } else if (argument === "--since") {
        options.since = value;
      } else if (argument === "--until") {
        options.until = value;
      }
      continue;
    }

    // Subcommands
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

    // Default: heatmap dashboard
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
    const reset = "\u001b[0m";

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
```

- [ ] **Step 2: Build and run**

```bash
pnpm build
node dist/index.js
```

Expected: renders heatmap with MiMoCode activity data

- [ ] **Step 3: Test all subcommands**

```bash
node dist/index.js models
node dist/index.js projects
node dist/index.js trends
node dist/index.js --json
node dist/index.js --weeks 12
node dist/index.js --no-color
```

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: implement CLI with heatmap, models, projects, trends"
```

---

### Task 9: README

**Covers:** [S8 — documentation]

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
# mimo-streak

A GitHub-style terminal activity heatmap for your local MiMoCode usage data.

![heatmap](https://img.shields.io/badge/heatmap-terminal-green)

## Install

```bash
npm install -g mimo-streak
mimo-streak
```

With pnpm:

```bash
pnpm add -g mimo-streak
mimo-streak
```

Run without installing:

```bash
npx mimo-streak
```

## Usage

```bash
mimo-streak                    # Show activity heatmap
mimo-streak --weeks 26         # Show 26 weeks
mimo-streak --json             # Output as JSON
mimo-streak --no-color         # Disable colors
mimo-streak --project mimo     # Filter by project name
mimo-streak models             # Show model breakdown
mimo-streak projects           # Show project activity
mimo-streak trends             # Show weekly trend chart
```

## Options

| Flag | Description |
|------|-------------|
| `--db <path>` | SQLite database path (default: `~/.local/share/mimocode/mimocode.db`) |
| `--weeks <4-104>` | Heatmap width in weeks (default: 52) |
| `--project <name>` | Filter by project directory name |
| `--since <YYYY-MM-DD>` | Show activity from this date |
| `--until <YYYY-MM-DD>` | Show activity until this date |
| `--json` | Output as JSON |
| `--no-color` | Disable ANSI colors |

## Subcommands

| Command | Description |
|---------|-------------|
| `models` | Token usage breakdown by model (mimo-auto, mimo-v2.5, etc.) |
| `projects` | Activity breakdown by project directory |
| `trends` | Weekly trend sparkline chart |

## Metrics

| Display | Source |
|---------|--------|
| Daily square | Assistant-message token totals for one local calendar day |
| Color intensity | Relative token usage across days with activity |
| Current streak | Consecutive calendar days with assistant activity ending today |
| Longest streak | Longest consecutive run of days with assistant activity |
| Model breakdown | Token usage per model (mimo-auto, mimo-v2.5, etc.) |
| Cost | API cost per day/model |

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with usage and options"
```

---

### Task 10: Final Polish & Publish Prep

**Covers:** [S9 — open source readiness]

**Files:**
- Modify: `package.json` (add repository, homepage, bugs fields)

- [ ] **Step 1: Add GitHub metadata to package.json**

Add to package.json:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/mimocode/mimo-streak"
  },
  "homepage": "https://github.com/mimocode/mimo-streak#readme",
  "bugs": {
    "url": "https://github.com/mimocode/mimo-streak/issues"
  }
}
```

- [ ] **Step 2: Run full build and test**

```bash
pnpm build
pnpm test
node dist/index.js --no-color
```

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add repository metadata for npm publish"
```

- [ ] **Step 4: Tag v0.1.0**

```bash
git tag v0.1.0
```
