<script setup>
// <obs-severity-legend> — a responsive severity LEGEND (the row of coloured dots + labels under a table/map/chart).
// Composes <obs-severity> for every entry (DS severity dots, not hand-rolled). When the container is too NARROW to
// fit them all, the trailing entries COLLAPSE into a "+N" pill with their dots PILED UP (overlapping, avatar-style);
// hovering the pill reveals the hidden entries in a popover. With room, every entry shows in full. Auto via
// ResizeObserver — no props to toggle.
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
const props = defineProps({
  levels: { type: [String, Array], default: 'down,critical,major,warning,clear,unreachable' },
  labels: { type: [String, Object], default: '' }, // optional { level: 'Custom Label' } overrides (JSON string or object)
  minVisible: { type: Number, default: 1 },        // never collapse below this many full entries
  gap: { type: Number, default: 18 },              // px between entries
})
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const items = computed(() => {
  const arr = Array.isArray(props.levels) ? props.levels : String(props.levels).split(',').map((s) => s.trim()).filter(Boolean)
  let lbls = {}
  try { lbls = typeof props.labels === 'object' ? props.labels : (props.labels ? JSON.parse(props.labels) : {}) } catch (e) { lbls = {} }
  return arr.map((lv) => ({ level: lv, label: lbls[lv] || cap(lv) }))
})

const row = ref(null)
const measureRow = ref(null)
const pileEl = ref(null)
const popEl = ref(null)
const visibleCount = ref(items.value.length)
let widths = []          // cached intrinsic px width of each full entry (measured once, all shown)
let ro = null

// reveal the hidden entries in the TOP LAYER (Popover API) so it can't be clipped by the scroll region / footer
// stacking context (a plain absolute popover rendered upward from the pinned footer gets occluded). Positioned by us.
function showPop() {
  const pop = popEl.value; const pile = pileEl.value
  if (!pop || !pile) return
  try { pop.showPopover() } catch (e) { return }
  const r = pile.getBoundingClientRect()
  pop.style.left = Math.round(r.left + r.width / 2) + 'px'
  pop.style.bottom = Math.round((typeof window !== 'undefined' ? window.innerHeight : 0) - r.top + 8) + 'px'
}
function hidePop() { try { popEl.value?.hidePopover() } catch (e) { /* unsupported */ } }

const hidden = computed(() => items.value.slice(visibleCount.value))
const shown = computed(() => items.value.slice(0, visibleCount.value))

// item widths are read from a HIDDEN measure layer (measureRow) that ALWAYS renders every entry — so we can re-measure
// at any time regardless of the current collapse state. (Measuring the visible row would only see the SHOWN items, and
// once collapsed the widths would freeze wrong; measuring while the component is in a hidden tab yields 0 → also wrong.)
function measureWidths() {
  const mr = measureRow.value
  if (!mr) return false
  const els = [...mr.querySelectorAll('.leg-item')]
  if (els.length !== items.value.length) return false
  const w = els.map((el) => el.getBoundingClientRect().width)
  if (w.some((x) => x <= 0)) return false // not laid out yet (hidden tab / pre-font) — keep any prior valid cache
  widths = w
  return true
}
function recompute() {
  if (!row.value) return
  const avail = row.value.clientWidth
  if (avail === 0) return // hidden / not laid out — don't collapse to garbage; the ResizeObserver re-fires when shown
  measureWidths() // re-measure every time from the stable layer (fixes hidden→visible tab switches)
  const n = items.value.length
  if (!widths.length || widths.length !== n) { visibleCount.value = n; return }
  const full = widths.reduce((a, b) => a + b, 0) + props.gap * (n - 1)
  if (full <= avail) { visibleCount.value = n; return } // everything fits → show all, no pill
  const PILL = 62 + props.gap // reserve space for the "+N" pile
  let used = 0; let fit = 0
  for (let i = 0; i < n; i++) {
    const next = used + widths[i] + (fit > 0 ? props.gap : 0)
    if (next + PILL <= avail) { used = next; fit++ } else break
  }
  visibleCount.value = Math.max(props.minVisible, Math.min(fit, n - 1)) // always leave ≥1 for the pill when collapsed
}
onMounted(async () => {
  await nextTick()
  recompute()
  setTimeout(() => recompute(), 250) // re-measure after webfonts settle (label widths shift)
  if (typeof ResizeObserver !== 'undefined' && row.value) { ro = new ResizeObserver(() => recompute()); ro.observe(row.value) }
})
// levels/gap changed (e.g. playground controls) → widths are stale, re-measure from scratch
watch(() => [props.levels, props.gap], async () => { widths = []; visibleCount.value = items.value.length; await nextTick(); recompute() })
onBeforeUnmount(() => { if (ro) ro.disconnect() })
</script>

<template>
  <!-- hidden measure layer: ALWAYS renders every entry off-screen so item widths can be re-measured at any time -->
  <div ref="measureRow" class="leg-measure" aria-hidden="true">
    <obs-severity v-for="it in items" :key="it.level" class="leg-item" :severity="it.level" shape="dot" display-text></obs-severity>
  </div>
  <div ref="row" class="leg" :style="{ gap: gap + 'px' }">
    <obs-severity v-for="it in shown" :key="it.level" class="leg-item" :severity="it.level" shape="dot" display-text></obs-severity>
    <!-- collapsed overflow: piled dots + "+N"; hover (or focus) reveals the hidden entries in the top layer -->
    <span v-if="hidden.length" ref="pileEl" class="pile" tabindex="0" :aria-label="'Also: ' + hidden.map((h) => h.label).join(', ')"
      @pointerenter="showPop" @pointerleave="hidePop" @focus="showPop" @blur="hidePop">
      <span class="pile-dots">
        <obs-severity v-for="h in hidden" :key="h.level" class="pile-dot" :severity="h.level" shape="dot"></obs-severity>
      </span>
      <span class="pile-n">+{{ hidden.length }}</span>
    </span>
    <div v-if="hidden.length" ref="popEl" class="pile-pop" popover="manual">
      <obs-severity v-for="h in hidden" :key="h.level" :severity="h.level" shape="dot" display-text></obs-severity>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
/* host FILLS its container (width:100%) so .leg's width = the AVAILABLE space, not the content — measuring the collapse
   against a STABLE width. (Measuring the content-sized element would shrink as it collapses → feedback loop to minimum.) */
:host { display: block; width: 100%; font-family: var(--font-family, 'Poppins', sans-serif); min-width: 0; }
/* no overflow:hidden — the collapse is done by only RENDERING the fitting items + the pile (visibleCount), so nothing
   spills; clipping here would also cut off the hover popover, which needs to escape upward. */
.leg { display: flex; width: 100%; align-items: center; justify-content: center; flex-wrap: nowrap; font-size: 13px; color: var(--neutral-regular, #7186a8); }
/* off-screen measure layer — every entry, always; used only to read intrinsic item widths (no layout impact) */
.leg-measure { position: absolute; left: -99999px; top: 0; display: flex; gap: 18px; white-space: nowrap; visibility: hidden; pointer-events: none; font-size: 13px; }
.leg-item { flex: 0 0 auto; white-space: nowrap; }
/* the "+N" pile — overlapping dots (avatar-style) then the count; hover shows the hidden entries */
.pile { position: relative; flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px; cursor: default; }
.pile-dots { display: inline-flex; align-items: center; }
.pile-dot { margin-left: -5px; }
.pile-dot:first-child { margin-left: 0; }
.pile { cursor: default; outline: none; }
.pile-n { font-size: 13px; color: var(--neutral-regular, #7186a8); }
/* the reveal is a top-layer POPOVER (Popover API) → it can't be clipped by the footer/scroll-region stacking. We set
   position:fixed and JS computes left/bottom from the pile's rect; translateX(-50%) centres it over the pile. */
.pile-pop { position: fixed; inset: auto; margin: 0; transform: translateX(-50%); flex-direction: column; gap: 8px; padding: 10px 12px;
  white-space: nowrap; font-family: var(--font-family, 'Poppins', sans-serif); font-size: 13px; color: var(--neutral-regular, #7186a8);
  background: var(--page-background-color, #fff); border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px;
  box-shadow: 0 6px 20px rgba(23, 35, 54, .16); }
.pile-pop:popover-open { display: flex; }
</style>
