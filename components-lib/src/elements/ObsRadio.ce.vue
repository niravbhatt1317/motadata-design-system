<script setup>
// <obs-radio> — DS `radio` (MRadioGroup). One-of-many selection. `list` = dot + label (cyan dot when
// checked); `as-button` = segmented joined buttons (navy fill when selected); `severity` = borderless
// segments with separators + a navy chip (severity-switch). `options` is a JSON string of
// {value,label,disabled?,icon?} (icon = inline SVG) or plain comma labels. Emits `change` with the value.
import { ref, watch, computed, useHost } from 'vue'
const svg = (k) => `<obs-icon name="${k}" size="14"></obs-icon>`
const props = defineProps({
  options: { type: [String, Array] }, // comma string, JSON string, OR a real JS array (el.options = [...])
  value: { type: String },
  asButton: { type: Boolean, default: false },
  severity: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false },
  block: { type: Boolean, default: false }, // full-width segmented control — segments split the width evenly
})
const emit = defineEmits(['change'])
const host = useHost()
const sel = ref(props.value || '')
watch(() => props.value, (v) => { sel.value = v || '' })
const segmented = computed(() => props.asButton || props.severity)
const items = computed(() => {
  let raw = []
  if (Array.isArray(props.options)) raw = props.options // a real JS array set as a property
  else {
    const s = (props.options || '').trim()
    if (s.startsWith('[')) { try { raw = JSON.parse(s) } catch { raw = [] } } // JSON for {value,label,disabled,icon}
    else if (s) raw = s.split(',').map((x) => x.trim()).filter(Boolean) // simple comma-separated labels
  }
  return raw.map((o) => {
    if (typeof o === 'string') return { value: o, label: o }
    // accept any option shape: {value|key, label|text|name} (see G5)
    if (o && o.value == null && o.key == null && o.label == null && o.text == null && o.name == null)
      try { console.warn('obs-radio: unrecognised option shape', o, '— expected {value|key, label|text}') } catch (e) {}
    const value = o.value ?? o.key
    return { value, label: o.label ?? o.text ?? o.name ?? value, disabled: !!o.disabled, icon: o.icon }
  })
})
function pick(o) {
  if (props.disabled || o.disabled) return
  sel.value = o.value
  if (host) { try { host.value = o.value } catch (e) { /* readonly host */ } } // reflect so el.value is readable
  emit('change', o.value)
}
// built-in icon keywords → real product icons (from _icons.js) for the segmented-with-icons variant; raw SVG also allowed
const ICONS = {
  grid: svg('grid'),
  list: svg('list'),
  map: svg('mapMarker'),
}
function iconFor(name) { return name ? (ICONS[name] || (String(name).trim().startsWith('<') ? name : '')) : '' }
</script>

<template>
  <div class="rg" :class="[segmented ? 'seg' : 'list', 's-' + size, { disabled, vertical, sev: severity, block }]" role="radiogroup">
    <label
      v-for="o in items" :key="o.value" class="opt"
      :class="{ on: sel === o.value, dis: o.disabled || disabled }"
      role="radio" :aria-checked="sel === o.value" @click="pick(o)"
    >
      <span v-if="!segmented" class="dot" aria-hidden="true"></span>
      <span v-if="o.icon" class="ic" aria-hidden="true" v-html="iconFor(o.icon)"></span>
      <span class="txt">{{ o.label }}</span>
    </label>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
.rg { display: inline-flex; font-family: var(--font-family, 'Poppins', sans-serif);
  font-size: var(--text-sm, 0.8rem); color: var(--page-text-color, #1d2a3e); }
/* ---- list (dot + label) — exact values from the rendered Ant radio ---- */
.rg.list { align-items: center; gap: 8px; }
.rg.list.vertical { flex-direction: column; align-items: flex-start; gap: 10px; }
.rg.list .opt { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.dot { position: relative; flex: 0 0 auto; width: 16px; height: 16px; border-radius: 50%; box-sizing: border-box;
  border: 1px solid var(--border-color, #e3e8f2); background: var(--checkbox-bg, #fff); transition: border-color 0.15s; }
/* brand primary (dark navy) for checked + hover — DS choice over Ant's cyan form-accent */
.rg.list .opt:hover .dot { border-color: var(--primary, #111c2c); }
.rg.list .opt.on .dot { border-color: var(--primary, #111c2c); }
.rg.list .opt.on .dot::after { content: ''; position: absolute; inset: 0; margin: auto; width: 8px; height: 8px;
  border-radius: 50%; background: var(--primary, #111c2c); }
.rg.list .opt.dis { opacity: 0.5; cursor: not-allowed; }
/* ---- segmented (as-button) — border uses --border-color (the product's; the radio-box token is blue in dark) ---- */
.rg.seg { border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; overflow: hidden; }
.rg.seg .opt { display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 11px;
  cursor: pointer; user-select: none; background: var(--radio-btn-box-bg, #fff); color: var(--neutral-regular, #7186a8);
  border-left: 1px solid var(--border-color, #e3e8f2); transition: background 0.12s, color 0.12s; }
.rg.seg .opt:first-child { border-left: none; }
/* block = full-width segmented control: the group fills its container, segments split the width evenly */
.rg.block { display: flex; width: 100%; }
.rg.seg.block .opt { flex: 1; padding-left: 0; padding-right: 0; }
.rg.seg .opt.on { background: var(--radio-btn-box-selected-bg, #111c2c); color: var(--radio-btn-box-selected-text-color, #fff); }
.rg.seg.s-small .opt { height: 24px; padding: 0 8px; }
.rg.seg.s-large .opt { height: 38px; padding: 0 14px; }
.rg.seg .opt.dis { opacity: 0.5; cursor: not-allowed; }
.rg.disabled { opacity: 0.65; }
/* per-option icon (inline SVG before the label) */
.rg.seg .ic { display: inline-flex; align-items: center; margin-right: 6px; }
.ic obs-icon { display: block; }
/* ---- severity switch: borderless segments + thin separators + navy selected chip ---- */
.rg.sev { border: none; border-radius: 0; overflow: visible; }
.rg.sev .opt { position: relative; height: 32px; padding: 0 11px; border-left: none; background: transparent;
  color: var(--neutral-regular, #7186a8); border-radius: 4px; }
.rg.sev .opt + .opt::before { content: ''; position: absolute; left: 0; top: 8px; bottom: 8px; width: 1px; background: var(--border-color, #e3e8f2); }
.rg.sev .opt.on { background: var(--radio-btn-box-selected-bg, #111c2c); color: var(--radio-btn-box-selected-text-color, #fff); }
.rg.sev .opt.on::before, .rg.sev .opt.on + .opt::before { display: none; }
</style>
