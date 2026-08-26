// Showcase manifest for <obs-metric-picker> — the METRIC EXPLORER selection panel (Form Controls), matched to the
// product: monitor TABS (closable + "+") → a "Select Monitor" GRID dropdown (obs-grid-select: monitor table +
// checkboxes + View/Clear Selected) → Metric/Instance/Saved View tabs (obs-tabs) → search (obs-input) → a flat
// COUNTER list (⊕ add · counterName · 4-way drag). Source: metric-explorer view + counter-selector/counter-list.
const J = (v) => JSON.stringify(v)
// the monitor TABLE the grid picker opens (MONITOR/IP/TYPE/GROUPS/TAGS — like the product Select Monitor dropdown)
const MONITORS = J([
  { id: 'xen75', name: 'xen75 cluster', ip: '172.16.10.236', type: 'citrix', groups: 'Virtualization', tags: '', sev: 'up' },
  { id: 'xen71', name: 'xen71master', ip: '172.16.10.231', type: 'xen', groups: 'Virtualization', tags: '', sev: 'up' },
  { id: 'url1', name: 'www.motadata.com', ip: 'www.motadata.com', type: 'url', groups: 'Service Check', tags: '', sev: 'up' },
  { id: 'url2', name: 'www.motadata.co.in', ip: 'www.motadata.co.in', type: 'url', groups: 'Service Check', tags: 'location:ahm', sev: 'up' },
])
// the flat counter list for the active monitor — raw counterName strings, exactly like the product counter-list
const COUNTERS = J([
  'ping.min.latency.ms', 'ping.received.packets', 'ping.lost.packets', 'ping.max.latency.ms', 'ping.sent.packets',
  'ping.packet.lost.percent', 'ping.latency.ms',
  'citrix.xen.cluster.cpu.cores', 'citrix.xen.cluster.disk.free.bytes', 'citrix.xen.cluster.memory.bytes',
  'citrix.xen.cluster.memory.used.percent', 'citrix.xen.cluster.network.rx.bytes', 'citrix.xen.cluster.network.tx.bytes',
])
const box = (label, inner, w = '') => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:10px">${label}</div><div style="${w}">${inner}</div></div>` })

export default {
  el: 'obs-metric-picker',
  display: 'Metric Picker',
  registry: 'metric-picker',
  summary: 'The metric-explorer selection panel — MONITOR tabs (closable + "+") → a "Select Monitor" GRID dropdown (reuses obs-grid-select: monitor table + checkboxes + View/Clear Selected) → Metric/Instance/Saved View tabs (obs-tabs) → search (obs-input) → a flat COUNTER list where each row is a ⊕ add · the raw counterName · a 4-way drag handle. It looks like a side menu but selects a VALUE (a counter to plot). Matched to the product metric-explorer / counter-list. Pick a monitor, search, ⊕ or drag a counter.',
  controls: [
    { prop: 'views', type: 'select', options: ['Metric,Instance,Saved View', 'Metric,Instance', 'Metric'], default: 'Metric,Instance,Saved View', label: 'Sub-tabs' },
    { prop: 'can-add', type: 'toggle', default: true, label: '⊕ / drag per row' },
    { prop: 'embedded', type: 'toggle', label: 'Embedded (fixed monitor)' },
  ],
  playground: {
    attrs: {},
    text: '',
    live: `<obs-metric-picker style="max-width:440px" monitors='${MONITORS}' selected='["xen75"]' active="xen75" counters='${COUNTERS}'></obs-metric-picker>`,
  },
  gallery: [
    { group: 'Metric explorer picker — a monitor tab ("xen75 cluster") + "+", a Select Monitor grid dropdown, Metric / Instance / Saved View tabs, a search box, and the flat counter list (⊕ add · counterName · 4-way drag). Matches the product. Click "Select Monitor" to open the monitor table; ⊕ / drag a counter', items: [
      box('full explorer panel', `<obs-metric-picker style="max-width:440px" monitors='${MONITORS}' selected='["xen75"]' active="xen75" counters='${COUNTERS}'></obs-metric-picker>`),
    ] },
    { group: 'Multiple monitors — several monitor tabs (each closable with ×); the active tab’s counters show. The "+" adds another monitor from the grid picker', items: [
      box('two monitor tabs', `<obs-metric-picker style="max-width:440px" monitors='${MONITORS}' selected='["xen75","url1"]' active="xen75" counters='${COUNTERS}'></obs-metric-picker>`),
    ] },
    { group: 'Select Monitor (grid dropdown) — the "Select Monitor" control opens a searchable monitor TABLE (MONITOR/IP/TYPE/GROUPS/TAGS, checkboxes, View Selected / Clear Selected) — reuses obs-grid-select, the product FlotoDropdownGridSelector. Click it to open', items: [
      box('obs-grid-select monitor table', `<obs-metric-picker style="max-width:440px" monitors='${MONITORS}' selected='["xen75"]' active="xen75" counters='${COUNTERS}'></obs-metric-picker>`),
    ] },
    { group: 'Metric only (no Instance / Saved View) — views="Metric" drops the sub-tab strip for monitors with no instances', items: [
      box('views="Metric"', `<obs-metric-picker style="max-width:440px" views="Metric" monitors='${MONITORS}' selected='["url1"]' active="url1" counters='${COUNTERS}'></obs-metric-picker>`),
    ] },
    { group: 'Embedded (monitor detail screen) — when the monitor is ALREADY known (e.g. the user opened a monitor’s detail page and clicked its Metric Explorer tab), pass `embedded`: no monitor tabs, no "Select Monitor" — it goes straight to the Metric / Instance / Saved View tabs + search + counter list for that fixed monitor', items: [
      box('embedded (no monitor tabs / no Select Monitor)', `<obs-metric-picker style="max-width:440px" embedded counters='${COUNTERS}'></obs-metric-picker>`),
    ] },
  ],
}
