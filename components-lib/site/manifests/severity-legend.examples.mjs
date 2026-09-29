// Showcase manifest for <obs-severity-legend> — a responsive severity legend that composes obs-severity dots and
// collapses trailing entries into a "+N" pile (hover to reveal) when its container is narrow.
const muted = 'color:var(--neutral-light,#6a7fa0)'
const box = (w, inner) => `<div style="width:${w};border:1px dashed var(--border-color,#e3e8f2);border-radius:6px;padding:10px 12px">${inner}</div>`
const block = (label, inner) => ({ html:
  `<div style="width:100%"><div style="font-size:11px;${muted};font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div>${inner}</div>` })

export default {
  el: 'obs-severity-legend',
  display: 'Severity Legend',
  registry: 'severity-legend',
  summary: 'A responsive severity legend — dots + labels that collapse into a "+N" pile (hover to reveal) when the container is too narrow.',
  controls: [
    { prop: 'levels', type: 'text', label: 'Levels (CSV)' },
    { prop: 'min-visible', type: 'select', label: 'Min visible', options: ['1', '2', '3', '4'] },
    { prop: 'gap', type: 'select', label: 'Gap (px)', options: ['8', '12', '18', '24'] },
  ],
  playground: {
    attrs: { levels: 'down,critical,major,warning,clear,unreachable' },
    live: `<obs-severity-legend levels="down,critical,major,warning,clear,unreachable" style="width:640px;max-width:100%"></obs-severity-legend>`,
  },
  gallery: [
    { group: 'Full — a wide container fits every entry (dot + label). Composes obs-severity for each.', items: [
      block('6 severities, wide', box('100%', `<obs-severity-legend levels="down,critical,major,warning,clear,unreachable"></obs-severity-legend>`)),
    ] },
    { group: 'Collapsed — a NARROW container folds the trailing entries into a "+N" pile of overlapping dots (hover the pile to reveal them).', items: [
      block('same legend in ~320px', box('320px', `<obs-severity-legend levels="down,critical,major,warning,clear,unreachable"></obs-severity-legend>`)),
      block('tighter — ~200px', box('200px', `<obs-severity-legend levels="down,critical,major,warning,clear,unreachable"></obs-severity-legend>`)),
    ] },
    { group: 'Custom levels — pass any subset/order via `levels`.', items: [
      block('up / maintenance / unknown', box('100%', `<obs-severity-legend levels="up,maintenance,unknown"></obs-severity-legend>`)),
    ] },
  ],
}
