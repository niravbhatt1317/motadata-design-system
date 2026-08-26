// Showcase manifest for <obs-layout-regions> — Foundations/Layout/Screen regions.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:9px">${t}</div>`
const demo = (label, inner) => ({ html: `<div style="width:100%;overflow:auto;margin-bottom:6px">${lbl(label)}${inner}</div>` })
const SHAPES = [
  ['single', 'Single column — list / form'],
  ['two-pane', 'Two-pane — left tree/menu + content'],
  ['master-detail', 'Master-detail — list + drawer slide-over'],
  ['dashboard', 'Dashboard grid — tiles'],
  ['three-pane', 'Three-pane — saved-views + picker + content'],
  ['chart-over-grid', 'Chart-over-grid — a fixed chart above a grid'],
]
export default {
  el: 'obs-layout-regions',
  display: 'Screen regions',
  controls: [
    { prop: 'shape', type: 'select', options: ['single', 'two-pane', 'master-detail', 'dashboard', 'three-pane', 'chart-over-grid'] },
    { prop: 'toolbar', type: 'toggle' },
    { prop: 'footer', type: 'toggle' },
  ],
  playground: { attrs: { shape: 'two-pane', toolbar: true, footer: true } , text: '' },
  gallery: [
    { group: 'Region stack — Page header · Toolbar · Body · Footer (top → bottom)', items: [
      demo('the four regions called out (required = primary accent)', '<obs-layout-regions callouts></obs-layout-regions>'),
    ] },
    { group: 'Content layouts — the six shapes the body takes', items:
      SHAPES.map(([s, label]) => demo(label, `<obs-layout-regions shape="${s}" toolbar></obs-layout-regions>`)) },
  ],
}
