#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MSG="${1:-Publish catalog updates}"

echo "1/6 Layout guard..."
python3 _scripts/check_repo_layout.py

echo "2/6 Self-contained guard (all published HTML)..."
python3 _scripts/check_self_contained.py

echo "3/6 Refresh catalog..."
python3 _scripts/refresh_catalog.py

echo "4/6 Stage changes..."
git add -A

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

echo "5/6 Commit..."
git commit -m "$MSG"

echo "6/6 Push..."
git push origin main

echo "Done."
