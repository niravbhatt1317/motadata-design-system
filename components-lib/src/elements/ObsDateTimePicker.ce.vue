<script setup>
// <obs-date-time-picker> — the product's date/time selection family (Molecules/Date & Time Pickers).
// kinds:
//   range          → the HERO TimeRangePicker (42×): pill trigger → relative presets → absolute Custom
//                    dual-month calendar (interactive). Reference reproduction with real tokens.
//   range-presets  → hide-custom-time-range (24×): presets only, no Custom calendar.
//   field-datetime → MDatePicker :show-time (10×) — the form date-time field (collapsed input look).
//   field-date     → MDatePicker date-only.
//   field-time     → MTimePicker (12h hh:mm A, clock icon).
//   slider         → TimeRangeSlider (2×): a draggable timeline scrubber.
// MDatePicker/MTimePicker are real Ant kit fields; the range/slider are reference reproductions (store+moment).
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount, useHost } from 'vue'

const props = defineProps({
  kind: { type: String, default: 'range' }, // range | range-presets | field-datetime | field-date | field-time | slider
  disabled: { type: Boolean, default: false },
  bordered: { type: Boolean, default: false },     // range trigger gets a --border-color frame
  allowClear: { type: Boolean, default: false },   // attr allow-clear → times-circle × on the range pill
  empty: { type: Boolean, default: false },        // start with no selection (shows the 'Select Time' placeholder)
  placeholder: { type: String, default: '' },
})
// FUNCTIONAL: reflects the selection to `el.value` (JSON) and emits `change` on every pick. Value shape varies by
// kind — relative/absolute range · a date(+time) ms + display · a time string · slider start/end percent+time.
const emit = defineEmits(['change'])
const host = useHost()

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PRESETS = [
  { k: '-5m', t: 'Last 5 Mins', s: '5m' }, { k: '-15m', t: 'Last 15 Mins', s: '15m' },
  { k: '-30m', t: 'Last 30 Mins', s: '30m' }, { k: '-1h', t: 'Last 1 Hour', s: '1h' },
  { k: '-6h', t: 'Last 6 Hours', s: '6h' }, { k: '-12h', t: 'Last 12 Hours', s: '12h' },
  { k: '-24h', t: 'Last 24 Hours', s: '24h' }, { k: '-48h', t: 'Last 48 Hours', s: '48h' },
  { k: 'today', t: 'Today', s: 'today' }, { k: 'yesterday', t: 'Last Day', s: '1d' },
  { k: 'last.week', t: 'Last Week', s: '1w' }, { k: 'last.month', t: 'Last Month', s: '1mo' },
  { k: 'this.week', t: 'This Week', s: 'week' }, { k: 'this.month', t: 'This Month', s: 'month' },
]
const TIMES = (() => { const a = []; for (let h = 0; h < 24; h++) { for (const mm of ['00', '30']) a.push(String(h).padStart(2, '0') + ':' + mm) } return a })()
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ── range/presets interactive state ──
const open = ref(false)
const view = ref('presets')           // presets | custom
const headerMode = ref(null)          // null (days) | month | year
const selectedKey = ref(props.empty ? null : '-24h')
const anchorY = ref(2026); const anchorM = ref(5) // June 2026 (matches the product screenshot)
const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
const range = reactive({ start: new Date(2026, 5, 10).getTime(), end: new Date(2026, 5, 11).getTime(), pickNext: 'start' })
const fromTime = ref('10:05'); const toTime = ref(null); const timeMenu = ref(null)

const isRange = computed(() => props.kind === 'range' || props.kind === 'range-presets')
const presetsOnly = computed(() => props.kind === 'range-presets')

const sel = computed(() => {
  if (selectedKey.value === 'custom') {
    const days = range.start && range.end ? Math.max(1, Math.round((range.end - range.start) / 86400000)) : 0
    return { s: days + 'd', t: 'Custom' }
  }
  return PRESETS.find((p) => p.k === selectedKey.value) || null
})

function build(y, m) {
  const firstDow = new Date(y, m, 1).getDay()
  const dim = new Date(y, m + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < 42; i++) {
    const dn = i - firstDow + 1
    const dt = new Date(y, m, dn)
    cells.push({ d: dt.getDate(), ts: dt.getTime(), cur: dn >= 1 && dn <= dim })
  }
  const weeks = []
  for (let i = 0; i < 42; i += 7) weeks.push(cells.slice(i, i + 7))
  return { mlabel: MONTHS[m], y, mi: m, weeks }
}
const months = computed(() => {
  const r = new Date(anchorY.value, anchorM.value + 1, 1)
  return [build(anchorY.value, anchorM.value), build(r.getFullYear(), r.getMonth())]
})
const yearGrid = computed(() => {
  const base = Math.floor(anchorY.value / 10) * 10
  const out = []; for (let i = -1; i <= 10; i++) out.push(base + i)
  return out
})

function toggle() { if (props.disabled) return; open.value = !open.value; if (open.value) { view.value = 'presets'; timeMenu.value = null } }
function pick(k) { selectedKey.value = k; open.value = false }
function apply() { selectedKey.value = 'custom'; open.value = false }
function clear(e) { e.stopPropagation(); selectedKey.value = null; open.value = false }
function onCell(c) {
  if (!c.cur || c.ts > today) return
  if (range.pickNext === 'start' || (range.start && range.end)) { range.start = c.ts; range.end = null; range.pickNext = 'end' }
  else if (c.ts < range.start) { range.start = c.ts }
  else { range.end = c.ts; range.pickNext = 'start' }
}
function cellStyle(c) {
  const base = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', marginTop: '1px', marginBottom: '1px', fontSize: '13px', borderRadius: '4px' }
  const navy = { background: 'var(--calendar-selected-day-background-color)', color: 'var(--page-background-color)', fontWeight: 500, cursor: 'pointer' }
  if (!c.cur) return { ...base, color: 'var(--neutral-light)', opacity: 0.4 }
  const s = range.start, e = range.end, ts = c.ts
  if (s && e && ts === s) return { ...base, ...navy, borderRadius: '4px 0 0 4px' }
  if (s && e && ts === e) return { ...base, ...navy, borderRadius: '0 4px 4px 0' }
  if (s && e && ts > s && ts < e) return { ...base, background: 'var(--timerange-background-color)', color: 'var(--page-text-color)', borderRadius: '0', cursor: 'pointer' }
  if (s && !e && ts === s) return { ...base, ...navy }
  if (ts > today) return { ...base, color: 'var(--neutral-light)', opacity: 0.5 }
  if (ts === today) return { ...base, border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }
  return { ...base, color: 'var(--page-text-color)', cursor: 'pointer' }
}
function prevM() { const d = new Date(anchorY.value, anchorM.value - 1, 1); anchorY.value = d.getFullYear(); anchorM.value = d.getMonth() }
function nextM() { const d = new Date(anchorY.value, anchorM.value + 1, 1); anchorY.value = d.getFullYear(); anchorM.value = d.getMonth() }
function openTime(which, e) { e.stopPropagation(); timeMenu.value = timeMenu.value === which ? null : which }
function setTime(t) { if (timeMenu.value === 'from') fromTime.value = t; else toTime.value = t; timeMenu.value = null }
function pickMonth(i) { anchorM.value = i; headerMode.value = null }
function pickYear(y) { anchorY.value = y; headerMode.value = 'month' }
function decadeShift(d) { anchorY.value += d }
function cellOf(active) {
  const base = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer' }
  return active
    ? { ...base, background: 'var(--calendar-selected-day-background-color)', color: 'var(--page-background-color)', fontWeight: 500 }
    : { ...base, color: 'var(--page-text-color)' }
}
function onRootClick() { open.value = false }

// ── slider state ──
const ticks = Array.from({ length: 100 }, (_, i) => i)
const leftPct = ref(26); const rightPct = ref(50); const drag = ref(null); const rail = ref(null)
const labels = computed(() => {
  const out = []; const base = 12 * 60 + 49; const stepMin = 529
  for (let i = 0; i <= 100; i += 10) {
    const m = (base + (i / 10) * stepMin) % 1440
    out.push({ pct: i, t: String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') })
  }
  return out
})
function sStart(which, e) { drag.value = which; e.preventDefault() }
function sMove(e) {
  if (!drag.value || !rail.value) return
  const r = rail.value.getBoundingClientRect()
  const pct = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))
  if (drag.value === 'left') leftPct.value = Math.min(pct, rightPct.value - 2)
  else rightPct.value = Math.max(pct, leftPct.value + 2)
}
function sEnd() { drag.value = null }
onMounted(() => { window.addEventListener('mousemove', sMove); window.addEventListener('mouseup', sEnd) })
onBeforeUnmount(() => { window.removeEventListener('mousemove', sMove); window.removeEventListener('mouseup', sEnd) })

// ── field kinds (MDatePicker / MTimePicker — interactive: click to open a calendar / time menu) ──
const fieldIcon = computed(() => props.kind === 'field-time' ? 'clock' : 'calendar')
const fieldPlaceholder = computed(() => props.placeholder || (props.kind === 'field-time' ? 'Select time' : props.kind === 'field-date' ? 'Select date' : 'Select date & time'))
// MDatePicker / MTimePicker reproduce the real Ant popover: a value INPUT at the top, a calendar (« ‹ Jun 2026 › »),
// a 3-COLUMN time spinner (HH · MM · AM/PM, selected row banded), and a footer (Now · select time/date · Ok).
const fieldOpen = ref(false)
const fieldView = ref('date')        // date | time  (datetime toggles between them; field-time is always time)
const fieldTs = ref(null)            // selected date (ms)
const fieldH = ref(null)             // hour 1..12
const fieldMin = ref(null)           // minute 0..59
const fieldAP = ref(null)            // 'AM' | 'PM'
const hours = Array.from({ length: 12 }, (_, i) => i + 1)
const minutes = Array.from({ length: 60 }, (_, i) => i)
const isDateField = computed(() => props.kind === 'field-date' || props.kind === 'field-datetime')
const isTimeField = computed(() => props.kind === 'field-time')
const fieldMonth = computed(() => build(anchorY.value, anchorM.value))
const p2 = (n) => String(n).padStart(2, '0')
const hasTime = computed(() => fieldH.value != null && fieldMin.value != null && fieldAP.value != null)
const timeStr = computed(() => hasTime.value ? `${p2(fieldH.value)}:${p2(fieldMin.value)} ${fieldAP.value}` : '')
const dateStr = computed(() => { if (!fieldTs.value) return ''; const d = new Date(fieldTs.value); return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}` })
const fieldHeader = computed(() => { if (!fieldTs.value) return ''; const d = new Date(fieldTs.value); return `${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}` })
// the value shown in the field + the popover's top input
const fieldLabel = computed(() => {
  if (isTimeField.value) return timeStr.value
  if (!fieldTs.value) return ''
  return props.kind === 'field-datetime' ? `${dateStr.value}${hasTime.value ? ' ' + timeStr.value : ''}` : dateStr.value
})
const fieldHasValue = computed(() => isTimeField.value ? hasTime.value : !!fieldTs.value)
function setNowTime() { const n = new Date(); const h = n.getHours(); fieldH.value = (h % 12) || 12; fieldMin.value = n.getMinutes(); fieldAP.value = h < 12 ? 'AM' : 'PM' }
function toggleField() {
  if (props.disabled) return
  fieldOpen.value = !fieldOpen.value
  if (fieldOpen.value) fieldView.value = isTimeField.value ? 'time' : 'date'
  if (fieldOpen.value && isTimeField.value && !hasTime.value) setNowTime()
}
function fieldCellClass(c) {
  // selected = filled navy; today (when NOT selected) = a ring; others plain (with a CSS :hover bg)
  return {
    muted: !c.cur,
    sel: c.cur && fieldTs.value === c.ts,
    today: c.cur && c.ts === today && fieldTs.value !== c.ts,
  }
}
function onFieldDay(c) { if (!c.cur) return; fieldTs.value = c.ts; if (props.kind === 'field-date') fieldOpen.value = false }
function gotoTime() { if (!fieldTs.value) fieldTs.value = today; if (!hasTime.value) setNowTime(); fieldView.value = 'time' }
function fieldNow() { const n = new Date(); fieldTs.value = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime(); setNowTime() }
function fieldToday() { fieldTs.value = today; fieldOpen.value = false }
function fieldOk() { fieldOpen.value = false }
function setH(h) { fieldH.value = h } ; function setMin(m) { fieldMin.value = m } ; function setAP(a) { fieldAP.value = a }
function clearField(e) { e.stopPropagation(); fieldTs.value = null; fieldH.value = fieldMin.value = fieldAP.value = null }

// ── functional value: reflect el.value (JSON) + emit `change` on any selection (per-kind value shape) ──
const sliderTimeAt = (pct) => { const m = (12 * 60 + 49 + (pct / 10) * 529) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0') }
const currentValue = computed(() => {
  if (isRange.value) {
    if (selectedKey.value == null) return null
    if (selectedKey.value === 'custom') return { type: 'absolute', start: range.start, end: range.end, fromTime: fromTime.value, toTime: toTime.value }
    const p = PRESETS.find((x) => x.k === selectedKey.value)
    return { type: 'relative', key: selectedKey.value, label: p ? p.t : selectedKey.value, span: p ? p.s : null }
  }
  if (isTimeField.value) return hasTime.value ? { time: timeStr.value } : null
  if (isDateField.value) return fieldTs.value ? { date: fieldTs.value, display: fieldLabel.value } : null
  if (props.kind === 'slider') return { startPct: Math.round(leftPct.value), endPct: Math.round(rightPct.value), start: sliderTimeAt(leftPct.value), end: sliderTimeAt(rightPct.value) }
  return null
})
function reflectValue() { if (!host) return; try { const s = currentValue.value == null ? '' : JSON.stringify(currentValue.value); if (host.value !== s) host.value = s } catch (e) { /* readonly */ } }
watch(currentValue, () => { reflectValue(); emit('change', currentValue.value) }, { deep: true })
onMounted(reflectValue)

// scroll each spinner column so the selected row sits at the top (matches the real Ant time panel)
const colH = ref(null); const colM = ref(null); const colA = ref(null)
function scrollSpinner() {
  nextTick(() => { for (const c of [colH.value, colM.value, colA.value]) { const on = c && c.querySelector('.srow.on'); if (on) c.scrollTop = on.offsetTop } })
}
watch([fieldView, fieldOpen, fieldH, fieldMin, fieldAP], () => { if (fieldOpen.value && fieldView.value === 'time') scrollSpinner() })

// close any open popup when clicking outside this element (works through the shadow boundary via composedPath)
function onDocClick(e) {
  if (e.composedPath().some((n) => n && n.tagName === 'OBS-DATE-TIME-PICKER')) return
  open.value = false; timeMenu.value = null; fieldOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick, true))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick, true))
// switching kind (e.g. in the playground) shouldn't carry over a stale open popup
watch(() => props.kind, () => { open.value = false; timeMenu.value = null; fieldOpen.value = false; view.value = 'presets'; headerMode.value = null; fieldView.value = props.kind === 'field-time' ? 'time' : 'date' })
</script>

<template>
  <!-- ── FIELD kinds (MDatePicker / MTimePicker — real Ant popover: input + calendar / time spinner + footer) ── -->
  <span v-if="kind.startsWith('field')" class="field-wrap" :class="{ open: fieldOpen, wide: isDateField }">
    <span class="field" :class="{ disabled, open: fieldOpen }" @click="toggleField">
      <span class="field-ph" :class="{ filled: fieldHasValue }">{{ fieldLabel || fieldPlaceholder }}</span>
      <obs-icon v-if="fieldHasValue && !disabled" name="timesCircle" size="14" class="ficon clr" @click.stop="clearField"></obs-icon>
      <obs-icon v-else-if="fieldIcon === 'calendar'" name="calendar" size="14" class="ficon"></obs-icon>
      <obs-icon v-else name="clock" size="14" class="ficon"></obs-icon>
    </span>

    <div v-if="fieldOpen" class="dt-pop">
      <!-- CALENDAR view -->
      <div v-if="fieldView === 'date'" class="dt-body">
        <div class="mhead">
          <span class="nav"><span class="navbtn" @click.stop="anchorY--"><obs-icon name="chevronDoubleLeft" size="11"></obs-icon></span><span class="navbtn" @click.stop="prevM()"><obs-icon name="chevronLeft" size="11"></obs-icon></span></span>
          <span class="mtitle">{{ fieldMonth.mlabel }} {{ fieldMonth.y }}</span>
          <span class="nav end"><span class="navbtn" @click.stop="nextM()"><obs-icon name="chevronRight" size="11"></obs-icon></span><span class="navbtn" @click.stop="anchorY++"><obs-icon name="chevronDoubleRight" size="11"></obs-icon></span></span>
        </div>
        <div class="wgrid7"><div v-for="w in weekdays" :key="w" class="wd">{{ w }}</div></div>
        <div v-for="(week, wi) in fieldMonth.weeks" :key="wi" class="wgrid7">
          <div v-for="(cell, ci) in week" :key="ci"><div class="fday" :class="fieldCellClass(cell)" @click.stop="onFieldDay(cell)">{{ cell.d }}</div></div>
        </div>
      </div>

      <!-- TIME spinner (3 columns) -->
      <div v-else class="dt-body time">
        <div v-if="isDateField" class="time-header">{{ fieldHeader || 'Select date' }}</div>
        <div class="spinner">
          <div class="scol" ref="colH">
            <div v-for="h in hours" :key="'h'+h" class="srow" :class="{ on: fieldH === h }" @click.stop="setH(h)">{{ p2(h) }}</div>
          </div>
          <div class="scol" ref="colM">
            <div v-for="m in minutes" :key="'m'+m" class="srow" :class="{ on: fieldMin === m }" @click.stop="setMin(m)">{{ p2(m) }}</div>
          </div>
          <div class="scol" ref="colA">
            <div v-for="a in ['AM','PM']" :key="a" class="srow" :class="{ on: fieldAP === a }" @click.stop="setAP(a)">{{ a }}</div>
          </div>
        </div>
      </div>

      <!-- footer — date-only: a single centered "Today"; time-only: Now · Ok; date-time: Now · select time/date · Ok -->
      <div class="dt-foot" :class="{ single: kind === 'field-date' }">
        <template v-if="kind === 'field-date'">
          <span class="link today" @click.stop="fieldToday">Today</span>
        </template>
        <template v-else>
          <span class="link" @click.stop="fieldNow">Now</span>
          <span v-if="kind === 'field-datetime' && fieldView === 'date'" class="link mid" @click.stop="gotoTime">select time</span>
          <span v-else-if="kind === 'field-datetime' && fieldView === 'time'" class="link mid" @click.stop="fieldView = 'date'">select date</span>
          <span v-else class="mid"></span>
          <button class="btn primary sm" @click.stop="fieldOk">Ok</button>
        </template>
      </div>
    </div>
  </span>

  <!-- ── SLIDER ── -->
  <div v-else-if="kind === 'slider'" class="slider-wrap">
    <div ref="rail" class="rail">
      <div v-for="t in ticks" :key="t" class="tick" :style="{ left: (t / 99 * 100) + '%' }"></div>
      <div class="band" :style="{ left: leftPct + '%', width: (rightPct - leftPct) + '%' }"></div>
      <div class="handle" :style="{ left: leftPct + '%', marginLeft: '4px' }" @mousedown="sStart('left', $event)"></div>
      <div class="handle" :style="{ left: rightPct + '%', marginLeft: '-12px' }" @mousedown="sStart('right', $event)"></div>
      <div v-for="l in labels" :key="'l' + l.pct" class="tlabel" :style="{ left: l.pct + '%' }">{{ l.t }}</div>
    </div>
  </div>

  <!-- ── RANGE / PRESETS (the hero) ── -->
  <div v-else class="range-root" @click="onRootClick">
    <div class="anchor" @click.stop>
      <!-- trigger -->
      <div class="trigger" :class="{ bordered, disabled }" @click="toggle">
        <template v-if="sel">
          <span class="pill">{{ sel.s }}</span>
          <span class="sep"></span>
          <span class="lbl">{{ sel.t }}</span>
          <obs-icon v-if="allowClear" name="timesCircle" size="12" class="clr" @click.stop="clear"></obs-icon>
          <obs-icon v-else name="chevronDown" size="12" class="chev"></obs-icon>
        </template>
        <template v-else>
          <obs-icon name="calendar" size="14" class="cal"></obs-icon>
          <span class="lbl muted">Select Time</span>
        </template>
      </div>

      <!-- PRESETS view -->
      <div v-if="open && view === 'presets'" class="panel presets">
        <a v-for="r in PRESETS" :key="r.k" class="prow" :class="{ active: selectedKey === r.k }" @click="pick(r.k)">
          <span>{{ r.t }}</span><span class="pill">{{ r.s }}</span>
        </a>
        <a v-if="!presetsOnly" class="prow custom-row" :class="{ active: selectedKey === 'custom' }" @click="view = 'custom'">
          <span class="cal-row"><obs-icon name="calendar" size="13" class="cal sm"></obs-icon>Custom</span>
        </a>
      </div>

      <!-- CUSTOM dual-month calendar -->
      <div v-if="open && view === 'custom'" class="panel custom">
        <template v-if="!headerMode">
          <div class="months">
            <div v-for="(m, mi) in months" :key="mi" class="month" :class="{ divr: mi === 0 }">
              <div class="mhead">
                <span class="nav">
                  <template v-if="mi === 0"><span class="navbtn" @click="anchorY--"><obs-icon name="chevronDoubleLeft" size="11"></obs-icon></span><span class="navbtn" @click="prevM()"><obs-icon name="chevronLeft" size="11"></obs-icon></span></template>
                </span>
                <span class="mtitle"><span class="lk" @click="headerMode = 'month'">{{ m.mlabel }}</span> <span class="lk" @click="headerMode = 'year'">{{ m.y }}</span></span>
                <span class="nav end">
                  <template v-if="mi === 1"><span class="navbtn" @click="nextM()"><obs-icon name="chevronRight" size="11"></obs-icon></span><span class="navbtn" @click="anchorY++"><obs-icon name="chevronDoubleRight" size="11"></obs-icon></span></template>
                </span>
              </div>
              <div class="wgrid">
                <div v-for="w in weekdays" :key="w" class="wd">{{ w }}</div>
              </div>
              <div v-for="(week, wi) in m.weeks" :key="wi" class="wgrid">
                <div v-for="(cell, ci) in week" :key="ci"><div :style="cellStyle(cell)" @click="onCell(cell)">{{ cell.d }}</div></div>
              </div>
            </div>
          </div>
          <div class="times">
            <div class="tcol">
              <div class="tlab">From Time</div>
              <div class="tfield" @click="openTime('from', $event)"><span>{{ fromTime || 'Select' }}</span><obs-icon name="chevronDown" size="11" class="chev sm"></obs-icon></div>
              <div v-if="timeMenu === 'from'" class="panel tmenu">
                <div v-for="t in TIMES" :key="t" class="trow" :class="{ active: fromTime === t }" @click="setTime(t)">{{ t }}</div>
              </div>
            </div>
            <div class="tcol">
              <div class="tlab">To Time</div>
              <div class="tfield" @click="openTime('to', $event)"><span :class="{ muted: !toTime }">{{ toTime || 'Select' }}</span><obs-icon name="chevronDown" size="11" class="chev sm"></obs-icon></div>
              <div v-if="timeMenu === 'to'" class="panel tmenu">
                <div v-for="t in TIMES" :key="t" class="trow" :class="{ active: toTime === t }" @click="setTime(t)">{{ t }}</div>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="actions">
            <button class="btn default" @click.stop="view = 'presets'">Cancel</button>
            <button class="btn primary" @click.stop="apply">Apply</button>
          </div>
        </template>

        <div v-else-if="headerMode === 'month'" class="picker-grid">
          <div class="mhead center"><span class="navbtn" @click="anchorY--"><obs-icon name="chevronDoubleLeft" size="11"></obs-icon></span><span class="lk" @click="headerMode = 'year'">{{ anchorY }}</span><span class="navbtn" @click="anchorY++"><obs-icon name="chevronDoubleRight" size="11"></obs-icon></span></div>
          <div class="g3"><div v-for="(mn, i) in MONTHS" :key="mn" :style="cellOf(i === anchorM)" @click="pickMonth(i)">{{ mn }}</div></div>
        </div>

        <div v-else class="picker-grid">
          <div class="mhead center"><span class="navbtn" @click="decadeShift(-10)"><obs-icon name="chevronDoubleLeft" size="11"></obs-icon></span><span>{{ yearGrid[1] }} - {{ yearGrid[yearGrid.length - 2] }}</span><span class="navbtn" @click="decadeShift(10)"><obs-icon name="chevronDoubleRight" size="11"></obs-icon></span></div>
          <div class="g3"><div v-for="y in yearGrid" :key="y" :style="cellOf(y === anchorY)" @click="pickYear(y)">{{ y }}</div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: inline-block; font-family: var(--font-family, 'Poppins', sans-serif); font-size: 0.8rem; color: var(--page-text-color, #1d2a3e); }
/* native form controls don't inherit font-family — force Poppins (else they render in the UA font, e.g. Arial) */
button, input, select, textarea { font-family: inherit; }
:host([kind="slider"]) { display: block; width: 100%; }

/* ── field ── */
.field-wrap { position: relative; display: inline-block; }
.field-wrap.open.wide { width: 300px; }
.field-wrap.open:not(.wide) { width: 260px; }
.field { display: inline-flex; align-items: center; justify-content: space-between; gap: 8px; box-sizing: border-box;
  width: 100%; min-width: 220px; height: 36px; padding: 0 14px; border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px;
  background: var(--page-background-color, #fff); cursor: pointer; }
.field-ph { color: var(--neutral-light, #6a7fa0); font-size: 13px; }
.field-ph.filled { color: var(--page-text-color, #1d2a3e); }
.ficon { color: var(--neutral-light, #6a7fa0); flex-shrink: 0; }
.ficon.clr { cursor: pointer; }
.field.disabled { background: var(--neutral-lightest, #ecf1f9); cursor: not-allowed; }
.field.disabled .field-ph, .field.disabled .ficon { opacity: 0.6; }
.field.open { border-color: var(--primary-alt, #1d2a3e); border-bottom-color: transparent; border-bottom-left-radius: 0; border-bottom-right-radius: 0; }

/* the Ant-style connected popover: flush below the input, then body + footer */
.dt-pop { position: absolute; left: 0; top: calc(100% - 1px); z-index: 30; box-sizing: border-box; width: 100%;
  background: var(--dropdown-background, #fff); border: 1px solid var(--border-color, #e3e8f2); border-top: none;
  border-radius: 0 0 6px 6px; box-shadow: 0 6px 16px var(--neutral-shadow-light, rgba(70,70,70,.15)); overflow: hidden; }
.dt-body { padding: 10px 14px; }
.dt-body .mhead { margin-bottom: 6px; }
.dt-body .mhead .mtitle { color: var(--primary-alt, #1d2a3e); font-size: 15px; }
.wgrid7 { display: grid; grid-template-columns: repeat(7, 1fr); }
.wgrid7 .wd { text-align: center; font-size: 12px; padding: 6px 0; color: var(--neutral-light, #6a7fa0); }
.wgrid7 > div { display: flex; align-items: center; justify-content: center; }
/* day cell states: plain · hover · today (ring) · selected (filled). today ≠ selected so they read differently */
.fday { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; margin: 1px 0; box-sizing: border-box;
  font-size: 13px; border: 1px solid transparent; border-radius: 4px; cursor: pointer; color: var(--page-text-color, #1d2a3e); }
.fday.muted { color: var(--neutral-light, #6a7fa0); opacity: 0.4; cursor: default; }
.fday:not(.muted):not(.sel):hover { background: var(--dropdown-hover-background, #ecf1f9); }
.fday.today { border-color: var(--primary, #111c2c); color: var(--primary, #111c2c); font-weight: 600; }
.fday.sel { background: var(--calendar-selected-day-background-color, #111c2c); color: var(--page-background-color, #fff); font-weight: 500; border-color: var(--calendar-selected-day-background-color, #111c2c); }
.dt-body.time { padding: 0; }
.time-header { text-align: center; padding: 10px 0; font-size: 15px; font-weight: 500; color: var(--primary-alt, #1d2a3e); }
.spinner { display: flex; height: 232px; border-top: 1px solid var(--border-color, #e3e8f2); }
.scol { position: relative; flex: 1; overflow-y: auto; border-right: 1px solid var(--border-color, #e3e8f2); }
.scol:last-child { border-right: none; }
.scol::-webkit-scrollbar { width: 6px; }
.scol::-webkit-scrollbar-thumb { background: var(--neutral-lightest, #ecf1f9); border-radius: 3px; }
.srow { text-align: center; padding: 7px 0; font-size: 14px; cursor: pointer; color: var(--page-text-color, #1d2a3e); }
.srow:hover { background: var(--dropdown-hover-background, #ecf1f9); }
.srow.on { background: var(--timerange-background-color, #e3e8f2); font-weight: 700; }
.dt-foot { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; border-top: 1px solid var(--border-color, #e3e8f2); }
.dt-foot.single { justify-content: center; }
.dt-foot .link { color: var(--primary-alt, #1d2a3e); cursor: pointer; font-size: 13px; }
.dt-foot .link:hover { color: var(--primary, #111c2c); }
.dt-foot .today { color: var(--page-text-color, #1d2a3e); font-size: 14px; padding: 2px 0; }
.dt-foot .mid { flex: 1; text-align: center; color: var(--neutral-light, #6a7fa0); }
.btn.sm { height: 28px; padding: 0 16px; font-size: 13px; }

/* ── range trigger ── */
.range-root { font-size: 0.8rem; }
.anchor { position: relative; width: max-content; }
.trigger { display: inline-flex; align-items: center; box-sizing: border-box; padding: 4px 8px; border-radius: 4px;
  background: var(--neutral-lightest, #ecf1f9); cursor: pointer; width: max-content; }
.trigger.bordered { border: 1px solid var(--border-color, #e3e8f2); }
.trigger.disabled { opacity: 0.6; cursor: not-allowed; }
.pill { display: inline-flex; align-items: center; height: 18px; padding: 0 4px; border-radius: 4px; font-size: 0.7rem;
  background: var(--timerange-background-color, #e3e8f2); color: var(--timerange-text-color, #7186a8); }
.sep { height: 20px; margin: 0 8px; border-left: 1px solid var(--border-color, #e3e8f2); }
.lbl { color: var(--page-text-color, #1d2a3e); }
.lbl.muted, .muted { color: var(--neutral-light, #6a7fa0); }
.clr, .chev { margin-left: 8px; color: var(--neutral-light, #6a7fa0); cursor: pointer; flex-shrink: 0; }
.chev.sm { margin-left: 0; }
.cal { margin-right: 8px; color: var(--neutral-light, #6a7fa0); }
.cal.sm { margin-right: 8px; }

/* ── panels ── */
.panel { position: absolute; left: 0; top: 40px; z-index: 20; min-width: 200px; box-sizing: border-box;
  background: var(--dropdown-background, #fff); border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px;
  box-shadow: 0 2px 8px var(--neutral-shadow-light, rgba(70,70,70,.15)); padding: 8px; color: var(--page-text-color, #1d2a3e); }
.presets { display: flex; flex-direction: column; }
.prow { display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; margin: 2px 0; border-radius: 4px;
  text-decoration: none; color: inherit; cursor: pointer; }
.prow.active { background: var(--dropdown-hover-background, #ecf1f9); color: var(--left-menu-text-color-hover, #111c2c); }
.prow:hover { background: var(--dropdown-hover-background, #ecf1f9); }
.custom-row { border-top: 1px solid var(--border-color, #e3e8f2); }
.cal-row { display: inline-flex; align-items: center; }

/* ── custom calendar ── */
.custom { width: max-content; padding: 0; }
.months { display: flex; }
.month { padding: 10px 12px; }
.month.divr { border-right: 1px solid var(--border-color, #e3e8f2); }
.mhead { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: var(--primary-alt, #1d2a3e); }
.mhead.center { justify-content: space-between; margin-bottom: 12px; }
.nav { display: inline-flex; gap: 8px; min-width: 46px; user-select: none; }
.nav.end { justify-content: flex-end; }
.navbtn { cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.navbtn obs-icon { display: block; }
.mtitle .lk, .lk { cursor: pointer; }
.wgrid { display: grid; grid-template-columns: repeat(7, 34px); }
.wd { text-align: center; font-size: 12px; padding: 4px 0; color: var(--neutral-light, #6a7fa0); }
.times { display: flex; gap: 16px; padding: 4px 12px 12px; }
.tcol { flex: 1; position: relative; }
.tlab { font-size: 12px; margin-bottom: 4px; color: var(--neutral-light, #6a7fa0); }
.tfield { display: flex; align-items: center; justify-content: space-between; height: 32px; padding: 0 10px;
  border: 1px solid var(--timerange-background-color, #e3e8f2); border-radius: 4px; font-size: 13px; cursor: pointer; }
.tmenu { top: 60px; width: 100%; max-height: 180px; overflow: auto; padding: 4px; }
.trow { padding: 5px 8px; font-size: 13px; border-radius: 4px; cursor: pointer; }
.trow.active { background: var(--dropdown-hover-background, #ecf1f9); }
.trow:hover { background: var(--dropdown-hover-background, #ecf1f9); }
.divider { height: 1px; background: var(--border-color, #e3e8f2); }
.actions { display: flex; justify-content: flex-end; gap: 8px; padding: 10px 12px; }
.btn { font: inherit; font-size: 13px; font-weight: 400; height: 32px; padding: 0 14px; border-radius: 4px; cursor: pointer; border: 1px solid transparent; }
.btn.default { background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); border-color: var(--border-color, #e3e8f2); }
.btn.primary { background: var(--primary, #111c2c); color: var(--page-background-color, #fff); border-color: var(--primary, #111c2c); }
.picker-grid { width: 300px; padding: 10px 14px 16px; }
.g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }

/* ── slider ── */
.slider-wrap { color: var(--page-text-color, #1d2a3e); padding: 22px 8px 36px; background: var(--page-background-color, #fff); }
.rail { position: relative; height: 18px; width: 100%; min-width: 320px; user-select: none; }
.tick { position: absolute; top: 4px; width: 1px; height: 10px; background: var(--border-color, #e3e8f2); }
.band { position: absolute; top: 0; height: 18px; background: var(--slider-tracker, #485975); border-radius: 6px; z-index: 1; }
.handle { position: absolute; top: 5px; width: 8px; height: 8px; background: var(--page-background-color, #fff);
  border: 1px solid var(--neutral-light, #6a7fa0); border-radius: 50%; z-index: 2; cursor: ew-resize; }
.tlabel { position: absolute; top: 24px; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  color: var(--page-text-color, #1d2a3e); white-space: nowrap; }
</style>
