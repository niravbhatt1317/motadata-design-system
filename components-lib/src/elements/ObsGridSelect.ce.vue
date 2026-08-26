<script setup>
// <obs-grid-select> — the DS "grid / table dropdown" (FlotoDropdownGridSelector + MonitorPicker/AgentPicker,
// ~70×). A dropdown whose menu is a SEARCHABLE TABLE, not an option list: columns · per-row checkboxes ·
// sortable header · a search box · a selected-count badge + View Selected / Clear Selected. Rich cells via a
// column `type` (text · status · severity · type-icons). The "Select Agent / Select Monitor" picker.
//
//   <obs-grid-select placeholder="Select Agent" multiple
//     columns='[{"key":"name","title":"MONITOR","type":"severity","sortable":true},{"key":"ip","title":"IP"},
//               {"key":"type","title":"TYPE","type":"type"},{"key":"status","title":"STATUS","type":"status"}]'
//     rows='[{"id":"a1","name":"web-01","ip":"10.0.0.1","status":"running","sev":"critical"}]'></obs-grid-select>
//
// Menu renders in the top layer (Popover API) so it escapes transform-animated ancestors (e.g. a drawer).
import { ref, computed, watch, nextTick, onBeforeUnmount, useHost } from 'vue'
// icons come from the reusable <obs-icon> element (the DS icon library) — no inlined SVG.
// The dropdown's grid IS the DS <obs-table> (selectable + sortable + the same severity/status/type cell types) —
// grid-select owns only the trigger + search + selected-actions chrome, and drives obs-table's selection.

const props = defineProps({
  columns: { type: [String, Array], default: '' }, // [{key,title,width?,align?,sortable?,type?}] JSON/array
  rows: { type: [String, Array], default: '' },     // [{id, …}] JSON/array
  value: { type: [String, Array], default: '' },     // selected id (single) or comma/JSON ids (multi)
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Select' },
  rowKey: { type: String, default: 'id' },
  searchable: { type: [Boolean, String], default: true },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})
const emit = defineEmits(['change', 'search', 'show', 'hide'])
const host = useHost()

const off = (v) => v === false || v === 'false'
const isSearchable = computed(() => !off(props.searchable))
const parseArr = (v, d = []) => {
  if (Array.isArray(v)) return v
  const s = String(v || '').trim()
  if (!s) return d
  if (s.startsWith('[')) { try { return JSON.parse(s) } catch { return d } }
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}
const cols = computed(() => parseArr(props.columns).map((c) => (typeof c === 'string' ? { key: c, title: c } : c)))
const allRows = computed(() => parseArr(props.rows))
// parse the selected value: a real array, a JSON array string (['a1'] — what reflect() writes for multiple),
// or a comma list. Must round-trip with reflect() or selection corrupts (JSON string re-split as one literal).
const parseVal = (v) => {
  if (Array.isArray(v)) return v.map(String)
  const s = String(v || '').trim()
  if (!s) return []
  if (s.startsWith('[')) { try { return JSON.parse(s).map(String) } catch { /* fall through */ } }
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}
const selected = ref(parseVal(props.value))
watch(() => props.value, (v) => { selected.value = parseVal(v) })

const open = ref(false)
const q = ref('')
const listMode = ref('all') // all | selected  (sorting is handled inside obs-table)
const rootRef = ref(null)
const menuRef = ref(null)
const searchRef = ref(null)
const menuPos = ref({})

const selCount = computed(() => selected.value.length)
const rowId = (r) => r[props.rowKey]
const triggerLabel = computed(() => {
  if (!selCount.value) return props.placeholder
  const first = allRows.value.find((r) => rowId(r) === selected.value[0])
  const name = first ? (first.name ?? first.label ?? rowId(first)) : selected.value[0]
  return selCount.value > 1 ? `${name} (+${selCount.value - 1})` : name
})
// the rows the inner obs-table renders: search-filtered + (optionally) limited to the selected set.
// Sorting + selection UI (checkboxes, select-all, highlight) are obs-table's job.
const view = computed(() => {
  const s = q.value.toLowerCase()
  let r = allRows.value.filter((row) => !s || cols.value.some((c) => String(row[c.key] ?? '').toLowerCase().includes(s)))
  if (listMode.value === 'selected') r = r.filter((row) => selected.value.includes(rowId(row)))
  return r
})
// pass columns/rows/selection to <obs-table> as JSON strings (robust across the custom-element boundary)
const colsJson = computed(() => JSON.stringify(cols.value))
const viewJson = computed(() => JSON.stringify(view.value))
const selJson = computed(() => JSON.stringify(selected.value))

// obs-table emit args arrive as event.detail[0] (Vue custom-element convention)
const detail0 = (e) => (e && e.detail && e.detail[0])
function reflect() {
  const out = props.multiple ? selected.value.slice() : (selected.value[0] ?? '')
  if (host) { try { const s = props.multiple ? JSON.stringify(out) : String(out); if (host.value !== s) host.value = s } catch (e) { /* readonly */ } }
  emit('change', out)
}
// multi: obs-table's checkbox / select-all give us the full selected array
function onTableChange(e) { if (!props.multiple) return; selected.value = (detail0(e) || []).map(String); reflect() }
// a row-body click — single: pick one + close; multi: toggle it (whole-row click, like the product)
function onRowPick(e) {
  const id = detail0(e); if (id == null) return
  if (props.multiple) selected.value = selected.value.map(String).includes(String(id)) ? selected.value.filter((x) => String(x) !== String(id)) : [...selected.value, id]
  else { selected.value = [id]; closeMenu() }
  reflect()
}
function clearSelected() { selected.value = []; listMode.value = 'all'; reflect() }
function onSearch(e) { q.value = e.target.value; emit('search', q.value) }

function positionMenu() {
  nextTick(() => {
    const r = rootRef.value && rootRef.value.getBoundingClientRect()
    if (!r) return
    // floor at 720px so the header (search + count + View Selected | Clear Selected) fits on ONE line with room to
    // spare, and more of the table columns are visible; still grows to the trigger's width when that is wider
    menuPos.value = { position: 'fixed', inset: 'auto', margin: '0', left: `${Math.round(r.left)}px`, top: `${Math.round(r.bottom + 4)}px`, width: `${Math.max(Math.round(r.width), 720)}px` }
    const m = menuRef.value
    if (m && m.showPopover) { try { m.showPopover() } catch (e) { /* already open */ } if (isSearchable.value && searchRef.value) searchRef.value.focus({ preventScroll: true }) }
  })
}
function openMenu() { if (props.disabled) return; open.value = true; emit('show'); positionMenu() }
function closeMenu() { if (!open.value) return; open.value = false; const m = menuRef.value; if (m && m.hidePopover) { try { m.hidePopover() } catch (e) {} } emit('hide') }
function toggleMenu() { open.value ? closeMenu() : openMenu() }
function onDocClick(e) { if (!open.value) return; const p = e.composedPath ? e.composedPath() : []; if (p.includes(rootRef.value) || p.includes(menuRef.value)) return; closeMenu() }
if (typeof document !== 'undefined') document.addEventListener('click', onDocClick, true)
onBeforeUnmount(() => { if (typeof document !== 'undefined') document.removeEventListener('click', onDocClick, true) })

</script>

<template>
  <div ref="rootRef" class="gs" :class="{ open, disabled, block }">
    <!-- trigger (input-style: selection + chevron) -->
    <button type="button" class="trig" :disabled="disabled" @click.stop="toggleMenu">
      <span class="tlabel" :class="{ ph: !selCount }">{{ triggerLabel }}</span>
      <obs-icon class="chev" :class="{ up: open }" name="angleDown" size="12"></obs-icon>
    </button>

    <!-- menu: search + selected actions + table (top layer via popover) -->
    <div v-if="open" ref="menuRef" popover="manual" class="menu" :style="menuPos">
      <div class="head">
        <div v-if="isSearchable" class="srch">
          <obs-icon name="search" size="13"></obs-icon>
          <input ref="searchRef" :value="q" placeholder="Search" @input.stop="onSearch" />
        </div>
        <div v-if="multiple && selCount" class="selacts">
          <span class="badge">{{ selCount }}</span>
          <a class="lnk" @click="listMode = listMode === 'selected' ? 'all' : 'selected'">{{ listMode === 'selected' ? 'View All' : 'View Selected' }}</a>
          <span class="sep">|</span>
          <a class="lnk" @click="clearSelected">Clear Selected</a>
        </div>
      </div>
      <!-- the grid IS the DS <obs-table>: selectable checkboxes (multi) · sortable headers · severity/status/type
           cells. grid-select owns selection state and drives it via :selected + @change/@rowclick. -->
      <div class="gtbl">
        <obs-table
          :columns="colsJson" :rows="viewJson" :selected="selJson"
          :selectable="multiple" sortable hide-selection-info empty-text="No records found"
          @change="onTableChange" @rowclick="onRowPick"></obs-table>
      </div>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { font-family: var(--font-family, 'Poppins', sans-serif); }
.gs { display: inline-block; width: 280px; }
.gs.block, :host([block]) { display: block; width: 100%; }

/* trigger */
.trig { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 36px; padding: 0 12px;
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; background: var(--page-background-color, #fff);
  color: var(--page-text-color, #1d2a3e); font-size: 0.8rem; cursor: pointer; }
.gs.disabled .trig { background: var(--neutral-lightest, #ecf1f9); cursor: not-allowed; }
.tlabel { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tlabel.ph { color: var(--neutral-light, #6a7fa0); }
.chev { color: var(--neutral-light, #6a7fa0); flex: 0 0 auto; transition: transform .15s; }
.chev.up { transform: rotate(180deg); }

/* menu (top layer) */
.menu[popover] { border: 0; padding: 0; margin: 0; inset: auto; overflow: visible;
  background: var(--page-background-color, #fff); border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px;
  box-shadow: 0 6px 20px var(--neutral-shadow-light, rgba(29, 42, 62, .12)); }
.head { display: flex; align-items: center; gap: 16px; padding: 12px 12px 8px; }
.srch { display: flex; align-items: center; gap: 8px; width: 300px; height: 36px; padding: 0 10px;
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; color: var(--neutral-light, #6a7fa0); }
.srch input { flex: 1; border: 0; outline: none; background: transparent; font: inherit; font-size: 0.8rem; color: var(--page-text-color, #1d2a3e); }
.selacts { display: flex; align-items: center; gap: 12px; font-size: 0.8rem; }
.badge { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 22px; padding: 0 6px;
  border-radius: 11px; background: var(--primary, #111c2c); color: var(--white-regular, #fff); font-size: 12px; font-weight: 600; }
.lnk { color: var(--page-text-color, #1d2a3e); text-decoration: underline dotted; text-underline-offset: 3px; cursor: pointer; }
.sep { color: var(--neutral-lighter, #e3e8f2); }

/* the inner DS table (composed) — a scrollable body under the fixed head */
.gtbl { max-height: 320px; overflow: auto; border-top: 1px solid var(--border-color, #e3e8f2); }
.gtbl obs-table { display: block; width: 100%; }
</style>
