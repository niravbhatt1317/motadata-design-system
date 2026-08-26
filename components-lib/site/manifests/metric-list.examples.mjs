// Showcase manifest for <obs-metric-list> — the DS metric/KPI list (vertical-value-grid). Value + unit + label rows.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
const block = (label, inner) => ({ html: `<div>${lbl(label)}${inner}</div>` })
const J = (v) => JSON.stringify(v)
const KPIS = [['99.98', '%', 'Availability'], ['1.2', 'k/s', 'Requests'], ['142', 'ms', 'p95 latency']]
const CODED = [['94', '%', 'CPU', '--severity-critical'], ['61', '%', 'Memory', '--severity-warning'], ['12', '%', 'Disk', '--severity-clear']]
const UTIL = [['74', '%', 'CPU Utilization'], ['12.4', 'GB', 'Memory Used'], ['1.2', 'k req/m', 'Throughput'], ['148', 'ms', 'Avg Latency']]
export default {
  el: 'obs-metric-list',
  display: 'Metric List',
  registry: 'metric-list',
  // The Details-tab playground: swap datasets (plain KPIs vs threshold-coloured values). Each item is
  // [value, unit, label] (+ an optional 4th `color` = a --severity token for the ColorCodedCell colouring).
  controls: [
    { label: 'Dataset', slotPresets: [
      { label: 'KPIs (plain)', html: '', attrs: { items: J(KPIS) } },
      { label: 'Color-coded (threshold)', html: '', attrs: { items: J(CODED) } },
      { label: 'Utilization', html: '', attrs: { items: J(UTIL) } },
    ] },
  ],
  playground: { attrs: {}, live: `<obs-metric-list items='${J(KPIS)}'></obs-metric-list>` },
  gallery: [
    { group: 'Metric list — a prominent value (number + unit) + its label, per row (dashboard KPI widgets)', items: [
      block('items = [value, unit, label] tuples', `<obs-metric-list items='${J(KPIS)}'></obs-metric-list>`),
    ] },
    { group: 'Color-coded values — an optional 4th field is a --severity token (the product ColorCodedCell threshold colouring)', items: [
      block('items = [value, unit, label, "--severity-*"]', `<obs-metric-list items='${J(CODED)}'></obs-metric-list>`),
    ] },
    { group: 'Objects — pass {value, unit, label, color?} instead of tuples', items: [
      block('items = [{value, unit, label}]', `<obs-metric-list items='${J([{ value: '312', unit: 'ms', label: 'Response time' }, { value: '4.8', unit: 'k', label: 'Sessions' }, { value: '0.02', unit: '%', label: 'Error rate' }])}'></obs-metric-list>`),
    ] },
  ],
}
