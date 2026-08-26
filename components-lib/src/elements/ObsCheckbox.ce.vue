<script setup>
// <obs-checkbox> — maps to the DS `checkbox` registry. Checked fill = the Ant cyan form-control
// accent (--primary-color), matching the product. Emits a `change` CustomEvent (detail = new value).
import { ref, watch, useHost } from 'vue'
const props = defineProps({
  checked: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
  value: { type: String, default: '' }, // passthrough id for grouping — readable via e.target.value
})
const emit = defineEmits(['change'])
const host = useHost()
const on = ref(props.checked)
watch(() => props.checked, (v) => { on.value = v })
function toggle() {
  if (props.disabled) return
  on.value = !on.value
  // reflect so el.checked is readable after a click (was stale before). For a checkbox GROUP, the listener
  // reads e.target.checked + e.target.value (the passthrough id) to know which box fired.
  if (host) { try { host.checked = on.value } catch (e) { /* readonly host */ } }
  emit('change', on.value)
}
function onKey(e) {
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle() }
}
</script>

<template>
  <label class="cb" :class="{ disabled }" :tabindex="disabled ? -1 : 0" role="checkbox" :aria-checked="indeterminate ? 'mixed' : on" @click="toggle" @keydown="onKey">
    <span class="box" :class="{ on: on && !indeterminate, ind: indeterminate }">
      <span v-if="on && !indeterminate" class="tick"></span>
      <span v-else-if="indeterminate" class="sq"></span>
    </span>
    <span class="lbl"><slot /></span>
  </label>
</template>

<style>
:host([hidden]) { display: none !important; }
.cb { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-family: var(--font-family, 'Poppins', sans-serif); font-size: var(--text-sm, 0.8rem); color: var(--page-text-color, #1d2a3e); user-select: none; outline: none; }
.cb.disabled { opacity: 0.5; cursor: not-allowed; }
/* tick/square are absolutely positioned so the box has no in-flow content — its baseline (and the
   component's vertical position) stays identical whether checked or not, preventing a layout jump. */
.box { position: relative; width: 19px; height: 19px; border: 1.5px solid var(--neutral-lighter, #e3e8f2); border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box; background: var(--checkbox-bg, #fff); }
/* hover + keyboard focus both darken the border to the checked blue-grey (checkbox.less) */
.cb:hover .box, .cb:focus-visible .box { border-color: var(--checkbox-checked-border-color, #6a7fa0); }
.box.on { background: var(--checkbox-bg, #fff); border-color: var(--checkbox-checked-border-color, #6a7fa0); }
.tick { position: absolute; top: 50%; left: 50%; width: 4px; height: 9px; border: solid var(--primary, #111c2c); border-width: 0 2px 2px 0; transform: translate(-50%, -60%) rotate(45deg); }
/* indeterminate: primary-alt border + filled square (was Ant's cyan #1890ff) */
.box.ind { border-color: var(--primary-alt, #3279be); }
.sq { position: absolute; top: 50%; left: 50%; width: 8px; height: 8px; border-radius: 1px; transform: translate(-50%, -50%); background: var(--primary-alt, #3279be); }
</style>
