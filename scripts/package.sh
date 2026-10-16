#!/usr/bin/env bash
# Package Focus Extension for Chrome Web Store
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

OUT="focus-extension-v1.0.0.zip"
rm -f "$OUT"

zip -r "$OUT" .   --exclude ".git/*"   --exclude ".focus_history"   --exclude "scripts/*"   --exclude "tests/*"   --exclude "docs/*"   --exclude "*.zip"   --exclude ".DS_Store"

echo "✓ Packaged extension into $OUT"
