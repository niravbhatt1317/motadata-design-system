<script setup>
// <obs-color-picker> — the DS colour picker (color-picker.vue). A 20×20 swatch preview + chevron trigger opening
// a top-layer popover with a 16-colour preset palette + a custom-colour canvas (native colour input here; the
// product uses vue-color Sketch) + a hex readout. Supports `transparent` (a swatch with a red diagonal line).
// Used for branding, widget series, threshold/severity and dashboard-background colour selection.
//
//   <obs-color-picker value="#0D9488"></obs-color-picker>
//   <obs-color-picker value="transparent" allow-transparent></obs-color-picker>
//
// Menu renders in the top layer (Popover API) so it escapes transform-animated ancestors (e.g. a drawer).
import { ref, computed, watch, nextTick, onBeforeUnmount, useHost } from 'vue'
// icons come from the reusable <obs-icon> element (the DS icon library) — no inlined SVG

// the product's 16 preset colours (color-picker.vue presetColors)
const DEFAULT_PRESETS = ['#0D9488', '#F97316', '#9333EA', '#65A30D', '#DB2777', '#0891B2', '#CA8A04', '#EF4444',
  '#059669', '#C026D3', '#F59E0B', '#7C3AED', '#EA580C', '#14B8A6', '#E11D48', '#84CC16']

const props = defineProps({
  value: { type: String, default: '#0D9488' },       // hex or 'transparent'
  presets: { type: [String, Array], default: '' },    // override the 16-colour palette (JSON/array/comma)
  allowTransparent: { type: [Boolean, String], default: false }, // offer a no-fill (transparent) option
  hideArrow: { type: [Boolean, String], default: false },        // hide the chevron next to the swatch
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['change', 'show', 'hide'])
const host = useHost()

const on = (v) => v === true || v === '' || v === 'true'
const parseArr = (v, d) => {
  if (Array.isArray(v)) return v
  const s = String(v || '').trim()
  if (!s) return d
  if (s.startsWith('[')) { try { return JSON.parse(s) } catch { return d } }
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}
const palette = computed(() => parseArr(props.presets, DEFAULT_PRESETS))
const showArrow = computed(() => !on(props.hideArrow))
const canTransparent = computed(() => on(props.allowTransparent))

const current = ref(props.value)
watch(() => props.value, (v) => { current.value = v })
const isTransparent = computed(() => String(current.value).toLowerCase() === 'transparent')
// native <input type=color> needs a hex; fall back for transparent/named values
const hexForInput = computed(() => (/^#[0-9a-fA-F]{6}$/.test(current.value) ? current.value : '#0D9488'))

const open = ref(false)
const rootRef = ref(null)
const menuRef = ref(null)
const menuPos = ref({})

function pick(c) {
  current.value = c
  if (host) { try { if (host.value !== String(c)) host.value = String(c) } catch (e) { /* readonly */ } }
  emit('change', c)
}
function onNative(e) { pick(e.target.value) }

function positionMenu() {
  nextTick(() => {
    const r = rootRef.value && rootRef.value.getBoundingClientRect()
    if (!r) return
    menuPos.value = { position: 'fixed', inset: 'auto', margin: '0', left: `${Math.round(r.left)}px`, top: `${Math.round(r.bottom + 6)}px` }
    const m = menuRef.value
    if (m && m.showPopover) { try { m.showPopover() } catch (e) { /* already open */ } }
  })
}
function openMenu() { if (props.disabled) return; open.value = true; emit('show'); positionMenu() }
function closeMenu() { if (!open.value) return; open.value = false; const m = menuRef.value; if (m && m.hidePopover) { try { m.hidePopover() } catch (e) {} } emit('hide') }
function toggleMenu() { open.value ? closeMenu() : openMenu() }
function onDocClick(e) { if (!open.value) return; const p = e.composedPath ? e.composedPath() : []; if (p.includes(rootRef.value) || p.includes(menuRef.value)) return; closeMenu() }
if (typeof document !== 'undefined') document.addEventListener('click', onDocClick, true)
onBeforeUnmount(() => { if (typeof document !== 'undefined') document.removeEventListener('click', onDocClick, true) })
</script>

<template>
  <div ref="rootRef" class="cp" :class="{ disabled }">
    <!-- trigger: 20×20 swatch + chevron -->
    <button type="button" class="trig" :disabled="disabled" @click.stop="toggleMenu">
      <span class="swatch" :class="{ tr: isTransparent }" :style="isTransparent ? {} : { background: current }" aria-hidden="true">
        <span v-if="isTransparent" class="diag"></span>
      </span>
      <obs-icon v-if="showArrow" class="chev" :class="{ up: open }" name="angleDown" size="10"></obs-icon>
    </button>

    <!-- popover: preset palette + custom + hex (top layer) -->
    <div v-if="open" ref="menuRef" popover="manual" class="pop" :style="menuPos">
      <div class="lbl">PRESETS</div>
      <div class="grid">
        <span v-for="c in palette" :key="c" class="cell" :class="{ on: current === c }" :style="{ background: c }" :title="c" @click="pick(c)"></span>
      </div>
      <div class="row">
        <label class="custom">
          <span class="ci" :style="{ background: hexForInput }"></span>
          <span>Custom</span>
          <input type="color" :value="hexForInput" @input.stop="onNative" />
        </label>
        <span v-if="canTransparent" class="tropt" :class="{ on: isTransparent }" @click="pick('transparent')">
          <span class="swatch tr"><span class="diag"></span></span>Transparent
        </span>
      </div>
      <div class="hex">
        <span class="hash">#</span>
        <span class="val">{{ current }}</span>
      </div>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { font-family: var(--font-family, 'Poppins', sans-serif); }
.cp { display: inline-block; }
.cp.disabled { opacity: .5; pointer-events: none; }

/* trigger */
.trig { display: inline-flex; align-items: center; gap: 8px; padding: 4px 6px; border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 4px; background: var(--page-background-color, #fff); cursor: pointer; }
.swatch { width: 20px; height: 20px; border-radius: 2px; border: 1px solid var(--border-color, #e3e8f2);
  display: inline-flex; align-items: center; justify-content: center; overflow: hidden; flex: 0 0 auto; }
.swatch.tr { background: var(--page-background-color, #fff); position: relative; }
.diag { width: 1px; height: 26px; background: var(--secondary-red, #ec5b5b); transform: rotate(135deg); }
.chev { color: var(--neutral-light, #6a7fa0); transition: transform .15s; }
.chev.up { transform: rotate(180deg); }

/* popover */
.pop[popover] { width: 236px; padding: 12px; margin: 0; inset: auto; overflow: visible; border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 8px; background: var(--dropdown-background, var(--page-background-color, #fff));
  box-shadow: 0 6px 20px var(--neutral-shadow-light, rgba(29, 42, 62, .12)); color: var(--page-text-color, #1d2a3e); }
.lbl { font-size: 11px; letter-spacing: .3px; color: var(--neutral-light, #6a7fa0); margin-bottom: 8px; font-weight: 600; }
.grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; }
.cell { width: 20px; height: 20px; border-radius: 3px; cursor: pointer; box-sizing: border-box; }
.cell.on { outline: 2px solid var(--primary, #111c2c); outline-offset: 1px; }
.row { display: flex; align-items: center; gap: 14px; margin-top: 12px; font-size: 0.8rem; }
.custom { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; position: relative; }
.custom input[type=color] { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.ci { width: 18px; height: 18px; border-radius: 3px; border: 1px solid var(--border-color, #e3e8f2); }
.tropt { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; }
.tropt.on, .custom.on { color: var(--primary, #111c2c); }
.tropt .swatch { width: 18px; height: 18px; }
.hex { display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 12px; }
.hash { width: 18px; height: 18px; border-radius: 3px; background: var(--code-tag-background-color, #eaf1fb);
  display: inline-flex; align-items: center; justify-content: center; color: var(--neutral-light, #6a7fa0); font-size: 11px; }
.val { font-family: 'JetBrains Mono', monospace; }
</style>
