#!/usr/bin/env node
/**
 * Build the @mtdt/observeops-ds-css "look" package — a standalone, framework-agnostic CSS file with
 * EXACT ObserveOps token values (light + dark) + the structural scale + the status-tag chips, so any
 * HTML/React/etc. prototype imports it and gets pixel-exact product styling.
 *
 * Generated from the resolved token spec (tokens/variables.json + structural.json + kit-accents.json +
 * purpose-map.json) — NOT from the LESS source (which has Ant coupling + compile-time functions).
 */
const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..')
const OUT_DIR = path.join(SRC, 'css-package')
const OUT_CSS = path.join(OUT_DIR, 'dist', 'observeops-ds.css')
const J = (rel) => JSON.parse(fs.readFileSync(path.join(SRC, rel), 'utf8'))

const variables = J('tokens/variables.json')
const structural = J('tokens/structural.json')
const version = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'package.json'), 'utf8')).version

// --- value handling -------------------------------------------------------
function fadeToRgba(v) {
  const m = String(v).match(/^fade\(\s*(#[0-9a-fA-F]{3,8})\s*,\s*([\d.]+)%?\s*\)$/i)
  if (!m) return null
  let hex = m[1].slice(1)
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const a = Math.round((parseFloat(m[2]) / 100) * 1000) / 1000
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
function cssSafe(raw) {
  if (raw == null) return null
  let v = String(raw).trim()
  if (v === '') return null
  if (/^fade\(/i.test(v)) return fadeToRgba(v) // null -> skip if unparseable
  return v
}
const clean = (v) => String(v).replace(/\s*\(.*\)\s*$/, '').trim() // strip " (annotation)"

// --- build the blocks -----------------------------------------------------
let lightLines = []
let darkLines = []
let skipped = 0
for (const name of Object.keys(variables).sort()) {
  const t = variables[name]
  if (!t) continue
  const l = cssSafe(t.light)
  if (l) lightLines.push(`  ${name}: ${l};`)
  else skipped++
  const d = cssSafe(t.dark)
  if (d) darkLines.push(`  ${name}: ${d};`)
}

// structural @vars exposed as CSS custom properties (--padding-md etc.)
const structLines = []
for (const [grp, obj] of Object.entries(structural)) {
  if (grp.startsWith('$')) continue
  for (const [k, val] of Object.entries(obj)) {
    structLines.push(`  ${k.replace(/^@/, '--')}: ${clean(val)};`)
  }
}

// status / role tag chips (self-contained — from src/design/tags.less, same both themes)
const tagCss = [
  '.tag-green  { color: var(--secondary-green);          background: rgba(54, 213, 118, 0.2); }',
  '.tag-red    { color: var(--secondary-red);            background: rgba(236, 91, 91, 0.2); }',
  '.tag-yellow { color: var(--secondary-yellow);         background: rgba(250, 209, 0, 0.2); }',
  '.tag-orange { color: var(--secondary-orange);         background: rgba(250, 153, 80, 0.2); }',
  '.tag-primary{ color: var(--default-tag-text-color);   background: var(--tag-bg-color); }',
].join('\n')

const css = `/*!
 * @mtdt/observeops-ds-css v${version} — the ObserveOps "look" package.
 * EXACT design-system token values (light + dark) + structural scale + status-tag chips.
 * Generated from the token spec — do NOT hand-edit. Use var(--token) in your styles.
 * Dark theme: set data-theme="dark-theme" on a root element.
 */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

:root {
  /* ---- colour tokens (light) ---- */
${lightLines.join('\n')}

  /* ---- form-control accent (Ant cyan — radio/checkbox/select only) ---- */
  --primary-color: #099dd9;
  --ant-primary: #099dd9;

  /* ---- structural scale (spacing / sizing / radius / type) ---- */
${structLines.join('\n')}
}

[data-theme='dark-theme'] {
  /* ---- colour tokens (dark) ---- */
${darkLines.join('\n')}
}

/* ---- status / role tag chips ---- */
${tagCss}
`

fs.mkdirSync(path.dirname(OUT_CSS), { recursive: true })
fs.writeFileSync(OUT_CSS, css)

// --- generate a COMPLETE token gallery (every token, for coverage checking) ---
const isColor = (v) => v && /^(#|rgb|hsl)/i.test(String(v).trim())
// Semantic groups (taxonomy: property/role-first), most-specific first so domain wins over generic.
const CATS = [
  ['Brand & interactive', /^--primary($|-)|--active-text-color/],
  ['Severity (monitor / alert)', /severity/],
  ['Status / semantic', /^--secondary-/],
  ['Navigation', /--nav|--left-menu|--menu|--sidebar/],
  ['Grid / table', /--grid|--table/],
  ['Chart / data-viz', /--chart|--graph|--topology/],
  ['Neutrals ramp', /--neutral-|--white|--black/],
  ['Surface / background', /-bg($|-)|background|--common-|--widget|--modal|--drawer|--overlay|--dashboard|--card|--page-background/],
  ['Text', /text-color|--placeholder|--faded|--icon|--label/],
  ['Border & divider', /border/],
]
const catOf = (n) => (CATS.find(([, re]) => re.test(n)) || [])[0] || 'Other'
const card = (name, l, d, col) =>
  `<div class="tok" data-n="${name}">${col ? `<div class="sw" style="background:var(${name})"></div>` : '<div class="sw noc">Aa</div>'}` +
  `<div class="m"><code>${name}</code><span class="v">${l || '—'}${d && d !== l ? `<i> · dark </i>${d}` : ''}</span></div></div>`

const groups = {}
let colorCount = 0
for (const name of Object.keys(variables).sort()) {
  const t = variables[name] || {}
  const l = cssSafe(t.light)
  const d = cssSafe(t.dark)
  if (!l && !d) continue
  const col = isColor(l)
  if (col) colorCount++
  ;(groups[catOf(name)] ||= []).push(card(name, l, d, col))
}
const ORDER = [...CATS.map((c) => c[0]), 'Other']
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const navColor = []
const navStruct = []
const section = (label, cards, nav) => {
  const id = slug(label)
  nav.push(`<a href="#${id}" data-s="${id}">${label}<span class="gc">${cards.length}</span></a>`)
  return `<section id="${id}"><h2>${label} <span class="gc">${cards.length}</span></h2><div class="grid">${cards.join('\n')}</div></section>`
}
const colorSections = ORDER.filter((c) => groups[c]).map((c) => section(c, groups[c], navColor)).join('\n')
const structSections = Object.entries(structural)
  .filter(([g]) => !g.startsWith('$'))
  .map(([g, obj]) => section(g, Object.entries(obj).map(([k, v]) => card(k.replace(/^@/, '--'), clean(v), null, false)), navStruct))
  .join('\n')

const gallery = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>ObserveOps tokens — full gallery</title>
<link rel="stylesheet" href="observeops-ds.css"/>
<style>
 *{box-sizing:border-box}
 body{font-family:var(--font-family);background:var(--common-main-bg);color:var(--page-text-color);margin:0}
 .topbar{position:sticky;top:0;z-index:20;display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:var(--page-background-color);border-bottom:1px solid var(--border-color);padding:12px 20px}
 h1{color:var(--primary);font-size:var(--text-lg);margin:0}
 .count{color:var(--neutral-light);font-size:var(--text-sm)}
 input{height:32px;border:1px solid var(--border-color);border-radius:4px;padding:0 10px;font:inherit;color:var(--page-text-color);background:var(--page-background-color);min-width:220px}
 input::placeholder{color:var(--input-placeholder-color)}
 button{height:32px;padding:0 14px;border-radius:4px;border:1px solid var(--border-color);background:var(--page-background-color);color:var(--page-text-color);cursor:pointer;font:inherit}
 .wrap{display:flex;align-items:flex-start}
 .side{position:sticky;top:57px;align-self:flex-start;width:210px;flex-shrink:0;height:calc(100vh - 57px);overflow:auto;border-right:1px solid var(--border-color);padding:10px 8px}
 .side a{display:flex;justify-content:space-between;gap:8px;align-items:center;text-decoration:none;color:var(--neutral-regular);font-size:12px;padding:6px 10px;border-radius:4px;border-left:2px solid transparent}
 .side a:hover{background:var(--neutral-lightest);color:var(--page-text-color)}
 .side a.active{background:var(--neutral-lightest);color:var(--primary);border-left-color:var(--primary);font-weight:500}
 .nav-h{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:var(--neutral-light);padding:10px 10px 4px}
 .main{flex:1;min-width:0;padding:8px 20px 60px}
 h2{font-size:var(--text-regular);color:var(--neutral-regular);margin:22px 0 8px;scroll-margin-top:72px}
 .gc{font-size:11px;color:var(--neutral-light);font-weight:400}
 .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px}
 .tok{display:flex;align-items:center;gap:10px;background:var(--common-widget-bg);border:1px solid var(--border-color);border-radius:4px;padding:8px}
 .sw{width:40px;height:40px;border-radius:4px;border:1px solid var(--border-color);flex-shrink:0}
 .sw.noc{display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--neutral-light);background:var(--neutral-lightest)}
 .m{min-width:0}
 code{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--page-text-color);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .v{font-size:11px;color:var(--neutral-light)}
 .v i{font-style:normal;opacity:.7}
</style></head><body>
<div class="topbar">
 <h1>ObserveOps tokens</h1>
 <span class="count" id="count"></span>
 <span style="flex:1"></span>
 <input id="q" placeholder="filter by name…" oninput="filt()"/>
 <button onclick="var h=document.documentElement;h.toggleAttribute('d');h.setAttribute('data-theme',h.hasAttribute('d')?'dark-theme':'')">Toggle dark</button>
</div>
<div class="wrap">
 <nav class="side">
  <div class="nav-h">Colour</div>
  ${navColor.join('\n  ')}
  <div class="nav-h">Structural</div>
  ${navStruct.join('\n  ')}
 </nav>
 <main class="main">
${colorSections}
${structSections}
 </main>
</div>
<script>
 var TOTAL=document.querySelectorAll('.tok').length;
 document.getElementById('count').textContent=TOTAL+' tokens';
 function filt(){var q=document.getElementById('q').value.toLowerCase();var n=0;
  document.querySelectorAll('.tok').forEach(function(t){var m=t.dataset.n.toLowerCase().includes(q);t.style.display=m?'':'none';if(m)n++;});
  document.querySelectorAll('section').forEach(function(s){var any=[].some.call(s.querySelectorAll('.tok'),function(t){return t.style.display!=='none'});s.style.display=any?'':'none';});
  document.getElementById('count').textContent=n+' / '+TOTAL+' tokens';}
 var links=[].slice.call(document.querySelectorAll('.side a'));var byId={};links.forEach(function(a){byId[a.dataset.s]=a});
 var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.remove('active')});var a=byId[e.target.id];if(a)a.classList.add('active')}})},{rootMargin:'-60px 0px -75% 0px'});
 document.querySelectorAll('section').forEach(function(s){obs.observe(s)});
</script></body></html>`
fs.writeFileSync(path.join(OUT_DIR, 'dist', 'tokens.html'), gallery)

console.log(`Built @mtdt/observeops-ds-css@${version}`)
console.log(`  gallery: ${colorCount} colour swatches + non-colour + structural -> dist/tokens.html`)
console.log(`  light vars: ${lightLines.length} | dark vars: ${darkLines.length} | structural: ${structLines.length} | skipped(empty): ${skipped}`)
console.log(`  -> ${OUT_CSS} (${(css.length / 1024).toFixed(1)} kB)`)
