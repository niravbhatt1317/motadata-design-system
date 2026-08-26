<script setup>
// <obs-tag> — maps to the DS `tag` registry. Covers the full tag family:
//  • colour variants  : tag-primary / tag-green / tag-red / tag-yellow / tag-orange / tag-purple / tag-unknown
//  • state-class chips : used-count-pill / new / provision / unprovision / neutral-lighter / default
//  • status mode       : status="up|down|…" → mapped colour + capitalised label, rounded (MStatusTag, 30×)
//  • display/removable/rounded/disabled
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
  variant: { type: String, default: 'tag-primary' },
  closable: { type: Boolean, default: false },
  rounded: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  status: { type: String, default: '' },        // when set → status-tag mode
  forcePrimary: { type: Boolean, default: false },
  compliance: { type: Boolean, default: false }, // .compliance-tag-padding (wider horizontal padding)
  numeric: { type: Boolean, default: false },    // count/metric tag — JetBrains Mono + tabular figures (.numeric-value)
  confirmable: { type: Boolean, default: false }, // ask before removing (registry: confirmable + confirm-title)
  confirmTitle: { type: String, default: 'Are you sure?' },
})
const emit = defineEmits(['close'])
const open = ref(true)
const confirming = ref(false)
const xWrap = ref(null)

// keyboard-accessible × (the product's × is mouse-only — registry a11y issue; fixed here per owner).
function onX() {
  if (props.disabled) return
  if (props.confirmable) confirming.value = true
  else doClose()
}
function onXKey(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onX() } }
function doClose() { confirming.value = false; open.value = false; emit('close') }
function cancelConfirm() { confirming.value = false }
function onKeyAct(fn) { return (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn() } } }
function onDocDown(e) { if (xWrap.value && !xWrap.value.contains(e.target)) confirming.value = false }
onMounted(() => document.addEventListener('mousedown', onDocDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocDown))

// status → colour class (from _base-status-tag.vue TAG_MAP)
const TAG_MAP = {
  off: 'tag-red', on: 'tag-green', poweredoff: 'tag-red', poweredon: 'tag-green', success: 'tag-green',
  error: 'tag-red', up: 'tag-green', active: 'tag-green', down: 'tag-red', inactive: 'tag-red',
  unknown: 'tag-unknown', completed: 'tag-green', halted: 'tag-yellow', paused: 'tag-yellow',
  succeed: 'tag-green', succeeded: 'tag-green', failed: 'tag-red', fail: 'tag-red', running: 'tag-green',
  queued: 'tag-yellow', abort: 'tag-yellow', aborted: 'tag-yellow', suspended: 'tag-orange',
  stopped: 'tag-red', yes: 'tag-green', no: 'tag-red', starting: 'tag-yellow', enable: 'tag-green',
  disable: 'tag-red', maintenance: 'tag-primary', unreachable: 'tag-purple', suspend: 'tag-orange',
  good: 'tag-green', poor: 'tag-red', fair: 'tag-orange', online: 'tag-green', offline: 'tag-red',
  available: 'tag-green', connected: 'tag-primary', standby: 'tag-primary', powering: 'tag-primary',
  disconnected: 'tag-red', connecting: 'tag-green', ready: 'tag-green', critical: 'tag-red',
  ok: 'tag-green', normal: 'tag-green', healthy: 'tag-green', stable: 'tag-green', operational: 'tag-green',
}
const TEXT_MAP = { poweredoff: 'up', poweredon: 'down' } // intentional inversion quirk
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
const key = computed(() => String(props.status || '').toLowerCase())

const resolvedVariant = computed(() =>
  props.status ? (props.forcePrimary ? 'tag-primary' : (TAG_MAP[key.value] || 'tag-primary')) : props.variant
)
const isRounded = computed(() => props.rounded || !!props.status)
const statusText = computed(() => cap(TEXT_MAP[key.value] || String(props.status || '')))
</script>

<template>
  <span v-if="open" class="tag" :class="[resolvedVariant, { rounded: isRounded, disabled, numeric, 'compliance-tag-padding': compliance }]">
    <template v-if="status">{{ statusText }}</template>
    <slot v-else />
    <span v-if="closable && !status" ref="xWrap" class="x-wrap">
      <span class="x" role="button" tabindex="0" aria-label="Remove" @click="onX" @keydown="onXKey"><obs-icon name="times" size="11"></obs-icon></span>
      <span v-if="confirming" class="confirm" role="dialog">
        <span class="confirm-title">{{ confirmTitle }}</span>
        <span class="confirm-actions">
          <span class="confirm-yes" role="button" tabindex="0" @click="doClose" @keydown="onKeyAct(doClose)">Yes</span>
          <span class="confirm-no" role="button" tabindex="0" @click="cancelConfirm" @keydown="onKeyAct(cancelConfirm)">No</span>
        </span>
      </span>
    </span>
  </span>
</template>

<style>
:host([hidden]) { display: none !important; }
.tag.numeric { font-family: var(--numeric-font-family, 'JetBrains Mono', monospace); font-feature-settings: 'tnum'; }
.tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-family, 'Poppins', sans-serif);
  font-size: 0.7rem; font-weight: 500; line-height: 22px;
  padding: 0 8px; border-radius: 4px;
}
.tag.disabled { opacity: 0.5; cursor: not-allowed; }

/* ---- colour variants (colored text on a tinted bg) ---- */
.tag-green { color: var(--secondary-green, #14b053); background: var(--secondary-green-lightest, rgba(54, 213, 118, 0.2)); }
.tag-red { color: var(--secondary-red, #ec5b5b); background: var(--secondary-red-lightest, rgba(236, 91, 91, 0.2)); }
.tag-yellow { color: var(--secondary-yellow, #e8b407); background: var(--secondary-yellow-lightest, rgba(250, 209, 0, 0.2)); }
.tag-orange { color: var(--secondary-orange, #f47c22); background: var(--secondary-orange-lightest, rgba(250, 153, 80, 0.2)); }
.tag-primary { color: var(--default-tag-text-color, #516381); background: var(--tag-bg-color, var(--neutral-lighter, #e3e8f2)); }
.tag-purple { color: var(--severity-unreachable, #6d2ed1); background: var(--severity-unreachable-lightest, #e7dcfa); }
.tag-unknown { color: var(--severity-unknown, #b1b1b1); background: var(--severity-unknown-lighter, #fcfcfc); }

/* ---- state-class chips (src/design/tags.less) ---- */
.used-count-pill { color: var(--primary, #111c2c); background: var(--tag-bg-color, #e3e8f2); }
.new { color: var(--secondary-green, #14b053); background: var(--secondary-green-lightest, rgba(54, 213, 118, 0.2)); }
.provision { color: var(--primary, #111c2c); background: var(--primary-lightest, rgba(9, 157, 217, 0.2)); }
.unprovision { color: var(--secondary-orange, #f47c22); background: var(--secondary-orange-lightest, rgba(250, 153, 80, 0.2)); }
.neutral-lighter { color: var(--page-text-color, #1d2a3e); background: var(--neutral-lighter, #e3e8f2); }
.default { color: var(--default-tag-text-color, #516381); background: var(--tag-bg-color, #e3e8f2); }
.nav-beta-tag { color: var(--default-tag-text-color, #516381); background: var(--tag-bg-color, #e3e8f2); }
.main-tags { color: var(--main-tags-text-color, #218b81); background: var(--main-tags-bg-color, #cdf1ed); }

.rounded { border-radius: 10px; }
.compliance-tag-padding { padding-left: 0.69rem; padding-right: 0.69rem; }
/* close × inherits the tag text colour at full opacity, no hover change (matches the product's FA-times anchor) */
.x-wrap { position: relative; display: inline-flex; }
.x { cursor: pointer; color: inherit; font-size: 12px; line-height: 1; outline: none; border-radius: 2px; }
.x:focus-visible { outline: 1.5px solid var(--checkbox-checked-border-color, #6a7fa0); outline-offset: 1px; }
/* confirm-before-remove popover (confirmable) */
.confirm {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 20; display: inline-flex; flex-direction: column; gap: 6px;
  min-width: 132px; padding: 8px 10px; border-radius: 4px; cursor: default;
  background: var(--common-widget-bg, #fff); box-shadow: 0 2px 8px var(--neutral-shadow-light, rgba(0, 0, 0, 0.15));
  font-family: var(--font-family, 'Poppins', sans-serif); font-weight: 400;
}
.confirm-title { font-size: 0.75rem; color: var(--page-text-color, #1d2a3e); white-space: nowrap; }
.confirm-actions { display: inline-flex; gap: 8px; justify-content: flex-end; }
.confirm-yes, .confirm-no { cursor: pointer; font-size: 0.7rem; font-weight: 500; padding: 2px 10px; border-radius: 4px; outline: none; }
.confirm-yes { color: var(--primary-button-text, #fff); background: var(--primary-button-bg, #07101f); }
.confirm-no { color: var(--default-button-text, #1d2a3e); background: var(--default-button-bg, #fff); border: 1px solid var(--default-button-border, #e3e8f2); }
.confirm-yes:focus-visible, .confirm-no:focus-visible { outline: 1.5px solid var(--checkbox-checked-border-color, #6a7fa0); outline-offset: 1px; }
</style>
