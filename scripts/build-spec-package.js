#!/usr/bin/env node
/**
 * Assemble the @mtdt/observeops-ds-spec npm package from the canonical design-system sources.
 * Copies only the consumer-facing spec (no Storybook, no internal process docs) into ./package/,
 * then writes spec.manifest.json (file list + sizes + checksums). Idempotent: regenerates the
 * copied artifacts each run, preserving the hand-authored package.json / index.js / README.md.
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const SRC = path.join(__dirname, '..')
const OUT = path.join(SRC, 'package')

// Artifacts this script owns (cleaned + recopied each run). Canonical package files are NOT here.
const SPEC_DIRS = ['components', 'tokens', 'layout', 'foundation', 'charts']
const SPEC_ROOT_FILES = ['AGENTS.md', 'llms.txt', 'authoring-playbook.md']

function rm(p) { fs.rmSync(p, { recursive: true, force: true }) }
function mkdir(p) { fs.mkdirSync(p, { recursive: true }) }
function copy(relFrom, relTo) {
  const from = path.join(SRC, relFrom)
  const to = path.join(OUT, relTo || relFrom)
  mkdir(path.dirname(to))
  fs.cpSync(from, to, { recursive: true })
}

// 1. clean previously generated artifacts (keep package.json / index.js / README.md)
for (const d of SPEC_DIRS) rm(path.join(OUT, d))
for (const f of [...SPEC_ROOT_FILES, 'spec.manifest.json']) rm(path.join(OUT, f))
mkdir(OUT)

// 2. components/ — selective: only the machine spec, not the internal *.md notes at its root
copy('components/index.json', 'components/index.json')
copy('components/registry', 'components/registry')
copy('components/recipes/recipes.json', 'components/recipes/recipes.json')
copy('components/recipes/README.md', 'components/recipes/README.md')
copy('components/specs', 'components/specs')
// the ACTUAL element API (attributes/events/SLOTS/enums) — so the MCP knows every SHIPPED obs-* tag (G8/G10)
copy('components-lib/dist/elements-api.json', 'elements-api.json')

// 2b. captured CHART configs — ship the data-viz fixtures + formatters + an index so an AI can COPY a real
//     Highcharts config. Formatter/event FUNCTIONS can't survive JSON (they were marked "«fn»"): strip them so the
//     config renders DIRECTLY with engine defaults, and record the stripped FORMATTER slots in each fixture's
//     `$formatters` so a consumer can re-attach a real formatter from charts/formatters.js for product-accurate
//     unit labels. Colours are DS tokens (var(--…)) → the SAME config renders in light AND dark.
const FIX_SRC = path.join(SRC, 'components-lib/site/fixtures')
if (fs.existsSync(FIX_SRC)) {
  mkdir(path.join(OUT, 'charts/fixtures'))
  const isFn = (v) => typeof v === 'string' && v.includes('«fn»') // "«fn»"
  const sanitize = (o, base, fmts) => {
    if (Array.isArray(o)) return o.map((x, i) => sanitize(x, `${base}[${i}]`, fmts))
    if (o && typeof o === 'object') {
      const out = {}
      for (const [k, v] of Object.entries(o)) {
        const p = `${base}.${k}`
        if (isFn(v)) { if (k === 'formatter') fmts.push(p); continue } // drop the «fn»; keep a note of real formatter slots
        out[k] = sanitize(v, p, fmts)
      }
      return out
    }
    return o
  }
  const dv = JSON.parse(fs.readFileSync(path.join(SRC, 'components/registry/data-viz.json'), 'utf8'))
  const fixtures = fs.readdirSync(FIX_SRC).filter((f) => f.endsWith('.json')).sort().map((f) => {
    const j = JSON.parse(fs.readFileSync(path.join(FIX_SRC, f), 'utf8'))
    const fmts = []
    if (j.config) j.config = sanitize(j.config, 'config', fmts)
    if (fmts.length) j.$formatters = fmts
    // the source $note describes the "«fn»" markers — now stripped, so make it accurate for the shipped config
    if (typeof j.$note === 'string' && j.$note.includes('«fn»')) {
      j.$note = fmts.length
        ? 'Renders directly (Highcharts.chart(config)); formatter/event functions were stripped for JSON so labels use engine defaults — attach a formatter from charts/formatters.js to the $formatters slots for product-accurate labels.'
        : 'Sanitised for JSON — renders directly.'
    }
    fs.writeFileSync(path.join(OUT, 'charts/fixtures', f), JSON.stringify(j, null, 2) + '\n')
    const eng = j.engines?.highcharts ? 'highcharts' : j.engines?.leaflet ? 'leaflet' : j.engines?.table ? 'table' : (j.config?.chart ? 'highcharts' : 'custom')
    return { name: f.replace('.json', ''), category: j.variant?.category ?? null, widgetType: j.variant?.widgetType ?? null, engine: eng, payload: j.config && Object.keys(j.config).length ? 'config' : 'result', formatterSlots: fmts.length, path: `charts/fixtures/${f}` }
  })
  copy('scripts/chart-formatters.js', 'charts/formatters.js')
  const manifest = {
    $note: dv.chartLibrary?.$note ?? '',
    usage: 'Copy a fixture\'s `config` and render with Highcharts v10: `Highcharts.chart(el, config)`. Formatter/event functions were stripped (they can\'t survive JSON), so labels use engine defaults out of the box. For product-accurate unit labels (bytes→GB, bits→Mbps, seconds→"2d 3h", …) attach a formatter from charts/formatters.js to the slots listed in each fixture\'s `$formatters` (see attachFormatters). Colours are DS tokens (var(--…)) — the SAME config renders in LIGHT and DARK when the DS theme CSS (@mtdt/observeops-ds-css) is loaded; no separate light/dark config needed.',
    engine: dv.chartLibrary?.engine ?? '',
    formatters: 'charts/formatters.js',
    total: fixtures.length,
    categories: dv.chartLibrary?.categories ?? [],
    fixtures,
  }
  fs.writeFileSync(path.join(OUT, 'charts/manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  console.log(`  charts: shipped ${fixtures.length} directly-renderable configs + formatters.js + manifest`)
}

// 3. tokens/ + layout/ + foundation/ — wholesale (every file in these is consumer-facing)
copy('tokens', 'tokens')
copy('layout', 'layout')
copy('foundation', 'foundation')

// 3b. conformance checker — ship it so external AI tools can self-verify their rendered output
//     against the DS (tokens/components/layout/philosophy). Runs with the consumer's own Playwright.
copy('scripts/ds-conformance.mjs', 'conformance/ds-conformance.mjs')
copy('scripts/conformance-README.md', 'conformance/README.md')
// per-variant rendered style-signature library (Phase 3b) — ships next to the checker so the variant
// style-match runs for consumers too. Regenerate with `node scripts/build-variant-refs.mjs`.
if (fs.existsSync(path.join(SRC, 'scripts/variant-refs.json'))) copy('scripts/variant-refs.json', 'conformance/variant-refs.json')

// 4. root contract + entry point
for (const f of SPEC_ROOT_FILES) copy(f, f)

// 5. manifest — walk the assembled package, hash every shipped file
const pkg = JSON.parse(fs.readFileSync(path.join(OUT, 'package.json'), 'utf8'))
const SKIP = new Set(['spec.manifest.json'])
function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name.endsWith('.tgz') || name.startsWith('.')) continue
    const abs = path.join(dir, name)
    const rel = path.relative(OUT, abs)
    if (fs.statSync(abs).isDirectory()) walk(abs, acc)
    else if (!SKIP.has(rel)) acc.push(rel)
  }
  return acc
}
const files = walk(OUT).sort().map((rel) => {
  const buf = fs.readFileSync(path.join(OUT, rel))
  return { path: rel, bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex') }
})

const index = JSON.parse(fs.readFileSync(path.join(OUT, 'components/index.json'), 'utf8'))
const recipes = JSON.parse(fs.readFileSync(path.join(OUT, 'components/recipes/recipes.json'), 'utf8'))
const registries = fs.readdirSync(path.join(OUT, 'components/registry')).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
const specs = fs.readdirSync(path.join(OUT, 'components/specs')).filter((f) => f.endsWith('.md'))

const manifest = {
  name: pkg.name,
  version: pkg.version,
  generated: new Date().toISOString(),
  entry: 'llms.txt',
  contract: 'AGENTS.md',
  playbook: 'authoring-playbook.md',
  index: 'components/index.json',
  counts: {
    components: (index.components || []).length,
    registries: registries.length,
    recipes: (recipes.recipes || []).length,
    specs: specs.length,
    files: files.length,
  },
  files,
}
fs.writeFileSync(path.join(OUT, 'spec.manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

console.log(`Built ${pkg.name}@${pkg.version}`)
console.log(`  components=${manifest.counts.components} registries=${manifest.counts.registries} recipes=${manifest.counts.recipes} specs=${manifest.counts.specs}`)
console.log(`  ${files.length} files shipped → ${OUT}`)
