<script setup>
// <obs-metric-list> — the DS metric / KPI list (vertical-value-grid.vue). NOT a data table (though the Storybook
// catalogued it under Table because it reused the .ds-grid chrome): each row is a PROMINENT value — a large number
// + a unit (right-aligned) — followed by its label. No column header. Used by dashboard metric / KPI widgets.
//
//   <obs-metric-list items='[["74","%","CPU Utilization"],["12.4","GB","Memory Used"],["1.2","k req/m","Throughput"]]'></obs-metric-list>
//   (each item is [value, unit, label] OR [value, unit, label, color] OR {value, unit, label, color})
//   `color` is a --severity token (e.g. "--severity-critical") — the product's ColorCodedCell threshold colouring.
import { computed } from 'vue'
const props = defineProps({ items: { type: [String, Array], default: '' } })
const parseArr = (v) => {
  if (Array.isArray(v)) return v
  const s = String(v || '').trim()
  if (s.startsWith('[')) { try { return JSON.parse(s) } catch { return [] } }
  return []
}
const rows = computed(() => parseArr(props.items).map((it) => (Array.isArray(it) ? { value: it[0], unit: it[1], label: it[2], color: it[3] } : it)))
</script>

<template>
  <table class="ml">
    <tbody>
      <tr v-for="(r, i) in rows" :key="i">
        <td class="v"><span class="num" :style="r.color ? { color: `var(${r.color})` } : null">{{ r.value }}</span> <span v-if="r.unit" class="unit">{{ r.unit }}</span></td>
        <td class="lbl">{{ r.label }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { font-family: var(--font-family, "Poppins", sans-serif); display: block; }
.ml { width: 100%; max-width: 400px; border-collapse: collapse; color: var(--page-text-color, #1d2a3e); }
.ml td { padding: 9px 12px; border-bottom: 1px solid var(--border-color, #e3e8f2); vertical-align: middle; transition: background 0.12s ease; }
.ml tr:last-child td { border-bottom: none; }
.ml tr:hover td { background: var(--neutral-lighter, #eef2f8); }
.v { text-align: right; width: 55%; white-space: nowrap; }
.num { font-weight: 600; font-size: 18px; }
.unit { font-size: 11px; color: var(--neutral-light, #6a7fa0); }
.lbl { color: var(--neutral-light, #6a7fa0); font-size: 0.8rem; }
</style>
