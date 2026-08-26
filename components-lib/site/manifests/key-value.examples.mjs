// Showcase manifest for <obs-key-value> — the DS key-value / description list (transposed detail view).
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
const block = (label, inner) => ({ html: `<div>${lbl(label)}${inner}</div>` })
const J = (v) => JSON.stringify(v)
const DETAIL = [['Monitor', 'web-server-01'], ['IP Address', '10.0.0.12'], ['Type', 'Linux Server'], ['Vendor', 'Cisco'], ['Uptime', '42 days']]
const CODED = [['Monitor', 'web-server-01'], ['Status', 'running', '', 'running'], ['CPU', '94%', '--severity-critical'], ['Memory', '61%', '--severity-warning'], ['Disk', '12%', '--severity-clear']]
const WIDE = [['Vendor', 'Cisco'], ['Model', 'C9300'], ['Uptime', '42d'], ['OS', 'IOS-XE'], ['Site', 'DC-1'], ['Rack', 'R12']]
export default {
  el: 'obs-key-value',
  display: 'Key-Value',
  registry: 'key-value',
  // The Details-tab playground: switch the card vs plain style, 1- vs 2-column layout, and the dataset
  // (plain detail vs colour-coded + status values). Each item is [label, value] (+ optional [.,.,color,status]).
  controls: [
    { prop: 'variant', type: 'select', options: ['card', 'plain'] },
    { prop: 'columns', type: 'select', options: ['1', '2'], label: 'Columns' },
    { label: 'Dataset', slotPresets: [
      { label: 'Detail (plain)', html: '', attrs: { items: J(DETAIL) } },
      { label: 'Color + status', html: '', attrs: { items: J(CODED) } },
      { label: 'Inventory (wide)', html: '', attrs: { items: J(WIDE) } },
    ] },
  ],
  playground: { attrs: { variant: 'card' }, live: `<obs-key-value variant="card" items='${J(DETAIL)}'></obs-key-value>` },
  gallery: [
    { group: 'Key-value / description list — a tinted label cell + value, per row (a single record\'s detail view)', items: [
      block('variant="card" (default) — bordered card, tinted label cell', `<obs-key-value items='${J(DETAIL)}'></obs-key-value>`),
    ] },
    { group: 'Plain variant — borderless, muted label (the overview-layout style)', items: [
      block('variant="plain"', `<obs-key-value variant="plain" items='${J(DETAIL)}'></obs-key-value>`),
    ] },
    { group: 'Two columns — pairs laid out two-across (overview-layout 2-columns) for wide records', items: [
      block('variant="plain" columns="2"', `<obs-key-value variant="plain" columns="2" items='${J(WIDE)}'></obs-key-value>`),
    ] },
    { group: 'Color-coded + status values — an optional 3rd field is a --severity token; a 4th makes the value an obs-tag', items: [
      block('items = [label, value, "--severity-*", status?]', `<obs-key-value items='${J(CODED)}'></obs-key-value>`),
    ] },
  ],
}
