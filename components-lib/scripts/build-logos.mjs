// Generates the obs-logo data from the ONE product logo library (Assets → Logos):
//   • colour: src/assets/icons/monitor-type-icons/icons/*.svg
//   • line:   src/assets/icons/monitor-type-line-icons/monitor-type-line-icons.js  (monochrome, currentColor)
// Emits THREE things (opt-in split so the shared bundle stays lean):
//   1. _logos.js       — a SMALL BUILT-IN common set → shipped inside the main elements bundle (obs-logo standalone).
//   2. _logos.full.js  — the FULL 445 → shipped ONLY in the separate `observeops-logos` bundle (opt-in).
//   3. registry/logo.json `names` — the full 445 NAME manifest (names only, no SVG) so AI tools find/use every logo.
// One source, one generator — never hand-edit _logos*.js. Runs automatically before build + site:build.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const LIB = path.resolve(HERE, '..')
const ASSETS = path.resolve(LIB, '..', '..', 'src', 'assets', 'icons')
const SRC = path.join(ASSETS, 'monitor-type-icons', 'icons')
const LINE_SRC = path.join(ASSETS, 'monitor-type-line-icons', 'monitor-type-line-icons.js')
const OUT = path.resolve(LIB, 'src', 'elements', '_logos.js')
const OUT_FULL = path.resolve(LIB, 'src', 'elements', '_logos.full.js')
const REG = path.resolve(LIB, '..', 'components', 'registry', 'logo.json')

// the SMALL built-in set shipped in the main bundle (what the DS's own components use + the most common types).
// Everything else comes from the opt-in observeops-logos bundle; unknown → no-icon.
const BUILTIN = new Set([
  'router', 'switch', 'firewall', 'load-balancer', 'linux', 'windows', 'mac-os',
  'aws-cloud', 'azure-cloud', 'google-cloud', 'vmware-esxi', 'hyper-v', 'dockercontainer', 'kubernetes',
  'mysql', 'postgresql', 'mongodb', 'mssql', 'redis', 'oracle-database',
  'apache-http', 'nginx', 'apache-tomcat', 'java', 'python', 'nodejs', 'dotnet', 'active-directory', 'no-icon',
  'motadata', // the ObserveOps brand mark — bundled so obs-sidebar's default logo resolves out of the box (no opt-in logos bundle needed)
  'motadata_full', // the FULL ObserveOps logo (mark + wordmark) — obs-app-header's default brand; bundled so it resolves out of the box
])

// short/display-name aliases → canonical file name
const ALIASES = {
  vmware: 'vmware-esxi', esxi: 'vmware-esxi', oracle: 'oracle-database', 'oracle-db': 'oracle-database',
  postgres: 'postgresql', mongo: 'mongodb', docker: 'dockercontainer', k8s: 'kubernetes', openshift: 'openshift-kubernetes',
  aws: 'aws-cloud', azure: 'azure-cloud', gcp: 'google-cloud', iis: 'microsoft-iis', tomcat: 'apache-tomcat', apache: 'apache-http',
  macos: 'mac-os', mac: 'mac-os', edge: 'microsoft-edge', ad: 'active-directory', 'sql-server': 'mssql', sqlserver: 'mssql',
  weblogic: 'oracle-weblogic', node: 'nodejs', rabbitmq: 'rabbit-mq', 'active-mq': 'apache-mq', activemq: 'apache-mq',
  o365: 'office-365', office365: 'office-365', windowsserver: 'windows', 'red-hat': 'linux', redhat: 'linux', ubuntu: 'linux', centos: 'linux', debian: 'linux',
}

// strip xml decl/comments, collapse inter-tag whitespace, and NAMESPACE ids so multiple logos on one page don't collide
function clean(svg, ns) {
  let s = svg.replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim()
  const ids = [...new Set([...s.matchAll(/id="([^"]+)"/g)].map((m) => m[1]))]
  for (const id of ids) {
    const nid = ns + '_' + id
    s = s.split('id="' + id + '"').join('id="' + nid + '"')
      .split('#' + id + ')').join('#' + nid + ')')
      .split('#' + id + '"').join('#' + nid + '"')
      .split("#" + id + "'").join("#" + nid + "'")
  }
  return s
}

// ── colour logos (FULL) — monitor-type SVGs + Brand & Platform + Software / Integrations (the gallery's 250) ──
const colour = {}
for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith('.svg'))) {
  const name = f.replace(/\.svg$/, '')
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8').trim()
  if (!/<svg[\s>]/i.test(raw)) continue // skip empty/invalid (e.g. sdn.svg is 0 bytes)
  colour[name] = clean(raw, 'lg' + name.replace(/\W/g, ''))
}
// brand + software marks (images/logo, images/software-logos): SVG → inline; PNG → base64 data-URI (obs-logo renders
// either). Skip *_dark duplicates. Lower-case the key so names are consistent (SEBI → sebi).
const IMG = path.resolve(LIB, '..', '..', 'src', 'assets', 'images')
const addImages = (dir, skipDark) => {
  if (!fs.existsSync(dir)) return
  // process SVG before PNG so when BOTH exist for one name (e.g. motadata_full.svg + .png) the VECTOR wins —
  // a raster PNG pixelates when scaled up; an SVG stays crisp at any size.
  const files = fs.readdirSync(dir).filter((x) => /\.(svg|png)$/i.test(x))
    .sort((a, b) => (/\.svg$/i.test(a) ? 0 : 1) - (/\.svg$/i.test(b) ? 0 : 1))
  for (const f of files) {
    if (skipDark && /_dark/i.test(f)) continue
    const name = f.replace(/\.(svg|png)$/i, '').toLowerCase()
    if (colour[name]) continue // already set (SVG wins over a later PNG of the same name; or a monitor-type logo)
    const fp = path.join(dir, f)
    if (/\.svg$/i.test(f)) { const raw = fs.readFileSync(fp, 'utf8').trim(); if (/<svg[\s>]/i.test(raw)) colour[name] = clean(raw, 'lg' + name.replace(/\W/g, '')) }
    else colour[name] = 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64')
  }
}
addImages(path.join(IMG, 'logo'), true)
addImages(path.join(IMG, 'software-logos'), false)
// ── line icons (FULL) ──
const line = {}
if (fs.existsSync(LINE_SRC)) {
  const txt = fs.readFileSync(LINE_SRC, 'utf8')
  const re = /\[Constants\.([A-Z0-9_]+)\]\s*:\s*'([^']*)'/g
  let m
  while ((m = re.exec(txt))) {
    const n = m[1].toLowerCase().replace(/_/g, '-')
    if (m[2] && m[2].trim()) line[n] = `<svg viewBox="0 0 512 512" fill="currentColor">${m[2]}</svg>`
  }
} else console.warn('  ⚠ build-logos: line-icon registry not found')

const emit = (obj) => Object.keys(obj).sort().map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(obj[k])},`).join('\n')
const aliasBody = Object.entries(ALIASES).map(([a, t]) => `  ${JSON.stringify(a)}: ${JSON.stringify(t)},`).join('\n')

// 1. built-in (small) — main bundle
const bColour = Object.fromEntries(Object.entries(colour).filter(([k]) => BUILTIN.has(k)))
const bLine = Object.fromEntries(Object.entries(line).filter(([k]) => BUILTIN.has(k)))
const H1 = `// GENERATED by scripts/build-logos.mjs — DO NOT EDIT. The SMALL built-in common set (main bundle).\n// The FULL library loads from the separate observeops-logos bundle; see _logos.full.js / the Assets → Logos page.\n`
fs.writeFileSync(OUT, `${H1}export const LOGOS = {\n${emit(bColour)}\n}\nexport const LINE_LOGOS = {\n${emit(bLine)}\n}\nexport const LOGO_ALIASES = {\n${aliasBody}\n}\n`)

// 2. full — the opt-in observeops-logos bundle
const H2 = `// GENERATED by scripts/build-logos.mjs — DO NOT EDIT. The FULL logo library (colour + line), shipped ONLY in the\n// separate observeops-logos bundle (opt-in).\n`
fs.writeFileSync(OUT_FULL, `${H2}export const LOGOS = {\n${emit(colour)}\n}\nexport const LINE_LOGOS = {\n${emit(line)}\n}\nexport const LOGO_ALIASES = {\n${aliasBody}\n}\n`)

// 3. name manifest → registry/logo.json (names only, for AI discoverability — no SVG data)
const colourNames = Object.keys(colour).sort()
const lineNames = Object.keys(line).sort()
if (fs.existsSync(REG)) {
  const r = JSON.parse(fs.readFileSync(REG, 'utf8'))
  r.names = { colour: colourNames, line: lineNames, aliases: ALIASES, builtIn: [...BUILTIN].sort() }
  r.counts = { colour: colourNames.length, line: lineNames.length, builtIn: BUILTIN.size, total: colourNames.length + lineNames.length }
  fs.writeFileSync(REG, JSON.stringify(r, null, 2) + '\n')
}

const kb = (p) => Math.round(fs.statSync(p).size / 1024)
console.log(`  _logos.js (built-in): ${Object.keys(bColour).length} colour + ${Object.keys(bLine).length} line (${kb(OUT)} KB)`)
console.log(`  _logos.full.js (opt-in bundle): ${colourNames.length} colour + ${lineNames.length} line (${kb(OUT_FULL)} KB)`)
console.log(`  registry/logo.json names: ${colourNames.length} colour + ${lineNames.length} line`)
