#!/usr/bin/env bash
# Install a local pre-commit hook — full-repo self-contained check.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK="$ROOT/.git/hooks/pre-commit"

cat > "$HOOK" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
python3 _scripts/check_self_contained.py
EOF

chmod +x "$HOOK"
echo "Installed pre-commit hook: $HOOK"
echo "Runs full-repo check: python3 _scripts/check_self_contained.py"
