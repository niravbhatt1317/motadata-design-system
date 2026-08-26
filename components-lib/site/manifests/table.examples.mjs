// Showcase manifest for <obs-table> — the DS data table (the product's Kendo <Grid>/VirtualTable chrome, the
// backbone of every list/inventory/alert screen). Covers the Storybook Organisms/Table variants: basic, selectable,
// expandable, grouping, rich cell types, header styles, style variants, disabled selection, sorted, pagination,
// empty, loading. Composes the DS primitives: obs-checkbox · obs-tag · obs-menu · obs-icon.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
const COLS = '[{"key":"name","title":"Monitor","type":"severity","sortable":true,"editable":true},{"key":"ip","title":"IP","sortable":true,"editable":true},{"key":"type","title":"Type","type":"type"},{"key":"status","title":"Status","type":"status"}]'
const ROWS = '[{"id":"1","name":"web-01","ip":"10.0.0.1","status":"running","sev":"critical","env":"Production","detail":"<b>Interface:</b> GigabitEthernet0/1 &middot; <b>Vendor:</b> Cisco &middot; <b>Uptime:</b> 42d"},{"id":"2","name":"db-02","ip":"10.0.0.2","status":"down","sev":"critical","env":"Production","detail":"<b>Interface:</b> GigabitEthernet0/2 &middot; <b>Vendor:</b> Dell"},{"id":"3","name":"api-03","ip":"10.0.0.3","status":"running","sev":"major","env":"Staging","detail":"<b>Interface:</b> Eth0 &middot; <b>Vendor:</b> HP"},{"id":"4","name":"cache-04","ip":"10.0.0.4","status":"maintenance","sev":"warning","env":"Staging","disabled":true,"detail":"<b>Interface:</b> Eth1"}]'
const ACTS = '[{"key":"edit","label":"Edit","icon":"pencil"},{"key":"clone","label":"Duplicate","icon":"save"},{"key":"dv","divider":true},{"key":"delete","label":"Delete","icon":"trash","danger":true}]'
const TAGCOLS = '[{"key":"name","title":"Monitor"},{"key":"status","title":"Status","type":"status"},{"key":"tags","title":"Tags","type":"tags"}]'
const TAGROWS = '[{"id":"1","name":"web-01","status":"running","tags":[{"label":"prod","variant":"tag-green"},{"label":"web"}]},{"id":"2","name":"db-02","status":"down","tags":[{"label":"staging","variant":"tag-orange"},{"label":"db"}]}]'
const tbl = (attrs, cols = COLS, rows = ROWS) => `<obs-table columns='${cols}' rows='${rows}' ${attrs}></obs-table>`
const block = (label, inner) => ({ html: `<div style="width:100%">${lbl(label)}${inner}</div>` })
export default {
  el: 'obs-table',
  display: 'Table',
  registry: 'table',
  events: ['change', 'sort', 'rowaction', 'pagechange', 'rowclick', 'edit', 'save', 'canceledit'],
  // The Details-tab playground: toggle every variant/behaviour on ONE dataset. Selection, expandable rows, sorting,
  // inline editing (click a pencil → Monitor/IP become inputs), grouping (Group by env) and its pivot/report mode
  // (Group collapsible → false), header style, style variant, hide-header, paging and the loading state. (Tree and
  // the heat/bar cell types need bespoke data shapes — see the Examples tab for those.)
  controls: [
    { prop: 'selectable', type: 'toggle' },
    { prop: 'expandable', type: 'toggle' },
    { prop: 'sortable', type: 'toggle' },
    { prop: 'editable', type: 'toggle', label: 'Editable (inline)' },
    { prop: 'group-by', type: 'select', options: ['', 'env'], label: 'Group by' },
    { prop: 'group-collapsible', type: 'select', options: ['true', 'false'], label: 'Group collapsible' },
    { prop: 'header-style', type: 'select', options: ['default', 'tinted'] },
    { prop: 'variant', type: 'select', options: ['default', 'bordered', 'borderless-rows'] },
    { prop: 'hide-header', type: 'toggle' },
    { prop: 'page-size', type: 'text' },
    { prop: 'loading', type: 'toggle' },
  ],
  playground: {
    attrs: { selectable: true, sortable: true },
    live: `<obs-table selectable sortable sort="name:asc" columns='${COLS}' rows='${ROWS}' row-actions='${ACTS}'></obs-table>`,
  },
  gallery: [
    { group: 'Basic — columns + rows, sortable headers (click a header; the sorted column turns --primary + arrow)', items: [
      block('rich cells via a column `type`: severity ring · type icons · status tag (obs-tag)', tbl('sort="name:asc"')),
    ] },
    { group: 'Selectable + row actions — checkbox column + select-all (indeterminate on partial), ⋯ actions per row', items: [
      block('check some rows → the header box goes indeterminate + an "N items selected" tag appears; el.selected reflects the ids', tbl(`selectable selected='["1"]' row-actions='${ACTS}'`)),
    ] },
    { group: 'Expandable — a chevron column opens each row\'s detail below (the detailRow slot)', items: [
      block('click a chevron to reveal the row detail', tbl('expandable')),
    ] },
    { group: 'Grouping — collapsible group-header rows with counts (group-by a column)', items: [
      block('group-by="env": rows bucket under Production / Staging headers with a count (chevron collapses each band)', tbl('group-by="env"')),
    ] },
    { group: 'Pivot / report grid — grouping with group-collapsible="false": no chevron, no count, every child row always visible', items: [
      block('group-by="env" group-collapsible="false": a static report grid — plain band headers, all rows shown (no expand/collapse)', tbl('group-by="env" group-collapsible="false"')),
    ] },
    { group: 'Cell types — name · status tag · severity dot · tags · sparkline · actions (the product per-column slots)', items: [
      block('column `type`: status (obs-tag) · dot (severity dot + label) · tags (obs-tag chips) · sparkline (inline trend)',
        `<obs-table columns='[{"key":"name","title":"Monitor"},{"key":"status","title":"Status","type":"status"},{"key":"sev","title":"Severity","type":"dot"},{"key":"tags","title":"Tags","type":"tags"},{"key":"trend","title":"Trend","type":"sparkline"}]' rows='[{"id":"1","name":"web-server-01","status":"up","sev":"Major","tags":[{"label":"prod","variant":"tag-green"},{"label":"web"}],"trend":[15,8,12,4,9,3,7,2]},{"id":"2","name":"db-primary","status":"down","sev":"Critical","tags":[{"label":"db","variant":"tag-red"}],"trend":[3,6,4,9,7,11,8,13]}]' row-actions='${ACTS}'></obs-table>`),
    ] },
    { group: 'Header styles — default (transparent .k-grid) vs tinted (.item-list-table bar)', items: [
      block('header-style="default" — transparent, UPPERCASE', tbl('')),
      block('header-style="tinted" — tinted bar, normal-case', tbl('header-style="tinted"')),
    ] },
    { group: 'Style variants — bordered (internal grid, no outer frame) · borderless rows · hide-header', items: [
      block('variant="bordered" — column + row dividers, no left/right outer border', tbl('variant="bordered"')),
      block('variant="borderless-rows" — no row dividers (just the header underline), airy spacing', tbl('variant="borderless-rows"')),
      block('hide-header (compact widget grids)', tbl('hide-header')),
    ] },
    { group: 'Cells: color-coded (heat) + relative-percent (bar) — threshold-tinted cells + inline progress bars', items: [
      block('type "heat": the cell fills a --severity token (column colorKey → the row\'s colour field) · type "bar": an inline percent bar',
        `<obs-table columns='[{"key":"name","title":"Monitor"},{"key":"cpu","title":"CPU","type":"heat","colorKey":"cpuC"},{"key":"mem","title":"Memory","type":"heat","colorKey":"memC"},{"key":"disk","title":"Disk usage","type":"bar"}]' rows='[{"id":"1","name":"web-server-01","cpu":"94%","cpuC":"--severity-critical","mem":"72%","memC":"--severity-warning","disk":45},{"id":"2","name":"db-primary","cpu":"38%","cpuC":"--severity-clear","mem":"61%","memC":"--severity-major","disk":80},{"id":"3","name":"cache-02","cpu":"12%","cpuC":"--severity-clear","mem":"20%","memC":"--severity-clear","disk":22}]'></obs-table>`),
    ] },
    { group: 'Tree / hierarchical — nested rows via `children`; chevron + indent per level (SNMP OID / MIB trees)', items: [
      block('tree: rows carry a `children` array; click a chevron to collapse/expand a subtree',
        `<obs-table tree columns='[{"key":"name","title":"OID / object"},{"key":"type","title":"Syntax"},{"key":"access","title":"Access"}]' rows='[{"id":1,"name":"interfaces","type":"group","access":"—","children":[{"id":11,"name":"ifTable","type":"table","access":"not-accessible","children":[{"id":111,"name":"ifIndex","type":"Integer32","access":"read-only"},{"id":112,"name":"ifDescr","type":"OCTET STRING","access":"read-only"}]},{"id":12,"name":"ifNumber","type":"Integer32","access":"read-only"}]}]'></obs-table>`),
    ] },
    { group: 'Disabled selection — rows flagged disabled can\'t be checked', items: [
      block('cache-04 has `disabled:true` → its checkbox is disabled', tbl('selectable')),
    ] },
    { group: 'Paginated — the Kendo pager (numbered links + first/prev/next/last + page-size + "1 - N of M items")', items: [
      block('page-size="2"', tbl('page-size="2"')),
    ] },
    { group: 'Inline editing — `editable` adds a pencil per row; a column marked `editable:true` becomes an obs-input while the row is edited (Save / Cancel)', items: [
      block('editable: click the pencil → editable columns (Name, Owner) turn into inputs; Save emits `save` {id, values}, Cancel reverts',
        `<obs-table editable columns='[{"key":"name","title":"Monitor","editable":true},{"key":"ip","title":"IP Address"},{"key":"owner","title":"Owner","editable":true},{"key":"status","title":"Status","type":"status"}]' rows='[{"id":"1","name":"web-server-01","ip":"10.0.0.12","owner":"neteng","status":"up"},{"id":"2","name":"db-primary","ip":"10.0.0.20","owner":"dba","status":"down"}]'></obs-table>`),
    ] },
    { group: 'Empty & loading states', items: [
      block('no rows → empty message', `<obs-table columns='${COLS}' rows='[]' empty-text="No monitors match your filters"></obs-table>`),
      block('loading → centered spinner', tbl('loading')),
    ] },
  ],
}
