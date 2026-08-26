<script setup>
// <obs-filters> — the product's filtering components by ARCHETYPE (Molecules/Filters). A `kind` prop selects:
//   expression → FiltersContainer (32×): nested AND/OR query builder in a popover (Pre/Post tabs).
//   bar        → FlotoFilterBar (~50×): inline chip bar (field·operator·value chips + Match All/Any).
//   quick      → filter-quick-menu: a preset one-click menu.
//   row        → a few multi-selects + Reset/Apply.
//   vertical   → vertical-filter/filters.vue: faceted left-panel sidebar (checkbox + count groups).
// Reference reproductions with real tokens.
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, useHost } from 'vue'
const props = defineProps({
  kind: { type: String, default: 'bar' },
  // FUNCTIONAL CONTRACT (kind="bar"): pass your own fields + read back the user's selection.
  fields: { type: [String, Array] }, // [{ key, label, type:'enum'|'string', values:[…], selectAll? }] — array or JSON string
  value: { type: [String, Array] },  // active conditions [{ field, operator, value }] — array or JSON string
  match: { type: String, default: 'all' }, // the Match toggle mode: 'all' (AND) | 'any' (OR). Emitted in `change` as {conditions, match}.
})
const emit = defineEmits(['change'])
const host = useHost()
const parseArr = (v, fb) => {
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v.trim()) { try { const p = JSON.parse(v); return Array.isArray(p) ? p : fb } catch (e) { return fb } }
  return fb
}

// ─────────────── EXPRESSION BUILDER ───────────────
const COUNTERS = ['Monitor', 'Host Name', 'IP Address', 'Vendor', 'Object Type', 'Severity', 'Status', 'Source', 'Group', 'Interface']
const OPERATORS = [
  { k: '=', l: 'Equals' }, { k: '!=', l: 'Not Equals' }, { k: '<', l: 'Less Than' }, { k: '>', l: 'Greater Than' },
  { k: '<=', l: 'Less than or Equal' }, { k: '>=', l: 'Greater than or Equal' }, { k: 'contain', l: 'Contains' },
  { k: 'not contain', l: 'Not Contain' }, { k: 'in', l: 'In' }, { k: 'not in', l: 'Not In' },
  { k: 'start with', l: 'Start With' }, { k: 'end with', l: 'End With' }, { k: 'between', l: 'Between' },
]
const clone = (x) => JSON.parse(JSON.stringify(x))
const freshCond = () => ({ operand: '', operator: '', value: '', toValue: '' })
const freshGroup = () => ({ inclusion: 'include', condition: 'and', conditions: [freshCond()] })
const freshTab = () => ({ condition: 'and', groups: [freshGroup()] })
const fresh = () => ({ pre: freshTab(), post: freshTab() })
const exprOpen = ref(false)
const currentTab = ref('pre')
const applied = ref({
  pre: { condition: 'or', groups: [
    { inclusion: 'include', condition: 'and', conditions: [{ operand: 'Severity', operator: '=', value: 'Critical', toValue: '' }, { operand: 'Source', operator: 'contain', value: 'aws', toValue: '' }] },
    { inclusion: 'include', condition: 'and', conditions: [{ operand: 'Status', operator: '=', value: 'Down', toValue: '' }] },
  ] },
  post: { condition: 'and', groups: [freshGroup()] },
})
const draft = ref(clone(applied.value))
const tabs = [{ k: 'pre', text: 'Pre Filters' }, { k: 'post', text: 'Post Filters' }]
const maxGroups = computed(() => currentTab.value === 'pre' ? 3 : 1)
const cur = computed(() => draft.value ? draft.value[currentTab.value] : null)
const exprOpLabel = (k) => { const o = OPERATORS.find((x) => x.k === k); return o ? o.l : k }
function setText(t) {
  if (!t || !t.groups) return ''
  const between = t.condition === 'or' ? 'OR' : 'AND'
  const gtexts = t.groups.map((g) => {
    const conds = g.conditions.filter((c) => c.operand && c.operator)
    if (!conds.length) return ''
    const join = g.condition === 'or' ? 'OR' : 'AND'
    const inner = conds.map((c) => c.operand + ' <b>' + exprOpLabel(c.operator) + '</b> ' + (c.operator === 'between' ? (c.value || '?') + '–' + (c.toValue || '?') : (c.value || 'Any'))).join(' ' + join + ' ')
    return '<strong>' + (g.inclusion === 'exclude' ? 'EXCLUDE' : 'INCLUDE') + '</strong> ' + inner
  }).filter(Boolean)
  if (!gtexts.length) return ''
  return gtexts.length > 1 ? gtexts.map((x) => '(' + x + ')').join(' ' + between + ' ') : gtexts[0]
}
const appliedText = computed(() => {
  if (!applied.value) return ''
  return ['pre', 'post'].map((t) => setText(applied.value[t])).filter(Boolean).join(' <strong style="color:var(--primary,#111c2c);margin:0 6px">|</strong> ')
})
function exprToggle() { if (!exprOpen.value) draft.value = clone(applied.value || fresh()); exprOpen.value = !exprOpen.value }
function addCondition(gi) { cur.value.groups[gi].conditions.push(freshCond()) }
function removeCondition(gi, ci) { cur.value.groups[gi].conditions.splice(ci, 1) }
function addGroup() { cur.value.groups.push(freshGroup()) }
function removeGroup(gi) { cur.value.groups.splice(gi, 1) }
function exprApply() { applied.value = clone(draft.value); exprOpen.value = false }
function exprClear() { draft.value = fresh(); applied.value = null; exprOpen.value = false }
function exprReset() { draft.value = { ...draft.value, [currentTab.value]: applied.value ? clone(applied.value[currentTab.value]) : freshTab() } }

// ─────────────── FILTER BAR ───────────────
const OPS = {
  enum: [{ k: 'is', l: '=', multi: true }, { k: 'is_not', l: '!=', multi: true }, { k: 'is_empty', l: 'Is Empty', noValue: true }, { k: 'is_not_empty', l: 'Is Not Empty', noValue: true }],
  string: [{ k: 'contains', l: 'Contains' }, { k: 'does_not_contain', l: 'Does Not Contain' }, { k: 'starts_with', l: 'Starts With' }, { k: 'ends_with', l: 'Ends With' }, { k: 'eq', l: 'Equals' }],
}
// G18: the Match mode is a real, driven prop ('all'|'any') — not an internal-only English label. The button toggles
// it AND re-emits; the prop seeds/overrides it. barMatch is just the display string for the button.
const matchMode = ref(String(props.match || 'all').toLowerCase() === 'any' ? 'any' : 'all')
watch(() => props.match, (v) => { matchMode.value = String(v || 'all').toLowerCase() === 'any' ? 'any' : 'all' })
const barMatch = computed(() => (matchMode.value === 'any' ? 'Any Filter' : 'All Filters'))
// enum value lists mirror the product's multi-select value picker: plain options, colour-dot options
// (severity), and expandable groups (a { v, children } entry). `selectAll` shows the Select-All row.
const DEMO_FIELDS = [
  { key: 'group', label: 'Groups', type: 'enum', selectAll: true, values: [
    'Oracle WebLogic',
    { v: 'Database', children: ['MySQL', 'PostgreSQL', 'MongoDB'] },
    { v: 'Other', children: ['Custom Monitor', 'Script Monitor'] },
    'rum_test', 'Production', 'Staging',
  ] },
  { key: 'type', label: 'Types', type: 'enum', values: ['AWS Auto Scaling', 'AWS Cloud', 'AWS ELB', 'AWS Elastic Beanstalk', 'AWS Lambda', 'EC2', 'S3', 'RDS'] },
  { key: 'severity', label: 'Severity', type: 'enum', values: [
    { v: 'Down', col: '--severity-down' }, { v: 'Critical', col: '--severity-critical' }, { v: 'Major', col: '--severity-major' },
    { v: 'Warning', col: '--severity-warning' }, { v: 'Clear', col: '--severity-clear' }, { v: 'Unreachable', col: '--severity-unreachable' }, { v: 'Unknown', col: '--severity-unknown' },
  ] },
  { key: 'vendor', label: 'Vendor', type: 'string', values: ['Cisco', 'Juniper', 'Arista', 'HPE'] },
]
const DEMO_CHIPS = [
  { field: 'group', operator: 'is', value: ['MySQL', 'PostgreSQL'] },
  { field: 'severity', operator: 'is', value: ['Down', 'Warning'] },
  { field: 'type', operator: 'is', value: ['AWS Auto Scaling', 'EC2', 'S3', 'RDS'] },
]
// Fields come from the `fields` prop (your data) or fall back to the demo set (the reference render).
const fields = computed(() => parseArr(props.fields, DEMO_FIELDS))
// Active chips: seeded from the `value` prop (or the demo). NO trailing empty stub — the "+ Filter" button
// is the sole affordance for adding a filter (barAdd pushes a fresh chip and opens it), so an always-on
// empty "Select Filter" chip would be redundant. Empty bar → just the "+ Filter" button.
const chips = ref(parseArr(props.value, DEMO_CHIPS).map((c) => ({ ...c })))
// G16: the write-back (reflecting el.value) MUST NOT trigger a destructive rebuild of internal state. Setting
// host.value fires this watcher; if we rebuilt chips from it we'd drop the half-built chip being edited (no operator
// yet) — the "vanishing chip". A flag makes the watcher ignore our OWN reflect; external writes still rebuild.
let selfWrite = false
watch(() => props.value, (v) => {
  if (selfWrite) { selfWrite = false; return }
  if (v != null) chips.value = parseArr(v, []).map((c) => ({ ...c }))
})
// build + emit the current conditions (complete chips only) + reflect to the host so el.value is readable
function emitChange() {
  const conditions = chips.value
    .filter((c) => c.field && c.operator && (opDef(c.operator) && opDef(c.operator).noValue ? true : (Array.isArray(c.value) ? c.value.length : c.value !== '' && c.value != null)))
    .map((c) => ({ field: c.field, operator: c.operator, value: c.value }))
  const s = JSON.stringify(conditions)
  // G16: compare LIKE WITH LIKE — the API accepts [String, Array], so host.value may be an ARRAY; JSON-normalise
  // both sides so an array seed ([]) doesn't look different from its string form ("[]") and trigger a spurious write.
  if (host) { try { const cur = typeof host.value === 'string' ? host.value : JSON.stringify(host.value ?? []); if (cur !== s) { selfWrite = true; host.value = s } } catch (e) { /* readonly host */ } }
  emit('change', { conditions, match: matchMode.value }) // G18: emit the Match mode ('all'|'any') alongside the conditions
}
const editing = ref(null) // { i, step }
const menuPos = ref(null)  // { left, top } — the picker floats position:fixed to escape the overflow-x:auto chip row
const barChipsEl = ref(null)
function positionMenu(i) {
  nextTick(() => {
    const wrap = barChipsEl.value && barChipsEl.value.querySelectorAll('.chip-wrap')[i]
    if (!wrap) { menuPos.value = null; return }
    const r = wrap.getBoundingClientRect()
    menuPos.value = { left: Math.round(r.left), top: Math.round(r.bottom + 6) }
  })
}
const fd = (key) => fields.value.find((f) => f.key === key)
const opDef = (key) => { for (const t in OPS) { const o = OPS[t].find((x) => x.k === key); if (o) return o } return null }
const fieldLabel = (c) => { const f = fd(c.field); return f ? f.label : 'Select Filter' }
const barOpLabel = (c) => { const o = opDef(c.operator); return o ? o.l : '' }
const takesValue = (c) => { const o = opDef(c.operator); return o && !o.noValue }
const isMulti = (c) => { const o = opDef(c.operator); return o && o.multi }
const valSummary = (c) => { const v = c.value; if (Array.isArray(v)) { if (!v.length) return '…'; return v.length === 1 ? v[0] : v[0] + ' (+' + (v.length - 1) + ')' } return (v === '' || v == null) ? '…' : v }
const isStub = (c) => !c.operator
const showClose = (c) => !isStub(c) || !c.field
const active = (i, step) => editing.value && editing.value.i === i && editing.value.step === step
const barOptions = computed(() => {
  if (!editing.value) return []
  const c = chips.value[editing.value.i]
  if (editing.value.step === 'field') return fields.value.map((f) => ({ k: f.key, l: f.label }))
  const f = fd(c.field)
  if (editing.value.step === 'operator') return (OPS[f ? f.type : 'enum'] || []).map((o) => ({ k: o.k, l: o.l }))
  return (f ? f.values : []).map((v) => ({ k: v, l: v }))
})
const isCompleteChip = (c) => {
  if (!c.field || !c.operator) return false
  if (!takesValue(c)) return true
  const v = c.value; return Array.isArray(v) ? v.length > 0 : v !== '' && v != null
}
const hasComplete = computed(() => chips.value.some(isCompleteChip))
// G17: "Match" (AND/OR between filters) is only meaningful with 2+ conditions — show it at ≥2, not at the first.
const completeCount = computed(() => chips.value.filter(isCompleteChip).length)
function edit(i, step, e) {
  e && e.stopPropagation()
  const c = chips.value[i]; if (step === 'field' && c.dflt && c.field) step = 'operator'
  if (active(i, step)) { editing.value = null; menuPos.value = null; return }
  editing.value = { i, step }; positionMenu(i)
}
function pick(o) {
  const { i, step } = editing.value; const c = chips.value[i]
  if (step === 'field') { c.field = o.k; c.operator = ''; c.value = ''; editing.value = { i, step: 'operator' } }
  // multi values are handled by the embedded <obs-select> on the chip — don't open the bespoke value menu; instead
  // auto-open that chip's <obs-select> (product opens the value dropdown right after the operator is chosen).
  else if (step === 'operator') {
    c.operator = o.k; c.value = isMulti(c) ? [] : ''
    editing.value = (takesValue(c) && !isMulti(c)) ? { i, step: 'value' } : null
    if (isMulti(c) && takesValue(c)) openValueSelect(i)
  }
  else { if (isMulti(c)) { const v = Array.isArray(c.value) ? c.value : []; c.value = v.includes(o.k) ? v.filter((x) => x !== o.k) : [...v, o.k] } else { c.value = o.k; editing.value = null } }
  chips.value = [...chips.value]
  emitChange()
  if (editing.value) positionMenu(editing.value.i); else menuPos.value = null
}
// open the embedded value <obs-select> for chip i (after the chip re-renders with it)
function openValueSelect(i) {
  nextTick(() => {
    const tryOpen = () => {
      const wrap = barChipsEl.value && barChipsEl.value.querySelectorAll('.chip-wrap')[i]
      const sel = wrap && wrap.querySelector('.valsel obs-select')
      const trig = sel && sel.shadowRoot && sel.shadowRoot.querySelector('.t-text')
      if (trig) { trig.click(); return true }
      return false
    }
    if (!tryOpen()) requestAnimationFrame(tryOpen) // custom element may not have upgraded yet
  })
}
const isSel = (i, o) => { const v = chips.value[i].value; return Array.isArray(v) ? v.includes(o.k) : v === o.k }
function barRemove(i) { chips.value.splice(i, 1); editing.value = null; menuPos.value = null; emitChange() } // no stub re-push — "+ Filter" adds
function barAdd() { chips.value.push({ field: '', operator: '', value: '' }); const i = chips.value.length - 1; editing.value = { i, step: 'field' }; positionMenu(i) }
function clearAll() { chips.value = []; editing.value = null; menuPos.value = null; emitChange() } // empty bar → just "+ Filter"
// value picker reuses <obs-select> (multi + searchable + Select-All + Clear + per-option colour/group).
function valueOptionsJson(c) {
  const f = fd(c.field); if (!f) return '[]'
  return JSON.stringify((f.values || []).map((v) => {
    if (typeof v === 'string') return { value: v, label: v }
    if (v.children) return { value: v.v, label: v.v, children: v.children.map((ch) => ({ value: ch, label: ch })) }
    return { value: v.v, label: v.v, color: v.col }
  }))
}
const valueStr = (c) => (Array.isArray(c.value) ? c.value.join(',') : (c.value || ''))
const selAllFor = (c) => { const f = fd(c.field); return !!(f && f.selectAll) }
function onValueChange(i, e) {
  const d = e && e.detail; const val = Array.isArray(d) ? d[0] : d
  chips.value[i].value = Array.isArray(val) ? val : (val == null || val === '' ? [] : [val])
  emitChange()
}

// ─────────────── QUICK / ROW ───────────────
const quickPresets = ['Down monitors', 'Critical alerts', 'Unacknowledged', 'My favorites']

// ─────────────── VERTICAL FILTER ───────────────
const vChecked = ref({})
const vGroups = ref([
  { n: 'Backup Status', open: true, rows: [{ n: 'Successful', c: 5, i: 'check-circle', col: 'var(--secondary-green)' }, { n: 'Failed', c: 3, i: 'times-circle', col: 'var(--secondary-red)' }] },
  { n: 'Config Conflict', open: true, rows: [{ n: 'In Sync', c: 1 }, { n: 'Conflict Detected', c: 6 }, { n: 'Not Applicable', c: 1 }] },
  { n: 'Device Type', open: true, rows: [{ n: 'Switch', c: 2, i: 'sitemap', col: 'var(--primary-alt)' }, { n: 'Router', c: 6, i: 'server', col: 'var(--primary-alt)' }] },
  { n: 'Vendor', open: false, rows: [{ n: 'Huawei', c: 1 }, { n: 'Cisco Systems', c: 6 }] },
  { n: 'Template', open: false, rows: [{ n: 'Cisco', c: 3 }, { n: 'sophos firewall', c: 1 }] },
])
function toggleG(g) { g.open = !g.open }
function toggleV(key) { vChecked.value = { ...vChecked.value, [key]: !vChecked.value[key] } }
const riIcon = (i) => ({ 'check-circle': 'checkCircle', 'times-circle': 'timesCircle', 'sitemap': 'sitemap', 'server': 'server' }[i] || '')

// close popovers/menus on outside click (through the shadow boundary)
function onDocClick(e) {
  if (e.composedPath().some((n) => n && n.tagName === 'OBS-FILTERS')) return
  exprOpen.value = false; editing.value = null; menuPos.value = null
  // discard an abandoned "+ Filter" chip (opened but no field picked) so no empty "Select Filter" lingers.
  // safe: a no-field chip is always a fresh stub — never mid value-selection (that requires a field first).
  if (chips.value.some((c) => !c.field)) chips.value = chips.value.filter((c) => c.field)
}
onMounted(() => document.addEventListener('click', onDocClick, true))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick, true))
</script>

<template>
  <!-- chevron used by native selects -->
  <div class="fx" :class="'k-' + kind">
    <!-- ═══════════ EXPRESSION BUILDER ═══════════ -->
    <template v-if="kind === 'expression'">
      <div class="expr-anchor">
        <div class="trigger" @click.stop="exprToggle">
          <span class="tg-icon"><obs-icon name="filter" size="14" class="i14"></obs-icon></span>
          <div v-if="appliedText" class="tg-text" v-html="appliedText"></div>
          <div v-else class="tg-text muted">Search</div>
        </div>

        <div v-if="exprOpen" class="expr-pop" @click.stop>
          <a class="pop-close" @click="exprOpen = false"><obs-icon name="times" size="11" class="i11"></obs-icon></a>
          <div class="tabs">
            <div v-for="t in tabs" :key="t.k" class="tab" :class="{ on: currentTab === t.k }" @click="currentTab = t.k">{{ t.text }}</div>
          </div>

          <div v-if="maxGroups > 1" class="row-inline mb">
            <span class="sel-wrap w100"><select v-model="cur.condition" class="sel"><option value="and">All</option><option value="or">Any</option></select><obs-icon class="chev" name="chevronDown" size="10"></obs-icon></span>
            <span>Group(s) matching</span>
          </div>

          <div v-for="(g, gi) in cur.groups" :key="gi" class="grp">
            <div class="row-inline mb">
              <span class="sel-wrap w110"><select v-model="g.inclusion" class="sel"><option value="include">Include</option><option value="exclude">Exclude</option></select><obs-icon class="chev" name="chevronDown" size="10"></obs-icon></span>
              <span>Group matching</span>
              <span class="sel-wrap w90"><select v-model="g.condition" class="sel"><option value="and">All</option><option value="or">Any</option></select><obs-icon class="chev" name="chevronDown" size="10"></obs-icon></span>
              <span>Criteria</span>
            </div>
            <div v-for="(c, ci) in g.conditions" :key="ci" class="cond">
              <span class="sel-wrap f1"><select v-model="c.operand" class="sel"><option value="" disabled>Select Counter</option><option v-for="o in COUNTERS" :key="o" :value="o">{{ o }}</option></select><obs-icon class="chev" name="chevronDown" size="10"></obs-icon></span>
              <span class="sel-wrap w180"><select v-model="c.operator" class="sel"><option value="" disabled>Select Operator</option><option v-for="o in OPERATORS" :key="o.k" :value="o.k">{{ o.l }}</option></select><obs-icon class="chev" name="chevronDown" size="10"></obs-icon></span>
              <span class="f1 val">
                <span v-if="c.operator === 'between'" class="between"><input v-model="c.value" class="inp" placeholder="From" /><input v-model="c.toValue" class="inp" placeholder="To" /></span>
                <input v-else v-model="c.value" class="inp" placeholder="Value" />
              </span>
              <a v-if="g.conditions.length > 1" class="x-inline" @click="removeCondition(gi, ci)"><obs-icon name="times" size="12" class="i12"></obs-icon></a>
            </div>
            <div class="grp-actions">
              <a v-if="g.conditions.length < 3" class="link" @click="addCondition(gi)"><obs-icon class="plus" name="plus" size="11"></obs-icon>Add Condition</a>
              <a v-if="gi === cur.groups.length - 1 && cur.groups.length < maxGroups" class="link" @click="addGroup()"><obs-icon class="plus" name="plus" size="11"></obs-icon>Add New Group</a>
            </div>
            <a v-if="cur.groups.length > 1" class="grp-close" @click="removeGroup(gi)"><obs-icon name="times" size="10" class="i10"></obs-icon></a>
          </div>

          <div class="foot">
            <button class="btn ghost" @click="exprReset">Reset</button>
            <button class="btn danger" @click="exprClear">Clear</button>
            <button class="btn primary" @click="exprApply">Apply</button>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════ FILTER BAR ═══════════ -->
    <template v-else-if="kind === 'bar'">
      <div class="bar" @click="editing = null; menuPos = null">
        <div class="bar-chips" ref="barChipsEl" @click.stop>
          <span v-for="(c, i) in chips" :key="i" class="chip-wrap">
            <span class="chip">
              <span class="seg field" :class="{ on: active(i, 'field') }" @click.stop="edit(i, 'field', $event)">{{ fieldLabel(c) }}</span>
              <span v-if="c.operator" class="seg op" :class="{ on: active(i, 'operator') }" @click.stop="edit(i, 'operator', $event)">{{ barOpLabel(c) }}</span>
              <span v-if="c.operator && takesValue(c) && isMulti(c)" class="seg val valsel" @click.stop>
                <obs-select
                  text-only multiple allow-clear
                  :allow-select-all="selAllFor(c) ? 'true' : undefined"
                  :options="valueOptionsJson(c)" :value="valueStr(c)" placeholder="…"
                  @change="onValueChange(i, $event)"
                ></obs-select>
              </span>
              <span v-else-if="c.operator && takesValue(c)" class="seg val" :class="{ on: active(i, 'value') }" @click.stop="edit(i, 'value', $event)">{{ valSummary(c) }}</span>
              <span v-if="showClose(c)" class="seg-x" @click.stop="barRemove(i)"><obs-icon name="times" size="11" class="i11"></obs-icon></span>
            </span>
          </span>
          <button class="add-filter" @click.stop="barAdd"><obs-icon class="plus" name="plus" size="12"></obs-icon><span class="pf-label">Filter</span></button>
        </div>
        <!-- picker floats position:fixed so the scrolling chip row (overflow-x:auto) never clips it -->
        <div v-if="editing && menuPos" class="bar-menu" :style="{ left: menuPos.left + 'px', top: menuPos.top + 'px' }" @click.stop>
          <div class="menu-head">{{ editing.step }}</div>
          <div v-for="o in barOptions" :key="o.k" class="menu-row" :class="{ msel: isSel(editing.i, o) }" @click.stop="pick(o)"><span>{{ o.l }}</span><obs-icon v-if="isSel(editing.i, o)" name="check" size="11" class="i11 ck"></obs-icon></div>
          <div v-if="!barOptions.length" class="menu-empty">No options</div>
        </div>
        <div v-if="hasComplete" class="bar-right" @click.stop>
          <button v-if="completeCount >= 2" class="match-btn" title="Click to toggle AND / OR" @click="matchMode = matchMode === 'all' ? 'any' : 'all'; emitChange()">
            <span class="muted">Match</span><span class="match-val">{{ barMatch }}</span>
            <obs-icon name="sync" size="14" class="match-i"></obs-icon>
          </button>
          <button class="clear-all" @click="clearAll">Clear All</button>
        </div>
      </div>
    </template>

    <!-- ═══════════ QUICK FILTERS ═══════════ -->
    <template v-else-if="kind === 'quick'">
      <div class="quick">
        <a class="quick-btn" title="Quick filters"><obs-icon name="thumbsUp" size="14" class="i14"></obs-icon></a>
        <div class="quick-menu">
          <div v-for="q in quickPresets" :key="q" class="quick-row"><span>{{ q }}</span><obs-icon name="chevronRight" size="11" class="i11 chev-r"></obs-icon></div>
        </div>
      </div>
    </template>

    <!-- ═══════════ FILTER ROW ═══════════ -->
    <template v-else-if="kind === 'row'">
      <div class="frow">
        <div v-for="f in ['Groups', 'Severity', 'Tags']" :key="f" class="frow-field">
          <div class="frow-label">{{ f }}</div>
          <div class="frow-select"><span class="muted">Select</span><obs-icon class="chev-static" name="chevronDown" size="10"></obs-icon></div>
        </div>
        <div class="frow-actions">
          <button class="btn ghost">Reset</button>
          <button class="btn primary">Apply</button>
        </div>
        <a class="frow-x"><obs-icon name="times" size="12" class="i12"></obs-icon></a>
      </div>
    </template>

    <!-- ═══════════ VERTICAL FILTER ═══════════ -->
    <template v-else>
      <div class="vfil">
        <div class="vfil-search-wrap"><div class="vfil-search"><obs-icon name="search" size="12" class="i12"></obs-icon><span>Search</span></div></div>
        <div class="vfil-body">
          <div v-for="g in vGroups" :key="g.n" class="vgroup">
            <a class="vgroup-head" @click="toggleG(g)"><obs-icon name="chevronRight" size="10" class="i10 vchev" :class="{ open: g.open }"></obs-icon>{{ g.n }}</a>
            <div v-if="g.open" class="vrows">
              <label v-for="r in g.rows" :key="g.n + r.n" class="vrow">
                <span class="vcb" :class="{ on: !!vChecked[g.n + r.n] }" @click.prevent="toggleV(g.n + r.n)"><obs-icon v-if="vChecked[g.n + r.n]" name="check" size="10" class="i10" style="color:var(--page-background-color,#fff)"></obs-icon></span>
                <obs-icon v-if="r.i" class="i13 vicon" :style="{ color: r.col }" :name="riIcon(r.i)" size="13"></obs-icon>
                <span class="vname" :class="{ noicon: !r.i }">{{ r.n }}</span>
                <span class="vcount">{{ r.c }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: inline-block; font-family: var(--font-family, 'Poppins', sans-serif); font-size: 13px; color: var(--page-text-color, #1d2a3e); }
/* native form controls don't inherit font-family — force Poppins (else they render in the UA font, e.g. Arial) */
button, input, select, textarea { font-family: inherit; }
:host([kind="bar"]), :host([kind="row"]) { display: block; width: 100%; }
.fx { box-sizing: border-box; }
.fx.k-bar, .fx.k-row { width: 100%; }
.muted { color: var(--neutral-light, #6a7fa0); }
.i10 { width: 10px; height: 10px; } .i11 { width: 11px; height: 11px; } .i12 { width: 12px; height: 12px; }
.i13 { width: 13px; height: 13px; } .i14 { width: 14px; height: 14px; }
.plus { display: inline-flex; margin-right: 4px; font-weight: 600; }

/* shared chevron on native selects */
.sel-wrap { position: relative; display: inline-block; }
.sel-wrap.f1 { flex: 1; display: block; } .sel-wrap.w90 { width: 90px; } .sel-wrap.w100 { width: 100px; }
.sel-wrap.w110 { width: 110px; } .sel-wrap.w180 { width: 180px; }
.sel { appearance: none; -webkit-appearance: none; width: 100%; height: 32px; border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 4px; background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); font-size: 13px;
  padding: 0 24px 0 10px; cursor: pointer; }
.chev { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--neutral-light, #6a7fa0); }
.inp { width: 100%; height: 32px; border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; box-sizing: border-box;
  background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); font-size: 13px; padding: 0 10px; }

/* ── expression builder ── */
.expr-anchor { position: relative; width: 440px; max-width: 100%; }
.trigger { display: flex; align-items: center; height: 34px; border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px;
  background: var(--page-background-color, #fff); overflow: hidden; cursor: pointer; }
.tg-icon { display: inline-flex; align-items: center; justify-content: center; height: 100%; padding: 0 10px;
  color: var(--neutral-light, #6a7fa0); border-right: 1px solid var(--border-color, #e3e8f2); }
.tg-text { flex: 1; padding: 0 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tg-text b, .tg-text strong { font-weight: 600; }
.expr-pop { position: absolute; top: 44px; left: 0; z-index: 20; width: 700px; box-sizing: border-box;
  background: var(--page-background-color, #fff); border: 1px solid var(--border-color, #e3e8f2); border-radius: 8px;
  box-shadow: 0 10px 34px var(--neutral-shadow-light, rgba(70,70,70,.15)); padding: 14px; }
.pop-close { position: absolute; top: 10px; right: 10px; display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%; background: var(--neutral-lighter, #e3e8f2); color: var(--neutral-light, #6a7fa0); cursor: pointer; }
.tabs { display: flex; gap: 20px; border-bottom: 1px solid var(--border-color, #e3e8f2); margin-bottom: 14px; }
.tab { padding: 6px 2px; color: var(--neutral-light, #6a7fa0); border-bottom: 2px solid transparent; cursor: pointer; }
.tab.on { color: var(--primary, #111c2c); border-bottom-color: var(--primary, #111c2c); font-weight: 600; }
.row-inline { display: flex; align-items: center; gap: 8px; }
.row-inline.mb { margin-bottom: 12px; }
.grp { position: relative; border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px; padding: 12px; margin-bottom: 10px; }
.cond { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.cond .f1 { flex: 1; } .val.f1 { flex: 1; display: block; }
.between { display: flex; align-items: center; gap: 6px; }
.x-inline { color: var(--neutral-light, #6a7fa0); cursor: pointer; flex-shrink: 0; display: inline-flex; }
.grp-actions { display: flex; align-items: center; gap: 18px; margin-top: 8px; }
.link { color: var(--primary, #111c2c); cursor: pointer; display: inline-flex; align-items: center; font-size: 12px; }
.grp-close { position: absolute; top: 8px; right: 8px; display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%; background: var(--neutral-lighter, #e3e8f2); color: var(--neutral-light, #6a7fa0); cursor: pointer; }
.foot { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 10px; }
/* buttons match the product Button: --btn-radius (4px) + font-weight 500 (NOT the story's ad-hoc 6px/600) */
.btn { height: 32px; padding: 0 16px; border-radius: var(--btn-radius, 4px); font-size: 13px; font-weight: 400; cursor: pointer; border: 1px solid transparent; font-family: inherit; }
.btn.ghost { border-color: var(--border-color, #e3e8f2); background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); }
.btn.danger { border-color: var(--secondary-red, #ec5b5b); background: transparent; color: var(--secondary-red, #ec5b5b); }
.btn.primary { border: none; padding: 0 18px; background: var(--primary, #111c2c); color: var(--page-background-color, #fff); }

/* ── filter bar ── */
.bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 0; }
.bar-chips { display: flex; align-items: center; flex: 1 1 auto; min-width: 0; gap: 6px; overflow-x: auto; white-space: nowrap; }
.chip-wrap { position: relative; flex-shrink: 0; }
.chip { display: inline-flex; align-items: center; height: 32px; padding: 0 12px; background: var(--code-tag-background-color, #ecf1f9);
  border-radius: 4px; font-size: 13px; color: var(--neutral-button-text, #7186a8); }
.seg { padding: 0 4px; cursor: pointer; }
.seg.field { color: var(--neutral-light, #6a7fa0); }
.seg.op { color: var(--neutral-regular, #7186a8); border-left: 1px solid var(--border-color, #e3e8f2); }
.seg.val { font-weight: 500; color: var(--neutral-button-text, #7186a8); border-left: 1px solid var(--border-color, #e3e8f2); }
.seg.on { color: var(--primary, #111c2c) !important; }
/* the value segment hosts an embedded <obs-select> (reused Dropdown) — keep the divider, let the select size itself */
.seg.val.valsel { padding: 0 0 0 8px; display: inline-flex; align-items: center; }
.valsel obs-select { display: inline-flex; align-items: center; font-weight: 500; color: var(--primary, #111c2c); }
.seg-x { display: inline-flex; align-items: center; margin-left: 8px; color: var(--neutral-light, #6a7fa0); cursor: pointer; }
.add-filter { display: inline-flex; align-items: center; height: 32px; padding: 0 12px; border: none; border-radius: 4px;
  background: var(--code-tag-background-color, #ecf1f9); color: var(--primary, #111c2c); cursor: pointer; font-family: inherit; font-size: 13px; flex-shrink: 0; }
.add-filter .plus { color: var(--primary, #111c2c); } .pf-label { margin-left: 2px; }
.bar-menu { position: fixed; z-index: 1000; min-width: 190px; max-height: 260px; overflow-y: auto;
  background: var(--page-background-color, #fff); border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px;
  box-shadow: 0 8px 24px var(--neutral-shadow-light, rgba(70,70,70,.15)); }
.menu-head { padding: 6px 12px; font-size: 10px; letter-spacing: .4px; text-transform: uppercase; color: var(--neutral-light, #6a7fa0);
  border-bottom: 1px solid var(--border-color, #e3e8f2); position: sticky; top: 0; background: var(--page-background-color, #fff); }
.menu-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 7px 12px; font-size: 13px; cursor: pointer; }
.menu-row > span { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.menu-row:hover { background: var(--neutral-lighter, #e3e8f2); }
.menu-row.msel { color: var(--primary, #111c2c); }
.menu-empty { padding: 8px 12px; font-size: 12px; color: var(--neutral-light, #6a7fa0); }
.bar-right { display: flex; align-items: center; flex: 0 0 auto; gap: 6px; font-size: 13px; }
.match-btn { display: inline-flex; align-items: center; height: 32px; padding: 0 10px; border: none; border-radius: 4px;
  background: var(--code-tag-background-color, #ecf1f9); cursor: pointer; font-family: inherit; font-size: 13px; }
.match-val { color: var(--primary, #111c2c); font-weight: 500; margin-left: 4px; }
.match-i { margin-left: 6px; color: var(--primary, #111c2c); }
.clear-all { height: 32px; padding: 0 8px; border: none; background: transparent; color: var(--primary, #111c2c); cursor: pointer; font-family: inherit; font-size: 13px; }
.ck { color: var(--primary, #111c2c); }

/* ── quick filters ── */
.quick { position: relative; display: inline-block; padding-bottom: 170px; }
.quick-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px;
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; color: var(--neutral-light, #6a7fa0); cursor: pointer; }
.quick-menu { position: absolute; left: 0; top: 38px; min-width: 220px; background: var(--page-background-color, #fff);
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px; box-shadow: 0 6px 20px var(--neutral-shadow-light, rgba(70,70,70,.15)); overflow: hidden; }
.quick-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; font-size: 13px; cursor: pointer; }
.quick-row:hover { background: var(--neutral-lighter, #e3e8f2); }
.chev-r { color: var(--neutral-light, #6a7fa0); }

/* ── filter row ── */
.frow { position: relative; display: flex; align-items: flex-end; gap: 16px; padding: 14px 16px; width: 100%; box-sizing: border-box;
  background: var(--dropdown-background, #fff); border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px; }
.frow-field { flex: 1; }
.frow-label { font-size: 12px; margin-bottom: 4px; color: var(--neutral-light, #6a7fa0); }
.frow-select { display: flex; align-items: center; justify-content: space-between; height: 32px; padding: 0 10px;
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; font-size: 13px; }
.chev-static { color: var(--neutral-light, #6a7fa0); display: inline-flex; }
.frow-actions { display: flex; gap: 8px; }
.frow-x { position: absolute; top: 8px; right: 8px; color: var(--neutral-light, #6a7fa0); cursor: pointer; display: inline-flex; }

/* ── vertical filter ── */
.vfil { width: 300px; border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px; overflow: hidden; }
.vfil-search-wrap { padding: 8px; }
.vfil-search { display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 10px; border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 4px; color: var(--neutral-light, #6a7fa0); font-size: 13px; }
.vfil-body { max-height: 380px; overflow: auto; }
.vgroup { border-top: 1px solid var(--border-color, #e3e8f2); }
.vgroup-head { display: flex; align-items: center; padding: 9px 12px; font-size: 12px; font-weight: 500;
  color: var(--neutral-light, #6a7fa0); cursor: pointer; }
.vchev { margin-right: 8px; transition: transform .12s; }
.vchev.open { transform: rotate(90deg); }
.vrows { padding-bottom: 6px; }
.vrow { display: flex; align-items: center; padding: 5px 12px; font-size: 13px; cursor: pointer; }
.vrow:hover { background: var(--neutral-lighter, #e3e8f2); }
.vcb { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; flex-shrink: 0;
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 3px; background: var(--page-background-color, #fff); }
.vcb.on { background: var(--primary, #111c2c); border-color: var(--primary, #111c2c); }
.vicon { margin: 0 8px; flex-shrink: 0; }
.vname { flex: 1; margin-left: 0; } .vname.noicon { margin-left: 8px; }
.vcount { color: var(--neutral-light, #6a7fa0); }
</style>
