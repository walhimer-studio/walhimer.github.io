#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MSG="${1:-Publish catalog updates}"

echo "1/8 Catalog mirror guard..."
python3 _scripts/check_catalog_mirror.py

echo "2/8 Layout guard..."
python3 _scripts/check_repo_layout.py

echo "3/8 Self-contained guard (all published HTML)..."
python3 _scripts/check_self_contained.py

echo "4/8 Reorder series by catalog index mtime..."
python3 _scripts/reorder_series_by_index_mtime.py

echo "5/8 Refresh catalog..."
python3 _scripts/refresh_catalog.py

echo "6/8 Catalog sync guard..."
python3 _scripts/check_catalog_sync.py

echo "7/8 Stage changes..."
git add data/catalog.json sketches/index.html sketches/catalog-work.html
git add -u

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

echo "8/8 Commit..."
git commit -m "$MSG"

echo "Push..."
git push origin main

echo "Done."
