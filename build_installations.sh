#!/bin/bash
# Build self-contained installations (run from dist/ or :archive:/dist/)
# Requires: Python 3, images.zip, salamander.zip, shared-ground source

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "→ Building installations..."
echo "  (bloom-release, shared-ground built via Python scripts)"
echo "  Run: python3 inject_salamander.py    # for bloom-release"
echo "  Run: python3 build_shared_ground.py  # for shared-ground"
echo ""
echo "→ Installations are self-contained. Push when ready:"
echo "  git add installations/ && git commit -m 'Update installations' && git push origin main"
