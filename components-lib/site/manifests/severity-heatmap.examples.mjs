// Showcase manifest for <obs-severity-heatmap> — the product's Infrastructure-Heatmap honeycomb (PlainHeatMap):
// one hexagon per monitor, coloured by its severity, with a hover tooltip (monitor IP + location + a severity pill).
// `cells` is an ARRAY prop — but the element also accepts a JSON STRING (it JSON.parses it), so the static
// showcase passes it as a plain attribute: cells='[...]' (same pattern obs-table uses for columns/rows).
const J = (v) => JSON.stringify(v)
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
const box = (label, inner, w = 300) => ({ html:
  `<div><div>${lbl(label)}</div><div style="width:${w}px;max-width:100%;background:var(--common-widget-bg,#fff);border:1px solid var(--border-color,#e3e8f2);border-radius:8px;padding:6px">${inner}</div></div>` })

// A full Infrastructure Heatmap: worst severities band across the top (down + a stray unreachable), a
// critical/major/warning transition, then a healthy `up` body — mirroring the product's shape. Each hex
// carries a monitor name (IP) + location so the hover tooltip has identity ("172.16.8.113 / MB_Location_5 / Warning").
const COLS = 12
const ROWS = 11
function sevAt(r, c) {
  if (r === 0) return c === 3 ? 'unreachable' : 'down' // top band: down (dark red) + a stray purple
  if (r === 1) return c < 7 ? 'critical' : 'major'
  if (r === 2) return c < 5 ? 'major' : 'warning'      // orange -> yellow transition
  if (r === 3) return c < 3 ? 'warning' : 'up'
  return 'up'                                           // green body
}
const infraCells = Array.from({ length: ROWS * COLS }, (_, i) => {
  const r = Math.floor(i / COLS)
  const c = i % COLS
  return {
    severity: sevAt(r, c),
    name: `172.16.${8 + Math.floor(i / 24)}.${100 + (i % 24)}`,
    location: `MB_Location_${(i % 8) + 1}`,
  }
})

// A small honeycomb — a handful of monitors with a couple of hot cells; still name+location so the tooltip works.
const smallCells = [
  { severity: 'down', name: '10.0.0.4', location: 'DC_Location_1' },
  { severity: 'critical', name: '10.0.0.5', location: 'DC_Location_1' },
  { severity: 'major', name: '10.0.0.6', location: 'DC_Location_2' },
  { severity: 'warning', name: '10.0.0.7', location: 'DC_Location_2' },
  { severity: 'up', name: '10.0.0.8', location: 'DC_Location_3' },
  { severity: 'up', name: '10.0.0.9', location: 'DC_Location_3' },
  { severity: 'up', name: '10.0.0.10', location: 'DC_Location_4' },
  { severity: 'up', name: '10.0.0.11', location: 'DC_Location_4' },
  { severity: 'maintenance', name: '10.0.0.12', location: 'DC_Location_5' },
]

// A large fleet capped with max — the first N hexes render + a "+N more" pill. Reuse the full infra set.
const bigCells = infraCells

// Bare severity STRINGS — colour-only hexes with no name → no hover tooltip. A pure density view.
const bareCells = ['down', 'down', 'critical', 'critical', 'major', 'warning', 'warning', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'maintenance', 'up', 'up']

export default {
  el: 'obs-severity-heatmap',
  display: 'Severity Heatmap',
  registry: 'severity-heatmap',
  // `cells` is an ARRAY prop with several data SHAPES — a plain <select> can't carry an array, so it's exposed
  // as a DATASET switcher (slotPresets). Each option sets the `cells` attribute to a JSON STRING, which the
  // element JSON.parses — reaching the object-cell honeycomb (tooltip has identity), the small/compact set, and
  // the bare severity-string colour-only view. Each dataset also seeds a sensible `size` (reflected into the
  // size control, still adjustable). `size` and `max` stay independent text controls — set max>0 on any dataset
  // to reach the truncated "+N more" variant.
  controls: [
    { label: 'Cells (dataset)', slotPresets: [
      { label: 'Infrastructure — object cells (hover → IP + location + severity pill)', html: '', attrs: { cells: J(infraCells), size: '22' } },
      { label: 'Small / compact — object cells (dense strip)', html: '', attrs: { cells: J(smallCells), size: '16' } },
      { label: 'Bare severity strings — colour only (no tooltip)', html: '', attrs: { cells: J(bareCells), size: '20' } },
    ] },
    { prop: 'size', type: 'text', label: 'size (hex width px · height = size × 1.1547)' },
    { prop: 'max', type: 'text', label: 'max (0 = all · N → first N + a "+N more" pill)' },
  ],
  playground: {
    attrs: { size: '22' },
    live: `<obs-severity-heatmap size="22" cells='${J(infraCells)}'></obs-severity-heatmap>`,
  },
  gallery: [
    { group: 'Infrastructure Heatmap — the full product honeycomb: worst severities (down + a stray unreachable) band across the top, a critical → major → warning transition, then a healthy `up` body. HOVER any hex → the tooltip (monitor IP + location + a severity pill). size="22"', items: [
      box('one hex per monitor, coloured by severity — hover for the IP + location + severity pill', `<obs-severity-heatmap size="22" cells='${J(infraCells)}'></obs-severity-heatmap>`, 360),
    ] },
    { group: 'Small heatmap — a handful of monitors (a couple of hot cells over a healthy body) at a smaller size. Fits a tight widget or an inline health strip', items: [
      box('9 monitors, size="20" — still name+location so the hover tooltip works', `<obs-severity-heatmap size="20" cells='${J(smallCells)}'></obs-severity-heatmap>`, 220),
    ] },
    { group: 'Truncated — `max` caps the grid to the first N hexes and appends a "+N more" pill (--primary-alt). For a bounded preview of a large fleet', items: [
      box('max="42" over a 132-cell fleet → 42 hexes + a "+90 more" pill', `<obs-severity-heatmap size="18" max="42" cells='${J(bigCells)}'></obs-severity-heatmap>`, 300),
    ] },
    { group: 'Bare severity strings — cells passed as plain level strings render colour-only hexes (no name → no hover tooltip). A pure density view', items: [
      box("cells=['down','critical','major','warning','up',...] — colour only", `<obs-severity-heatmap size="20" cells='${J(bareCells)}'></obs-severity-heatmap>`, 220),
    ] },
  ],
}
