#!/usr/bin/env node
// generate.mjs — builds the static "ObserveOps Elements" showcase site from registry/<id>.json +
// per-component examples manifests + the built web-component bundle. Zero deps. Output: site/dist/.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pageHtml, indexHtml, iconsPageHtml, logosPageHtml, buildWithAiPageHtml, chartsOverviewPageHtml, chartCategoryPageHtml, CHART_CATEGORIES, setBrandHtml } from './lib/templates.mjs'
import { controlAttr } from './lib/controls.mjs'
import { productRoot } from '../scripts/lib/product-root.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE = __dirname
const LIB = path.resolve(SITE, '..') // components-lib/
const REG = path.resolve(LIB, '..', 'components', 'registry')
const CSS_DIST = path.resolve(LIB, '..', 'css-package', 'dist', 'observeops-ds.css')
const OUT = path.join(SITE, 'dist')
const FIXTURES = path.join(SITE, 'fixtures')
const ROOT = productRoot() // product checkout (assets/engine source); null → site still builds, asset pages skip

/**
 * The charting engine is a PEER DEPENDENCY and is never committed. For local preview we copy it
 * out of whichever node_modules can supply it; if none can, the Charts page still builds and says
 * so plainly rather than rendering blank.
 */
function resolveEngine() {
  const candidates = [
    path.resolve(LIB, 'node_modules', 'highcharts'),
    ROOT ? path.join(ROOT, 'node_modules', 'highcharts') : null,
  ].filter(Boolean)
  const MODULES = ['highcharts-more', 'modules/solid-gauge', 'modules/sankey', 'modules/heatmap', 'modules/treemap', 'modules/no-data-to-display', 'modules/map']
  for (const base of candidates) {
    const main = path.join(base, 'highcharts.js')
    if (!fs.existsSync(main)) continue
    const vendor = path.join(OUT, 'vendor')
    fs.mkdirSync(vendor, { recursive: true })
    fs.copyFileSync(main, path.join(vendor, 'highcharts.js'))
    const mods = []
    for (const m of MODULES) {
      const src = path.join(base, `${m}.js`)
      if (!fs.existsSync(src)) continue
      const name = `${m.replace('modules/', '')}.js`
      fs.copyFileSync(src, path.join(vendor, name))
      mods.push(`./vendor/${name}`)
    }
    let version = ''
    try { version = JSON.parse(read(path.join(base, 'package.json'))).version } catch {}
    // the map widget's world geometry (the product pins @highcharts/map-collection's
    // custom/world-india-disputed topo) + Leaflet for the Online Map type. Local-only like the engine.
    let mapTopo = null
    const topoSrc = ROOT ? path.join(ROOT, 'node_modules', '@highcharts', 'map-collection', 'custom', 'world-india-disputed.topo.json') : ''
    if (exists(topoSrc)) {
      fs.copyFileSync(topoSrc, path.join(vendor, 'world-map.topo.json'))
      mapTopo = './vendor/world-map.topo.json'
    }
    let leaflet = null
    const ldir = ROOT ? path.join(ROOT, 'node_modules', 'leaflet', 'dist') : ''
    if (exists(path.join(ldir, 'leaflet.js'))) {
      const lv = path.join(vendor, 'leaflet')
      fs.mkdirSync(lv, { recursive: true })
      fs.copyFileSync(path.join(ldir, 'leaflet.js'), path.join(lv, 'leaflet.js'))
      fs.copyFileSync(path.join(ldir, 'leaflet.css'), path.join(lv, 'leaflet.css'))
      leaflet = { js: './vendor/leaflet/leaflet.js', css: './vendor/leaflet/leaflet.css' }
    }
    return { src: './vendor/highcharts.js', modules: mods, version, mapTopo, leaflet }
  }
  return null
}

/** Copy fixtures into dist and summarise them for the Charts page. */
function loadFixtures() {
  if (!fs.existsSync(FIXTURES)) return []
  const dst = path.join(OUT, 'fixtures')
  fs.mkdirSync(dst, { recursive: true })
  const out = []
  for (const f of fs.readdirSync(FIXTURES).filter((x) => x.endsWith('.json'))) {
    fs.copyFileSync(path.join(FIXTURES, f), path.join(dst, f))
    const j = JSON.parse(read(path.join(FIXTURES, f)))
    const id = f.replace(/\.json$/, '')
    const cfg = j.config || {}
    // config fixtures carry their series; result-payload fixtures (custom-renderer families)
    // carry them under result.Chart.series — count whichever exists so badges stay honest
    const series = (cfg.series || []).length || (j.result?.Chart?.series || j.result?.series || []).length
    const eng = j.engines || {}
    out.push({
      id,
      display: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      widgetType: j.variant?.widgetType || null,
      series,
      hasConfig: !!cfg.chart || series > 0,
      engine: eng.highcharts ? 'highcharts' : eng.leaflet ? 'leaflet' : eng.table ? 'table' : (cfg.chart ? 'highcharts' : 'custom'),
    })
  }
  // engine-rendered first, then by name
  return out.sort((a, b) => (a.id < b.id ? -1 : 1))
}

// The shipped custom elements (only those with a built element get a page).
const COMPONENTS = ['button', 'icon', 'tag', 'checkbox', 'switch', 'selected-pills', 'radio', 'input', 'link', 'dropdown', 'severity', 'loose-tags',
  'layout-app-shell', 'layout-grid', 'layout-screen-regions', 'layout-shells', 'layout-page-templates', 'layout-panels',
  'tooltip', 'data-viz-tooltips', 'date-time-pickers', 'filters', 'drawer', 'grid-select', 'menu', 'color-picker', 'table', 'modal', 'metric-list', 'key-value', 'tabs', 'steps', 'page-header', 'app-header', 'user-menu', 'notification-menu', 'command-palette', 'toolbar', 'divider', 'banner', 'sidebar', 'breadcrumbs', 'side-menu', 'logo', 'metric-picker', 'noc-player', 'timeline-scrollbar']

const read = (p) => fs.readFileSync(p, 'utf8')
const exists = (p) => fs.existsSync(p)

function loadRegistry(id) {
  const p = path.join(REG, `${id}.json`)
  if (exists(p)) return JSON.parse(read(p))
  return null
}

async function loadManifest(id) {
  const p = path.join(SITE, 'manifests', `${id}.examples.mjs`)
  if (!exists(p)) return null
  return (await import(pathToFileURL(p).href)).default
}

/** Cross-check manifest controls/gallery attrs against registry.props (warn on drift — §risks). */
function validate(id, registry, manifest) {
  const props = (registry && registry.props) || {}
  const known = new Set(Object.keys(props).map((k) => k))
  const knownAttrs = new Set(Object.keys(props).map((k) => k.includes('-') ? k : k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()))
  for (const c of manifest.controls || []) {
    if (!c.slot && !c.slotPresets && !known.has(c.prop)) console.warn(`  ⚠ ${id}: control prop "${c.prop}" not in registry.props`)
  }
  for (const g of manifest.gallery || []) {
    for (const it of g.items) {
      for (const a of Object.keys(it.attrs || {})) {
        if (!knownAttrs.has(a)) console.warn(`  ⚠ ${id}: gallery attr "${a}" not a known prop (may be a class-style variant)`)
      }
    }
  }
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })

  // gather components that have both a manifest and (ideally) a registry
  const built = []
  for (const id of COMPONENTS) {
    const manifest = await loadManifest(id)
    if (!manifest) { console.warn(`  ⚠ ${id}: no manifest — skipped`); continue }
    let registry = loadRegistry(manifest.registry || id) // a page may point at a differently-named registry (e.g. dropdown → dropdown-picker)
    if (!registry) {
      console.warn(`  ⚠ ${id}: no registry/${manifest.registry || id}.json — using manifest fallback (summary/propsDoc)`)
      registry = { name: id, display: titleize(id), summary: manifest.summary || '', props: manifest.propsDoc || {} }
    }
    registry.name = id
    registry.display = manifest.display || registry.display || titleize(id)
    if (manifest.summary) registry.summary = manifest.summary
    built.push({ id, registry, manifest })
  }
  // nav order: Foundations first, then Components — BOTH grouped by family (family A→Z, then display A→Z within
  // a family). The sidebar renderer sub-groups multi-member families and keeps single-member families flat.
  const sectionRank = (r) => (r.section === 'Foundations' ? 0 : 1)
  built.sort((a, b) => {
    const ar = sectionRank(a.registry); const br = sectionRank(b.registry)
    if (ar !== br) return ar - br
    const af = a.registry.family || ''
    const bf = b.registry.family || ''
    if (af !== bf) return af.localeCompare(bf)
    return a.registry.display.localeCompare(b.registry.display)
  })
  const components = built.map((b) => ({ id: b.id, display: b.registry.display, summary: b.registry.summary || '',
    section: b.registry.section || 'Components', family: b.registry.family || '' }))
  // Charts are generated pages (not manifest-driven element pages), so their nav entries are added
  // here and the list re-sorted with the same comparator. All chart pages share the 'Charts' family,
  // which the sidebar renderer turns into a collapsible sub-group whose LINKED HEADER is the overview
  // (navGroupLink) followed by the category pages — no self-referential "Charts" child entry.
  components.push({ id: 'charts', display: 'Charts', summary: 'Every product chart variant, rendered from captured configurations.',
    section: 'Components', family: 'Charts', navGroupLink: true })
  for (const cat of CHART_CATEGORIES) {
    components.push({ id: 'charts-' + cat.id, display: cat.display, summary: cat.blurb,
      section: 'Components', family: 'Charts' })
  }
  components.sort((a, b) => {
    const ar = a.section === 'Foundations' ? 0 : 1
    const br = b.section === 'Foundations' ? 0 : 1
    if (ar !== br) return ar - br
    if ((a.family || '') !== (b.family || '')) return (a.family || '').localeCompare(b.family || '')
    return a.display.localeCompare(b.display)
  })

  // assets + bundle + token css
  copyDir(path.join(SITE, 'assets'), OUT)
  // brand: use the product's Motadata DONUT ICON (icon-only mark) as the nav brand (light + dark variants)
  const logoDir = ROOT ? path.join(ROOT, 'src', 'assets', 'images', 'logo') : ''
  let brand = ''
  if (exists(path.join(logoDir, 'motadata.png'))) {
    fs.copyFileSync(path.join(logoDir, 'motadata.png'), path.join(OUT, 'brand-logo.png'))
    brand = '<img class="brand-logo brand-logo-light" src="./brand-logo.png" alt="Motadata" />'
    if (exists(path.join(logoDir, 'motadata_dark.png'))) {
      fs.copyFileSync(path.join(logoDir, 'motadata_dark.png'), path.join(OUT, 'brand-logo-dark.png'))
      brand += '<img class="brand-logo brand-logo-dark" src="./brand-logo-dark.png" alt="Motadata" />'
    }
  }
  setBrandHtml(brand)
  // full Motadata WORDMARK logos (light+dark) — for the obs-app-header showcase brand slot
  for (const [src, dst] of [['motadata_full.png', 'motadata-full.png'], ['motadata_full_dark.png', 'motadata-full-dark.png']]) {
    if (exists(path.join(logoDir, src))) fs.copyFileSync(path.join(logoDir, src), path.join(OUT, dst))
  }
  const bundleSrc = copyBundle()
  const tokenCssHref = copyTokenCss()
  const assetV = hashFiles([path.join(OUT, 'app.css'), path.join(OUT, 'app.js')]) // cache-bust app.css/app.js
  const version = `v${pkgVersion()} · ${built.length} components`

  for (let i = 0; i < built.length; i++) {
    const { id, registry, manifest } = built[i]
    validate(id, registry, manifest)
    const prev = built[i - 1] ? { id: built[i - 1].id, display: built[i - 1].registry.display } : null
    const next = built[i + 1] ? { id: built[i + 1].id, display: built[i + 1].registry.display } : null
    const html = pageHtml({ registry, manifest, components, version, tokenCssHref, bundleSrc, assetV, prev, next })
    fs.writeFileSync(path.join(OUT, `${id}.html`), html)
  }
  fs.writeFileSync(path.join(OUT, 'index.html'), indexHtml(components, version, tokenCssHref, assetV))
  fs.writeFileSync(path.join(OUT, 'build-with-ai.html'), buildWithAiPageHtml(components, version, tokenCssHref, assetV, bundleSrc))
  // Charts — captured configurations rendered through the real engine. One overview page + one page
  // per category. COVERAGE IS FAIL-CLOSED: every fixture file must be claimed by exactly one
  // category entry — an uncategorised capture is a bug (a silently missing chart), not a skip.
  const fixtures = loadFixtures()
  const engine = resolveEngine()
  const categorised = new Set(CHART_CATEGORIES.flatMap((c) => c.sections.flatMap((s) => s.fixtures.map(([id]) => id))))
  const known = new Set(fixtures.map((f) => f.id))
  for (const id of categorised) {
    if (!known.has(id)) console.warn(`  ⚠ category references missing fixture: ${id}.json`)
  }
  for (const f of fixtures) {
    if (!categorised.has(f.id)) console.warn(`  ⚠ fixture ${f.id}.json matches NO category — file it into CHART_CATEGORIES (fail-closed: charts must not silently disappear)`)
  }
  const chartNav = [{ id: 'charts', display: 'Charts' }, ...CHART_CATEGORIES.map((c) => ({ id: 'charts-' + c.id, display: c.display }))]
  fs.writeFileSync(path.join(OUT, 'charts.html'), chartsOverviewPageHtml({
    categories: CHART_CATEGORIES, fixtures, components, version, tokenCssHref, assetV,
    engineSrc: engine?.src || null, engineModules: engine?.modules || [],
  }))
  for (let i = 0; i < CHART_CATEGORIES.length; i++) {
    const cat = CHART_CATEGORIES[i]
    // arrows walk the overview → every category in declared order
    const prev = i === 0 ? chartNav[0] : chartNav[i]
    const next = chartNav[i + 2] || null
    fs.writeFileSync(path.join(OUT, `charts-${cat.id}.html`), chartCategoryPageHtml({
      cat, fixtures, components, version, tokenCssHref, assetV, bundleSrc,
      engineSrc: engine?.src || null, engineModules: engine?.modules || [],
      mapTopo: engine?.mapTopo || null, leaflet: engine?.leaflet || null, prev, next,
    }))
  }
  if (!fixtures.length) console.warn('  ⚠ no fixtures — charts pages will be empty')
  else if (!engine) console.warn(`  ⚠ charting engine not installed — charts pages built with ${fixtures.length} fixtures but cannot render`)
  else console.log(`✓ charts — overview + ${CHART_CATEGORIES.length} category pages, ${fixtures.length} fixtures, engine v${engine.version} (${engine.modules.length} modules, local only)`)
  // Icons page — extract the product's real icon set from src/assets/icons/icons.js (build-time only).
  const icons = await loadProductIcons()
  if (icons.length) {
    fs.writeFileSync(path.join(OUT, 'icons.html'), iconsPageHtml({ icons, components, version, tokenCssHref, assetV, prefix: 'Font Awesome Light (fal)' }))
    console.log(`✓ generated ${built.length} pages + index + icons (${icons.length}) → ${path.relative(LIB, OUT)}`)
  } else {
    console.warn('  ⚠ product icons.js not found — skipped icons.html')
    console.log(`✓ generated ${built.length} pages + index → ${path.relative(LIB, OUT)}`)
  }
  // Logos page — product's monitor-type/brand/software logos, grouped by category.
  const logos = loadProductLogos()
  if (logos.length) {
    fs.writeFileSync(path.join(OUT, 'logos.html'), logosPageHtml({ logos, catOrder: LOGO_CAT_ORDER, components, version, tokenCssHref, assetV }))
    console.log(`✓ generated logos (${logos.length}: ${logos.filter((l) => l.set === 'color').length} color + ${logos.filter((l) => l.set === 'line').length} line)`)
  } else { console.warn('  ⚠ product logo assets not found — skipped logos.html') }
}

function copyBundle() {
  const src = path.resolve(LIB, 'dist', 'observeops-elements.js')
  if (!exists(src)) { console.warn('  ⚠ bundle not built — run `npm run build` first'); return './observeops-elements.js' }
  const buf = fs.readFileSync(src)
  const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8)
  fs.writeFileSync(path.join(OUT, 'observeops-elements.js'), buf)
  // the OPT-IN full-logo bundle — the site loads it so the Logo playground/gallery show all 445 (obs-logo prefers it)
  const logoSrc = path.resolve(LIB, 'dist', 'observeops-logos.js')
  if (exists(logoSrc)) {
    const lbuf = fs.readFileSync(logoSrc)
    fs.writeFileSync(path.join(OUT, 'observeops-logos.js'), lbuf)
  } else console.warn('  ⚠ observeops-logos.js not built — the full logo set will be missing from the site')
  return `./observeops-elements.js?v=${hash}`
}

function copyTokenCss() {
  if (exists(CSS_DIST)) {
    fs.copyFileSync(CSS_DIST, path.join(OUT, 'observeops-ds.css'))
    return './observeops-ds.css'
  }
  console.warn('  ⚠ css-package not built — linking jsDelivr token CSS')
  return 'https://cdn.jsdelivr.net/npm/@mtdt/observeops-ds-css/dist/observeops-ds.css'
}

function copyDir(from, to) {
  if (!exists(from)) return
  for (const name of fs.readdirSync(from)) {
    const s = path.join(from, name)
    const d = path.join(to, name)
    if (fs.statSync(s).isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyDir(s, d) }
    else fs.copyFileSync(s, d)
  }
}

function hashFiles(files) {
  const h = crypto.createHash('sha1')
  for (const f of files) if (exists(f)) h.update(fs.readFileSync(f))
  return h.digest('hex').slice(0, 8)
}
function pkgVersion() {
  try { return JSON.parse(read(path.join(LIB, 'package.json'))).version } catch { return '0.0.0' }
}
function titleize(s) { return String(s).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }

/** Extract the product's real icon set (src/assets/icons/icons.js — FontAwesome defs) at build time.
 *  Parses via a text→CJS transform (NOT `import()`): icons.js is a typeless ESM file that Node 18 (the
 *  deploy runtime) can't dynamically import — so we rewrite `export const X =` → `exports.X =` and eval it. */
async function loadProductIcons() {
  const p = ROOT ? path.join(ROOT, 'src', 'assets', 'icons', 'icons.js') : ''
  if (!exists(p)) return []
  try {
    const cjs = read(p).replace(/export\s+const\s+/g, 'exports.')
    const mod = {}
    // eslint-disable-next-line no-new-func
    new Function('exports', cjs)(mod)
    const out = []
    for (const v of Object.values(mod)) {
      if (!v || !Array.isArray(v.icon)) continue
      const [w, h, , , pathData] = v.icon
      const d = Array.isArray(pathData) ? pathData[pathData.length - 1] : pathData // duotone → main path
      if (!d || !v.iconName) continue
      out.push({ n: v.iconName, w, h, p: d })
    }
    out.sort((a, b) => a.n.localeCompare(b.n))
    return out
  } catch (e) { console.warn('  ⚠ could not parse product icons:', e.message); return [] }
}

// designer-friendly categories for the product's logos (tuned against the real 242-name set).
const LOGO_CAT_ORDER = ['AWS', 'Microsoft Azure', 'Google Cloud', 'Other Cloud', 'Virtualization', 'Containers',
  'Databases', 'Operating Systems', 'Web & App Servers', 'Languages & Frameworks', 'Storage & Hardware',
  'Network', 'Messaging & Queues', 'Directory & Auth', 'Protocols & Services', 'Browsers', 'Business Apps',
  'Brand & Platform', 'Software / Integrations', 'Other']
function logoCategory(n) {
  const s = n.toLowerCase()
  if (/^amazon|^aws/.test(s)) return 'AWS'
  if (/^azure/.test(s)) return 'Microsoft Azure'
  if (/^gcp|^google/.test(s)) return 'Google Cloud'
  if (/oracle-cloud|ibm-cloud|alibaba|digitalocean|^oci\b|openstack|^cloud$/.test(s)) return 'Other Cloud'
  if (/vmware|esxi|vsphere|hyper-?v|nutanix|citrix-xen|\bxen\b|proxmox|kvm|ovirt|vcenter|nsxt|prism|^vm$/.test(s)) return 'Virtualization'
  if (/docker|kubernetes|openshift|tanzu|k8s|container|rancher|podman/.test(s)) return 'Containers'
  if (/mysql|postgres|mongo|redis|mariadb|cassandra|oracle-(db|database|rac)|sql|mssql|sybase|db-?2|db2|ibm-db|elasticsearch|cosmos|dynamo|document-db|sap-(hana|max-db)|influx|couch|memcache|snowflake|-db$|database|jdbc/.test(s)) return 'Databases'
  if (/windows|linux|ubuntu|centos|redhat|debian|hp-ux|aix|solaris|mac-?os|freebsd|android|^ios$|ibm-as-400/.test(s)) return 'Operating Systems'
  if (/apache-http|apache-tomcat|^apache$|nginx|tomcat|glassfish|weblogic|websphere|jboss|wildfly|\biis\b|node|litespeed|caddy|jetty|haproxy|light-?httpd|harmonic/.test(s)) return 'Web & App Servers'
  if (/cpp|dotnet|\.net|^go$|^java$|javascript|^php$|python|ruby|web-framework|golang|scala|kotlin|perl/.test(s)) return 'Languages & Frameworks'
  if (/dell-emc|hitachi|hpe|ibm-flashsystem|ibm-tape|netapp|oceanstor|qnap|qsan|synology|fibrenetix|^storage$|hardware-sensor|ups|printer|snmp-device|fibre|flashsystem|storagegrid/.test(s)) return 'Storage & Hardware'
  if (/cisco|juniper|aruba|fortinet|palo|\bf5\b|netscaler|array-networks|huawei|arista|meraki|ubiquiti|mikrotik|checkpoint|sophos|sonicwall|extreme|brocade|ruckus|-adc$|wireless|switch|router|firewall|\bvpn\b|load-balancer|sdn|zscaler/.test(s)) return 'Network'
  if (/rabbit-mq|apache-mq|activemq|msmq|kafka|-mq$|\bmq\b|sqs|sns|servicebus|pubsub|queue|jms/.test(s)) return 'Messaging & Queues'
  if (/active-directory|ldap|authentication|radius|kerberos|okta|identity-access|privileged-access|iam/.test(s)) return 'Directory & Auth'
  if (/dns|ntp|^ping$|^port$|ssh|sftp|^ftp$|tftp|telnet|^http$|^url$|jmx|powershell|rest-api|bind9|ssl-certificate|proxy-server|log-collector|^snmp$|^local$|email(-gateway|-security)?$|symantec-messaging|search-engine|ocr-engine|file-integrity|api-gateway|^web$|domain|net-?flow/.test(s)) return 'Protocols & Services'
  if (/chrome|firefox|opera|edge|safari|seamonkey|avast|avg|brave|browser|\btor\b|falkon|palemoon|sleipnir|whale|yandex|^iron$/.test(s)) return 'Browsers'
  if (/exchange|office|sharepoint|outlook|teams|team$|^sap|servicenow|jira|slack|salesforce|dynamics|zimbra|onedrive|\berp\b|plm-system|ecm-system|it-asset|government-audit|email$/.test(s)) return 'Business Apps'
  return 'Other'
}
// ensure the <svg> root carries width/height (from its viewBox if absent) so it has an intrinsic size and
// scales PROPORTIONALLY under CSS max-width/max-height (a viewBox-only svg with width:auto collapses).
const sizeSvg = (svg) => svg.replace(/<svg([^>]*)>/i, (m, a) => {
  if (/\swidth=/i.test(a) && /\sheight=/i.test(a)) return m
  const vb = a.match(/viewBox="\s*[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\s*"/i)
  if (!vb) return m
  return `<svg${a} width="${vb[1]}" height="${vb[2]}">`
})
// namespace an SVG's internal ids + their refs (url(#id) / href="#id") so many inlined SVGs don't collide on
// shared ids like a/b/c — the #1 cause of gradient/clip logos rendering blank when many share one page.
function uniquifyIds(svg, uid) {
  const ids = [...new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]
  for (const id of ids) {
    const e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const nid = `${uid}-${id}`
    svg = svg.replace(new RegExp(`(\\sid=")${e}(")`, 'g'), `$1${nid}$2`)
      .replace(new RegExp(`url\\(#${e}\\)`, 'g'), `url(#${nid})`)
      .replace(new RegExp(`((?:xlink:)?href=")#${e}(")`, 'g'), `$1#${nid}$2`)
  }
  return svg
}
// a monochrome line-icon path may be authored at 48 / 512 / 1024 scale — so the viewBox is fitted to the path's
// REAL bounding box in the browser (data-fit), which is exact regardless of scale. The 512 here is only a fallback.
function lineSvg(pathMarkup) {
  return `<svg viewBox="0 0 512 512" width="512" height="512" fill="currentColor" data-fit="1">${pathMarkup}</svg>`
}

/** Extract the product's logo library: color monitor-type logos, monochrome line-icons, brand + software logos. */
function loadProductLogos() {
  const SRC = ROOT ? path.join(ROOT, 'src', 'assets') : ''
  const out = []
  let uid = 0 // per-svg id namespace, so shared gradient/clip ids across logos don't collide on one page
  // 1) color monitor-type logos (242 SVGs)
  const colorDir = path.join(SRC, 'icons', 'monitor-type-icons', 'icons')
  if (exists(colorDir)) {
    for (const f of fs.readdirSync(colorDir).filter((x) => x.endsWith('.svg'))) {
      const n = f.replace(/\.svg$/, '')
      const raw = read(path.join(colorDir, f)).trim()
      if (n === 'no-icon' || !/<svg[\s>]/i.test(raw)) continue // skip empty/invalid source files (e.g. sdn.svg is 0 bytes)
      out.push({ set: 'color', n, cat: logoCategory(n), kind: 'svg', svg: uniquifyIds(sizeSvg(raw), 'l' + (uid++)) })
    }
  }
  // 2) monochrome line-icons (parsed from the JS registry)
  const lineJs = path.join(SRC, 'icons', 'monitor-type-line-icons', 'monitor-type-line-icons.js')
  if (exists(lineJs)) {
    const txt = read(lineJs)
    const re = /\[Constants\.([A-Z0-9_]+)\]\s*:\s*'([^']*)'/g
    let m
    while ((m = re.exec(txt))) {
      const n = m[1].toLowerCase().replace(/_/g, '-')
      out.push({ set: 'line', n, cat: logoCategory(n), kind: 'svg', svg: lineSvg(m[2]) })
    }
  }
  // 3) brand + software logos (svg inline / png as data-uri)
  const asDataUri = (fp) => `data:image/${fp.endsWith('.svg') ? 'svg+xml' : 'png'};base64,${fs.readFileSync(fp).toString('base64')}`
  const addImages = (dir, cat, filter = () => true) => {
    if (!exists(dir)) return
    for (const f of fs.readdirSync(dir).filter((x) => /\.(svg|png)$/i.test(x) && filter(x))) {
      const n = f.replace(/\.(svg|png)$/i, '')
      const fp = path.join(dir, f)
      if (f.endsWith('.svg')) out.push({ set: 'color', n, cat, kind: 'svg', svg: uniquifyIds(sizeSvg(read(fp).trim()), 'l' + (uid++)) })
      else out.push({ set: 'color', n, cat, kind: 'img', src: asDataUri(fp) })
    }
  }
  // brand: prefer the full-colour marks (skip the *_dark duplicates to avoid near-identical rows)
  addImages(path.join(SRC, 'images', 'logo'), 'Brand & Platform', (f) => !/_dark/i.test(f))
  addImages(path.join(SRC, 'images', 'software-logos'), 'Software / Integrations')
  return out
}

main().catch((e) => { console.error(e); process.exit(1) })
