// Molecules / Scheduler (Recurrence) — ScheduleInput (src/components/schedule-input/index.vue, 16×).
// A composite recurrence builder: a "Scheduler Type" segmented control (Once · Daily · Weekly ·
// Monthly) that swaps in a sub-form. Built from MRadioGroup(as-button) + FlotoFormItem + MDatePicker
// + the custom dropdown TimePicker + FlotoDropdownPicker. Used for backups, discovery, compliance
// audits, monitor (re)discovery schedules, reports, runbooks, etc.
//   • Once / Daily → Start Date + Hours
//   • Weekly       → Days (Mon–Sun) + Start Date + Hours
//   • Monthly      → Months + Dates (1–31) + Start Date + Hours
// value (v-model): { scheduleType, scheduleInfo: { startDate:<ms>, times[], days[], months[], dates[] } }
//
// REFERENCE REPRODUCTION — importing the real ScheduleInput drags in the local DB (lokijs → fs), so
// (like TimeRangePicker) it can't render live; this rebuilds it from the REAL primitives instead:
// MRadioGroup(as-button) + MDatePicker + FlotoDropdownPicker, with the exact fields/labels/options.
const TYPES = [
  { value: 'Once', text: 'Once' }, { value: 'Daily', text: 'Daily' },
  { value: 'Weekly', text: 'Weekly' }, { value: 'Monthly', text: 'Monthly' },
]
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => ({ key: d, text: d }))
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => ({ key: m, text: m }))
const DATES = Array.from({ length: 31 }, (_, i) => ({ key: i + 1, text: String(i + 1) }))
const HOURS = Array.from({ length: 24 }, (_, h) => { const v = String(h).padStart(2, '0') + ':00'; return { key: v, text: v } })

const story = (excluded = [], onlyOnce = false, note = '') => () => ({
  data: () => ({ type: 'Once', startDate: null, hours: [], days: [], months: [], dates: [] }),
  computed: {
    types() { return onlyOnce ? TYPES.filter((t) => t.value === 'Once') : TYPES.filter((t) => !excluded.includes(t.value)) },
    dayOpts() { return DAYS },
    monthOpts() { return MONTHS },
    dateOpts() { return DATES },
    hourOpts() { return HOURS },
    scheduleInfo() {
      const i = { startDate: this.startDate, times: this.hours }
      if (this.type === 'Weekly') i.days = this.days
      if (this.type === 'Monthly') { i.months = this.months; i.dates = this.dates }
      return { scheduleType: this.type, scheduleInfo: i }
    },
  },
  template: `
    <div style="max-width:560px;color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">${note || 'Pick a <strong>Scheduler Type</strong> — the sub-form swaps below.'}</div>

      <div class="mb-1 text-neutral-light" style="font-size:12px">Scheduler Type</div>
      <MRadioGroup v-model="type" :options="types" as-button class="mb-4" />

      <div v-if="type==='Weekly'" class="mb-3">
        <div class="text-neutral-light mb-1" style="font-size:12px">Days</div>
        <FlotoDropdownPicker v-model="days" :options="dayOpts" multiple searchable as-input class="w-full" placeholder="Select days" />
      </div>

      <template v-if="type==='Monthly'">
        <div class="mb-3"><div class="text-neutral-light mb-1" style="font-size:12px">Months</div>
          <FlotoDropdownPicker v-model="months" :options="monthOpts" multiple searchable as-input class="w-full" placeholder="Select months" /></div>
        <div class="mb-3"><div class="text-neutral-light mb-1" style="font-size:12px">Dates</div>
          <FlotoDropdownPicker v-model="dates" :options="dateOpts" multiple searchable as-input class="w-full" placeholder="Select dates (1-31)" /></div>
      </template>

      <div class="flex" style="gap:16px">
        <div style="flex:1"><div class="text-neutral-light mb-1" style="font-size:12px">Start Date</div>
          <MDatePicker v-model="startDate" :show-time="false" :allow-clear="false" placeholder="Select date" /></div>
        <div style="flex:1"><div class="text-neutral-light mb-1" style="font-size:12px">Hours</div>
          <FlotoDropdownPicker v-model="hours" :options="hourOpts" multiple searchable as-input class="w-full" placeholder="Select hours" /></div>
      </div>

      <div class="text-neutral-light mt-4" style="font-size:11px">scheduleInfo -> <code>{{ JSON.stringify(scheduleInfo) }}</code></div>
    </div>`,
})

export default {
  title: 'Molecules/Scheduler/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Molecule — the **recurrence / scheduler builder** (`ScheduleInput`, **16×**). A **"Scheduler Type"** segmented control (`Once · Daily · Weekly · Monthly`) swaps in a sub-form: **Once/Daily** → Start Date + Hours · **Weekly** → Days (Mon–Sun) + Start Date + Hours · **Monthly** → Months + Dates (1–31) + Start Date + Hours. Hours use the custom **dropdown TimePicker** (multi-select times); day/month/date use **`FlotoDropdownPicker`** multi-selects; Start Date is **`MDatePicker`** (date-only, `min-date` = today). **v-model:** `{ scheduleType, scheduleInfo: { startDate, times[], days[], months[], dates[] } }`. Props: **`excluded-schedule-options`** (drop types), **`show-only-once`** (Once only). Used for backups, network discovery, compliance audits, monitor (re)discovery, reports, runbooks. **Reference reproduction** (the live component pulls the local DB / lokijs) built from the real primitives.',
      },
    },
  },
}

export const Default = story()
Default.parameters = { controls: { disable: true }, docs: { description: { story: 'The scheduler. Switch the **Scheduler Type** segmented control: **Once/Daily** show **Start Date + Hours**; **Weekly** adds a **Days** (Mon–Sun) multi-select; **Monthly** adds **Months** + **Dates** (1–31). Hours is a multi-select of times (the custom dropdown TimePicker). The `scheduleInfo` updates live below. Reproduction built from the real `MRadioGroup`(as-button) + `MDatePicker` + `FlotoDropdownPicker`.' } } }

export const ExcludedTypes = story(['Weekly', 'Monthly'], false, '<code>excluded-schedule-options = [Weekly, Monthly]</code> — only Once &amp; Daily remain.')
ExcludedTypes.parameters = { controls: { disable: true }, docs: { description: { story: 'Pass **`:excluded-schedule-options`** to drop types from the segmented control — here only **Once** and **Daily** remain. Use when a feature only supports certain recurrences.' } } }

export const ShowOnlyOnce = story([], true, '<code>show-only-once = true</code> — collapses to just the <strong>Once</strong> type.')
ShowOnlyOnce.parameters = { controls: { disable: true }, docs: { description: { story: '**`:show-only-once`** collapses the picker to the **Once** type only (a single scheduled run, no recurrence).' } } }
