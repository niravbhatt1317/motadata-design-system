<script setup>
// <obs-gauge> — a single ring gauge (the product's Monitor-Availability / Alert-Count dial). The DS chart
// library flags "gauge" as custom-engine (data only, no config) — this IS that renderer, as a drop-in element.
// arc = value / total, coloured by a severity level; big number in the centre, optional label under it.
//   <obs-gauge value="160" total="172" severity="up" label="Up"></obs-gauge>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Number, String], default: 0 },
  total: { type: [Number, String], default: 0 }, // the group total → arc fraction (0 total renders just the centre dot)
  severity: { type: String, default: '' },       // severity level → --severity-<level>; '' falls back to --primary
  label: { type: String, default: '' },
})
const R = 42
const C = 2 * Math.PI * R
const dash = computed(() => {
  const t = +props.total, v = +props.value
  const frac = t ? Math.min(Math.max(v / t, 0), 1) : 0
  return `${(frac * C).toFixed(1)} ${C.toFixed(1)}`
})
const color = computed(() => (props.severity ? `var(--severity-${props.severity})` : 'var(--primary, #111c2c)'))
</script>

<template>
  <div class="gauge">
    <svg class="ring" viewBox="0 0 100 100">
      <circle class="track" cx="50" cy="50" :r="R"></circle>
      <circle class="arc" cx="50" cy="50" :r="R" transform="rotate(-90 50 50)" :style="{ stroke: color, strokeDasharray: dash }"></circle>
      <text class="num" x="50" y="50" :style="{ fill: color }">{{ value }}</text>
    </svg>
    <div v-if="label" class="label">{{ label }}</div>
  </div>
</template>

<style>
:host { display: inline-block; }
.gauge { display: flex; flex-direction: column; align-items: center; }
.ring { width: 82px; height: 82px; }
.track { fill: none; stroke: var(--gauge-base-color, #dee5ed); stroke-width: 6; }
.arc { fill: none; stroke-width: 6; stroke-linecap: round; transition: stroke-dasharray .4s ease; }
.num { font-size: 28px; font-weight: 600; text-anchor: middle; dominant-baseline: central; font-family: var(--chart-font-family, 'JetBrains Mono', monospace); }
.label { margin-top: 6px; font-size: 12px; color: var(--neutral-light, #6a7fa0); text-align: center; }
</style>
