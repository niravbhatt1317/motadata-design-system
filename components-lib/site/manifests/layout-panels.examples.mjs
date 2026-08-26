// Showcase manifest for <obs-layout-panels> — Foundations/Layout/Panel behaviours.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:9px;text-align:center">${t}</div>`
const cell = (name, b, count) => `<div>${lbl(`${name}${count ? ` <span class="g-usage" title="uses in the product">${count}</span>` : ''}`)}<obs-layout-panels behaviour="${b}"></obs-layout-panels></div>`
const B = [
  ['drawer', 'Drawer', '146×'], ['modal', 'Modal', '37×'], ['collapse', 'Collapsible', '19×'], ['expand', 'Expandable rows', '9×'],
  ['split', 'Resizable / split', '~3'], ['affix', 'Affix / sticky', ''], ['dash', 'Dashboard tiles', '5×'], ['bulkbar', 'Bulk-action bar', '2×'],
  ['popover', 'Popover', '20+'], ['fullscreen', 'Full-screen / OmniBox', ''],
]
const grid = `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 20px;width:100%">${B.map(([b, name, c]) => cell(name, b, c)).join('')}</div>`
export default {
  el: 'obs-layout-panels',
  display: 'Panel behaviours',
  controls: [
    { prop: 'behaviour', type: 'select', options: ['drawer', 'modal', 'collapse', 'expand', 'split', 'affix', 'dash', 'bulkbar', 'popover', 'fullscreen'] },
  ],
  playground: { attrs: { behaviour: 'drawer' }, text: '' },
  gallery: [
    { group: 'Ten panel & overlay behaviours', items: [{ html: grid }] },
  ],
}
