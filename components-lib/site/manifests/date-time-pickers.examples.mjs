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
    { prop: 'disabled', type: 'toggle' },
    { prop: 'bordered', type: 'toggle', label: 'Bordered trigger' },
    { prop: 'allow-clear', type: 'toggle', label: 'Allow clear (×)' },
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
    { group: 'MDatePicker (10×) — the form date-time field (always :show-time); date-only; disabled', items: [
      { html: `<div style="width:100%">${lbl('field-datetime · field-date · field-time · disabled')}<div style="display:flex;gap:20px;align-items:center;padding:8px 4px;flex-wrap:wrap">${el('kind="field-datetime"')}${el('kind="field-date"')}${el('kind="field-time"')}${el('kind="field-datetime" disabled placeholder="Disabled"')}</div></div>` },
    ] },
    { group: 'TimeRangeSlider (2×) — a draggable timeline scrubber (drag the round handles)', items: [
      { html: `<div style="width:100%">${lbl('slider — full-width timeline window')}${el('kind="slider"')}</div>` },
    ] },
  ],
}
