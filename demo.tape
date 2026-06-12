# mimo-streak demo — showcases all commands and options

Output mimo-streak.gif

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
Type "mimo-streak"
Enter
Sleep 3s

# Narrow to 26 weeks
Type "mimo-streak --weeks 26"
Enter
Sleep 2.5s

# Model breakdown
Type "mimo-streak models"
Enter
Sleep 2.5s

# Filtered models
Type "mimo-streak models mimo"
Enter
Sleep 2.5s

# Project activity
Type "mimo-streak projects"
Enter
Sleep 2.5s

# Weekly trends
Type "mimo-streak trends"
Enter
Sleep 2.5s

# JSON output
Type "mimo-streak --json --weeks 8"
Enter
Sleep 2s

# Help
Type "mimo-streak --help"
Enter
Sleep 2s
