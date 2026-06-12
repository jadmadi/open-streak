# open-streak demo — showcases all commands and options

Output open-streak.gif

Set Width 960
Set Height 580
Set FontSize 16
Set FontFamily "JetBrains Mono"
Set LineHeight 1.2
Set Padding 24
Set Theme "TokyoNightStorm"
Set TypingSpeed 50ms
Set PlaybackSpeed 1.0
Set BorderRadius 12
Set WindowBar Colorful
Set WindowBarSize 36

Hide
Type "clear"
Enter
Sleep 500ms
Show

# Default view — full heatmap dashboard
Type "npx open-streak"
Enter
Sleep 3s

# Narrow to 26 weeks
Type "npx open-streak --weeks 26"
Enter
Sleep 2.5s

# Model breakdown
Type "npx open-streak models"
Enter
Sleep 2.5s

# Filtered models
Type "npx open-streak models mimo"
Enter
Sleep 2.5s

# Weekly trends
Type "npx open-streak trends"
Enter
Sleep 2.5s

# JSON output
Type "npx open-streak --json --weeks 8"
Enter
Sleep 2s

# Help
Type "npx open-streak --help"
Enter
Sleep 2s
