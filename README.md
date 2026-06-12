# mimo-streak

GitHub-style terminal activity heatmap for your MiMoCode usage data.

<p align="center">
  <img src="mimo-streak.gif" alt="mimo-streak demo" width="800">
</p>

<p align="center">
  <a href="https://github.com/jadmadi/mimo-streak/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License">
  </a>
  <a href="https://paypal.me/Madise">
    <img src="https://img.shields.io/badge/Support-PayPal-00457C?style=for-the-badge&logo=paypal" alt="Support via PayPal">
  </a>
</p>

```
╭────────────────────────────────────────────────────────────────────────╮
│ MiMoCode  414M tokens  ·  52w                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ JunJul Aug  Sep Oct Nov  Dec Jan Feb Mar  Apr May  J                   │
│ ····················································                   │
│ Mon ····················································               │
│ ····················································                   │
│ Wed ···················································░               │
│ ···········································░·······█                   │
│ Fri ···················································◈               │
│ ···················································                    │
│ Less · ░ ▒ ▓ █ More                                                    │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ 4  active   │   3  streak   │   3  best   │   414M  all-time           │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ ⬡ v0.1.0   │   ● 3d streak   │   $7.90 total cost                      │
│                                                                        │
╰────────────────────────────────────────────────────────────────────────╯
```

## Requirements

- **Node.js >= 22.5.0** (for built-in `node:sqlite` support)

## Quick start

No install needed:

```bash
npx mimo-streak
```

Or install globally:

```bash
npm install -g mimo-streak
# or
pnpm add -g mimo-streak
```

## Usage

### Dashboard

```bash
npx mimo-streak                    # Full heatmap dashboard
npx mimo-streak --weeks 26         # Show 26 weeks
npx mimo-streak --weeks 4          # Show 4 weeks
npx mimo-streak --no-color         # Disable colors
npx mimo-streak --json             # Output as JSON
npx mimo-streak --json --weeks 8   # JSON for 8 weeks
```

### Subcommands

```bash
npx mimo-streak models                  # Token usage by model
npx mimo-streak models mimo             # Filter models by name
npx mimo-streak models --json           # JSON output

npx mimo-streak projects                # Activity by project
npx mimo-streak projects whatsapp       # Filter projects by name
npx mimo-streak projects --json         # JSON output

npx mimo-streak trends                  # Weekly sparkline chart
npx mimo-streak trends --json           # JSON output
```

### Filtering

```bash
npx mimo-streak --project mimo          # Filter heatmap by project
npx mimo-streak --db /path/to/db        # Custom database path
npx mimo-streak --version               # Show version
```

## Options

| Flag | Description |
|------|-------------|
| `--db <path>` | SQLite database path (default: `~/.local/share/mimocode/mimocode.db`) |
| `--weeks <4-104>` | Heatmap width in weeks (default: 52) |
| `--project <name>` | Filter heatmap activity by project directory name |
| `--json` | Output as JSON |
| `--no-color` | Disable ANSI colors |
| `-v, --version` | Show version |

## Subcommands

| Command | Description |
|---------|-------------|
| `models [filter]` | Token usage by model (mimo-auto, mimo-v2.5, etc.) |
| `projects [filter]` | Activity by project directory |
| `trends [filter]` | Weekly trend sparkline chart |

The optional `[filter]` narrows results to matching names.

## Features

- **5-level heatmap** with GitHub-style color ramp
- **Today indicator** — highlighted cell on the current day
- **Streak tracking** — current and longest consecutive active days
- **Model breakdown** — see which models use the most tokens
- **Project activity** — token usage per project
- **Cost tracking** — API costs color-coded by threshold
- **Adaptive colors** — detects dark/light terminal, WCAG AAA contrast
- **Gradient bars** with sub-character precision (▏▎▍▌▋▊▉█)
- **Box-drawing UI** with consistent 74-char alignment
- **Zero native dependencies** — uses Node.js built-in `node:sqlite`
- **JSON output** for scripting and automation

## Metrics

| Display | Source |
|---------|--------|
| Daily square | Assistant-message token totals for one calendar day |
| Color intensity | Relative token usage across days with activity |
| Today indicator | Highlighted ◈ cell for current day |
| Current streak | Consecutive days with activity ending today |
| Longest streak | Longest consecutive run of active days |
| Model breakdown | Token usage per model |
| Cost | API cost per day/model |

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

## Support

If this tool saved you time, consider buying me a coffee ☕

[![Support via PayPal](https://img.shields.io/badge/Support%20this%20project-PayPal-00457C?style=for-the-badge&logo=paypal)](https://paypal.me/Madise)

## Made by

**Jad Madi** — [jadmadi.net](https://jadmadi.net/) · [@jadmadi](https://x.com/jadmadi) · [github.com/jadmadi](https://github.com/jadmadi)

## License

MIT — see [LICENSE](LICENSE) for details.
