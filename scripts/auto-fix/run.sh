#!/bin/zsh
# Nightly fixing routine: Claude Code reads the open "Tem erros" reports, fixes the looks and records what it did.
# Safety net: backs up the code first and restores it if the app no longer type-checks or renders.
# Started by launchd (scripts/auto-fix/install.sh); can also be run by hand: zsh scripts/auto-fix/run.sh

set -u
PROJECT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT" || exit 1
export PATH="$HOME/.local/share/mise/installs/node/22.11.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

STAMP="$(date +%Y-%m-%d_%H%M)"
BASE="$PROJECT/data/auto-fix"
WORK_DIR="$BASE/work/$STAMP"
BACKUP="$BASE/backups/$STAMP"
REPORT_FILE="$BASE/reports/$STAMP.md"
LOG="$BASE/logs/$STAMP.log"
mkdir -p "$WORK_DIR" "$BACKUP" "$BASE/reports" "$BASE/logs"
exec >>"$LOG" 2>&1
echo "== auto-fix $STAMP"

# One run at a time.
LOCK="$BASE/.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "already running"; exit 0
fi
SERVER_PID=""
cleanup() {
  [[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null
  rmdir "$LOCK" 2>/dev/null
}
trap cleanup EXIT

OPEN=$(sqlite3 data/gameday.db "SELECT count(*) FROM feedback WHERE resolved = 0")
if [[ "$OPEN" == "0" ]]; then
  echo "no open reports"; rmdir "$WORK_DIR" "$BACKUP" 2>/dev/null; exit 0
fi

# Claude Code CLI: the one on PATH, else the newest one bundled with the VS Code extension.
CLAUDE="$(command -v claude || true)"
if [[ -z "$CLAUDE" ]]; then
  CLAUDE="$(ls -d "$HOME"/.vscode/extensions/anthropic.claude-code-*/resources/native-binary/claude 2>/dev/null | sort -V | tail -1)"
fi
if [[ -z "$CLAUDE" || ! -x "$CLAUDE" ]]; then
  echo "claude CLI not found"
  printf 'A correção automática não correu: não encontrei o Claude Code neste computador.\n' >"$REPORT_FILE"
  exit 1
fi

# The app must be running to look at the edits.
if ! curl -sf -o /dev/null http://localhost:3100/erros; then
  echo "starting dev server"
  npm run dev >"$BASE/logs/$STAMP.server.log" 2>&1 &
  SERVER_PID=$!
  for i in {1..60}; do curl -sf -o /dev/null http://localhost:3100/erros && break; sleep 2; done
fi

rsync -a src/ "$BACKUP/src/"
START_TS=$(sqlite3 data/gameday.db "SELECT datetime('now')")

PROMPT="$(sed -e "s#\$WORK_DIR#$WORK_DIR#g" -e "s#\$REPORT_FILE#$REPORT_FILE#g" scripts/auto-fix/prompt.md)"
PROMPT="$PROMPT

WORK_DIR = $WORK_DIR
REPORT_FILE = $REPORT_FILE"

run_claude() {
  "$CLAUDE" -p "$PROMPT" \
    --permission-mode acceptEdits \
    --allowedTools "Read" "Edit" "Write" "Glob" "Grep" \
      "Bash(sqlite3:*)" "Bash(node scripts/auto-fix/shot.mjs:*)" "Bash(npx tsc:*)" "Bash(curl -s http://localhost:3100:*)" "Bash(ls:*)" \
    --max-budget-usd 8
}
run_claude
code=$?
echo "claude exit $code"
# Network hiccups ("Request timed out"): try once more a bit later if nothing was changed yet.
if [[ "$code" != "0" ]] && diff -rq "$BACKUP/src" src >/dev/null; then
  sleep 300
  run_claude
  echo "claude retry exit $?"
fi

# Verify: types check and the main pages still render; otherwise put the code back.
# Nothing changed → nothing to verify or undo.
ok=1
if diff -rq "$BACKUP/src" src >/dev/null; then
  echo "no code changes"
else
  sleep 15 # let the dev server recompile
  errs=$(npx tsc --noEmit -p . 2>&1 | grep "error TS" | grep -v "^\.next/")
  if [[ -n "$errs" ]]; then echo "tsc failed:"; echo "$errs"; ok=0; fi
  check() {
    for i in 1 2 3; do curl -sf -o /dev/null --max-time 120 "http://localhost:3100$1" && return 0; sleep 10; done
    echo "page failed: $1"; return 1
  }
  check /catalogo || ok=0
  check /erros || ok=0
  EDIT=$(sqlite3 data/gameday.db "SELECT id FROM edits ORDER BY rowid DESC LIMIT 1")
  [[ -n "$EDIT" ]] && { check "/render/$EDIT" || ok=0; }
fi

if [[ "$ok" == "0" ]]; then
  echo "verification failed, restoring backup"
  rsync -a --delete "$BACKUP/src/" src/
  sqlite3 data/gameday.db "UPDATE feedback SET resolved = 0, resolved_by = '', resolved_at = NULL, resolution = '' WHERE resolved_by = 'auto' AND resolved_at >= '$START_TS'"
  printf '%s\n\n%s\n' "Esta noite as correções foram desfeitas: depois delas o programa deixou de funcionar bem, por isso tudo voltou a ficar como estava. Os erros continuam abertos." "$(cat "$REPORT_FILE" 2>/dev/null)" >"$REPORT_FILE"
fi
if [[ ! -s "$REPORT_FILE" ]]; then
  if grep -q "claude.*exit [1-9]" "$LOG"; then
    printf 'Esta noite não foi possível ligar ao Claude (falha de rede ou serviço em baixo). Os erros continuam abertos; volta a tentar amanhã.\n' >"$REPORT_FILE"
  else
    printf 'A correção automática correu mas não deixou relatório.\n' >"$REPORT_FILE"
  fi
fi

# Keep the last 14 runs of backups, screenshots and logs.
for d in backups work; do
  ls -1d "$BASE/$d"/* 2>/dev/null | sort -r | tail -n +15 | xargs rm -rf
done
ls -1 "$BASE/logs"/* 2>/dev/null | sort -r | tail -n +43 | xargs rm -f
echo "== done"
