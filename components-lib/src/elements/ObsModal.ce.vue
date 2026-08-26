<script setup>
// <obs-modal> — the DS modal dialog (MModal, 39× + FlotoConfirmModal, 71×). A CENTERED dialog over a BLURRED
// backdrop. Header = a --primary title + a close ✕ (the product turns MModal's built-in × off and adds its own);
// body padding 24px; footer = Cancel (default) + a confirm button (primary/error). Built on the native <dialog>
// (showModal): top-layer, focus-trap, Esc, ::backdrop for free — the correct overlay mechanism (matches the
// product's portal + focus behaviour). `open` reflects to the host so el.open stays truthful. Composes the DS
// primitives: obs-button (footer) · obs-icon (close ✕ + confirm icon).
//
//   <obs-modal title="Edit monitor" open>…body…</obs-modal>
//   <obs-modal variant="confirm" icon="timesCircle" confirm-text="Delete" confirm-variant="error" open>Delete web-01?</obs-modal>
//
// Variants: hide-footer · no-padding (body 8px) · scrollable (fixed-height scrolling body) · restrict-width (1020px)
// · size via `width`. Owner rule: for a full-screen flow / side panel use <obs-drawer>, not a modal.
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, useHost } from 'vue'
import { takeOverlay, releaseOverlay } from './_overlay.js' // single open top-layer overlay (modal/drawer)
// icons come from the reusable <obs-icon> element — no inlined SVG

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },                  // header title (default variant) AND the bold heading in the confirm variant
  width: { type: [Number, String], default: 560 },
  variant: { type: String, default: 'default' },        // default | confirm (icon + message + Cancel/action)
  icon: { type: String, default: '' },                   // confirm-variant icon (a library key, e.g. timesCircle)
  confirmText: { type: String, default: 'Save' },
  cancelText: { type: String, default: 'Cancel' },
  confirmVariant: { type: String, default: 'primary' },  // the footer confirm button variant (primary | error | …)
  hideFooter: { type: [Boolean, String], default: false },
  noPadding: { type: [Boolean, String], default: false }, // full-bleed body (8px)
  scrollable: { type: [Boolean, String], default: false }, // fixed-height body with its own scroll
  restrictWidth: { type: [Boolean, String], default: false }, // force 1020px (wide/compare modal)
  escClosable: { type: [Boolean, String], default: true },
  maskClosable: { type: [Boolean, String], default: false }, // product default: backdrop does NOT close
})
const emit = defineEmits(['confirm', 'cancel', 'close', 'show', 'hide'])
const host = useHost()

const on = (v) => v === true || v === '' || v === 'true'
const off = (v) => v === false || v === 'false'
const isConfirm = computed(() => props.variant === 'confirm')
const showFooter = computed(() => !on(props.hideFooter))
const dlg = ref(null)
const shown = ref(false)

const panelStyle = computed(() => {
  if (isConfirm.value) return { maxWidth: 'calc(100vw - 48px)' } // confirm width is CSS-controlled (matches the product)
  if (on(props.restrictWidth)) return { width: '1020px', maxWidth: 'calc(100vw - 48px)' }
  const w = typeof props.width === 'number' || /^\d+$/.test(String(props.width)) ? `${props.width}px` : String(props.width)
  return { width: w, maxWidth: 'calc(100vw - 48px)' }
})

function reflect(v) { if (host) { try { if (host.open !== v) host.open = v } catch (e) { /* readonly */ } } }
function doOpen() {
  if (shown.value) return
  takeOverlay(doClose) // close any other open overlay (modal/drawer) — only one top-layer dialog at a time
  shown.value = true; reflect(true)
  nextTick(() => { const d = dlg.value; if (!d) return; try { d.showModal() } catch (e) { d.setAttribute('open', '') } emit('show') })
}
function doClose() { const d = dlg.value; if (d && d.open) d.close(); else onClosed() }
function onClosed() { if (!shown.value) return; shown.value = false; releaseOverlay(doClose); reflect(false); emit('hide') }
function requestClose(reason) { emit(reason === 'confirm' ? 'confirm' : 'cancel'); if (reason !== 'confirm-stay') { emit('close'); doClose() } }
function onCancelEvt(e) { e.preventDefault(); if (off(props.escClosable)) return; emit('cancel'); emit('close'); doClose() } // Esc → native 'cancel'
function onDlgClick(e) { if (e.target === dlg.value && on(props.maskClosable)) { emit('cancel'); emit('close'); doClose() } }

watch(() => props.open, (v) => { v ? doOpen() : doClose() })
onMounted(() => { if (props.open) doOpen() }) // open on mount AFTER the dialog ref exists (not during setup)
onBeforeUnmount(() => { const d = dlg.value; if (d && d.open) d.close() })
if (host) { host.show = doOpen; host.hide = () => { emit('close'); doClose() } }
</script>

<template>
  <dialog ref="dlg" class="modal" :class="{ confirm: isConfirm, ['cfv-' + confirmVariant]: isConfirm, scrollable: on(scrollable), 'no-pad': on(noPadding) }"
    :style="panelStyle" @close="onClosed" @cancel="onCancelEvt" @click="onDlgClick">
    <!-- CONFIRM variant (FlotoConfirmModal) — HORIZONTAL: an icon in a coloured-border circle on the LEFT +
         message and left-aligned actions on the RIGHT. The card gets a coloured border (red for error). -->
    <div v-if="isConfirm" class="cf-row">
      <span v-if="icon" class="cf-ic-circle"><obs-icon :name="icon" size="26"></obs-icon></span>
      <div class="cf-content">
        <div v-if="title" class="cf-title">{{ title }}</div>
        <div class="cf-msg"><slot /></div>
        <div v-if="showFooter" class="cf-foot">
          <obs-button variant="default" @click="requestClose('cancel')">{{ cancelText }}</obs-button>
          <obs-button :variant="confirmVariant" outline @click="requestClose('confirm')">{{ confirmText }}</obs-button>
        </div>
      </div>
    </div>
    <!-- DEFAULT variant — header (title + ✕) · body · footer -->
    <template v-else>
      <div class="head">
        <h4 class="title">{{ title }}</h4>
        <button type="button" class="x" aria-label="Close" @click="requestClose('cancel')"><obs-icon name="times" size="16"></obs-icon></button>
      </div>
      <div class="body"><slot /></div>
      <div v-if="showFooter" class="foot">
        <slot name="footer">
          <obs-button variant="default" @click="requestClose('cancel')">{{ cancelText }}</obs-button>
          <obs-button :variant="confirmVariant" @click="requestClose('confirm')">{{ confirmText }}</obs-button>
        </slot>
      </div>
    </template>
  </dialog>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { font-family: var(--font-family, 'Poppins', sans-serif); }
button { font-family: inherit; }

/* the dialog is centered by the UA; we style the panel + the top-layer backdrop */
.modal { border: 0; padding: 0; max-height: calc(100vh - 48px); border-radius: 16px; overflow: hidden;
  background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); font-size: 0.8rem;
  box-shadow: 0 4px 12px var(--modal-shadow-color, rgba(0, 0, 0, .15)); }
/* CRITICAL: only lay the panel out with flex when OPEN. A closed <dialog> is display:none by the UA, but an
   UNCONDITIONAL `display:flex` here (author) overrides that → every CLOSED modal renders its content inline
   (visible + stacked) in a gallery. Scoping to [open] lets a closed dialog fall back to the UA display:none. */
.modal[open] { display: flex; flex-direction: column; }
/* confirm variant (FlotoConfirmModal) — a COLOURED-BORDER card (2px top/bottom, 4px left/right), 20px radius */
.modal.confirm { border-radius: 20px; width: 500px; border: 2px solid var(--secondary-red, #ec5b5b); border-left-width: 4px; border-right-width: 4px; }
.modal.cfv-primary { border-color: var(--primary, #111c2c); }
.modal::backdrop { background: var(--modal-backdrop, rgba(29, 42, 62, .28)); backdrop-filter: blur(3px); }

/* header — a --primary title + a close ✕ */
.head { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--border-color, #e3e8f2); flex: 0 0 auto; }
.title { flex: 1; margin: 0; font-size: 1rem; font-weight: 600; color: var(--primary, #111c2c); }
.x { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border: 0;
  border-radius: 4px; background: transparent; color: var(--neutral-light, #6a7fa0); cursor: pointer; }
.x:hover { background: var(--neutral-lighter, #e3e8f2); color: var(--page-text-color, #1d2a3e); }

/* body */
.body { padding: 24px; overflow-y: auto; flex: 1 1 auto; }
.modal.no-pad .body { padding: 8px; }
.modal.scrollable .body { max-height: 55vh; }

/* footer — Cancel (default) + confirm (primary/error) */
.foot { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 12px 16px; border-top: 1px solid var(--border-color, #e3e8f2); flex: 0 0 auto; }

/* confirm variant — HORIZONTAL: icon in a coloured-border circle (left) + message & left-aligned actions (right) */
.cf-row { display: flex; align-items: flex-start; gap: 20px; padding: 28px; }
.cf-ic-circle { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px;
  border-radius: 50%; border: 2px solid var(--secondary-red, #ec5b5b); color: var(--secondary-red, #ec5b5b); }
.modal.cfv-primary .cf-ic-circle { border-color: var(--primary, #111c2c); color: var(--primary, #111c2c); }
.cf-content { flex: 1; min-width: 0; padding-top: 4px; }
.cf-title { font-size: 1rem; font-weight: 600; line-height: 1.4; color: var(--primary-alt, #1d2a3e); margin-bottom: 6px; }
.cf-msg { font-size: 0.9rem; line-height: 1.5; color: var(--page-text-color, #1d2a3e); margin-bottom: 20px; }
.cf-foot { display: flex; align-items: center; gap: 8px; }
</style>
