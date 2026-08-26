// Showcase manifest for <obs-layout-page-templates> — Foundations/Layout/Page templates.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:9px">${t}</div>`
const demo = (label, inner) => ({ html: `<div style="width:100%;margin-bottom:6px">${lbl(label)}${inner}</div>` })
const TPLS = [
  ['list', 'List view — header · toolbar · table · pagination'],
  ['form', 'Form view — back · title · actions, then a field grid'],
  ['detail', 'Detail view — header + status · tabs · panels'],
  ['dashboard', 'Dashboard view — picker · time range · widget grid'],
  ['explorer', 'Explorer view — left tree/filter · query bar · results'],
  ['wizard', 'Wizard flow — stepper · step body · Back/Next'],
  ['graph', 'Graph / Canvas — tree · interactive node graph · minimap'],
]
export default {
  el: 'obs-layout-page-templates',
  display: 'Page templates',
  controls: [
    { prop: 'template', type: 'select', options: ['list', 'form', 'detail', 'dashboard', 'explorer', 'wizard', 'graph'] },
  ],
  playground: { attrs: { template: 'list' }, text: '' },
  gallery: [
    { group: 'The seven canonical page templates', items:
      TPLS.map(([t, label]) => demo(label, `<obs-layout-page-templates template="${t}"></obs-layout-page-templates>`)) },
  ],
}
