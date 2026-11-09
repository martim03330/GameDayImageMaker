#!/bin/zsh
# Nightly "new looks" routine: Claude Code turns new Pinterest pins (Inspiração) into new looks.
# Safety net: backs up the code first and restores it (and the pins it marked) if the app no longer
# type-checks or renders. Started by the app itself at night (src/lib/routines.ts) or by hand:
#   zsh scripts/auto-learn/run.sh [maxLooks]

set -u
PROJECT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT" || exit 1
export PATH="$HOME/.local/share/mise/installs/node/22.11.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
MAX_LOOKS="${1:-3}"

STAMP="$(date +%Y-%m-%d_%H%M)"
BASE="$PROJECT/data/auto-learn"
WORK_DIR="$BASE/work/$STAMP"
BACKUP="$BASE/backups/$STAMP"
REPORT_FILE="$BASE/reports/$STAMP.md"
LOG="$BASE/logs/$STAMP.log"
mkdir -p "$WORK_DIR" "$BACKUP" "$BASE/reports" "$BASE/logs"
exec >>"$LOG" 2>&1
echo "== auto-learn $STAMP (max $MAX_LOOKS)"

# One run at a time (and never together with the fixing routine: both edit src/).
LOCK="$PROJECT/data/.routine.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "another routine is running"; exit 0
fi
cleanup() { rmdir "$LOCK" 2>/dev/null; pkill -f chrome-headless-shell 2>/dev/null; }
trap cleanup EXIT

NEW=$(sqlite3 data/gameday.db "SELECT count(*) FROM inspiration WHERE dismissed = 0 AND status = ''")
if [[ "$NEW" == "0" ]]; then
  echo "no new pins"; rmdir "$WORK_DIR" "$BACKUP" 2>/dev/null; exit 0
fi

CLAUDE="$(command -v claude || true)"
if [[ -z "$CLAUDE" ]]; then
  CLAUDE="$(ls -d "$HOME"/.vscode/extensions/anthropic.claude-code-*/resources/native-binary/claude 2>/dev/null | sort -V | tail -1)"
fi
if [[ -z "$CLAUDE" || ! -x "$CLAUDE" ]]; then
  echo "claude CLI not found"
  printf 'Os estilos novos não foram criados: não encontrei o Claude Code neste computador.\n' >"$REPORT_FILE"
  exit 1
fi

if ! curl -sf -o /dev/null --max-time 60 http://localhost:3100/catalogo; then
  echo "app not running"; printf 'Os estilos novos não foram criados: a app não estava a correr.\n' >"$REPORT_FILE"; exit 1
fi

rsync -a src/ "$BACKUP/src/"
# Pins already turned into looks on earlier nights: a failed run only un-marks its own.
USED_BEFORE=$(sqlite3 data/gameday.db "SELECT group_concat(quote(id)) FROM inspiration WHERE status = 'used'")
NEW_LOOKS_BEFORE=$(sqlite3 data/gameday.db "SELECT value FROM settings WHERE key = 'new_looks'")

PROMPT="$(sed -e "s#\$WORK_DIR#$WORK_DIR#g" -e "s#\$REPORT_FILE#$REPORT_FILE#g" -e "s#\$MAX_LOOKS#$MAX_LOOKS#g" scripts/auto-learn/prompt.md)"
PROMPT="$PROMPT

WORK_DIR = $WORK_DIR
REPORT_FILE = $REPORT_FILE
Today is $(date +%Y-%m-%d)."

"$CLAUDE" -p "$PROMPT" \
  --permission-mode acceptEdits \
  --allowedTools "Read" "Edit" "Write" "Glob" "Grep" \
    "Bash(sqlite3:*)" "Bash(node scripts/check/shot-look.mjs:*)" "Bash(node scripts/check/looks.mjs:*)" \
    "Bash(npx tsc:*)" "Bash(curl -s http://localhost:3100:*)" "Bash(ls:*)" "Bash(grep:*)" "Bash(rm src/templates/:*)" \
  --max-budget-usd 12
echo "claude exit $?"

# Verify: types check, the catalogue and an edit still render; otherwise put everything back.
ok=1
if diff -rq "$BACKUP/src" src >/dev/null; then
  echo "no code changes"
else
  sleep 20 # let the dev server recompile
  errs=$(npx tsc --noEmit -p . 2>&1 | grep "error TS" | grep -v "^\.next/" | grep -v "^data/")
  if [[ -n "$errs" ]]; then echo "tsc failed:"; echo "$errs"; ok=0; fi
  check() {
    for i in 1 2 3; do curl -sf -o /dev/null --max-time 180 "http://localhost:3100$1" && return 0; sleep 10; done
    echo "page failed: $1"; return 1
  }
  check "/catalogo?player=moises&type=matchday" || ok=0
  check /inspiracao || ok=0
  EDIT=$(sqlite3 data/gameday.db "SELECT id FROM edits ORDER BY rowid DESC LIMIT 1")
  [[ -n "$EDIT" ]] && { check "/render/$EDIT" || ok=0; }
fi

if [[ "$ok" == "0" ]]; then
  echo "verification failed, restoring backup"
  rsync -a --delete "$BACKUP/src/" src/
  sqlite3 data/gameday.db "UPDATE inspiration SET status = '', look_id = NULL, note = '' WHERE status = 'used' AND id NOT IN (${USED_BEFORE:-''})" \
    "$( [[ -n "$NEW_LOOKS_BEFORE" ]] && echo "UPDATE settings SET value = '$NEW_LOOKS_BEFORE' WHERE key = 'new_looks'" || echo "DELETE FROM settings WHERE key = 'new_looks'" )"
  printf '%s\n\n%s\n' "Esta noite os estilos novos foram desfeitos: depois deles a app deixou de funcionar bem, por isso tudo voltou a ficar como estava. Os pins voltam a ser tentados amanhã." "$(cat "$REPORT_FILE" 2>/dev/null)" >"$REPORT_FILE"
fi
if [[ ! -s "$REPORT_FILE" ]]; then
  if grep -q "claude exit [1-9]" "$LOG"; then
    printf 'Esta noite não foi possível ligar ao Claude (falha de rede, serviço em baixo ou limite de utilização). Volta a tentar amanhã.\n' >"$REPORT_FILE"
  else
    printf 'A rotina correu mas não deixou relatório.\n' >"$REPORT_FILE"
  fi
fi

for d in backups work; do
  ls -1d "$BASE/$d"/* 2>/dev/null | sort -r | tail -n +15 | xargs rm -rf
done
ls -1 "$BASE/logs"/* 2>/dev/null | sort -r | tail -n +31 | xargs rm -f
echo "== done"
