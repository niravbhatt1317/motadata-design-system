<script setup>
// <obs-input> — DS `input` (MInput). Type router: text/password/number(custom steppers)/search(suffix
// icon)/textarea. Variants: material (bottom-border, 62×) · no-border · prefix/suffix icons · addonBefore/
// addonAfter · allow-clear · error-message. States hover/focus/error use BRAND tokens (focus → --primary,
// error → --secondary-red); disabled = greyed + muted + not-allowed. h32, pad 4px 11px, 0.8rem. Emits `input`.
import { ref, watch, computed, useHost, useId } from 'vue'
const props = defineProps({
  type: { type: String, default: 'text' },
  value: { type: String },
  label: { type: String },        // form-item label above the field (product FlotoFormItem pattern)
  help: { type: String },         // helper/hint text below the field
  placeholder: { type: String },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  errorMessage: { type: String },
  allowClear: { type: Boolean, default: false },
  material: { type: Boolean, default: false },
  noBorder: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  prefixIcon: { type: String },
  suffixIcon: { type: String },
  prefix: { type: String },
  suffix: { type: String },
  addonBefore: { type: String },
  addonAfter: { type: String },
})
const emit = defineEmits(['input', 'change', 'search', 'enterKey'])
// Reflect user input back to the host element's `value` property so `el.value` is READABLE after typing
// (Vue custom-element props are one-way otherwise → el.value stays stale → silent data loss). useHost() gives
// the host; setting host.value round-trips through the prop (watch sets val to the same value → no loop).
const host = useHost()
const fid = useId()  // links <label for> ↔ the field for a11y
// normalise: null/undefined → '' but keep a legit "0"/0 as "0" (don't let `v || ''` blank a real zero value)
const norm = (v) => (v == null ? '' : String(v))
const val = ref(norm(props.value))
watch(() => props.value, (v) => { val.value = norm(v) })
function reflect(v) { val.value = v; if (host) { try { host.value = v } catch (e) { /* readonly host */ } } }
const isArea = computed(() => props.type === 'textarea')
const isNumber = computed(() => props.type === 'number')
const nativeType = computed(() => (props.type === 'password' ? 'password' : props.type === 'number' ? 'number' : 'text'))
const SVG_ICONS = {
  search: '<obs-icon name="search" size="14"></obs-icon>',
  dollar: '<obs-icon name="dollarSign" size="14"></obs-icon>',
}
function icon(name) { return name ? (SVG_ICONS[name] || (String(name).trim().startsWith('<') ? name : '')) : '' }
const preIcon = computed(() => props.prefixIcon || '')
const sufIcon = computed(() => props.suffixIcon || (props.type === 'search' ? 'search' : ''))
const hasAddon = computed(() => !!(props.addonBefore || props.addonAfter))
// The inner <input>'s native `input` event is composed:true → it ESCAPES the shadow root and collides with our
// own emit('input', …). On that native event `e.detail` is 0 (UIEvent default), so any consumer reading e.detail
// gets 0, blanks the field, and shows "0". Stop the native input/change from leaving the shadow DOM so the ONLY
// `input`/`change` a consumer sees is our clean CustomEvent (detail = [value], target.value = the value).
function onInput(e) { if (e) e.stopPropagation(); reflect(e.target.value); emit('input', val.value) }
function onChange(e) { if (e) e.stopPropagation(); emit('change', val.value) } // native `change` (blur/commit) — carries the value
function clear() { reflect(''); emit('input', ''); emit('change', '') }
function onKey(e) { if (e.key === 'Enter') { emit('enterKey', val.value); if (props.type === 'search') emit('search', val.value) } }
function step(d) { if (props.disabled || props.readonly) return; const n = parseFloat(val.value) || 0; reflect(String(n + d)); emit('input', val.value); emit('change', val.value) }
</script>

<template>
  <div class="root" :class="{ block }">
    <label v-if="label" :for="fid" class="lbl">{{ label }}<span v-if="required" class="req" aria-hidden="true"> *</span></label>
    <div class="grp" :class="{ 'has-addon': hasAddon, area: isArea, block }">
      <span v-if="addonBefore" class="seg before">{{ addonBefore }}</span>
      <div class="ip" :class="['t-' + type, { error, disabled, readonly, material, nobord: noBorder }]">
        <span v-if="preIcon" class="adorn pre" aria-hidden="true" v-html="icon(preIcon)"></span>
        <span v-else-if="prefix" class="adorn pre txt">{{ prefix }}</span>
        <textarea
          v-if="isArea" :id="fid" class="field" :value="val" :placeholder="placeholder || ''"
          :disabled="disabled" :readonly="readonly" :required="required" rows="3" @input="onInput" @change="onChange"
        ></textarea>
        <input
          v-else :id="fid" class="field" :type="nativeType" :value="val" :placeholder="placeholder || ''"
          :disabled="disabled" :readonly="readonly" :required="required" @input="onInput" @change="onChange" @keydown="onKey"
        />
        <button v-if="allowClear && val && !isArea && !disabled" class="clear" tabindex="-1" aria-label="Clear" @click="clear">
          <obs-icon name="timesCircle" size="14" aria-hidden="true"></obs-icon>
        </button>
        <span v-if="sufIcon" class="adorn suf" aria-hidden="true" v-html="icon(sufIcon)"></span>
        <span v-else-if="suffix" class="adorn suf txt">{{ suffix }}</span>
        <span v-if="isNumber" class="steppers" aria-hidden="true">
          <button class="stp up" tabindex="-1" @click="step(1)"><obs-icon name="angleUp" size="10" aria-hidden="true"></obs-icon></button>
          <button class="stp down" tabindex="-1" @click="step(-1)"><obs-icon name="angleDown" size="10" aria-hidden="true"></obs-icon></button>
        </span>
      </div>
      <span v-if="addonAfter" class="seg after">{{ addonAfter }}</span>
    </div>
    <div v-if="help && !(error && errorMessage)" class="help">{{ help }}</div>
    <div v-if="error && errorMessage" class="err-msg">{{ errorMessage }}</div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
/* native form controls don't inherit font-family — force Poppins (else they render in the UA font, e.g. Arial) */
button, input, select, textarea { font-family: inherit; }
.root { display: inline-flex; flex-direction: column; gap: 5px; font-family: var(--font-family, 'Poppins', sans-serif); }
.root.block { display: flex; width: 100%; }
/* form-item label — product FlotoFormItem: 0.8rem, secondary text, red required asterisk after */
.lbl { font-size: var(--text-sm, 0.8rem); line-height: 1.5; color: var(--text-color-common-secondary, #7186a8); }
.req { color: var(--secondary-red, #ec5b5b); }
.help { font-size: 12px; line-height: 1.4; color: var(--neutral-light, #8e9fbc); }
.grp { display: inline-flex; align-items: stretch; width: 240px; }
.grp.area { width: 280px; }
/* block / full-width — fill the container (e.g. a form column) instead of the fixed 240px */
.grp.block { display: flex; width: 100%; }
:host([block]) { display: block; width: 100%; }
.ip { position: relative; display: inline-flex; align-items: center; flex: 1; min-width: 0;
  min-height: var(--input-height-base, 32px); padding: 0 11px; border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 4px; background: var(--page-background-color, #fff); transition: border-color 0.15s; box-sizing: border-box; }
.ip.t-textarea { align-items: stretch; padding: 0; }
/* states — brand tokens */
.ip:hover { border-color: var(--neutral-light, #8e9fbc); }
.ip:focus-within { border-color: var(--primary, #111c2c); }
.ip.error, .ip.error:focus-within { border-color: var(--secondary-red, #ec5b5b); }
.ip.disabled { background: var(--neutral-lightest, #ecf1f9); cursor: not-allowed; }
.ip.disabled .field { color: var(--neutral-light, #8e9fbc); cursor: not-allowed; }
.field { flex: 1; min-width: 0; padding: 4px 0; border: none; outline: none; background: transparent;
  font: inherit; font-size: var(--text-sm, 0.8rem); line-height: 19.2px; color: var(--input-text-color, #1d2a3e); resize: vertical; }
.ip.t-textarea .field { padding: 5px 11px; line-height: 1.5; }
.field::placeholder { color: var(--input-placeholder-color, rgba(43, 57, 79, 0.5)); }
.field::-webkit-outer-spin-button, .field::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.field[type=number] { -moz-appearance: textfield; }
/* material + no-border */
.ip.material { border: none; border-bottom: 1px solid var(--border-color, #e3e8f2); border-radius: 0; padding: 0; background: transparent; }
.ip.material:hover { border-bottom-color: var(--neutral-light, #8e9fbc); }
.ip.material:focus-within { border-bottom-color: var(--primary, #111c2c); }
.ip.nobord { border: none; padding: 0; }
/* prefix / suffix adornments */
.adorn { display: inline-flex; align-items: center; flex: 0 0 auto; color: var(--neutral-light, #8e9fbc); }
.adorn obs-icon { display: block; }
.adorn.pre { margin-right: 8px; }
.adorn.suf { margin-left: 8px; }
.adorn.txt { color: var(--neutral-regular, #7186a8); font-size: var(--text-sm, 0.8rem); }
.clear { flex: 0 0 auto; display: inline-flex; margin-left: 6px; padding: 0; border: none; background: none;
  cursor: pointer; color: var(--neutral-light, #8e9fbc); }
.clear:hover { color: var(--page-text-color, #1d2a3e); }
/* number steppers — pinned inside the right edge (absolute), with a divider; text padded to clear them */
.ip.t-number { padding-right: 23px; }
.steppers { position: absolute; top: 0; right: 0; bottom: 0; width: 22px; display: flex; flex-direction: column;
  border-left: 1px solid var(--border-color, #e3e8f2); border-radius: 0 4px 4px 0; overflow: hidden; }
.stp { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0; border: none;
  background: var(--page-background-color, #fff); color: var(--neutral-light, #8e9fbc); cursor: pointer; }
.stp:hover { color: var(--primary, #111c2c); background: var(--neutral-lightest, #ecf1f9); }
.stp.down { border-top: 1px solid var(--border-color, #e3e8f2); }
.stp obs-icon { display: block; }
/* addon segments — borders overlap (-1px) and the focused input raises above them */
.seg { display: inline-flex; align-items: center; flex: 0 0 auto; padding: 0 11px; min-height: var(--input-height-base, 32px);
  background: var(--neutral-lightest, #ecf1f9); border: 1px solid var(--border-color, #e3e8f2);
  color: var(--neutral-regular, #7186a8); font-size: var(--text-sm, 0.8rem); box-sizing: border-box; }
.seg.before { border-radius: 4px 0 0 4px; }
.seg.after { border-radius: 0 4px 4px 0; }
.grp.has-addon .ip { border-radius: 0; margin: 0 -1px; position: relative; }
.grp.has-addon .ip:focus-within { z-index: 2; }
/* error message */
.err-msg { font-size: 12px; color: var(--secondary-red, #ec5b5b); }
</style>
