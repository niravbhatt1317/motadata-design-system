<script setup>
// <obs-banner> — an inline notice / callout / info banner (the "Visible to all users…" style block). A tinted
// surface + a leading status icon + a message (default slot) + an optional title and a dismiss ×. Intents:
// info (DEFAULT — the product's subtle periwinkle notice: soft --info-surface + muted --info-text, near-borderless),
// note (an emphasised brand-blue callout), success, warning, error. Distinct from a toast (transient overlay) and
// from obs-modal (blocking). Reuses obs-icon. All colours are DS tokens (info-* / primary-alt-* / severity-*).
//
//   <obs-banner>Visible to all users in the organization.</obs-banner>
//   <obs-banner variant="warning" title="Heads up" closable>Only shared users can view this.</obs-banner>
import { ref, computed, useHost } from 'vue'
const props = defineProps({
  variant: { type: String, default: 'info' },   // info | success | warning | error
  title: { type: String, default: '' },          // optional bold heading above the message
  icon: { type: String, default: '' },           // override the default per-variant icon (a library key)
  closable: { type: [Boolean, String], default: false }, // show a dismiss × (emits `close`, hides itself)
})
const emit = defineEmits(['close'])
const host = useHost()
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const DEFAULT_ICON = { info: 'infoCircle', note: 'infoCircle', success: 'checkCircle', warning: 'exclamationTriangle', error: 'timesCircle' }
const v = computed(() => (['info', 'note', 'success', 'warning', 'error'].includes(props.variant) ? props.variant : 'info'))
const glyph = computed(() => props.icon || DEFAULT_ICON[v.value])
const dismissed = ref(false)
function close() { dismissed.value = true; emit('close'); if (host) { try { host.setAttribute('hidden', '') } catch (e) {} } }
</script>

<template>
  <div v-if="!dismissed" class="bn" :class="'v-' + v" role="status">
    <obs-icon class="bn-ic" :name="glyph" size="16" aria-hidden="true"></obs-icon>
    <div class="bn-body">
      <div v-if="title" class="bn-title">{{ title }}</div>
      <div class="bn-msg"><slot></slot></div>
    </div>
    <button v-if="on(closable)" type="button" class="bn-x" aria-label="Dismiss" @click="close">
      <obs-icon name="times" size="13" aria-hidden="true"></obs-icon>
    </button>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; font-family: var(--font-family, 'Poppins', sans-serif); }
button { font-family: inherit; }
.bn {
  display: flex; align-items: flex-start; gap: 10px; box-sizing: border-box;
  padding: 10px 12px; border: 1px solid var(--bn-border); border-radius: 6px;
  background: var(--bn-surface); color: var(--bn-text, var(--page-text-color, #1d2a3e)); font-size: 0.8rem; line-height: 1.5;
}
/* intent palettes. Each sets the surface/border/accent(icon) + --bn-text (the MESSAGE text colour). */
/* info (default) — the product's SUBTLE notice: NEUTRAL surface + neutral text & icon, near-borderless.
   bg = --neutral-lightest (#ecf1f9), text/icon = --neutral-regular (#7186a8). */
.v-info    { --bn-surface: var(--neutral-lightest, #ecf1f9); --bn-border: var(--neutral-lightest, #ecf1f9); --bn-accent: var(--neutral-regular, #7186a8); --bn-text: var(--neutral-regular, #7186a8); }
/* note — the BLUE callout: blue surface + blue icon (the --info-* tokens), dark text */
.v-note    { --bn-surface: var(--info-surface, #eef5fc); --bn-border: var(--info-border, #cadff5); --bn-accent: var(--info-text, #2f6099); --bn-text: var(--page-text-color, #1d2a3e); }
.v-success { --bn-surface: var(--severity-up-lightest, #eef7e4); --bn-border: var(--severity-up-lighter, #cfe7ad); --bn-accent: var(--severity-up, #89c540); }
.v-warning { --bn-surface: var(--severity-warning-lightest, #fdf4dd); --bn-border: var(--severity-warning-lighter, #f7e3a6); --bn-accent: var(--severity-warning, #f5bc18); }
.v-error   { --bn-surface: var(--severity-critical-lightest, #fdecec); --bn-border: var(--severity-critical-lighter, #f6c5c5); --bn-accent: var(--severity-critical, #ec5b5b); }
.bn-ic { flex: 0 0 auto; margin-top: 1px; color: var(--bn-accent); display: inline-flex; }
.bn-body { flex: 1; min-width: 0; }
.bn-title { font-weight: 600; margin-bottom: 2px; color: var(--bn-text, var(--page-text-color, #1d2a3e)); }
.bn-msg { color: var(--bn-text, var(--page-text-color, #1d2a3e)); }
.bn-x { flex: 0 0 auto; display: inline-flex; align-items: center; padding: 0; margin: 1px -2px 0 0; border: 0; background: none;
  cursor: pointer; color: var(--neutral-light, #8e9fbc); }
.bn-x:hover { color: var(--page-text-color, #1d2a3e); }
</style>
