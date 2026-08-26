// Showcase manifest for <obs-layout-grid> — Foundations/Layout/Grid.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin:0 0 5px">${t}</div>`
const demo = (label, inner, usage) => ({ html: `<div style="width:100%;margin-bottom:8px">${lbl(label)}${inner}</div>`, usage })
export default {
  el: 'obs-layout-grid',
  display: 'Grid',
  controls: [
    { prop: 'size', type: 'select', options: ['12', '6', '4', '3', '2'] },
    { prop: 'gutter', type: 'toggle' },
    { prop: 'auto-size', type: 'toggle', label: 'Auto-size action' },
  ],
  playground: { attrs: { size: '6', gutter: true } , text: '' },
  gallery: [
    { group: 'Column splits — :size is the span out of 12 (ordered by in-product usage)', items: [
      demo('size 12 — full', '<obs-layout-grid size="12" gutter></obs-layout-grid>', '716×'),
      demo('6 + 6 — halves (the default form layout)', '<obs-layout-grid size="6" gutter></obs-layout-grid>', '729×'),
      demo('4 + 4 + 4 — thirds', '<obs-layout-grid size="4" gutter></obs-layout-grid>', '256×'),
      demo('3 × 4 — quarters', '<obs-layout-grid size="3" gutter></obs-layout-grid>', '466×'),
      demo('2 × 6 — sixths (dense rows)', '<obs-layout-grid size="2" gutter></obs-layout-grid>', '217×'),
    ] },
    { group: 'Auto-size — content-width action columns beside a filling field', items: [
      demo('a filling size-6 field + two auto-size buttons', '<obs-layout-grid size="6" gutter auto-size></obs-layout-grid>'),
    ] },
  ],
}
