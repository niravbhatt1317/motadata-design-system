#!/usr/bin/env node
/**
 * build-variant-refs.mjs — capture a per-component × per-variant STYLE SIGNATURE reference library.
 *
 * Phase 3b of the authoring loop. `ds-conformance` already checks that a variant NAME is valid (variantEnum);
 * this goes deeper — "does the variant actually RENDER like itself?" It renders every obs-* component for every
 * variant (from the registry variantEnum/severityEnum), pierces the (open) shadow DOM to measure the real styled
 * control, and writes conformance/variant-refs.json = { 'obs-button': { primary: {bg,color,border,radius}, … } }.
 *
 * ds-conformance then compares each rendered instance's signature to ITS variant's reference → catches a
 * "primary" button CSS-overridden to grey (valid name, wrong look). Reuses the elements bundle + css package.
 *
 * Usage:  node build-variant-refs.mjs [--theme light|dark]   → writes scripts/variant-refs.json
 *   env:  CHROME (Chrome executable), UI_ROOT
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
const theme = (args.includes('--theme')) ? args[args.indexOf('--theme') + 1] : 'light'
const OUT = path.join(HERE, 'variant-refs.json')

// tag → registry id (mirror ds-conformance TAGMAP)
const TAGMAP = { 'obs-button': 'button', 'obs-tag': 'tag', 'obs-severity': 'severity', 'obs-link': 'link' }
function enums(id) {
  const p = path.join(DS, 'components', 'registry', `${id}.json`)
  if (!fs.existsSync(p)) return {}
  const r = JSON.parse(fs.readFileSync(p, 'utf8'))
  return { variant: Array.isArray(r.variantEnum) ? r.variantEnum : null, severity: Array.isArray(r.severityEnum) ? r.severityEnum : null }
}

// build a reference page rendering each tag × each variant, labelled with data-ref="tag|attr|value"
function refPage(cssJs) {
  const rows = []
  for (const [tag, id] of Object.entries(TAGMAP)) {
    const e = enums(id)
    if (e.variant) for (const v of e.variant) rows.push(`<${tag} variant="${v}" data-ref="${tag}|variant|${v}">Sample</${tag}>`)
    if (e.severity) for (const s of e.severity) rows.push(`<${tag} severity="${s}" display-text data-ref="${tag}|severity|${s}"></${tag}>`)
  }
  return `<style>${cssJs.css}</style><style>body{padding:24px;background:var(--page-background-color);font-family:'Poppins',sans-serif}` +
    `.r{display:flex;flex-wrap:wrap;gap:16px;align-items:center}</style>` +
    `<div class="r">${rows.join('\n')}</div><script type="module">${cssJs.js}</script>`
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }
function serve(root) {
  return http.createServer((q, r) => {
    let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'
    fs.readFile(path.join(root, u), (e, b) => { if (e) { r.writeHead(404); r.end() } else { r.writeHead(200, { 'Content-Type': MIME[path.extname(u).toLowerCase()] || 'application/octet-stream' }); r.end(b) } })
  })
}

// Measure the real styled control inside each host's (open) shadow root. Signature = the visible box: pick the
// shadow descendant with the largest area that has a background OR a border (the button/chip/pill body).
const MEASURE = () => {
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
      if (!best || area > best.area) best = { area, sig: { bg: c.backgroundColor, color: c.color, border: c.borderTopColor, borderW: Math.round(bw * 10) / 10, radius: Math.round((parseFloat(c.borderTopLeftRadius) || 0) * 10) / 10 } }
    }
    return best ? best.sig : null
  }
  const out = {}
  for (const host of document.querySelectorAll('[data-ref]')) {
    const sig = sigOf(host); if (!sig) continue
    out[host.getAttribute('data-ref')] = sig
  }
  return out
}

;(async () => {
  const css = fs.readFileSync(path.join(DS, 'css-package', 'dist', 'observeops-ds.css'), 'utf8')
  const js = fs.readFileSync(path.join(DS, 'components-lib', 'dist', 'observeops-elements.js'), 'utf8')
  const html = refPage({ css, js })
  const dir = fs.mkdtempSync(path.join(DS, '.variant-refs-'))
  fs.writeFileSync(path.join(dir, 'index.html'), html)

  let chromium
  for (const spec of [path.join(UI_ROOT, 'node_modules', 'playwright-core', 'index.js'), 'playwright-core', 'playwright']) {
    try { const pw = await import(spec); chromium = pw.chromium || (pw.default && pw.default.chromium); if (chromium) break } catch { /* next */ }
  }
  if (!chromium) { console.error('playwright-core/playwright not found'); process.exit(2) }
  const srv = serve(dir); await new Promise((r) => srv.listen(0, '127.0.0.1', r))
  const url = `http://127.0.0.1:${srv.address().port}/index.html`
  const browser = await chromium.launch(fs.existsSync(CHROME) ? { executablePath: CHROME } : {})
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => page.goto(url, { waitUntil: 'domcontentloaded' }))
  await page.waitForTimeout(800)

  // reshape flat "tag|attr|value" → { tag: { attr: { value: sig } } }
  const reshape = (flat) => { const refs = {}; for (const [k, sig] of Object.entries(flat)) { const [tag, attr, value] = k.split('|'); refs[tag] = refs[tag] || {}; refs[tag][attr] = refs[tag][attr] || {}; refs[tag][attr][value] = sig } return refs }

  // Capture BOTH themes — a dark render must be validated against dark references (the light navy ≠ dark navy).
  const setTheme = async (t) => { await page.evaluate((th) => { if (th === 'dark') document.documentElement.setAttribute('data-theme', 'dark-theme'); else document.documentElement.removeAttribute('data-theme') }, t); await page.waitForTimeout(400) }
  const refsByTheme = {}
  for (const t of ['light', 'dark']) { await setTheme(t); refsByTheme[t] = reshape(await page.evaluate(MEASURE)) }
  await browser.close(); srv.close(); fs.rmSync(dir, { recursive: true, force: true })

  const doc = { generated: null, note: 'per-variant rendered style signatures (shadow-DOM control), per theme — Phase 3b of ds-conformance', refs: refsByTheme }
  fs.writeFileSync(OUT, JSON.stringify(doc, null, 2) + '\n')
  const n = Object.keys(refsByTheme.light).length
  console.log(`variant-refs: captured light+dark signatures across ${n} components → ${path.relative(DS, OUT)}`)
})().catch((e) => { console.error('build-variant-refs ERROR', e.stack || e.message); process.exit(2) })
