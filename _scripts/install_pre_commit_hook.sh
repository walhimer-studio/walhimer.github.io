#!/usr/bin/env bash
# Install a local pre-commit hook — self-contained + catalog sync guards.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK="$ROOT/.git/hooks/pre-commit"

cat > "$HOOK" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
python3 _scripts/check_catalog_mirror.py
python3 _scripts/check_self_contained.py
python3 _scripts/check_catalog_sync.py
EOF

chmod +x "$HOOK"
echo "Installed pre-commit hook: $HOOK"
echo "Runs:"
echo "  python3 _scripts/check_catalog_mirror.py"
echo "  python3 _scripts/check_self_contained.py"
echo "  python3 _scripts/check_catalog_sync.py"
