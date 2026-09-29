// Showcase manifest for <obs-gauge> — the single ring dial (Monitor-Availability / Alert-Count).
// arc = value/total, coloured by a severity level; big mono number in the centre, optional label under it.
// A group reads as ONE gauge per member laid in a flex row, all sharing the same (group) total.
const muted = 'color:var(--neutral-light,#6a7fa0)'
const row = (inner) => `<div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">${inner}</div>`
const block = (label, inner) => ({ html:
  `<div><div style="font-size:11px;${muted};font-family:'JetBrains Mono',monospace;margin-bottom:10px">${label}</div>${inner}</div>` })

export default {
  el: 'obs-gauge',
  display: 'Gauge',
  registry: 'gauge',
  controls: [
    { prop: 'value', type: 'text', label: 'value (centre number + arc numerator)' },
    { prop: 'total', type: 'text', label: 'total (arc denominator · 0 = track-only)' },
    // every documented severity level → the arc + centre-number colour var(--severity-<level>);
    // '' (first option) is the unsevered fallback to --primary. Mirrors registry.props.severity.enum.
    { prop: 'severity', type: 'select', label: 'severity (colour · "" = --primary)', options: [
      '', 'up', 'down', 'critical', 'major', 'warning', 'unreachable', 'maintenance', 'clear', 'disable', 'unknown', 'suspended',
    ] },
    { prop: 'label', type: 'text', label: 'label (caption under the ring)' },
  ],
  playground: {
    attrs: { value: '160', total: '172', severity: 'up', label: 'Up' },
    live: `<obs-gauge value="160" total="172" severity="up" label="Up"></obs-gauge>`,
  },
  gallery: [
    { group: 'Monitor Availability — one dial per status against the monitor group total (172). The real dashboard "Monitor Availability" widget: Up / Down / Unreachable / Maintenance', items: [
      block('4-up row · total=172 · up / down / unreachable / maintenance', row(
        `<obs-gauge value="160" total="172" severity="up" label="Up"></obs-gauge>` +
        `<obs-gauge value="12" total="172" severity="down" label="Down"></obs-gauge>` +
        `<obs-gauge value="0" total="172" severity="unreachable" label="Unreachable"></obs-gauge>` +
        `<obs-gauge value="0" total="172" severity="maintenance" label="Maintenance"></obs-gauge>`
      )),
    ] },
    { group: 'Alert Count — one dial per severity against the alert group total (37). The real dashboard "Alert Count" widget: Down / Critical / Major / Warning', items: [
      block('4-up row · total=37 · down / critical / major / warning', row(
        `<obs-gauge value="13" total="37" severity="down" label="Down"></obs-gauge>` +
        `<obs-gauge value="3" total="37" severity="critical" label="Critical"></obs-gauge>` +
        `<obs-gauge value="1" total="37" severity="major" label="Major"></obs-gauge>` +
        `<obs-gauge value="20" total="37" severity="warning" label="Warning"></obs-gauge>`
      )),
    ] },
    { group: 'Single dial — one gauge on its own; the arc sweeps value/total, the centre number is the raw value', items: [
      block('value=160 · total=172 · severity="up"', `<obs-gauge value="160" total="172" severity="up" label="Up"></obs-gauge>`),
    ] },
    { group: 'Empty / zero — value=0 (or total=0): only the track ring + a centre 0 render. Keeps a zero member in the row aligned', items: [
      block('value=0 · total=172 (no arc)', `<obs-gauge value="0" total="172" severity="unreachable" label="Unreachable"></obs-gauge>`),
      block('total=0 (only the track ring)', `<obs-gauge value="0" total="0" label="No data"></obs-gauge>`),
    ] },
    { group: 'Full — value >= total: the fraction clamps to 1 and the arc sweeps the whole ring, while the centre number still shows the raw value', items: [
      block('value=172 · total=172 (exactly full)', `<obs-gauge value="172" total="172" severity="up" label="Up"></obs-gauge>`),
      block('value=40 · total=37 (over total → clamped to a full ring, centre shows 40)', `<obs-gauge value="40" total="37" severity="warning" label="Warning"></obs-gauge>`),
    ] },
    { group: 'Unsevered — no severity attribute (or severity=""): the arc + centre number fall back to var(--primary). A neutral count-against-total dial with no status colour', items: [
      block('value=48 · total=120 · no severity (--primary)', `<obs-gauge value="48" total="120" label="In progress"></obs-gauge>`),
    ] },
    { group: 'Severity colours — the arc + number read from var(--severity-<level>); severity="" falls back to --primary (the page theme toggle shows both). Every documented level is shown', items: [
      block('availability + alert levels: up / down / unreachable / maintenance', row(
        `<obs-gauge value="9" total="12" severity="up" label="up"></obs-gauge>` +
        `<obs-gauge value="9" total="12" severity="down" label="down"></obs-gauge>` +
        `<obs-gauge value="9" total="12" severity="unreachable" label="unreachable"></obs-gauge>` +
        `<obs-gauge value="9" total="12" severity="maintenance" label="maintenance"></obs-gauge>`
      )),
      block('alert levels: critical / major / warning / clear', row(
        `<obs-gauge value="9" total="12" severity="critical" label="critical"></obs-gauge>` +
        `<obs-gauge value="9" total="12" severity="major" label="major"></obs-gauge>` +
        `<obs-gauge value="9" total="12" severity="warning" label="warning"></obs-gauge>` +
        `<obs-gauge value="9" total="12" severity="clear" label="clear"></obs-gauge>`
      )),
      block('lifecycle levels: disable / unknown / suspended / unsevered (--primary)', row(
        `<obs-gauge value="9" total="12" severity="disable" label="disable"></obs-gauge>` +
        `<obs-gauge value="9" total="12" severity="unknown" label="unknown"></obs-gauge>` +
        `<obs-gauge value="9" total="12" severity="suspended" label="suspended"></obs-gauge>` +
        `<obs-gauge value="9" total="12" label="(none)"></obs-gauge>`
      )),
    ] },
  ],
}
