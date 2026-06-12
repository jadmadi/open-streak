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
Type "open-streak"
Enter
Sleep 3s

# Narrow to 26 weeks
Type "open-streak --weeks 26"
Enter
Sleep 2.5s

# Model breakdown
Type "open-streak models"
Enter
Sleep 2.5s

# Filtered models
Type "open-streak models claude"
Enter
Sleep 2.5s

# Project activity
Type "open-streak projects"
Enter
Sleep 2.5s

# Weekly trends
Type "open-streak trends"
Enter
Sleep 2.5s

# JSON output
Type "open-streak --json --weeks 8"
Enter
Sleep 2s

# Help
Type "open-streak --help"
Enter
Sleep 2s
