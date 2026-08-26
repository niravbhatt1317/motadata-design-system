<script setup>
// <obs-switch> — maps to the DS `switch` registry. Track stays light (--switch-bg + border) in BOTH
// states; the KNOB turns green (#14b053) when on, grey-blue when off (per form.less + input.less).
// Optional inner on/off labels (Ant checkedChildren / unCheckedChildren — registry `checked`/`unchecked`
// slots) exposed as the `checked-text` / `unchecked-text` attributes for reliable web-component use, e.g.
// <obs-switch checked checked-text="ON" unchecked-text="OFF">. (Avoid an `on*` prop name — Vue treats it
// as an event listener, not a prop.)
import { ref, watch, computed, useHost } from 'vue'
const props = defineProps({
  checked: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  checkedText: { type: String },
  uncheckedText: { type: String },
})
const emit = defineEmits(['change'])
const host = useHost()
const labelled = computed(() => !!(props.checkedText || props.uncheckedText))
const on = ref(props.checked)
watch(() => props.checked, (v) => { on.value = v })
function toggle() {
  if (props.disabled || props.loading) return
  on.value = !on.value
  if (host) { try { host.checked = on.value } catch (e) { /* readonly host */ } } // reflect so el.checked is readable
  emit('change', on.value)
}
</script>

<template>
  <button
    class="sw"
    :class="['s-' + size, { on, disabled, loading, labelled }]"
    role="switch"
    :aria-checked="on"
    :disabled="disabled || loading"
    @click="toggle"
  >
    <span v-if="labelled" class="inner">{{ on ? checkedText : uncheckedText }}</span>
    <span class="knob"><span v-if="loading" class="spin" aria-hidden="true"></span></span>
  </button>
</template>

<style>
:host([hidden]) { display: none !important; }
/* native form controls don't inherit font-family — force Poppins (else they render in the UA font, e.g. Arial) */
button, input, select, textarea { font-family: inherit; }
.sw { position: relative; width: 44px; height: 22px; border-radius: 100px; cursor: pointer; padding: 0;
  background: var(--switch-bg, #fff); border: 1px solid var(--switch-border, #e3e8f2); transition: border-color 0.15s; }
.sw.s-small { width: 28px; height: 16px; }
.sw.disabled { opacity: 0.5; cursor: not-allowed; }
.knob { position: absolute; top: 1px; left: 1px; width: 18px; height: 18px; border-radius: 50%;
  background: var(--switch-knob-off-bg, #a9b8d0); box-shadow: 0 1px 2px var(--neutral-shadow-light, rgba(0,0,0,0.12)); transition: transform 0.15s, background 0.15s; }
.sw.on .knob { background: var(--switch-knob-on-bg, var(--secondary-green, #14b053)); }
.sw.s-small .knob { width: 12px; height: 12px; }
.sw.on .knob { transform: translateX(22px); }
.sw.s-small.on .knob { transform: translateX(12px); }
.sw.loading { opacity: 0.7; cursor: default; }
.knob .spin { position: absolute; top: 50%; left: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px;
  border: 1.5px solid var(--white-regular, #fff); border-right-color: transparent; border-radius: 50%; animation: obsswspin 0.7s linear infinite; }
@keyframes obsswspin { to { transform: rotate(360deg); } }

/* ---- inner on/off label variant (checkedChildren / unCheckedChildren) ---- */
.sw.labelled { width: auto; min-width: 52px; height: 22px; padding: 0 3px;
  display: inline-flex; align-items: center; justify-content: space-between; gap: 4px; }
.sw.labelled .knob { position: static; transform: none !important; flex: 0 0 auto; }
.sw.labelled.on .inner { order: 1; }
.sw.labelled.on .knob { order: 2; }
.sw.labelled:not(.on) .knob { order: 1; }
.sw.labelled:not(.on) .inner { order: 2; }
.inner { font-size: 10px; font-weight: 500; line-height: 1; padding: 0 5px; white-space: nowrap;
  color: var(--neutral-light, #a5bad0); }
</style>
