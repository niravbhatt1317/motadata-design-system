<script setup>
// <obs-severity-heatmap> — the product's Infrastructure-Heatmap honeycomb (PlainHeatMap): one hexagon per
// cell, coloured by its severity. The DS chart library flags "heat-map" as custom-engine (data only, no
// renderer) — this IS that renderer, ported 1:1 from the product's heatmap-single-group.vue / general.less
// (each hex = a border-coloured box with a 1px-inset severity cell → the thin outline; honeycomb pull-up
// = size × 0.2885). Hover a hex → the product tooltip (monitor name + location + a severity pill).
//   <obs-severity-heatmap :cells.prop="[{severity:'warning',name:'172.16.8.113',location:'MB_Location_5'},…]" size="22"></obs-severity-heatmap>
import { computed, ref } from 'vue'

const props = defineProps({
  // ['down',…] or [{severity|sev, name|label|ip, location|sublabel}] — the DS heat-map fixture's result.data works
  cells: { type: [Array, String], default: () => [] },
  size: { type: [Number, String], default: 22 }, // hex width in px (height = size × 1.1547)
  max: { type: [Number, String], default: 0 },   // 0 = show all; else truncate to N + a "+N more" pill
})

// normalise each cell → { sev, name, sub } (accepts a bare string, or an object with several key spellings)
const list = computed(() => {
  let c = props.cells
  if (typeof c === 'string') { try { c = JSON.parse(c) } catch { c = [] } }
  return (c || []).map((x) => {
    if (typeof x === 'string') return { sev: x.toLowerCase(), name: '', sub: '' }
    const sev = String(x.severity ?? x.sev ?? 'unknown').toLowerCase()
    return { sev, name: x.name ?? x.label ?? x.ip ?? '', sub: x.location ?? x.sublabel ?? x.sub ?? '' }
  })
})
const cap = computed(() => +props.max || 0)
const shown = computed(() => (cap.value > 0 ? list.value.slice(0, cap.value) : list.value))
const remaining = computed(() => (cap.value > 0 ? Math.max(list.value.length - cap.value, 0) : 0))

const s = computed(() => +props.size || 22)
const m = computed(() => Math.floor(s.value / 17))
const boxStyle = computed(() => ({
  width: s.value + 'px', height: (s.value * 1.1547).toFixed(1) + 'px',
  margin: m.value + 'px', marginBottom: (m.value - s.value * 0.2885).toFixed(1) + 'px',
}))
const cap1 = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '')

// hover tooltip — anchored to the hovered hex (position within the relative .hm-container)
const wrap = ref(null)
const tip = ref(null)
function onEnter(e, cell) {
  const box = e.currentTarget, host = wrap.value
  if (!host || !cell.name) return
  tip.value = {
    name: cell.name, sub: cell.sub, sev: cell.sev, label: cap1(cell.sev),
    left: box.offsetLeft + box.offsetWidth + 6, top: box.offsetTop - 2,
  }
}
function onLeave() { tip.value = null }
</script>

<template>
  <div class="hm-container" ref="wrap">
    <div
      class="hm-box"
      v-for="(cell, i) in shown"
      :key="i"
      :style="boxStyle"
      @mouseenter="onEnter($event, cell)"
      @mouseleave="onLeave"
    >
      <div class="hm-cell" :style="{ background: `var(--severity-${cell.sev})` }"></div>
    </div>
    <span v-if="remaining" class="hm-more">+{{ remaining }} more</span>

    <div v-if="tip" class="hm-tip" :style="{ left: tip.left + 'px', top: tip.top + 'px' }">
      <span class="hm-tip-arrow"></span>
      <div class="hm-tip-main">
        <div class="hm-tip-name">{{ tip.name }}</div>
        <div v-if="tip.sub" class="hm-tip-sub">{{ tip.sub }}</div>
      </div>
      <div class="hm-tip-sev" :style="{ background: `var(--severity-${tip.sev})` }">{{ tip.label }}</div>
    </div>
  </div>
</template>

<style>
:host { display: block; }
.hm-container { position: relative; display: flex; flex-wrap: wrap; align-content: flex-start; justify-content: center; padding: 8px; }
.hm-box { position: relative; display: inline-block; clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%); background: var(--border-color, #e3e8f2); }
.hm-cell { position: absolute; inset: 1px; clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%); }
.hm-box:hover { z-index: 3; transform: scale(1.4); }
.hm-more { align-self: center; margin: 8px; padding: 2px 10px; border-radius: 999px; border: 1px solid var(--primary-alt, #1d2a3e); color: var(--primary-alt, #1d2a3e); font-size: 12px; }

/* product hover tooltip — a white name/location card with a severity pill grafted on the right */
.hm-tip {
  position: absolute; z-index: 20; display: flex; align-items: stretch; pointer-events: none;
  border-radius: 6px; box-shadow: 0 6px 20px var(--neutral-shadow-light, rgba(70, 70, 70, 0.18));
  font-family: 'Poppins', sans-serif; white-space: nowrap;
}
.hm-tip-arrow {
  position: absolute; left: -5px; top: 14px; width: 10px; height: 10px; transform: rotate(45deg);
  background: var(--common-widget-bg, #fff); border-left: 1px solid var(--border-color, #e3e8f2); border-bottom: 1px solid var(--border-color, #e3e8f2);
}
.hm-tip-main {
  background: var(--common-widget-bg, #fff); border: 1px solid var(--border-color, #e3e8f2); border-right: none;
  border-radius: 6px 0 0 6px; padding: 8px 12px;
}
.hm-tip-name { font-size: 15px; font-weight: 600; color: var(--page-text-color, #1d2a3e); }
.hm-tip-sub { font-size: 12px; color: var(--neutral-light, #6a7fa0); margin-top: 2px; }
.hm-tip-sev {
  display: flex; align-items: center; padding: 0 16px; border-radius: 0 6px 6px 0;
  color: var(--active-text-color, #fff); font-size: 15px; font-weight: 500;
}
</style>
