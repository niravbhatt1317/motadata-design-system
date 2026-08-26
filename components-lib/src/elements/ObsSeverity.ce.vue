<script setup>
// <obs-severity> — DS `severity` (severity.vue / severity.less, 80×). The severity-LEVEL indicator: one
// class set rendered in several SHAPES — dot (11px, 2px --severity-<level> ring + light --severity-<level>-
// dot-box centre), solid chip (filled + white), coloured text (numeric, JetBrains Mono), bg-fill cell
// (--severity-<level>-lighter tint + 1px ring), stripe (4px left rule). Quirks (from severity.less): `down`
// = solid dot (0 border); `up` = green ring + critical(light-red) centre; `disable` centre = -lighter.
// Source-accurate 11px dot (the Storybook reproduction enlarges to 14px). Presentational, no events.
import { computed } from 'vue'
const props = defineProps({
  severity: { type: String, default: 'unknown' },
  shape: { type: String, default: 'dot' }, // dot | chip | text | bg | stripe
  displayText: { type: Boolean, default: false }, // dot + capitalized label
  value: { type: String }, // text/chip/bg display value (default = capitalized level)
})
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const baseVar = computed(() => `var(--severity-${props.severity})`)
const fillVar = computed(() => {
  if (props.severity === 'down') return `var(--severity-down)`            // solid
  if (props.severity === 'up') return `var(--severity-critical-dot-box)`  // quirk: red centre
  if (props.severity === 'disable') return `var(--severity-disable-lighter)` // no -dot-box
  return `var(--severity-${props.severity}-dot-box)`
})
const displayLabel = computed(() => cap(props.severity))
const displayValue = computed(() => props.value ?? cap(props.severity))
const dotStyle = computed(() => (props.severity === 'down'
  ? { background: baseVar.value, border: '0' }
  : { border: `2px solid ${baseVar.value}`, background: fillVar.value }))
const chipStyle = computed(() => ({ background: baseVar.value }))
const textStyle = computed(() => ({ color: baseVar.value }))
const bgStyle = computed(() => ({ background: `var(--severity-${props.severity}-lighter)`, borderColor: baseVar.value, color: baseVar.value }))
</script>

<template>
  <span class="sev" :class="'shape-' + shape" :title="displayLabel" :role="displayText ? null : 'img'" :aria-label="displayText ? null : displayLabel">
    <template v-if="shape === 'dot'">
      <span class="dot" :style="dotStyle" aria-hidden="true"></span>
      <span v-if="displayText" class="lbl">{{ displayLabel }}</span>
    </template>
    <span v-else-if="shape === 'chip'" class="chip" :style="chipStyle">{{ displayValue }}</span>
    <span v-else-if="shape === 'text'" class="txt" :style="textStyle">{{ displayValue }}</span>
    <span v-else-if="shape === 'bg'" class="bgcell" :style="bgStyle">{{ displayValue }}</span>
    <span v-else-if="shape === 'bar'" class="bar" :style="{ background: baseVar }" aria-hidden="true"></span>
    <span v-else-if="shape === 'stripe'" class="striperow" :style="{ borderLeftColor: baseVar }"><slot>{{ displayValue }}</slot></span>
  </span>
</template>

<style>
:host([hidden]) { display: none !important; }
.sev { display: inline-flex; align-items: center; gap: 7px; vertical-align: middle;
  font-family: var(--font-family, 'Poppins', sans-serif); color: var(--page-text-color, #1d2a3e); }
/* dot — 11px circle, 2px coloured ring + light centre (source: severity.less) */
.dot { display: inline-block; flex-shrink: 0; box-sizing: border-box; width: 11px; height: 11px; border-radius: 50%; }
.lbl { font-size: 13px; }
/* solid chip — filled + white text */
.chip { display: inline-flex; align-items: center; padding: 1px 10px; border-radius: 10px;
  color: var(--white-regular, #fff); font-size: 12px; white-space: nowrap; }
/* coloured numeric text — JetBrains Mono */
.txt { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 600; font-size: 13px; }
/* bg-fill cell — light tint + 1px coloured border */
.bgcell { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 4px;
  border: 1px solid; font-size: 12px; white-space: nowrap; }
/* bar — the standalone `severity-stripe`: a short coloured vertical accent rule (4px, on its own). */
.bar { display: inline-block; width: 4px; height: 18px; border-radius: 2px; align-self: stretch; }
/* stripe — the `severity-stripe` variant: a coloured 4px left rule down a list row/card (the row's
   monitor severity). Slot in the row content (e.g. a dot + the monitor name); falls back to the level. */
.sev.shape-stripe { display: flex; width: 100%; }
.striperow { display: flex; align-items: center; gap: 8px; box-sizing: border-box; width: 100%;
  border-left: 4px solid; padding: 8px 12px; font-size: 13px; }
.striperow ::slotted(obs-severity) { margin-right: 0; }
</style>
