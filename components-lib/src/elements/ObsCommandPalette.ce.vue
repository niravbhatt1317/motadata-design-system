<script setup>
// <obs-command-palette> — the interactive header GLOBAL SEARCH / omnibox (App Chrome family), matching the product
// searchbar.vue end-to-end: a leading category picker (Metric / Log / Flow), a query field with a live SUGGESTIONS
// dropdown, an Execute action (⏎) that flips to a red error icon on a parse error, a clear (⌫), and a time-range
// picker on the right. For cross-app search / a command surface — NOT a plain list filter. Composes obs-select
// (category) + obs-input (query) + obs-date-time-picker (kind=range, the hero TimeRangePicker) + obs-icon. The
// turnkey form of the `command-palette` recipe. Source: components/omnibox/searchbar.vue.
import { ref, computed, watch, nextTick, onBeforeUnmount, useHost } from 'vue'
const props = defineProps({
  value: { type: String, default: '' },                 // the query text
  placeholder: { type: String, default: 'Start Typing...' },
  categories: { type: [String, Array], default: '' },   // category picker options; empty → no picker
  category: { type: String, default: '' },              // current category value
  suggestions: { type: [String, Array], default: '' },  // autocomplete options (strings) → a dropdown while focused
  executeLabel: { type: String, default: 'Execute' },
  error: { type: String, default: '' },                 // a parse-error message → Execute becomes a red error icon
  clearable: { type: [Boolean, String], default: true },
  timeRange: { type: [Boolean, String], default: false }, // show the time-range picker (obs-date-time-picker) on the right
  block: { type: [Boolean, String], default: false },     // wider bar (caps at 800); else the 680 default
  align: { type: String, default: 'left' },               // left (default) | center — horizontal alignment of the bar
  overlay: { type: [Boolean, String], default: false },   // render as a header search-icon trigger → a centered, blurred modal palette (Cmd+K)
})
const emit = defineEmits(['execute', 'input', 'category', 'clear', 'suggest', 'open', 'close'])
const host = useHost()
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const parseArr = (raw) => {
  if (Array.isArray(raw)) return raw
  const s = String(raw || '').trim()
  if (s.startsWith('[')) { try { return JSON.parse(s) } catch { return [] } }
  return s ? s.split(',').map((x) => x.trim()) : []
}
const catList = computed(() => parseArr(props.categories).map((c) => (typeof c === 'string' ? { value: c, label: c } : c)))
const catJson = computed(() => JSON.stringify(catList.value.map((c) => ({ key: c.value, label: c.label }))))
const curCat = ref(props.category || (catList.value[0] && catList.value[0].value) || '')
watch(() => props.category, (v) => { curCat.value = v || curCat.value })
const query = ref(props.value)
watch(() => props.value, (v) => { query.value = v ?? '' })
const hasError = computed(() => !!String(props.error || '').trim())

// ── suggestions ──
const allSuggest = computed(() => parseArr(props.suggestions).map((s) => (typeof s === 'string' ? s : (s.label ?? s.value ?? String(s)))))
const sugList = computed(() => { const q = query.value.trim().toLowerCase(); return q ? allSuggest.value.filter((s) => s.toLowerCase().includes(q)) : allSuggest.value })
const open = ref(false)
const active = ref(0)
const rootRef = ref(null)
const midRef = ref(null)
const sugRef = ref(null)
const sugPos = ref({})
const showSuggest = computed(() => open.value && sugList.value.length > 0)

function positionSug() {
  nextTick(() => {
    const r = midRef.value && midRef.value.getBoundingClientRect()
    if (!r) return
    sugPos.value = { position: 'fixed', inset: 'auto', margin: '0', left: `${Math.round(r.left)}px`, top: `${Math.round(r.bottom + 4)}px`, minWidth: `${Math.round(r.width)}px` }
    const p = sugRef.value
    if (p && p.showPopover) { try { p.showPopover() } catch (e) {} }
  })
}
function openSug() { if (!sugList.value.length) return; open.value = true; active.value = 0; positionSug() }
function closeSug() { if (!open.value) return; open.value = false; const p = sugRef.value; if (p && p.hidePopover) { try { p.hidePopover() } catch (e) {} } }
function pick(s) { query.value = s; emit('input', { query: s }); emit('suggest', { value: s }); closeSug() }

function onInput(e) { const v = Array.isArray(e.detail) ? e.detail[0] : (e.detail ?? e.target?.value); query.value = String(v ?? ''); emit('input', { query: query.value }); if (query.value && sugList.value.length) openSug(); else closeSug() }
function onCat(e) { const v = Array.isArray(e.detail) ? e.detail[0] : (e.detail ?? ''); curCat.value = String(v); emit('category', { value: curCat.value }) }
function execute() { if (hasError.value) return; closeSug(); emit('execute', { category: curCat.value, query: query.value }) }
function onKey(e) {
  if (e.key === 'ArrowDown' && showSuggest.value) { e.preventDefault(); active.value = (active.value + 1) % sugList.value.length; return }
  if (e.key === 'ArrowUp' && showSuggest.value) { e.preventDefault(); active.value = (active.value - 1 + sugList.value.length) % sugList.value.length; return }
  if (e.key === 'Enter') { if (showSuggest.value && sugList.value[active.value] != null) { pick(sugList.value[active.value]) } else { execute() } return }
  if (e.key === 'Escape') { closeSug() }
}
function onFocusIn() { openSug() }
function clear() { query.value = ''; emit('input', { query: '' }); emit('clear'); closeSug() }
// ── overlay (Cmd+K) mode: a header search-icon trigger opens the palette as a centered, blurred modal ──
const isOverlay = computed(() => on(props.overlay))
const isBlock = computed(() => on(props.block))
const isCenter = computed(() => props.align === 'center')
const dlgRef = ref(null)
function openOverlay() {
  const d = dlgRef.value
  if (d && d.showModal) { try { d.showModal() } catch (e) {} emit('open') }
  nextTick(() => { const inp = midRef.value && midRef.value.querySelector('obs-input'); const real = inp && inp.shadowRoot && inp.shadowRoot.querySelector('input,textarea'); if (real) real.focus(); openSug() })
}
function closeOverlay() { const d = dlgRef.value; if (d && d.close) { try { d.close() } catch (e) {} } closeSug(); emit('close') }
function onDlgClick(e) { if (e.target === dlgRef.value) closeOverlay() } // click the backdrop area → close
function onDocClick(e) { if (!open.value) return; const p = e.composedPath ? e.composedPath() : []; if (p.includes(rootRef.value) || p.includes(sugRef.value)) return; closeSug() }
if (typeof document !== 'undefined') document.addEventListener('click', onDocClick, true)
onBeforeUnmount(() => { if (typeof document !== 'undefined') document.removeEventListener('click', onDocClick, true) })
</script>

<template>
  <div ref="rootRef" class="cpwrap" :class="{ ov: isOverlay }">
    <!-- overlay (Cmd+K) mode: a header search-icon trigger (matches the app-header circular action button) -->
    <button v-if="isOverlay" class="cp-trigger" type="button" aria-label="Search" @click.stop="openOverlay">
      <obs-icon name="search" size="18"></obs-icon>
    </button>
    <!-- the bar lives in a <dialog>: rendered INLINE by default (open), or opened as a centered/blurred MODAL in
         overlay mode (showModal → top-layer + ::backdrop blur, like obs-modal) -->
    <dialog ref="dlgRef" class="cp-dialog" :open="isOverlay ? null : true" @click="onDlgClick" @cancel.prevent="closeOverlay">
    <div class="cp" :class="{ err: hasError, hascat: catList.length, blk: isBlock, ctr: isCenter }" @click.stop>
    <span class="cp-search"><obs-icon name="search" size="16"></obs-icon></span>
    <template v-if="catList.length">
      <obs-select class="cp-cat" variant="not-searchable" :options="catJson" :value="curCat" @change="onCat"></obs-select>
      <span class="cp-div" aria-hidden="true"></span>
    </template>
    <div ref="midRef" class="cp-mid" @focusin="onFocusIn">
      <obs-input class="cp-q" no-border block :value="query" :placeholder="placeholder" @input="onInput" @keydown="onKey"></obs-input>
      <div v-if="showSuggest" ref="sugRef" popover="manual" class="cp-suggest" :style="sugPos" role="listbox">
        <button v-for="(s, i) in sugList" :key="i" type="button" class="cp-sug" :class="{ on: i === active }" role="option"
          @mousedown.prevent="pick(s)" @mouseenter="active = i">{{ s }}</button>
      </div>
    </div>
    <!-- a parse error shows a red exclamation ICON (no Execute); otherwise Execute (⏎) shows only when there's a query.
         Each action reuses obs-tooltip for an instant (CSS-hover) tooltip. -->
    <div class="cp-acts">
      <obs-tooltip v-if="hasError" class="cp-tt" placement="bottom-end">
        <span slot="trigger" class="cp-exec err" role="img" :aria-label="error"><obs-icon name="exclamationCircle" size="16"></obs-icon></span>
        {{ error }}
      </obs-tooltip>
      <obs-tooltip v-else-if="query" class="cp-tt" placement="bottom-end">
        <button slot="trigger" class="cp-exec" type="button" aria-label="Execute" @click="execute"><obs-icon name="enter" size="16"></obs-icon></button>
        {{ executeLabel }}
      </obs-tooltip>
      <obs-tooltip v-if="on(clearable) && query" class="cp-tt" placement="bottom-end">
        <button slot="trigger" class="cp-clear" type="button" aria-label="Clear" @click="clear"><obs-icon name="backspace" size="15"></obs-icon></button>
        Clear
      </obs-tooltip>
    </div>
    <!-- time-range picker — REUSES the DS hero TimeRangePicker (obs-date-time-picker kind=range) -->
    <template v-if="on(timeRange)">
      <span class="cp-div" aria-hidden="true"></span>
      <obs-date-time-picker class="cp-range" kind="range"></obs-date-time-picker>
    </template>
    </div>
    </dialog>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { font-family: var(--font-family, 'Poppins', sans-serif); display: block; }
.cpwrap { display: contents; }
/* overlay (Cmd+K) trigger — a circular search icon matching the app-header action button */
.cp-trigger { width: 36px; height: 36px; border: 0; border-radius: 50%; padding: 0; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; background: none; color: var(--neutral-light, #6a7fa0); transition: background .15s, color .15s; }
.cp-trigger:hover { background: var(--neutral-lighter, #e3e8f2); color: var(--page-text-color, #1d2a3e); }
/* the <dialog>: inline (open) by default = a plain wrapper; overlay = a centered near-top MODAL with a blurred,
   dimmed backdrop (the DS obs-modal treatment) */
/* inline mode: a <dialog open> defaults to position:absolute (+fit-content) — reset it to flow normally so the bar
   stays inside its box and respects the .cp width, instead of stretching full-bleed */
.cp-dialog { position: static; display: block; width: 100%; box-sizing: border-box; margin: 0; padding: 0; border: 0; background: transparent; color: inherit; max-width: none; max-height: none; overflow: visible; }
.cp-dialog:not([open]) { display: none; }
.cpwrap.ov .cp-dialog { position: fixed; display: block; width: min(680px, 92vw); margin: 12vh auto auto; left: 0; right: 0; }
/* overlay CLOSED = only the trigger icon shows; the dialog bar must stay hidden until showModal() (higher
   specificity than the .cpwrap.ov rule above, else the closed bar leaks onto the page) */
.cpwrap.ov .cp-dialog:not([open]) { display: none; }
.cpwrap.ov .cp-dialog::backdrop { background: var(--modal-backdrop, rgba(29, 42, 62, 0.28)); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
.cpwrap.ov .cp-dialog .cp { max-width: none; box-shadow: 0 14px 44px var(--modal-shadow-color, rgba(0, 0, 0, .18)); }
/* one rounded, bordered bar — internal pieces are borderless (flush). Default is a roomy 680–800 (min-width 680 so
   the query never gets cramped); `block` removes the cap (fills its container); align="center" centers it */
.cp { display: flex; align-items: stretch; height: 44px; box-sizing: border-box; min-width: 680px; max-width: 800px; margin: 0;
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 8px;
  background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); font-size: 0.82rem; }
.cp.blk { max-width: 1100px; }
.cp.ctr { margin-left: auto; margin-right: auto; }
.cp.err { border-color: var(--secondary-red, #ec5b5b); }
/* leading search icon on a tinted lead segment — padding, not a fixed width; drop the right padding when a
   category dropdown follows so the icon sits close to it */
.cp-search { display: inline-flex; align-items: center; justify-content: center; padding: 0 10px; flex: 0 0 auto;
  background: var(--neutral-lightest, #f3f5f9); color: var(--neutral-light, #6a7fa0); border-radius: 8px 0 0 8px; }
.cp.hascat .cp-search { padding-right: 0; }
/* category picker (reused obs-select) — flush + TINTED (transparent trigger over the neutral-lightest segment, like
   the time-range segment); compact width, truncates a long value */
.cp-cat { display: inline-flex; align-items: center; flex: 0 0 auto; overflow: hidden; background: var(--neutral-lightest, #f3f5f9);
  --input-height-base: 42px; --page-background-color: transparent; --border-color: transparent; width: 92px; }
.cp-div { width: 1px; flex: 0 0 auto; background: var(--border-color, #e3e8f2); }
/* query field + its suggestions dropdown — a little left inset so the text doesn't butt up against the divider/icon */
.cp-mid { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; padding-left: 12px; }
.cp-q { flex: 1; min-width: 0; display: block; --input-height-base: 42px; }
.cp-suggest { padding: 6px; background: var(--page-background-color, #fff); border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 8px; box-shadow: 0 6px 20px var(--neutral-shadow-light, rgba(29, 42, 62, .14)); max-height: 320px; overflow: auto; }
.cp-suggest[popover] { margin: 0; inset: auto; }
.cp-sug { display: block; width: 100%; text-align: left; padding: 8px 12px; border: 0; border-radius: 5px;
  background: transparent; color: var(--primary-alt, #3279be); font-size: 0.82rem; cursor: pointer; white-space: nowrap; }
.cp-sug:first-child { color: var(--page-text-color, #1d2a3e); }
.cp-sug.on { background: var(--code-tag-background-color, #eef2f8); }
/* Execute / clear icon actions — a tight group (small gap), each wrapped in obs-tooltip for an instant tooltip */
.cp-acts { display: inline-flex; align-items: stretch; flex: 0 0 auto; gap: 2px; padding: 0 4px; }
.cp-tt { display: inline-flex; align-items: center; }
.cp-exec, .cp-clear { display: inline-flex; align-items: center; justify-content: center; height: 42px; width: 26px; border: 0;
  background: transparent; color: var(--neutral-light, #6a7fa0); cursor: pointer; }
.cp-exec:hover { color: var(--page-text-color, #1d2a3e); }
.cp-exec.err { color: var(--secondary-red, #ec5b5b); cursor: default; }
.cp-clear:hover { color: var(--page-text-color, #1d2a3e); }
/* time-range picker segment (reused obs-date-time-picker) — on a tinted segment */
.cp-range { display: inline-flex; align-items: center; flex: 0 0 auto; padding: 0 6px;
  background: var(--neutral-lightest, #f3f5f9); border-radius: 0 8px 8px 0; }
</style>
