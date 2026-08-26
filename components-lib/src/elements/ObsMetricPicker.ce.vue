<script setup>
// <obs-metric-picker> — the METRIC EXPLORER selection panel (Form Controls), matched to the product metric-explorer:
// (1) a row of MONITOR TABS (REUSES obs-tabs closable+addable) — the "+" (far right) adds a new BLANK tab; each tab
//     is closable with × but ONLY when there is more than one; (2) a "Select Monitor" GRID dropdown (REUSES
//     obs-grid-select — SINGLE-select: one monitor per tab) that fills the active tab; a blank tab shows an empty
//     list until a monitor is picked; (3) Metric/Instance/Saved View sub-tabs (obs-tabs); (4) SEARCH (obs-input);
// (5) a flat COUNTER list — each row is an ADD (⊕) + DRAG action (NOT a selection): taking a counter removes it.
// Source-derived from metric-explorer/views/metric-explorer.vue + counter-selector.vue → counter-list.vue.
import { computed, ref, watch } from 'vue'
const props = defineProps({
  monitors: { type: [String, Array], default: '' },   // the monitor TABLE rows for the grid picker: [{id,name,ip,type,groups?,tags?,sev?}]
  monitorColumns: { type: [String, Array], default: '' }, // grid columns; default MONITOR/IP/TYPE/GROUPS/TAGS
  selected: { type: [String, Array], default: '' },    // the initial OPEN monitor tabs: ids ["xen75"] (one tab each)
  active: { type: String, default: '' },               // the initially-active monitor id
  counters: { type: [String, Array], default: '' },    // flat counter list for the active monitor: ["ping.latency.ms", …]
  metrics: { type: [String, Array], default: '' },     // alias: a grouped tree [{label,items}] → flattened
  views: { type: String, default: 'Metric,Instance,Saved View' }, // the sub-tabs (comma list)
  canAdd: { type: [Boolean, String], default: true },  // ⊕ + drag per row (the explorer default = true)
  embedded: { type: [Boolean, String], default: false }, // SCOPED to one already-known monitor: hide the monitor tabs
                                                          // + Select Monitor; go straight to the Metric/Instance tabs +
                                                          // search + counter list (a monitor-detail screen's metric tab)
  placeholder: { type: String, default: 'Search' },
})
const emit = defineEmits(['select-monitor', 'add-monitor', 'remove-monitor', 'view', 'add', 'drag', 'search'])
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const detail = (e) => (e.detail && e.detail[0] != null) ? e.detail[0] : (e.target && e.target.value)
const parse = (v, fb) => {
  if (Array.isArray(v)) return v
  const s = String(v || '').trim()
  if (!s) return fb
  if (s[0] === '[') { try { return JSON.parse(s) } catch (e) { return fb } }
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

const monitorRows = computed(() => parse(props.monitors, []).map((m) => (typeof m === 'string' ? { id: m, name: m } : m)))
const monitorsJson = computed(() => JSON.stringify(monitorRows.value))
const DEFAULT_COLS = [
  { key: 'name', title: 'MONITOR', type: 'severity', sortable: true },
  { key: 'ip', title: 'IP' },
  { key: 'type', title: 'TYPE', type: 'type' },
  { key: 'groups', title: 'GROUPS' },
  { key: 'tags', title: 'TAGS' },
]
const colsJson = computed(() => JSON.stringify(parse(props.monitorColumns, DEFAULT_COLS)))
const nameOf = (id) => { const r = monitorRows.value.find((m) => String(m.id) === String(id)); return r ? r.name : '' }

// ── stateful monitor tabs ── the element drives them (add blank / close / select-per-tab), data-seeded from props
let uid = 0
const mk = (id) => ({ key: 't' + (uid++), monitor: id || '', name: nameOf(id) })
const initIds = parse(props.selected, [])
const tabs = ref(initIds.length ? initIds.map((s) => mk(typeof s === 'string' ? s : s.id)) : [mk('')])
const seedActive = props.active && tabs.value.find((t) => String(t.monitor) === String(props.active))
const activeKey = ref(seedActive ? seedActive.key : tabs.value[0].key)
const activeTab = computed(() => tabs.value.find((t) => t.key === activeKey.value) || tabs.value[0])
const activeMonitor = computed(() => (activeTab.value ? activeTab.value.monitor : ''))
const hasMonitor = computed(() => activeMonitor.value !== '' && activeMonitor.value != null)
const monitorTabsJson = computed(() => JSON.stringify(tabs.value.map((t) => ({ key: t.key, label: t.name || 'Select Monitor' }))))

function addTab () { const t = mk(''); tabs.value = [...tabs.value, t]; activeKey.value = t.key; emit('add-monitor') }
function closeTab (e) {
  const key = detail(e); if (tabs.value.length <= 1) return
  const gone = tabs.value.find((t) => t.key === key)
  tabs.value = tabs.value.filter((t) => t.key !== key)
  if (activeKey.value === key) activeKey.value = tabs.value[0].key
  emit('remove-monitor', { value: gone ? gone.monitor : '' })
}
function onTabChange (e) { const k = detail(e); if (k) activeKey.value = k }
function onMonitorSelect (e) {
  const id = detail(e)
  tabs.value = tabs.value.map((t) => (t.key === activeKey.value ? { ...t, monitor: id, name: nameOf(id) } : t))
  emit('select-monitor', { value: id })
}

// ── sub-tabs (Metric / Instance / Saved View) ──
const viewList = computed(() => String(props.views || '').split(',').map((t) => t.trim()).filter(Boolean))
const viewsJson = computed(() => JSON.stringify(viewList.value.map((t) => ({ key: t, label: t }))))
const activeView = ref(viewList.value[0] || 'Metric')
function onView (e) { const v = detail(e); if (v != null) activeView.value = v; emit('view', { value: activeView.value }) }

// ── counter list: ADD (⊕) + DRAG actions; taking a counter removes it (reset when the monitor changes) ──
const isCanAdd = computed(() => on(props.canAdd))
const counterList = computed(() => {
  const flat = parse(props.counters, null)
  if (flat && flat.length) return flat.map((c) => (typeof c === 'string' ? { name: c } : { name: c.name }))
  const grouped = parse(props.metrics, [])
  const out = []
  for (const g of grouped) for (const it of (g.items || g.children || [])) out.push({ name: it.name })
  return out
})
const isEmbedded = computed(() => on(props.embedded))
const showList = computed(() => isEmbedded.value || hasMonitor.value) // embedded = a fixed monitor, list shows straight away
const query = ref('')
const removed = ref(new Set())
watch([activeMonitor, () => props.counters, () => props.metrics], () => { removed.value = new Set() })
const filtered = computed(() => {
  if (!showList.value) return []
  const q = query.value.trim().toLowerCase()
  return counterList.value.filter((c) => !removed.value.has(c.name) && (!q || c.name.toLowerCase().includes(q)))
})
function take (name) { const s = new Set(removed.value); s.add(name); removed.value = s }
function onSearch (e) { query.value = detail(e) || ''; emit('search', { query: query.value }) }
function add (c, e) { e.stopPropagation(); emit('add', { name: c.name }); take(c.name) }
function onDragStart (c, e) { try { e.dataTransfer.effectAllowed = 'copy'; e.dataTransfer.setData('text/plain', c.name) } catch (_) {} emit('drag', { name: c.name }) }
function onDragEnd (c, e) { if (!e.dataTransfer || e.dataTransfer.dropEffect !== 'none') take(c.name) }
</script>

<template>
  <div class="mp" :class="{ embedded: isEmbedded }">
    <!-- monitor tabs + Select Monitor — hidden in `embedded` mode (a scoped, already-known monitor) -->
    <template v-if="!isEmbedded">
      <!-- MONITOR tabs — REUSE obs-tabs (closable × when >1, addable "+" at the far right adds a blank tab) -->
      <obs-tabs class="mp-mtabs" closable addable :tabs="monitorTabsJson" :value="activeKey" @change="onTabChange" @close="closeTab" @add="addTab"></obs-tabs>
      <!-- Select Monitor — REUSE obs-grid-select, SINGLE-select (one monitor per tab). Blank on a new tab. -->
      <div class="mp-monitor">
        <label class="mp-label">Select Monitor</label>
        <obs-grid-select class="mp-gs" block placeholder="Select Monitor" :columns="colsJson" :rows="monitorsJson" :value="String(activeMonitor || '')" @change="onMonitorSelect"></obs-grid-select>
      </div>
    </template>

    <!-- a blank tab has no monitor yet → prompt to select one (never in embedded mode) -->
    <div v-if="!isEmbedded && !hasMonitor" class="mp-empty">
      <obs-icon name="metricExplorer" size="30"></obs-icon>
      <p>Select a monitor to see its metrics</p>
    </div>

    <template v-if="showList">
      <obs-tabs v-if="viewList.length > 1" class="mp-tabs" :tabs="viewsJson" :value="activeView" @change="onView"></obs-tabs>
      <obs-input class="mp-search" prefix-icon="search" allow-clear block :value="query" :placeholder="placeholder" @input="onSearch"></obs-input>

      <div class="mp-list">
        <div v-for="c in filtered" :key="c.name" class="mp-row" :class="{ grab: isCanAdd }" :draggable="isCanAdd ? 'true' : null" :title="c.name" @dragstart="(e) => onDragStart(c, e)" @dragend="(e) => onDragEnd(c, e)">
          <button v-if="isCanAdd" type="button" class="mp-add" aria-label="Add counter" @click="(e) => add(c, e)"><obs-icon name="plusCircle" size="16"></obs-icon></button>
          <span class="mp-name">{{ c.name }}</span>
          <span v-if="isCanAdd" class="mp-drag" aria-hidden="true"><obs-icon name="dragArrows" size="14"></obs-icon></span>
        </div>
        <div v-if="!filtered.length" class="mp-nomatch">{{ query ? `No metrics match “${query}”` : (removed.size ? 'All counters added' : 'No metrics') }}</div>
      </div>
    </template>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { display: block; }
.mp {
  display: flex; flex-direction: column; min-height: 0; box-sizing: border-box;
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 8px; padding: 1px 8px 8px 12px;
  background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); font-size: 0.82rem;
}
/* embedded (scoped to one monitor): starts straight at the Metric/Instance tabs — no top padding above them */
.mp.embedded { padding-top: 0; }
.mp.embedded .mp-tabs { margin-top: 0; }
.mp-mtabs { display: block; margin-bottom: 12px; }
/* Select Monitor */
.mp-monitor { display: flex; flex-direction: column; gap: 6px; padding-right: 4px; }
/* the "Select Monitor" label matches the DS input/form-item label (obs-input): 0.8rem, normal weight, muted slate */
.mp-label { font-size: var(--text-sm, 0.8rem); font-weight: 400; line-height: 1.5; color: var(--text-color-common-secondary, #7186a8); }
.mp-gs { display: block; }
.mp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 28px 0; color: var(--neutral-light, #6a7fa0); text-align: center; }
.mp-empty p { margin: 0; }
/* reused obs-tabs (sub-tabs) + obs-input (search) — spacing only */
.mp-tabs { display: block; margin: 10px 4px 6px 0; }
.mp-search { display: block; margin: 10px 4px 8px 0; }
/* the flat counter list — rows are ADD/DRAG actions; tighter spacing + room for the drag handle (no right cut) */
.mp-list { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; max-height: 340px; padding-right: 2px; scrollbar-width: thin; scrollbar-color: var(--utility-scrollbar-thumb, rgba(136,136,136,0.4)) transparent; }
/* theme-aware scrollbar (shadow DOM ignores the app's bar → defaults to a bright/white one on dark; use the DS token) */
.mp-list::-webkit-scrollbar { width: 8px; height: 8px; }
.mp-list::-webkit-scrollbar-track { background: transparent; }
.mp-list::-webkit-scrollbar-thumb { background: var(--utility-scrollbar-thumb, rgba(136,136,136,0.4)); border-radius: 4px; }
.mp-row {
  display: flex; align-items: center; gap: 8px; width: 100%; box-sizing: border-box; height: 36px; padding: 0 6px 0 2px; border-radius: 6px;
  background: none; color: var(--page-text-color, #1d2a3e);
}
.mp-row.grab { cursor: grab; }
.mp-row.grab:active { cursor: grabbing; }
.mp-row:hover { background: var(--neutral-lightest, #f4f6fb); }
.mp-add { display: inline-flex; flex: none; border: 0; padding: 0; background: none; color: var(--neutral-light, #6a7fa0); cursor: pointer; }
.mp-add:hover { color: var(--primary, #111c2c); }
.mp-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--neutral-regular, #4a5b78); }
.mp-drag { display: inline-flex; flex: none; color: var(--neutral-light, #6a7fa0); cursor: grab; }
.mp-nomatch { padding: 16px 8px; color: var(--neutral-light, #6a7fa0); text-align: center; }
</style>
