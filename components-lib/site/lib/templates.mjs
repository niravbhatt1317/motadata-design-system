// Page templates — assemble the 3-column dimsum-style page from registry + manifest. Pure strings.
import { esc } from './escape.mjs'
import { elMarkup, snippet, attrString } from './snippet.mjs'
import { controlsPanel } from './controls.mjs'
import { propsTable, usageTab, a11yTab, changelogTab, knownIssuesTab, variantInfo } from './render-registry.mjs'

// the nav brand — set to the Motadata logo mark by generate.mjs; falls back to the wordmark if unset.
let BRAND_HTML = ''
export function setBrandHtml(h) { BRAND_HTML = h || '' }

// inline data-URI favicon (teal donut) — every page otherwise triggers a /favicon.ico 404,
// which shows up as a console error in the render checks.
const FAVICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='42' fill='%2314b8a6'/%3E%3Ccircle cx='50' cy='50' r='16' fill='%230b1220'/%3E%3C/svg%3E" />`

/** Left rail nav: collapsible groups (section → optional family sub-group → items). */
export function navHtml(components, currentId, version) {
  const CHEV = '<svg class="nav-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'
  const itemHtml = (c) => `<a class="nav-item${c.id === currentId ? ' active' : ''}" href="./${c.id}.html">${esc(c.display)}</a>`
  // count family members per section — multi-member families become sub-groups (1:1 atom families like Button/Logo
  // stay flat so the sidebar doesn't fill with one-item headings). ALWAYS_GROUP forces a heading even at ONE member
  // for genuine CONCEPTUAL families we want reserved/visible as they grow (e.g. Data Visualization = the one metric
  // selector today + room for more charting-authoring tools).
  const ALWAYS_GROUP = new Set(['Data Visualization'])
  const famCount = {}
  for (const c of components) {
    const s = c.section || 'Components'; const f = c.family || ''
    if (f) { (famCount[s] = famCount[s] || {})[f] = (famCount[s][f] || 0) + 1 }
  }
  // build the section → sub-group → items tree from the already-ordered components
  const tree = []
  let curSection = null
  let curSub = null
  for (const c of components) {
    const section = c.section || 'Components'
    const family = c.family || ''
    const useSub = !!family && ((famCount[section]?.[family] || 0) >= 2 || ALWAYS_GROUP.has(family))
    if (!curSection || curSection.name !== section) { curSection = { name: section, subs: [], items: [] }; tree.push(curSection); curSub = null }
    if (useSub) {
      if (!curSub || curSub.name !== family) { curSub = { name: family, items: [] }; curSection.subs.push(curSub) }
      curSub.items.push(c)
    } else { curSub = null; curSection.items.push(c) }
  }
  const heading = (kind, name, body, headerHtml) =>
    `<div class="${kind}" data-grp="${esc(name)}">${headerHtml || `<button class="${kind}-h" type="button" aria-expanded="true"><span>${esc(name)}</span>${CHEV}</button>`}<div class="${kind}-body">${body}</div></div>`
  const items = tree.map((sec) => {
    let body = sec.items.map(itemHtml).join('')
    body += sec.subs.map((sub) => {
      // an item flagged navGroupLink (the Charts overview) becomes the sub-group's LINKED header —
      // clicking the heading navigates to it instead of listing it as a self-referential child.
      const linkItem = sub.items.find((c) => c.navGroupLink)
      if (!linkItem) return heading('nav-sub', sub.name, sub.items.map(itemHtml).join(''))
      const header = `<div class="nav-sub-h nav-sub-link-h"><a class="nav-sub-link${currentId === linkItem.id ? ' active' : ''}" href="./${linkItem.id}.html">${esc(linkItem.display)}</a><button class="nav-sub-chev" type="button" aria-expanded="true" aria-label="Toggle ${esc(sub.name)} group">${CHEV}</button></div>`
      return heading('nav-sub', sub.name, sub.items.filter((c) => !c.navGroupLink).map(itemHtml).join(''), header)
    }).join('')
    return heading('nav-grp', sec.name, body)
  }).join('')
  // "Assets" group — the icon + logo libraries, pinned to the END of the nav
  const assetsGroup = heading('nav-grp', 'Assets',
    `<a class="nav-item${currentId === 'icons' ? ' active' : ''}" href="./icons.html">Icons</a><a class="nav-item${currentId === 'logos' ? ' active' : ''}" href="./logos.html">Logos</a>`)
  // "Build with AI" — the AI-authoring story, pinned to the TOP of the nav so any tool/human finds it first.
  // The ✦ sparkle sits at the far right (where a group chevron would be) as the "AI" marker.
  const buildLink = `<a class="nav-item nav-pinned${currentId === 'build-with-ai' ? ' active' : ''}" href="./build-with-ai.html" style="font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:8px"><span>Build with AI</span><span class="nav-spark" aria-hidden="true" style="color:var(--primary-alt);flex:none">✦</span></a>`
  return `<aside class="rail">
  <a class="brand" href="./index.html">${BRAND_HTML || '<span class="brand-mark">◇</span><span>ObserveOps Elements</span>'}</a>
  <div class="nav-search-wrap">
    <svg class="nav-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input id="nav-search" class="nav-search" type="text" placeholder="Search components" aria-label="Search components" autocomplete="off" spellcheck="false" />
    <kbd class="nav-search-kbd">/</kbd>
  </div>
  <div class="nav-scroll"><nav class="nav">${buildLink}${items}${assetsGroup}<p class="nav-empty">No matches.</p></nav></div>
  <div class="rail-foot">
    <button class="theme-btn" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle theme">
      <svg class="sun-moon" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24">
        <mask id="moon-mask"><rect x="0" y="0" width="24" height="24" fill="white"/><circle class="moon-dot" cx="24" cy="10" r="6" fill="black"/></mask>
        <circle class="sun" cx="12" cy="12" r="5.5" fill="currentColor" mask="url(#moon-mask)"/>
        <g class="sun-rays" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/>
        </g>
      </svg>
      <span class="theme-label">Theme</span>
    </button>
    <p class="muted small">${esc(version)}<br/>Web Components — framework-agnostic.</p>
  </div>
</aside>`
}

// Gallery for the Examples view: clean group headings + each component with a minimal muted caption
// (the distinguishing label + the registry usage count, e.g. "primary · 91×") — no noisy code chips.
// usage counts keyed by variant/size name (skipping non-count markers like "default")
function usageMap(registry) {
  const m = {}
  for (const key of ['variants', 'sizes', 'severityLevels']) {
    const arr = registry[key]
    if (!Array.isArray(arr)) continue
    for (const x of arr) {
      if (x && x.name && x.usage && !/^default$/i.test(String(x.usage))) m[String(x.name).toLowerCase()] = x.usage
    }
  }
  return m
}
const usageChip = (u) => `<span class="g-usage" title="uses in the product">${esc(u)}</span>`

function galleryHtml(manifest, registry) {
  const umap = usageMap(registry)
  const seen = new Set() // each variant's usage count is shown once (its first swatch), not repeated
  const groups = (manifest.gallery || [])
    .map((g) => {
      const items = g.items
        .map((it) => it.html
          ? `<div class="g-item g-item-wide"><div class="g-stage">${it.html}</div>${(it.caption || it.usage) ? `<div class="g-cap">${it.caption ? `<span class="g-label">${esc(it.caption)}</span>` : ''}${it.usage ? usageChip(it.usage) : ''}</div>` : ''}</div>`
          : `<div class="g-item"><div class="g-stage">${elMarkup(manifest.el, it.attrs, it.text)}</div>${captionFor(it, umap, seen)}</div>`)
        .join('')
      return `<div class="g-group"><h3>${esc(g.group)}</h3><div class="g-row">${items}</div></div>`
    })
    .join('')
  if (!groups) return ''
  const u = registry.usage
  const meta = u && u.total
    ? `<p class="gallery-meta">Used <b>${esc(u.total)}×</b>${u.files ? ` across ${esc(u.files)} files` : ''} in the product.</p>`
    : ''
  return `<div class="gallery">${meta}${groups}</div>`
}

function captionFor(item, umap, seen) {
  const a = item.attrs || {}
  let usage = ''
  if (item.usage) { // explicit per-item count (takes precedence)
    usage = usageChip(item.usage)
  } else { // auto: match an attr VALUE (e.g. variant="primary", type="number") or a true-flag KEY (e.g. allow-clear) to the usage map
    let key = null
    for (const [k, val] of Object.entries(a)) {
      const vv = String(val).toLowerCase()
      if (umap[vv]) { key = vv; break }
      if ((val === true || val === 'true') && umap[k.toLowerCase()]) { key = k.toLowerCase(); break }
    }
    if (key && !seen.has(key)) { seen.add(key); usage = usageChip(umap[key]) }
  }
  // label only when the component shows NO text of its own (else the caption would just repeat it)
  const hasText = item.text != null && String(item.text).trim() !== ''
  const label = hasText
    ? ''
    : Object.entries(a).filter(([k, val]) => val !== false && val != null && val !== '' && !['options', 'placeholder', 'searchable'].includes(k)).map(([k, val]) => (val === true ? k : (val === 'false' ? `not ${k}` : val))).join(' · ')
  if (!label && !usage) return ''
  return `<div class="g-cap">${label ? `<span class="g-label">${esc(label)}</span>` : ''}${usage}</div>`
}

// Keyboard-shortcut help overlay — toggled with `?`, closed with Esc / backdrop click.
// `full` includes the playground-only keys (component pages); index page shows just the global ones.
function helpHtml(full) {
  const row = (keys, label) =>
    `<div class="kbd-row"><span class="kbd-keys">${keys.map((k) => `<kbd>${esc(k)}</kbd>`).join('<span class="kbd-or">or</span>')}</span><span class="kbd-label">${esc(label)}</span></div>`
  const global = [
    [['/', '⌘K'], 'Search components'],
    [['T'], 'Toggle theme'],
    [['←', '→'], 'Previous / next component'],
    [['?'], 'Show this help'],
    [['Esc'], 'Close / blur'],
  ]
  const playground = [
    [['I'], 'Toggle Inspect'],
    [['E'], 'Switch Playground ⇄ Examples'],
    [['F'], 'Fullscreen preview'],
    [['+', '−', '0'], 'Zoom in / out / reset'],
  ]
  const section = (title, rows) => `<div class="kbd-sec"><h3>${title}</h3>${rows.map(([k, l]) => row(k, l)).join('')}</div>`
  return `<div class="kbd-overlay" id="kbd-overlay" aria-hidden="true">
  <div class="kbd-card" role="dialog" aria-label="Keyboard shortcuts">
    <div class="kbd-head"><h2>Keyboard shortcuts</h2><button class="kbd-close" id="kbd-close" aria-label="Close">×</button></div>
    <div class="kbd-body">${section('Navigation', global)}${full ? section('Preview', playground) : ''}</div>
  </div>
</div>`
}

function tabsHtml(registry, manifest) {
  const details = `<div class="controls">${controlsPanel(manifest, registry)}</div>${propsTable(registry)}`
  // Details is always shown; the rest only appear when they have data (registry-driven).
  const panels = [
    ['details', 'Details', details],
    ['usage', 'Usage', usageTab(registry)],
    ['a11y', 'Accessibility', a11yTab(registry)],
    ['changelog', 'Changelog', changelogTab(registry)],
    ['issues', 'Known issues', knownIssuesTab(registry)],
  ].filter(([id, , html]) => id === 'details' || (html && html.trim()))
  const bar = panels
    .map(([id, label], i) => `<button class="tab${i === 0 ? ' active' : ''}" data-tab="${id}">${esc(label)}</button>`)
    .join('')
  const body = panels
    .map(([id, , html], i) => `<div class="tabpanel${i === 0 ? ' active' : ''}" data-panel="${id}">${html}</div>`)
    .join('')
  return `<div class="tabbar" role="tablist">${bar}</div><div class="tabpanels">${body}</div>`
}

export function pageHtml(opts) {
  const { registry, manifest, components, version, tokenCssHref, bundleSrc, assetV, prev, next } = opts
  const display = registry.display || registry.name
  const pg = manifest.playground || {}
  // overlays (drawer/modal) must NOT auto-open in the docs (a modal <dialog> would make the whole page inert →
  // reads as a hang). A manifest may supply `playground.live` = raw HTML (a trigger + the closed element).
  const live = pg.live != null ? pg.live : elMarkup(manifest.el, pg.attrs || {}, pg.text != null ? pg.text : display)
  const snip = snippet(manifest.el, pg.attrs || {}, pg.text != null ? pg.text : display)
  const pageData = JSON.stringify({ el: manifest.el, events: manifest.events || [] })

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(display)} — ObserveOps Elements</title>
${FAVICON}<link rel="stylesheet" href="${tokenCssHref}" />
<link rel="stylesheet" href="./app.css?v=${assetV}" />
</head>
<body>
<div class="layout">
  ${navHtml(components, registry.name, version)}
  <main class="canvas">
    <div class="topbar">
      <div class="tb-left">
        <div class="view-toggle" role="tablist">
          <button class="vt-btn active" data-view="playground">Playground</button>
          <button class="vt-btn" data-view="examples">Examples</button>
        </div>
        <label class="inspect-sw" title="Measure: hover a component to see its size">
          <span class="ctl-toggle"><input type="checkbox" id="inspect-toggle" /><span class="ctl-track"></span></span>
          <span>Inspect</span>
        </label>
      </div>
      <div class="tb-tools">
        <div class="zoom">
          <button id="zoom-out" class="tb-icon" title="Zoom out">−</button>
          <button id="zoom-reset" class="tb-zoomval" title="Reset zoom"><span id="zoom-val">100%</span></button>
          <button id="zoom-in" class="tb-icon" title="Zoom in">+</button>
        </div>
        <button id="fullscreen-btn" class="tb-icon" title="View fullscreen">⛶</button>
        <div class="nav-arrows">
          ${prev ? `<a data-nav="prev" href="./${prev.id}.html" title="Previous: ${esc(prev.display)}">←</a>` : '<span class="dim" aria-disabled="true" title="No previous component">←</span>'}
          ${next ? `<a data-nav="next" href="./${next.id}.html" title="Next: ${esc(next.display)}">→</a>` : '<span class="dim" aria-disabled="true" title="No next component">→</span>'}
        </div>
      </div>
    </div>
    <div class="view view-playground active">
      <div class="stage">
        <button class="stage-close" id="stage-close" title="Exit fullscreen (Esc)" aria-label="Exit fullscreen">×</button>
        <div class="inspect-layer" id="inspect-layer" aria-hidden="true"></div>
        <div class="stage-inner" id="live-wrap">${live}</div>
      </div>
      <div class="snippet">
        <div class="snippet-head"><code>${esc(manifest.el)}</code><button class="copy" id="copy-btn">Copy snippet</button></div>
        <pre><code id="snippet">${esc(snip)}</code></pre>
      </div>
    </div>
    <div class="view view-examples">${galleryHtml(manifest, registry)}</div>
  </main>
  <aside class="panel">
    <div class="panel-resizer" id="panel-resizer" role="separator" aria-orientation="vertical" aria-label="Resize panel" title="Drag to resize the panel" tabindex="0">
      <span class="panel-grip" aria-hidden="true"><svg width="7" height="18" viewBox="0 0 7 18"><circle cx="2" cy="3" r="1.1"/><circle cx="5" cy="3" r="1.1"/><circle cx="2" cy="9" r="1.1"/><circle cx="5" cy="9" r="1.1"/><circle cx="2" cy="15" r="1.1"/><circle cx="5" cy="15" r="1.1"/></svg></span>
    </div>
    <div class="panel-head">
      <div class="panel-title"><h1>${esc(display)}</h1><button class="icon-btn copy-link" id="copy-link" title="Copy link to this component" aria-label="Copy link"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button></div>
      <p class="summary">${esc(registry.summary || '')}</p>
    </div>
    ${tabsHtml(registry, manifest)}
    ${(manifest.events && manifest.events.length)
      ? `<div class="eventlog"><span class="muted small">Event log <span class="dim">— interact with the component to see emitted events</span></span><div id="eventlog"></div></div>`
      : ''}
  </aside>
</div>
${helpHtml(true)}
<script>window.__PAGE__ = ${pageData};</script>
<script type="module" src="./observeops-logos.js"></script>
<script type="module" src="${bundleSrc}"></script>
<script src="./app.js?v=${assetV}"></script>
</body>
</html>`
}

// Icons gallery — the product's real Font Awesome Light set (extracted from src/assets/icons/icons.js).
// Each cell renders the genuine SVG path; hover reveals Copy SVG / Copy PNG / Download SVG / Download PNG.
export function iconsPageHtml({ icons, components, version, tokenCssHref, assetV, prefix }) {
  const cell = (ic) =>
    `<button class="ic-cell" data-n="${esc(ic.n)}"><span class="ic-svg"><svg viewBox="0 0 ${ic.w} ${ic.h}" fill="currentColor" aria-hidden="true"><path d="${ic.p}"/></svg></span><span class="ic-name">${esc(ic.n)}</span><span class="ic-actions"><span class="ic-act" data-a="csvg" title="Copy SVG">SVG</span><span class="ic-act" data-a="cpng" title="Copy PNG">PNG</span><span class="ic-act" data-a="dsvg" title="Download SVG">⤓svg</span><span class="ic-act" data-a="dpng" title="Download PNG">⤓png</span></span></button>`
  const grid = icons.map(cell).join('')
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Icons — ObserveOps Elements</title>
${FAVICON}<link rel="stylesheet" href="${tokenCssHref}" /><link rel="stylesheet" href="./app.css?v=${assetV}" />
<style>
.icons-canvas { display: flex; flex-direction: column; }
.ic-scroll { display: block; }
.ic-head { padding: 22px 28px 12px; }
.ic-head h1 { margin: 0 0 4px; font-size: 22px; }
.ic-head .muted { margin: 0; font-size: 13px; }
/* the toolbar sticks to the top of the viewport; the heading above it scrolls away */
.ic-toolbar { padding: 12px 28px; position: sticky; top: 0; background: var(--page-background-color); z-index: 5; border-bottom: 1px solid var(--border-color); }
.ic-row { display: flex; gap: 12px 16px; align-items: center; flex-wrap: wrap; }
.ic-searchbox { position: relative; flex: 1 1 260px; min-width: 200px; max-width: 460px; }
.ic-searchbox input { width: 100%; height: 36px; box-sizing: border-box; padding: 0 12px 0 34px; font: inherit; font-size: 14px;
  border: 1px solid var(--border-color); border-radius: 8px; background: var(--page-background-color); color: var(--page-text-color); outline: none; }
.ic-searchbox input:focus { border-color: var(--primary-alt); }
.ic-searchbox > svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--neutral-light); }
.ic-controls { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-left: auto; }
/* colour-wheel button + popover (with presets, a custom picker, and Reset inside it) */
.ic-colorwrap { position: relative; }
.ic-colorbtn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 30px; padding: 0; border: 1px solid var(--border-color); border-radius: 7px; background: var(--page-background-color); cursor: pointer; }
.ic-colorbtn:hover { border-color: var(--primary-alt); }
.ic-colorpop { position: absolute; right: 0; top: 38px; z-index: 30; width: 200px; box-sizing: border-box; background: var(--dropdown-background); border: 1px solid var(--border-color); border-radius: 10px; box-shadow: 0 8px 24px var(--neutral-shadow-light); padding: 12px; }
.ic-colorpop[hidden] { display: none; }
.ic-pop-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; color: var(--neutral-light); margin-bottom: 10px; }
.ic-swatches { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; margin-bottom: 12px; }
.ic-sw { width: 100%; aspect-ratio: 1; border: 1px solid var(--border-color); border-radius: 5px; cursor: pointer; padding: 0; }
.ic-sw:hover { outline: 2px solid var(--primary-alt); outline-offset: 1px; }
.ic-custom { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 12px; color: var(--page-text-color); margin-bottom: 10px; cursor: pointer; }
.ic-custom-sw { position: relative; width: 28px; height: 28px; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; }
.ic-custom-sw input { position: absolute; inset: -6px; width: 150%; height: 150%; border: none; padding: 0; cursor: pointer; background: none; }
.ic-reset { width: 100%; height: 32px; font: inherit; font-size: 12px; border: 1px solid var(--border-color); border-radius: 7px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; }
.ic-reset:hover { border-color: var(--primary-alt); color: var(--primary); }
.ic-toggle { display: inline-flex; align-items: center; gap: 8px; height: 30px; padding: 0 12px; font: inherit; font-size: 12px; border: 1px solid var(--border-color); border-radius: 7px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; }
.ic-toggle .dot { width: 26px; height: 15px; border-radius: 100px; background: var(--neutral-lighter); position: relative; transition: background .12s; flex-shrink: 0; }
.ic-toggle .dot::after { content: ""; position: absolute; top: 2px; left: 2px; width: 11px; height: 11px; border-radius: 50%; background: var(--page-background-color); transition: transform .12s; }
.ic-toggle[aria-pressed="true"] .dot { background: var(--primary); }
.ic-toggle[aria-pressed="true"] .dot::after { transform: translateX(11px); }
.ic-sizes { display: inline-flex; border: 1px solid var(--border-color); border-radius: 7px; overflow: hidden; }
.ic-size { width: 32px; height: 30px; font: inherit; font-size: 12px; border: none; border-right: 1px solid var(--border-color); background: var(--page-background-color); color: var(--neutral-light); cursor: pointer; }
.ic-size:last-child { border-right: none; }
.ic-size.active { background: var(--primary); color: var(--page-background-color); }
.ic-body { padding: 10px 28px 40px; }
.icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(116px, 1fr)); gap: 10px; --icon-color: var(--page-text-color); }
.icon-grid[data-size="s"] { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); }
.icon-grid[data-size="l"] { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.ic-cell { position: relative; display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 18px 8px 12px; box-sizing: border-box;
  border: 1px solid var(--border-color); border-radius: 8px; background: var(--page-background-color); cursor: pointer; font: inherit; }
.ic-cell:hover { border-color: var(--primary-alt); }
.ic-svg svg { width: 26px; height: 26px; display: block; color: var(--icon-color); }
.icon-grid[data-size="s"] .ic-svg svg { width: 22px; height: 22px; }
.icon-grid[data-size="l"] .ic-svg svg { width: 38px; height: 38px; }
.ic-name { font-size: 11px; color: var(--neutral-light); text-align: center; word-break: break-word; line-height: 1.35; }
.icon-grid.no-names .ic-name { display: none; }
.icon-grid.no-names .ic-cell { padding: 20px 8px; }
.ic-actions { position: absolute; inset: 0; display: flex; flex-wrap: wrap; align-content: center; align-items: center; justify-content: center; gap: 5px;
  padding: 6px; background: var(--page-background-color); border-radius: 8px; opacity: 0; visibility: hidden; transition: opacity .1s; }
.ic-cell:hover .ic-actions, .ic-cell:focus-within .ic-actions { opacity: 1; visibility: visible; }
.ic-act { font-size: 10px; padding: 4px 7px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; }
.ic-act:hover { background: var(--dropdown-hover-background); color: var(--primary); border-color: var(--primary-alt); }
.ic-empty { padding: 30px; color: var(--neutral-light); font-size: 13px; }
.ic-toast { position: fixed; left: 50%; bottom: 26px; transform: translate(-50%, 12px); background: var(--primary); color: var(--page-background-color);
  padding: 9px 16px; border-radius: 8px; font-size: 13px; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; z-index: 100; box-shadow: 0 6px 20px var(--neutral-shadow-light); }
.ic-toast.show { opacity: 1; transform: translate(-50%, 0); }
</style>
</head><body>
<div class="layout no-panel">
  ${navHtml(components, 'icons', version)}
  <main class="canvas icons-canvas">
    <div class="ic-scroll">
      <div class="ic-head"><h1>Icons</h1><p class="muted">The product's icon set — <b>${icons.length}</b> ${esc(prefix || 'Font Awesome Light (fal)')} glyphs from <code>src/assets/icons/icons.js</code>, referenced as <code>&lt;MIcon name="…"/&gt;</code>. Search, recolour, resize, and copy/download any as SVG or PNG.</p></div>
      <div class="ic-toolbar">
        <div class="ic-row">
          <div class="ic-searchbox"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input id="ic-search" type="text" placeholder="Search icons by name…" autocomplete="off" spellcheck="false" /></div>
          <div class="ic-controls">
            <div class="ic-colorwrap">
              <button class="ic-colorbtn" id="ic-colorbtn" title="Recolour icons" aria-label="Recolour icons"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 12L22 12A10 10 0 0 1 19.07 19.07Z" fill="#f04e3e"/><path d="M12 12L19.07 19.07A10 10 0 0 1 12 22Z" fill="#f78c1e"/><path d="M12 12L12 22A10 10 0 0 1 4.93 19.07Z" fill="#f5c518"/><path d="M12 12L4.93 19.07A10 10 0 0 1 2 12Z" fill="#14b053"/><path d="M12 12L2 12A10 10 0 0 1 4.93 4.93Z" fill="#12b5b0"/><path d="M12 12L4.93 4.93A10 10 0 0 1 12 2Z" fill="#099dd9"/><path d="M12 12L12 2A10 10 0 0 1 19.07 4.93Z" fill="#6a5acd"/><path d="M12 12L19.07 4.93A10 10 0 0 1 22 12Z" fill="#d63384"/><circle cx="12" cy="12" r="3.4" fill="var(--page-background-color,#fff)"/></svg></button>
              <div class="ic-colorpop" id="ic-colorpop" hidden>
                <div class="ic-pop-title">Icon colour</div>
                <div class="ic-swatches">
                  <button class="ic-sw" data-c="#111c2c" style="background:#111c2c" title="Navy"></button><button class="ic-sw" data-c="#000000" style="background:#000" title="Black"></button><button class="ic-sw" data-c="#6a7fa0" style="background:#6a7fa0" title="Grey"></button><button class="ic-sw" data-c="#ec5b5b" style="background:#ec5b5b" title="Red"></button><button class="ic-sw" data-c="#f78c1e" style="background:#f78c1e" title="Orange"></button><button class="ic-sw" data-c="#14b053" style="background:#14b053" title="Green"></button><button class="ic-sw" data-c="#099dd9" style="background:#099dd9" title="Blue"></button><button class="ic-sw" data-c="#6a5acd" style="background:#6a5acd" title="Purple"></button>
                </div>
                <label class="ic-custom"><span>Custom</span><span class="ic-custom-sw"><input type="color" id="ic-color" value="#1d2a3e" /></span></label>
                <button class="ic-reset" id="ic-reset">Reset to theme colour</button>
              </div>
            </div>
            <button class="ic-toggle" id="ic-names" aria-pressed="true" title="Show / hide names"><span class="dot"></span>Names</button>
            <div class="ic-sizes" role="group" aria-label="Icon size"><button class="ic-size" data-s="s">S</button><button class="ic-size active" data-s="m">M</button><button class="ic-size" data-s="l">L</button></div>
          </div>
        </div>
      </div>
      <div class="ic-body"><div class="icon-grid" id="icon-grid" data-size="m">${grid}</div><p class="ic-empty" id="ic-empty" style="display:none">No icons match.</p></div>
    </div>
  </main>
</div>
<div class="ic-toast" id="ic-toast"></div>
<script src="./app.js?v=${assetV}"></script>
<script>
(function(){
  var grid=document.getElementById('icon-grid'), search=document.getElementById('ic-search'), toast=document.getElementById('ic-toast'), empty=document.getElementById('ic-empty'), tt;
  var iconColor=null; // null = follow the theme; a hex string = recoloured
  function showToast(m){ toast.textContent=m; toast.classList.add('show'); clearTimeout(tt); tt=setTimeout(function(){toast.classList.remove('show');},1500); }
  function partsOf(cell){ var s=cell.querySelector('svg'); return { vb: s.getAttribute('viewBox'), d: s.querySelector('path').getAttribute('d') }; }
  // copy uses the picked colour if set, else currentColor so it inherits wherever pasted
  function svgStr(cell){ var p=partsOf(cell); return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+p.vb+'" fill="'+(iconColor||'currentColor')+'"><path d="'+p.d+'"/></svg>'; }
  function toPng(cell, size){ size=size||256; var color=iconColor||(getComputedStyle(document.documentElement).getPropertyValue('--page-text-color').trim())||'#1d2a3e';
    var p=partsOf(cell); var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+p.vb+'" fill="'+color+'"><path d="'+p.d+'"/></svg>'; var img=new Image();
    return new Promise(function(resolve,reject){ img.onload=function(){ var c=document.createElement('canvas'); c.width=size; c.height=size; c.getContext('2d').drawImage(img,0,0,size,size); c.toBlob(resolve,'image/png'); }; img.onerror=reject; img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); }); }
  function dl(blob, filename){ var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(url);},1000); }
  grid.addEventListener('click', function(e){
    var act=e.target.closest('.ic-act'); var cell=e.target.closest('.ic-cell'); if(!cell) return;
    var name=cell.dataset.n; var a=act? act.dataset.a : 'csvg';
    (async function(){ try{
      if(a==='csvg'){ await navigator.clipboard.writeText(svgStr(cell)); showToast('Copied SVG · '+name); }
      else if(a==='cpng'){ var b=await toPng(cell); await navigator.clipboard.write([new ClipboardItem({'image/png':b})]); showToast('Copied PNG · '+name); }
      else if(a==='dsvg'){ dl(new Blob([svgStr(cell)],{type:'image/svg+xml'}), name+'.svg'); showToast('Downloaded '+name+'.svg'); }
      else if(a==='dpng'){ var b2=await toPng(cell,256); dl(b2, name+'.png'); showToast('Downloaded '+name+'.png'); }
    }catch(err){ showToast('Clipboard blocked — use ⤓ to download'); } })();
  });
  // ---- recolour (colour-wheel popover: presets + custom + reset) ----
  var colorBtn=document.getElementById('ic-colorbtn'), colorPop=document.getElementById('ic-colorpop'), colorInput=document.getElementById('ic-color'), reset=document.getElementById('ic-reset');
  function setColor(hex){ iconColor=hex; grid.style.setProperty('--icon-color', hex); colorInput.value=hex; }
  colorBtn.addEventListener('click', function(e){ e.stopPropagation(); colorPop.hidden=!colorPop.hidden; });
  [].slice.call(document.querySelectorAll('.ic-sw')).forEach(function(sw){ sw.addEventListener('click', function(){ setColor(sw.dataset.c); }); });
  colorInput.addEventListener('input', function(){ setColor(colorInput.value); });
  reset.addEventListener('click', function(){ iconColor=null; grid.style.removeProperty('--icon-color'); colorInput.value='#1d2a3e'; colorPop.hidden=true; showToast('Colour reset'); });
  document.addEventListener('click', function(e){ if(!e.target.closest('.ic-colorwrap')) colorPop.hidden=true; });
  // ---- names toggle ----
  var namesBtn=document.getElementById('ic-names');
  namesBtn.addEventListener('click', function(){ var on=namesBtn.getAttribute('aria-pressed')!=='true'; namesBtn.setAttribute('aria-pressed', on?'true':'false'); grid.classList.toggle('no-names', !on); });
  // ---- size ----
  [].slice.call(document.querySelectorAll('.ic-size')).forEach(function(btn){ btn.addEventListener('click', function(){ grid.dataset.size=btn.dataset.s; document.querySelectorAll('.ic-size').forEach(function(x){x.classList.toggle('active',x===btn);}); }); });
  // ---- search ----
  var cells=[].slice.call(grid.children);
  if(search){ search.placeholder='Search '+cells.length+' icons by name…';
    search.addEventListener('input', function(){ var q=search.value.trim().toLowerCase(); var n=0;
      cells.forEach(function(c){ var hit=!q || c.dataset.n.indexOf(q)>=0; c.style.display=hit?'':'none'; if(hit)n++; });
      empty.style.display=n?'none':''; }); }
})();
</script>
</body></html>`
}

// Logos gallery — the product's monitor-type / brand / software logos, grouped by category, with a
// Color⇄Line set toggle, category filter chips, search, and Copy SVG/PNG + Download per logo.
export function logosPageHtml({ logos, catOrder, components, version, tokenCssHref, assetV }) {
  const nColor = logos.filter((l) => l.set === 'color').length
  const nLine = logos.filter((l) => l.set === 'line').length
  // merge colour + line variants by name so one cell can hold BOTH (shown side by side in "All", one at a time otherwise)
  const byName = new Map()
  for (const l of logos) {
    if (!byName.has(l.n)) byName.set(l.n, { n: l.n, cat: l.cat, color: null, line: null })
    const e = byName.get(l.n)
    if (l.set === 'color') { e.color = l; e.cat = l.cat } else { e.line = l; if (!e.color) e.cat = l.cat }
  }
  const entries = [...byName.values()]
  // one action group per variant (colour / line) — so in the All view you can copy/download EITHER, not just colour.
  const vacts = (variant) => `<span class="lg-vgroup v-${variant}"><span class="lg-vlabel">${variant === 'color' ? 'Colour' : 'Line'}</span><span class="lg-act" data-a="csvg" data-v="${variant}" title="Copy SVG">SVG</span><span class="lg-act" data-a="cpng" data-v="${variant}" title="Copy PNG">PNG</span><span class="lg-act" data-a="dsvg" data-v="${variant}" title="Download SVG">↓svg</span><span class="lg-act" data-a="dpng" data-v="${variant}" title="Download PNG">↓png</span></span>`
  const cell = (e) => {
    const colorArt = e.color ? (e.color.kind === 'img' ? `<img src="${e.color.src}" alt="${esc(e.n)}" loading="lazy"/>` : e.color.svg) : ''
    const lineArt = e.line ? e.line.svg : ''
    const cls = [e.color ? 'has-color' : '', e.line ? 'has-line' : ''].filter(Boolean).join(' ')
    const arts = (colorArt ? `<span class="lg-art lg-color">${colorArt}</span>` : '') + (lineArt ? `<span class="lg-art lg-line">${lineArt}</span>` : '')
    const actions = (e.color ? vacts('color') : '') + (e.line ? vacts('line') : '')
    return `<button class="lg-cell ${cls}" data-n="${esc(e.n)}" data-c="${esc(e.cat)}"><span class="lg-arts">${arts}</span><span class="lg-name">${esc(e.n)}</span><span class="lg-actions">${actions}</span></button>`
  }
  const presentCats = catOrder.filter((c) => entries.some((e) => e.cat === c))
  const sections = presentCats.map((c) => {
    const items = entries.filter((e) => e.cat === c).sort((a, b) => a.n.localeCompare(b.n))
    return `<section class="lg-group" data-c="${esc(c)}"><h2 class="lg-group-h">${esc(c)}<span class="lg-group-n">${items.length}</span></h2><div class="lg-grid">${items.map(cell).join('')}</div></section>`
  }).join('')
  const catMenu = `<button class="lg-catitem active" data-c="all">All categories<span class="lg-catn">${entries.length}</span></button>` +
    presentCats.map((c) => `<button class="lg-catitem" data-c="${esc(c)}">${esc(c)}<span class="lg-catn">${entries.filter((e) => e.cat === c).length}</span></button>`).join('')
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Logos — ObserveOps Elements</title>
${FAVICON}<link rel="stylesheet" href="${tokenCssHref}" /><link rel="stylesheet" href="./app.css?v=${assetV}" />
<style>
.logos-canvas { display: flex; flex-direction: column; }
.lg-head { padding: 22px 28px 12px; }
.lg-head h1 { margin: 0 0 4px; font-size: 22px; }
.lg-head .muted { margin: 0; font-size: 13px; }
/* the toolbar sticks to the top of the scroll area; the heading above it scrolls away */
.lg-toolbar { padding: 12px 28px; position: sticky; top: 0; background: var(--page-background-color); z-index: 5; border-bottom: 1px solid var(--border-color); }
.lg-body { padding: 8px 28px 48px; }
.lg-row1 { display: flex; gap: 12px; align-items: center; flex-wrap: nowrap; }
.lg-right { display: flex; gap: 12px; align-items: center; margin-left: auto; }
.lg-tabs { display: inline-flex; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.lg-tab { font: inherit; font-size: 13px; padding: 7px 15px; border: none; border-right: 1px solid var(--border-color); background: var(--page-background-color); color: var(--neutral-light); cursor: pointer; }
.lg-tab:last-child { border-right: none; }
.lg-tab.active { background: var(--primary); color: var(--page-background-color); }
/* category dropdown */
.lg-catfilter { position: relative; flex-shrink: 0; }
.lg-catbtn { display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; font: inherit; font-size: 13px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; }
.lg-catbtn:hover { border-color: var(--primary-alt); }
.lg-catbtn .chev { width: 8px; height: 8px; border-right: 1.5px solid var(--neutral-light); border-bottom: 1.5px solid var(--neutral-light); transform: translateY(-2px) rotate(45deg); }
.lg-catmenu { position: absolute; left: 0; top: 42px; z-index: 20; min-width: 240px; max-height: 360px; overflow: auto; background: var(--dropdown-background); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px var(--neutral-shadow-light); padding: 5px; }
.lg-catmenu[hidden] { display: none; }
.lg-catitem { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; box-sizing: border-box; padding: 8px 10px; border: none; border-radius: 6px; background: none; font: inherit; font-size: 13px; color: var(--page-text-color); cursor: pointer; text-align: left; }
.lg-catitem:hover { background: var(--dropdown-hover-background); }
.lg-catitem.active { color: var(--primary); font-weight: 500; }
.lg-catn { color: var(--neutral-light); font-size: 11px; }
.lg-searchbox { position: relative; flex: 0 0 auto; width: 460px; max-width: 44vw; }
.lg-searchbox input { width: 100%; height: 36px; box-sizing: border-box; padding: 0 12px 0 34px; font: inherit; font-size: 14px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--page-background-color); color: var(--page-text-color); outline: none; }
.lg-searchbox input:focus { border-color: var(--primary-alt); }
.lg-searchbox svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--neutral-light); }
.lg-scroll { display: block; }
.lg-group { margin-top: 20px; }
.lg-group-h { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; color: var(--neutral-light); }
.lg-group-n { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 18px; padding: 0 6px; border-radius: 100px; background: var(--code-tag-background-color); color: var(--neutral-regular); font-size: 11px; font-weight: 500; }
.lg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(152px, 1fr)); gap: 10px; }
.lg-cell { position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px 8px 11px; box-sizing: border-box; border: 1px solid var(--border-color); border-radius: 8px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; font: inherit; }
.lg-cell:hover { border-color: var(--primary-alt); }
.lg-arts { display: flex; align-items: center; justify-content: center; gap: 12px; height: 44px; }
.lg-art { display: flex; align-items: center; justify-content: center; }
.lg-art svg, .lg-art img { max-width: 54px; max-height: 42px; display: block; object-fit: contain; }
/* view switching: colour hides the line art (and line-only cells), line hides the colour art */
.lg-scroll[data-view="color"] .lg-line { display: none; }
.lg-scroll[data-view="line"] .lg-color { display: none; }
.lg-name { font-size: 11px; color: var(--neutral-light); text-align: center; word-break: break-word; line-height: 1.35; }
.lg-actions { position: absolute; inset: 0; display: flex; flex-direction: column; align-content: center; align-items: center; justify-content: center; gap: 8px; padding: 5px; background: var(--page-background-color); border-radius: 8px; overflow: auto; opacity: 0; visibility: hidden; transition: opacity .1s; }
.lg-cell:hover .lg-actions, .lg-cell:focus-within .lg-actions { opacity: 1; visibility: visible; }
.lg-vgroup { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 3px; }
.lg-vlabel { width: 100%; text-align: center; font-size: 8.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; color: var(--neutral-light); margin-bottom: 1px; }
/* single-variant views: hide the other group + drop the labels (no ambiguity) */
.lg-scroll[data-view="color"] .v-line, .lg-scroll[data-view="line"] .v-color { display: none; }
.lg-scroll:not([data-view="all"]) .lg-vlabel { display: none; }
.lg-act { font-size: 9px; padding: 3px 4px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; }
.lg-act:hover { background: var(--dropdown-hover-background); color: var(--primary); border-color: var(--primary-alt); }
.lg-empty { padding: 30px; color: var(--neutral-light); font-size: 13px; display: none; }
.lg-toast { position: fixed; left: 50%; bottom: 26px; transform: translate(-50%, 12px); background: var(--primary); color: var(--page-background-color); padding: 9px 16px; border-radius: 8px; font-size: 13px; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; z-index: 100; box-shadow: 0 6px 20px var(--neutral-shadow-light); }
.lg-toast.show { opacity: 1; transform: translate(-50%, 0); }
</style>
</head><body>
<div class="layout no-panel">
  ${navHtml(components, 'logos', version)}
  <main class="canvas logos-canvas">
    <div class="lg-scroll" id="lg-scroll" data-view="all">
      <div class="lg-head"><h1>Logos</h1><p class="muted">The product's logo library — <b>${nColor}</b> colour logos + <b>${nLine}</b> monochrome line icons (monitor types, brand & integrations), grouped by category. <b>All</b> shows the line icon beside its colour logo. Hover to copy the SVG/PNG or download.</p></div>
      <div class="lg-toolbar">
        <div class="lg-row1">
          <div class="lg-tabs"><button class="lg-tab active" data-view="all">All</button><button class="lg-tab" data-view="color">Colour logos</button><button class="lg-tab" data-view="line">Line icons</button></div>
          <div class="lg-right">
            <div class="lg-catfilter"><button class="lg-catbtn" id="lg-catbtn"><span id="lg-catlabel">All categories</span><span class="chev"></span></button><div class="lg-catmenu" id="lg-catmenu" hidden>${catMenu}</div></div>
            <div class="lg-searchbox"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input id="lg-search" type="text" placeholder="Search logos by name…" autocomplete="off" spellcheck="false" /></div>
          </div>
        </div>
      </div>
      <div class="lg-body">${sections}<p class="lg-empty" id="lg-empty">No logos match.</p></div>
    </div>
  </main>
</div>
<div class="lg-toast" id="lg-toast"></div>
<script src="./app.js?v=${assetV}"></script>
<script>
(function(){
  var qs=function(s,r){return (r||document).querySelector(s)}, qsa=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var scroll=qs('#lg-scroll'), search=qs('#lg-search'), toast=qs('#lg-toast'), empty=qs('#lg-empty'), tt, activeCat='all', lineFitted=false;
  function showToast(m){ toast.textContent=m; toast.classList.add('show'); clearTimeout(tt); tt=setTimeout(function(){toast.classList.remove('show');},1500); }
  // fit each line svg's viewBox to the path's REAL bbox (paths come at 48/256/512 scale). Needs the svg visible.
  function fitLine(){ if(lineFitted) return; lineFitted=true;
    qsa('.lg-line svg[data-fit]').forEach(function(svg){ try{ var p=svg.querySelector('path'); var bb=p.getBBox(); if(!bb.width||!bb.height) return; var pad=Math.max(bb.width,bb.height)*0.06; svg.setAttribute('viewBox',(bb.x-pad)+' '+(bb.y-pad)+' '+(bb.width+2*pad)+' '+(bb.height+2*pad)); }catch(e){} }); }
  function apply(){
    var v=scroll.dataset.view, q=search.value.trim().toLowerCase(), total=0;
    qsa('.lg-group', scroll).forEach(function(sec){ var vis=0;
      qsa('.lg-cell', sec).forEach(function(c){
        var hasArt = v==='all' || (v==='color'&&c.classList.contains('has-color')) || (v==='line'&&c.classList.contains('has-line'));
        var hit = hasArt && (activeCat==='all'||c.dataset.c===activeCat) && (!q||c.dataset.n.indexOf(q)>=0);
        c.style.display=hit?'':'none'; if(hit)vis++; });
      sec.style.display=vis?'':'none'; total+=vis; });
    empty.style.display=total?'none':'';
  }
  qsa('.lg-tab').forEach(function(b){ b.addEventListener('click', function(){ scroll.dataset.view=b.dataset.view; qsa('.lg-tab').forEach(function(x){x.classList.toggle('active',x===b);}); apply(); if(b.dataset.view!=='color') fitLine(); }); });
  // category dropdown
  var catBtn=qs('#lg-catbtn'), catMenuEl=qs('#lg-catmenu'), catLabel=qs('#lg-catlabel');
  catBtn.addEventListener('click', function(e){ e.stopPropagation(); catMenuEl.hidden=!catMenuEl.hidden; });
  qsa('.lg-catitem').forEach(function(it){ it.addEventListener('click', function(){ activeCat=it.dataset.c; qsa('.lg-catitem').forEach(function(x){x.classList.toggle('active',x===it);}); catLabel.textContent=(it.dataset.c==='all'?'All categories':it.dataset.c); catMenuEl.hidden=true; apply(); }); });
  document.addEventListener('click', function(e){ if(!e.target.closest('.lg-catfilter')) catMenuEl.hidden=true; });
  search.addEventListener('input', apply);
  // ---- copy / download — the clicked action carries data-v (colour|line); pick THAT variant's art ----
  function artEl(cell, variant){ var box=cell.querySelector('.lg-'+variant); if(!box) return null; return box.querySelector('svg')||box.querySelector('img'); }
  function defaultVariant(cell){ var v=scroll.dataset.view; if(v==='line') return 'line'; return cell.classList.contains('has-color')?'color':'line'; }
  function svgStr(el){ if(!el||el.tagName.toLowerCase()!=='svg') return null; var s=el.outerHTML; if(!/xmlns=/.test(s)) s=s.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"'); return s; }
  function rasterize(el, size){ size=size||256; return new Promise(function(resolve){ if(!el) return resolve(null); var img=new Image();
    img.onload=function(){ var c=document.createElement('canvas'); c.width=size; c.height=size; var ctx=c.getContext('2d'); var iw=img.naturalWidth||size, ih=img.naturalHeight||size, sc=Math.min(size/iw,size/ih), w=iw*sc, h=ih*sc; ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h); c.toBlob(resolve,'image/png'); };
    img.onerror=function(){resolve(null);};
    if(el.tagName.toLowerCase()==='img'){ img.src=el.src; }
    else { var s=el.outerHTML; var color=(getComputedStyle(document.documentElement).getPropertyValue('--page-text-color').trim())||'#1d2a3e'; s=s.replace(/currentColor/g,color); if(!/xmlns=/.test(s)) s=s.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"'); img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s); } }); }
  function dl(blob, filename){ var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(url);},1000); }
  scroll.addEventListener('click', function(e){
    var act=e.target.closest('.lg-act'); var cell=e.target.closest('.lg-cell'); if(!cell) return;
    var variant=act? act.dataset.v : defaultVariant(cell); var el=artEl(cell, variant); var isSvg=el&&el.tagName.toLowerCase()==='svg';
    var suffix=(variant==='line'?'-line':''); var name=cell.dataset.n+suffix;
    var a=act? act.dataset.a : (isSvg?'csvg':'cpng'); var isCopy=(a.charAt(0)==='c');
    (async function(){ try{
      if(a==='csvg'){ var s=svgStr(el); if(!s) return showToast('PNG-only logo — use PNG'); await navigator.clipboard.writeText(s); showToast('Copied '+variant+' SVG · '+cell.dataset.n); }
      else if(a==='cpng'){ var b=await rasterize(el); if(!b) return showToast('Could not render '+name); await navigator.clipboard.write([new ClipboardItem({'image/png':b})]); showToast('Copied '+variant+' PNG · '+cell.dataset.n); }
      else if(a==='dsvg'){ var s2=svgStr(el); if(!s2) return showToast('PNG-only logo — use ⤓png'); dl(new Blob([s2],{type:'image/svg+xml'}), name+'.svg'); showToast('Downloaded '+name+'.svg'); }
      else if(a==='dpng'){ var b2=await rasterize(el); if(!b2) return showToast('Could not render '+name); dl(b2, name+'.png'); showToast('Downloaded '+name+'.png'); }
    }catch(err){ showToast(isCopy ? 'Clipboard blocked — use ⤓ to download' : 'Download failed for '+name); } })();
  });
  fitLine(); // default view is "all" → line arts are visible, so fit them now
})();
</script>
</body></html>`
}

export function buildWithAiPageHtml(components, version, tokenCssHref, assetV, bundleSrc) {
  const code = (s) => `<div class="bwa-codewrap"><pre class="bwa-code"><code>${esc(s)}</code></pre><button class="bwa-copy" type="button" aria-label="Copy to clipboard">Copy</button></div>`
  const li = (n, text) => `<li class="bwa-step"><span class="bwa-num">${n}</span><div>${text}</div></li>`
  const CMD_MCP = 'claude mcp add observeops-ds -s user -- npx -y @mtdt/observeops-ds-mcp'
  const RULES_MD = '# ObserveOps design system\n\nWhen building ANY UI in this project, use the ObserveOps design system — never guess a component or colour:\n\n1. Call the observeops-ds MCP: get_setup, get_contract, then search_components / get_component for each part.\n2. Build with the real components: @mtdt/observeops-ds-elements (the obs-* web components) + @mtdt/observeops-ds-css tokens.\n3. Resolve every colour with resolve_token; validate the result with validate_render before finishing.\n'
  // code block with BOTH a Copy and a Download button (client-side Blob → downloads as the given filename)
  const codeDL = (content, filename) => `<div class="bwa-codewrap"><pre class="bwa-code"><code>${esc(content)}</code></pre><div class="bwa-btns"><button class="bwa-dl" type="button" data-file="${filename}">⬇ Download ${filename}</button><button class="bwa-copy" type="button" aria-label="Copy to clipboard">Copy</button></div></div>`
  const CFG_MCP = '{\n  "mcpServers": {\n    "observeops-ds": {\n      "command": "npx",\n      "args": ["-y", "@mtdt/observeops-ds-mcp"]\n    }\n  }\n}'
  const CMD_SPEC = 'npm install @mtdt/observeops-ds-spec'
  const RULES_LINE = 'Follow node_modules/@mtdt/observeops-ds-spec/AGENTS.md when building any ObserveOps UI.'
  const TRY_PROMPT = 'Using the ObserveOps design system, build a Monitors list page. Add an "Add Monitor" form that opens in a side drawer, and a delete confirmation dialog.'
  const CMD_VERIFY = 'node node_modules/@mtdt/observeops-ds-spec/conformance/ds-conformance.mjs ./your-page.html'
  const IMPORT_SNIP = "import '@mtdt/observeops-ds-elements'                   // registers obs-button, obs-tag, …\nimport '@mtdt/observeops-ds-css/dist/observeops-ds.css' // the DS tokens (light + dark)"
  const USE_SNIP = '<obs-button variant="primary">Save</obs-button>\n<obs-input type="search" placeholder="Search…"></obs-input>\n<obs-tag variant="tag-green">Active</obs-tag>'
  const EXT = '<svg class="ext" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
  const link = (href, label) => `<a href="${href}" target="_blank" rel="noopener">${label} ${EXT}</a>`
  const want = (text) => `<li><span class="ck">✓</span><span>${text}</span></li>`
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Build with AI — ObserveOps Elements</title>
${FAVICON}<link rel="stylesheet" href="${tokenCssHref}" /><link rel="stylesheet" href="./app.css?v=${assetV}" />
<style>
  .bwa { max-width: 820px; padding: 40px 48px 72px; }
  .bwa h2 { margin: 2.6rem 0 .5rem; font-size: 1.25rem; display: flex; align-items: center; gap: .6rem; }
  .bwa h2 .n { flex: none; width: 1.6rem; height: 1.6rem; border-radius: 999px; background: var(--primary);
    color: var(--primary-button-text, #fff); display: inline-grid; place-items: center; font-size: .82rem; font-weight: 700; }
  .bwa p { color: var(--neutral-regular); line-height: 1.65; max-width: 64ch; }
  .bwa-lede { font-size: 1.06rem; color: var(--page-text-color); max-width: 66ch; margin-top: .2rem; }
  .bwa-sub { color: var(--neutral-light); font-size: .88rem; margin-top: .5rem; }
  .bwa a.inline { color: var(--primary-alt); text-decoration: underline; text-underline-offset: 2px; }
  .bwa-codewrap { position: relative; margin: .7rem 0 0; }
  .bwa-code { background: var(--code-tag-background-color, var(--neutral-lightest)); border: 1px solid var(--border-color);
    border-radius: 8px; padding: .8rem 3.6rem .8rem 1rem; font-size: .82rem; margin: 0;
    color: var(--page-text-color); white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
  .bwa-copy { position: absolute; top: .45rem; right: .45rem; font-size: .68rem; font-weight: 600;
    padding: .18rem .55rem; border-radius: 6px; border: 1px solid var(--border-color);
    background: var(--page-background-color); color: var(--neutral-regular); cursor: pointer; opacity: .9; }
  .bwa-copy:hover { color: var(--primary-alt); border-color: var(--primary-alt); opacity: 1; }
  .bwa-copy.copied { color: var(--secondary-green); border-color: var(--secondary-green); }
  /* button row (Download + Copy) for downloadable code blocks */
  .bwa-btns { position: absolute; top: .45rem; right: .45rem; display: flex; gap: .4rem; align-items: center; }
  .bwa-btns .bwa-copy { position: static; top: auto; right: auto; }
  .bwa-dl { font-size: .68rem; font-weight: 600; padding: .18rem .6rem; border-radius: 6px;
    border: 1px solid var(--primary-alt); background: var(--primary-alt); color: #fff; cursor: pointer; }
  .bwa-dl:hover { filter: brightness(1.08); }
  /* per-tool setup tabs */
  .bwa-tabwrap { margin-top: 1rem; }
  .bwa-tabs { display: flex; gap: .2rem; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; }
  .bwa-tab { padding: .5rem .9rem; border: 0; background: none; cursor: pointer; font-size: .88rem; font-weight: 600;
    color: var(--neutral-regular); border-bottom: 2px solid transparent; margin-bottom: -1px; }
  .bwa-tab:hover { color: var(--page-text-color); }
  .bwa-tab.active { color: var(--primary-alt); border-bottom-color: var(--primary-alt); }
  .bwa-panel { padding-top: 1.1rem; }
  .bwa-panel.hidden { display: none; }
  .bwa-note { border-left: 3px solid var(--primary-alt); padding: .6rem 1rem; margin-top: 1rem;
    background: var(--neutral-lightest); border-radius: 0 8px 8px 0; font-size: .9rem; color: var(--neutral-regular); }
  .bwa-what { list-style: none; padding: 0; margin: 1rem 0 0; display: grid; gap: .7rem; }
  .bwa-what li { display: flex; gap: .6rem; color: var(--neutral-regular); line-height: 1.55; max-width: 66ch; }
  .bwa-what .ck { flex: none; color: var(--secondary-green); font-weight: 800; }
  details.bwa-more { margin-top: .7rem; border: 1px solid var(--border-color); border-radius: 10px; padding: 0 1rem; }
  details.bwa-more > summary { cursor: pointer; padding: .8rem 0; font-weight: 600; font-size: .9rem;
    color: var(--page-text-color); list-style: none; display: flex; align-items: center; gap: .5rem; }
  details.bwa-more > summary::-webkit-details-marker { display: none; }
  details.bwa-more > summary::before { content: "›"; color: var(--neutral-light); font-size: 1.15rem; transition: transform .15s ease; }
  details.bwa-more[open] > summary::before { transform: rotate(90deg); }
  details.bwa-more[open] { padding-bottom: 1rem; }
  .bwa-steps { list-style: none; padding: 0; margin: .3rem 0 0; }
  .bwa-step { display: flex; gap: .75rem; padding: .5rem 0; border-bottom: 1px solid var(--border-color); font-size: .9rem; color: var(--neutral-regular); }
  .bwa-step:last-child { border-bottom: 0; }
  .bwa-num { flex: none; width: 1.5rem; height: 1.5rem; border-radius: 999px; background: var(--neutral-lightest);
    border: 1px solid var(--border-color); color: var(--neutral-regular); display: grid; place-items: center; font-size: .72rem; font-weight: 700; }
  .bwa-links { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1rem; }
  .bwa-links a { display: inline-flex; align-items: center; gap: .45rem; padding: .5rem .85rem; border: 1px solid var(--border-color);
    border-radius: 9px; text-decoration: none; color: var(--page-text-color); font-size: .85rem; font-weight: 500; background: var(--page-background-color); }
  .bwa-links a:hover { border-color: var(--primary-alt); color: var(--primary-alt); }
  .bwa-links a .ext { flex: none; color: var(--neutral-light); }
  .bwa-links a:hover .ext { color: var(--primary-alt); }
</style>
</head><body>
<div class="layout no-panel">
  ${navHtml(components, 'build-with-ai', version)}
  <main class="canvas">
    <div class="bwa">
      <div class="ix-hero"><h1>Build with AI</h1>
        <p class="lead">Connect your AI coding assistant to the ObserveOps design system <b>once</b>. After that, just describe the screen you want in plain English — and it builds it with the real ObserveOps components, not a generic guess.</p></div>

      <h2><span class="n">1</span> Set it up — pick your tool</h2>
      <p>Two things make it work: (a) <b>connect</b> the design system, and (b) give your tool a <b>rules file</b> so it actually uses it on every request (connecting alone isn't enough — an AI won't reach for tools unless it's told to). Set this up <b>once</b> — you don't repeat it per screen.</p>
      <div class="bwa-tabwrap">
        <div class="bwa-tabs" role="tablist">
          <button class="bwa-tab active" type="button" data-tab="general">General</button>
          <button class="bwa-tab" type="button" data-tab="claudecode">Claude Code (terminal)</button>
          <button class="bwa-tab" type="button" data-tab="claudeapp">Claude app (no terminal)</button>
          <button class="bwa-tab" type="button" data-tab="cursor">Cursor / Windsurf / Cline</button>
        </div>

        <div class="bwa-panel" data-panel="general">
          <p>Works with any AI coding tool. <b>Install</b> the packages, then <b>add the rules</b> to your tool's rules file.</p>
          ${code('npm install @mtdt/observeops-ds-elements @mtdt/observeops-ds-css @mtdt/observeops-ds-spec')}
          <p style="margin-top:1rem">Then add the rules — download the file and drop it in your project, or copy the text into your tool's rules file:</p>
          ${codeDL(RULES_MD, 'CLAUDE.md')}
          <p class="bwa-sub">The rules file is named <code>CLAUDE.md</code> (Claude), <code>.cursorrules</code> (Cursor), or <code>AGENTS.md</code> (others). Once per project — or in your tool's <b>global</b> rules file to cover every project at once.</p>
        </div>

        <div class="bwa-panel hidden" data-panel="claudecode">
          <p><b>Do it once — it then works in every project.</b></p>
          <p><b>a.</b> Connect the tools (the <code>-s user</code> makes it global, so this is a one-time thing):</p>
          ${code(CMD_MCP)}
          <div class="bwa-note"><b>Says <code>already exists</code>?</b> Good — it's installed. Confirm with <code>claude mcp list</code> (look for <code>observeops-ds — ✓ Connected</code>).</div>
          <p style="margin-top:1rem"><b>b.</b> Add the rules. Download this file, then move it to <b><code>~/.claude/CLAUDE.md</code></b> to cover <b>every</b> project — or to your project's <code>./CLAUDE.md</code> for just one:</p>
          ${codeDL(RULES_MD, 'CLAUDE.md')}
          <p class="bwa-sub">Global (<code>~/.claude/CLAUDE.md</code>) = set up once, never again. Per-project (<code>./CLAUDE.md</code>) = only that project.</p>
        </div>

        <div class="bwa-panel hidden" data-panel="claudeapp">
          <p><b>No terminal, no files.</b> Use a <b>Claude Project</b> — set it up once and reuse it for all your ObserveOps work.</p>
          <ol style="padding-left:1.2rem;line-height:1.7">
            <li>In Claude, create a new <b>Project</b>.</li>
            <li>Open the Project's <b>custom instructions</b> and paste these rules:</li>
          </ol>
          ${code(RULES_MD)}
          <ol start="3" style="padding-left:1.2rem;line-height:1.7">
            <li>Start any chat <b>inside that project</b> and describe the screen — it follows the rules automatically. No per-chat setup.</li>
          </ol>
          <div class="bwa-note">This is per <b>Project</b>, not per code-folder — reuse the same Project every time. <b>Claude Desktop app</b> can also get the live tools: add the server to <code>claude_desktop_config.json</code> — ${'`{ "mcpServers": { "observeops-ds": { "command": "npx", "args": ["-y", "@mtdt/observeops-ds-mcp"] } } }`'}. (Claude on the web can't run this local server, so the Project rules above are the way there.)</div>
        </div>

        <div class="bwa-panel hidden" data-panel="cursor">
          <p><b>a.</b> Add the MCP server to your editor's config (e.g. <code>.cursor/mcp.json</code>):</p>
          ${code(CFG_MCP)}
          <p style="margin-top:1rem"><b>b.</b> Add the rules to your editor's rules file — download it as <code>.cursorrules</code> (Cursor) or <code>AGENTS.md</code> (Windsurf/Cline), or copy the text in:</p>
          ${codeDL(RULES_MD, '.cursorrules')}
        </div>
      </div>

      <h2><span class="n">2</span> Ask for what you want — in plain English</h2>
      <p>Now just tell your AI what to build. No special syntax — describe the screen the way you'd describe it to a teammate. For example, paste this to your assistant:</p>
      ${code(TRY_PROMPT)}
      <p>That's the whole workflow: <b>connect once, then ask.</b> Change the words to build anything — a settings page, a login screen, an alerts table, a create-user form.</p>

      <h2>What happens when you do this</h2>
      <p>Your AI reads the design system and builds the screen the way the ObserveOps team would — you don't need to know any of the internals:</p>
      <ul class="bwa-what">
        ${want('It picks the right components and layout from the design system — no guessing, no made-up UI.')}
        ${want('It uses the exact ObserveOps colours, spacing and fonts, and works in both light and dark themes.')}
        ${want('It puts each part in the right place — a full page, a slide-in side drawer, or a small pop-up dialog.')}
        ${want('It builds with the genuine components, so the result looks and behaves like the real product.')}
        ${want('If the design system is missing something (like a chart), it <b>stops and asks</b> instead of inventing something off-brand.')}
      </ul>

      <h2>Does it check its own work? Yes.</h2>
      <p>You don't have to verify anything by hand. As its last step, your AI runs a built-in checker that scores the finished screen from <b>0–100</b> against the design system and fixes anything that's off — automatically.</p>
      <p>If you ever want to grade a page yourself, you <i>can</i> run the same checker — but it's optional:</p>
      ${code(CMD_VERIFY)}
      <p class="bwa-sub">It reports any wrong colour, off-spec spacing, or non-ObserveOps element — with the fix. Aim for <b>90 or above</b>.</p>

      <details class="bwa-more"><summary>Curious what your AI does behind the scenes?</summary>
        <p>It follows an 8-step loop automatically — you never run these yourself:</p>
        <ol class="bwa-steps">
          ${li('1', 'Understands your request and lists the screens involved.')}
          ${li('2', 'Chooses the page layout and where everything goes.')}
          ${li('3', 'Decides page vs. side drawer vs. pop-up for each part.')}
          ${li('4', 'Picks the right component and style — and notes why.')}
          ${li('5', 'Builds with the real ObserveOps components and colours.')}
          ${li('6', 'Stops and asks if the design system is missing a piece.')}
          ${li('7', 'Checks its own result and fixes anything off.')}
          ${li('8', 'Hands you the finished screen with a short summary.')}
        </ol>
        <p class="bwa-sub">The full method ships as <code>authoring-playbook.md</code> in the spec package.</p>
      </details>

      <details class="bwa-more"><summary>Prefer to write the components yourself (no AI)?</summary>
        <p>The components are also a normal package you can use directly in React, Vue, or plain HTML. Install and register them once:</p>
        ${code('npm install @mtdt/observeops-ds-elements @mtdt/observeops-ds-css')}
        ${code(IMPORT_SNIP)}
        ${code(USE_SNIP)}
        <div class="bwa-note">Events deliver the value in <code>event.detail</code> as an <b>array</b> — unwrap it:
          <code>const v = Array.isArray(e.detail) ? e.detail[0] : e.detail</code></div>
      </details>

      <h2>Read more</h2>
      <div class="bwa-links">
        ${link('https://www.npmjs.com/package/@mtdt/observeops-ds-mcp', 'MCP server')}
        ${link('https://www.npmjs.com/package/@mtdt/observeops-ds-spec', 'Spec package')}
        ${link('https://www.npmjs.com/package/@mtdt/observeops-ds-elements', 'Components package')}
        ${link('https://cdn.jsdelivr.net/npm/@mtdt/observeops-ds-spec/AGENTS.md', 'The rules (AGENTS.md)')}
        ${link('https://cdn.jsdelivr.net/npm/@mtdt/observeops-ds-spec/authoring-playbook.md', 'Authoring playbook')}
      </div>
    </div>
  </main>
</div>
${helpHtml(false)}
<script src="./app.js?v=${assetV}"></script>
<script>
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return
    var codeOf = function (btn) { var w = btn.closest('.bwa-codewrap'); return w && w.querySelector('code') }
    var cp = e.target.closest('.bwa-copy')
    if (cp) {
      var c = codeOf(cp); if (!c || !navigator.clipboard) return
      navigator.clipboard.writeText(c.textContent).then(function () {
        var prev = cp.textContent; cp.textContent = 'Copied'; cp.classList.add('copied')
        setTimeout(function () { cp.textContent = prev; cp.classList.remove('copied') }, 1400)
      })
      return
    }
    var dl = e.target.closest('.bwa-dl')
    if (dl) {
      var cc = codeOf(dl); if (!cc) return
      var blob = new Blob([cc.textContent], { type: 'text/markdown' })
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = dl.dataset.file || 'CLAUDE.md'
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href) }, 1000)
      var prev2 = dl.textContent; dl.textContent = '✓ Downloaded'
      setTimeout(function () { dl.textContent = prev2 }, 1600)
      return
    }
    var tab = e.target.closest('.bwa-tab')
    if (tab) {
      var wrap = tab.closest('.bwa-tabwrap'); if (!wrap) return
      var name = tab.getAttribute('data-tab')
      wrap.querySelectorAll('.bwa-tab').forEach(function (x) { x.classList.toggle('active', x === tab) })
      wrap.querySelectorAll('.bwa-panel').forEach(function (pn) { pn.classList.toggle('hidden', pn.getAttribute('data-panel') !== name) })
    }
  })
</script>
</body></html>`
}

export function indexHtml(components, version, tokenCssHref, assetV) {
  const cards = components
    .map((c) => `<a class="ix-card" href="./${c.id}.html"><h3>${esc(c.display)}</h3><p class="muted">${esc(c.summary || '')}</p></a>`)
    .join('')
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ObserveOps Elements</title>
${FAVICON}<link rel="stylesheet" href="${tokenCssHref}" /><link rel="stylesheet" href="./app.css?v=${assetV}" />
</head><body>
<div class="layout no-panel">
  ${navHtml(components, null, version)}
  <main class="canvas index">
    <div class="ix-hero"><h1>ObserveOps Elements</h1><p class="lead">Installable, framework-agnostic Web Components — the genuine ObserveOps components, usable in any framework or plain HTML.</p></div>
    <div class="ix-grid">${cards}</div>
  </main>
</div>
${helpHtml(false)}
<script src="./app.js?v=${assetV}"></script>
</body></html>`
}

/**
 * Charts page — renders the captured fixtures through the real charting engine.
 *
 * The fixtures ARE complete engine configurations, so they are fed in directly: no adapter,
 * no re-derivation. That is the point of the page — it demonstrates that the captured
 * configuration reproduces the product's rendering, and it is the reference the verification
 * harness will diff against.
 *
 * Two honest caveats are surfaced on the page itself rather than hidden:
 *   - Serialised functions (formatters) are dropped, so those fall back to engine defaults.
 *   - Several families are NOT engine-rendered and need hand-built components.
 */
// ── Charts ────────────────────────────────────────────────────────────────────
// The chart gallery is split into per-category pages that mirror the component-page pattern
// (Playground/Examples tabs, Inspect, zoom, right-panel controls, copy-snippet). CHART_CATEGORIES
// is the single source of truth shared by generate.mjs (nav + page emission) and these templates.
// FIXTURE COVERAGE IS FAIL-CLOSED: generate.mjs warns if a fixture file matches no category —
// a new capture must be filed into a category, never silently dropped.
export const CHART_CATEGORIES = [
  {
    id: 'time-series', display: 'Time Series',
    blurb: 'Trend charts over time — line, area, vertical and horizontal bars, plus each stacked variant; single-counter and multi-counter forms.',
    kind: 'timeseries',
    sections: [
      { title: 'Single counter', fixtures: [
        ['chart-single-line', 'Line'], ['chart-single-area', 'Area'],
        ['chart-single-vertical-bar', 'Vertical bar'], ['chart-single-horizontal-bar', 'Horizontal bar'],
        ['chart-single-stacked-line', 'Stacked line'], ['chart-single-stacked-area', 'Stacked area'],
        ['chart-single-stacked-vertical-bar', 'Stacked vertical bar'], ['chart-single-stacked-horizontal-bar', 'Stacked horizontal bar'],
        ['chart-single-memory', 'Area · tooltip demo'],
      ] },
      { title: 'Multiple counters', fixtures: [
        ['chart-multi-line', 'Line'], ['chart-multi-area', 'Area'],
        ['chart-multi-vertical-bar', 'Vertical bar'], ['chart-multi-horizontal-bar', 'Horizontal bar'],
        ['chart-multi-stacked-line', 'Stacked line'], ['chart-multi-stacked-area', 'Stacked area'],
        ['chart-multi-stacked-vertical-bar', 'Stacked vertical bar'], ['chart-multi-stacked-horizontal-bar', 'Stacked horizontal bar'],
        ['chart-multi-cpu', 'Area · 10 monitors (shared tooltip)'],
      ] },
      // Top N is not a separate family — the product renders it as an ordinary multi-series chart
      // (top entities × one series each), so it lives here as a time-series variant.
      { title: 'Top N', fixtures: [['topn', 'Top N monitors']] },
    ],
  },
  {
    id: 'topn-views', display: 'Top N Views',
    blurb: 'The Top N widget’s non-chart Style views — one solid-gauge dial per monitor in a wrapping grid, the packed bubble cluster, and the treemap (Tree View). One payload drives all three, like the product’s Style picker.',
    kind: 'topn',
    sections: [{
      title: 'Per-monitor',
      fixtures: [
        ['topn-views', 'Solid Gauge Grid', 'solidgauge'],
        ['topn-views', 'Packed Bubble', 'packedbubble'],
        ['topn-views', 'Tree View', 'treemap'],
      ],
    }],
  },
  {
    id: 'anomaly', display: 'Anomaly',
    blurb: 'AI/ML time series — the avg actuals with an anomaly confidence band, outliers leaving the band coloured by zone.',
    kind: 'aiml',
    sections: [{ title: 'AI/ML', fixtures: [['chart-single-anomaly', 'Anomaly']] }],
  },
  {
    id: 'forecast', display: 'Forecast',
    blurb: 'AI/ML time series — the projection continuing past the last actual interval as one spline with a widening confidence range.',
    kind: 'aiml',
    sections: [{ title: 'AI/ML', fixtures: [['chart-single-forecast', 'Forecast']] }],
  },
  {
    id: 'distribution', display: 'Pie chart',
    blurb: 'Share-of-whole views — pie and donut (the pie geometry with the product’s 70% inner size), with rotation, legend and data-label configuration.',
    kind: 'distribution',
    // One fixture per type. The earlier "Multiple counters" pie/donut fixtures were bad captures
    // (time-series pairs fed to a pie — thousands of slices) and duplicated the picker entries;
    // they were removed rather than kept as broken duplicates.
    sections: [
      { title: 'Share of whole', fixtures: [['chart-single-pie', 'Pie chart'], ['chart-single-donut', 'Donut chart']] },
    ],
  },
  {
    id: 'gauge', display: 'Gauge',
    blurb: 'Single-value instruments — the solid-gauge dial and the numeric metro tile, ported from the product’s own SVG gauge.',
    kind: 'gauge',
    sections: [{ title: 'Instruments', fixtures: [['gauge-dial', 'Solid gauge dial'], ['gauge-number', 'Metro tile (number)']] }],
  },
  {
    id: 'heat-map', display: 'Heat Map',
    blurb: 'Severity honeycomb of hexagonal cells (custom DOM, not engine-rendered): severity colours, a metric heat map coloured by the selected palette, and the with-host variant with monitor-type icons and host names.',
    kind: 'heatmap',
    sections: [{
      title: 'Matrix',
      fixtures: [
        ['heatmap', 'Severity heat map'],
        ['heatmap-palette', 'Color palette heat map'],
        ['heatmap-host', 'Heat map with host'],
      ],
    }],
  },
  {
    id: 'map', display: 'Map',
    blurb: 'Geographic widget — country-intensity bubbles or labelled location points on the Highcharts world map, and the Online Map (Leaflet) variant; the same payload drives all renderers, like the product.',
    kind: 'map',
    sections: [{ title: 'Geography', fixtures: [['map', 'Map bubble'], ['map-points', 'Map points'], ['map', 'Online Map (Leaflet)', 'online']] }],
  },
  {
    id: 'sankey', display: 'Sankey',
    blurb: 'Flow diagram between source and destination — the captured Flow result rendered through the engine’s sankey type, like the product’s sankey view.',
    kind: 'sankey',
    sections: [{ title: 'Flow', fixtures: [['sankey', 'Sankey']] }],
  },
]

// families with hand-built (non-engine) renderers in the page JS — their playground and example
// cards render from the captured result payload instead of a Highcharts config.
const CUSTOM_RENDERER_KINDS = new Set(['gauge', 'heatmap', 'map', 'sankey', 'aiml', 'topn'])

// the product's heatmap colour palettes (widgets/constants.js COLOR_PALETTES) — names for the
// palette dropdown; the colour arrays live in the page JS (HM_PALETTES).
const HM_PALETTES_SELECT = {
  'sky.blue.slate': 'Sky Blue Slate',
  'soft.lavender': 'Soft Lavender',
  'coral.sunset': 'Coral Sunset',
  'erica.pink': 'Erica Pink',
  'warm.caramel': 'Warm Caramel',
}

// shared CSS for chart cards (category pages + overview)
const CHART_CSS = `
.ch-sec { padding: 18px 28px 6px; font-size: 11px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; color: var(--neutral-light); }
.ch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); gap: 16px; padding: 6px 28px 32px; }
.ch-card { margin: 0; border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: var(--page-background-color); }
.ch-cap { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
  padding: 10px 14px; border-bottom: 1px solid var(--border-color); }
.ch-name { font-size: 13px; font-weight: 600; }
.ch-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.ch-badge { font-size: 10.5px; padding: 2px 7px; border-radius: 999px; border: 1px solid var(--border-color); color: var(--neutral-light); white-space: nowrap; }
.ch-type { border-color: var(--primary-alt); color: var(--primary-alt); }
.ch-plot { height: 300px; overflow: hidden; } /* never let a card's content spill into its neighbours */
.ch-na { padding: 26px 14px; font-size: 12.5px; color: var(--neutral-light); text-align: center; }
.ch-card-na { background: transparent; border-style: dashed; }
.ch-missing { margin: 14px 28px; padding: 14px 16px; border: 1px solid var(--severity-major, #f78c1e); border-radius: 8px; font-size: 13px; max-width: 92ch; }
.ch-note { margin: 10px 28px 0; padding: 10px 14px; border: 1px solid var(--border-color); border-left: 3px solid var(--primary-alt);
  border-radius: 8px; font-size: 12.5px; max-width: 92ch; background: var(--dropdown-background); }
.ch-note b { font-weight: 600; }
.play-plot { height: 100%; min-height: 320px; }
/* the chart stage fills the available width — engine charts set their own px width, but the
   hand-built renderers (leaflet map, gauge, heatmap) are width:auto and would collapse the
   content-sized .stage-inner flex item to 0 */
#live-wrap { width: 100%; }
/* metric grid (ChartWithGrid parity) — chart above, one row per series, aggregator columns */
.play-grid { border-top: 1px solid var(--border-color); max-height: 180px; overflow: auto; }
.play-grid table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.play-grid th, .play-grid td { padding: 4px 12px; text-align: right; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.play-grid thead th { color: var(--neutral-light); font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; }
.play-grid tbody th { text-align: left; font-weight: 400; }
.ctl-check { display: inline-flex; align-items: center; gap: 4px; margin-right: 10px; font-size: 12px; }
.ctl-check input { accent-color: var(--primary-alt); }
/* gauge family — the product's token values (variable.less): track #dee5ed light / #172336 dark.
   The site theme mechanism is data-theme="dark-theme" on the root element (app.js + token CSS). */
:root { --gauge-base-color: #dee5ed; }
:root[data-theme="dark-theme"] { --gauge-base-color: #172336; }
.gauge-dial { position: relative; height: 100%; display: flex; align-items: center; justify-content: center; }
/* value text anchored the way gauge.vue's foreignObject slot is: bottom-aligned at the dial's
   centre line ((height − Y_CENTER)/height = 34.2/134.2 ≈ 25.5% up from the bottom), number and
   unit at the SAME size (solid-gauge.vue renders both spans at textFontSizeValue) */
.gauge-num { position: absolute; left: 0; right: 0; bottom: 25.5%; font-weight: 500;
  display: flex; align-items: baseline; justify-content: center; line-height: 1; }
.gauge-tile { position: relative; height: 100%; display: flex; align-items: center; gap: 12px; padding: 0 24px; font-weight: 500; }
.gauge-tile-num { line-height: 1; }
.gauge-trend { position: absolute; inset: 0; width: 100%; height: 100%; }
/* Top N solid-gauge grid (topn-solid-gauge.vue): wrapping dial cells, monitor name below each —
   dotted underline + ellipsis like the product's MonitorName link */
.topn-grid { height: 100%; display: grid; grid-auto-rows: minmax(auto, max-content); gap: 10px;
  align-content: center; justify-content: center; padding: 12px; overflow: auto; }
.topn-cell { display: flex; flex-direction: column; align-items: center; min-width: 150px; max-width: 210px; }
.topn-cell .gauge-dial { height: auto; width: 100%; }
.topn-cell .gauge-dial svg { width: 100%; height: auto; display: block; }
.topn-cell .gauge-num { font-size: 1.65rem; }
.topn-name { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px;
  color: var(--page-text-color); text-decoration: underline dotted; cursor: default; padding-top: 2px; }
/* heatmap family — hex geometry + severity colours ported from heatmap-single-group.vue /
   general.less (clip-path hexagon, height = s × 1.1547, honeycomb pull-up = s × 0.2885) */
.hm-wrap { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: auto; padding: 12px; }
.hm-counts { display: flex; justify-content: center; align-items: flex-end; padding: 4px 8px; font-size: 13px; }
.hm-counts-n { font-size: 30px; font-weight: 600; line-height: 1; }
.hm-counts-t { margin-left: 4px; color: var(--neutral-light); }
.hm-container { display: flex; flex-wrap: wrap; align-content: flex-start; justify-content: center; }
.hm-box { position: relative; display: inline-block; clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%); background: var(--border-color); }
.hm-cell { position: absolute; inset: 1px; clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%); }
/* the product's hover: the whole hex scales up (general.less .heatmap-box-border:hover) */
.hm-box:hover { z-index: 3; transform: scale(1.5); }
.hm-more { align-self: center; margin: 8px; padding: 2px 10px; border-radius: 999px; border: 1px solid var(--primary-alt); color: var(--primary-alt); font-size: 12px; }
/* with-host cells (heatmap-box-with-host.vue): hex + monitor-type icon + host name below, in a
   plain flex-wrap (no honeycomb pull-up in with-host mode), name column ~ cell width + 30px */
.hm-hcell { display: inline-flex; flex-direction: column; align-items: center; margin: 4px 8px; min-width: 0; max-width: 210px; }
.hm-hhex { position: relative; clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%); background: var(--border-color); }
.hm-hicon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--page-text-color); pointer-events: none; }
.hm-hname { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center;
  font-size: 12px; padding-top: 3px; color: var(--page-text-color); }
/* hover tooltip (heatmap-tooltip.vue): left = primary/secondary/counter labels, right = severity
   chip (capitalised) and/or the palette block with the percentage at 20px/700 */
.hm-tt { position: fixed; z-index: 6; display: flex; align-items: stretch; max-width: 35vw;
  background: var(--dropdown-background, #2b394f); border: 1px solid var(--border-color);
  border-radius: 8px; box-shadow: 0 6px 18px rgba(0, 0, 0, .35); pointer-events: none; }
.hm-tt::after { content: ''; position: absolute; left: 50%; width: 10px; height: 10px; background: var(--dropdown-background, #2b394f);
  transform: translateX(-50%) rotate(45deg); bottom: -6px; border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
.hm-tt.below::after { bottom: auto; top: -6px; border: 0; border-left: 1px solid var(--border-color); border-top: 1px solid var(--border-color); }
.hm-tt-left { display: flex; flex-direction: column; min-width: 0; flex: 1; padding: 8px 12px; gap: 2px; }
.hm-tt-primary { font-weight: 500; font-size: 15px; color: var(--page-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hm-tt-secondary { font-size: 12px; color: var(--neutral-regular, #516381); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hm-tt-kv { font-size: 12px; color: var(--page-text-color); }
.hm-tt-sev { display: flex; align-items: center; padding: 8px 16px; font-weight: 500; color: var(--page-text-color); }
.hm-tt-pct { display: flex; align-items: center; padding: 8px 16px; font-size: 20px; font-weight: 700; color: var(--page-text-color); }
/* severity fills = the design system's own --severity-* tokens (what the product's severity.less
   generates), with the product's dark-theme values as fallbacks */
.severity.down { background: var(--severity-down, #ad1111); }
.severity.critical { background: var(--severity-critical, #ec5b5b); }
.severity.major { background: var(--severity-major, #fa9950); }
.severity.warning { background: var(--severity-warning, #fad100); }
.severity.clear, .severity.up { background: var(--severity-clear, #36d576); }
.severity.unknown { background: var(--severity-unknown, #b1b1b1); }
.severity.none { background: var(--severity-none, #8ac1d3); }
/* map family — product tokens (variable.less): bubble fill 50% teal, online 68%, null country fill */
:root { --map-bubble-color: rgba(13, 148, 136, 0.5); --online-map-bubble-color: rgba(13, 148, 136, 0.68); --chart-null-color: #e8edf3; --chart-vivid-teal-faded: rgba(13, 148, 136, 0.35); --secondary-red-light: #ff8a8a; }
:root[data-theme="dark-theme"] { --map-bubble-color: rgba(20, 184, 166, 0.5); --online-map-bubble-color: rgba(20, 184, 166, 0.68); --chart-null-color: #2b394f; --chart-vivid-teal-faded: rgba(20, 184, 166, 0.35); --secondary-red-light: #ff6b6b; }
/* AI/ML tooltip: the Prediction Range row is dimmed (no swatch, muted value) */
.ptt-dim { color: var(--neutral-light); font-weight: 400; }
.ptt-row.ptt-range .ptt-val { font-weight: 400; color: var(--neutral-light); }
.lf-map { width: 100%; height: 100%; background: var(--page-background-color); }
.lf-zoom { position: absolute; right: 12px; bottom: 18px; display: flex; flex-direction: column; gap: 4px; z-index: 500; }
.lf-zoom button { width: 26px; height: 26px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; font-size: 15px; line-height: 1; }
.lf-zoom button:hover { border-color: var(--primary-alt); }
.lf-tip { background: var(--chart-tooltip-background, var(--dropdown-background, rgba(43, 57, 79, 0.9))) !important; border: 1px solid var(--border-color) !important; border-radius: 6px; color: var(--page-text-color) !important; font-size: 11px; box-shadow: none !important; }
.leaflet-container { font-family: inherit; }
/* product-parity tooltip (port of TooltipBuilder + .hc-tooltip-bg + .widget-tooltip-surface) */
.hc-tooltip { backdrop-filter: blur(15px) !important; font-family: var(--chart-font-family, inherit);
  box-shadow: 0 10px 15px -3px rgba(2, 6, 23, 0.3), 0 4px 6px -4px rgba(2, 6, 23, 0.3) !important; }
/* the engine paints its default #666 tooltip text via inline style, unreadable on the dark-theme
   tooltip surface — force the token text colour on the container and every product row */
.hc-tooltip { color: var(--page-text-color) !important; }
.hc-tooltip .ptt-head, .hc-tooltip .ptt-name, .hc-tooltip .ptt-val { color: var(--page-text-color); }
.hc-tooltip .ptt-dim, .hc-tooltip .ptt-dim .ptt-name, .hc-tooltip .ptt-dim .ptt-val { color: var(--neutral-light); }
.highcharts-tooltip-container { z-index: 30; }
.ptt-head { font-size: 11px; font-weight: 700; margin-bottom: 4px; white-space: nowrap; }
.ptt-body { display: flex; flex-direction: column; max-width: 50vw; font-size: 11px; }
.ptt-row { display: flex; align-items: center; gap: 6px; width: 100%; }
.ptt-swatch { flex: none; display: inline-flex; }
.ptt-name { min-width: 0; margin-right: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ptt-val { flex-shrink: 0; margin-left: 12px; font-weight: 700; white-space: nowrap; }
@media (max-width: 900px) { .ch-grid { grid-template-columns: 1fr; } }
`

const badge = (t, kind) => `<span class="ch-badge ch-${kind}">${esc(t)}</span>`

// engine-rendered card (lazy via IntersectionObserver) — kind-aware badge. Hand-built kinds
// (gauge…) render from their captured result payload, so they get live cards too.
// `view` renders one fixture through a chosen view (a Leaflet map example, one Top N view per
// card) — the plot id must stay unique per card, so it carries the view suffix.
function chartCard(fxId, label, fx, kind, view) {
  const engineOk = (fx && fx.engine === 'highcharts' && fx.hasConfig) || CUSTOM_RENDERER_KINDS.has(kind)
  if (!engineOk) return `
    <figure class="ch-card ch-card-na">
      <figcaption class="ch-cap">
        <span class="ch-name">${esc(label)}</span>
        <span class="ch-badges">${fx?.widgetType ? badge(fx.widgetType, 'type') : ''}${badge(fx?.engine || 'custom', 'eng')}</span>
      </figcaption>
      <div class="ch-na">Not engine-rendered — needs a hand-built component.<br/><span class="muted">Fixture holds the result payload for building and diffing it.</span></div>
    </figure>`
  const cardId = view ? `${fxId}-${view}` : fxId
  return `
    <figure class="ch-card" data-fx="${esc(fxId)}"${view ? ` data-fxview="${esc(view)}"` : ''}>
      <figcaption class="ch-cap">
        <span class="ch-name">${esc(label)}</span>
        <span class="ch-badges">${fx.widgetType ? badge(fx.widgetType, 'type') : ''}${fx.series ? badge(fx.series + ' series', 'ser') : ''}</span>
      </figcaption>
      <div class="ch-plot" id="plot-${esc(cardId)}"></div>
    </figure>`
}

// shared client script: revive fixtures, lazy-draw example cards, run the playground + controls + snippet
function chartPageJs(playground) {
  return `
  (function () {
    var PG = ${JSON.stringify(playground)};
    if (typeof Highcharts === 'undefined' && PG.kind !== 'gauge' && PG.kind !== 'heatmap') {
      var st = document.getElementById('play-plot');
      if (st) st.innerHTML = '<div class="ch-na">Charting engine not found locally — it is a peer dependency and is never committed. Install it in components-lib to render charts.</div>';
      return;
    }
    var FN = '\\u00abfn\\u00bb', CIRC = '\\u00abcircular\\u00bb';
    // Drop unserialisable placeholders so the engine falls back to its own defaults
    // rather than choking on a string where it expects a function.
    function revive(node) {
      if (Array.isArray(node)) return node.map(revive).filter(function (v) { return v !== undefined; });
      if (node && typeof node === 'object') {
        var out = {};
        Object.keys(node).forEach(function (k) {
          var v = revive(node[k]);
          if (v !== undefined) out[k] = v;
        });
        return out;
      }
      if (node === FN || node === CIRC) return undefined;
      return node;
    }
    function baseCfg(fx) {
      var cfg = revive(fx.config) || {};
      // captured configs carry xAxis/yAxis as plain objects; the page code (and the engine)
      // uniformly treats them as arrays — normalise once, here.
      if (cfg.xAxis && !Array.isArray(cfg.xAxis)) cfg.xAxis = [cfg.xAxis];
      if (cfg.yAxis && !Array.isArray(cfg.yAxis)) cfg.yAxis = [cfg.yAxis];
      cfg.credits = { enabled: false };
      cfg.exporting = { enabled: false };
      // the docs site is a visual reference; the a11y module is not vendored — opt out
      // explicitly so the engine does not warn about it on every render.
      cfg.accessibility = { enabled: false };
      cfg.chart = cfg.chart || {};
      delete cfg.chart.events;
      cfg.plotOptions = cfg.plotOptions || {};
      applyProductTooltip(cfg);
      return cfg;
    }
    // ── product-parity tooltip ────────────────────────────────────────────────
    // Port of the product's TooltipBuilder (chart/options/tooltip-builder.js): a bold
    // datetime header, then one flex row per point — 8x8 colour swatch, series name
    // pushed left, bold formatted value right. Values prefer the series' own
    // formattedValues (the exact display strings the product computes, kept by the
    // sanitizer), falling back to value + unit. Chrome matches chart-common-options:
    // 1px border, radius 10, no animation, blurred translucent surface.
    var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function p2(n) { return (n < 10 ? '0' : '') + n }
    // the product's default date preference: 'ddd, MMM DD, YYYY hh:mm:ss A', rendered in UTC
    function fmtDate(ts) {
      var d = new Date(ts);
      var h = d.getUTCHours();
      var h12 = h % 12 || 12;
      return DAYS[d.getUTCDay()] + ', ' + MONS[d.getUTCMonth()] + ' ' + p2(d.getUTCDate()) + ', ' + d.getUTCFullYear() +
        ' ' + p2(h12) + ':' + p2(d.getUTCMinutes()) + ':' + p2(d.getUTCSeconds()) + ' ' + (h < 12 ? 'AM' : 'PM');
    }
    function ttEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
    // NOTE: in a shared tooltip the engine hands the formatter WRAPPED points — the real Point
    // lives under .point (this is why the product TooltipBuilder maps "point.point || point").
    // Reading .index off the wrapper is undefined, which silently breaks formattedValues lookup.
    function pointValue(pRaw) {
      var p = pRaw.point || pRaw;
      var uo = p.series.userOptions || {};
      var fv = uo.formattedValues;
      if (fv && fv.length > p.index && fv[p.index] != null) return fv[p.index];
      if (p.y == null) return null;
      var u = uo.unit;
      var n = typeof p.y === 'number' ? Math.round(p.y * 100) / 100 : p.y;
      // unit symbols follow the product's unit-applier: percent renders as a bare "%" —
      // decimals kept to 2 places ("51.50%"), integers bare ("51%") — never the word "percent".
      if (u && /^percent/i.test(u)) {
        if (typeof p.y !== 'number') return String(p.y) + '%';
        return /\\./.test(String(p.y)) ? parseFloat(p.y).toFixed(2) + '%' : parseInt(p.y, 10) + '%';
      }
      return n + (u ? ' ' + u : '');
    }
    // The product tooltip row label is the series name in the shape "countername (monitorname)".
    // Older fixtures carry the collapsed "host · agg" form — rebuild those into the product shape
    // so every tooltip reads identically. (Series index keeps the counter stable per series.)
    function ttLabel(p) {
      var uo = p.series.userOptions || {};
      if (p.series.type === 'pie') return String(p.name || '');   // pie/donut: the slice name
      if (uo.flipCounterAndSeriesName && p.name) return p.name;   // donut result shape: slice name
      var nm = String(p.series.name || '');
      if (nm.indexOf('(') >= 0) return nm;                        // already "counter (monitor)"
      if (/\\./.test(nm)) return nm;                              // bare dotted counter (single-counter series)
      var parts = nm.split('\\u00b7');                            // legacy "host" / "host · agg" → rebuild
      var host = (parts[0] || '').trim() || ('host-' + (p.series.index + 1));
      var agg = (parts[1] || 'avg').trim();
      return 'metric.series.v' + (p.series.index + 1) + '.' + agg + ' (' + host + ')';
    }
    function productTooltip() {
      var pts = this.points ? this.points : (this.point ? [this.point] : []);
      var head = '';
      var axisHolder = (this.points ? this.points[0] : this);
      axisHolder = axisHolder && (axisHolder.point || axisHolder);
      var ax = axisHolder && axisHolder.series && axisHolder.series.xAxis;
      if (ax && String(ax.options && ax.options.type).indexOf('datetime') === 0 && this.x != null) {
        head = '<div class="ptt-head">' + fmtDate(this.x) + '</div>';
      }
      var rows = [];
      for (var i = 0; i < pts.length; i++) {
        var raw = pts[i];
        var p = raw.point || raw;
        var v = pointValue(raw);
        if (v == null) continue; // the product drops null points from the tooltip body
        var nm = ttLabel(p);
        var color = p.color || raw.color;
        rows.push('<div class="ptt-row"><span class="ptt-swatch"><svg width="8" height="8" aria-hidden="true"><rect width="8" height="8" fill="' + color + '"/></svg></span><span class="ptt-name">' + ttEsc(nm) + '</span><span class="ptt-val">' + ttEsc(v) + '</span></div>');
      }
      if (!rows.length) return false;
      return head + '<div class="ptt-body">' + rows.join('') + '</div>';
    }
    function applyProductTooltip(cfg) {
      cfg.tooltip = {
        useHTML: true,
        shared: true,
        animation: false,
        borderWidth: 1,
        borderColor: 'var(--border-color)',
        borderRadius: 10,
        backgroundColor: 'var(--chart-tooltip-background, var(--dropdown-background, rgba(43, 57, 79, 0.9)))',
        className: 'hc-tooltip',
        shadow: false,
        // the product sets the tooltip text colour explicitly (chart-common-options) — without it
        // the engine's default #666 style paints dark-on-dark in the dark theme
        style: { color: 'var(--page-text-color)' },
        formatter: productTooltip,
      };
    }
    // Deterministic multi-series generator for the time-series playground: same x grid and value
    // range as the captured base series (so generated series look native next to it), seeded PRNG
    // (no Math.random — the page must render identically on every load). Generated series carry the
    // PRODUCT shape — "countername (monitorname)" + the base unit — so their tooltip rows are
    // indistinguishable from captured ones.
    var GEN_HOSTS = ['web-02', 'web-03', 'db-02', 'db-03', 'cache-02', 'queue-02', 'edge-03', 'edge-04',
      'worker-03', 'worker-04', 'worker-05', 'worker-06', 'worker-07', 'worker-08', 'worker-09', 'worker-10'];
    function counterOf(nm) {
      nm = String(nm || '');
      if (nm.indexOf('(') >= 0) return nm.replace(/\\s*\\([^)]*\\)\\s*$/, '');
      var parts = nm.split('\\u00b7');
      var agg = (parts[1] || 'avg').trim();
      return 'metric.series.v1.' + agg;
    }
    function generateTimeSeries(count, base) {
      function prng(seed) {
        var t = seed + 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }
      var pts = (base && base.data) || [];
      var xs = pts.map(function (p) { return Array.isArray(p) ? p[0] : p.x });
      if (!xs.length) {
        var now = Date.now(), step = 60000;
        for (var k = 0; k < 120; k++) xs.push(now - (120 - k) * step);
      }
      var ys = pts.map(function (p) { return Array.isArray(p) ? p[1] : p.y }).filter(function (v) { return typeof v === 'number' });
      var mean = ys.length ? ys.reduce(function (a, b) { return a + b }, 0) / ys.length : 50;
      var amp = Math.max(5, mean * 0.45);
      var noiseAmp = mean * 0.06;
      var counter = counterOf(base && base.name);
      var unit = base && base.unit;
      var out = [];
      for (var i = 0; i < count; i++) {
        var seed = 1337 + i * 7919;
        var phase = prng(seed) * Math.PI * 2;
        var freq = 2 + Math.floor(prng(seed + 1) * 4);
        var lift = 0.55 + prng(seed + 2) * 0.9;
        var data = xs.map(function (x, j) {
          var t = j / Math.max(1, xs.length - 1);
          var wave = Math.sin(t * Math.PI * 2 * freq + phase);
          var noise = (prng(seed + 3 + j) - 0.5) * 2 * noiseAmp;
          var v = Math.max(0, mean * lift + wave * amp * 0.5 + noise);
          return [x, Math.round(v * 100) / 100];
        });
        out.push({ name: counter + ' (' + GEN_HOSTS[i % GEN_HOSTS.length] + ')', data: data, unit: unit });
      }
      return out;
    }
    window.generateTimeSeries = generateTimeSeries;
    // ── gauge family (hand-built SVG — a port of the product's gauge.vue dial and the
    // metro-tile.vue number tile; these are NOT engine-rendered in the product either) ──
    var G = { R: 100, XC: 100, YC: 100, START: -110, END: 110, INNER: 78, LDIST: 2.5, LW: 3.5 };
    function polar(r, angle) {
      var a = (angle - 90) * Math.PI / 180;
      return { x: G.XC + r * Math.cos(a), y: G.YC + r * Math.sin(a) };
    }
    // pie-slice path from startAngle to endAngle (describePath, gauge.vue)
    function arcPath(r, startAngle, endAngle) {
      var s = polar(r, endAngle), e = polar(r, startAngle);
      var large = endAngle - startAngle <= 180 ? 0 : 1;
      return 'M ' + s.x.toFixed(2) + ' ' + s.y.toFixed(2) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 0 ' + e.x.toFixed(2) + ' ' + e.y.toFixed(2) + ' L ' + G.XC + ' ' + G.YC;
    }
    function gaugeHeight() {
      var ys = [G.YC, polar(G.R, G.START).y, polar(G.R, G.END).y];
      return Math.max.apply(null, ys); // 134.2 for the default -110..110 sweep
    }
    function angleOf(v) { return (v * (G.END - G.START)) / 100 + G.START }
    function gaugeDialSvg(value, color, uid) {
      var h = gaugeHeight();
      var lineR = G.R - (100 - G.INNER) - G.LDIST;                 // 75.5 hairline ring radius
      var maskInnerR = lineR - (G.LW + G.LDIST);                    // 69.5
      return '<svg viewBox="0 0 200 ' + h.toFixed(1) + '" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="gauge ' + value + '">' +
        '<defs>' +
        '<mask id="gring-' + uid + '"><circle r="' + (G.R - 0.5) + '" cx="' + G.XC + '" cy="' + G.YC + '" fill="white"/><circle r="' + G.INNER + '" cx="' + G.XC + '" cy="' + G.YC + '" fill="black"/></mask>' +
        '<mask id="gline-' + uid + '"><circle r="' + lineR + '" cx="' + G.XC + '" cy="' + G.YC + '" fill="white"/><circle r="' + maskInnerR + '" cx="' + G.XC + '" cy="' + G.YC + '" fill="black"/></mask>' +
        '</defs>' +
        // full arc in the value colour, then the UNFILLED remainder painted over in the base colour
        '<g mask="url(#gring-' + uid + ')"><path d="' + arcPath(G.R, G.START, G.END) + '" fill="' + color + '"/><path d="' + arcPath(G.R, angleOf(value), G.END) + '" fill="var(--gauge-base-color)"/></g>' +
        // inner hairline ring in the empty area (gaugeEmptyLinePath)
        '<g mask="url(#gline-' + uid + ')"><path d="' + arcPath(lineR, G.START, G.END) + '" fill="var(--gauge-base-color)"/></g>' +
        '</svg>';
    }
    // result payload → { value, num, unit }: numeric column is the value, the string column is
    // the preformatted display ("42.17%") — unit split like extractUnitAndValue
    function gaugeValues(fx) {
      var r = (fx && fx.result) || {}; var cols = r.columns || []; var data = r.data || {};
      var numKey = null, fmtKey = null;
      cols.forEach(function (c) {
        if (numKey === null && typeof data[c] === 'number') numKey = c;
        else if (fmtKey === null && typeof data[c] === 'string') fmtKey = c;
      });
      // the formatted string can ride under a result key the captured columns list omits —
      // fall back to the first string value in the row (it is the display text by construction)
      if (fmtKey === null) Object.keys(data).forEach(function (k) {
        if (fmtKey === null && typeof data[k] === 'string') fmtKey = k;
      });
      var value = numKey != null ? data[numKey] : 0;
      var formatted = fmtKey != null ? data[fmtKey] : String(value);
      var m = String(formatted).match(/^([\\d.,]+)\\s*(.*)$/);
      return { value: value, num: m ? parseFloat(m[1].replace(/,/g, '')) : value, unit: m ? m[2] : '' };
    }
    // first matching threshold wins (gauge-view.vue colour resolution): critical → major → warning
    function gaugeColor(s, value) {
      var rows = [['critOp', 'critVal', 'critColor'], ['majorOp', 'majorVal', 'majorColor'], ['warnOp', 'warnVal', 'warnColor']];
      for (var i = 0; i < rows.length; i++) {
        var op = s[rows[i][0]], cv = s[rows[i][1]];
        if (!op || cv === '' || cv == null) continue;
        var hit = op === '>' ? value > cv : op === '>=' ? value >= cv : op === '<' ? value < cv
          : op === '<=' ? value <= cv : op === '=' ? value === cv : op === '!=' ? value !== cv : false;
        if (hit) return s[rows[i][2]];
      }
      return 'var(--chart-vivid-teal)';
    }
    // deterministic trend sparkline around the value (seeded PRNG — the product fetches a real
    // series for this; a static fixture has none, so we synthesise a stable one)
    function gaugeTrendPath(value, w, h) {
      var n = 24, min = Infinity, max = -Infinity, pts = [];
      for (var i = 0; i < n; i++) {
        var t = i + 1337;
        t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        var rnd = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        var v = value * (0.72 + rnd * 0.5);
        pts.push(v); if (v < min) min = v; if (v > max) max = v;
      }
      var span = (max - min) || 1;
      var d = pts.map(function (v, i) {
        var x = (i / (n - 1)) * w, y = h - 4 - ((v - min) / span) * (h - 8);
        return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }).join(' ');
      return d + ' L ' + w + ' ' + h + ' L 0 ' + h + ' Z';
    }
    var gaugeSeq = 0;
    function renderGaugeInto(mount, fx, withControls) {
      if (!mount) return;
      var s = withControls ? state : { fontSize: 'medium', textAlign: 'center', iconName: '', iconPosition: 'prefix', trendBg: false, trendColor: 'var(--secondary-orange)', critOp: '', critVal: '', majorOp: '', majorVal: '', warnOp: '', warnVal: '' };
      var v = gaugeValues(fx);
      var color = gaugeColor(s, v.value);
      var isTile = (fx.variant && fx.variant.widgetType) === 'MetroTile';
      var uid = 'g' + (gaugeSeq++);
      if (isTile) {
        var h = mount.clientHeight || 380;
        var fs = Math.max(s.fontSize === 'small' ? h / 3 : s.fontSize === 'large' ? h / 1.5 : h / 2, 50);
        var icon = s.iconName ? '<obs-icon name="' + ttEsc(s.iconName) + '" style="font-size:' + Math.round(fs * 0.5) + 'px;color:' + color + '"></obs-icon>' : '';
        var iconPre = s.iconPosition !== 'suffix' ? icon : '';
        var iconPost = s.iconPosition === 'suffix' ? icon : '';
        var trend = s.trendBg ? '<svg class="gauge-trend" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="' + gaugeTrendPath(v.value || 1, 100, 40) + '" fill="' + s.trendColor + '" opacity="0.2"></path></svg>' : '';
        var just = s.textAlign === 'left' ? 'flex-start' : s.textAlign === 'right' ? 'flex-end' : 'center';
        mount.innerHTML = '<div class="gauge-tile" style="justify-content:' + just + ';color:' + color + '">' + trend + iconPre +
          '<span class="gauge-tile-num" style="font-size:' + Math.round(fs) + 'px">' + v.num + '</span>' +
          '<span class="gauge-tile-unit" style="font-size:' + Math.round(fs * 0.4) + 'px">' + ttEsc(v.unit) + '</span>' + iconPost + '</div>';
      } else {
        var rem = s.fontSize === 'small' ? 1.5625 : s.fontSize === 'large' ? 2.4125 : 2.1875;
        mount.innerHTML = '<div class="gauge-dial">' + gaugeDialSvg(v.value, color, uid) +
          '<div class="gauge-num" style="color:' + color + ';font-size:' + rem + 'rem">' + v.num + '<span>' + ttEsc(v.unit) + '</span></div></div>';
      }
    }
    // ── heatmap family (hand-built DOM — port of heatmap-single-group.vue: the product renders
    // severity hexes as clip-path divs in a wrapping container, not through the chart engine) ──
    var HM = { MAX_BOXES: 250, MAX: 70, MIN: 10 };
    // the product's COLOR_PALETTES (widgets/constants.js) — ranges are percentage buckets
    var HM_PALETTES = {
      'sky.blue.slate': { name: 'Sky Blue Slate', colors: ['#335A6D', '#4F7E98', '#6FA1BB', '#A7C9DC'] },
      'soft.lavender': { name: 'Soft Lavender', colors: ['#5E4A8F', '#836DBE', '#AA95EA', '#C8B8F2'] },
      'coral.sunset': { name: 'Coral Sunset', colors: ['#8A4839', '#B8644F', '#E3856B', '#F0A892'] },
      'erica.pink': { name: 'Erica Pink', colors: ['#702946', '#9A3E64', '#C55A83', '#E08AA8'] },
      'warm.caramel': { name: 'Warm Caramel', colors: ['#4E3A24', '#755738', '#9B7653', '#C7A98A'] },
    };
    function hmPaletteColor(pal, pct) {
      // rows without a percentage keep the severity colour — Number(null) coerces to 0, so the
      // guard must run BEFORE the numeric conversion (that bug rendered "null%" tooltips)
      if (pct == null || pct === '') return null;
      var p = Number(pct);
      if (!isFinite(p) || p < 0) return null;
      // getColorFromPalette: low percentages take the LIGHT end of the palette, high the dark end
      return p <= 25 ? pal.colors[3] : p <= 50 ? pal.colors[2] : p <= 75 ? pal.colors[1] : pal.colors[0];
    }
    // monitor-type icon per with-host row (heatmap-box-with-host's MonitorTypeLineIcons,
    // expressed as the design system's own icon names)
    var HM_TYPE_ICONS = { linux: 'server', windows: 'desktop', network: 'router', database: 'database', vm: 'vm', container: 'application', web: 'web', cpu: 'cpu' };
    function hmCap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''; }
    // a result row → what the cell + tooltip need (labels per heatmap-tooltip.vue's computed props)
    function hmCells(rows) {
      return rows.map(function (row, i) {
        var pct = row.percentage != null ? Number(row.percentage) : null;
        return {
          name: row.name || row.monitor || row['field.v1'] || 'row ' + (i + 1),
          secondary: [row.instance, row['field.v2']].filter(Boolean).join(' · ') || null,
          type: row['object.type'] || null,
          sev: String(row.severity || 'none').toLowerCase(),
          pct: pct,
          fmt: row.formattedValue != null ? row.formattedValue : (pct != null ? pct + '%' : null),
        };
      });
    }
    // heatmap-tooltip.vue: left column of labels, right side the severity chip and — when a
    // palette colour was calculated — the big percentage block on that colour
    function hmTooltipHtml(cell, pctColor) {
      var left = '<div class="hm-tt-left">' +
        '<div class="hm-tt-primary">' + ttEsc(cell.name) + '</div>' +
        (cell.secondary ? '<div class="hm-tt-secondary">' + ttEsc(cell.secondary) + '</div>' : '') +
        (cell.fmt ? '<div class="hm-tt-kv">metric.series.v1 : ' + ttEsc(cell.fmt) + '</div>' : '') +
        '</div>';
      var right = '';
      if (cell.sev && cell.sev !== 'none') right += '<div class="hm-tt-sev severity ' + ttEsc(cell.sev) + '">' + ttEsc(hmCap(cell.sev)) + '</div>';
      if (pctColor) right += '<div class="hm-tt-pct" style="background:' + pctColor + '">' + ttEsc(cell.pct + '%') + '</div>';
      return left + right;
    }
    // one hover tooltip per heatmap, glued to the hex like the product's popper — positioned in
    // VIEWPORT space (position:fixed), so it stays adjacent to the hex even inside a scrolled wrap
    function hmBindTooltip(wrap, cells) {
      // each render creates a fresh tooltip — replace only THIS wrap's previous one; sweeping
      // every .hm-tt on the page would also destroy the tooltips of the other heatmap cards
      if (wrap.__hmTt) wrap.__hmTt.remove();
      var tt = document.createElement('div');
      tt.className = 'hm-tt'; tt.style.display = 'none';
      wrap.__hmTt = tt;
      document.body.appendChild(tt);
      var hide = function () { tt.style.display = 'none'; };
      wrap.addEventListener('mouseover', function (e) {
        var hex = e.target.closest('[data-hm-i]');
        if (!hex || !wrap.contains(hex)) { hide(); return; }
        var i = Number(hex.getAttribute('data-hm-i'));
        tt.innerHTML = hmTooltipHtml(cells[i], hex.getAttribute('data-hm-c') || null);
        tt.style.display = 'flex';
        var hr = hex.getBoundingClientRect(), tr = tt.getBoundingClientRect();
        var x = hr.left + hr.width / 2 - tr.width / 2;
        x = Math.max(8, Math.min(x, window.innerWidth - tr.width - 8));
        var top = hr.top - tr.height - 12; // hug the hex — prefer directly above it
        var below = top < 8;
        tt.style.left = x + 'px';
        tt.style.top = (below ? hr.bottom + 12 : top) + 'px';
        tt.classList.toggle('below', below);
      });
      wrap.addEventListener('mouseleave', hide);
      wrap.addEventListener('scroll', hide);
    }
    function renderHeatmapInto(mount, fx, withControls) {
      if (!mount) return;
      var r = (fx && fx.result) || {};
      var rows = (r.data || []).filter(function (x) { return x && typeof x === 'object' });
      var totalCount = r.totalCount || rows.length;
      var withHost = (fx.variant && fx.variant.widgetType) === 'WithHostHeatMap';
      // the widget's own selected palette is the default; the panel control overrides it
      var defPal = (fx.widgetProperties || {}).selectedColorPalette || '';
      var s = withControls ? state : { showCounts: false, colorPalette: defPal };
      var pal = (s.colorPalette || defPal) ? HM_PALETTES[s.colorPalette || defPal] : null;
      var width = (mount.clientWidth || 900) - 24;
      // currentSize (heatmap-single-group.vue / heatmap-with-host.vue): clamp(max(width/length, range), 10, 70)
      var length = Math.min(totalCount, HM.MAX_BOXES + 1);
      var range = width <= 200 ? 20 : width <= 500 ? 30 : width <= 1200 ? 40 : width <= 1600 ? 45 : 50;
      var size = Math.min(Math.max(Math.max(width / length, range), HM.MIN), HM.MAX);
      var displayableCount, perRow;
      if (withHost) {
        // with-host rows reserve ~50px per cell for the host name (heatmap-with-host.vue)
        perRow = Math.max(1, Math.floor(width / (size + 50)));
        displayableCount = Math.ceil(HM.MAX_BOXES / perRow) * perRow - 2;
      } else {
        perRow = Math.max(1, Math.floor(width / (size + 5)));
        displayableCount = Math.ceil(HM.MAX_BOXES / perRow) * perRow - 2;
      }
      var shown = rows.slice(0, displayableCount);
      var remaining = Math.max(totalCount - displayableCount, 0);
      var cells = hmCells(shown);
      var m = Math.floor(size / 17);
      var body;
      if (withHost) {
        body = cells.map(function (c, i) {
          var pc = pal ? hmPaletteColor(pal, c.pct) : null;
          var icon = HM_TYPE_ICONS[c.type];
          var iw = Math.max(5, size - 25);
          var hexStyle = 'width:' + size.toFixed(1) + 'px;height:' + (size * 1.1547).toFixed(1) + 'px' + (pc ? ';background:' + pc : '');
          return '<div class="hm-hcell" data-hm-i="' + i + '"' + (pc ? ' data-hm-c="' + pc + '"' : '') + '>' +
            '<div class="hm-hhex severity ' + ttEsc(c.sev) + '" style="' + hexStyle + '">' +
            (icon && size >= 32 ? '<div class="hm-hicon"><obs-icon name="' + ttEsc(icon) + '" style="font-size:' + iw.toFixed(0) + 'px"></obs-icon></div>' : '') +
            '</div>' +
            '<div class="hm-hname" title="' + ttEsc(c.name) + '">' + ttEsc(c.name) + '</div></div>';
        }).join('');
      } else {
        body = cells.map(function (c, i) {
          var pc = pal ? hmPaletteColor(pal, c.pct) : null;
          return '<div class="hm-box" data-hm-i="' + i + '"' + (pc ? ' data-hm-c="' + pc + '"' : '') +
            ' style="width:' + size.toFixed(1) + 'px;height:' + (size * 1.1547).toFixed(1) + 'px;margin:' + m + 'px;margin-bottom:' + (m - size * 0.2885).toFixed(1) + 'px">' +
            '<div class="hm-cell severity ' + ttEsc(c.sev) + '"' + (pc ? ' style="background:' + pc + '"' : '') + '></div></div>';
        }).join('');
      }
      var counts = s.showCounts && rows.length
        ? '<div class="hm-counts"><span class="hm-counts-n">' + totalCount + '</span><span class="hm-counts-t">| Total</span></div>' : '';
      var more = remaining > 0 ? '<span class="hm-more">+' + remaining + ' more</span>' : '';
      mount.innerHTML = '<div class="hm-wrap">' + counts + '<div class="hm-container hm-host' + withHost + '">' + body + more + '</div></div>';
      hmBindTooltip(mount.querySelector('.hm-wrap'), cells);
    }
    // ── map family — the product has THREE renderers for one payload (map-chart-options.vue):
    // the Highcharts country map (mapbubble), the Tree View treemap, and the Online Map (Leaflet).
    // Result shape (buildMapViewResult): { type, data: { mapbubble: [{ name, code2, z, value,
    // 'metric.series.v1': formatted, geometry: { coordinates: [lon, lat] } }] } } ──
    var mapTopoCache = null;
    function loadMapTopo() {
      if (mapTopoCache) return Promise.resolve(mapTopoCache);
      if (!PG.mapTopo) return Promise.resolve(null);
      return fetch(PG.mapTopo).then(function (r) { return r.json(); }).then(function (j) { mapTopoCache = j; return j; });
    }
    // the product's chart palette (getChartColors port) — shared by the map treemap and the Top N
    // packed-bubble / Tree View renderers
    var CHART_PALETTE = ['#14B8A6', '#FB923C', '#A855F7', '#84CC16', '#EC4899', '#06B6D4', '#EAB308', '#FF6B6B'];
    function mapRows(fx) {
      var d = ((fx && fx.result) || {}).data || {};
      var arr = d.mapbubble || d.mappoint || [];
      return (Array.isArray(arr) ? arr : []).filter(function (p) { return p && p.name });
    }
    // which series kind the payload carries — drives mapbubble vs mappoint rendering
    function mapSource(fx) {
      var d = ((fx && fx.result) || {}).data || {};
      return d.mapbubble ? 'mapbubble' : 'mappoint';
    }
    function mapBubbleData(fx) {
      return mapRows(fx).map(function (p) {
        var g = p.geometry && p.geometry.coordinates;
        var lon = g ? Number(g[0]) : NaN, lat = g ? Number(g[1]) : NaN;
        var ut = p.untouchedData || {};
        if (!isFinite(lon) && ut['field.v6'] != null) lon = Number(ut['field.v6']); // captured lat/lon columns
        if (!isFinite(lat) && ut['field.v5'] != null) lat = Number(ut['field.v5']);
        return {
          name: p.name, code2: p.code2, z: p.z != null ? p.z : p.value, value: p.value, formatted: p['metric.series.v1'],
          // GeoJSON Point — without the explicit type the engine ignores the coordinates and
          // falls back to the joined map shape's bounds, which places bubbles in the ocean
          geometry: { type: 'Point', coordinates: [lon, lat] },
        };
      });
    }
    var MAP_TOOLTIP = {
      useHTML: true, hideDelay: 0, animation: false, borderWidth: 1, borderRadius: 10,
      borderColor: 'var(--border-color)', backgroundColor: 'var(--chart-tooltip-background, var(--dropdown-background, rgba(43, 57, 79, 0.9)))',
      className: 'hc-tooltip',
      // the product prints the point name, then one row per non-internal result field
      formatter: function () {
        var p = this.point;
        var v = p.formatted != null ? p.formatted : p.value;
        return '<div class="ptt-head">' + ttEsc(p.name) + '</div><div class="ptt-body"><div class="ptt-row"><span class="ptt-name">metric.series.v1</span><span class="ptt-val">' + ttEsc(v) + '</span></div></div>';
      },
    };
    function renderMapHighcharts(mount, fx, s) {
      // RETURNS the chart instance — the caller decides whether it owns it. Example cards must
      // never touch the playground's global chart (sharing it made card renders and playground
      // renders destroy each other's instances depending on timing).
      return loadMapTopo().then(function (topo) {
        if (!topo || !Highcharts.mapChart) {
          mount.innerHTML = '<div class="ch-na">World map geometry not found locally — it is vendored from the product checkout at build time.</div>';
          return null;
        }
        return Highcharts.mapChart(mount, {
          chart: { type: 'map', map: topo, backgroundColor: 'transparent', animation: false, height: s ? s.height : 380 },
          title: { text: null },
          mapView: { projection: { name: 'Miller' } },
          credits: { enabled: false }, exporting: { enabled: false }, accessibility: { enabled: false },
          mapNavigation: { enabled: true, enableButtons: true, buttonOptions: { verticalAlign: 'top', align: 'right', alignTo: 'spacingBox' } },
          legend: { enabled: false },
          plotOptions: {
            mapbubble: {
              color: 'var(--map-bubble-color)', joinBy: ['iso-a2', 'code2'],
              minSize: 4, maxSize: '12%', stickyTracking: false, marker: { symbol: 'circle' },
              states: { hover: { marker: { radiusPlus: 1 } } },
            },
            // point markers instead of value-sized bubbles (map-chart-options.vue mappoint block)
            mappoint: {
              shadow: false,
              marker: { fillColor: 'var(--primary)', states: { hover: { fillColor: 'var(--primary)' } } },
              dataLabels: {
                enabled: true, style: { color: 'var(--page-text-color)', textOutline: 'none' },
                shadow: false, borderWidth: 0,
              },
            },
          },
          tooltip: MAP_TOOLTIP,
          series: [
            { nullColor: 'var(--chart-null-color)', borderColor: 'var(--page-background-color)', showInLegend: false, data: [] },
            { type: mapSource(fx) === 'mappoint' ? 'mappoint' : 'mapbubble', data: mapBubbleData(fx) },
          ],
        });
      });
    }
    // shared treemap options (map-chart-options.vue, widgetType Tree View): the Map widget's
    // Tree View and the Top N Tree View render the SAME config — only the row source differs.
    function treemapCfg(rows, s) {
      return {
        chart: { type: 'treemap', backgroundColor: 'transparent', animation: false, height: s ? s.height : 380 },
        title: { text: null },
        credits: { enabled: false }, exporting: { enabled: false }, accessibility: { enabled: false },
        legend: { enabled: false },
        colors: CHART_PALETTE,
        series: [{
          type: 'treemap', layoutAlgorithm: 'squarified', alternateStartingDirection: true,
          borderWidth: 0, colorByPoint: true,
          // the product's TopN treemap label: bold value over a smaller name, font sized by cell
          dataLabels: {
            enabled: true, useHTML: true,
            style: { color: 'white', textOutline: 'none', fontWeight: 'normal', fontSize: '14px' },
            formatter: function () {
              var w = this.point.shapeArgs ? this.point.shapeArgs.width : 40;
              var h = this.point.shapeArgs ? this.point.shapeArgs.height : 40;
              var fs = Math.max(8, Math.min(16, Math.min(w, h) * 0.15));
              var nm = String(this.point.name || ''); if (nm.length > 100) nm = nm.slice(0, 100) + '...';
              var v = this.point.formattedValue != null ? this.point.formattedValue : this.point.value;
              return '<div style="font-size:' + fs + 'px;text-align:center;overflow:hidden"><div style="font-weight:600;font-size:1.5em">' + ttEsc(v) + '</div><div style="font-size:0.75em;opacity:.85">' + ttEsc(nm) + '</div></div>';
            },
          },
          levels: [{ level: 1, layoutAlgorithm: 'squarified', dataLabels: { enabled: true, verticalAlign: 'middle', align: 'center' } }],
          data: rows,
        }],
        tooltip: MAP_TOOLTIP,
      };
    }
    function renderMapTreemap(mount, fx, s) {
      var data = mapBubbleData(fx).map(function (p) { return { name: p.name, value: p.value, formattedValue: p.formatted } });
      return Highcharts.chart(mount, treemapCfg(data, s));
    }
    // Leaflet (Online Map) — bubble radius reproduces Highcharts Series.Bubble.getRadii()
    // (leaflet-map.vue): ceil(minSize + sqrt(position) × (maxSize − minSize)) / 2.
    var lfMap = null; // the PLAYGROUND's instance
    function cleanupLeaflet() { if (lfMap) { try { lfMap.remove(); } catch (e) {} lfMap = null; } }
    function renderMapLeaflet(mount, fx, s, shared) {
      if (typeof L === 'undefined') {
        mount.innerHTML = '<div class="ch-na">Leaflet not found locally — it is vendored from the product checkout at build time.</div>';
        return;
      }
      // bubble rows carry [lon, lat] in geometry.coordinates (buildMapBubbleSeries)
      var pts = mapRows(fx).map(function (p) {
        var g = p.geometry && p.geometry.coordinates;
        return {
          name: p.name, z: p.z != null ? p.z : p.value, formatted: p['metric.series.v1'],
          lat: g ? Number(g[1]) : NaN, lon: g ? Number(g[0]) : NaN,
        };
      }).filter(function (b) { return isFinite(b.lat) && isFinite(b.lon) });
      mount.innerHTML = '<div class="lf-map"></div><div class="lf-zoom"><button data-z="in" aria-label="Zoom in">+</button><button data-z="out" aria-label="Zoom out">−</button></div>';
      var el = mount.querySelector('.lf-map');
      if (shared !== false) cleanupLeaflet(); // a card render owns its own instance
      var inst = L.map(el, {
        center: [20, 5], zoom: 2, minZoom: 2, zoomControl: false, attributionControl: true,
        maxBounds: L.latLngBounds(L.latLng(-89.98155760646617, -180), L.latLng(89.99346179538875, 180)),
      });
      if (shared !== false) lfMap = inst;
      // bounds keeps Leaflet from requesting wrap-around tiles past the world edge (OSM answers those with 400)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true, bounds: L.latLngBounds([[-85.0511287776, -180], [85.0511287776, 180]]),
      }).addTo(inst);
      var zs = pts.map(function (b) { return b.z }).filter(function (z) { return isFinite(z) });
      var zMin = zs.length ? Math.min.apply(null, zs) : 0, zMax = zs.length ? Math.max.apply(null, zs) : 0;
      var maxSize = 0.12 * Math.min(mount.clientWidth || 800, s ? s.height : 380);
      pts.forEach(function (b) {
        var pos = zMax > zMin ? (b.z - zMin) / (zMax - zMin) : 0.5;
        var radius = Math.ceil(4 + Math.sqrt(pos) * (maxSize - 4)) / 2;
        var mk = L.circleMarker([b.lat, b.lon], {
          radius: radius, className: 'widget-map-bubble',
          fillColor: 'var(--online-map-bubble-color)', color: 'var(--page-text-color)', weight: 1, fillOpacity: 1,
        }).addTo(inst);
        mk.bindTooltip('<b>' + ttEsc(b.name) + '</b><br/>' + ttEsc(b.formatted != null ? b.formatted : b.z), { className: 'lf-tip' });
        // hover grows the bubble by 1px (leaflet-map.vue BUBBLE_HOVER_RADIUS_PLUS)
        mk.on('mouseover', function (e) { e.target.setStyle({ radius: radius + 1 }); });
        mk.on('mouseout', function (e) { e.target.setStyle({ radius: radius }); });
      });
      if (pts.length === 1) inst.setView([pts[0].lat, pts[0].lon], 4);
      mount.querySelectorAll('.lf-zoom button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (btn.getAttribute('data-z') === 'in') inst.zoomIn(); else inst.zoomOut();
        });
      });
    }
    // ── topn views family — the Top N widget's non-chart Style types (topn-property.vue):
    // TopN Solid Gauge View (topn-solid-gauge.vue dial grid), Packed Bubble Chart
    // (chart-options.vue's packedbubble block) and Tree View (map-view.vue → the shared treemap
    // config above). All three consume the SAME Top N chart result: series[0].data holds one
    // aggregated value per monitor, categories the monitor names. ──
    function topnRows(fx, s) {
      var ch = ((fx && fx.result) || {}).Chart || {};
      var sr = (ch.series || [])[0] || {};
      var cats = ch.categories || [];
      var rows = (sr.data || []).map(function (v, i) {
        var fv = (sr.formattedValues || [])[i];
        return { name: cats[i] != null ? cats[i] : 'series ' + (i + 1), value: v, formatted: fv != null ? fv : String(v) };
      }).filter(function (r) { return typeof r.value === 'number' && isFinite(r.value) });
      // sorting-property: Top N / Last N over the aggregated per-monitor value, then topCount
      rows.sort(function (a, b) { return (s && s.sortDirection === 'asc') ? a.value - b.value : b.value - a.value });
      if (s && s.sortCount) rows = rows.slice(0, s.sortCount);
      return rows;
    }
    var topnDialSeq = 0;
    function renderTopnSolidGauge(mount, fx, s) {
      var rows = topnRows(fx, s);
      if (!rows.length) { mount.innerHTML = '<div class="ch-na">No numeric per-monitor rows in this fixture</div>'; return; }
      // repeatedColumn (topn-solid-gauge.vue): floor(min(min(width/180, 6), series length))
      var width = mount.clientWidth || 900;
      var cols = Math.max(1, Math.floor(Math.min(Math.min(width / 180, 6), rows.length)));
      var html = '<div class="topn-grid" style="grid-template-columns:repeat(' + cols + ',minmax(150px,max-content))">';
      rows.forEach(function (r) {
        var m = String(r.formatted).match(/^([\\d.,]+)\\s*(.*)$/); // value/unit split (extractUnitAndValue)
        var num = m ? m[1] : r.formatted, unit = m ? m[2] : '';
        html += '<div class="topn-cell"><div class="gauge-dial">' +
          gaugeDialSvg(r.value, 'var(--chart-vivid-teal)', 't' + (topnDialSeq++)) +
          '<div class="gauge-num" style="color:var(--chart-vivid-teal)">' + ttEsc(num) + '<span>' + ttEsc(unit) + '</span></div>' +
          '</div><div class="topn-name" title="' + ttEsc(r.name) + '">' + ttEsc(r.name) + '</div></div>';
      });
      mount.innerHTML = html + '</div>';
    }
    // single series → every bubble gets its own palette colour (buildPackedBubbleForMetric)
    function topnBubbleData(fx, s) {
      return topnRows(fx, s).map(function (r, i) {
        return { name: r.name, value: r.value, y: r.value, formattedValue: r.formatted, color: CHART_PALETTE[i % CHART_PALETTE.length] };
      });
    }
    var TOPN_BUBBLE_TT = {
      useHTML: true, hideDelay: 0, animation: false, borderWidth: 1, borderRadius: 10,
      borderColor: 'var(--border-color)', backgroundColor: 'var(--chart-tooltip-background, var(--dropdown-background, rgba(43, 57, 79, 0.9)))',
      className: 'hc-tooltip',
      formatter: function () {
        var p = this.point;
        var v = p.formattedValue != null ? p.formattedValue : p.value;
        return '<div class="ptt-head">' + ttEsc(p.name) + '</div><div class="ptt-body"><div class="ptt-row"><span class="ptt-name">' + ttEsc(this.series.name) + '</span><span class="ptt-val">' + ttEsc(v) + '</span></div></div>';
      },
    };
    function renderTopnPackedBubble(mount, fx, s) {
      var ch = ((fx && fx.result) || {}).Chart || {};
      var sr = (ch.series || [])[0] || {};
      return Highcharts.chart(mount, {
        chart: { type: 'packedbubble', backgroundColor: 'transparent', animation: false, height: s ? s.height : 380 },
        title: { text: null },
        credits: { enabled: false }, exporting: { enabled: false }, accessibility: { enabled: false },
        legend: { enabled: false },
        plotOptions: {
          packedbubble: {
            // chart-options.vue packedbubble block: simulation on for layout, gravity loose,
            // bubbles sized 15%–100% of the z range from 0
            useSimulation: true, minSize: '15%', maxSize: '100%', zMin: 0, draggable: false,
            layoutAlgorithm: {
              splitSeries: false, seriesInteraction: false, dragBetweenSeries: false,
              enableSimulation: false, parentNodeLimit: true, gravitationalConstant: 0.01, bubblePadding: 8,
            },
            animation: { duration: 100, easing: 'easeOutQuart' },
            dataLabels: {
              enabled: true, useHTML: true, align: 'center', verticalAlign: 'middle', crop: false,
              // font size + character budget scale with the RENDERED bubble radius
              formatter: function () {
                var p = this.point, name = String(p.name || ''), value = p.y || 1;
                var r = 30;
                if (p.graphic && p.graphic.r) r = p.graphic.r;
                else if (p.shapeArgs && p.shapeArgs.r) r = p.shapeArgs.r;
                else {
                  var all = []; this.series.chart.series.forEach(function (x) { all = all.concat(x.yData || []) });
                  var mx = Math.max.apply(null, all), mn = Math.min.apply(null, all);
                  var norm = (value - mn) / ((mx - mn) || 1);
                  var w = this.series.chart.plotWidth || 400, h = this.series.chart.plotHeight || 300;
                  var minD = Math.min(w, h), rMin = Math.max(15, minD * 0.03), rMax = Math.min(80, minD * 0.15);
                  r = rMin + norm * (rMax - rMin);
                }
                if (r < 15) return ''; // too small for any text
                var avail = r * 1.8, fs, maxChars;
                if (r < 25) { fs = Math.max(8, Math.floor(r * 0.35)); maxChars = Math.max(3, Math.floor(avail / (fs * 0.5))); }
                else if (r < 40) { fs = Math.max(10, Math.floor(r * 0.28)); maxChars = Math.max(5, Math.floor(avail / (fs * 0.48))); }
                else if (r < 60) { fs = Math.max(11, Math.floor(r * 0.22)); maxChars = Math.max(8, Math.floor(avail / (fs * 0.45))); }
                else if (r < 80) { fs = Math.max(12, Math.floor(r * 0.19)); maxChars = Math.max(12, Math.floor(avail / (fs * 0.42))); }
                else { fs = Math.max(13, Math.min(16, Math.floor(r * 0.16))); maxChars = Math.max(15, Math.floor(avail / (fs * 0.4))); }
                maxChars = Math.max(3, Math.min(30, maxChars)); fs = Math.max(8, Math.min(16, fs));
                var text = name;
                if (name.length > maxChars) {
                  // word-aware truncation (bigger bubbles keep more words)
                  var words = name.split(/[\\s\\-_./\\\\]/);
                  if (words.length > 1 && r > 35) {
                    var combined = '', count = 0;
                    for (var i = 0; i < words.length; i++) {
                      var t2 = combined ? combined + ' ' + words[i] : words[i];
                      if (t2.length <= maxChars - 1) { combined = t2; count++; } else break;
                    }
                    text = count > 1 ? combined + '…' : words[0].slice(0, maxChars - 1) + '…';
                  } else if (words.length > 1) {
                    text = words[0].length <= maxChars - 1 ? words[0] + '…' : words[0].slice(0, maxChars - 1) + '…';
                  } else {
                    text = name.slice(0, maxChars - 1) + '…';
                  }
                }
                return '<div style="display:flex;align-items:center;justify-content:center;width:' + (r * 2) + 'px;height:' + (r * 2) + 'px;pointer-events:none">' +
                  '<span style="font-size:' + fs + 'px;font-family:\\'JetBrains Mono\\',monospace;color:var(--page-text-color);font-weight:500;line-height:1.2;text-align:center;max-width:' + avail + 'px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + ttEsc(name) + '">' + ttEsc(text) + '</span></div>';
              },
              style: { fontWeight: 'normal', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--page-text-color)', textOutline: 'none' },
            },
            tooltip: TOPN_BUBBLE_TT,
          },
        },
        series: [{ name: sr.name || 'metric.series.v1.avg', data: topnBubbleData(fx, s) }],
      });
    }
    function renderTopnTreemap(mount, fx, s) {
      var rows = topnRows(fx, s).map(function (r) { return { name: r.name, value: r.value, formattedValue: r.formatted } });
      return Highcharts.chart(mount, treemapCfg(rows, s));
    }
    // ── sankey family — the captured Flow result ({ keys: [from,to,weight,rowId], data: rows })
    // fed to the engine's sankey type exactly like sankey-options.vue (keys gain a trailing
    // 'color', every link row the link colour; hover dims the non-path links by rowId) ──
    function isDarkTheme() { return document.documentElement.getAttribute('data-theme') === 'dark-theme' }
    function fmtBytes(v) {
      var n = Number(v);
      if (!isFinite(n)) return String(v);
      var u = ['B', 'KB', 'MB', 'GB', 'TB'], i = 0;
      while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
      return (Math.round(n * 10) / 10) + ' ' + u[i];
    }
    function sankeyHighlight(point, dim) {
      var series = point.series;
      var rowId = point.options && point.options.rowId;
      var linked = {};
      if (point.isNode) {
        (point.linksTo || []).concat(point.linksFrom || []).forEach(function (l) { linked[l.options.rowId] = 1 });
      } else { linked[rowId] = 1; }
      series.points.forEach(function (p) {
        if (p.isNode || !p.graphic) return;
        var on = !dim || linked[p.options.rowId];
        p.graphic.attr('opacity', on ? (point.series.options.linkOpacity || 0.4) : 0.06);
      });
    }
    function renderSankeyCfg(fx, s) {
      var r = (fx && fx.result) || {};
      var linkColor = isDarkTheme() ? '#6A7FA0' : '#8E9FBC'; // sankey-options.vue per theme
      var keys = (r.keys || ['from', 'to', 'weight', 'rowId']).slice(0, 4).concat('color');
      var data = (r.data || []).map(function (row) { return [String(row[0]), String(row[1]), row[2], row[3], linkColor] });
      return {
        chart: { type: 'sankey', backgroundColor: 'transparent', animation: !!(s && s.animation), height: s ? s.height : 380 },
        title: { text: null },
        credits: { enabled: false }, exporting: { enabled: false }, accessibility: { enabled: false },
        legend: { enabled: false },
        plotOptions: {
          sankey: {
            linkOpacity: r.linkOpacity != null ? r.linkOpacity : 0.4,
            dataLabels: { style: { fontWeight: 'normal', color: 'var(--page-text-color)', textOutline: 'none' }, align: 'left', x: 20 },
            point: {
              events: {
                mouseOver: function () { sankeyHighlight(this, true) },
                mouseOut: function () { sankeyHighlight(this, false) },
              },
            },
          },
        },
        tooltip: {
          useHTML: true, animation: false, crosshairs: false, borderWidth: 1, borderRadius: 10,
          borderColor: 'var(--border-color)', backgroundColor: 'var(--chart-tooltip-background, var(--dropdown-background, rgba(43, 57, 79, 0.9)))',
          className: 'hc-tooltip',
          // the product's sankey tooltip: nodes sum, links weigh (tooltip-builder.js)
          formatter: function () {
            var p = this.point;
            var name = p.isNode ? p.name : p.from + ' → ' + p.to;
            var v = p.isNode ? p.sum : p.weight;
            return '<div class="ptt-head">' + ttEsc(name) + '</div><div class="ptt-body"><div class="ptt-row"><span class="ptt-name">' + (p.isNode ? 'Total' : r.counter || 'metric.series.v1') + '</span><span class="ptt-val">' + fmtBytes(v) + '</span></div></div>';
          },
        },
        series: [{ name: r.name || 'Flow', keys: keys, data: data }],
      };
    }
    // ── AI/ML family (Anomaly / Forecast) — a port of the product's ai-ml-chart-view +
    // chart-options anomaly/forecast paths: ONE spline for the values, an areasplinerange
    // "Prediction Range" band, zone-coloured anomaly outliers, and (forecast) a red divider
    // plot line at the first future interval with the band covering only the projection. ──
    function slopeIntercept(p1, p2) {
      var m = (p2[1] - p1[1]) / ((p2[0] - p1[0]) || 1);
      return { m: m, b: p1[1] - m * p1[0] };
    }
    // findAnomalyZones (chart-helpers.js): colour flips exactly where the value line crosses
    // the band edge (line intersection), teal in-band, red out-of-band.
    function findAnomalyZones(aiPoints, values) {
      var valid = 'var(--chart-vivid-teal)', anomaly = '#c84235';
      var zones = [], prev = null, anomalyType = null;
      for (var i = 0; i < (values || []).length; i++) {
        var iv = aiPoints[i] || {};
        var value = values[i];
        var zone = { value: value[0], color: valid };
        if (value[1] !== null && iv.lower != null && iv.upper != null) {
          if (value[1] < iv.lower) { anomalyType = -1; zone.color = anomaly; }
          else if (value[1] > iv.upper) { anomalyType = 1; zone.color = anomaly; }
        }
        if (prev != null && prev.color !== zone.color) {
          var edge = anomalyType === 1 ? 'upper' : 'lower';
          var pv = values[i - 1], pi = aiPoints[i - 1] || {};
          var l1 = slopeIntercept([pv[0], pi[edge]], [iv.interval, iv[edge]]);
          var l2 = slopeIntercept([pv[0], pv[1]], [value[0], value[1]]);
          var x = (l2.b - l1.b) / ((l1.m - l2.m) || 1);
          prev.value = x; zones.push(prev);
        }
        prev = zone;
      }
      if (prev) zones.push(prev);
      zones.push({ value: Date.UTC(9999), color: valid });
      return zones;
    }
    // the product tooltip (TooltipBuilder) + the AI/ML extras: one row per series, and for a
    // low/high (areasplinerange) point a dimmed "Prediction Range  low - high" row (3 decimals
    // for percent, matching the payload's formatted strings).
    function aiMlTooltip() {
      var pts = this.points ? this.points : (this.point ? [this.point] : []);
      var head = this.x != null && pts.length ? '<div class="ptt-head">' + fmtDate(this.x) + '</div>' : '';
      var rows = [], rangeShown = false;
      for (var i = 0; i < pts.length; i++) {
        var raw = pts[i], p = raw.point || raw;
        if (p.low !== undefined && p.high !== undefined) {
          if (rangeShown) continue;
          rangeShown = true;
          var uo = p.series.userOptions || {};
          var fmtR = function (v) {
            if (uo.unit && /^percent/i.test(uo.unit)) return (Math.round(v * 1000) / 1000).toFixed(3) + '%';
            return String(Math.round(v * 100) / 100);
          };
          rows.push('<div class="ptt-row ptt-range"><span class="ptt-name ptt-dim">' + ttEsc(p.series.name || 'Prediction Range') + '</span><span class="ptt-val ptt-dim">' + fmtR(p.low) + ' - ' + fmtR(p.high) + '</span></div>');
          continue;
        }
        var v = pointValue(raw);
        if (v == null) continue;
        rows.push('<div class="ptt-row"><span class="ptt-swatch"><svg width="8" height="8" aria-hidden="true"><rect width="8" height="8" fill="' + (p.color || raw.color) + '"/></svg></span><span class="ptt-name">' + ttEsc(ttLabel(p)) + '</span><span class="ptt-val">' + ttEsc(v) + '</span></div>');
      }
      if (!rows.length) return false;
      return head + '<div class="ptt-body">' + rows.join('') + '</div>';
    }
    function aiMlMarkerPatches(s) {
      // Markers tab → yAxis plotLines / plotBands (shared with the time-series page)
      var patches = {};
      if (s.markerType === 'line' && s.markerThreshold !== '' && s.markerColor && s.markerLineType) {
        patches.plotLines = [{
          color: 'var(--severity-' + s.markerColor + ')',
          width: s.markerLineType === 'solid.bold' ? 2 : 1,
          value: Number(s.markerThreshold), zIndex: 3, dashStyle: s.markerLineType,
          label: { text: s.markerLabel || '', style: { color: 'var(--severity-' + s.markerColor + ')' } },
        }];
      }
      if (s.markerType === 'range' && s.markerStart !== '' && s.markerEnd !== '' && s.markerColor && s.markerLineType) {
        patches.plotBands = [{
          color: 'var(--severity-' + s.markerColor + '-lightest)',
          label: { text: s.markerLabel || '', style: { color: 'var(--severity-' + s.markerColor + ')' } },
          to: Number(s.markerStart), from: Number(s.markerEnd), zIndex: 3,
        }];
      }
      return patches;
    }
    function renderAiMlCfg(fx, s) {
      var ch = ((fx && fx.result) || {}).Chart || {};
      var series = ch.series || [];
      var main = null, ai = null;
      series.forEach(function (sr) {
        if (sr.seriesType === 'anomaly' || sr.seriesType === 'forecast') { if (!ai) ai = sr; }
        else if (!main) main = sr;
      });
      if (!main) return { series: [] };
      var isAnomaly = ai && ai.seriesType === 'anomaly';
      var unit = main.unit;
      var outSeries = [], futurePoints = [];
      var rangeData = (ai && ai.data ? ai.data : []).filter(function (p) { return p.lower != null && p.upper != null })
        .map(function (p) { return [p.interval, p.lower, p.upper] });
      if (isAnomaly) {
        outSeries.push({
          name: main.name, unit: unit, counter: main.counter,
          data: main.data, formattedValues: main.formattedValues,
          zoneAxis: 'x', zones: findAnomalyZones(ai.data, main.data),
        });
      } else {
        futurePoints = (ai.data || []).filter(function (p) { return p.value != null })
          .map(function (p) { return [p.interval, p.value] });
        outSeries.push({
          name: main.name, unit: unit, counter: main.counter,
          data: (main.data || []).concat(futurePoints),
          formattedValues: (main.formattedValues || []).concat(ai.formattedValues || []),
        });
      }
      if (rangeData.length) {
        outSeries.push({
          name: 'Prediction Range', type: 'areasplinerange', unit: unit,
          lineWidth: 0, linkedTo: ':previous', color: 'var(--chart-vivid-teal-faded)',
          fillOpacity: 0.3, zIndex: 0, marker: { enabled: false },
          states: { hover: { marker: { enabled: true, fillColor: '#ffffff', radius: 3 } } },
          data: rangeData,
        });
      }
      var yPatches = aiMlMarkerPatches(s);
      return {
        chart: { type: 'spline', backgroundColor: 'transparent', animation: !!s.animation, height: s.height },
        title: { text: null },
        credits: { enabled: false }, exporting: { enabled: false }, accessibility: { enabled: false },
        colors: ['#14B8A6', '#FB923C', '#A855F7', '#84CC16', '#EC4899', '#06B6D4', '#EAB308', '#FF6B6B'],
        legend: { enabled: s.legend !== false, align: 'right', symbolWidth: 11, symbolHeight: 11, symbolRadius: 1, itemStyle: { color: 'var(--chart-legend-color, var(--page-text-color))', fontWeight: 'normal', fontSize: '0.65rem' } },
        plotOptions: {
          series: {
            lineWidth: s.lineWidth || 2,
            marker: { enabled: !!s.points, radius: s.pointSize || 4 },
            animation: !!s.animation,
          },
        },
        // axes carry the same product styling as the captured time-series configs
        // (chart-common-options): gridLineColor/lineColor tokens and token-coloured labels —
        // without them the engine defaults paint bright #e6e6e6 gridlines and #666 labels
        xAxis: {
          type: 'datetime',
          lineColor: 'var(--bottom-line-color)',
          tickLength: 0,
          gridLineColor: 'var(--chart-grid-line-color)',
          labels: { rotation: s.rotation || 0, style: { color: 'var(--page-text-color)', fontSize: '0.65rem' } },
          ...(s.xAxisOn ? { title: { text: s.xAxisTitle || '', style: { color: 'var(--page-text-color)' } } } : {}),
          // forecast: a 1px divider at the first future interval (chart-options.vue)
          ...(futurePoints.length ? { plotLines: [{ width: 1, color: 'var(--secondary-red-light, #ff6b6b)', value: futurePoints[0][0], zIndex: 3 }] } : {}),
        },
        yAxis: {
          reversedStacks: false,
          endOnTick: true,
          allowDecimal: true,
          lineWidth: 1,
          lineColor: 'var(--bottom-line-color)',
          gridLineColor: 'var(--chart-grid-line-color)',
          labels: {
            style: { color: 'var(--page-text-color)', fontSize: '0.65rem' },
            ...(unit && /^percent/i.test(unit) ? { formatter: function () { return this.value + '%' } } : {}),
          },
          ...(s.yAxisOn ? { title: { text: s.yAxisTitle || '', style: { color: 'var(--page-text-color)', fontWeight: '500' } } } : {}),
          ...yPatches,
        },
        tooltip: {
          useHTML: true, shared: true, animation: false, borderWidth: 1, borderRadius: 10,
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--chart-tooltip-background, var(--dropdown-background, rgba(43, 57, 79, 0.9)))',
          className: 'hc-tooltip', shadow: false, formatter: aiMlTooltip,
          // product parity (chart-common-options) — same as applyProductTooltip
          style: { color: 'var(--page-text-color)' },
        },
        series: outSeries,
      };
    }
    // ── examples: lazy-draw on scroll (rendering every chart at once locks the main thread) ──
    var rendered = Object.create(null);
    function draw(el) {
      var id = el.getAttribute('data-fx');
      var view = el.getAttribute('data-fxview') || '';
      var key = id + (view ? '-' + view : ''); // one fixture can back several view cards
      if (rendered[key]) return;
      rendered[key] = true;
      fetch('./fixtures/' + id + '.json').then(function (r) { return r.json(); }).then(function (fx) {
        if (PG.kind === 'gauge' || PG.kind === 'heatmap') {
          var gm = document.getElementById('plot-' + key);
          if (gm) { gm.style.height = '240px'; if (PG.kind === 'gauge') renderGaugeInto(gm, fx, false); else renderHeatmapInto(gm, fx, false); }
          return;
        }
        if (PG.kind === 'map') {
          var mp = document.getElementById('plot-' + key);
          if (mp) {
            mp.style.height = '280px';
            if (view === 'online') renderMapLeaflet(mp, fx, { height: 280 }, false);
            else renderMapHighcharts(mp, fx, { height: 280 });
          }
          return;
        }
        if (PG.kind === 'sankey') {
          var sp = document.getElementById('plot-' + key);
          if (sp) { sp.style.height = '280px'; Highcharts.chart(sp, renderSankeyCfg(fx, { height: 280 })); }
          return;
        }
        if (PG.kind === 'aiml') {
          var ap = document.getElementById('plot-' + key);
          if (ap) { ap.style.height = '280px'; Highcharts.chart(ap, renderAiMlCfg(fx, { height: 280, legend: false, lineWidth: 2 })); }
          return;
        }
        if (PG.kind === 'topn') {
          var tp = document.getElementById('plot-' + key);
          if (tp) {
            tp.style.height = '280px';
            if (view === 'packedbubble') renderTopnPackedBubble(tp, fx, { height: 280 });
            else if (view === 'treemap') renderTopnTreemap(tp, fx, { height: 280 });
            else renderTopnSolidGauge(tp, fx, { height: 280 });
          }
          return;
        }
        var cfg = baseCfg(fx);
        cfg.chart.height = 300;
        cfg.chart.animation = false;
        cfg.plotOptions.series = cfg.plotOptions.series || {};
        cfg.plotOptions.series.animation = false;
        if (PG.donutFixtures && PG.donutFixtures.indexOf(id) >= 0) {
          cfg.plotOptions.pie = cfg.plotOptions.pie || {};
          cfg.plotOptions.pie.innerSize = '70%';
        }
        try { Highcharts.chart('plot-' + id, cfg); }
        catch (e) {
          var p = document.getElementById('plot-' + id);
          if (p) p.innerHTML = '<div class="ch-na">Render failed: ' + String(e.message || e) + '</div>';
        }
      }).catch(function () {
        var p = document.getElementById('plot-' + id);
        if (p) p.innerHTML = '<div class="ch-na">Fixture failed to load</div>';
      });
    }
    var cards = [].slice.call(document.querySelectorAll('.ch-card[data-fx]'));
    if (!('IntersectionObserver' in window)) { cards.forEach(draw); }
    else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          setTimeout(function () { draw(en.target); }, 60);
        });
      }, { rootMargin: '200px 0px' });
      cards.forEach(function (c) { io.observe(c); });
    }

    // ── playground ──
    var state = JSON.parse(JSON.stringify(PG.state));
    var cfgCache = {};
    var chart = null;
    // effective chart type: the type override if set, else the fixture's own geometry
    // (spline → line, areaspline → area) — drives the product-true control visibility rules.
    function effTypeOf() {
      var t = state.type && state.type !== 'asis'
        ? state.type
        : (cfgCache[state.fixture] && cfgCache[state.fixture].config && cfgCache[state.fixture].config.chart && cfgCache[state.fixture].config.chart.type) || 'spline';
      if (t === 'areaspline' || t === 'area') return 'area';
      if (t === 'spline' || t === 'line') return 'line';
      if (t === 'column') return 'column';
      if (t === 'bar') return 'bar';
      return 'line';
    }
    // product-true conditional controls: chart-style-property.vue shows Line Width/Points only for
    // line+area types, Values only for bars, Line Style only for lines — mirror that in the panel.
    function updateControlVisibility() {
      var eff = effTypeOf();
      // gauge rows may be metro-tile-only (data-gtype) — resolve the current fixture's type
      var gtype = (cfgCache[state.fixture] && cfgCache[state.fixture].variant && cfgCache[state.fixture].variant.widgetType) || '';
      document.querySelectorAll('.ctl[data-types], .ctl[data-dep], .ctl[data-gtype]').forEach(function (row) {
        var show = true;
        var types = row.getAttribute('data-types');
        if (types && types.split(' ').indexOf(eff) < 0) show = false;
        var g = row.getAttribute('data-gtype');
        if (show && g && g !== gtype) show = false;
        var depKey = row.getAttribute('data-dep');
        if (show && depKey) {
          var depVal = row.getAttribute('data-dep-val');
          if (depVal) { if (depVal.split(' ').indexOf(String(state[depKey])) < 0) show = false; }
          else if (!state[depKey]) show = false;
        }
        row.style.display = show ? '' : 'none';
      });
    }
    // Metric Grid (ChartWithGrid in the product): the aggregators chosen in the form become grid
    // columns, one row per series — computed here from the rendered series' data.
    function renderGrid(chartInst) {
      var host = document.getElementById('play-grid');
      if (!host) return;
      var aggrs = (state.gridAggrs || []).filter(function (a) { return ['avg', 'min', 'max', 'sum'].indexOf(a) >= 0 });
      if (!state.metricGrid || !aggrs.length || !chartInst) { host.style.display = 'none'; host.innerHTML = ''; return; }
      var fmt = function (v, unit) {
        if (typeof v !== 'number' || !isFinite(v)) return '-';
        if (unit && /^percent/i.test(unit)) return (Math.round(v * 100) / 100) + '%';
        return String(Math.round(v * 100) / 100);
      };
      var rows = chartInst.series.filter(function (sr) { return sr.visible }).map(function (sr) {
        var ys = (sr.options.data || []).map(function (p) { return Array.isArray(p) ? p[1] : p && p.y })
          .filter(function (v) { return typeof v === 'number' && isFinite(v) });
        var unit = sr.options.unit || sr.userOptions.unit;
        var cells = aggrs.map(function (a) {
          var v = '-';
          if (ys.length) {
            if (a === 'avg') v = fmt(ys.reduce(function (x, y) { return x + y }, 0) / ys.length, unit);
            if (a === 'min') v = fmt(Math.min.apply(null, ys), unit);
            if (a === 'max') v = fmt(Math.max.apply(null, ys), unit);
            if (a === 'sum') v = fmt(ys.reduce(function (x, y) { return x + y }, 0), unit);
          }
          return '<td>' + v + '</td>';
        }).join('');
        return '<tr><th>' + ttEsc(sr.name) + '</th>' + cells + '</tr>';
      }).join('');
      host.style.display = '';
      host.innerHTML = '<table><thead><tr><th>Series</th>' + aggrs.map(function (a) { return '<th>' + a.toUpperCase() + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>';
    }
    function loadFixture(id) {
      if (cfgCache[id]) return Promise.resolve(cfgCache[id]);
      return fetch('./fixtures/' + id + '.json').then(function (r) { return r.json(); }).then(function (fx) {
        cfgCache[id] = fx;
        return fx;
      });
    }
    function applyState(cfg) {
      var s = state;
      cfg.chart.height = s.height;
      cfg.chart.animation = !!s.animation;
      cfg.plotOptions.series = cfg.plotOptions.series || {};
      cfg.plotOptions.series.animation = !!s.animation;
      if (s.legend === false) { cfg.legend = { enabled: false } }
      else if (cfg.legend) { cfg.legend.enabled = true }
      if (PG.kind === 'timeseries') {
        var eff = effTypeOf();
        if (s.extra > 0 && cfg.series && cfg.series.length) {
          cfg.series = cfg.series.concat(generateTimeSeries(s.extra, cfg.series[0]));
        }
        // Sorting tab (Top/Last + Count): the product sends this to the query; here it orders the
        // rendered series by mean value and keeps the first Count — same semantics on static data.
        if (s.sortCount) {
          var meanY = function (sr) {
            var ys = (sr.data || []).map(function (p) { return Array.isArray(p) ? p[1] : p && p.y }).filter(function (v) { return typeof v === 'number' });
            return ys.length ? ys.reduce(function (a, b) { return a + b }, 0) / ys.length : -Infinity;
          };
          cfg.series = cfg.series.slice().sort(function (a, b) {
            return s.sortDirection === 'asc' ? meanY(a) - meanY(b) : meanY(b) - meanY(a);
          }).slice(0, s.sortCount);
        }
        if (s.type && s.type !== 'asis') {
          cfg.series.forEach(function (sr) { sr.type = s.type });
        }
        cfg.plotOptions.series.stacking = (s.stacking && s.stacking !== 'none') ? s.stacking : null;
        if (s.type === 'bar' && cfg.xAxis && cfg.yAxis) {
          // Highcharts 'bar' draws bottom-up; keep the datetime axis horizontal like the product
          cfg.xAxis[0].type = cfg.xAxis[0].type || 'datetime';
        }
        // ── Style tab (chart-style-property.vue) ──
        cfg.plotOptions.series.lineWidth = s.lineWidth || 2;
        if (cfg.xAxis && cfg.xAxis[0]) {
          cfg.xAxis[0].labels = cfg.xAxis[0].labels || {};
          if (s.rotation) cfg.xAxis[0].labels.rotation = s.rotation;
          if (s.xAxisOn) { cfg.xAxis[0].title = cfg.xAxis[0].title || {}; cfg.xAxis[0].title.text = s.xAxisTitle || ''; }
        }
        if (cfg.yAxis) {
          var y0 = Array.isArray(cfg.yAxis) ? cfg.yAxis[0] : cfg.yAxis;
          if (s.yAxisOn && y0) { y0.title = y0.title || {}; y0.title.text = s.yAxisTitle || ''; }
          // Z-Axis Title: the product builds a SECOND, opposite axis when series carry exactly two
          // distinct units — the z title labels that axis (chart-common-options.js).
          if (s.zOn && y0 && cfg.series.length) {
            var units = [];
            cfg.series.forEach(function (sr) { if (sr.unit && units.indexOf(sr.unit) < 0) units.push(sr.unit) });
            if (units.length === 2) {
              var second = JSON.parse(JSON.stringify(y0));
              second.opposite = true;
              second.title = second.title || {}; second.title.text = s.zTitle || '';
              cfg.yAxis = [y0, second];
              cfg.series.forEach(function (sr) { sr.yAxis = sr.unit === units[1] ? 1 : 0 });
            }
          }
          // Markers tab → yAxis plotLines / plotBands (calculatePlotBendAndPlotLines, chart-helpers.js)
          var ya = Array.isArray(cfg.yAxis) ? cfg.yAxis[0] : cfg.yAxis;
          if (ya && s.markerType !== 'none' && s.markerColor && s.markerLineType) {
            if (s.markerType === 'line' && s.markerThreshold !== '') {
              ya.plotLines = (ya.plotLines || []).concat([{
                color: 'var(--severity-' + s.markerColor + ')',
                width: s.markerLineType === 'solid.bold' ? 2 : 1,
                value: Number(s.markerThreshold), zIndex: 3, dashStyle: s.markerLineType,
                label: { text: s.markerLabel || '', style: { color: 'var(--severity-' + s.markerColor + ')' } },
              }]);
            }
            if (s.markerType === 'range' && s.markerStart !== '' && s.markerEnd !== '') {
              ya.plotBands = (ya.plotBands || []).concat([{
                color: 'var(--severity-' + s.markerColor + '-lightest)',
                label: { text: s.markerLabel || '', style: { color: 'var(--severity-' + s.markerColor + ')' } },
                to: Number(s.markerStart), from: Number(s.markerEnd), zIndex: 3,
              }]);
            }
          }
        }
        if (eff === 'column' || eff === 'bar') {
          // Values: bar/column data labels — the fixture's formattedValues when present, else the
          // unit-aware value (the product formatter reads formattedValues then falls back to unit).
          cfg.plotOptions.series.dataLabels = {
            enabled: !!s.values, overflow: 'none',
            formatter: function () {
              var fv = this.series.userOptions.formattedValues;
              if (fv && fv.length > this.point.index && fv[this.point.index] != null) return fv[this.point.index];
              var u = this.series.userOptions.unit, y = this.point.y;
              if (u && /^percent/i.test(u) && typeof y === 'number') return /\\./.test(String(y)) ? parseFloat(y).toFixed(2) + '%' : parseInt(y, 10) + '%';
              return y;
            },
          };
        }
        if (eff === 'line' && s.lineStyle === 'dash') {
          cfg.plotOptions.series.dashStyle = s.dashPattern || '3, 3'; // product passes the pattern string verbatim
        }
        if (eff === 'line' || eff === 'area') {
          cfg.plotOptions.series.marker = cfg.plotOptions.series.marker || {};
          cfg.plotOptions.series.marker.enabled = !!s.points;
          cfg.plotOptions.series.marker.radius = s.pointSize || 4;
        }
      }
      if (PG.kind === 'distribution') {
        cfg.plotOptions.pie = cfg.plotOptions.pie || {};
        // geometry override: as-captured keeps the fixture's own innerSize (donut ships 70%);
        // the product has exactly two pie geometries — pie (no hole) and donut (70%).
        if (s.geometry === 'pie') cfg.plotOptions.pie.innerSize = '0%';
        else if (s.geometry === 'donut') cfg.plotOptions.pie.innerSize = '70%';
        // the product's pie data labels (chart-options.vue): "slicename: value", rotated by the
        // Rotation property — the fixture's own formatter was a «fn» and cannot survive JSON.
        cfg.plotOptions.pie.dataLabels = cfg.plotOptions.pie.dataLabels || {};
        cfg.plotOptions.pie.dataLabels.enabled = !!s.dataLabels;
        cfg.plotOptions.pie.dataLabels.rotation = s.rotation || 0;
        cfg.plotOptions.pie.dataLabels.formatter = function () {
          var fv = this.series.userOptions.formattedValues;
          var nm = String(this.point.name || '');
          if (nm.length > 50) nm = nm.slice(0, 50) + '...';
          var v = (fv && fv.length > this.point.index && fv[this.point.index] != null) ? fv[this.point.index] : this.point.y;
          return nm + ': ' + v;
        };
      }
      return cfg;
    }
    function snippetFor(id) {
      var s = state, ov = [];
      var gen = '';
      if (PG.kind === 'gauge' || PG.kind === 'heatmap') {
        return '<div id="stage" style="height:' + s.height + 'px"></div>\\n' +
          '<script>\\n' +
          '// fixture = the captured result payload (sanitised)\\n' +
          "const fx = await fetch('./fixtures/" + id + ".json').then(r => r.json())\\n" +
          '// hand-built ' + (PG.kind === 'gauge' ? 'SVG dial / metro tile (port of gauge.vue + metro-tile.vue)' : 'severity hexes (port of heatmap-single-group.vue)') + '\\n' +
          'render' + (PG.kind === 'gauge' ? 'Gauge' : 'Heatmap') + 'Into(document.getElementById(\\'stage\\'), fx)\\n' +
          '<\\/script>';
      }
      if (PG.kind === 'map') {
        var how = s.mapType === 'online'
          ? '// bubbles from geometry.coordinates, Highcharts getRadii() sizing\\nrenderMapLeaflet(stage, fx)'
          : s.mapType === 'treemap'
            ? '// Tree View: the map payload as a Highcharts treemap\\nrenderMapTreemap(stage, fx)'
            : '// world topo + mapbubble series, joinBy [iso-a2, code2]\\nrenderMapHighcharts(stage, fx)';
        return '<div id="stage" style="height:' + s.height + 'px"></div>\\n' +
          '<script src="' + (s.mapType === 'online' ? 'leaflet.js' : 'highcharts.js' + (s.mapType === 'map' ? ' + map.js' : '')) + '"><\\/script>\\n' +
          '<script>\\n' +
          "const fx = await fetch('./fixtures/" + id + ".json').then(r => r.json())\\n" + how + '\\n<\\/script>';
      }
      if (PG.kind === 'sankey') {
        return '<div id="stage" style="height:' + s.height + 'px"></div>\\n' +
          '<script src="highcharts.js + sankey.js"><\\/script>\\n' +
          '<script>\\n' +
          "const fx = await fetch('./fixtures/" + id + ".json').then(r => r.json())\\n" +
          '// the Flow result: keys [from, to, weight, rowId] + a per-link colour, like sankey-options.vue\\n' +
          'Highcharts.chart(stage, renderSankeyCfg(fx))\\n' +
          '<\\/script>';
      }
      if (PG.kind === 'aiml') {
        return '<div id="stage" style="height:' + s.height + 'px"></div>\\n' +
          '<script src="highcharts.js + highcharts-more.js"><\\/script>\\n' +
          '<script>\\n' +
          "const fx = await fetch('./fixtures/" + id + ".json').then(r => r.json())\\n" +
          '// avg actuals + anomaly/forecast series → value spline, zone-coloured outliers,\\n' +
          '// areasplinerange "Prediction Range" band, red divider at the first future interval\\n' +
          'Highcharts.chart(stage, renderAiMlCfg(fx))\\n' +
          '<\\/script>';
      }
      if (PG.kind === 'topn') {
        var what = s.viewType === 'packedbubble'
          ? '// Packed Bubble Chart: one bubble per monitor, per-bubble palette colours\\nrenderTopnPackedBubble(stage, fx)'
          : s.viewType === 'treemap'
            ? '// Tree View: the same rows as the shared treemap config\\nrenderTopnTreemap(stage, fx)'
            : '// TopN Solid Gauge View: dial per monitor, floor(min(width/180, 6, n)) columns\\nrenderTopnSolidGauge(stage, fx)';
        return '<div id="stage" style="height:' + s.height + 'px"></div>\\n' +
          '<script src="highcharts.js' + (s.viewType === 'solidgauge' ? '' : ' + treemap.js') + '"><\\/script>\\n' +
          '<script>\\n' +
          "const fx = await fetch('./fixtures/" + id + ".json').then(r => r.json())\\n" +
          what + '\\n<\\/script>';
      }
      if (PG.kind === 'timeseries') {
        if (s.extra > 0) gen = '// append ' + s.extra + ' deterministic generated series\\ncfg.series.push(...generateTimeSeries(' + s.extra + ', cfg.series[0]))\\n';
        if (s.type && s.type !== 'asis') ov.push('type: ' + JSON.stringify(s.type));
        if (s.stacking && s.stacking !== 'none') ov.push('stacking: ' + JSON.stringify(s.stacking));
        if (s.rotation) ov.push('xAxis.labels.rotation: ' + s.rotation);
        if (s.xAxisOn && s.xAxisTitle) ov.push('xAxis.title.text: ' + JSON.stringify(s.xAxisTitle));
        if (s.yAxisOn && s.yAxisTitle) ov.push('yAxis.title.text: ' + JSON.stringify(s.yAxisTitle));
        if (s.lineWidth !== 2) ov.push('series.lineWidth: ' + s.lineWidth);
        if (s.points) ov.push('series.marker: { enabled: true, radius: ' + (s.pointSize || 4) + ' }');
        if (s.lineStyle === 'dash') ov.push('series.dashStyle: ' + JSON.stringify(s.dashPattern || '3, 3'));
        if (s.values) ov.push('series.dataLabels.enabled: true');
        if (s.metricGrid) ov.push('metricGrid: ' + JSON.stringify((s.gridAggrs || []).join('+')));
        if (s.sortCount && s.sortCount !== 10) ov.push('topCount: ' + s.sortCount);
        if (s.sortDirection === 'asc') ov.push("direction: 'asc'");
      }
      if (PG.kind === 'distribution') {
        if (s.geometry === 'pie') ov.push('innerSize: "0%"');
        if (s.geometry === 'donut') ov.push('innerSize: "70%"');
        if (s.rotation) ov.push('rotation: ' + s.rotation);
        if (!s.dataLabels) ov.push('dataLabels: false');
      }
      if (s.legend === false) ov.push('legend: false');
      return '<div id="chart" style="height:' + s.height + 'px"></div>\\n' +
        '<script src="highcharts.js"><\\/script>\\n' +
        '<script>\\n' +
        '// fixture = the captured product configuration (sanitised)\\n' +
        "const cfg = (await fetch('./fixtures/" + id + ".json').then(r => r.json())).config\\n" +
        gen +
        (ov.length ? '// applied overrides\\nconst overrides = { ' + ov.join(', ') + ' }\\nHighcharts.chart(\\'chart\\', applyOverrides(cfg, overrides))\\n' : 'Highcharts.chart(\\'chart\\', cfg)\\n') +
        (gen ? '\\n// the generator — same x grid and value range as the base series, seeded PRNG\\n' + generateTimeSeries.toString() + '\\n' : '') +
        '<\\/script>';
    }
    // render serialisation: every control change bumps the sequence and only the LATEST
    // loadFixture callback may draw — rapid re-selection used to race two Highcharts
    // instances into the same container (duplicated charts / frozen tab).
    var renderSeq = 0;
    function render() {
      var seq = ++renderSeq;
      loadFixture(state.fixture).then(function (fx) {
        if (seq !== renderSeq) return; // superseded by a newer selection
        if (PG.kind === 'gauge' || PG.kind === 'heatmap') {
          var gm = document.getElementById('play-plot');
          gm.style.height = state.height + 'px';
          if (PG.kind === 'gauge') renderGaugeInto(gm, fx, true); else renderHeatmapInto(gm, fx, true);
          var gsn = document.getElementById('snippet');
          if (gsn) gsn.textContent = snippetFor(state.fixture);
          updateControlVisibility();
          renderGrid(null);
          return;
        }
        if (PG.kind === 'map') {
          var mm = document.getElementById('play-plot');
          if (chart) { try { chart.destroy(); } catch (e) {} chart = null; }
          cleanupLeaflet();
          mm.style.height = state.height + 'px';
          if (state.mapType === 'online') renderMapLeaflet(mm, fx, state);
          else if (state.mapType === 'treemap') chart = renderMapTreemap(mm, fx, state);
          else renderMapHighcharts(mm, fx, state).then(function (c) { if (c && seq === renderSeq) chart = c; });
          var msn = document.getElementById('snippet');
          if (msn) msn.textContent = snippetFor(state.fixture);
          updateControlVisibility();
          renderGrid(null);
          return;
        }
        if (PG.kind === 'sankey') {
          var sm = document.getElementById('play-plot');
          if (chart) { try { chart.destroy(); } catch (e) {} chart = null; }
          sm.style.height = state.height + 'px';
          chart = Highcharts.chart(sm, renderSankeyCfg(fx, state));
          var ssn = document.getElementById('snippet');
          if (ssn) ssn.textContent = snippetFor(state.fixture);
          updateControlVisibility();
          renderGrid(null);
          return;
        }
        if (PG.kind === 'aiml') {
          var am = document.getElementById('play-plot');
          if (chart) { try { chart.destroy(); } catch (e) {} chart = null; }
          am.style.height = state.height + 'px';
          chart = Highcharts.chart(am, renderAiMlCfg(fx, state));
          var asn = document.getElementById('snippet');
          if (asn) asn.textContent = snippetFor(state.fixture);
          updateControlVisibility();
          renderGrid(null);
          return;
        }
        if (PG.kind === 'topn') {
          var tn = document.getElementById('play-plot');
          if (chart) { try { chart.destroy(); } catch (e) {} chart = null; }
          tn.style.height = state.height + 'px';
          if (state.viewType === 'packedbubble') chart = renderTopnPackedBubble(tn, fx, state);
          else if (state.viewType === 'treemap') chart = renderTopnTreemap(tn, fx, state);
          else renderTopnSolidGauge(tn, fx, state);
          var nsn = document.getElementById('snippet');
          if (nsn) nsn.textContent = snippetFor(state.fixture);
          updateControlVisibility();
          renderGrid(null);
          return;
        }
        var cfg = applyState(baseCfg(fx));
        if (chart) { try { chart.destroy(); } catch (e) { /* already gone */ } chart = null; }
        chart = Highcharts.chart('play-plot', cfg);
        renderGrid(chart);
        updateControlVisibility(); // re-run: effTypeOf needs the loaded fixture's own geometry
        var sn = document.getElementById('snippet');
        if (sn) sn.textContent = snippetFor(state.fixture);
      }).catch(function () {
        if (seq !== renderSeq) return;
        document.getElementById('play-plot').innerHTML = '<div class="ch-na">Fixture failed to load</div>';
      });
      updateControlVisibility();
    }
    // controls → state (chart controls don't use data-attr; the element-controls binder ignores them)
    document.querySelectorAll('[data-ctl]').forEach(function (el) {
      var key = el.getAttribute('data-ctl');
      var handler = function () {
        if (el.type === 'checkbox' && el.hasAttribute('data-val')) {
          // multi-select chip group (Metric Grid aggregators): state[key] is a string array
          var arr = state[key] || [];
          var dv = el.getAttribute('data-val');
          state[key] = el.checked ? arr.concat([dv]).filter(function (x, i, a) { return a.indexOf(x) === i }) : arr.filter(function (x) { return x !== dv });
        } else {
          var v = el.type === 'checkbox' ? el.checked : el.value;
          if (el.type === 'range' || el.type === 'number' || /^\\d+$/.test(String(v))) v = Number(v);
          // clamp typed numbers, but keep '' empty (an unset marker threshold must not clamp to min)
          if (el.type === 'number' && v !== '') v = Math.max(Number(el.min || 0), Math.min(Number(el.max || 9999), v));
          if (key === 'fixture') { state.fixture = String(v); }
          else state[key] = v;
          // palette colouring needs percentage rows — the severity data set has none. Selecting
          // a palette therefore swaps in the metric (palette) data set, like picking that widget.
          if (PG.kind === 'heatmap' && key === 'colorPalette' && state.colorPalette && state.fixture === 'heatmap') {
            state.fixture = 'heatmap-palette';
            var fxSel = document.querySelector('select[data-ctl="fixture"]');
            if (fxSel) fxSel.value = state.fixture;
          }
        }
        render();
      };
      el.addEventListener(el.type === 'select-one' ? 'change' : (el.type === 'range' ? 'input' : 'change'), handler);
    });
    updateControlVisibility();
    render();
  })();`
}

/** Charts overview — the "Charts" nav landing page: one card per category, linking its sub-page. */
export function chartsOverviewPageHtml({ categories, fixtures, components, version, tokenCssHref, assetV, engineSrc, engineModules }) {
  const total = fixtures.length
  const cards = categories.map((c) => {
    const fxs = c.sections.flatMap((s) => s.fixtures)
    const n = fxs.length
    return `<a class="chcat-card" href="./charts-${esc(c.id)}.html">
      <span class="chcat-name">${esc(c.display)}<span class="chcat-count">${n} variant${n === 1 ? '' : 's'}</span></span>
      <span class="chcat-blurb">${esc(c.blurb)}</span>
      <span class="chcat-types">${fxs.slice(0, 6).map(([, l]) => esc(l)).join(' · ')}${n > 6 ? ' · …' : ''}</span>
    </a>`
  }).join('')
  const engineTags = engineSrc
    ? [`<script src="${engineSrc}"></script>`, ...(engineModules || []).map((m) => `<script src="${m}"></script>`)].join('\n')
    : ''
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Charts — ObserveOps Elements</title>
${FAVICON}<link rel="stylesheet" href="${tokenCssHref}" /><link rel="stylesheet" href="./app.css?v=${assetV}" />
<style>
${CHART_CSS}
.ch-head { padding: 22px 28px 8px; }
.ch-head h1 { margin: 0 0 4px; font-size: 22px; }
.ch-head p { margin: 0 0 6px; font-size: 13px; max-width: 78ch; }
.chcat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; padding: 16px 28px 40px; }
.chcat-card { display: flex; flex-direction: column; gap: 6px; padding: 16px 18px; border: 1px solid var(--border-color);
  border-radius: 10px; background: var(--page-background-color); text-decoration: none; color: inherit; }
.chcat-card:hover { border-color: var(--primary-alt); }
.chcat-name { font-size: 15px; font-weight: 600; display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
.chcat-count { font-size: 11px; color: var(--neutral-light); font-weight: 500; }
.chcat-blurb { font-size: 12.5px; color: var(--neutral-regular, #516381); }
.chcat-types { font-size: 11.5px; color: var(--neutral-light); }
</style>
</head>
<body>
<div class="layout no-panel">
  ${navHtml(components, 'charts', version)}
  <main class="canvas">
    <div class="ch-head">
      <h1>Charts</h1>
      <p>Every chart variant in the product — ${total} captured configurations across ${categories.length} categories, rendered
      through the same engine and palette the product uses. Each category page follows the standard component-page
      pattern: a live playground with controls, and every captured variant under Examples.</p>
    </div>
    <div class="ch-note">
      <b>What these pages prove and what they don't.</b> The configurations are captured from the product's own chart
      builder and fed in verbatim, so geometry, axes, palette, stacking and legend match the product. Two known gaps:
      <b>formatter functions cannot be serialised</b>, so tooltips and axis labels fall back to engine defaults; and the
      fixtures were captured in the product's <b>dark</b> theme, so the light theme needs its own capture.
    </div>
    ${engineSrc ? '' : `<div class="ch-missing"><b>Charting engine not found locally.</b> The engine is a peer dependency and is deliberately never committed to this repository. Install it in <code>components-lib</code> to render these pages.</div>`}
    <div class="chcat-grid">${cards}</div>
  </main>
</div>
<script src="./app.js?v=${assetV}"></script>
</body></html>`
}

/** One chart category page — the standard component-page chrome with a live chart playground. */
export function chartCategoryPageHtml({ cat, fixtures, components, version, tokenCssHref, assetV, bundleSrc, engineSrc, engineModules, mapTopo, leaflet, prev, next }) {
  const byId = Object.fromEntries(fixtures.map((f) => [f.id, f]))
  // one fixture can back several view cards (Top N's three views, the Leaflet map example) —
  // the fixture PICKER lists each payload once, while the Examples grid shows every view.
  const allFixtures = cat.sections.flatMap((s) => s.fixtures).filter(([id], i, a) => a.findIndex(([x]) => x === id) === i)
  const engineOk = (id) => { const f = byId[id]; return f && f.engine === 'highcharts' && f.hasConfig }
  // hand-built families (gauge today; heatmap/sankey/map follow) render from their captured
  // result payload — no engine config, but fully playable.
  const playable = (id) => engineOk(id) || CUSTOM_RENDERER_KINDS.has(cat.kind)
  // playground primary = first engine-rendered fixture; categories with none (custom-SVG/DOM
  // families) show an honest notice instead of an empty engine shell
  const primary = allFixtures.find(([id]) => playable(id)) || allFixtures[0]
  const anyEngine = !!allFixtures.find(([id]) => playable(id))
  const donutFixtures = allFixtures.filter(([, l]) => /donut/i.test(l)).map(([id]) => id)

  const controls = []
  // every helper takes a trailing `extra` string of extra attributes for the .ctl row — used for
  // conditional visibility (data-types / data-dep / data-dep-val), see updateControlVisibility.
  const ctlSel = (label, key, opts, val, extra = '') =>
    `<div class="ctl"${extra}><span class="ctl-label">${label}</span><span class="ctl-widget"><select class="ctl-select" name="${key}" data-ctl="${key}">${opts.map(([v, t]) => `<option value="${esc(v)}"${String(val) === String(v) ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></span></div>`
  const ctlTog = (label, key, on, extra = '') =>
    `<div class="ctl"${extra}><span class="ctl-label">${label}</span><span class="ctl-widget"><label class="ctl-toggle"><input type="checkbox" name="${key}" data-ctl="${key}"${on ? ' checked' : ''} /><span class="ctl-track"></span></label></span></div>`
  const ctlRange = (label, key, min, max, val, step, extra = '') =>
    `<div class="ctl"${extra}><span class="ctl-label">${label}</span><span class="ctl-widget"><input type="range" name="${key}" min="${min}" max="${max}" step="${step || 1}" value="${val}" data-ctl="${key}" style="width:130px" /></span></div>`
  // a NUMBER input (not a slider): the value is visible in the box itself, so the control reads
  // as "type how many series you want" — sliders for this were too easy to miss in the panel.
  const ctlNum = (label, key, min, max, val, extra = '') =>
    `<div class="ctl"${extra}><span class="ctl-label">${label}</span><span class="ctl-widget"><input class="ctl-input" type="number" name="${key}" min="${min}" max="${max}" step="1" value="${val}" data-ctl="${key}" style="width:76px;text-align:right" /></span></div>`
  const ctlText = (label, key, val, extra = '') =>
    `<div class="ctl"${extra}><span class="ctl-label">${label}</span><span class="ctl-widget"><input class="ctl-input" type="text" name="${key}" value="${esc(val == null ? '' : val)}" data-ctl="${key}" placeholder="Enter Text" style="width:150px" /></span></div>`
  // a group of toggleable chips (multi-select) — value collected under one state key as an array
  const ctlChecks = (label, key, opts, vals) =>
    `<div class="ctl"><span class="ctl-label">${label}</span><span class="ctl-widget">${opts.map(([v, t]) => `<label class="ctl-check"><input type="checkbox" name="${key}" data-ctl="${key}" data-val="${esc(v)}"${vals.includes(v) ? ' checked' : ''} /><span>${esc(t)}</span></label>`).join('')}</span></div>`
  const ctlDiv = (t) => `<div class="ctl ctl-h"><span class="ctl-label" style="font-weight:600">${t}</span></div>`
  // visibility metadata: data-types="line area" → only those effective chart types;
  // data-dep="points" (truthy) or data-dep="markerType" data-dep-val="line range" (any-of).
  const dep = (key, val) => val === undefined ? `data-dep="${key}"` : `data-dep="${key}" data-dep-val="${esc(val)}"`

  // fixture picker lists this category's variants
  controls.push(ctlSel('Fixture', 'fixture', allFixtures.map(([id, l]) => [id, l + (playable(id) ? '' : ' (no engine)')]), primary[0]))
  if (cat.kind === 'timeseries') {
    // the product surface = WidgetPropertyForm → ChartProperty (chart-style/sorting/marker
    // property tabs). Query-side knobs (Granularity, Timeline Preference) are dashboard-fed and
    // have no observable effect on a static fixture, so they are noted in the panel instead.
    controls.push(ctlNum('Series count', 'extra', 0, 16, 0))
    controls.push(ctlSel('Chart type', 'type', [['asis', 'As captured'], ['line', 'Line'], ['area', 'Area'], ['column', 'Vertical bar'], ['bar', 'Horizontal bar']], 'asis'))
    controls.push(ctlSel('Stacking', 'stacking', [['none', 'None'], ['normal', 'Normal'], ['percent', 'Percent']], 'none'))
    controls.push(ctlDiv('Style'))
    controls.push(ctlNum('Rotation', 'rotation', -360, 360, 0))
    controls.push(ctlTog('X-Axis Title', 'xAxisOn', false))
    controls.push(ctlText('X-Axis Title', 'xAxisTitle', '', ` ${dep('xAxisOn')}`))
    controls.push(ctlTog('Y-Axis Title', 'yAxisOn', false))
    controls.push(ctlText('Y-Axis Title', 'yAxisTitle', '', ` ${dep('yAxisOn')}`))
    controls.push(ctlTog('Z-Axis Title', 'zOn', false))
    controls.push(ctlText('Z-Axis Title', 'zTitle', '', ` ${dep('zOn')}`))
    controls.push(ctlTog('Values', 'values', false, 'data-types="column bar"'))
    controls.push(ctlRange('Line Width', 'lineWidth', 1, 5, 2, 1, 'data-types="line area"'))
    controls.push(ctlTog('Points', 'points', false, 'data-types="line area"'))
    controls.push(ctlRange('Point Size', 'pointSize', 1, 10, 4, 1, 'data-types="line area" data-dep="points"'))
    controls.push(ctlSel('Line Style', 'lineStyle', [['solid', 'Solid'], ['dash', 'Dash']], 'solid', 'data-types="line"'))
    controls.push(ctlSel('Dash Pattern', 'dashPattern', [['3, 3', '3, 3'], ['3, 6', '3, 6'], ['6, 3', '6, 3'], ['2, 4', '2, 4'], ['2, 2', '2, 2'], ['4, 2', '4, 2'], ['4, 6', '4, 6'], ['4, 4', '4, 4']], '3, 3', 'data-types="line" data-dep="lineStyle" data-dep-val="dash"'))
    controls.push(ctlTog('Metric Grid', 'metricGrid', false))
    controls.push(ctlChecks('Aggregators', 'gridAggrs', [['avg', 'Avg'], ['min', 'Min'], ['max', 'Max'], ['sum', 'Sum']], ['avg', 'sum', 'min', 'max']))
    controls.push(ctlDiv('Sorting'))
    controls.push(ctlSel('Direction', 'sortDirection', [['desc', 'Top'], ['asc', 'Last']], 'desc'))
    controls.push(ctlNum('Count', 'sortCount', 1, 50, 10))
    controls.push(ctlDiv('Marker'))
    controls.push(ctlSel('Marker Type', 'markerType', [['none', 'None'], ['line', 'Line'], ['range', 'Range']], 'none'))
    controls.push(ctlNum('Threshold', 'markerThreshold', -99999, 99999, '', ` ${dep('markerType', 'line')}`))
    controls.push(ctlNum('Start', 'markerStart', -99999, 99999, '', ` ${dep('markerType', 'range')}`))
    controls.push(ctlNum('End', 'markerEnd', -99999, 99999, '', ` ${dep('markerType', 'range')}`))
    controls.push(ctlSel('Marker Color', 'markerColor', [['clear', 'Green/Clear'], ['major', 'Orange/Major'], ['warning', 'Yellow/Warning'], ['critical', 'Red/Critical']], 'clear', ` ${dep('markerType', 'line range')}`))
    controls.push(ctlSel('Marker Line Type', 'markerLineType', [['dash', 'Dash'], ['solid', 'Solid'], ['solid.bold', 'Solid Bold']], 'dash', ` ${dep('markerType', 'line range')}`))
    controls.push(ctlText('Marker Label', 'markerLabel', '', ` ${dep('markerType', 'line range')}`))
  }
  if (cat.kind === 'distribution') {
    // the product's pie surface (chart-style-property.vue for widgetType Pie): Rotation,
    // Legend, Data Labels. Geometry switches pie ↔ donut (the product's donut innerSize is 70%).
    controls.push(ctlSel('Geometry', 'geometry', [['asis', 'As captured'], ['pie', 'Pie'], ['donut', 'Donut (70%)']], 'asis'))
    controls.push(ctlNum('Rotation', 'rotation', -360, 360, 0))
    controls.push(ctlTog('Data labels', 'dataLabels', true))
  }
  if (cat.kind === 'gauge') {
    // the product surface = GaugeProperty (metric groups). The MetroTile/SolidGauge type picker
    // is the Fixture control; Icon/Icon Position/Text Align/Trend Background are metro-tile-only
    // (data-gtype); the Threshold tab drives the colour via the first matching condition.
    controls.push(ctlSel('Font Size', 'fontSize', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']], 'medium'))
    controls.push(ctlSel('Text Align', 'textAlign', [['left', 'Left'], ['center', 'Center'], ['right', 'Right']], 'center', 'data-gtype="MetroTile"'))
    controls.push(ctlSel('Icon', 'iconName', [['', 'None'], ['check', 'Check'], ['server', 'Server'], ['cpu', 'CPU'], ['database', 'Database'], ['heartbeat', 'Heartbeat']], '', 'data-gtype="MetroTile"'))
    controls.push(ctlSel('Icon Position', 'iconPosition', [['prefix', 'Prefix'], ['suffix', 'Suffix']], 'prefix', 'data-gtype="MetroTile"'))
    controls.push(ctlTog('Trend Background', 'trendBg', false, 'data-gtype="MetroTile"'))
    controls.push(ctlSel('Trend Color', 'trendColor', [['var(--secondary-orange)', 'Orange (default)'], ['var(--chart-vivid-teal)', 'Teal'], ['var(--secondary-red)', 'Red'], ['var(--secondary-green)', 'Green']], 'var(--secondary-orange)', 'data-gtype="MetroTile" data-dep="trendBg"'))
    controls.push(ctlDiv('Threshold'))
    const sevOps = [['', '—'], ['>', '>'], ['>=', '≥'], ['<', '<'], ['<=', '≤'], ['=', '='], ['!=', '≠']]
    const sevColors = [['var(--secondary-red)', 'Red'], ['var(--secondary-orange)', 'Orange'], ['var(--secondary-yellow)', 'Yellow'], ['var(--secondary-green)', 'Green'], ['var(--primary)', 'Navy'], ['#c84235', 'Anomaly red']]
    controls.push(ctlSel('Critical', 'critOp', sevOps, ''))
    controls.push(ctlNum('Critical Value', 'critVal', 0, 1000000, ''))
    controls.push(ctlSel('Critical Color', 'critColor', sevColors, 'var(--secondary-red)'))
    controls.push(ctlSel('Major', 'majorOp', sevOps, ''))
    controls.push(ctlNum('Major Value', 'majorVal', 0, 1000000, ''))
    controls.push(ctlSel('Major Color', 'majorColor', sevColors, 'var(--secondary-orange)'))
    controls.push(ctlSel('Warning', 'warnOp', sevOps, ''))
    controls.push(ctlNum('Warning Value', 'warnVal', 0, 1000000, ''))
    controls.push(ctlSel('Warning Color', 'warnColor', sevColors, 'var(--secondary-yellow)'))
  }
  if (cat.kind === 'heatmap') {
    // the product surface = MapProperty for the HeatMap category: Show Counts + Select Color
    // Palette (severity hexes take the palette only when rows carry a percentage — this
    // severity fixture falls back to severity colours, like the product's alert heatmaps).
    controls.push(ctlTog('Show Counts', 'showCounts', false))
    controls.push(ctlSel('Color Palette', 'colorPalette', [['', 'As captured'], ...Object.entries(HM_PALETTES_SELECT).map(([k, v]) => [k, v])], ''))
  }
  if (cat.kind === 'map') {
    // the product surface = MapProperty for the Map category: exactly three types — the
    // Highcharts country map, the treemap, and the Online Map (Leaflet).
    controls.push(ctlSel('Map type', 'mapType', [['map', 'Map (Highcharts)'], ['treemap', 'Tree View'], ['online', 'Online Map (Leaflet)']], 'map'))
  }
  if (cat.kind === 'topn') {
    // the product surface = topn-property.vue Style tab for the non-chart types (the chart types
    // live on the Time Series page) + the Sorting tab: Top/Last direction and topCount reorder
    // and slice the per-monitor rows, exactly like the product's result builder.
    controls.push(ctlSel('View', 'viewType', [['solidgauge', 'Solid Gauge Grid'], ['packedbubble', 'Packed Bubble'], ['treemap', 'Tree View']], 'solidgauge'))
    controls.push(ctlDiv('Sorting'))
    controls.push(ctlSel('Direction', 'sortDirection', [['desc', 'Top'], ['asc', 'Last']], 'desc'))
    controls.push(ctlNum('Count', 'sortCount', 1, 50, 10))
  }
  if (cat.kind === 'aiml') {
    // the AI/ML surface (ChartProperty with isAiMlWidget): NO chart-type picker, no z-axis,
    // no metric grid, no sorting — but Markers, and the style basics. Legend defaults OFF
    // (the product's default for this category).
    controls.push(ctlNum('Rotation', 'rotation', -360, 360, 0))
    controls.push(ctlTog('Legend', 'legend', false))
    controls.push(ctlTog('X-Axis Title', 'xAxisOn', false))
    controls.push(ctlText('X-Axis Title', 'xAxisTitle', '', ` ${dep('xAxisOn')}`))
    controls.push(ctlTog('Y-Axis Title', 'yAxisOn', false))
    controls.push(ctlText('Y-Axis Title', 'yAxisTitle', '', ` ${dep('yAxisOn')}`))
    controls.push(ctlRange('Line Width', 'lineWidth', 1, 5, 2, 1))
    controls.push(ctlTog('Points', 'points', false))
    controls.push(ctlRange('Point Size', 'pointSize', 1, 10, 4, 1, 'data-dep="points"'))
    controls.push(ctlDiv('Marker'))
    controls.push(ctlSel('Marker Type', 'markerType', [['none', 'None'], ['line', 'Line'], ['range', 'Range']], 'none'))
    controls.push(ctlNum('Threshold', 'markerThreshold', -99999, 99999, '', ` ${dep('markerType', 'line')}`))
    controls.push(ctlNum('Start', 'markerStart', -99999, 99999, '', ` ${dep('markerType', 'range')}`))
    controls.push(ctlNum('End', 'markerEnd', -99999, 99999, '', ` ${dep('markerType', 'range')}`))
    controls.push(ctlSel('Marker Color', 'markerColor', [['clear', 'Green/Clear'], ['major', 'Orange/Major'], ['warning', 'Yellow/Warning'], ['critical', 'Red/Critical']], 'clear', ` ${dep('markerType', 'line range')}`))
    controls.push(ctlSel('Marker Line Type', 'markerLineType', [['dash', 'Dash'], ['solid', 'Solid'], ['solid.bold', 'Solid Bold']], 'dash', ` ${dep('markerType', 'line range')}`))
    controls.push(ctlText('Marker Label', 'markerLabel', '', ` ${dep('markerType', 'line range')}`))
  }
  if (cat.kind !== 'gauge' && cat.kind !== 'heatmap' && cat.kind !== 'map' && cat.kind !== 'aiml' && cat.kind !== 'topn') controls.push(ctlTog('Legend', 'legend', true))
  controls.push(ctlTog('Animation', 'animation', false))
  controls.push(ctlRange('Height', 'height', 240, 640, 380, 20))

  // state defaults mirror the product's getWidgetProperties defaults (helper.js) where one exists
  // (direction desc, topCount 10, lineWidth 2, pointSize 4, dashPattern '3, 3', all 4 grid
  // aggregators); legend/data-labels default to the captured fixture because this is a fixture
  // playground, not a fresh builder.
  const state = {
    fixture: primary[0], extra: 0, type: 'asis', stacking: 'none', geometry: 'asis', rotation: 0,
    dataLabels: true, legend: true, animation: false, height: 380,
    xAxisOn: false, xAxisTitle: '', yAxisOn: false, yAxisTitle: '', zOn: false, zTitle: '',
    values: false, lineWidth: 2, points: false, pointSize: 4, lineStyle: 'solid', dashPattern: '3, 3',
    metricGrid: false, gridAggrs: ['avg', 'sum', 'min', 'max'],
    sortDirection: 'desc', sortCount: 10,
    markerType: 'none', markerThreshold: '', markerStart: '', markerEnd: '',
    markerColor: 'clear', markerLineType: 'dash', markerLabel: '',
    fontSize: 'medium', textAlign: 'center', iconName: '', iconPosition: 'prefix',
    trendBg: false, trendColor: 'var(--secondary-orange)',
    critOp: '', critVal: '', critColor: 'var(--secondary-red)',
    majorOp: '', majorVal: '', majorColor: 'var(--secondary-orange)',
    warnOp: '', warnVal: '', warnColor: 'var(--secondary-yellow)',
    showCounts: false, colorPalette: '', mapType: 'map', viewType: 'solidgauge',
  }

  // "Pie chart"/"Top N Views" already name their kind — don't double the word in the heading.
  const headTitle = /chart|views/i.test(cat.display) ? cat.display : cat.display + ' Charts'
  const panelTitle = /chart|views/i.test(cat.display) ? cat.display : cat.display + ' charts'

  const exampleSections = cat.sections.map((sec) => `
    <div class="ch-sec">${esc(sec.title)} — ${sec.fixtures.length} variant${sec.fixtures.length === 1 ? '' : 's'}</div>
    <div class="ch-grid">${sec.fixtures.map(([id, l, view]) => chartCard(id, l, byId[id], cat.kind, view)).join('')}</div>`).join('')

  const engineTags = engineSrc
    ? [`<script src="${engineSrc}"></script>`, ...(engineModules || []).map((m) => `<script src="${m}"></script>`)].join('\n')
    : ''

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(headTitle)} — ObserveOps Elements</title>
${FAVICON}<link rel="stylesheet" href="${tokenCssHref}" /><link rel="stylesheet" href="./app.css?v=${assetV}" />
<style>
${CHART_CSS}
.ch-prov { font-size: 12px; color: var(--neutral-light); padding: 10px 0 4px; line-height: 1.5; }
</style>
</head>
<body>
<div class="layout">
  ${navHtml(components, 'charts-' + cat.id, version)}
  <main class="canvas">
    <div class="topbar">
      <div class="tb-left">
        <div class="view-toggle" role="tablist">
          <button class="vt-btn active" data-view="playground">Playground</button>
          <button class="vt-btn" data-view="examples">Examples</button>
        </div>
        <label class="inspect-sw" title="Measure: hover the chart area to see its size">
          <span class="ctl-toggle"><input type="checkbox" id="inspect-toggle" /><span class="ctl-track"></span></span>
          <span>Inspect</span>
        </label>
      </div>
      <div class="tb-tools">
        <div class="zoom">
          <button id="zoom-out" class="tb-icon" title="Zoom out">−</button>
          <button id="zoom-reset" class="tb-zoomval" title="Reset zoom"><span id="zoom-val">100%</span></button>
          <button id="zoom-in" class="tb-icon" title="Zoom in">+</button>
        </div>
        <button id="fullscreen-btn" class="tb-icon" title="View fullscreen">⛶</button>
        <div class="nav-arrows">
          ${prev ? `<a data-nav="prev" href="./${prev.id}.html" title="Previous: ${esc(prev.display)}">←</a>` : '<span class="dim" aria-disabled="true" title="No previous category">←</span>'}
          ${next ? `<a data-nav="next" href="./${next.id}.html" title="Next: ${esc(next.display)}">→</a>` : '<span class="dim" aria-disabled="true" title="No next category">→</span>'}
        </div>
      </div>
    </div>
    <div class="view view-playground active">
      <div class="stage">
        <button class="stage-close" id="stage-close" title="Exit fullscreen (Esc)" aria-label="Exit fullscreen">×</button>
        <div class="inspect-layer" id="inspect-layer" aria-hidden="true"></div>
        <div class="stage-inner" id="live-wrap">${anyEngine
          ? '<div id="play-plot" class="play-plot"></div><div id="play-grid" class="play-grid" style="display:none"></div>'
          : `<div class="ch-na" style="min-height:320px;display:flex;align-items:center;justify-content:center">None of the ${cat.display.toLowerCase()} fixtures are engine-rendered — these families render as custom SVG / DOM in the product and need hand-built components. The fixtures hold the captured result payloads for building and diffing them.</div>`}</div>
      </div>
      <div class="snippet">
        <div class="snippet-head"><code>highcharts</code><button class="copy" id="copy-btn">Copy snippet</button></div>
        <pre><code id="snippet"></code></pre>
      </div>
    </div>
    <div class="view view-examples">${exampleSections}</div>
  </main>
  <aside class="panel">
    <div class="panel-resizer" id="panel-resizer" role="separator" aria-orientation="vertical" aria-label="Resize panel" title="Drag to resize the panel" tabindex="0">
      <span class="panel-grip" aria-hidden="true"><svg width="7" height="18" viewBox="0 0 7 18"><circle cx="2" cy="3" r="1.1"/><circle cx="5" cy="3" r="1.1"/><circle cx="2" cy="9" r="1.1"/><circle cx="5" cy="9" r="1.1"/><circle cx="2" cy="15" r="1.1"/><circle cx="5" cy="15" r="1.1"/></svg></span>
    </div>
    <div class="panel-head">
      <div class="panel-title"><h1>${esc(panelTitle)}</h1></div>
      <p class="summary">${esc(cat.blurb)}</p>
    </div>
    ${anyEngine ? `<div class="controls">
      <div class="ctl ctl-h"><span class="ctl-label" style="font-weight:600">Playground Controls</span></div>
      ${controls.join('')}
    </div>` : ''}
    <p class="ch-prov">Configurations are captured from the product's widget builder (sanitised — no host, metric or
    entity names survive) and rendered verbatim through the product's charting engine, so palette, geometry and
    stacking match. The <b>tooltip is a port of the product's TooltipBuilder</b>: bold datetime header, one row per
    series (colour swatch · name · bold value), reading the product's own formatted display strings when a fixture
    carries them. Axis-label formatters remain engine defaults; fixtures are dark-theme captures.</p>
  </aside>
</div>
<script>window.__PAGE__ = { el: 'highcharts', events: [] };</script>
${engineTags}
${cat.kind === 'map' && leaflet ? `<link rel="stylesheet" href="${leaflet.css}" />\n<script src="${leaflet.js}"></script>` : ''}
${bundleSrc ? `<script type="module" src="${bundleSrc}"></script>` : ''}
<script src="./app.js?v=${assetV}"></script>
<script>${chartPageJs({ cat: cat.id, kind: cat.kind, state, donutFixtures, mapTopo, leafletOk: !!(leaflet) })}</script>
</body></html>`
}
