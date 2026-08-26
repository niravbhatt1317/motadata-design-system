// Showcase manifest for <obs-filters> — the product's filtering components by archetype.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
const el = (attrs) => `<obs-filters ${attrs}></obs-filters>`
// a data-driven example: YOUR fields + active conditions, proving kind="bar" is functional (not the demo data).
const WIRED_FIELDS = '[{"key":"status","label":"Status","type":"enum","values":["Open","In Progress","Closed"]},{"key":"priority","label":"Priority","type":"enum","values":["P1","P2","P3"]},{"key":"assignee","label":"Assignee","type":"string","values":["Alex","Sam","Jordan"]}]'
const WIRED_VALUE = '[{"field":"status","operator":"is","value":["Open","In Progress"]},{"field":"priority","operator":"is","value":["P1"]}]'
const wired = `<obs-filters kind="bar" fields='${WIRED_FIELDS}' value='${WIRED_VALUE}'></obs-filters>`
const block = (label, inner, minH = '80px') => ({ html: `<div style="width:100%">${lbl(label)}<div style="min-height:${minH}">${inner}</div></div>` })
export default {
  el: 'obs-filters',
  display: 'Filters',
  controls: [
    { prop: 'kind', type: 'select', options: ['expression', 'bar', 'quick', 'row', 'vertical'] },
    // kind="bar" is FUNCTIONAL — swap between the built-in demo and YOUR data (fields + active conditions)
    { label: 'Bar data', slotPresets: [
      { label: 'Demo (built-in)', html: '', attrs: { kind: 'bar', fields: false, value: false } },
      { label: 'Wired (Status/Priority/Assignee)', html: '', attrs: { kind: 'bar', fields: WIRED_FIELDS, value: WIRED_VALUE } },
    ] },
  ],
  playground: { attrs: { kind: 'bar' } },
  gallery: [
    { group: 'Filter bar (~50×) — inline chip bar: field · operator · value chips + Match All/Any + Clear All', items: [
      block('bar — click a chip segment to edit; + Filter adds; × removes', el('kind="bar"'), '300px'),
      block('bar WIRED to your data — pass fields + value (here: Status/Priority/Assignee, not the demo); it emits a `change` event with the conditions and reflects el.value on every edit', wired, '300px'),
    ] },
    { group: 'Expression builder (32×) — nested AND/OR query builder in a popover (Pre/Post tabs)', items: [
      block('expression — click the trigger to open the builder, then Apply', el('kind="expression"'), '520px'),
    ] },
    { group: 'Quick filters — a preset one-click menu (thumbs-up trigger)', items: [
      block('quick — preset filters', el('kind="quick"'), '230px'),
    ] },
    { group: 'Filter row — a few multi-selects + Reset / Apply + close', items: [
      block('row', el('kind="row"'), '110px'),
    ] },
    { group: 'Vertical filter — the faceted left-panel sidebar (search + collapsible checkbox+count groups)', items: [
      block('vertical — check rows to filter; collapse groups', el('kind="vertical"'), '470px'),
    ] },
  ],
}
