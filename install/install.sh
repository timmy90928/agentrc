#!/usr/bin/env sh
# agentrc installer — macOS/Linux thin wrapper. Runs the cross-platform install.py.
# Usage:  ./install/install.sh [--dry-run] [--tool claude|gemini|all]
set -eu
here="$(cd "$(dirname "$0")" && pwd)"

if command -v python3 >/dev/null 2>&1; then
  py=python3
elif command -v python >/dev/null 2>&1; then
  py=python
else
  echo "Python not found on PATH (need python3 or python)." >&2
  exit 1
fi

exec "$py" "$here/install.py" "$@"
