<script setup>
// <obs-table> — the DS data table (the product's Kendo <Grid>/VirtualTable chrome, the backbone of every
// list/inventory/alert screen). Matched to the rendered Storybook `.ds-grid` + `.ds-pager` (storybook/
// ds-primitives.less): the DEFAULT header is TRANSPARENT + UPPERCASE + letter-spacing + 600 with a top &
// bottom rule (NOT a tinted bar — that's header-style="tinted", the item-list variant); rows have a
// --border-color divider + a translucent-neutral hover; a selected row = --neutral-lightest + a --primary
// left accent; selection shows an "N items selected" tag above; the pager is the Kendo .k-grid-pager
// (first/prev · numbered page links, selected = --pagination-active-bg · next/last · page-size select ·
// "1 - N of M items"). Composes the DS primitives: obs-checkbox · obs-tag · obs-menu · obs-icon.
//
//   <obs-table selectable page-size="50"
//     columns='[{"key":"name","title":"Name","sortable":true},{"key":"status","title":"Status","type":"status"}]'
//     rows='[{"id":"1","name":"web-01","status":"running"}]'
//     row-actions='[{"key":"edit","label":"Edit","icon":"pencil"}]'></obs-table>
import { ref, computed, watch, useHost } from 'vue'

const props = defineProps({
  columns: { type: [String, Array], default: '' }, // [{key,title,width?,align?,sortable?,type?,cls?}] JSON/array
  rows: { type: [String, Array], default: '' },     // [{id, …}] JSON/array
  rowKey: { type: String, default: 'id' },
  headerStyle: { type: String, default: 'default' }, // default (transparent .k-grid) | tinted (.item-list-table)
  selectable: { type: Boolean, default: false },     // checkbox column + select-all (composes obs-checkbox)
  selected: { type: [String, Array], default: '' },  // selected id array; reflects to el.selected (JSON)
  hideSelectionInfo: { type: Boolean, default: false }, // hide the "N items selected" tag
  rowActions: { type: [String, Array], default: '' }, // [{key,label,icon,danger?}] → a ⋯ actions menu per row
  expandable: { type: Boolean, default: false },     // a chevron column; each row's `detail` (HTML) opens below
  groupBy: { type: String, default: '' },            // group rows under collapsible group-header rows by a column key
  groupCollapsible: { type: [Boolean, String], default: true }, // false → pivot / report grid: no chevron, all rows always shown
  tree: { type: Boolean, default: false },            // hierarchical rows: each row has `children`; chevron + indent per level
  editable: { type: Boolean, default: false },        // inline editing: a pencil per row; editable columns become obs-inputs + Save/Cancel
  variant: { type: String, default: "default" }, // default | bordered (internal grid, no outer frame) | borderless-rows (no row dividers, airy)
  hideHeader: { type: Boolean, default: false },      // hide the header row (compact widget grids)
  stickyHeader: { type: [Boolean, String], default: false }, // pin the header while the body scrolls (needs a bounded height — set max-height)
  maxHeight: { type: String, default: '' },           // cap the grid height + scroll the body (e.g. "420px"); pairs with sticky-header
  sortable: { type: [Boolean, String], default: true }, // false/"false" turns column sorting off (default on)
  sort: { type: String, default: '' },                // initial sort "key:asc|desc" (the product's default-sort)
  pageSize: { type: Number, default: 0 },             // 0 → no pagination; product default is 50
  page: { type: Number, default: 1 },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: 'No records found' },
  fullWidth: { type: Boolean, default: false }, // FLUSH edge-to-edge: first cell's left pad + last cell's right pad removed; rules/dividers/hover span the whole width (default = the slight inset)
})
const emit = defineEmits(['change', 'sort', 'rowaction', 'pagechange', 'rowclick', 'edit', 'save', 'canceledit', 'cellaction'])
const bool = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const host = useHost()

const parseArr = (v, d = []) => {
  if (Array.isArray(v)) return v
  const s = String(v || '').trim()
  if (!s) return d
  if (s.startsWith('[')) { try { return JSON.parse(s) } catch { return d } }
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}
// sortable is [Boolean,String] so attr="false" turns it off (a pure Boolean would coerce "false" → true)
const sortOn = computed(() => props.sortable !== false && props.sortable !== 'false' && props.sortable !== '0' && props.sortable !== 'no')
const cols = computed(() => parseArr(props.columns).map((c) => (typeof c === 'string' ? { key: c, title: c } : c)))
// PRIMARY column = the clickable record name (bolder + dotted-underline-on-row-hover). Auto = the first data column;
// an explicit `primary:true` on any column def overrides the auto-first (so a non-first column can be the primary one).
const hasExplicitPrimary = computed(() => cols.value.some((c) => c && c.primary === true))
const isPrimary = (c, ci) => (!!c && c.primary === true) || (!hasExplicitPrimary.value && ci === 0)
const allRows = computed(() => parseArr(props.rows))
const rowActs = computed(() => parseArr(props.rowActions))
// intrinsic min-width so the table HORIZONTAL-scrolls (rather than crushing columns) when the viewport is narrow.
// Each data column needs ~132px to stay readable; the checkbox/expand/action columns are ~44px. When the .box
// (scroll region) is wider than this, columns distribute at their declared widths and nothing scrolls.
const gridMinWidth = computed(() => {
  const extras = (props.selectable ? 44 : 0) + (props.expandable ? 44 : 0) + (rowActs.value.length ? 48 : 0)
  const perCol = cols.value.reduce((sum, c) => {
    const px = c.minWidth != null ? parseInt(c.minWidth, 10) : (/^\d+px$/.test(String(c.width)) ? parseInt(c.width, 10) : 0)
    return sum + (px > 0 ? px : 132)
  }, 0)
  return (extras + perCol) + 'px'
})
const actItems = computed(() => JSON.stringify(rowActs.value))

const parseSel = (v) => {
  if (Array.isArray(v)) return v.map(String)
  const s = String(v || '').trim()
  if (!s) return []
  if (s.startsWith('[')) { try { return JSON.parse(s).map(String) } catch { /* fall through */ } }
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}
const sel = ref(parseSel(props.selected))
watch(() => props.selected, (v) => { sel.value = parseSel(v) })

const initSort = String(props.sort || '').split(':')
const sortKey = ref(initSort[0] || '')
const sortDir = ref(initSort[1] === 'desc' ? 'desc' : 'asc')
watch(() => props.sort, (v) => { const s = String(v || '').split(':'); sortKey.value = s[0] || ''; sortDir.value = s[1] === 'desc' ? 'desc' : 'asc' })
const curPage = ref(props.page || 1)
watch(() => props.page, (v) => { curPage.value = v || 1 })

const rowId = (r) => r[props.rowKey]
const selSet = computed(() => new Set(sel.value.map(String)))
const isSel = (r) => selSet.value.has(String(rowId(r)))
// page size: the prop is the default; the pager's "items per page" select can override it locally.
const sizeOverride = ref(null)
const size = computed(() => sizeOverride.value ?? props.pageSize)
const paged = computed(() => size.value > 0)
// the smallest selectable page size (obs-pagination's options floor at 10). Below this many rows there is nothing to
// paginate, so the whole footer (pager + legend) is hidden — it only appears once there are ≥ minPageSize rows.
const minPageSize = computed(() => Math.min(size.value, 10))
const showPager = computed(() => paged.value && sorted.value.length >= minPageSize.value)

const sorted = computed(() => {
  if (!sortKey.value) return allRows.value
  return allRows.value.slice().sort((a, b) => (sortDir.value === 'asc' ? 1 : -1) *
    String(a[sortKey.value] ?? '').localeCompare(String(b[sortKey.value] ?? ''), undefined, { numeric: true }))
})
const pageRows = computed(() => {
  if (!paged.value) return sorted.value
  const start = (curPage.value - 1) * size.value
  return sorted.value.slice(start, start + size.value)
})
const pageAllSel = computed(() => pageRows.value.length > 0 && pageRows.value.every((r) => isSel(r)))
// SOME (not all) rows on the page selected → the header select-all box shows the indeterminate (mixed) state
const someSel = computed(() => !pageAllSel.value && pageRows.value.some((r) => isSel(r)))
const colCount = computed(() => cols.value.length + (props.selectable ? 1 : 0) + (rowActs.value.length ? 1 : 0) + (props.expandable ? 1 : 0) + (props.editable ? 1 : 0))

// expandable detail rows / tree expand state (shared)
const expanded = ref(new Set())
const isExpanded = (r) => expanded.value.has(String(rowId(r)))
// tree: start fully expanded (the product's OID / hierarchy grids default-expand)
if (props.tree) { const seed = new Set(); const walk = (ns) => (ns || []).forEach((n) => { if (Array.isArray(n.children) && n.children.length) { seed.add(String(n[props.rowKey])); walk(n.children) } }); walk(allRows.value); expanded.value = seed }
function toggleExpand(r) { const s = new Set(expanded.value); const k = String(rowId(r)); s.has(k) ? s.delete(k) : s.add(k); expanded.value = s }

// grouping — collapsible group-header rows by a column value. groupCollapsible=false → pivot/report grid:
// no chevron, every child row always visible.
const collapsedGroups = ref(new Set())
// custom-element boolean attrs arrive as strings — group-collapsible="false" must read as false (not the truthy string).
const collapsible = computed(() => props.groupCollapsible !== false && props.groupCollapsible !== 'false' && props.groupCollapsible !== '0' && props.groupCollapsible !== 'no')
const isGroupOpen = (name) => (!collapsible.value ? true : !collapsedGroups.value.has(name))
function toggleGroup(name) { if (!collapsible.value) return; const s = new Set(collapsedGroups.value); s.has(name) ? s.delete(name) : s.add(name); collapsedGroups.value = s }
const groups = computed(() => {
  if (!props.groupBy) return null
  const m = new Map()
  for (const r of pageRows.value) { const k = String(r[props.groupBy] ?? '—'); if (!m.has(k)) m.set(k, []); m.get(k).push(r) }
  return [...m.entries()].map(([name, rows]) => ({ name, rows }))
})
// tree / hierarchical: rows have `children`; flatten with a level, expanding via the shared `expanded` set
function flattenTree(nodes, level, out) {
  for (const n of (nodes || [])) {
    const hasKids = Array.isArray(n.children) && n.children.length > 0
    out.push({ ...n, __level: level, __hasKids: hasKids })
    if (hasKids && isExpanded(n)) flattenTree(n.children, level + 1, out)
  }
  return out
}
const treeFlat = computed(() => flattenTree(allRows.value, 0, []))

// inline editing — a pencil per row; while a row is edited its `editable` columns become obs-inputs + Save/Cancel
const editingId = ref(null)
const draft = ref({})
const isEditing = (r) => editingId.value != null && String(rowId(r)) === String(editingId.value)
const hasEditCol = computed(() => props.editable)
function startEdit(r) { editingId.value = rowId(r); draft.value = { ...r }; emit('edit', rowId(r)) }
function onDraftInput(key, e) { const v = (e.detail && e.detail[0]) ?? (e.target && e.target.value) ?? ''; draft.value = { ...draft.value, [key]: v } }
function saveEdit(r) { emit('save', { id: rowId(r), values: { ...draft.value } }); editingId.value = null; draft.value = {} }
function cancelEdit() { editingId.value = null; draft.value = {}; emit('canceledit') }
// flatten groups (+ collapse) OR tree OR the plain page rows into a render list; a group marker carries __group/__count
const displayRows = computed(() => {
  if (props.tree) return treeFlat.value
  if (!groups.value) return pageRows.value
  const out = []
  for (const g of groups.value) { out.push({ __group: g.name, __count: g.rows.length }); if (isGroupOpen(g.name)) out.push(...g.rows) }
  return out
})

// pager changes come from the composed <obs-pagination>; apply them to the row-slice state and re-emit obs-table's
// own `pagechange` so consumers listening on <obs-table> still get it (API preserved after the extraction).
// NOTE: defineCustomElement wraps emit() payloads as an ARRAY on the CustomEvent (e.detail = [value]) — unwrap it,
// or the guard below rejects it and paging silently no-ops (the pager's range updates but the ROWS never re-slice).
const evVal = (e) => (Array.isArray(e.detail) ? e.detail[0] : e.detail)
function onPagerPage(e) { const p = evVal(e); if (typeof p === 'number') { curPage.value = p; emit('pagechange', p) } }
function onPagerSize(e) { const s = evVal(e); if (typeof s === 'number') { sizeOverride.value = s; curPage.value = 1; emit('pagechange', 1) } }

function reflect() {
  if (host) { try { const s = JSON.stringify(sel.value); if (host.selected !== s) host.selected = s } catch (e) { /* readonly */ } }
  emit('change', sel.value.slice())
}
function onRowCheck(r, e) {
  const on = e.target && e.target.checked
  const id = String(rowId(r))
  sel.value = on ? [...new Set([...sel.value, id])] : sel.value.filter((x) => x !== id)
  reflect()
}
function onSelectAll(e) {
  const on = e.target && e.target.checked
  const ids = pageRows.value.map((r) => String(rowId(r)))
  sel.value = on ? [...new Set([...sel.value, ...ids])] : sel.value.filter((x) => !ids.includes(x))
  reflect()
}
function clearSel() { sel.value = []; reflect() }
function onSort(c) {
  // every column is sortable by default; a column opts out only with sortable:false
  if (!sortOn.value || c.sortable === false) return
  if (sortKey.value === c.key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = c.key; sortDir.value = 'asc' }
  emit('sort', { key: sortKey.value, dir: sortDir.value })
}
function onRowAction(r, e) { const key = (e.detail && e.detail[0]) ?? e.detail; emit('rowaction', { action: key, id: rowId(r) }) }

const cellVal = (r, c) => r[c.key] ?? ''
// interactive cell content (G1): switch/icon/link/button cells. Value can be a scalar (a boolean, an icon name, a
// label) or an object ({icon,label,text,href,variant,title}). Activating one emits `cellaction`.
const cellTruthy = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'
const cellObj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {})
// the visible label for a link/button cell — never stringify an object (an icon-only cell shows no text)
const cellLabel = (v) => { const o = cellObj(v); return o.text ?? o.label ?? (v && typeof v === 'object' ? '' : v) }
// A cell can carry TWO independent controls (G15): a link cell = a leading icon (e.g. ★ favourite) + text
// (e.g. the name → open). `part` tells the consumer WHICH sub-part was clicked ('icon' | 'text'), so one cell
// distinguishes "favourite this" from "open this" without reaching into the shadow root.
function onCellAction(r, c, type, e, part) {
  if (e && e.stopPropagation) e.stopPropagation() // don't also trigger row-click
  let value = cellVal(r, c)
  if (type === 'switch') value = Array.isArray(e?.detail) ? e.detail[0] : (e?.detail ?? !cellTruthy(value))
  emit('cellaction', { id: rowId(r), key: c.key, type, ...(part ? { part } : {}), value })
}
// severity level for the composed <obs-severity> (the DS severity indicator) — from the row's sev/severity field
const sevLevel = (r) => String(r.sev || r.severity || 'critical').toLowerCase().trim()
// a `sparkline` cell = an inline trend line from a numeric array → polyline points in an 80×18 viewBox
function sparkPoints(vals) {
  const a = Array.isArray(vals) ? vals : []
  if (a.length < 2) return ''
  const min = Math.min(...a); const max = Math.max(...a); const range = max - min || 1
  const w = 80; const h = 18; const pad = 2
  return a.map((v, i) => `${((i / (a.length - 1)) * w).toFixed(1)},${(h - pad - ((v - min) / range) * (h - 2 * pad)).toFixed(1)}`).join(' ')
}
// a `heat` cell = the whole cell tinted a threshold colour; the token comes from column.colorKey (e.g. "cpuC")
const heatBg = (r, c) => `var(${r[c.colorKey] || '--neutral-lighter'}, var(--neutral-lighter, #e3e8f2))`
// a `bar` cell = an inline relative-percent bar; value is 0-100
const barPct = (r, c) => Math.max(0, Math.min(100, Number(cellVal(r, c)) || 0))
// a `logo` cell = one or more COLOURED brand/vendor marks (obs-logo). Value can be a string name, an object
// ({name,variant?,size?,title?}), or an ARRAY of either → each rendered side by side. Default variant=color, size 18.
const cellLogos = (v) => (Array.isArray(v) ? v : [v])
  .filter((x) => x != null && x !== '')
  .map((x) => (x && typeof x === 'object' ? x : { name: String(x) }))
// multi-glyph `icon` cell: an ARRAY value → each item (a string name or {icon,label?,title?,size?}) as an obs-icon
const cellIcons = (v) => (Array.isArray(v) ? v : [])
  .filter((x) => x != null && x !== '')
  .map((x) => (x && typeof x === 'object' ? x : { icon: String(x) }))
</script>

<template>
  <div class="wrap">
    <!-- .body wraps the scroll region + the floating bulk-action bar (the relative anchor that centres it) -->
    <div class="body">
    <!-- .box is the SCROLL REGION: overflow:auto both axes → vertical scroll (sticky header) auto-appears when
         rows exceed the bounded height, horizontal scroll auto-appears when the table is wider than the box.
         maxHeight optionally caps a standalone table; otherwise .box fills the flex height of its container. -->
    <div class="box" :style="maxHeight ? { maxHeight } : null">
    <table class="grid" :class="['hs-' + headerStyle, 'v-' + variant, { 'hide-hdr': hideHeader, fw: fullWidth }]" :style="{ minWidth: gridMinWidth }">
      <thead>
        <tr>
          <th v-if="expandable" class="exp-col"></th>
          <th v-if="selectable" class="cbx-col"><obs-checkbox :checked="pageAllSel" :indeterminate="someSel" @change="onSelectAll"></obs-checkbox></th>
          <th v-for="(c, ci) in cols" :key="c.key" :title="c.title" :class="['al-' + (c.align || 'left'), { srt: sortOn && c.sortable !== false, sorted: sortKey === c.key, 'first-col': ci === 0 }]"
            :style="c.width ? { width: c.width } : null" @click="onSort(c)">
            <span class="th-in"><span class="th-lbl">{{ c.title }}</span><obs-icon v-if="sortOn && c.sortable !== false && sortKey === c.key" class="sarr"
              :name="sortDir === 'asc' ? 'longArrowUp' : 'longArrowDown'" size="11"></obs-icon></span>
          </th>
          <th v-if="rowActs.length" class="act-col"></th>
          <th v-if="editable" class="edit-col"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="r in displayRows" :key="r.__group ? 'g:' + r.__group : rowId(r)">
          <!-- group-header row (grouping) -->
          <tr v-if="r.__group !== undefined" class="row-group" :class="{ report: !collapsible }">
            <td :colspan="colCount"><span class="grp" :class="{ clickable: collapsible }" @click="toggleGroup(r.__group)"><obs-icon v-if="collapsible" :name="isGroupOpen(r.__group) ? 'chevronDown' : 'chevronRight'" size="11"></obs-icon>{{ r.__group }} <span v-if="collapsible" class="grp-count">({{ r.__count }})</span></span></td>
          </tr>
          <!-- data row -->
          <template v-else>
            <tr :class="{ 'row-selected': isSel(r), 'in-group': !!groupBy }" @click="emit('rowclick', rowId(r))">
              <td v-if="expandable" class="exp-col" @click.stop="toggleExpand(r)"><obs-icon :name="isExpanded(r) ? 'chevronDown' : 'chevronRight'" size="12" class="exp-ic"></obs-icon></td>
              <td v-if="selectable" class="cbx-col" @click.stop><obs-checkbox :checked="isSel(r)" :disabled="!!r.disabled" @change="onRowCheck(r, $event)"></obs-checkbox></td>
              <td v-for="(c, ci) in cols" :key="c.key" :class="['al-' + (c.align || 'left'), c.cls, { heat: c.type === 'heat', 'first-data': ci === 0, 'primary-cell': isPrimary(c, ci) }]"
                :style="c.type === 'heat' ? { background: heatBg(r, c) } : null">
                <!-- tree: indent + chevron on the first column -->
                <span v-if="tree && ci === 0" class="tree-lead" :style="{ marginLeft: (r.__level * 20) + 'px' }">
                  <obs-icon v-if="r.__hasKids" class="tree-chev" :name="isExpanded(r) ? 'chevronDown' : 'chevronRight'" size="12" @click.stop="toggleExpand(r)"></obs-icon>
                  <span v-else class="tree-spacer"></span>
                </span>
                <!-- inline edit: an editable column becomes an obs-input while this row is being edited -->
                <obs-input v-if="editable && isEditing(r) && c.editable" class="edit-input" :value="String(draft[c.key] ?? '')" @input="onDraftInput(c.key, $event)"></obs-input>
                <!-- heat: threshold-tinted cell, centered value -->
                <span v-else-if="c.type === 'heat'">{{ cellVal(r, c) }}</span>
                <!-- bar: inline relative-percent progress bar + label -->
                <span v-else-if="c.type === 'bar'" class="cell-bar"><span class="bar-track"><span class="bar-fill" :style="{ width: barPct(r, c) + '%', background: barPct(r, c) > 70 ? 'var(--severity-major, #f47c22)' : 'var(--primary-alt, #3279be)' }"></span></span><span class="bar-lbl">{{ barPct(r, c) }}%</span></span>
                <!-- severity: the DS <obs-severity> dot indicator + the row's name -->
                <span v-else-if="c.type === 'severity'" class="cell-sev">
                  <obs-severity :severity="sevLevel(r)" shape="dot"></obs-severity><span class="cell-clip" :class="{ 'primary-text': isPrimary(c, ci) }">{{ cellVal(r, c) }}</span>
                </span>
                <!-- severity DOT: the DS <obs-severity> dot + its capitalized level label (the cell value IS the level) -->
                <span v-else-if="c.type === 'dot'" class="cell-dot">
                  <obs-severity :severity="String(cellVal(r, c)).toLowerCase().trim()" shape="dot" display-text></obs-severity>
                </span>
                <obs-tag v-else-if="c.type === 'status'" :status="String(cellVal(r, c))"></obs-tag>
                <span v-else-if="c.type === 'type'" class="cell-type"><obs-icon name="server" size="15"></obs-icon><obs-icon name="cog" size="14" class="cog"></obs-icon></span>
                <span v-else-if="c.type === 'tags'" class="cell-tags"><obs-tag v-for="(t, ti) in (Array.isArray(cellVal(r, c)) ? cellVal(r, c) : [])" :key="ti" :variant="t.variant || 'default'">{{ t.label || t }}</obs-tag></span>
                <!-- sparkline / trend: an inline mini line chart from a numeric array -->
                <svg v-else-if="c.type === 'sparkline'" class="cell-spark" width="80" height="18" viewBox="0 0 80 18" preserveAspectRatio="none" aria-hidden="true"><polyline :points="sparkPoints(cellVal(r, c))" fill="none" stroke="var(--primary-alt, #3279be)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                <!-- G1: interactive cell content — reuse DS elements (obs-switch/obs-icon/obs-button) instead of escaping markup as text -->
                <obs-switch v-else-if="c.type === 'switch'" :checked="cellTruthy(cellVal(r, c))" @change="onCellAction(r, c, 'switch', $event)" @click.stop></obs-switch>
                <!-- logo: one or more COLOURED brand/vendor marks (obs-logo). A string/object = one; an array = several side by side (e.g. the inventory TYPE column) -->
                <span v-else-if="c.type === 'logo'" class="cell-logo"><obs-logo v-for="(g, gi) in cellLogos(cellVal(r, c))" :key="gi" :name="g.name" :variant="g.variant || 'color'" :size="g.size || 18" :label="g.title || g.label || ''"></obs-logo></span>
                <!-- icon (multi-glyph): an ARRAY value renders each glyph side by side (presentational); the single-value case below stays interactive -->
                <span v-else-if="c.type === 'icon' && Array.isArray(cellVal(r, c))" class="cell-icons"><obs-icon v-for="(g, gi) in cellIcons(cellVal(r, c))" :key="gi" :name="g.icon || g.name" :label="g.label || g.title || ''" :size="g.size || 16"></obs-icon></span>
                <obs-icon v-else-if="c.type === 'icon'" class="cell-ic-btn" :name="cellObj(cellVal(r, c)).icon || String(cellVal(r, c))" :label="cellObj(cellVal(r, c)).label || cellObj(cellVal(r, c)).title || c.title" size="16" role="button" tabindex="0" @click="onCellAction(r, c, 'icon', $event)" @keydown.enter="onCellAction(r, c, 'icon', $event)"></obs-icon>
                <a v-else-if="c.type === 'link'" class="cell-link" :href="cellObj(cellVal(r, c)).href || null" @click="onCellAction(r, c, 'link', $event, 'text')"><obs-icon v-if="cellObj(cellVal(r, c)).icon" :name="cellObj(cellVal(r, c)).icon" size="14" class="cell-link-ic" role="button" :aria-label="cellObj(cellVal(r, c)).iconLabel || 'action'" @click.stop.prevent="onCellAction(r, c, 'link', $event, 'icon')"></obs-icon>{{ cellLabel(cellVal(r, c)) }}</a>
                <obs-button v-else-if="c.type === 'button'" class="cell-btn" :variant="cellObj(cellVal(r, c)).variant || 'default'" size="small" @click="onCellAction(r, c, 'button', $event)"><obs-icon v-if="cellObj(cellVal(r, c)).icon" :name="cellObj(cellVal(r, c)).icon" size="13"></obs-icon>{{ cellLabel(cellVal(r, c)) }}</obs-button>
                <span v-else class="cell-clip" :class="{ 'primary-text': isPrimary(c, ci) }">{{ cellVal(r, c) }}</span>
              </td>
              <td v-if="rowActs.length" class="act-col" @click.stop><obs-menu :items="actItems" placement="bottom-end" @select="onRowAction(r, $event)"></obs-menu></td>
              <td v-if="editable" class="edit-col" @click.stop>
                <span v-if="isEditing(r)" class="edit-acts"><obs-link class="edit-save" @click.prevent="saveEdit(r)">Save</obs-link><obs-link class="edit-cancel" muted @click.prevent="cancelEdit()">Cancel</obs-link></span>
                <obs-icon v-else name="pencil" size="14" class="edit-pencil" title="Edit row" @click="startEdit(r)"></obs-icon>
              </td>
            </tr>
            <!-- expandable detail row — empty leading cells align the detail with the FIRST DATA column (like .ds-grid-detail) -->
            <tr v-if="expandable && isExpanded(r)" class="row-detail">
              <td class="exp-col"></td>
              <td v-if="selectable" class="cbx-col"></td>
              <td class="detail-cell" :colspan="cols.length + (rowActs.length ? 1 : 0)"><div class="detail" v-html="r.detail || 'No detail'"></div></td>
            </tr>
          </template>
        </template>
        <tr v-if="loading"><td :colspan="colCount" class="state"><obs-icon name="spinnerThird" size="20" class="spin"></obs-icon>Loading…</td></tr>
        <tr v-else-if="!displayRows.length"><td :colspan="colCount" class="state">{{ emptyText }}</td></tr>
      </tbody>
    </table>
    </div>
    <!-- floating BULK ACTION BAR — the DS bulk toolbar (obs-toolbar variant="bulk"), sticky-CENTERED just ABOVE the
         pager, appears when rows are selected (SaaS-style). obs-table provides the count + `clear`; the consumer
         supplies the action buttons via the `bulk-actions` slot. Replaces the old top "N items selected" pill. -->
    <div v-if="selectable && sel.length" class="bulkbar">
      <obs-toolbar variant="bulk" :count="sel.length" @clear="clearSel"><slot name="bulk-actions"></slot></obs-toolbar>
    </div>
    </div>

    <!-- pager = the STICKY FOOTER: the standalone <obs-pagination> DS component (extracted so any view reuses it). It
         lives OUTSIDE .box so it stays pinned at the bottom while rows scroll. obs-table drives it (total/page/page-size)
         + applies its change events to the row-slice state; the `footer` slot forwards into obs-pagination's CENTER
         slot (a legend → the CENTERED footer variant; empty → the SPLIT variant). -->
    <obs-pagination v-if="showPager" class="pager" :total="sorted.length" :page="curPage" :page-size="size"
      @pagechange="onPagerPage" @sizechange="onPagerSize"><slot name="footer"></slot></obs-pagination>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
/* the element is a FLEX COLUMN: header (in .box) → scrolling rows (.box) → pinned pager. When the host is given a
   bounded height (placed in a bounded flex/grid cell), the body scrolls with a sticky header + pinned footer;
   when the host is unbounded (normal flow) it grows to content and nothing scrolls internally. AUTO either way. */
:host { font-family: var(--font-family, 'Poppins', sans-serif); display: flex; flex-direction: column; min-height: 0; }
.wrap { display: flex; flex-direction: column; min-height: 0; flex: 1 1 auto; }
/* .body = the scroll region + the floating bulk bar's positioning context (fills the height above the pager) */
.body { position: relative; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
/* floating BULK ACTION BAR — centred, pinned just above the pager, floats OVER the last rows (SaaS pattern). The
   obs-toolbar bulk variant carries its own card chrome (border + shadow); here we only position it + animate it in. */
.bulkbar { position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 12; max-width: calc(100% - 24px);
  animation: bulk-in .18s cubic-bezier(.2, .8, .2, 1); }
@keyframes bulk-in { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }

/* the product LIST grid is BORDERLESS — horizontal rules only. .box is the SCROLL REGION (both axes): vertical
   scroll (with the sticky header) appears when rows exceed the bounded height; horizontal scroll appears when the
   table's min-width exceeds the box (many columns / narrow viewport). Both are automatic (overflow:auto). */
.box { flex: 1 1 auto; min-height: 0; overflow: auto; background: var(--page-background-color, #fff); }
/* sticky header — pinned to the top of the scroll region; OPAQUE bg so scrolling rows don't show through. */
.grid thead th { position: sticky; top: 0; z-index: 2; }
.box.sticky .grid.hs-tinted thead th { background: var(--grid-header-bg, #ecf1f9); }
/* table-layout:fixed → columns respect their widths, so long text/name cells TRUNCATE to one line (ellipsis)
   instead of wrapping to two. Give the important columns a `width` so the fixed layout distributes sensibly. */
.grid { width: 100%; font-size: 13px; color: var(--page-text-color, #1d2a3e); border-collapse: collapse; table-layout: fixed; }
/* single-line truncation for text + severity-name cells (the record name stays one row, tail ellipsised) */
.cell-clip { display: block; min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* vertically CENTER every cell's content (default td vertical-align is baseline → top-ish when a row is taller
   than a cell). Covers all variants + all cell types: checkbox · severity · type · status tag · text · actions. */
/* center every cell AND its inline children (the composed obs-checkbox/obs-menu/obs-tag carry their own baseline,
   so td vertical-align alone leaves a few px — align the children by their box middle too). */
.grid th, .grid td { vertical-align: middle; }
.grid td > *, .grid th > * { vertical-align: middle; }
/* the composed elements default to display:inline, so their host box is font-line-height sized (15px) while the
   visible content is taller (tag 22px, checkbox 19px) → it overflows and centering is thrown off. Force the host
   to size to its content so vertical-align:middle centers the VISIBLE box. */
.grid td obs-checkbox, .grid td obs-menu, .grid td obs-tag, .grid td obs-icon, .grid td obs-severity, .grid td obs-logo,
.grid th obs-checkbox, .grid th obs-icon { display: inline-flex; vertical-align: middle; }

/* header gets a TOP rule too (a line ABOVE the header) — with the per-th bottom rule below this = a rule ABOVE
   AND BELOW the header, matching the product. */
/* header rules as INSET box-shadows, not borders: a sticky <th>'s own border-bottom is clipped/scrolled away when the
   header pins and rows slide under it (bottom divider vanished on scroll). An OUTSET bottom shadow fixed the scrolled
   case but got occluded by the first row AT REST. INSET shadows paint INSIDE the cell's own border-box — always
   rendered in both states, never clipped by overflow or occluded by a sibling row. `inset 0 1px` = top rule at the
   cell's top edge; `inset 0 -1px` = bottom divider at the cell's bottom edge. */
.grid thead th { box-shadow: inset 0 1px 0 0 var(--border-color, #e3e8f2), inset 0 -1px 0 0 var(--border-color, #e3e8f2); }
/* DEFAULT header = the .k-grid header: transparent + UPPERCASE + letter-spacing + 600, COMPACT height (py-1),
   just a bottom rule. Shorter than the data rows (product proportion). */
.grid.hs-default th { padding: 6px 16px; font-size: 0.75rem; font-weight: 600; letter-spacing: .25px; text-transform: uppercase;
  color: var(--text-color-common-primery, #516381); text-align: left; white-space: nowrap;
  background: var(--page-background-color, #fff); }  /* OPAQUE so scrolling rows don't show through the sticky header; the top+bottom rules come from the thead th box-shadow (sticky-safe) */
/* TINTED header = the item-list-table variant (tinted bar, normal case) */
/* text uses --text-color-common-primery (same as the default header) — it flips to light in dark mode; --neutral-dark
   would go near-black (#172336) on the dark tinted bar and vanish. */
.grid.hs-tinted th { padding: 4px 16px; font-size: 0.7rem; font-weight: 500; letter-spacing: 0; text-transform: none;
  color: var(--text-color-common-primery, #2b394f); text-align: left; white-space: nowrap; background: var(--grid-header-bg, #f4f7fb); }
.grid th.srt { cursor: pointer; transition: background 0.12s; }
/* header cell hover — a minor tint so it reads as clickable-to-sort (applies to every sortable column) */
.grid th.srt:hover { background: var(--grid-header-hover-bg, var(--neutral-lightest, #ecf1f9)); }
.grid th.sorted .th-in { color: var(--primary, #111c2c); } /* sorted column → --primary text + arrow (arrow inherits) */
/* header label TRUNCATES with an ellipsis on overflow (narrow / many-column tables show "CURRENT VE…" like the
   product, not a wrapped/overflowing header). The full text stays reachable via the th `title` tooltip. */
.th-in { display: inline-flex; align-items: center; min-width: 0; max-width: 100%; }
.th-lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; max-width: 100%; }
.sarr { margin-left: 6px; flex: 0 0 auto; }

/* row dividers are SOFTER (lighter) than the header rules — header uses --border-color, rows use --neutral-lightest */
.grid td { padding: 9px 16px; border-bottom: 1px solid var(--neutral-lightest, #ecf1f9); }
.grid tbody tr:last-child td { border-bottom: none; }
.grid tbody tr:hover td { background: var(--grid-header-hover-bg, rgba(165, 186, 208, .4)); }
/* selected row = the left --primary accent bar + the checked box ONLY (no fill) — the checkbox is the primary
   indicator; a background fill was too heavy. Hover still tints (above). */
.grid tbody tr.row-selected td:first-child { box-shadow: inset 2px 0 0 var(--primary, #111c2c); }
.al-right { text-align: right; } .al-center { text-align: center; }
/* line-height:0 so the text-less composed element (obs-checkbox/obs-menu) isn't offset by the cell's line box.
   No right padding + a tight left pad on the following column so the checkbox sits close to the first column
   (avoids the double-16px gap: checkbox cell pad-right + first-column pad-left). */
.grid th.cbx-col, .grid td.cbx-col { width: 34px; line-height: 0; padding-left: 10px; padding-right: 0; }
.grid th.cbx-col + th, .grid td.cbx-col + td { padding-left: 6px; }
/* selection checkbox keeps the leaf default SIZE; obs-checkbox itself now uses a softer 4px corner radius. */
/* non-selectable tables: tighten the leading DATA cell's left inset to the product's compact left gutter (~12px).
   When selectable, the leading data cell follows .cbx-col and keeps its tighter 6px (higher-specificity rule above). */
.grid td.first-data, .grid th.first-col { padding-left: 12px; }
.act-col { width: 48px; text-align: center; line-height: 0; }
.exp-col { line-height: 0; }
.state { text-align: center; padding: 28px 0; color: var(--neutral-light, #6a7fa0); }
.state .spin { animation: obs-tbl-spin 0.9s linear infinite; margin-right: 8px; vertical-align: middle; }
@keyframes obs-tbl-spin { to { transform: rotate(360deg); } }

/* style variants (borders / header visibility) */
/* bordered — internal cell grid (column + row dividers), but NO outer left/right frame */
.grid.v-bordered th, .grid.v-bordered td { border: 1px solid var(--border-color, #e3e8f2); }
.grid.v-bordered tr > :first-child { border-left: none; }
.grid.v-bordered tr > :last-child { border-right: none; }
/* borderless-rows — no row dividers (just the header underline), airy row spacing */
.grid.v-borderless td, .grid.v-borderless-rows td { border-bottom: none; padding-top: 10px; padding-bottom: 10px; }
.grid.hide-hdr thead { display: none; }

/* full-width (full-bleed) — the table BREAKS OUT of the page's horizontal gutter to touch the left & right edges
   of its region, via negative margins sized by --table-bleed (default 20px = the standard page gutter; a page
   with a different gutter sets --table-bleed to match). The CELL padding is UNCHANGED — the space before the
   first column's content stays. Default (no .fw) keeps the table inside the page gutter. */
.grid.fw {
  margin-left: calc(-1 * var(--table-bleed, 20px));
  margin-right: calc(-1 * var(--table-bleed, 20px));
  width: calc(100% + 2 * var(--table-bleed, 20px));
}

/* PRIMARY (first / primary:true) column — the clickable record NAME. Heavier weight than the rest of the row (500
   vs 400), and a DOTTED UNDERLINE on the name when its ROW is hovered (the product's clickable-name affordance).
   Works for a `text` first column AND a `severity` first column (the NAME text inside cell-sev). No JS. */
.grid td.primary-cell, .grid td.primary-cell .primary-text { font-weight: 500; }
.grid tbody tr:hover td.primary-cell .primary-text { text-decoration: underline dotted; text-underline-offset: 2px; }

/* grouping — a group-header row (real Kendo .k-grouping-row: --primary-alt on a highlight) */
/* group-header row — neutral grey band; a 2px page-bg divider separates adjacent (esp. collapsed) group bands
   since the --border-color row rule is invisible against the grey. */
.row-group td { font-weight: 600; color: var(--primary-alt, #1d2a3e); background: var(--neutral-lighter, #e3e8f2);
  border-bottom: 2px solid var(--page-background-color, #fff); }
.grp { display: inline-flex; align-items: center; gap: 8px; }
.grp.clickable { cursor: pointer; }
.grp-count { color: var(--neutral-light, #6a7fa0); font-weight: 400; }
/* report / pivot grid — non-collapsible: no chevron, plain band, children always visible */
.row-group.report td { background: var(--grid-header-bg, #ecf1f9); }

/* inline editing — pencil per row + the edit-cell controls */
.edit-col { width: 110px; text-align: left; line-height: 0; }
.edit-pencil { cursor: pointer; color: var(--neutral-light, #6a7fa0); }
.edit-pencil:hover { color: var(--primary-alt, #3279be); }
.edit-acts { display: inline-flex; align-items: center; gap: 12px; line-height: normal; }
/* Save / Cancel are DS obs-link — the dotted-underline treatment (obs-link owns colour/underline) */
.grid td .edit-acts obs-link { display: inline-flex; vertical-align: middle; font-size: 0.75rem; }
.grid td .edit-input { display: inline-flex; vertical-align: middle; width: 100%; min-width: 90px; }

/* expandable — a NARROW chevron column + detail row */
.exp-col { width: 18px; text-align: center; }
.grid th.exp-col, .grid td.exp-col { padding-left: 6px; padding-right: 4px; }
.exp-ic { cursor: pointer; color: var(--neutral-light, #6a7fa0); }
/* detail row — the ENTIRE row gets a light fill (no border); the content still starts at the first DATA column. */
.row-detail td { border-bottom: none; background: var(--neutral-lightest, #ecf1f9); }
.row-detail .detail-cell { padding: 0; }
.detail { padding: 10px 16px; font-size: 12px; color: var(--page-text-color, #1d2a3e); }

/* grouped child rows — indent the first cell so the content aligns under the group-header NAME (like expandable) */
.grid tbody tr.in-group td:first-child { padding-left: 36px; }

/* cells */
.cell-tags { display: inline-flex; gap: 6px; flex-wrap: wrap; }
/* heat (threshold-tinted) cell + bar (relative-percent) cell */
.grid td.heat { color: var(--white-regular, #fff); font-weight: 600; text-align: center; }
.cell-bar { display: inline-flex; align-items: center; gap: 8px; width: 100%; }
.bar-track { flex: 1; height: 6px; border-radius: 3px; background: var(--neutral-lighter, #e3e8f2); overflow: hidden; }
.bar-fill { display: block; height: 100%; border-radius: 3px; }
.bar-lbl { font-size: 11px; color: var(--neutral-regular, #7186a8); flex: 0 0 auto; }
/* tree / hierarchical — indent + chevron on the first cell */
.tree-lead { display: inline-flex; align-items: center; vertical-align: middle; }
.tree-chev { cursor: pointer; color: var(--neutral-light, #6a7fa0); margin-right: 8px; }
.tree-spacer { display: inline-block; width: 20px; }
/* severity / dot cells compose <obs-severity> (the DS severity indicator); the wrapper just aligns it with the label */
.cell-sev, .cell-dot { display: inline-flex; align-items: center; gap: 8px; min-width: 0; max-width: 100%; }
.cell-spark { display: block; color: var(--primary-alt, #3279be); }
.cell-type { display: inline-flex; align-items: center; gap: 6px; color: var(--neutral-regular, #7186a8); }
.cell-type .cog { color: var(--primary-alt, #3279be); }
/* logo cell — one or more COLOURED brand/vendor marks (obs-logo); multi-glyph icon cell — glyphs side by side */
.cell-logo, .cell-icons { display: inline-flex; align-items: center; gap: 6px; }
/* G1 interactive cells */
.cell-ic-btn { color: var(--neutral-light, #6a7fa0); cursor: pointer; }
.cell-ic-btn:hover { color: var(--primary, #111c2c); }
.cell-link { display: inline-flex; align-items: center; gap: 5px; color: var(--primary-alt, #3279be); text-decoration: none; cursor: pointer; }
.cell-link:hover { text-decoration: underline; }
.cell-link-ic { color: var(--neutral-light, #6a7fa0); flex: 0 0 auto; }
.cell-btn { display: inline-flex; }

/* the composed <obs-pagination> IS the pinned footer. Its internals (squares, seek glyphs, size select, range, center
   slot) live in ITS OWN shadow DOM; here we just pin it in the table's flex column and draw the divider above it. */
.pager { flex: 0 0 auto; display: block; border-top: 1px solid var(--border-color, #e3e8f2); }
</style>
