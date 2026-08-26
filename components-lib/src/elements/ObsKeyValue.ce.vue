<script setup>
// <obs-key-value> — the DS key-value / description list (column-grid-view.vue / overview-layout.vue). NOT a data
// table (the Storybook catalogued it under Table only because it reused the .ds-grid chrome): a TRANSPOSED grid
// where columns become row labels — a label cell on the left + the record's value on the right. A single-record
// DETAIL view, common in widget overviews and detail panels.
//
//   <obs-key-value items='[["Monitor","web-server-01"],["IP Address","10.0.0.12"],["Type","Linux Server"]]'></obs-key-value>
//   (each item is [label, value] OR [label, value, color, status] OR {label, value, color, status})
//   - color:  a --severity token (e.g. "--severity-critical") — the product ColorCodedCell threshold colouring.
//   - status: renders the value as an obs-tag (the overview-layout status cell), e.g. status:"running".
//
//   variant="card" (default) — bordered card with a tinted label cell (column-grid-view)
//   variant="plain"          — borderless, muted label, no card (overview-layout)
//   columns="2"              — lay the pairs out two-across (overview-layout 2-columns)
import { computed } from 'vue'
const props = defineProps({
  items: { type: [String, Array], default: '' },
  columns: { type: [Number, String], default: 1 }, // 1 | 2 — pairs per row
  variant: { type: String, default: 'card' },      // card | plain
})
const parseArr = (v) => {
  if (Array.isArray(v)) return v
  const s = String(v || '').trim()
  if (s.startsWith('[')) { try { return JSON.parse(s) } catch { return [] } }
  return []
}
const rows = computed(() => parseArr(props.items).map((it) => (Array.isArray(it) ? { label: it[0], value: it[1], color: it[2], status: it[3] } : it)))
const cols = computed(() => Math.max(1, Math.min(2, Number(props.columns) || 1)))
// chunk the pairs into rows of `cols` (so a 2-column layout renders label|value|label|value per <tr>)
const grid = computed(() => {
  const out = []; const r = rows.value; const c = cols.value
  for (let i = 0; i < r.length; i += c) out.push(r.slice(i, i + c))
  return out
})
</script>

<template>
  <table class="kv" :class="[`v-${variant}`, `cols-${cols}`]">
    <tbody>
      <tr v-for="(pair, i) in grid" :key="i">
        <template v-for="(r, j) in pair" :key="j">
          <td class="k">{{ r.label }}</td>
          <td class="val" :style="r.color ? { color: `var(${r.color})`, fontWeight: 600 } : null">
            <obs-tag v-if="r.status" :status="String(r.status)"></obs-tag>
            <template v-else>{{ r.value }}</template>
          </td>
        </template>
        <template v-if="pair.length < cols"><td class="k pad"></td><td class="val pad"></td></template>
      </tr>
    </tbody>
  </table>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { font-family: var(--font-family, "Poppins", sans-serif); display: block; }
.kv { width: 100%; border-collapse: collapse; color: var(--page-text-color, #1d2a3e); table-layout: fixed; }
.kv.cols-1 { max-width: 480px; }
.kv td { padding: 9px 14px; border-bottom: 1px solid var(--border-color, #e3e8f2); vertical-align: middle; font-size: 0.8rem; transition: background 0.12s ease; overflow: hidden; text-overflow: ellipsis; }
.kv tr:last-child td { border-bottom: none; }
.k { width: 30%; font-weight: 500; }
.kv.cols-2 .k { width: 22%; }
.kv td.val obs-tag { display: inline-flex; vertical-align: middle; }

/* card (default) — bordered card, tinted label cell (column-grid-view) */
.kv.v-card { border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px; overflow: hidden; }
/* label text: --neutral-regular is muted in BOTH themes (light #7186a8 / dark #6a7fa0); --neutral-dark would go
   near-black on the dark tinted cell and vanish. */
.kv.v-card .k { color: var(--neutral-regular, #7186a8); background: var(--grid-header-bg, #ecf1f9); border-right: 1px solid var(--border-color, #e3e8f2); }
.kv.v-card.cols-2 tr > td:nth-child(3) { border-left: 1px solid var(--border-color, #e3e8f2); }
.kv.v-card tr:hover td.val { background: var(--neutral-lighter, #eef2f8); }

/* plain — borderless, muted label, no card (overview-layout) */
.kv.v-plain { border: none; }
.kv.v-plain td { border-bottom: none; padding: 6px 10px; }
.kv.v-plain .k { color: var(--neutral-light, #6a7fa0); }
.kv.v-plain tr:hover td.val { background: var(--neutral-lighter, #eef2f8); }
</style>
