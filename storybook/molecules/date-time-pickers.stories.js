// Molecules / Date & Time Pickers — the product's date/time selection family.
//   • MDatePicker (ui/components/Datepicker/Datepicker.vue, wraps a-date-picker) — 10×, the form
//     date / DATE-TIME field. In the product it is ALWAYS used with show-time (all 10 usages).
//   • MTimePicker (ui/components/Datepicker/Timepicker.vue, wraps a-time-picker) — standalone time;
//     12-hour `hh:mm A`, clock icon. Rarely used directly (time is usually picked via the above).
//   • TimeRangePicker (src/components/widgets/time-range-picker.vue) — 42× / 35 files, the HERO:
//     the observability "Last 5m / 1h / 24h / Today / Custom…" range selector. It depends on the
//     Vuex user-preference store + the `datetime` filter + moment, so (like the Kendo grid) it can't
//     render live here — shown as REFERENCE REPRODUCTIONS with the real tokens/labels.
//   • DateTimePopover (src/components/common/date-time-popover.vue) — a lighter custom-range-only
//     popover (MPopover + FlotoFormItem); documented in Usage.
// MDatePicker/MTimePicker are the REAL kit components (no store deps).

// Real relative presets from AVAILABLE_RANGE_OPTIONS (constants.js): label + shortcut pill.
const PRESETS = [
  { k: '-5m', t: 'Last 5 Mins', s: '5m' }, { k: '-15m', t: 'Last 15 Mins', s: '15m' },
  { k: '-30m', t: 'Last 30 Mins', s: '30m' }, { k: '-1h', t: 'Last 1 Hour', s: '1h' },
  { k: '-6h', t: 'Last 6 Hours', s: '6h' }, { k: '-12h', t: 'Last 12 Hours', s: '12h' },
  { k: '-24h', t: 'Last 24 Hours', s: '24h' }, { k: '-48h', t: 'Last 48 Hours', s: '48h' },
  { k: 'today', t: 'Today', s: 'today' }, { k: 'yesterday', t: 'Last Day', s: '1d' },
  { k: 'last.week', t: 'Last Week', s: '1w' }, { k: 'last.month', t: 'Last Month', s: '1mo' },
  { k: 'this.week', t: 'This Week', s: 'week' }, { k: 'this.month', t: 'This Month', s: 'month' },
]
const PILL = 'display:inline-flex;align-items:center;height:18px;padding:0 4px;border-radius:4px;font-size:0.7rem;background:var(--timerange-background-color);color:var(--timerange-text-color)'
const PANEL = 'min-width:200px;background:var(--dropdown-background);border:1px solid var(--border-color);border-radius:4px;box-shadow:0 2px 8px var(--neutral-shadow-light);padding:8px;color:var(--page-text-color)'

export default {
  title: 'Molecules/Date & Time Pickers/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Molecule — the **date/time selection family**. The hero is **`TimeRangePicker`** (42× / 35 files): the observability **time-range** control — a pill + **relative presets** (`Last 5m … Last 48h · Today · This/Last Week · This/Last Month`) + an absolute **Custom** range, with a companion **`TimeRangeSlider`** timeline scrubber. **`MDatePicker`** (10×, wraps `a-date-picker`) is the form **date-time** field — **always used with `show-time`**. **Standalone time pickers are NOT used** (both kit `MTimePicker` and the custom `TimePicker` are 0× as standalone — time comes via `show-time` or the range custom view). **`DateTimePopover`** is a lighter custom-range-only popover. `MDatePicker` here is the **real** kit component; `TimeRangePicker`/`TimeRangeSlider` are **reference reproductions** (they depend on the dashboard store + moment).',
      },
    },
  },
}

// ───────────────────────── MDatePicker (real) ─────────────────────────

// 1. Date-time field — the REAL product usage of MDatePicker (always show-time, 12h).
export const DateTimeField = () => ({
  data: () => ({ d: null }),
  template: `
    <div style="max-width:280px;color:var(--page-text-color)">
      <div class="text-neutral-light mb-2" style="font-size:12px">MDatePicker with <code>:show-time</code> — the product's standard date-time field (calendar + 12-hour time). Click to open.</div>
      <MDatePicker v-model="d" :show-time="true" :allow-clear="true" placeholder="Select date & time" />
    </div>`,
})
DateTimeField.parameters = { docs: { description: { story: 'The **real `MDatePicker`** as the product uses it — **always with `:show-time`** (all 10 real usages pass it). Wraps `a-date-picker`; 12-hour time picker inside the calendar (`hh:mm A`), a **calendar suffix icon**, `allow-clear`, and a `Select…` placeholder. `v-model` is a moment value; `@change` fires on pick. Often paired with `:min-date` (7×) to constrain selection.' } } }

// 2. Date-only + states (allow-clear, disabled).
export const DatePickerStates = () => ({
  data: () => ({ a: null, b: null }),
  template: `
    <div style="display:flex;gap:24px;flex-wrap:wrap;color:var(--page-text-color)">
      <div style="max-width:240px"><div class="text-neutral-light mb-2" style="font-size:12px">Date only (no time)</div>
        <MDatePicker v-model="a" :show-time="false" :allow-clear="true" placeholder="Select date" /></div>
      <div style="max-width:240px"><div class="text-neutral-light mb-2" style="font-size:12px">Disabled</div>
        <MDatePicker v-model="b" :disabled="true" placeholder="Disabled" /></div>
    </div>`,
})
DatePickerStates.parameters = { docs: { description: { story: 'MDatePicker variations: **date-only** (`:show-time="false"`) and **disabled**. `allow-clear` (9×) shows an × to reset. A `:disabled-date` function can grey out non-selectable days, and `:min-date` sets the earliest pickable date.' } } }

// 3. Time picker (real MTimePicker).
export const TimePicker = () => ({
  data: () => ({ t: null }),
  template: `
    <div style="max-width:240px;color:var(--page-text-color)">
      <div class="text-neutral-light mb-2" style="font-size:12px">MTimePicker — 12-hour <code>hh:mm A</code>, clock icon</div>
      <MTimePicker v-model="t" :allow-clear="true" placeholder="Select time" />
    </div>`,
})
TimePicker.parameters = { docs: { description: { story: 'The kit **`MTimePicker`** (wraps `a-time-picker`, **12-hour** `hh:mm A`, clock icon). ⚠️ **Fidelity note:** the product does **not** use a standalone time picker — both the kit `MTimePicker` **and** the custom `TimePicker` are **0×** as standalone tags. Time-of-day is entered via **MDatePicker `show-time`** or **inside TimeRangePicker\'s custom view**, which uses a **custom dropdown-based `TimePicker`** (`src/components/time-picker.vue` — a `FlotoDropdownPicker` of time options with `use-seconds`/`multiple`), not the Ant spinner shown here. This story shows the available kit control for reference.' } } }

// ───────────────────── TimeRangePicker (reference reproduction) ─────────────────────

// 4. TimeRangePicker — FULLY INTERACTIVE: trigger pill → presets panel → Custom dual-month calendar
//    where you click dates to select a range, navigate months/years, and pick From/To times.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const TIMES = (() => { const a = []; for (let h = 0; h < 24; h++) { for (const mm of ['00', '30']) a.push(String(h).padStart(2, '0') + ':' + mm) } return a })()
export const TimeRangePicker = () => ({
  data() {
    const n = new Date()
    return {
      open: false,
      view: 'presets',
      selectedKey: '-24h',
      presets: PRESETS,
      weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      times: TIMES,
      anchorY: 2026, anchorM: 5, // left month = June 2026
      today: new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime(),
      start: new Date(2026, 5, 10).getTime(), // pre-selected range (matches the product screenshot)
      end: new Date(2026, 5, 11).getTime(),
      pickNext: 'start',
      fromTime: '10:05', toTime: null, timeMenu: null,
      headerMode: null, // null (days) | 'month' | 'year'
      monthList: MONTHS,
    }
  },
  computed: {
    sel() {
      if (this.selectedKey === 'custom') {
        const days = this.start && this.end ? Math.max(1, Math.round((this.end - this.start) / 86400000)) : 0
        return { s: days + 'd', t: 'Custom' }
      }
      return this.presets.find((p) => p.k === this.selectedKey) || null
    },
    months() {
      const r = new Date(this.anchorY, this.anchorM + 1, 1)
      return [this.build(this.anchorY, this.anchorM), this.build(r.getFullYear(), r.getMonth())]
    },
    yearGrid() {
      const base = Math.floor(this.anchorY / 10) * 10
      const out = []
      for (let i = -1; i <= 10; i++) out.push(base + i) // decade + 1 padding each side
      return out
    },
  },
  methods: {
    toggle() { this.open = !this.open; if (this.open) { this.view = 'presets'; this.timeMenu = null } },
    pick(k) { this.selectedKey = k; this.open = false },
    apply() { this.selectedKey = 'custom'; this.open = false },
    clear(e) { e.stopPropagation(); this.selectedKey = null; this.open = false },
    build(y, m) {
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
    },
    onCell(c) {
      if (!c.cur || c.ts > this.today) return // can't pick other-month or future days
      if (this.pickNext === 'start' || (this.start && this.end)) { this.start = c.ts; this.end = null; this.pickNext = 'end' }
      else if (c.ts < this.start) { this.start = c.ts }
      else { this.end = c.ts; this.pickNext = 'start' }
    },
    cellStyle(c) {
      const base = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', marginTop: '1px', marginBottom: '1px', fontSize: '13px', borderRadius: '4px' }
      const navy = { background: 'var(--calendar-selected-day-background-color)', color: 'var(--page-background-color)', fontWeight: 500, cursor: 'pointer' }
      if (!c.cur) return { ...base, color: 'var(--neutral-light)', opacity: 0.4 }
      const s = this.start, e = this.end, ts = c.ts
      if (s && e && ts === s) return { ...base, ...navy, borderRadius: '4px 0 0 4px' }
      if (s && e && ts === e) return { ...base, ...navy, borderRadius: '0 4px 4px 0' }
      if (s && e && ts > s && ts < e) return { ...base, background: 'var(--timerange-background-color)', color: 'var(--page-text-color)', borderRadius: '0', cursor: 'pointer' }
      if (s && !e && ts === s) return { ...base, ...navy }
      if (ts > this.today) return { ...base, color: 'var(--neutral-light)', opacity: 0.5 }
      if (ts === this.today) return { ...base, border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }
      return { ...base, color: 'var(--page-text-color)', cursor: 'pointer' }
    },
    prevM() { const d = new Date(this.anchorY, this.anchorM - 1, 1); this.anchorY = d.getFullYear(); this.anchorM = d.getMonth() },
    nextM() { const d = new Date(this.anchorY, this.anchorM + 1, 1); this.anchorY = d.getFullYear(); this.anchorM = d.getMonth() },
    prevY() { this.anchorY-- },
    nextY() { this.anchorY++ },
    openTime(which, e) { e.stopPropagation(); this.timeMenu = this.timeMenu === which ? null : which },
    setTime(t) { if (this.timeMenu === 'from') this.fromTime = t; else this.toTime = t; this.timeMenu = null },
    // header drill-down: click month → month grid, click year → year grid (year → month → days)
    pickMonth(i) { this.anchorM = i; this.headerMode = null },
    pickYear(y) { this.anchorY = y; this.headerMode = 'month' },
    decadeShift(d) { this.anchorY += d },
    cellOf(active) {
      const base = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer' }
      return active
        ? { ...base, background: 'var(--calendar-selected-day-background-color)', color: 'var(--page-background-color)', fontWeight: 500 }
        : { ...base, color: 'var(--page-text-color)' }
    },
  },
  template: `
    <div style="padding-bottom:380px;color:var(--page-text-color);font-size:0.8rem" @click="open=false">
      <div class="text-neutral-light mb-3" style="font-size:12px"><strong>Click the pill</strong> to open → pick a preset, or <strong>Custom</strong> → <strong>click two dates</strong> to select a range, use ‹ › to change months, and the From/To selects for time.</div>
      <div style="position:relative;width:max-content" @click.stop>
        <!-- trigger -->
        <div @click="toggle" class="bg-neutral-lightest flex items-center rounded cursor-pointer" style="padding:4px 8px;width:max-content">
          <template v-if="sel">
            <span :style="'${PILL}'">{{ sel.s }}</span>
            <span style="height:20px;margin:0 8px;border-left:1px solid var(--border-color)"></span>
            <span>{{ sel.t }}</span>
            <MIcon name="times-circle" class="ml-2 text-neutral-light cursor-pointer" style="font-size:12px" @click.native="clear" />
          </template>
          <template v-else>
            <MIcon name="calendar-alt" class="mr-2 text-neutral-light" /><span class="text-neutral-light">Select Time</span>
          </template>
        </div>

        <!-- PRESETS view -->
        <div v-if="open && view==='presets'" :style="'${PANEL}'" style="position:absolute;left:0;top:40px;z-index:20">
          <div style="display:flex;flex-direction:column">
            <a v-for="r in presets" :key="r.k" @click="pick(r.k)" class="flex items-center justify-between cursor-pointer rounded" style="padding:5px 8px;margin:2px 0;text-decoration:none" :style="{ background: selectedKey===r.k ? 'var(--dropdown-hover-background)' : 'transparent', color: selectedKey===r.k ? 'var(--left-menu-text-color-hover)' : 'inherit' }">
              <span>{{ r.t }}</span><span :style="'${PILL}'">{{ r.s }}</span>
            </a>
            <a @click="view='custom'" class="flex items-center cursor-pointer rounded" style="padding:5px 8px;margin:2px 0;text-decoration:none;border-top:1px solid var(--border-color)" :style="{ background: selectedKey==='custom' ? 'var(--dropdown-hover-background)' : 'transparent' }">
              <MIcon name="calendar-alt" class="mr-2 text-neutral-light" /><span>Custom</span>
            </a>
          </div>
        </div>

        <!-- CUSTOM dual-month calendar view (interactive) -->
        <div v-if="open && view==='custom'" :style="'${PANEL}'" style="position:absolute;left:0;top:40px;z-index:20;width:max-content;padding:0">
          <!-- DAY VIEW: two month grids; month + year in the header are clickable -->
          <template v-if="!headerMode">
            <div style="display:flex">
              <div v-for="(m, mi) in months" :key="mi" style="padding:10px 12px" :style="{ borderRight: mi===0 ? '1px solid var(--border-color)' : 'none' }">
                <div class="flex items-center justify-between mb-2" style="font-size:14px;font-weight:500;color:var(--primary-alt)">
                  <span style="display:inline-flex;gap:8px;min-width:46px;user-select:none">
                    <template v-if="mi===0"><span style="cursor:pointer" @click="prevY()" title="Previous year">«</span><span style="cursor:pointer" @click="prevM()" title="Previous month">‹</span></template>
                  </span>
                  <span><span style="cursor:pointer" @click="headerMode='month'">{{ m.mlabel }}</span> <span style="cursor:pointer" @click="headerMode='year'">{{ m.y }}</span></span>
                  <span style="display:inline-flex;gap:8px;min-width:46px;justify-content:flex-end;user-select:none">
                    <template v-if="mi===1"><span style="cursor:pointer" @click="nextM()" title="Next month">›</span><span style="cursor:pointer" @click="nextY()" title="Next year">»</span></template>
                  </span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(7,34px)">
                  <div v-for="w in weekdays" :key="w" class="text-neutral-light" style="text-align:center;font-size:12px;padding:4px 0">{{ w }}</div>
                </div>
                <div v-for="(week, wi) in m.weeks" :key="wi" style="display:grid;grid-template-columns:repeat(7,34px)">
                  <div v-for="(cell, ci) in week" :key="ci"><div :style="cellStyle(cell)" @click="onCell(cell)">{{ cell.d }}</div></div>
                </div>
              </div>
            </div>
            <div style="display:flex;gap:16px;padding:4px 12px 12px">
              <div style="flex:1;position:relative"><div class="text-neutral-light mb-1" style="font-size:12px">From Time</div>
                <div @click="openTime('from',$event)" class="flex items-center justify-between cursor-pointer" style="height:32px;padding:0 10px;border:1px solid var(--timerange-background-color);border-radius:4px;font-size:13px"><span>{{ fromTime || 'Select' }}</span><MIcon name="chevron-down" class="text-neutral-light" style="font-size:11px" /></div>
                <div v-if="timeMenu==='from'" :style="'${PANEL}'" style="position:absolute;left:0;top:60px;z-index:30;max-height:180px;overflow:auto;width:100%;padding:4px">
                  <div v-for="t in times" :key="t" @click="setTime(t)" class="cursor-pointer rounded" style="padding:5px 8px;font-size:13px" :style="{ background: fromTime===t ? 'var(--dropdown-hover-background)' : 'transparent' }">{{ t }}</div>
                </div>
              </div>
              <div style="flex:1;position:relative"><div class="text-neutral-light mb-1" style="font-size:12px">To Time</div>
                <div @click="openTime('to',$event)" class="flex items-center justify-between cursor-pointer" style="height:32px;padding:0 10px;border:1px solid var(--timerange-background-color);border-radius:4px;font-size:13px"><span :class="{ 'text-neutral-light': !toTime }">{{ toTime || 'Select' }}</span><MIcon name="chevron-down" class="text-neutral-light" style="font-size:11px" /></div>
                <div v-if="timeMenu==='to'" :style="'${PANEL}'" style="position:absolute;left:0;top:60px;z-index:30;max-height:180px;overflow:auto;width:100%;padding:4px">
                  <div v-for="t in times" :key="t" @click="setTime(t)" class="cursor-pointer rounded" style="padding:5px 8px;font-size:13px" :style="{ background: toTime===t ? 'var(--dropdown-hover-background)' : 'transparent' }">{{ t }}</div>
                </div>
              </div>
            </div>
            <div style="height:1px;background:var(--border-color)"></div>
            <div class="flex justify-end" style="gap:8px;padding:10px 12px">
              <MButton variant="default" :rounded="false" :shadow="false" @click.native="view='presets'">Cancel</MButton>
              <MButton variant="primary" :rounded="false" :shadow="false" @click.native="apply">Apply</MButton>
            </div>
          </template>

          <!-- MONTH PANEL: click a month -->
          <div v-else-if="headerMode==='month'" style="width:300px;padding:10px 14px 16px">
            <div class="flex items-center justify-between mb-3" style="font-size:14px;font-weight:500;color:var(--primary-alt)">
              <span style="cursor:pointer;user-select:none" @click="anchorY--">«</span>
              <span style="cursor:pointer" @click="headerMode='year'">{{ anchorY }}</span>
              <span style="cursor:pointer;user-select:none" @click="anchorY++">»</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">
              <div v-for="(mn, i) in monthList" :key="mn" @click="pickMonth(i)" :style="cellOf(i===anchorM)">{{ mn }}</div>
            </div>
          </div>

          <!-- YEAR PANEL: click a year (→ month panel) -->
          <div v-else style="width:300px;padding:10px 14px 16px">
            <div class="flex items-center justify-between mb-3" style="font-size:14px;font-weight:500;color:var(--primary-alt)">
              <span style="cursor:pointer;user-select:none" @click="decadeShift(-10)">«</span>
              <span>{{ yearGrid[1] }} - {{ yearGrid[yearGrid.length - 2] }}</span>
              <span style="cursor:pointer;user-select:none" @click="decadeShift(10)">»</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">
              <div v-for="y in yearGrid" :key="y" @click="pickYear(y)" :style="cellOf(y===anchorY)">{{ y }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`,
})
TimeRangePicker.parameters = { controls: { disable: true }, docs: { description: { story: 'The **fully interactive TimeRangePicker** (reference reproduction). **Click the pill** → relative presets; pick one to set & close. Choose **Custom** → the **dual-month calendar is interactive**: **click two dates** to select a range (endpoints fill navy, the days between get a `--tag-bg` highlight), the **‹ ›** arrows change months, **future days are disabled**, today is ringed, and the **From / To Time** fields open a dropdown of times. **Apply** sets the range (pill shows the day-count + `Custom`) & closes; **Cancel** returns to presets; **click outside** dismisses; **×** clears. The live component needs the dashboard store + moment — this reproduces its behavior/markup with the real tokens.' } } }

// 7. TimeRangeSlider — a FUNCTIONAL (draggable) timeline range scrubber matching the product.
//    Reference reproduction of src/components/widgets/time-range-picker/time-range-slider.vue:
//    a full-width tick ruler (~100 fine ticks, HH:mm label every 10th), a --slider-tracker band
//    between two square handles. Div-based so it's token-accurate; handles drag to resize the window.
export const TimeRangeSlider = () => ({
  data: () => ({
    ticks: Array.from({ length: 100 }, (_, i) => i),
    leftPct: 26, rightPct: 50, // selected window edges (% of width)
    drag: null,
  }),
  computed: {
    // HH:mm label every 10th tick (matches `i % 10 === 0`); span auto-expands to ~4× the window.
    labels() {
      const out = []
      const base = 12 * 60 + 49 // start 12:49
      const stepMin = 529 // ~8h49m between labels (≈ 88h span / 10)
      for (let i = 0; i <= 100; i += 10) {
        const m = (base + (i / 10) * stepMin) % 1440
        const hh = String(Math.floor(m / 60)).padStart(2, '0')
        const mm = String(m % 60).padStart(2, '0')
        out.push({ pct: i, t: `${hh}:${mm}` })
      }
      return out
    },
  },
  methods: {
    start(which, e) { this.drag = which; e.preventDefault() },
    move(e) {
      if (!this.drag) return
      const rail = this.$refs.rail
      if (!rail) return
      const r = rail.getBoundingClientRect()
      let pct = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))
      if (this.drag === 'left') this.leftPct = Math.min(pct, this.rightPct - 2)
      else if (this.drag === 'right') this.rightPct = Math.max(pct, this.leftPct + 2)
    },
    end() { this.drag = null },
  },
  mounted() { window.addEventListener('mousemove', this.move); window.addEventListener('mouseup', this.end) },
  beforeDestroy() { window.removeEventListener('mousemove', this.move); window.removeEventListener('mouseup', this.end) },
  template: `
    <div style="color:var(--page-text-color);padding:28px 16px 40px;background:var(--page-background-color)">
      <div class="text-neutral-light mb-5" style="font-size:12px">The <code>TimeRangeSlider</code> — a draggable timeline scrubber (reference reproduction; <strong>drag the round handles</strong> to resize the window). Full-width tick ruler with an <code>HH:mm</code> label every 10th tick, an opaque <code>--slider-tracker</code> pill band between two round handles. Used below the time range in the <strong>dashboard</strong> and the <strong>alert correlation drawer</strong>. Matches the product in both light & dark themes.</div>
      <div ref="rail" style="position:relative;height:18px;width:100%;user-select:none">
        <!-- dense tick ruler: short, light, subtle (--border-color, per source) -->
        <div v-for="t in ticks" :key="t" style="position:absolute;top:4px;width:1px;height:10px;background:var(--border-color)" :style="{ left: (t/99*100) + '%' }"></div>
        <!-- selected band: OPAQUE slate, fully-rounded pill ends, covers the ticks -->
        <div style="position:absolute;top:0;height:18px;background:var(--slider-tracker);border-radius:6px;z-index:1" :style="{ left: leftPct + '%', width: (rightPct-leftPct) + '%' }"></div>
        <!-- small SOLID white dots, INSET inside the band (source: handle-1 margin-left:0, handle-2 -18px) -->
        <div @mousedown="start('left',$event)" style="position:absolute;top:5px;width:8px;height:8px;margin-left:4px;background:var(--page-background-color);border:1px solid var(--neutral-light);border-radius:50%;z-index:2;cursor:ew-resize" :style="{ left: leftPct + '%' }"></div>
        <div @mousedown="start('right',$event)" style="position:absolute;top:5px;width:8px;height:8px;margin-left:-12px;background:var(--page-background-color);border:1px solid var(--neutral-light);border-radius:50%;z-index:2;cursor:ew-resize" :style="{ left: rightPct + '%' }"></div>
        <!-- HH:mm labels every 10th tick -->
        <div v-for="l in labels" :key="'l'+l.pct" style="position:absolute;top:24px;transform:translateX(-50%);font-family:jetBrainsMono,monospace;font-size:0.65rem;color:var(--page-text-color);white-space:nowrap" :style="{ left: l.pct + '%' }">{{ l.t }}</div>
      </div>
    </div>`,
})
TimeRangeSlider.parameters = { docs: { description: { story: 'The **`TimeRangeSlider`** (`widgets/time-range-picker/time-range-slider.vue`) — an Ant **range `Slider`** restyled as a full-width **timeline scrubber**: a **dense tick ruler** (~100 fine ticks) with an **`HH:mm` label every 10th** tick (`DD/MM` / `MMM` for longer spans), a **`--slider-tracker`** band for the selected window, and two **square handles**. The min/max auto-expand to ~4× the current duration so dragging widens the window. **Functional here** — drag the handles to resize. On change it emits the same `{ selectedKey:"custom", startDate, endDate, startTime, endTime }` shape as TimeRangePicker. Sits below the time-range pill in the **dashboard** and the **alert correlation drawer**. (Reference reproduction — the live component needs the dashboard store + moment; matched to the product screenshot.)' } } }

export const PresetsOnly = () => ({
  data: () => ({ open: true, selectedKey: '-24h', presets: PRESETS }),
  computed: { sel() { return this.presets.find((p) => p.k === this.selectedKey) || null } },
  methods: { toggle() { this.open = !this.open }, pick(k) { this.selectedKey = k; this.open = false } },
  template: `
    <div style="padding-bottom:380px;color:var(--page-text-color);font-size:0.8rem">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <code>hide-custom-time-range</code> variant (24×) — a <strong>presets-only</strong> range picker with <strong>no Custom calendar</strong>. Used where an arbitrary range isn't allowed (most dashboard widgets). Click the pill to toggle.</div>
      <div style="position:relative;width:max-content">
        <div @click="toggle" class="bg-neutral-lightest flex items-center rounded cursor-pointer" style="padding:4px 8px;width:max-content">
          <span :style="'${PILL}'">{{ sel ? sel.s : '' }}</span>
          <span style="height:20px;margin:0 8px;border-left:1px solid var(--border-color)"></span>
          <span>{{ sel ? sel.t : 'Select Time' }}</span>
          <MIcon name="chevron-down" class="ml-2 text-neutral-light" style="font-size:11px" />
        </div>
        <div v-if="open" :style="'${PANEL}'" style="position:absolute;left:0;top:40px;z-index:20">
          <div style="display:flex;flex-direction:column">
            <a v-for="r in presets" :key="r.k" @click="pick(r.k)" class="flex items-center justify-between cursor-pointer rounded" style="padding:5px 8px;margin:2px 0;text-decoration:none" :style="{ background: selectedKey===r.k ? 'var(--dropdown-hover-background)' : 'transparent', color: selectedKey===r.k ? 'var(--left-menu-text-color-hover)' : 'inherit' }">
              <span>{{ r.t }}</span><span :style="'${PILL}'">{{ r.s }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>`,
})
PresetsOnly.storyName = 'Presets-only (hide-custom-time-range, 24×)'
PresetsOnly.parameters = { controls: { disable: true }, docs: { description: { story: 'The **`hide-custom-time-range`** variant (24×) — the TimeRangePicker reduced to its **relative presets** (Last 5m … This Month), with the **Custom dual-month calendar removed**. The common form on dashboard widgets and many panels where only a rolling window is meaningful. (Reference reproduction — same store/moment dependency as the full picker.)' } } }
