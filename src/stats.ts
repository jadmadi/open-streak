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
