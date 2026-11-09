#!/bin/zsh
# Installs (or with --remove, removes) the nightly auto-fix routine as a macOS launchd job (03:17 every day;
# if the Mac is asleep then, it runs when it wakes up).
#   zsh scripts/auto-fix/install.sh           → install
#   zsh scripts/auto-fix/install.sh --remove  → uninstall
set -eu
PROJECT="$(cd "$(dirname "$0")/../.." && pwd)"
LABEL="pt.neyod.gameday.autofix"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
if [[ "${1:-}" == "--remove" ]]; then
  rm -f "$PLIST"
  echo "Rotina removida."
  exit 0
fi
mkdir -p "$HOME/Library/LaunchAgents"
cat >"$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>/bin/zsh</string><string>$PROJECT/scripts/auto-fix/run.sh</string></array>
  <key>WorkingDirectory</key><string>$PROJECT</string>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>3</integer><key>Minute</key><integer>17</integer></dict>
  <key>StandardOutPath</key><string>/tmp/$LABEL.out</string>
  <key>StandardErrorPath</key><string>/tmp/$LABEL.err</string>
</dict>
</plist>
PL
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Rotina instalada: corre todas as noites às 03:17. Relatórios em data/auto-fix/reports e na página Erros."
