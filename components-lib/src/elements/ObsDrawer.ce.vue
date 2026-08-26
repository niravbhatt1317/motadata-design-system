<script setup>
// <obs-drawer> — DS "Drawer": a right slide-in side panel (FlotoDrawer, 99× — the product's most-used
// overlay). Render-faithful to src/design/drawer.less: header (title + close ✕) · scrollable body ·
// fixed 60px actions footer · BLUR-ONLY backdrop (no dark scrim) · square left corners · maskClosable=false.
// Built on the native <dialog> (showModal): top-layer, focus-trap, Esc, and ::backdrop for free — which is
// the correct mechanism for an overlay (matches the product's portal + focus behaviour). `open` reflects to
// the host so el.open stays truthful; ✕/Esc emit `close`, and `after-close` fires once the slide-out ends.
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, useHost, useId } from 'vue'
import { takeOverlay, releaseOverlay } from './_overlay.js' // single open top-layer overlay (modal/drawer)
// icons come from the reusable <obs-icon> element (the DS icon library) — no inlined SVG

const props = defineProps({
  open: { type: Boolean, default: false },      // visibility (reflected to el.open)
  title: { type: String, default: '' },          // header title text (or use the `title` slot)
  width: { type: [String, Number], default: '40%' }, // Number → px; String %/px passthrough. Product: 360→40%→50-70%→85-96%
  placement: { type: String, default: 'right' },  // right | left
  maskClosable: { type: Boolean, default: false }, // product default: clicking the backdrop does NOT close
  // NOT plain Boolean-typed: a Boolean prop makes attribute="false" cast to TRUE (Vue). String-inclusive +
  // an explicit off() check lets scrolled-content="false" / esc-closable="false" actually turn them off.
  scrolledContent: { type: [Boolean, String], default: true }, // wrap body in a scroll region; false = multi-pane (columns scroll)
  usePadding: { type: Boolean, default: false },   // widen the shared inset to 24px for the WHOLE panel (header+body+footer stay aligned)
  escClosable: { type: [Boolean, String], default: true },   // Escape closes; esc-closable="false" disables
  // built-in footer preset — used ONLY when the `actions` slot is empty. Values:
  //   close · cancel-save · reset-cancel-save · delete-split · note-split
  // Cancel/Close close the drawer; Save/Reset/Delete/Back emit a `footer-action` event with { action }.
  footer: { type: String, default: '' },
})
const off = (v) => v === false || v === 'false'
const emit = defineEmits(['open', 'close', 'after-close', 'update:open', 'footer-action'])

const host = useHost()
const titleId = useId()
const dlg = ref(null)
const shown = ref(false) // internal open state (mirrors the dialog)

const widthCss = computed(() => (typeof props.width === 'number' || /^\d+$/.test(String(props.width)) ? `${props.width}px` : String(props.width)))
const isScrolled = computed(() => !off(props.scrolledContent))
const hasActions = ref(false)
const actionsSlot = ref(null)
// built-in footer presets (rendered from obs-buttons when the actions slot is empty). t=label, v=variant,
// close=closes the drawer, a=emits footer-action{action}. left/note split to the LEFT via justify-between.
const FOOTERS = {
  'close': { right: [{ t: 'Close', v: 'default', close: true }] },
  'cancel-save': { right: [{ t: 'Cancel', v: 'default', close: true }, { t: 'Save', v: 'primary', a: 'save' }] },
  'reset-cancel-save': { right: [{ t: 'Reset', v: 'default', a: 'reset' }, { t: 'Cancel', v: 'default', close: true }, { t: 'Save', v: 'primary', a: 'save' }] },
  'delete-split': { left: [{ t: 'Delete', v: 'error', outline: true, a: 'delete' }], right: [{ t: 'Cancel', v: 'default', close: true }, { t: 'Save', v: 'primary', a: 'save' }] },
  'note-split': { note: '* fields are mandatory', right: [{ t: 'Back', v: 'default', a: 'back' }, { t: 'Cancel', v: 'default', close: true }, { t: 'Save', v: 'primary', a: 'save' }] },
}
const footerCfg = computed(() => FOOTERS[props.footer] || null)
const isSplitFooter = computed(() => !!(footerCfg.value && (footerCfg.value.left || footerCfg.value.note)))
const showFooter = computed(() => hasActions.value || (!!footerCfg.value))
function onFooterBtn(b) { if (b.a) emit('footer-action', { action: b.a }); if (b.close) requestClose() }
function syncActions() {
  const el = actionsSlot.value
  hasActions.value = !!(el && el.assignedNodes && el.assignedNodes({ flatten: true }).some((n) => n.nodeType === 1 || (n.textContent || '').trim()))
}

function reflect(v) { if (host) { try { if (host.open !== v) host.open = v } catch (e) { /* readonly host */ } } }

function doOpen() {
  const d = dlg.value; if (!d || d.open) return
  takeOverlay(requestClose) // close any other open overlay (modal/drawer) — only one top-layer dialog at a time
  try { d.showModal() } catch (e) { d.setAttribute('open', '') }
  shown.value = true
  // move focus to the panel (not the ✕) so no control shows a focus ring on open — matches Ant's drawer
  nextTick(() => { syncActions(); try { d.focus({ preventScroll: true }) } catch (e) { /* noop */ } })
  emit('open')
}
function requestClose() {
  const d = dlg.value; if (!d || !d.open) return
  // native close() lets the exit transition run (transition-behavior: allow-discrete on display/overlay)
  d.close()
}
function onNativeClose() {
  // fired by ✕, Esc, or programmatic close() once the dialog leaves the top layer
  shown.value = false
  releaseOverlay(requestClose)
  reflect(false)
  emit('update:open', false)
  emit('close')
  // the slide-out (~product 500ms) has run by the time transitionend fires; mirror the product's after-close
  emit('after-close')
}
function onCancel(e) {
  // Esc → native 'cancel'. Respect escClosable; otherwise swallow it (stay open).
  if (off(props.escClosable)) { e.preventDefault() }
}
function onDialogClick(e) {
  // a click whose target IS the dialog came from the ::backdrop (the panel content sits in children).
  if (e.target === dlg.value && !props.maskClosable) return   // product default: backdrop does not close
  if (e.target === dlg.value && props.maskClosable) requestClose()
}
// declarative close: any slotted element carrying [data-close] closes the drawer (native slots can't pass a
// scoped `hide` callback to plain-HTML consumers) — e.g. <button data-close slot="actions">Cancel</button>.
function onWrapClick(e) {
  const t = e.target
  if (t && t.closest && t.closest('[data-close]')) requestClose()
}

watch(() => props.open, (v) => { v ? doOpen() : requestClose() })
onMounted(() => { syncActions(); if (props.open) doOpen() })
onBeforeUnmount(() => { const d = dlg.value; if (d && d.open) d.close() })

// expose imperative helpers on the host element (so `el.show()/el.hide()` work like the product)
if (host) { host.show = doOpen; host.hide = requestClose }
</script>

<template>
  <dialog
    ref="dlg"
    tabindex="-1"
    class="drawer"
    :class="['place-' + placement]"
    :style="{ width: widthCss }"
    :aria-labelledby="titleId"
    @close="onNativeClose"
    @cancel="onCancel"
    @click="onDialogClick"
  >
    <div class="wrap" :class="{ pad: usePadding }" @click="onWrapClick">
      <header class="hd">
        <h5 :id="titleId" class="title"><slot name="title">{{ title }}</slot></h5>
        <button type="button" class="x" aria-label="Close" @click="requestClose">
          <obs-icon name="times" size="18"></obs-icon>
        </button>
      </header>
      <div class="body" :class="{ scroll: isScrolled, pad: usePadding, hasfoot: showFooter }">
        <slot />
      </div>
      <!-- footer stays in the DOM (v-show, not v-if) so slotchange detection works even when empty.
           the `actions` slot WINS; otherwise a built-in preset (footer prop) renders from obs-buttons. -->
      <footer v-show="showFooter" class="actions" :class="{ split: !hasActions && isSplitFooter }">
        <slot name="actions" ref="actionsSlot" @slotchange="syncActions" />
        <template v-if="!hasActions && footerCfg">
          <span v-if="footerCfg.note" class="fnote">{{ footerCfg.note }}</span>
          <obs-button v-for="b in (footerCfg.left || [])" :key="'l' + b.t" :variant="b.v" :outline="b.outline || null" @click="onFooterBtn(b)">{{ b.t }}</obs-button>
          <span class="fright">
            <obs-button v-for="(b, i) in footerCfg.right" :key="'r' + b.t" :variant="b.v" :outline="b.outline || null"
              :style="i < footerCfg.right.length - 1 ? 'margin-right:8px' : ''" @click="onFooterBtn(b)">{{ b.t }}</obs-button>
          </span>
        </template>
      </footer>
    </div>
  </dialog>
</template>

<style>
:host([hidden]) { display: none !important; }
/* force the product font so the panel + slotted content render in Poppins even if the host page doesn't set it */
:host { font-family: var(--font-family, 'Poppins', sans-serif); }
button { font-family: inherit; }

/* the dialog IS the sliding panel — pinned to the right edge, full height, square left corners */
.drawer {
  position: fixed;
  inset: 0 0 0 auto;            /* pin right */
  height: 100vh;
  max-height: 100vh;
  max-width: 100vw;
  box-sizing: border-box;       /* width includes the 2px left border (match Ant wrapper's total width) */
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;             /* product resets Ant's rounded left corners */
  border-left: 2px solid var(--border-color, #e3e8f2);  /* real content-wrapper carries a 2px left edge */
  background: var(--drawer-background-color, var(--page-background-color, #fff));
  color: var(--page-text-color, #1d2a3e);
  font-size: 0.8rem;            /* product drawer base (12.8px) — children inherit unless overridden */
  line-height: 1.5;             /* real base lh 19.2px */
  overflow: hidden;
  box-shadow: -8px 0 24px -12px var(--neutral-shadow-dark, rgba(0, 0, 0, .25));
  outline: none;                /* showModal focuses the dialog — suppress the UA focus ring on the panel */
  /* enter/exit slide — allow-discrete lets display/overlay animate so the panel slides out before it's removed */
  transform: translateX(0);
  transition: transform .3s ease, overlay .3s ease allow-discrete, display .3s ease allow-discrete;
}
.drawer.place-left { inset: 0 auto 0 0; border-left: 0; border-right: 2px solid var(--border-color, #e3e8f2); box-shadow: 8px 0 24px -12px var(--neutral-shadow-dark, rgba(0, 0, 0, .25)); }

/* closed + starting states → off-screen (right by default, left for left placement) */
.drawer:not([open]) { transform: translateX(100%); }
.drawer.place-left:not([open]) { transform: translateX(-100%); }
@starting-style { .drawer[open] { transform: translateX(100%); } }
@starting-style { .drawer.place-left[open] { transform: translateX(-100%); } }

/* BLUR-ONLY backdrop — the product neutralises Ant's dark scrim to a 3px blur */
.drawer::backdrop {
  background: transparent;
  backdrop-filter: blur(3px);
  transition: backdrop-filter .3s ease, opacity .3s ease allow-discrete, display .3s ease allow-discrete;
}
@starting-style { .drawer[open]::backdrop { backdrop-filter: blur(0); opacity: 0; } }
.drawer:not([open])::backdrop { backdrop-filter: blur(0); opacity: 0; }

.wrap { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
/* use-padding: widen the shared inset for the WHOLE panel (header + body + footer stay aligned), not just the body */
.wrap.pad { --drawer-inset: 24px; }

/* header — measured from the real render: padding 15px 0; margin 0 15px; height ~53px; 1px bottom divider.
   the header + body share the SAME 15px inset so title and content align vertically. */
.hd {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin: 0 var(--drawer-inset, 15px);
  padding: 15px 0;
  border-bottom: 1px solid var(--border-color, #e3e8f2);
}
.title {
  flex: 1 1 auto;
  margin: 0;
  font-size: 1rem;
  font-weight: 500;                        /* matches the rendered drawer title (Ant .ant-drawer-title) */
  line-height: 22px;
  color: var(--page-text-color, #1d2a3e);  /* .text-primary util = primary TEXT, not brand cyan */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* close ✕ — Ant pins it top-right, spanning the FULL header height (not a small centred button) */
.x {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: var(--neutral-light, #6a7fa0);
  cursor: pointer;
  transition: color .15s;
}
.x obs-icon { pointer-events: none; }  /* the <obs-icon> self-sizes via its size attr; color inherits from .x */
.x:hover { color: var(--page-text-color, #1d2a3e); }
.x:focus-visible { outline: 2px solid var(--primary-alt, #3279be); outline-offset: 2px; } /* fixes product SF-001 */

/* body — flex:1 scroll region; clears the fixed footer visual via the flex footer below.
   top padding is 15px (owner choice — more breathing room under the header than the product's 5px). */
/* G19 — heading, body AND footer share ONE horizontal inset (--drawer-inset, default 15px) so all three ALIGN.
   `use-padding` bumps the whole panel to 24px (below); a consumer can set --drawer-inset on the drawer for any value. */
.body { flex: 1 1 auto; min-height: 0; padding: 15px var(--drawer-inset, 15px) 0; }
.body.scroll { overflow-y: auto; }
.body:not(.hasfoot) { padding-bottom: 15px; }
/* scrolled-content=false → multi-pane layout; drop the body padding so columns go edge-to-edge (each scrolls itself) */
.body:not(.scroll) { padding: 0; }

/* footer — measured from the real render: 60px, right-aligned, 24px side margins, NO top border (bdTop 0) */
.actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 60px;
  margin: 0 var(--drawer-inset, 15px);   /* G19: same inset as header + body (was a hardcoded 24px that couldn't align) */
  border-bottom-left-radius: 15px;   /* real footer rounds its bottom-left corner */
  background: var(--drawer-background-color, var(--page-background-color, #fff));
}
/* built-in footer presets: split variants push a destructive/tertiary action (or a note) to the LEFT */
.actions.split { justify-content: space-between; }
.actions .fright { display: inline-flex; align-items: center; }
.actions .fnote { font-size: 12px; color: var(--secondary-red, #ec5b5b); }
/* the content-detection probe never shows */
.probe { display: none; }
</style>
