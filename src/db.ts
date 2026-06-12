import { DatabaseSync } from "node:sqlite";
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

export function openDb(dbPath: string): DatabaseSync {
  if (!existsSync(dbPath)) {
    console.error(`mimo-streak: database not found: ${dbPath}`);
    console.error("");
    console.error("  This tool reads from MiMoCode's SQLite database.");
    console.error("  Make sure MiMoCode is installed and has been used at least once.");
    console.error("  Or specify a custom path with --db <path>");
    process.exit(1);
  }
  return new DatabaseSync(dbPath, { readOnly: true });
}

export function loadSummary(db: DatabaseSync): SummaryRow {
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
          COUNT(*) AS tasks
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
        0 AS peakTokens,
        0 AS longestTaskMs
      FROM session_usage
      LEFT JOIN message_usage ON 1 = 1`
    )
    .get() as SummaryRow;
}

export function loadDaily(
  db: DatabaseSync,
  project: string | null,
  _since: string | null,
  _until: string | null
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
  db: DatabaseSync,
  _since: string | null,
  _until: string | null
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

export function loadProjects(db: DatabaseSync): ProjectRow[] {
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
