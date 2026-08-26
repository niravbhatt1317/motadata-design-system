// Page templates — assemble the 3-column dimsum-style page from registry + manifest. Pure strings.
import { esc } from './escape.mjs'
import { elMarkup, snippet, attrString } from './snippet.mjs'
import { controlsPanel } from './controls.mjs'
import { propsTable, usageTab, a11yTab, changelogTab, knownIssuesTab, variantInfo } from './render-registry.mjs'

// the nav brand — set to the Motadata logo mark by generate.mjs; falls back to the wordmark if unset.
let BRAND_HTML = ''
export function setBrandHtml(h) { BRAND_HTML = h || '' }

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
  const heading = (kind, name, body) =>
    `<div class="${kind}" data-grp="${esc(name)}"><button class="${kind}-h" type="button" aria-expanded="true"><span>${esc(name)}</span>${CHEV}</button><div class="${kind}-body">${body}</div></div>`
  const items = tree.map((sec) => {
    let body = sec.items.map(itemHtml).join('')
    body += sec.subs.map((sub) => heading('nav-sub', sub.name, sub.items.map(itemHtml).join(''))).join('')
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
<link rel="stylesheet" href="${tokenCssHref}" />
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
<link rel="stylesheet" href="${tokenCssHref}" /><link rel="stylesheet" href="./app.css?v=${assetV}" />
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
<link rel="stylesheet" href="${tokenCssHref}" /><link rel="stylesheet" href="./app.css?v=${assetV}" />
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
<link rel="stylesheet" href="${tokenCssHref}" /><link rel="stylesheet" href="./app.css?v=${assetV}" />
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
<link rel="stylesheet" href="${tokenCssHref}" /><link rel="stylesheet" href="./app.css?v=${assetV}" />
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
