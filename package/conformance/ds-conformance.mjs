#!/usr/bin/env node
/**
 * ds-conformance.mjs — score how well a rendered page conforms to the ObserveOps design system.
 *
 * Unlike match-component/diff.mjs (a 1:1 A/B comparator driven by hand-authored selectors), this is a
 * SPEC-FREE membership checker: it renders ANY page (a URL or an HTML file), auto-enumerates every element,
 * and measures conformance against the DS reference sets — the token palette (tokens/variables.json), the
 * structural scale (tokens/structural.json), and the philosophy rules (tokens/purpose-map.json $rules).
 *
 * Four dimensions → a 0–100 score + a violations list:
 *   1. Token adherence     — every rendered colour maps to a DS token (else: off-token + nearest token).
 *   2. Layout adherence    — paddings / radii land on the structural scale.
 *   3. Philosophy adherence — theme-aware (surfaces flip light↔dark), no `mds-*`, brand not blue/cyan.
 *   4. Component adherence  — interactive controls carry a DS component/class signature (advisory).
 *
 * Usage:  node ds-conformance.mjs <url-or-file.html> [--theme light|dark] [--json <out>] [--quiet]
 *   env:  CHROME (Chrome executable), UI_ROOT
 *
 * Reuses the diff.mjs engine idea: a tiny static server + Chromium + getComputedStyle extraction.
 * Shipped in the spec package (conformance/) so external AI tools can self-verify their render.
 */
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const UI_ROOT = process.env.UI_ROOT || path.resolve(HERE, '..', '..')
const DS = path.resolve(HERE, '..')
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const args = process.argv.slice(2)
const target = args.find((a) => !a.startsWith('--'))
const theme = (args[args.indexOf('--theme') + 1] && args.includes('--theme')) ? args[args.indexOf('--theme') + 1] : 'light'
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null
const QUIET = args.includes('--quiet')
const declaredArg = args.includes('--declared') ? args[args.indexOf('--declared') + 1] : null
const declareInline = args.includes('--declare') ? args[args.indexOf('--declare') + 1] : null
if (!target) { console.error('usage: node ds-conformance.mjs <url-or-file.html> [--theme light|dark] [--declared gaps.json] [--json out] [--quiet]'); process.exit(2) }

// ── declared-gaps manifest (Phase 3a — STOP-and-ASK enforcement) ─────────────
// A build that legitimately needed a block the DS lacks (chart/topology/…) must DECLARE it (it STOP-and-ASK'd
// and got approval). Any non-DS / fabricated element NOT covered by a declared entry is a hard contract breach.
// Manifest: JSON array of strings (keyword/tag) or objects { match|kind|tag|keyword, reason }. Also inline via
// --declare "chart,topology". Missing manifest = nothing declared = every non-DS element is a breach.
function loadDeclared() {
  const raw = []
  if (declaredArg && fs.existsSync(declaredArg)) {
    try { const j = JSON.parse(fs.readFileSync(declaredArg, 'utf8')); const arr = Array.isArray(j) ? j : (j.declaredGaps || j.gaps || []); for (const e of arr) raw.push(e) } catch { /* ignore malformed */ }
  }
  if (declareInline) for (const s of declareInline.split(',')) raw.push(s.trim())
  return raw.map((e) => (typeof e === 'string' ? { keyword: e.toLowerCase(), reason: '' } : { keyword: String(e.match || e.kind || e.tag || e.keyword || '').toLowerCase(), reason: e.reason || '' })).filter((m) => m.keyword)
}
const DECLARED = loadDeclared()
const isDeclared = (...hay) => { const s = hay.filter(Boolean).join(' ').toLowerCase(); return DECLARED.find((d) => s.includes(d.keyword)) || null }

// ── variant style-match reference library (Phase 3b) ─────────────────────────
// Refs are THEME-SPECIFIC — a dark render must be compared to dark references, else every instance false-flags
// as off-reference (the light navy ≠ the dark navy). variant-refs.json ships { refs: { light:{…}, dark:{…} } };
// we pick the set matching the run theme, and if it's absent we SKIP style-match rather than compare cross-theme.
function loadRefsDoc() {
  for (const p of [path.join(HERE, 'variant-refs.json'), path.join(DS, 'conformance', 'variant-refs.json')]) {
    if (fs.existsSync(p)) { try { return JSON.parse(fs.readFileSync(p, 'utf8')).refs || null } catch { /* next */ } }
  }
  return null
}
const _refsDoc = loadRefsDoc()
// themed shape has a `light`/`dark` key; a legacy flat shape (tag→…) is treated as light-only.
const _themed = _refsDoc && (_refsDoc.light || _refsDoc.dark)
const VARIANT_REFS = _themed ? (_refsDoc[theme] || null) : (theme === 'light' ? _refsDoc : null)

// ── colour parsing / palette ─────────────────────────────────────────────────
const NAMED = { white: [255, 255, 255, 1], black: [0, 0, 0, 1], red: [255, 0, 0, 1], transparent: [0, 0, 0, 0] }
function parseColor(s) {
  if (!s) return null
  s = String(s).trim().toLowerCase()
  if (NAMED[s]) return NAMED[s]
  let m = s.match(/^#([0-9a-f]{3,8})$/)
  if (m) {
    let h = m[1]
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    if (h.length === 4) h = h.split('').map((c) => c + c).join('')
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16)
    const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
    return [r, g, b, a]
  }
  m = s.match(/^rgba?\(([^)]+)\)/)
  if (m) {
    const p = m[1].split(',').map((x) => parseFloat(x.trim()))
    return [p[0] | 0, p[1] | 0, p[2] | 0, p[3] == null ? 1 : p[3]]
  }
  return null // gradients, fade(), none, shadows, non-colours
}
function buildPalette() {
  const V = JSON.parse(fs.readFileSync(path.join(DS, 'tokens', 'variables.json'), 'utf8'))
  const pal = []
  for (const [name, v] of Object.entries(V)) {
    if (name.startsWith('$')) continue
    for (const k of ['light', 'dark']) {
      const c = parseColor(v[k])
      if (c) pal.push({ name, theme: k, c })
    }
  }
  // kit-accents.json — the sanctioned Ant form-control accent (cyan @primary-color #099dd9, radio dot /
  // checkbox check / select). These are legitimate DS colours; without them the cyan false-flags as off-token.
  try {
    const K = JSON.parse(fs.readFileSync(path.join(DS, 'tokens', 'kit-accents.json'), 'utf8'))
    const walk = (o, name) => { for (const [k, v] of Object.entries(o)) { if (v && typeof v === 'object') walk(v, k); else { const c = parseColor(v); if (c) pal.push({ name: name || k, theme: 'kit', c }) } } }
    walk(K, null)
  } catch { /* optional */ }
  return pal
}
const CYAN = [9, 157, 217] // @primary-color — the ONLY sanctioned accent-blue; not a brand-navy breach
const dist = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]))
const TOL = 5
function nearest(c, pal) {
  let best = null
  for (const p of pal) {
    const d = dist(c, p.c) + Math.abs((c[3] ?? 1) - (p.c[3] ?? 1)) * 40
    if (!best || d < best.d) best = { d, name: p.name, val: p.c, alphaOk: Math.abs((c[3] ?? 1) - (p.c[3] ?? 1)) <= 0.1 }
  }
  return best
}

// ── structural scale ─────────────────────────────────────────────────────────
function buildScale() {
  const S = JSON.parse(fs.readFileSync(path.join(DS, 'tokens', 'structural.json'), 'utf8'))
  const set = new Set([0])
  const walk = (o) => { for (const v of Object.values(o)) { if (v && typeof v === 'object') walk(v); else if (typeof v === 'string') for (const m of v.matchAll(/(\d+(?:\.\d+)?)px/g)) set.add(parseFloat(m[1])) } }
  walk(S)
  return [...set]
}
const onScale = (v, scale) => scale.some((s) => Math.abs(s - v) <= 1)

// ── variant/state fidelity: valid values per component, from the registry ─────
const TAGMAP = { 'obs-button': 'button', 'obs-input': 'input', 'obs-tag': 'tag', 'obs-radio': 'radio', 'obs-select': 'select', 'obs-severity': 'severity', 'obs-checkbox': 'checkbox', 'obs-switch': 'switch', 'obs-link': 'link', 'obs-tags': 'loose-tags', 'obs-date-time-picker': 'date-time-pickers', 'obs-filters': 'filters' }
const _regCache = {}
function validValues(tag) {
  const id = TAGMAP[tag]; if (!id) return null
  if (_regCache[id] !== undefined) return _regCache[id]
  const p = path.join(DS, 'components', 'registry', `${id}.json`)
  if (!fs.existsSync(p)) return (_regCache[id] = null)
  const r = JSON.parse(fs.readFileSync(p, 'utf8'))
  const props = r.props || {}
  const enumOf = (k) => (props[k] && Array.isArray(props[k].enum) && props[k].enum.length ? props[k].enum : null)
  // `variantEnum` / `severityEnum` are purpose-built fields listing the CANONICAL DS variant values that
  // match the obs-* component + the CSS-class form (e.g. tag-green) — the values a rendered page actually
  // uses. (The product-API `props.variant.enum` documents MTag's raw variants, which differ.) size/type
  // use the reliable prop enum.
  return (_regCache[id] = { id,
    variant: (Array.isArray(r.variantEnum) && r.variantEnum.length) ? r.variantEnum : null,
    severity: (Array.isArray(r.severityEnum) && r.severityEnum.length) ? r.severityEnum : null,
    size: enumOf('size'), type: enumOf('type') })
}

// ── static server (reused from diff.mjs) ─────────────────────────────────────
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff': 'font/woff', '.woff2': 'font/woff2' }
function serve(root) {
  return http.createServer((q, r) => {
    let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'
    fs.readFile(path.join(root, u), (e, b) => { if (e) { r.writeHead(404); r.end() } else { r.writeHead(200, { 'Content-Type': MIME[path.extname(u).toLowerCase()] || 'application/octet-stream' }); r.end(b) } })
  })
}

// browser-side measurement — auto-enumerate every element
const MEASURE = () => {
  const colors = [], spaces = []
  for (const el of document.querySelectorAll('*')) {
    const c = getComputedStyle(el)
    const tag = el.tagName.toLowerCase()
    const add = (prop, val) => { if (val && val !== 'none' && val !== 'rgba(0, 0, 0, 0)') colors.push({ prop, val, tag }) }
    add('background', c.backgroundColor)
    add('color', c.color)
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      if (parseFloat(c['border' + side + 'Width']) > 0 && c['border' + side + 'Style'] !== 'none') add('border', c['border' + side + 'Color'])
    }
    for (const p of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius']) {
      const v = parseFloat(c[p]); if (v > 0) spaces.push({ prop: p, val: Math.round(v * 10) / 10 })
    }
  }
  // ── component fidelity ─────────────────────────────────────────────────────
  // A DS component (obs-*) renders its real control in SHADOW DOM, so any RAW interactive element in the
  // light DOM is a non-DS control that should be a DS component. And a styled <span>/<div> chip that isn't
  // a DS component is a fabricated look-alike (should be obs-tag / obs-severity).
  const DS = ['obs-button','obs-input','obs-select','obs-switch','obs-checkbox','obs-radio','obs-link','obs-tag','obs-severity','obs-tags','obs-tooltip','obs-date-time-picker','obs-filters','obs-selected-pills']
  const SUGGEST = { button:'obs-button', input:'obs-input', textarea:'obs-input', select:'obs-select', a:'obs-link' }
  const insideCE = (el) => { let n = el.parentElement; while (n) { if (n.tagName.includes('-')) return true; n = n.parentElement } return false }
  const dsInteractive = document.querySelectorAll('obs-button,obs-input,obs-select,obs-switch,obs-checkbox,obs-radio,obs-link').length
  const rawControls = [...document.querySelectorAll('button,input:not([type=hidden]),select,textarea,a[href],[role=button],[role=switch],[role=checkbox],[role=radio],[role=tab]')]
    .filter((el) => !el.tagName.includes('-') && !insideCE(el))
    .map((el) => { const t = el.tagName.toLowerCase(); const role = el.getAttribute('role'); return { tag: t, role, suggest: SUGGEST[t] || (role ? 'obs-' + role.replace('checkbox','checkbox').replace('button','button') : 'a DS component'), text: (el.textContent || el.getAttribute('placeholder') || '').trim().slice(0, 30) } })
  // fabricated chips: light-DOM, non-custom element with a bg tint + radius + short text (a Tag/Badge look-alike)
  const chips = [...document.querySelectorAll('span,div,i')].filter((el) => {
    if (el.tagName.includes('-') || insideCE(el)) return false
    const c = getComputedStyle(el); const r = el.getBoundingClientRect()
    const bg = c.backgroundColor; const hasBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
    const rad = parseFloat(c.borderTopLeftRadius) || 0
    const txt = (el.textContent || '').trim()
    return hasBg && rad >= 4 && r.width > 0 && r.width < 160 && r.height < 40 && txt.length >= 1 && txt.length <= 24 && el.children.length <= 1
  }).map((el) => (el.textContent || '').trim().slice(0, 24))
  // signature of the real styled control inside a host's (open) shadow root — the box with the largest area
  // that carries a background OR a border (the button/chip/pill body). Used for Phase-3b variant style-match.
  const sigOf = (host) => {
    const root = host.shadowRoot; if (!root) return null
    let best = null
    for (const el of root.querySelectorAll('*')) {
      const c = getComputedStyle(el); const r = el.getBoundingClientRect()
      if (r.width < 4 || r.height < 4) continue
      const bg = c.backgroundColor; const hasBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
      const bw = parseFloat(c.borderTopWidth) || 0; const hasBorder = bw > 0 && c.borderTopStyle !== 'none'
      if (!hasBg && !hasBorder) continue
      const area = r.width * r.height
      if (!best || area > best.area) best = { area, sig: { bg: c.backgroundColor, color: c.color, border: c.borderTopColor } }
    }
    return best ? best.sig : null
  }
  // capture each DS component instance + its variant/size/type/state attrs (validated vs the registry node-side)
  const dsInstances = [...document.querySelectorAll(DS.join(','))].map((el) => ({
    tag: el.tagName.toLowerCase(),
    variant: el.getAttribute('variant'),
    size: el.getAttribute('size'),
    type: el.getAttribute('type'),
    severity: el.getAttribute('severity'),
    ariaLabel: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'),
    hasText: (el.textContent || '').trim().length > 0,
    sig: sigOf(el),
  }))
  // gap-archetype candidates: light-DOM, non-DS elements that look like a building block the DS lacks
  // (chart / graph / topology / gauge / widget-tile / heatmap). These must be STOP-and-ASK'd + declared.
  const GAP_RE = /(chart|graph|topology|gauge|widget|heatmap|sparkline|treemap|sankey|plot)/i
  const gapCandidates = [...document.querySelectorAll('canvas, svg, [class*="chart"], [class*="graph"], [class*="topology"], [class*="gauge"], [class*="widget"], [class*="heatmap"], [id*="chart"], [id*="topology"]')]
    .filter((el) => !el.tagName.includes('-') && !insideCE(el))
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width >= 40 && r.height >= 40 }) // ignore tiny inline svg icons
    .map((el) => { const cls = (el.getAttribute('class') || '') + ' ' + (el.getAttribute('id') || ''); const m = cls.match(GAP_RE); return { tag: el.tagName.toLowerCase(), kind: (m && m[1].toLowerCase()) || (el.tagName.toLowerCase() === 'canvas' ? 'canvas' : 'graphic'), cls: cls.trim().slice(0, 60) } })
  return { colors, spaces, dsInteractive, rawControls, chips: [...new Set(chips)], dsInstances, gapCandidates, bodyBg: getComputedStyle(document.body).backgroundColor }
}

;(async () => {
  const pal = buildPalette()
  const scale = buildScale()
  // Portable Playwright resolution: repo path first, then the consumer's own playwright(-core).
  let chromium
  for (const spec of [path.join(UI_ROOT, 'node_modules', 'playwright-core', 'index.js'), 'playwright-core', 'playwright']) {
    try { const pw = await import(spec); chromium = pw.chromium || (pw.default && pw.default.chromium); if (chromium) break } catch { /* try next */ }
  }
  if (!chromium) {
    console.error('\n========================================================================')
    console.error('  ✗ CONFORMANCE DID NOT RUN — playwright-core is not installed.')
    console.error('  This is NOT a pass. No page was checked. Install it, then re-run:')
    console.error('      npm i -D playwright-core')
    console.error('  (it drives your system Chrome — no browser download needed).')
    console.error('========================================================================\n')
    process.exit(2)
  }
  const launchOpts = fs.existsSync(CHROME) ? { executablePath: CHROME } : {} // else Playwright's bundled Chromium

  // resolve target → URL (serve the file's dir if it's a local file)
  let url = target, srv = null
  if (!/^https?:\/\//.test(target)) {
    const abs = path.resolve(target)
    const dir = path.dirname(abs)
    srv = serve(dir); await new Promise((r) => srv.listen(0, '127.0.0.1', r))
    url = `http://127.0.0.1:${srv.address().port}/${path.basename(abs)}`
  }
  const html = (!/^https?:\/\//.test(target)) ? fs.readFileSync(path.resolve(target), 'utf8') : ''

  const browser = await chromium.launch(launchOpts)
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })
  const setTheme = async (t) => { await page.evaluate((th) => { if (th === 'dark') { document.documentElement.setAttribute('data-theme', 'dark-theme'); document.body && document.body.setAttribute('data-theme', 'dark-theme') } else { document.documentElement.removeAttribute('data-theme'); document.body && document.body.removeAttribute('data-theme') } }, t); await page.waitForTimeout(400) }
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => page.goto(url, { waitUntil: 'domcontentloaded' }))
  await page.waitForTimeout(800)
  await setTheme(theme)
  const m = await page.evaluate(MEASURE)
  // theme-awareness: does the body background flip when we toggle the other theme?
  const bodyA = m.bodyBg
  await setTheme(theme === 'light' ? 'dark' : 'light')
  const bodyB = (await page.evaluate(() => getComputedStyle(document.body).backgroundColor))
  await browser.close(); if (srv) srv.close()

  // ── score ────────────────────────────────────────────────────────────────
  const violations = { token: [], layout: [], philosophy: [], component: [] }

  // 1. token adherence
  let tOk = 0, tTot = 0
  const offAgg = {}
  for (const { prop, val, tag } of m.colors) {
    const c = parseColor(val); if (!c) continue
    if ((c[3] ?? 1) < 0.04) continue // fully transparent
    tTot++
    const n = nearest(c, pal)
    if (n && n.d <= TOL) tOk++
    else { const key = val; offAgg[key] = offAgg[key] || { val, count: 0, nearest: n, prop, tag }; offAgg[key].count++ }
  }
  const tokenScore = tTot ? Math.round((tOk / tTot) * 100) : 100
  violations.token = Object.values(offAgg).sort((a, b) => b.count - a.count).slice(0, 15)
    .map((o) => ({ value: o.val, prop: o.prop, count: o.count, nearestToken: o.nearest ? o.nearest.name : null, nearestVal: o.nearest ? `rgb(${o.nearest.val.slice(0, 3).join(',')})` : null, delta: o.nearest ? o.nearest.d : null }))

  // 2. layout adherence
  let lOk = 0, lTot = 0
  const offScale = {}
  for (const { prop, val } of m.spaces) { lTot++; if (onScale(val, scale)) lOk++; else { const k = val + 'px'; offScale[k] = (offScale[k] || 0) + 1 } }
  const layoutScore = lTot ? Math.round((lOk / lTot) * 100) : 100
  violations.layout = Object.entries(offScale).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([v, count]) => ({ value: v, count }))

  // 3. philosophy: theme-aware + no mds-* + brand-not-blue
  const bA = parseColor(bodyA), bB = parseColor(bodyB)
  const themeAware = !(bA && bB && dist(bA, bB) <= TOL && (bA[3] ?? 1) > 0.5) // bg must change across themes (unless transparent)
  const usesMds = /\bmds-[a-z-]+/.test(html)
  // brand misuse: a saturated blue that isn't a DS token (blue-dominant, off-token)
  const brandMisuse = violations.token.filter((v) => { const c = parseColor(v.value); return c && c[2] > c[0] + 40 && c[2] > 150 && c[1] < c[2] - 20 && dist(c, CYAN) > 12 })
  let philosophyScore = 100
  if (!themeAware) { philosophyScore -= 45; violations.philosophy.push({ rule: 'theme-aware', detail: `body background did not change light↔dark (${bodyA} vs ${bodyB}) — likely a hardcoded surface, not a DS token` }) }
  if (usesMds) { philosophyScore -= 45; violations.philosophy.push({ rule: 'no-mds', detail: 'page references future `mds-*` tokens — must emit only runtime --vars' }) }
  if (brandMisuse.length) { philosophyScore -= 20; violations.philosophy.push({ rule: 'brand-navy', detail: `off-token saturated blue used (${brandMisuse.map((b) => b.value).join(', ')}) — brand must be --primary navy, not blue/cyan` }) }
  philosophyScore = Math.max(0, philosophyScore)

  // 4. COMPONENT FIDELITY — every interactive control must be a real DS component (not a raw element),
  //    and no fabricated Tag/Badge look-alikes. A DS page renders controls via obs-* (shadow DOM), so any
  //    raw light-DOM control is a non-DS element. This is the "use DS components, not look-alikes" check.
  const rawN = m.rawControls.length
  // 4a. STOP-and-ASK ENFORCEMENT (Phase 3a): each non-DS / fabricated / gap-archetype element is a CONTRACT
  //     BREACH unless the build declared it (--declared). Declared → advisory ("approved gap"); undeclared →
  //     hard fail regardless of score. A silently-substituted non-DS block is the cardinal contract violation.
  const breaches = []
  const declaredHits = []
  // Raw controls + fabricated chips are NOT a hard breach. The elements package ships only atoms/molecules, so
  // composing an unshipped ORGANISM (table/drawer/modal/menu/toolbar/pagination/bulk-action-bar/nav) legitimately
  // needs raw controls — that's the DS's OWN gap (these are canonically-known missing organisms), not a builder
  // violation. They score against component fidelity but never fail the build. Only a whole missing ARCHETYPE
  // (chart / topology / widget canvas) — a self-describing STOP-and-ASK gap — is a contract breach when undeclared.
  for (const rc of m.rawControls) {
    const d = isDeclared(rc.tag, rc.role, rc.text)
    violations.component.push({ advisory: true, detail: d
      ? `raw <${rc.tag}> — declared "${d.keyword}", allowed`
      : `raw <${rc.tag}${rc.role ? ' role=' + rc.role : ''}>${rc.text ? ` "${rc.text}"` : ''} — use ${rc.suggest} where a DS element exists (raw is expected when composing an unshipped organism)` })
  }
  for (const chip of m.chips) {
    violations.component.push({ advisory: true, detail: `possible fabricated chip "${chip}" — prefer obs-tag / obs-severity` })
  }
  for (const gc of (m.gapCandidates || [])) {
    const d = isDeclared(gc.kind, gc.tag, gc.cls)
    if (d) { declaredHits.push({ what: `${gc.kind} <${gc.tag}>`, as: d.keyword }); violations.component.push({ advisory: true, detail: `<${gc.tag}> ${gc.kind} — DECLARED gap "${d.keyword}"${d.reason ? ' (' + d.reason + ')' : ''}, allowed` }) }
    else { breaches.push({ kind: 'undeclared-gap', detail: `${gc.kind} <${gc.tag}> (${gc.cls})` }); violations.component.push({ breach: true, detail: `BREACH non-DS ${gc.kind} <${gc.tag}> — the DS has no chart/topology/widget block; STOP-and-ASK + declare it (list_gaps)` }) }
  }

  // variant/state fidelity — every variant/size/type used must be a REAL registry value (not invented),
  // and required state must be present (icon-only control needs an aria-label).
  let checked = 0, invalid = 0
  let styleChecked = 0, styleOff = 0
  const sigDist = (a, b) => { const ca = parseColor(a), cb = parseColor(b); if (!ca || !cb) return 0; return dist(ca, cb) + Math.abs((ca[3] ?? 1) - (cb[3] ?? 1)) * 255 }
  for (const inst of (m.dsInstances || [])) {
    const vv = validValues(inst.tag); if (!vv) continue
    const bad = (attr, val, allowed) => { if (val == null || !allowed || !allowed.length) return; checked++; if (!allowed.includes(val)) { invalid++; violations.component.push({ detail: `invented ${attr} "${val}" on <${inst.tag}> — valid: ${allowed.slice(0, 8).join(', ')}` }) } }
    // variant/severity validated against the canonical registry enum (variantEnum/severityEnum); size/type
    // against the prop enum. All match the rendered obs-* values, so no reflected-default false positives.
    bad('variant', inst.variant, vv.variant)
    bad('severity', inst.severity, vv.severity)
    bad('size', inst.size, vv.size)
    bad('type', inst.type, vv.type)
    // icon-only interactive control (no text) should carry an aria-label
    if ((inst.tag === 'obs-button' || inst.tag === 'obs-link') && !inst.hasText && !inst.ariaLabel) { checked++; invalid++; violations.component.push({ detail: `icon-only <${inst.tag}> has no aria-label (required state)` }) }

    // 4b. VARIANT STYLE-MATCH (Phase 3b): does the instance RENDER like its variant's reference? Catches a
    //     valid-named variant that's been CSS-overridden (a "primary" button rendered grey). Compares the
    //     rendered shadow-DOM signature to the reference captured by build-variant-refs.mjs.
    if (VARIANT_REFS && inst.sig) {
      const tagRefs = VARIANT_REFS[inst.tag]
      for (const attr of ['variant', 'severity']) {
        const val = inst[attr]; const ref = tagRefs && tagRefs[attr] && val && tagRefs[attr][val]
        if (!ref) continue
        styleChecked++
        // the primary discriminator is the fill (bg) then the text/icon colour; tolerate small AA rounding
        const dBg = sigDist(inst.sig.bg, ref.bg), dColor = sigDist(inst.sig.color, ref.color)
        if (dBg > 24 || dColor > 40) {
          styleOff++
          violations.component.push({ detail: `<${inst.tag} ${attr}="${val}"> renders off-reference (bg ${inst.sig.bg} vs ${ref.bg}) — variant looks overridden, not the real "${val}"` })
        }
      }
    }
  }
  const presence = (m.dsInteractive + rawN) === 0 ? 1 : m.dsInteractive / (m.dsInteractive + rawN)
  const nameValidity = checked === 0 ? 1 : (checked - invalid) / checked
  const styleValidity = styleChecked === 0 ? 1 : (styleChecked - styleOff) / styleChecked
  const componentScore = Math.round(presence * nameValidity * styleValidity * 100)

  // Component fidelity is weighted heavily — the point of the check is DS components, not just DS colours.
  const contractBreach = breaches.length > 0
  const overall = Math.round(tokenScore * 0.35 + componentScore * 0.30 + philosophyScore * 0.20 + layoutScore * 0.15)
  const result = { target, theme, overall, contractBreach, breaches, declaredGaps: DECLARED.map((d) => d.keyword),
    dimensions: { token: tokenScore, component: componentScore, philosophy: philosophyScore, layout: layoutScore },
    measured: { colors: tTot, spacings: lTot, dsComponents: m.dsInteractive, rawControls: rawN, fabricatedChips: m.chips.length, variantChecks: checked, invalidVariants: invalid, styleChecks: styleChecked, styleOff, gapCandidates: (m.gapCandidates || []).length }, violations }

  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(result, null, 2))
  if (!QUIET) {
    console.log(`\n=== DS conformance — ${target} (theme=${theme}) ===`)
    if (contractBreach) console.log(`  ⛔ CONTRACT BREACH — ${breaches.length} undeclared non-DS element(s) (STOP-and-ASK). Declare them with --declared or replace with DS components.`)
    console.log(`  OVERALL: ${overall}/100${contractBreach ? ' (FAIL — contract breach)' : ''}   ·  token ${tokenScore}  component ${componentScore}  philosophy ${philosophyScore}  layout ${layoutScore}`)
    console.log(`  measured: ${tTot} colours · ${lTot} spacings · ${m.dsInteractive} DS components · ${rawN} raw controls · ${m.chips.length} fabricated chip(s) · ${checked} variant checks (${invalid} invalid) · ${styleChecked} style-match (${styleOff} off-ref)`)
    if (DECLARED.length) console.log(`  declared gaps: ${DECLARED.map((d) => d.keyword).join(', ')}`)
    if (violations.component.length) { console.log('\n  COMPONENT fidelity (use DS components, not raw/look-alikes):'); for (const v of violations.component.slice(0, 12)) console.log(`    ${v.breach ? '⛔' : v.advisory ? '~' : '✗'} ${v.detail}`) }
    if (violations.token.length) { console.log('\n  off-token colours (top):'); for (const v of violations.token.slice(0, 8)) console.log(`    ✗ ${v.value} (${v.prop}, ×${v.count}) → nearest DS token ${v.nearestToken} (${v.nearestVal}, Δ${v.delta})`) }
    if (violations.layout.length) { console.log('\n  off-scale spacing/radii:'); for (const v of violations.layout.slice(0, 6)) console.log(`    ~ ${v.value} (×${v.count})`) }
    if (violations.philosophy.length) { console.log('\n  philosophy:'); for (const v of violations.philosophy) console.log(`    ✗ [${v.rule}] ${v.detail}`) }
    console.log('')
  }
  process.exit(overall >= 80 && !contractBreach ? 0 : 1)
})().catch((e) => { console.error('ds-conformance ERROR', e.stack || e.message); process.exit(2) })
