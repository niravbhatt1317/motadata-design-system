<script setup>
// <obs-tabs> — the product's in-page tabbed navigation (MTab + MTabPane, wrapping Ant a-tabs). Switches
// between sibling views of ONE context; it does NOT navigate between routes (→ obs-sidebar / obs-breadcrumbs).
// RENDER-FAITHFUL to the product, which uses ONLY line-style, top, default-size tabs — Ant card/vertical/size
// are unused in-product, so they're intentionally not built. Real variants are class-based:
//   variant="" (line, default) · "no-border" (drops the bar rule) · "sticky" (pins the bar) · "grey" (tinted bar).
// Active tab = --primary (text + 4px underline, weight 500); inactive = --tabs-text-color (weight 400);
// bar bottom rule = --border-color. Values measured from the rendered story (molecules-tabs-examples).
//
// Data-driven: tabs='[{"key","label","count?","icon?","disabled?"}]' (or a comma list "A,B,C"); value=active key.
// Content: one named slot per key — <obs-tabs ...><div slot="overview">…</div></obs-tabs> — only the active shows.
// Icons reuse <obs-icon> (product library). Emits `change` with the new key.
import { ref, watch, computed, useHost, onMounted, onBeforeUnmount, nextTick } from 'vue'
const props = defineProps({
  tabs: { type: String, default: '' },      // JSON array of {key,label,count?,icon?,disabled?} OR "A,B,C"
  value: { type: String, default: '' },     // active key
  variant: { type: String, default: '' },   // '' | 'no-border' | 'sticky' | 'grey'
  persistKey: { type: String, default: '' }, // persist the active tab in localStorage under `${persistKey}-tab`
  closable: { type: [Boolean, String], default: false }, // a × per tab (only shown when there is MORE than one) → emits `close`
  addable: { type: [Boolean, String], default: false },  // a "+" at the far right of the bar → emits `add`
  scrollable: { type: [Boolean, String], default: true }, // overflow FADE gradient auto-appears when the strip is wider than its box; set false to force-disable
})
const emit = defineEmits(['change', 'close', 'add'])
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const host = useHost()
// the full label incl. an optional count — also used as the bold-width ghost so switching weight doesn't reflow
const labelText = (t) => (t.count !== null && t.count !== undefined) ? `${t.label} (${t.count})` : t.label
const storeKey = () => (props.persistKey ? `${props.persistKey}-tab` : '')

const items = computed(() => {
  const raw = String(props.tabs || '').trim()
  if (!raw) return []
  if (raw[0] === '[') {
    try {
      return JSON.parse(raw).map((t, i) => {
        // accept any option shape: {key|value, label|text|name} (see G5 — shapes differ across DS elements)
        if (t && typeof t === 'object' && t.key == null && t.value == null && t.label == null && t.text == null && t.name == null)
          try { console.warn('obs-tabs: unrecognised tab shape', t, '— expected {key|value, label|text}') } catch (e) {}
        return {
          key: String(t.key ?? t.value ?? t.label ?? t.text ?? i),
          label: String(t.label ?? t.text ?? t.name ?? t.key ?? t.value ?? ''),
          count: t.count === 0 || t.count ? t.count : null,
          icon: t.icon || '',
          disabled: t.disabled === true || t.disabled === 'true',
        }
      })
    } catch (e) { return [] }
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
    .map((label) => ({ key: label, label, count: null, icon: '', disabled: false }))
})

const active = ref(props.value || (items.value[0] && items.value[0].key) || '')
watch(() => props.value, (v) => { if (v) active.value = v })
watch(items, (list) => { if (!list.some((t) => t.key === active.value) && list[0]) active.value = list[0].key })

function setActive(key, save) {
  active.value = key
  if (host) { try { host.value = key } catch (e) { /* readonly host */ } }
  if (save && props.persistKey) { try { localStorage.setItem(storeKey(), key) } catch (e) { /* storage blocked */ } }
}
// restore the persisted tab on mount (survives reload/navigation, like the product's MPersistedTab)
onMounted(() => {
  if (!props.persistKey) return
  try { const saved = localStorage.getItem(storeKey()); if (saved && items.value.some((t) => t.key === saved)) setActive(saved, false) } catch (e) { /* storage blocked */ }
})

function pick(t) {
  if (t.disabled || t.key === active.value) return
  setActive(t.key, true)
  emit('change', t.key)
}
// close/add (the closable/addable tab-strip pattern — e.g. the metric-explorer monitor tabs)
const showClose = computed(() => on(props.closable) && items.value.length > 1) // × only when MORE than one tab
const isAddable = computed(() => on(props.addable))
function closeTab(t, e) { e.stopPropagation(); emit('close', t.key) }

// ── overflow scrolling: when the tab strip is wider than its box, a FADE gradient hints there's more ──
// AUTOMATIC — the left/right fade only appears when the strip can scroll that way (canLeft/canRight);
// `scrollable=false` force-disables. Scrolling itself is native (wheel/trackpad/drag on the .scroll area);
// there are no chevron buttons — the gradient is the sole affordance.
const scrollEnabled = computed(() => props.scrollable !== false && props.scrollable !== 'false' && props.scrollable !== '0' && props.scrollable !== 'no')
const scrollEl = ref(null)
const canLeft = ref(false)
const canRight = ref(false)
let ro = null
let raf = 0

function measure() {
  const el = scrollEl.value
  if (!el || !scrollEnabled.value) { canLeft.value = false; canRight.value = false; return }
  const max = el.scrollWidth - el.clientWidth
  canLeft.value = el.scrollLeft > 0
  canRight.value = el.scrollLeft < max - 1
}
// rAF-coalesced recompute (scroll + resize can fire in bursts)
function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => { raf = 0; measure() })
}
// keep the active tab in view (on programmatic/attr-driven change) + recompute the fade edges
function revealActive() {
  nextTick(() => {
    const el = scrollEl.value
    if (!el) { return }
    const activeEl = el.querySelector('.tab.active')
    if (activeEl && activeEl.scrollIntoView) activeEl.scrollIntoView({ inline: 'nearest', block: 'nearest' })
    measure()
  })
}

watch(active, () => revealActive())
watch(items, () => nextTick(measure))

onMounted(() => {
  nextTick(() => {
    measure()
    const el = scrollEl.value
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => onScroll())
      ro.observe(el)
      const bar = el.querySelector('.bar')
      if (bar) ro.observe(bar) // content-width changes (add/close a tab) also retrigger
    }
    try { window.addEventListener('resize', onScroll) } catch (e) { /* no window */ }
  })
})
onBeforeUnmount(() => {
  if (ro) { try { ro.disconnect() } catch (e) { /* noop */ } ro = null }
  try { window.removeEventListener('resize', onScroll) } catch (e) { /* noop */ }
  if (raf) { cancelAnimationFrame(raf); raf = 0 }
})
</script>

<template>
  <div class="tabs" :class="['v-' + (variant || 'line')]">
    <!-- fade-left / fade-right toggle the edge gradient masks (::before/::after) when the strip can scroll that way -->
    <div class="bar-wrap" :class="{ 'fade-left': canLeft, 'fade-right': canRight }">
      <!-- horizontal scroll area (native scrollbar hidden); it holds the tab bar and scrolls natively -->
      <div class="scroll" ref="scrollEl" @scroll="onScroll">
        <div class="bar" role="tablist">
          <button
            v-for="t in items"
            :key="t.key"
            class="tab"
            :class="{ active: t.key === active, disabled: t.disabled }"
            role="tab"
            type="button"
            :aria-selected="t.key === active"
            :disabled="t.disabled"
            @click="pick(t)"
          >
            <obs-icon v-if="t.icon" :name="t.icon" size="14" class="ic" aria-hidden="true"></obs-icon>
            <span class="lbl" :data-label="labelText(t)">{{ labelText(t) }}</span>
            <span v-if="showClose" class="tab-x" role="button" aria-label="Close tab" @click="(e) => closeTab(t, e)"><obs-icon name="times" size="10"></obs-icon></span>
          </button>
          <obs-button v-if="isAddable" class="tab-add" variant="neutral-lightest" size="small" aria-label="Add" @click="emit('add')"><obs-icon name="plus" size="13"></obs-icon></obs-button>
        </div>
      </div>
    </div>
    <div class="body">
      <!-- one static named slot per key; only the active pane is shown (dynamic single-slot names don't
           re-assign light-DOM children reliably in defineCustomElement) -->
      <div v-for="t in items" v-show="t.key === active" :key="t.key" class="pane" role="tabpanel">
        <slot :name="t.key"></slot>
      </div>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { display: block; }
.tabs { color: var(--page-text-color, #1d2a3e); }
/* ── overflow scroller: a horizontally-scrollable strip. The 1px bottom rule lives on .bar-wrap (the FIXED,
   full-width container) — NOT on the scrolling .bar — so it always spans edge-to-edge and never scrolls away.
   When the strip can scroll, a white→transparent FADE gradient (::before/::after) hints there's more. ── */
.bar-wrap { position: relative; border-bottom: 1px solid var(--border-color, #e3e8f2); }
.scroll { min-width: 0; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; -ms-overflow-style: none;
  margin-bottom: -1px; }   /* pull the strip 1px onto the rule so an active tab's 4px underline covers it */
.scroll::-webkit-scrollbar { display: none; }
/* edge fade masks — appear only when the strip can scroll that way (.fade-left / .fade-right toggled from JS) */
.bar-wrap::before, .bar-wrap::after {
  content: ''; position: absolute; top: 0; bottom: 1px; width: 48px; z-index: 2;
  pointer-events: none; opacity: 0; transition: opacity 0.15s ease;
}
.bar-wrap::before { left: 0; background: linear-gradient(to right, var(--page-background-color, #fff), transparent); }
.bar-wrap::after { right: 0; background: linear-gradient(to left, var(--page-background-color, #fff), transparent); }
.bar-wrap.fade-left::before { opacity: 1; }
.bar-wrap.fade-right::after { opacity: 1; }
/* ── tab bar: no border here (it's on .bar-wrap). --tabs-inset (default 8px) pads the tab GROUP without moving the
   full-width bottom rule — set --tabs-inset:0 for a flush edge-to-edge strip, or a larger value (e.g. 20px) to
   align the tabs with a page's content gutter. The bottom rule always spans full width regardless.
   LEFT inset is padding-left; the RIGHT inset is a trailing flex SPACER (::after) — a scrolling flex container
   clips its padding-right from the scroll extent (the end inset would vanish when scrolled fully right), but a
   flex item IS counted, so the spacer preserves the right inset while overflowing. ── */
.bar { display: flex; align-items: flex-end; position: relative; padding-left: var(--tabs-inset, 8px); }
.bar::after { content: ''; flex: 0 0 var(--tabs-inset, 8px); align-self: stretch; }
.tab {
  appearance: none; background: none; border: 0; outline: 0;
  padding: 12px 0 8px; margin: 0 20px 0 0;
  border-bottom: 3px solid transparent;
  font-family: inherit; font-size: 0.8rem; font-weight: 400; line-height: 1.5; text-align: start;
  color: var(--tabs-text-color, #516381); cursor: pointer; white-space: nowrap;
  display: inline-flex; align-items: center; gap: 6px;
  transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);   /* match Ant (color only; border flips instantly) */
}
.tab:last-child { margin-right: 0; }
.tab:hover:not(.disabled) { color: var(--primary, #111c2c); border-bottom-color: var(--primary, #111c2c); }
.tab.active { color: var(--primary, #111c2c); font-weight: 500; border-bottom-color: var(--primary, #111c2c); }
.tab.disabled { color: var(--neutral-light, #a5bad0); cursor: not-allowed; }
.tab .ic { display: inline-flex; }
/* reserve the BOLD (500) width so switching active↔inactive never changes the tab width (no reflow/jerk).
   the ::after is an invisible weight-500 ghost of the label; inline-grid overlays it under the real text. */
.tab .lbl { display: inline-grid; }
.tab .lbl::after {
  content: attr(data-label); font-weight: 500; height: 0; visibility: hidden; overflow: hidden; pointer-events: none;
}
.body { color: var(--page-text-color, #1d2a3e); }
/* ── closable / addable (the monitor-tab pattern) ── */
.tab-x { display: inline-flex; margin-left: 2px; padding: 2px; border-radius: 3px; color: var(--neutral-light, #6a7fa0); }
.tab-x:hover { color: var(--secondary-red, #ec5b5b); background: var(--neutral-lightest, #f4f6fa); }
/* the + REUSES obs-button (variant neutral-lightest, squared) — just position it at the far right of the bar */
.tab-add { margin: 0 0 3px auto; align-self: center; }
/* ── class-based variants (product reality) ── */
.v-no-border .bar-wrap { border-bottom-color: transparent; }
/* sticky pins the WHOLE bar-wrap (not the .scroll, which is a horizontal scroll container) so vertical sticky still works */
.v-sticky .bar-wrap { position: sticky; top: 0; z-index: 2; background: var(--page-background-color, #fff); }
.v-grey .bar { background: var(--neutral-lightest, #f4f6fa); }
</style>
