#!/usr/bin/env bash
# Check openFrameworks install — compile.project.mk must exist.
set -euo pipefail

OF_ROOT="${1:-}"

if [[ -z "$OF_ROOT" && -f "$(dirname "$0")/../launch.env" ]]; then
  # shellcheck disable=SC1091
  source "$(dirname "$0")/../launch.env"
fi

if [[ -z "$OF_ROOT" ]]; then
  OF_ROOT="${OF_ROOT:-$HOME/openFrameworks}"
fi

MK="$OF_ROOT/libs/openFrameworksCompiled/project/makefileCommon/compile.project.mk"

echo "OF_ROOT=$OF_ROOT"
echo

if [[ -f "$MK" ]]; then
  echo "✓ Valid openFrameworks install"
  echo "  $MK"
  exit 0
fi

echo "✗ Invalid OF_ROOT — core makefile missing:"
echo "  $MK"
echo
echo "Contents of $OF_ROOT:"
ls -la "$OF_ROOT" 2>/dev/null || echo "  (directory not found)"
echo
if [[ -d "$OF_ROOT/libs" ]]; then
  echo "Contents of $OF_ROOT/libs (first 20):"
  ls "$OF_ROOT/libs" 2>/dev/null | head -20
fi
echo
echo "Searching for compile.project.mk under $(dirname "$OF_ROOT")..."
find "$(dirname "$OF_ROOT")" -maxdepth 5 -name 'compile.project.mk' 2>/dev/null || true
echo
echo "Fix options:"
echo "  1. Re-unzip the full of_v0.12.1_osx_release.tar.gz (don't use a partial copy)"
echo "  2. Or clone the full repo:"
echo "       git clone --branch 0.12.1 --depth 1 https://github.com/openframeworks/openFrameworks.git ~/openFrameworks"
echo "       cd ~/openFrameworks && ./scripts/osx/download_libs.sh"
echo "       ./scripts/setup-openframeworks.sh ~/openFrameworks"
exit 1
