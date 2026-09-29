// Showcase manifest for <obs-pagination> — the DS pagination footer, extracted from obs-table so any paged view
// (card grid, list) can reuse it. Every example needs width to show the split (controls left, range right).
const muted = 'color:var(--neutral-light,#6a7fa0)'
const wrap = (inner) => `<div style="width:100%;border:1px solid var(--border-color,#e3e8f2);border-radius:6px;padding:2px 10px">${inner}</div>`
const block = (label, inner) => ({ html:
  `<div style="width:100%"><div style="font-size:11px;${muted};font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div>${wrap(inner)}</div>` })
const dot = (lvl, on) => `<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;${muted}"><span style="width:9px;height:9px;border-radius:50%;${on ? `background:var(--severity-${lvl})` : `border:1.5px solid var(--severity-${lvl})`}"></span>${lvl[0].toUpperCase() + lvl.slice(1)}</span>`
const legend = `<div style="display:flex;align-items:center;gap:18px">${dot('down', true)}${dot('critical', false)}${dot('major', true)}${dot('warning', true)}${dot('clear', true)}${dot('unreachable', false)}</div>`

export default {
  el: 'obs-pagination',
  display: 'Pagination',
  registry: 'pagination',
  summary: 'Standalone pagination footer — reusable under any paged view. Seek controls + numbered squares + page-size select + range, with a centered slot for extra footer content.',
  controls: [
    { prop: 'total', type: 'text', label: 'Total items' },
    { prop: 'page', type: 'text', label: 'Current page' },
    { prop: 'page-size', type: 'select', label: 'Page size', options: ['10', '20', '50', '100'] },
    { prop: 'sizes-label', type: 'text', label: 'Sizes label' },
    { prop: 'hide-size', type: 'toggle' },
    { prop: 'hide-range', type: 'toggle' },
    { prop: 'legend', slotToggle: `<obs-severity-legend levels="down,critical,major,warning,clear,unreachable"></obs-severity-legend>`, label: 'Show severity legend' },
  ],
  playground: {
    attrs: { total: '222', page: '1', 'page-size': '50' },
    live: `<obs-pagination total="222" page="1" page-size="50" style="width:100%"></obs-pagination>`,
  },
  gallery: [
    { group: 'SPLIT variant (default) — seek controls + page-size on the LEFT, item total on the RIGHT. The center slot is empty.', items: [
      block('page 1 of 5 (222 items @ 50/page)', `<obs-pagination total="222" page="1" page-size="50" style="width:100%"></obs-pagination>`),
      block('page 3 — numbered windowing (500 items @ 50/page → 10 pages: 1 … 2 3 4 … 10)', `<obs-pagination total="500" page="3" page-size="50" style="width:100%"></obs-pagination>`),
    ] },
    { group: 'CENTERED variant — fill the default slot (e.g. a severity legend) and it sits mid-footer between the controls and the total (the product Monitors list page).', items: [
      block('with a centered severity legend', `<obs-pagination total="222" page="1" page-size="50" style="width:100%">${legend}</obs-pagination>`),
    ] },
    { group: 'Trimmed — hide the size select (hide-size) or the range (hide-range) for tighter footers.', items: [
      block('hide-size', `<obs-pagination total="120" page="2" page-size="20" hide-size style="width:100%"></obs-pagination>`),
      block('hide-range', `<obs-pagination total="120" page="2" page-size="20" hide-range style="width:100%"></obs-pagination>`),
    ] },
  ],
}
