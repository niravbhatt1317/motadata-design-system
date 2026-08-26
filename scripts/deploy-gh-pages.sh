#!/usr/bin/env bash
#
# Build Storybook and publish ONLY the static output to a public GitHub repo's
# gh-pages branch (product source stays private on Azure DevOps).
#
# Usage:  design-system/scripts/deploy-gh-pages.sh <owner/repo>
# Example: design-system/scripts/deploy-gh-pages.sh niravbhatt1317/motadata-design-system
#
# Prereqs: Node 18 (nvm), gh CLI authenticated, the target public repo created.
# After first deploy, enable Pages once:
#   gh api -X POST repos/<owner/repo>/pages -f source.branch=gh-pages -f source.path=/
# Site URL: https://<owner>.github.io/<repo>/

set -euo pipefail

REPO="${1:?usage: deploy-gh-pages.sh <owner/repo>}"
UI_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$UI_DIR"

# Use the pinned Node 18 (Storybook's Vue 2 build target).
if [ -d "$HOME/.nvm/versions/node/v18.20.8/bin" ]; then
  export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"
fi
echo "node $(node -v)"

# ── Pre-flight: GitHub Pages has a ~10-builds/HOUR soft limit. Deploying after every micro-fix trips it →
#    new pages 404 while builds fail INSTANTLY ("Page build failed", duration 0ms) and the pipeline wedges.
#    Abort early (before the slow Storybook build) if we're near the cap or already wedged. Override: FORCE_DEPLOY=1.
if command -v gh >/dev/null 2>&1; then
  echo "==> Pre-flight: checking GitHub Pages build budget for ${REPO}..."
  PF="$(gh api "repos/$REPO/pages/builds?per_page=15" 2>/dev/null | node -e '
    let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      let a=[];try{a=JSON.parse(s)}catch(e){console.log("UNKNOWN 0 idle");return}
      if(!Array.isArray(a)){console.log("UNKNOWN 0 idle");return}
      const hourAgo=Date.now()-3600e3;
      const recent=a.filter(b=>b.created_at&&Date.parse(b.created_at)>hourAgo);
      const errored=recent.filter(b=>b.status==="errored").length;
      const building=a.some(b=>b.status==="building")?"building":"idle";
      console.log(recent.length+" "+errored+" "+building);
    });' 2>/dev/null || echo "UNKNOWN 0 idle")"
  RECENT=$(echo "$PF" | awk '{print $1}'); ERRORED=$(echo "$PF" | awk '{print $2}'); STUCK=$(echo "$PF" | awk '{print $3}')
  echo "   builds in the last hour: ${RECENT}  (errored: ${ERRORED})  ·  a build is currently: ${STUCK}"
  if [ "${FORCE_DEPLOY:-0}" != "1" ] && [ "$RECENT" != "UNKNOWN" ]; then
    if [ "${RECENT:-0}" -ge 8 ] 2>/dev/null; then
      echo ""
      echo "   ⛔ ~${RECENT} Pages builds already this hour (soft limit ~10). Deploying now risks the rate limit →"
      echo "      new pages 404 + 'Page build failed'. BATCH your changes and deploy ONCE; the npm publish is the"
      echo "      real deliverable and the site can lag. Wait for the hour to reset, or re-run with FORCE_DEPLOY=1."
      exit 2
    fi
    if [ "$STUCK" = "building" ] || [ "${ERRORED:-0}" -ge 2 ] 2>/dev/null; then
      echo ""
      echo "   ⚠ The Pages pipeline looks WEDGED (a build stuck 'building', or repeated 'errored'). Another push"
      echo "     likely won't publish. Fix: wait ~1h for the rate limit to reset, or (owner) Settings→Pages toggle"
      echo "     Source off then back to gh-pages /. Re-run with FORCE_DEPLOY=1 to push anyway."
      exit 2
    fi
  fi
fi

# GATE: icon/reuse ratchet — no element may ship inlining an SVG icon (must compose <obs-icon>) or a raw
# control. HARD-FAILS on any NEW violation vs .icon-debt-baseline.json. This is the enforcement that makes
# the match-component reuse rule un-skippable at deploy — do not bypass; fix the component instead.
echo "==> Icon/reuse deploy gate (match-component structural ratchet)…"
if ! node "$UI_DIR/design-system/scripts/icon-reuse-preflight.mjs"; then
  echo "    Deploy blocked: a component inlines an SVG icon / raw control. Fix it to use <obs-icon> + DS components, then re-deploy."
  exit 3
fi

# Build the Web Components bundle first so dist/ exists (the Elements showcase site embeds it).
echo "==> Building the Web Components bundle (obs-*)…"
( cd "$UI_DIR/design-system/components-lib" && npm run build )

echo "==> Building Storybook…"
npm run build-storybook

OUT="$UI_DIR/storybook-static"
[ -d "$OUT" ] || { echo "build output not found at $OUT"; exit 1; }

# Bundle the token gallery into the site so GitHub Pages serves it as text/html (it RENDERS;
# jsDelivr/unpkg serve .html as text/plain = raw code). Same-origin → linkable from Storybook.
echo "==> Bundling the token gallery (tokens.html)…"
node "$UI_DIR/design-system/scripts/build-css-package.js" >/dev/null
cp "$UI_DIR/design-system/css-package/dist/tokens.html" "$OUT/tokens.html"
cp "$UI_DIR/design-system/css-package/dist/observeops-ds.css" "$OUT/observeops-ds.css"

# The "Elements" showcase site — the installable Web Components library's own minimal site, deployed
# at a subpath (separate audience from the product Storybook). It embeds the bundle built above and
# self-hosts the token CSS. Generator emits only ./-relative paths so it works under /elements/.
echo "==> Building the Elements showcase site…"
( cd "$UI_DIR/design-system/components-lib" && npm run site:build )
mkdir -p "$OUT/elements"
cp -R "$UI_DIR/design-system/components-lib/site/dist/." "$OUT/elements/"
cp "$UI_DIR/design-system/css-package/dist/observeops-ds.css" "$OUT/elements/observeops-ds.css"

# The interactive Component Catalog ("pick a component" table) — regenerated from the registry +
# the freshly-built obs-* bundle, then served at the gh-pages root as a self-contained page.
echo "==> Building the Component Catalog (component-catalog.html)…"
node "$UI_DIR/design-system/scripts/build-catalog.mjs"
cp "$UI_DIR/design-system/component-catalog.html" "$OUT/component-catalog.html"

# .nojekyll prevents GitHub Pages (Jekyll) from dropping files; CNAME-free.
touch "$OUT/.nojekyll"

echo "==> Publishing $OUT to $REPO (gh-pages)…"
TMP="$(mktemp -d)"
cp -R "$OUT/." "$TMP/"
# Strip source maps so the public site can't reconstruct original component source.
find "$TMP" -name '*.map' -delete
cd "$TMP"
git init -q
git add -A
git -c user.email=ds@motadata.local -c user.name="design-system" commit -qm "Deploy Storybook"
git branch -M gh-pages
# The static bundle is ~18MB; a plain push often disconnects mid-transfer over a flaky
# link ("the remote end hung up unexpectedly" / "unexpected disconnect while reading sideband
# packet"). A larger post-buffer + disabled compression + lenient low-speed window pushes it
# through reliably. Retry once on failure as a belt-and-braces guard.
push_site() {
  git -c http.postBuffer=1048576000 \
      -c http.lowSpeedLimit=1000 \
      -c http.lowSpeedTime=300 \
      -c core.compression=0 \
      push -f "https://github.com/${REPO}.git" gh-pages
}

# Guard against Pages "Deployment cancelled": GitHub runs its own "pages build and deployment" workflow on
# every push to gh-pages. Pushing while a previous deployment is still running CANCELS that older one. So we
# wait for any in-flight Pages run to finish before pushing — back-to-back deploys then queue instead of
# cancelling. Best-effort: needs the gh CLI + auth; if unavailable, it simply proceeds.
wait_for_pages() {
  command -v gh >/dev/null 2>&1 || return 0
  local waited=0 fresh now
  while :; do
    now=$(date -u +%s)
    # Count only RECENT (< 12 min) in-progress/queued runs — GitHub Pages sometimes leaves a stale/phantom
    # "queued" run that never completes; a stuck old one must NOT block every future deploy.
    fresh=$(gh run list --repo "$REPO" --limit 20 --json status,createdAt --jq \
      "[.[] | select(.status==\"in_progress\" or .status==\"queued\") | select(($now - (.createdAt|fromdateiso8601)) < 720)] | length" 2>/dev/null || echo err)
    [ "$fresh" = "err" ] && return 0                      # gh not authed / API hiccup → don't block the deploy
    if [ "${fresh:-0}" -eq 0 ]; then break; fi
    if [ "$waited" -ge 150 ]; then echo "  (a Pages deployment is still running after 2.5m — proceeding anyway)"; break; fi
    echo "  ⏳ a previous Pages deployment is still in progress — waiting 10s so this push doesn't cancel it…"
    sleep 10; waited=$((waited + 10))
  done
}

wait_for_pages
push_site || { echo "==> push failed, retrying once…"; sleep 3; push_site; }
cd "$UI_DIR"
rm -rf "$TMP"

echo "==> Done. If first deploy, enable Pages, then visit:"
echo "    https://${REPO%%/*}.github.io/${REPO##*/}/"
