// Showcase manifest for <obs-toolbar> — the list/table control strip (grid · bulk · widget).
// Every control reuses a DS element: obs-input (search) · obs-button (filter/Add) · obs-checkbox (bulk count)
// · obs-menu (widget/bulk kebab) · obs-select column mode (the WORKING column chooser). Matched to the real
// product (_base-bulk-action-bar.vue). The grid toolbar's column (eye) button IS the working obs-select column
// chooser — it is not a separate toolbar variant, just the grid strip's column control.
const J = (v) => JSON.stringify(v)
const iconBtn = (ic, lbl) => `<obs-button variant="default" squared aria-label="${lbl}"><obs-icon name="${ic}" size="14"></obs-icon></obs-button>`
// the column (eye) button: an obs-select in column mode (COLUMNS header + draggable checkbox rows + reset) —
// the grid toolbar embeds the WORKING chooser, not a dead icon button.
const COLPICK = `<obs-select columns='${J([{key:'name',label:'Name',checked:true,locked:true},{key:'status',label:'Status',checked:true},{key:'ip',label:'IP Address',checked:true},{key:'poll',label:'Last Poll',checked:false},{key:'vendor',label:'Vendor',checked:false}])}' heading="COLUMNS" reset-label="Reset Column Preference"></obs-select>`
const GRID = `<obs-input slot="start" type="search" placeholder="Search"></obs-input>${iconBtn('filter', 'Filter')}${COLPICK}<obs-button variant="primary"><obs-icon name="plus" size="12"></obs-icon> Add Monitor</obs-button>`
// bulk: BORDERED action buttons (obs-button default) + a red-bordered danger, then a DIVIDER + a bordered ⋮ More
// (obs-menu bordered) — the divider sits between the actions and More (matching the product), not after the count.
// the separator between the bulk actions and the ⋮ More menu — a real obs-divider (vertical), sized taller (24px)
// via the --divider-height hook (was a hand-styled span; now reuses the DS element)
const DIVIDER = '<obs-divider type="vertical" style="--divider-height:24px;--divider-gap:4px"></obs-divider>'
const MORE = `${DIVIDER}<obs-menu bordered items='${J([{ key: 'export', label: 'Export selected', icon: 'download' }, { key: 'tag', label: 'Add tag', icon: 'tag' }])}'></obs-menu>`
const BULK = `<obs-button variant="default"><obs-icon name="checkCircle" size="14"></obs-icon> Acknowledge</obs-button><obs-button variant="default"><obs-icon name="user" size="14"></obs-icon> Assign</obs-button><obs-button variant="danger"><obs-icon name="trashAlt" size="14"></obs-icon> Delete</obs-button>${MORE}`
const PILL = 'display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:4px;font-size:0.7rem;background:var(--timerange-background-color,#e3e8f2);color:var(--timerange-text-color,#7186a8)'
// widget: a time-range pill + a WORKING kebab (obs-menu of widget actions)
const WKEBAB = `<obs-menu items='${J([{ key: 'edit', label: 'Edit Widget', icon: 'pencil' }, { key: 'clone', label: 'Clone Widget', icon: 'clone' }, { key: 'full', label: 'Full Screen', icon: 'expand' }, { key: 'share', label: 'Share', icon: 'shareAlt' }, { key: 'csv', label: 'Export as CSV', icon: 'download' }])}'></obs-menu>`
const WIDGET = `<span style="${PILL}">24h</span>${WKEBAB}`
// the widget header is the TOP CHROME of a card (border-bottom none) — it butts against a chart body. This body
// stub completes the card so the header never reads as "cut off at the bottom" when shown on its own.
const CHARTBODY = `<div style="border:1px solid var(--border-color,#e3e8f2);border-top:none;border-radius:0 0 6px 6px;height:80px;display:flex;align-items:center;justify-content:center;color:var(--neutral-light,#6a7fa0)">— chart —</div>`
const block = (label, inner) => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div>${inner}</div>` })
const centered = (inner) => `<div style="display:flex;justify-content:center;padding:12px 0">${inner}</div>`

export default {
  el: 'obs-toolbar',
  display: 'Toolbar',
  registry: 'toolbar',
  // Preset switches variant + matching content together (a lone `variant` toggle would leave the wrong content).
  controls: [
    { label: 'Preset', slotPresets: [
      { label: 'Grid toolbar', attrs: { variant: 'grid', count: '', title: '' }, html: GRID },
      { label: 'Bulk action bar', attrs: { variant: 'bulk', count: '3', title: '' }, html: BULK },
      { label: 'Widget header', attrs: { variant: 'widget', count: '', title: 'CPU Utilization' }, html: WIDGET, after: CHARTBODY },
    ] },
    { prop: 'count', type: 'text', label: 'Count (bulk)' },
    { prop: 'title', type: 'text', label: 'Title (widget)' },
  ],
  playground: { attrs: { variant: 'grid' }, text: '', live: `<obs-toolbar variant="grid">${GRID}</obs-toolbar>` },
  gallery: [
    { group: 'Grid toolbar (default) — a strip ABOVE a list/table: search (obs-input, left) + a filter button + the WORKING column chooser (the eye = obs-select column mode, click it to show/hide & reorder columns) + a primary Add (right). The column chooser is the grid toolbar’s column control, not a separate variant', items: [
      block('search + filter + column chooser + Add', `<obs-toolbar variant="grid">${GRID}</obs-toolbar>`),
    ] },
    { group: 'Bulk action bar — the floating selection pill (real _base-bulk-action-bar): a clear checkbox + muted "N items selected" + BORDERED primary actions (Acknowledge / Assign) + a red-bordered danger (Delete) + a ⋮ More menu. Emits `clear`', items: [
      block('count="3" + bordered actions', centered(`<obs-toolbar variant="bulk" count="3">${BULK}</obs-toolbar>`)),
    ] },
    { group: 'Single selection — count="1" reads "1 item selected" (singular)', items: [
      block('count="1"', centered(`<obs-toolbar variant="bulk" count="1"><obs-button variant="default"><obs-icon name="checkCircle" size="14"></obs-icon> Acknowledge</obs-button><obs-button variant="danger"><obs-icon name="trashAlt" size="14"></obs-icon> Delete</obs-button>${MORE}</obs-toolbar>`)),
    ] },
    { group: 'Widget header — a dashboard widget’s chrome: the title (left) + a time-range pill + a WORKING kebab (obs-menu of Edit / Clone / Full Screen / Share / Export). Click the ⋮', items: [
      block('title + time pill + kebab menu', `<obs-toolbar variant="widget" title="CPU Utilization">${WIDGET}</obs-toolbar>${CHARTBODY}`),
    ] },
  ],
}
