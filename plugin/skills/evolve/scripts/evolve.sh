#!/usr/bin/env bash
# Bash wrapper for /vibe:evolve. Dispatches to the Python observer.
# Subcommands: record / reflect / revert (see observer.py for details).

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OBSERVER="$SCRIPT_DIR/observer.py"

if [[ ! -f "$OBSERVER" ]]; then
    echo "evolve: observer.py not found at $OBSERVER" >&2
    exit 2
fi

# Pause flag bypass
SESSION_ID="${CLAUDE_SESSION_ID:-}"
if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
    exit 0
fi

exec python3 "$OBSERVER" "$@"
