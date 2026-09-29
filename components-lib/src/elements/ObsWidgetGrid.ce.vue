<script setup>
// <obs-widget-grid> — a live draggable / droppable / resizable dashboard grid (the vue-grid-layout gap),
// framework-agnostic. Slot in <obs-widget-card data-x data-y data-w data-h> children; the grid assigns each
// to a NAMED slot inside a positioned wrapper in its OWN shadow DOM (reliable positioning — never position a
// slotted element directly, which is buggy across browsers), and on a card's card-dragstart / card-resizestart
// it drives move/resize with grid snap, collision push-down, and vertical (gravity-up) compaction.
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, useHost } from 'vue'

const props = defineProps({
  columns: { type: [Number, String], default: 12 },
  cellHeight: { type: [Number, String], default: 80 },
  gap: { type: [Number, String], default: 10 },
})
const emit = defineEmits(['layout-change'])
const host = useHost()
const area = ref(null)
const cols = computed(() => +props.columns || 12)
const rowH = computed(() => +props.cellHeight || 80)
const gap = computed(() => +props.gap || 10)

const containerW = ref(0)
const cellW = computed(() => Math.max(1, (containerW.value - (cols.value - 1) * gap.value) / cols.value))
const unitX = computed(() => cellW.value + gap.value)
const unitY = computed(() => rowH.value + gap.value)

const items = ref([]) // [{ el, x, y, w, h }]
const drag = reactive({ on: false, mode: '', i: -1, sx: 0, sy: 0, ox: 0, oy: 0, ow: 0, oh: 0, left: 0, top: 0, w: 0, h: 0, scEl: null, st0: 0 })
const ph = reactive({ show: false, x: 0, y: 0, w: 0, h: 0 })
const MAX_H = 40                 // safety cap so a held auto-scroll can't grow a card without bound
let scrollRAF = 0, lastCX = 0, lastCY = 0

const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// vertical gravity compaction; `fixed` (if given) stays anchored and others flow around it.
function compact(fixed) {
  const sorted = [...items.value].sort((a, b) => a.y - b.y || a.x - b.x)
  const placed = fixed ? [fixed] : []
  for (const it of sorted) {
    if (it === fixed) continue
    let y = Math.max(0, it.y)
    while (y > 0 && !placed.some((o) => overlap({ x: it.x, y: y - 1, w: it.w, h: it.h }, o))) y--
    while (placed.some((o) => overlap({ x: it.x, y, w: it.w, h: it.h }, o))) y++
    it.y = y; placed.push(it)
  }
}

// read slotted cards → items; assign each to a named slot so a shadow wrapper positions it.
function syncItems() {
  const cards = [...host.querySelectorAll('obs-widget-card')]
  cards.forEach((el, i) => { if (el.getAttribute('slot') !== 'c' + i) el.setAttribute('slot', 'c' + i) })
  items.value = cards.map((el) => ({
    el,
    x: +(el.getAttribute('data-x') || 0), y: +(el.getAttribute('data-y') || 0),
    w: +(el.getAttribute('data-w') || 4), h: +(el.getAttribute('data-h') || 3),
  }))
  compact()
}

function geom(it) {
  return {
    left: Math.round(it.x * unitX.value), top: Math.round(it.y * unitY.value),
    width: Math.round(it.w * cellW.value + (it.w - 1) * gap.value),
    height: Math.round(it.h * rowH.value + (it.h - 1) * gap.value),
  }
}
const totalH = computed(() => { let m = 0; for (const it of items.value) m = Math.max(m, it.y + it.h); return Math.round(m * unitY.value - gap.value) })

function cellStyle(it, i) {
  const g = geom(it)
  const dragging = drag.on && drag.i === i
  if (dragging && drag.mode === 'move') return { position: 'absolute', transform: `translate(${drag.left}px, ${drag.top}px)`, width: g.width + 'px', height: g.height + 'px', zIndex: 50, transition: 'none' }
  if (dragging && drag.mode === 'resize') return { position: 'absolute', transform: `translate(${g.left}px, ${g.top}px)`, width: drag.w + 'px', height: drag.h + 'px', zIndex: 50, transition: 'none' }
  return { position: 'absolute', transform: `translate(${g.left}px, ${g.top}px)`, width: g.width + 'px', height: g.height + 'px', transition: 'transform .15s, width .15s, height .15s' }
}
const phStyle = computed(() => ({
  transform: `translate(${Math.round(ph.x * unitX.value)}px, ${Math.round(ph.y * unitY.value)}px)`,
  width: Math.round(ph.w * cellW.value + (ph.w - 1) * gap.value) + 'px',
  height: Math.round(ph.h * rowH.value + (ph.h - 1) * gap.value) + 'px',
}))

// ── drag / resize ──
function onCardDrag(e) { begin('move', e) }
function onCardResize(e) { begin('resize', e) }

// the nearest scrollable ancestor of the grid — we auto-scroll it (and compensate the drag math) so a card can
// be dragged/resized past the current viewport fold (otherwise the bottom card can't grow: the cursor hits the
// edge of the scroll area with nowhere left to go).
function findScrollParent(node) {
  let el = node && node.parentElement
  while (el && el !== document.body && el !== document.documentElement) {
    const s = getComputedStyle(el)
    if (/(auto|scroll)/.test(s.overflowY + s.overflow) && el.scrollHeight > el.clientHeight) return el
    el = el.parentElement
  }
  return document.scrollingElement || document.documentElement
}

function begin(mode, e) {
  const i = items.value.findIndex((it) => it.el === e.target)
  if (i < 0) return
  const g = geom(items.value[i])
  const scEl = findScrollParent(host)
  Object.assign(drag, { on: true, mode, i, sx: e.detail.clientX, sy: e.detail.clientY, ox: g.left, oy: g.top, ow: g.width, oh: g.height, left: g.left, top: g.top, w: g.width, h: g.height, scEl, st0: scEl ? scEl.scrollTop : 0 })
  lastCX = e.detail.clientX; lastCY = e.detail.clientY
  const it = items.value[i]
  Object.assign(ph, { show: true, x: it.x, y: it.y, w: it.w, h: it.h })
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

// recompute the dragged item's grid geometry from the last pointer position PLUS how far we've auto-scrolled
// since the gesture began — so holding the cursor at the edge (while the page scrolls) keeps growing/moving it.
function compute() {
  if (!drag.on) return
  const it = items.value[drag.i]
  const scrolled = drag.scEl ? drag.scEl.scrollTop - drag.st0 : 0
  const dx = lastCX - drag.sx, dy = lastCY - drag.sy + scrolled
  if (drag.mode === 'move') {
    drag.left = drag.ox + dx; drag.top = drag.oy + dy
    it.x = clamp(Math.round(drag.left / unitX.value), 0, cols.value - it.w)
    it.y = Math.max(0, Math.round(drag.top / unitY.value))
  } else {
    drag.w = Math.max(cellW.value, drag.ow + dx); drag.h = Math.max(rowH.value, drag.oh + dy)
    it.w = clamp(Math.round((drag.w + gap.value) / unitX.value), 1, cols.value - it.x)
    it.h = clamp(Math.round((drag.h + gap.value) / unitY.value), 1, MAX_H)
  }
  Object.assign(ph, { x: it.x, y: it.y, w: it.w, h: it.h })
  compact(it)
}

function onMove(e) {
  if (!drag.on) return
  lastCX = e.clientX; lastCY = e.clientY
  compute()
  if (!scrollRAF) scrollRAF = requestAnimationFrame(tickScroll)
}

// while the pointer sits in the top/bottom edge band, keep scrolling the container and re-running compute().
function tickScroll() {
  scrollRAF = 0
  if (!drag.on || !drag.scEl) return
  const el = drag.scEl
  const root = el === document.scrollingElement || el === document.documentElement
  const top = root ? 0 : el.getBoundingClientRect().top
  const bottom = root ? window.innerHeight : el.getBoundingClientRect().bottom
  const EDGE = 48, STEP = 20
  let d = 0
  if (lastCY > bottom - EDGE) d = STEP
  else if (lastCY < top + EDGE) d = -STEP
  if (d) {
    const before = el.scrollTop
    el.scrollTop = Math.max(0, before + d)
    if (el.scrollTop !== before) compute()
    scrollRAF = requestAnimationFrame(tickScroll)
  }
}

function onUp() {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  if (scrollRAF) { cancelAnimationFrame(scrollRAF); scrollRAF = 0 }
  const it = items.value[drag.i]
  drag.on = false; ph.show = false; drag.scEl = null
  compact(it)
  for (const x of items.value) { x.el.setAttribute('data-x', x.x); x.el.setAttribute('data-y', x.y); x.el.setAttribute('data-w', x.w); x.el.setAttribute('data-h', x.h) }
  emit('layout-change', items.value.map((x) => ({ x: x.x, y: x.y, w: x.w, h: x.h })))
}

// ── lifecycle ──
let ro, mo
onMounted(() => {
  host.addEventListener('card-dragstart', onCardDrag)
  host.addEventListener('card-resizestart', onCardResize)
  containerW.value = Math.round(host.getBoundingClientRect().width)
  ro = new ResizeObserver((es) => { const w = Math.round(es[0].contentRect.width); if (w && w !== containerW.value) containerW.value = w })
  ro.observe(host)
  mo = new MutationObserver(() => syncItems())
  mo.observe(host, { childList: true })
  nextTick(syncItems)
})
onBeforeUnmount(() => {
  host.removeEventListener('card-dragstart', onCardDrag)
  host.removeEventListener('card-resizestart', onCardResize)
  ro && ro.disconnect(); mo && mo.disconnect()
})
</script>

<template>
  <div ref="area" class="grid-area" :style="{ height: totalH + 'px' }">
    <div v-show="ph.show" class="placeholder" :style="phStyle"></div>
    <div v-for="(it, i) in items" :key="i" class="cell" :style="cellStyle(it, i)">
      <slot :name="'c' + i"></slot>
    </div>
  </div>
</template>

<style>
:host { display: block; width: 100%; }
:host([hidden]) { display: none !important; }
.grid-area { position: relative; width: 100%; }
.cell { box-sizing: border-box; }
.placeholder { position: absolute; z-index: 1; border-radius: 7px; background: var(--nav-hover-bg, rgba(72,89,117,.12));
  border: 1px dashed var(--primary, #111c2c); pointer-events: none; transition: transform .12s, width .12s, height .12s; }
</style>
