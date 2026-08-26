#!/usr/bin/env bash
# with-deploy-lock.sh — serialize build+deploy across parallel Claude sessions.
#
# Two sessions (e.g. one running `storybook-component`, one running `match-component`) must NOT run
# `npm run build` / `build-storybook` / deploy-gh-pages.sh at the same time — they write the same
# storybook-static/ + components-lib/dist/ and force-push the same gh-pages branch. This wrapper takes
# an atomic lock (portable mkdir — macOS has no flock), runs the command, then releases it.
#
# Usage:
#   bash design-system/scripts/with-deploy-lock.sh <repo>                 # locked deploy (default cmd)
#   bash design-system/scripts/with-deploy-lock.sh --cmd "npm run build"  # lock any build/deploy command
#
# Env: LOCK_WAIT (max seconds to wait for the lock, default 1800) · LOCK_STALE (secs before a held lock
#      is considered abandoned, default 3600).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCK_DIR="$HERE/../.deploy.lock"           # design-system/.deploy.lock (a directory = the mutex)
LOCK_WAIT="${LOCK_WAIT:-1800}"
LOCK_STALE="${LOCK_STALE:-3600}"

# Build the command to run under the lock.
if [ "${1:-}" = "--cmd" ]; then
  shift; CMD=("$@")
else
  REPO="${1:-niravbhatt1317/motadata-design-system}"
  CMD=(bash "$HERE/deploy-gh-pages.sh" "$REPO")
fi

now() { date +%s; }

acquire() {
  local waited=0
  while ! mkdir "$LOCK_DIR" 2>/dev/null; do
    # Break a stale lock (holder died without releasing).
    if [ -f "$LOCK_DIR/started" ]; then
      local age=$(( $(now) - $(cat "$LOCK_DIR/started" 2>/dev/null || echo 0) ))
      if [ "$age" -gt "$LOCK_STALE" ]; then
        echo "==> breaking stale deploy lock (held ${age}s > ${LOCK_STALE}s)"; rm -rf "$LOCK_DIR"; continue
      fi
    fi
    if [ "$waited" -ge "$LOCK_WAIT" ]; then
      echo "✗ could not acquire deploy lock after ${LOCK_WAIT}s (held by: $(cat "$LOCK_DIR/owner" 2>/dev/null || echo unknown))" >&2
      exit 1
    fi
    echo "  ⏳ another build/deploy holds the lock ($(cat "$LOCK_DIR/owner" 2>/dev/null || echo '?')) — waiting…"
    sleep 5; waited=$(( waited + 5 ))
  done
  now > "$LOCK_DIR/started"
  echo "${DEPLOY_OWNER:-$$@$(hostname -s 2>/dev/null || echo host)}" > "$LOCK_DIR/owner"
  trap 'rm -rf "$LOCK_DIR"' EXIT INT TERM
}

echo "==> acquiring deploy lock ($LOCK_DIR)…"
acquire
echo "==> lock held; running: ${CMD[*]}"
"${CMD[@]}"
echo "==> done; releasing lock"
