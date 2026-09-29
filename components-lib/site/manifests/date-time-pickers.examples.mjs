// Showcase manifest for <obs-date-time-picker> — the product's date/time selection family.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
const el = (attrs) => `<obs-date-time-picker ${attrs}></obs-date-time-picker>`
// roomy stage so an OPEN panel/calendar has space below the trigger and never clips
const stage = (label, inner, minH = '120px') => ({ html: `<div style="width:100%">${lbl(label)}<div style="min-height:${minH};padding:8px 4px">${inner}</div></div>` })
export default {
  el: 'obs-date-time-picker',
  display: 'Date & Time Pickers',
  events: ['change'],
  controls: [
    { prop: 'kind', type: 'select', options: ['range', 'range-presets', 'field-datetime', 'field-date', 'field-time', 'slider'] },
    { prop: 'size', type: 'select', options: ['', 'lg'], label: 'Size (range trigger)' },
    { prop: 'disabled', type: 'toggle' },
    { prop: 'bordered', type: 'toggle', label: 'Bordered trigger' },
    { prop: 'allow-clear', type: 'toggle', label: 'Allow clear (×)' },
    { prop: 'show-range', type: 'toggle', label: 'Show resolved range' },
  ],
  playground: { attrs: { kind: 'range', 'allow-clear': '' } },
  gallery: [
    { group: 'TimeRangePicker (42×) — the hero: pill trigger → presets → Custom dual-month calendar', items: [
      stage('range — click the pill to open presets, then Custom', el('kind="range" allow-clear'), '420px'),
    ] },
    { group: 'Presets-only (hide-custom-time-range, 24×) — relative windows, no Custom calendar', items: [
      stage('range-presets — click the pill', el('kind="range-presets"'), '420px'),
    ] },
    { group: 'TimeRangePicker — empty & bordered triggers', items: [
      { html: `<div style="width:100%">${lbl('empty (Select Time) · bordered')}<div style="display:flex;gap:32px;align-items:center;padding:8px 4px;flex-wrap:wrap">${el('kind="range-presets" empty')}${el('kind="range" bordered allow-clear')}</div></div>` },
    ] },
    { group: 'TimeRangePicker — size="lg" (35px, lines up with toolbar buttons) & show-range (resolved window beside the pill)', items: [
      { html: `<div style="width:100%">${lbl('size="lg" · show-range · lg + bordered + show-range')}<div style="display:flex;gap:32px;align-items:flex-start;padding:8px 4px;flex-wrap:wrap">${el('kind="range" size="lg"')}${el('kind="range" show-range')}${el('kind="range" size="lg" bordered show-range')}</div></div>` },
    ] },
    { group: 'MDatePicker (10×) — the form date-time field (always :show-time); date-only; time-only; disabled', items: [
      { html: `<div style="width:100%">${lbl('field-datetime · field-date · field-time · disabled')}<div style="display:flex;gap:20px;align-items:center;padding:8px 4px;flex-wrap:wrap">${el('kind="field-datetime"')}${el('kind="field-date"')}${el('kind="field-time"')}${el('kind="field-datetime" disabled placeholder="Disabled"')}</div></div>` },
    ] },
    { group: 'TimeRangeSlider (2×) — FUNCTIONAL scrubber: drag the round handles (tooltip persists while dragging)', items: [
      { html: `<div style="width:100%">${lbl('slider — default today ± 5-day window (DD/MM axis); drag a handle and watch the tooltip')}${el('kind="slider"')}</div>` },
    ] },
    { group: 'TimeRangeSlider — LINKED to a range (range-start / range-end drive the window & band)', items: [
      { html: `<div style="width:100%">${lbl('slider linked to a ~2-day window (fits + snaps around it → HH:MM axis)')}${el('kind="slider" range-start="1788319800000" range-end="1788521400000"')}</div>` },
      { html: `<div style="width:100%">${lbl('slider linked to a multi-day window (~10 days → DD/MM axis)')}${el('kind="slider" range-start="1787682600000" range-end="1788546600000"')}</div>` },
    ] },
  ],
}
