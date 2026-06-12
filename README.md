# mimo-streak

A GitHub-style terminal activity heatmap for your local MiMoCode usage data.

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

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

## License

MIT
