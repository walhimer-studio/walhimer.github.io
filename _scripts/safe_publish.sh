#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MSG="${1:-Publish catalog updates}"

echo "1/7 Layout guard..."
python3 _scripts/check_repo_layout.py

echo "2/7 Self-contained guard (all published HTML)..."
python3 _scripts/check_self_contained.py

echo "3/7 Reorder series by catalog index mtime..."
python3 _scripts/reorder_series_by_index_mtime.py

echo "4/7 Refresh catalog..."
python3 _scripts/refresh_catalog.py

echo "5/7 Catalog sync guard..."
python3 _scripts/check_catalog_sync.py

echo "6/7 Stage changes..."
git add -A

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

echo "7/7 Commit..."
git commit -m "$MSG"

echo "Push..."
git push origin main

echo "Done."
