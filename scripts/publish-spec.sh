#!/usr/bin/env bash
#
# One-command release for @mtdt/observeops-ds-spec.
#   Run from anywhere:  bash design-system/scripts/publish-spec.sh
#
# Does: build the package from canonical sources -> validate -> guard against
# re-publishing an existing version -> npm publish. Stops on the first failure.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PKG_DIR="$SCRIPT_DIR/../package"
cd "$PKG_DIR"

NAME="$(node -p "require('./package.json').name")"
VER="$(node -p "require('./package.json').version")"

echo "▶ Building ${NAME}@${VER} ..."
node "$SCRIPT_DIR/build-spec-package.js"

echo "▶ Validating (spec package) ..."
node "$SCRIPT_DIR/validate-spec.js"

echo "▶ Validating (registries — schema + decision-grade + counts) ..."
node "$SCRIPT_DIR/validate-registries.mjs"

# Guard: npm rejects re-publishing an existing version — catch it early with a clear message.
if npm view "${NAME}@${VER}" version >/dev/null 2>&1; then
  echo ""
  echo "✗ ${NAME}@${VER} is already published."
  echo "  Bump \"version\" in design-system/package/package.json, then re-run."
  echo "  (patch = fixes/clarifications · minor = added components/tokens · major = breaking)"
  exit 1
fi

echo "▶ Publishing ${NAME}@${VER} ..."
npm publish

echo "✓ Published ${NAME}@${VER}"
echo "  npm:      https://www.npmjs.com/package/${NAME}"
echo "  CDN:      https://cdn.jsdelivr.net/npm/${NAME}@${VER}/llms.txt  (allow a few min to propagate)"
