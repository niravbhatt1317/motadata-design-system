<script setup>
// <obs-pagination> — the DS pagination footer, extracted from obs-table so ANY view (table, card grid, list) can
// reuse it. Renders the seek controls (first/prev · numbered SQUARES · next/last, Material-Symbols skip glyphs), a
// page-size <select>, the "items per page" label, and a "start - end of N items" range. A default SLOT sits CENTERED
// between the controls and the range → drop a severity legend (etc.) there for the CENTERED footer variant; leave it
// empty for the SPLIT variant (controls left, range right).
//
// Controlled OR standalone: `page`/`page-size` props drive it, and it also advances its own internal state on click
// and emits `pagechange`(detail=new page) / `sizechange`(detail=new size) so a consumer can reslice their data.
import { computed, ref, watch, useHost } from 'vue'
const props = defineProps({
  total: { type: Number, default: 0 },        // total item count (across all pages)
  page: { type: Number, default: 1 },         // current page (1-based)
  pageSize: { type: Number, default: 50 },    // items per page
  pageSizes: { type: [String, Array], default: '10,20,50,100' }, // size options (CSV string or array)
  sizesLabel: { type: String, default: 'items per page' },
  hideSize: { type: Boolean, default: false }, // hide the page-size select + label
  hideRange: { type: Boolean, default: false }, // hide the "start - end of N items" text
})
const emit = defineEmits(['pagechange', 'sizechange'])
const host = useHost()

const curPage = ref(props.page || 1)
watch(() => props.page, (v) => { curPage.value = v || 1 })
const sizeOverride = ref(null)
const size = computed(() => sizeOverride.value ?? props.pageSize)
watch(() => props.pageSize, () => { sizeOverride.value = null })
const paged = computed(() => size.value > 0)

const sizeOpts = computed(() => {
  const raw = Array.isArray(props.pageSizes) ? props.pageSizes : String(props.pageSizes).split(',')
  const nums = raw.map((n) => parseInt(n, 10)).filter((n) => n > 0)
  return [...new Set([size.value, ...nums].filter((n) => n > 0))].sort((a, b) => a - b)
})
const totalPages = computed(() => (paged.value ? Math.max(1, Math.ceil(props.total / size.value)) : 1))

// windowed page-number list: 1 … around-current … last (Kendo-style numbered links)
const pageList = computed(() => {
  const n = totalPages.value; const c = curPage.value
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1)
  const out = [1]
  const lo = Math.max(2, c - 1); const hi = Math.min(n - 1, c + 1)
  if (lo > 2) out.push('…')
  for (let i = lo; i <= hi; i++) out.push(i)
  if (hi < n - 1) out.push('…')
  out.push(n); return out
})
const rangeText = computed(() => {
  const total = props.total
  const start = paged.value && total ? (curPage.value - 1) * size.value + 1 : (total ? 1 : 0)
  const end = paged.value ? Math.min(curPage.value * size.value, total) : total
  return `${start} - ${end} of ${total} items`
})

function reflect() { if (host) { try { host.page = curPage.value } catch (e) { /* readonly */ } } }
function goPage(p) {
  if (p === '…' || p < 1 || p > totalPages.value || p === curPage.value) return
  curPage.value = p; reflect(); emit('pagechange', p)
}
function onPageSize(e) {
  const s = Number(e.target.value)
  sizeOverride.value = s; curPage.value = 1; reflect()
  emit('sizechange', s); emit('pagechange', 1)
}
</script>

<template>
  <div class="pager">
    <div class="pleft">
      <span class="ppage nav" :class="{ dis: curPage <= 1 }" title="First" @click="goPage(1)"><obs-icon name="skipPrevious" size="15"></obs-icon></span>
      <span class="ppage nav" :class="{ dis: curPage <= 1 }" title="Previous" @click="goPage(curPage - 1)"><obs-icon name="skipPreviousNoLine" size="15"></obs-icon></span>
      <span v-for="(pn, i) in pageList" :key="i" class="ppage" :class="{ sel: pn === curPage, dots: pn === '…' }" @click="goPage(pn)">{{ pn }}</span>
      <span class="ppage nav" :class="{ dis: curPage >= totalPages }" title="Next" @click="goPage(curPage + 1)"><obs-icon name="skipNextNoLine" size="15"></obs-icon></span>
      <span class="ppage nav" :class="{ dis: curPage >= totalPages }" title="Last" @click="goPage(totalPages)"><obs-icon name="skipNext" size="15"></obs-icon></span>
      <template v-if="!hideSize">
        <span class="psize-wrap"><select class="psize" :value="size" @change="onPageSize"><option v-for="s in sizeOpts" :key="s" :value="s">{{ s }}</option></select><obs-icon class="psize-caret" name="chevronDown" size="11"></obs-icon></span>
        <span class="pperlbl">{{ sizesLabel }}</span>
      </template>
    </div>
    <!-- CENTER zone: the footer's variant switch. Empty → SPLIT (controls left, range right). Fill the default slot
         (e.g. a severity legend) → CENTERED (controls left, slot centered, range right). -->
    <div class="pcenter"><slot></slot></div>
    <span v-if="!hideRange" class="prange">{{ rangeText }}</span>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; font-family: var(--font-family, 'Poppins', sans-serif); }
.pager { display: flex; align-items: center; justify-content: space-between; padding: 6px 4px; font-size: 0.75rem;
  color: var(--page-text-color, #1d2a3e); }
.pleft { display: flex; align-items: center; gap: 2px; }
/* CENTER zone takes the leftover width and centres its slotted content → the legend sits mid-footer (CENTERED variant).
   With nothing slotted it collapses to a flexible spacer, so .pleft and .prange sit at the edges (SPLIT variant).
   min 64px padding each side keeps the centered content clear of the pager (left) and the range (right); min-width:0 +
   the slotted content's own overflow handling let it SHRINK (collapse) rather than push the pager/range off-screen. */
.pcenter { flex: 1 1 auto; display: flex; align-items: center; justify-content: center; min-width: 0; padding: 0 64px; box-sizing: border-box; }
/* every page + nav cell is a uniform SQUARE (28x28) — equal boxes for numbers AND icons. min-width (not fixed width)
   lets a 3-digit page number grow while single/double digits stay square. */
.ppage { min-width: 28px; height: 28px; padding: 0 5px; box-sizing: border-box; display: inline-flex; align-items: center;
  justify-content: center; font-weight: 400; text-align: center; border-radius: 4px; cursor: pointer; }
.ppage.sel { color: var(--pagination-active-text, #111c2c); background: var(--pagination-active-bg, #e3e8f2); }
.ppage.nav { color: var(--neutral-light, #6a7fa0); }
.ppage.nav.dis { opacity: .4; cursor: not-allowed; }
.ppage.dots { cursor: default; color: var(--neutral-light, #6a7fa0); }
/* page-size select matches the page-number SQUARES (28px height + 4px radius). Native arrow removed (appearance:none),
   replaced with an obs-icon chevron positioned by us → tight text→arrow gap + whitespace before the right edge. */
.psize-wrap { position: relative; display: inline-flex; align-items: center; margin-left: 12px; }
.psize { height: 28px; padding: 0 24px 0 8px; box-sizing: border-box; appearance: none; -webkit-appearance: none; font: inherit; font-size: 0.75rem; color: var(--pagination-select-text, var(--page-text-color, #1d2a3e));
  background: var(--pagination-select-bg, var(--page-background-color, #fff)); border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; cursor: pointer; }
.psize-caret { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--neutral-light, #6a7fa0); }
.pperlbl { margin-left: 8px; color: var(--neutral-light, #6a7fa0); }
.prange { color: var(--neutral-light, #6a7fa0); white-space: nowrap; }
</style>
