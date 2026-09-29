// Showcase manifest for <obs-tabs> — the product's in-page tabbed navigation (MTab + MTabPane, line style).
// Content is provided per tab as a named slot: <div slot="<key>">…</div>. Only the active pane shows.
const J = (v) => JSON.stringify(v)
const pad = 'padding:16px 4px;color:var(--page-text-color)'
// build the slotted content divs for a tab set (first tab shown by default)
const panes = (tabs, bodies) => tabs.map((t) => `<div slot="${t.key}" style="${pad}">${bodies[t.key] || (t.label + ' content.')}</div>`).join('')
const tabsEl = (tabs, bodies, attrs = '') =>
  `<obs-tabs tabs='${J(tabs)}' ${attrs}>${panes(tabs, bodies)}</obs-tabs>`

const SECTIONS = [
  { key: 'overview', label: 'Overview' }, { key: 'performance', label: 'Performance' },
  { key: 'logs', label: 'Logs' }, { key: 'config', label: 'Configuration' },
]
const SEC_BODY = {
  overview: 'Overview content for the selected monitor.', performance: 'Performance metrics and charts.',
  logs: 'Recent log lines.', config: 'Configuration details.',
}
const COUNTS = [
  { key: 'alerts', label: 'Alerts', count: 12 }, { key: 'logs', label: 'Logs', count: 5 },
  { key: 'metrics', label: 'Metrics', count: 0 },
]
const COUNT_BODY = { alerts: '12 correlated alerts.', logs: '5 correlated logs.', metrics: 'No correlated metrics.' }
const ICONS = [
  { key: 'list', label: 'List', icon: 'list' }, { key: 'grid', label: 'Grid', icon: 'thLarge' },
  { key: 'map', label: 'Topology', icon: 'sitemap' },
]
const ICON_BODY = { list: 'List view.', grid: 'Grid view.', map: 'Topology view.' }
const DYNAMIC = [
  { key: 'attributes', label: 'Attributes' }, { key: 'metric', label: 'Metric' }, { key: 'style', label: 'Style' },
  { key: 'sorting', label: 'Sorting' }, { key: 'column', label: 'Column Setting' },
]
const DYNAMIC_BODY = Object.fromEntries(DYNAMIC.map((t) => [t.key, `Editing <strong>${t.label}</strong>.`]))
// the product inventory categories — far more tabs than fit a narrow container, so the overflow fade shows
const OVERFLOW = ['Inventory', 'Network', 'SDN', 'Server & Apps', 'Storage', 'Virtualization', 'HCI', 'Database', 'Container Orchestration', 'Cloud', 'Interface', 'WAN Link', 'Process', 'Container', 'Service', 'Service Check', 'Other']
  .map((label) => ({ key: label.toLowerCase().replace(/[^a-z]+/g, '-'), label }))
const OVERFLOW_BODY = Object.fromEntries(OVERFLOW.map((t) => [t.key, `<strong>${t.label}</strong> inventory.`]))

const block = (label, inner) => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div>${inner}</div>` })

export default {
  el: 'obs-tabs',
  display: 'Tabs',
  registry: 'tabs',
  // Playground: switch the class-based variant and the tab dataset (plain sections / count labels / icon labels).
  controls: [
    { prop: 'variant', type: 'select', options: ['line', 'no-border', 'sticky', 'grey'] },
    { label: 'Tabs', slotPresets: [
      { label: 'Sections', attrs: { tabs: J(SECTIONS) }, html: panes(SECTIONS, SEC_BODY) },
      { label: 'With counts', attrs: { tabs: J(COUNTS) }, html: panes(COUNTS, COUNT_BODY) },
      { label: 'With icons', attrs: { tabs: J(ICONS) }, html: panes(ICONS, ICON_BODY) },
      { label: 'Dynamic (config array)', attrs: { tabs: J(DYNAMIC) }, html: panes(DYNAMIC, DYNAMIC_BODY) },
    ] },
    { prop: 'persist-key', type: 'text', attr: 'persist-key', label: 'Persist key (localStorage)' },
    { prop: 'closable', type: 'toggle', label: 'Closable (× per tab, when >1)' },
    { prop: 'addable', type: 'toggle', label: 'Addable (+ at right)' },
  ],
  // attrs drive the copy-snippet — use the comma-list `tabs` form (no inner quotes → a clean, copyable snippet;
  // JSON works too, see gallery). `live` renders the full JSON + named-slot demo.
  playground: { attrs: { tabs: 'Overview,Performance,Logs,Configuration', value: 'Overview' }, text: '', live: tabsEl(SECTIONS, SEC_BODY, 'value="overview"') },
  gallery: [
    { group: 'Line (default) — active tab is --primary (navy text + 4px underline, weight 500); inactive --tabs-text-color; bar has a --border-color bottom rule', items: [
      block('the base tab strip', tabsEl(SECTIONS, SEC_BODY, 'value="overview"')),
    ] },
    { group: 'no-border — the most common real variant (21×): drops the tab bar bottom rule (for tabs sitting on a card/panel that already has edges)', items: [
      block('variant="no-border"', tabsEl(SECTIONS.slice(0, 3), SEC_BODY, 'variant="no-border" value="overview"')),
    ] },
    { group: 'sticky — the bar pins to the top of a scroll container (position:sticky) so tabs stay in view as the pane scrolls', items: [
      { html: `<div style="height:200px;overflow:auto;border:1px solid var(--border-color,#e3e8f2);border-radius:6px">
        <obs-tabs tabs='${J([{ key: 'overview', label: 'Overview' }, { key: 'metrics', label: 'Metrics' }])}' variant="sticky" value="overview">
          <div slot="overview" style="${pad}">${Array.from({ length: 10 }, (_, n) => `<p style="margin:0 0 12px">Scrollable row ${n + 1} — the tab bar stays pinned as this panel scrolls.</p>`).join('')}</div>
          <div slot="metrics" style="${pad}">Metrics content.</div>
        </obs-tabs></div>` },
    ] },
    { group: 'grey — tinted tab bar (--neutral-lightest) for tabs on a plain background', items: [
      block('variant="grey"', tabsEl(SECTIONS.slice(0, 3), SEC_BODY, 'variant="grey" value="overview"')),
    ] },
    { group: 'With counts — the count is appended to the label as "Label (N)" (correlated Alerts / Logs / Metrics); not a separate badge', items: [
      block('tabs = [{ label, count }]', tabsEl(COUNTS, COUNT_BODY, 'value="alerts"')),
    ] },
    { group: 'With icons — a leading product icon per tab via the tab’s icon field (reuses obs-icon)', items: [
      block('tabs = [{ label, icon }]', tabsEl(ICONS, ICON_BODY, 'value="list"')),
    ] },
    { group: 'Dynamic — the data-driven form: obs-tabs is built from a config array, so a tab set is just data (e.g. the widget editor: Attributes / Metric / Style / Sorting / Column Setting). Add/remove a tab by changing the array', items: [
      block("tabs='[{key,label},…]' (a config array)", tabsEl(DYNAMIC, DYNAMIC_BODY, 'value="attributes"')),
    ] },
    { group: 'Persisted — set persist-key and the active tab is remembered in localStorage (`<key>-tab`); it survives reload / navigation. Switch tabs below, then reload the page — the last tab is restored', items: [
      block('persist-key="ds-demo"', tabsEl(SECTIONS.slice(0, 3), SEC_BODY, 'persist-key="ds-demo"')),
    ] },
    { group: 'Overflow (scrollable) — many tabs in a narrow container: when the strip is wider than its box it scrolls horizontally (native wheel/trackpad/drag; scrollbar hidden) and a white→transparent FADE gradient appears on each edge that can scroll further (left hides at the start, right at the end). No chevron buttons — the fade is the sole hint. The active tab is auto-scrolled into view. Automatic — no prop needed. The 1px bottom rule spans the full width (fixed container), never scrolling away', items: [
      block('~17 tabs in a 600px box → edge fade appears', `<div style="width:600px;max-width:100%">${tabsEl(OVERFLOW, OVERFLOW_BODY, `value="${OVERFLOW[0].key}"`)}</div>`),
    ] },
    { group: 'Inset (--tabs-inset) — pads the tab GROUP while the 1px bottom rule ALWAYS spans full width. Default is 8px. Set --tabs-inset:0 for a flush edge-to-edge strip, or a larger value (e.g. 20px) to align the tabs with a page content gutter. The two rows below share the same tabs — only the inset differs (note the rule stays full-width in both)', items: [
      block('default (--tabs-inset: 8px) — the tab group sits 8px in; rule full-width', tabsEl(SECTIONS.slice(0, 5), SEC_BODY, `value="overview"`)),
      block('--tabs-inset: 0 — flush edge-to-edge (first tab hard against the left)', `<div style="--tabs-inset:0">${tabsEl(SECTIONS.slice(0, 5), SEC_BODY, `value="overview"`)}</div>`),
      block('--tabs-inset: 20px — aligned to a 20px page gutter', `<div style="--tabs-inset:20px">${tabsEl(SECTIONS.slice(0, 5), SEC_BODY, `value="overview"`)}</div>`),
    ] },
    { group: 'Closable + addable (editable tab strip) — `closable` shows a × on each tab (ONLY when there is more than one) and `addable` shows a + at the far right; they emit `close` {key} / `add` for the parent to add / remove tabs. This is the pattern the metric-explorer MONITOR tabs use — see the Metric Picker for a live add / remove', items: [
      block('closable addable', tabsEl(SECTIONS.slice(0, 3), SEC_BODY, 'closable addable')),
    ] },
  ],
}
