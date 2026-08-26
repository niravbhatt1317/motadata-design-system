<script setup>
// <obs-menu> — the DS Menu (MMenu primitive + the Context/Action menu, FlotoGridActions). A vertical list of
// selectable icon+label rows with dividers and danger/positive colours. Two modes:
//   • context (default) — a ⋯ (or button) trigger opens a top-layer MMenu of ACTIONS (Edit / Delete …)
//   • inline            — render the list in place (a menu primitive: nav/picker body)
//
//   <obs-menu items='[{"key":"edit","label":"Edit","icon":"pencil"},
//                     {"key":"d1","divider":true},
//                     {"key":"del","label":"Delete","icon":"trash","danger":true}]'></obs-menu>
//
// Menu renders in the top layer (Popover API) so it escapes transform-animated ancestors (e.g. a drawer).
import { ref, computed, nextTick, onBeforeUnmount, useHost } from 'vue'
// icons come from the reusable <obs-icon> element (the DS icon library) — no inlined SVG

const props = defineProps({
  items: { type: [String, Array], default: '' }, // [{key,label,icon?,danger?,positive?,divider?,disabled?,selected?}]
  mode: { type: String, default: 'context' },     // context (⋯/button trigger) | inline (render list in place)
  trigger: { type: String, default: 'dots' },      // dots (⋯) | button — the context trigger style
  bordered: { type: [Boolean, String], default: false }, // give the ⋯ dots trigger a border (a bordered kebab button)
  label: { type: String, default: 'Actions' },     // button-trigger label
  placement: { type: String, default: 'bottom-end' }, // bottom-end (product bottomRight) | bottom-start
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['select', 'show', 'hide'])
const host = useHost()

const off = (v) => v === false || v === 'false'
const parseArr = (v, d = []) => {
  if (Array.isArray(v)) return v
  const s = String(v || '').trim()
  if (!s) return d
  if (s.startsWith('[')) { try { return JSON.parse(s) } catch { return d } }
  return s.split(',').map((x) => ({ key: x.trim(), label: x.trim() })).filter((x) => x.key)
}
const items = computed(() => parseArr(props.items))
const isInline = computed(() => props.mode === 'inline')

const open = ref(false)
const rootRef = ref(null)
const menuRef = ref(null)
const menuPos = ref({})

function onSelect(it) {
  if (it.divider || it.disabled) return
  emit('select', it.key)
  if (host) { try { if (host.value !== String(it.key)) host.value = String(it.key) } catch (e) { /* readonly */ } }
  if (!isInline.value) closeMenu()
}

function positionMenu() {
  nextTick(() => {
    const r = rootRef.value && rootRef.value.getBoundingClientRect()
    if (!r) return
    const endAligned = props.placement !== 'bottom-start'
    const width = 200
    const left = endAligned ? Math.round(r.right - width) : Math.round(r.left)
    menuPos.value = { position: 'fixed', inset: 'auto', margin: '0', left: `${Math.max(8, left)}px`, top: `${Math.round(r.bottom + 4)}px`, minWidth: `${width}px` }
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
  <!-- inline: the menu primitive rendered in place -->
  <div v-if="isInline" ref="rootRef" class="menu inline" role="menu">
    <template v-for="(it, i) in items">
      <div v-if="it.divider" :key="'d' + i" class="mdiv" role="separator"></div>
      <button v-else :key="it.key" type="button" class="mitem" role="menuitem"
        :class="{ danger: it.danger, positive: it.positive, sel: it.selected, dis: it.disabled }"
        :disabled="it.disabled" @click="onSelect(it)">
        <obs-icon v-if="it.icon" class="mico" :name="it.icon" size="15"></obs-icon>
        <span class="mlabel">{{ it.label ?? it.name ?? it.key }}</span>
      </button>
    </template>
  </div>

  <!-- context: a ⋯ / button trigger opening the top-layer MMenu of actions -->
  <div v-else ref="rootRef" class="ctx" :class="{ disabled }">
    <button v-if="trigger === 'button'" type="button" class="btn-trig" :disabled="disabled" @click.stop="toggleMenu">
      <span>{{ label }}</span>
      <obs-icon class="chev" :class="{ up: open }" name="angleDown" size="11"></obs-icon>
    </button>
    <button v-else type="button" class="dots" :class="{ act: open }" :disabled="disabled" aria-label="Actions" @click.stop="toggleMenu">
      <obs-icon name="ellipsisV" size="16"></obs-icon>
    </button>

    <div v-if="open" ref="menuRef" popover="manual" class="menu" :style="menuPos" role="menu">
      <template v-for="(it, i) in items">
        <div v-if="it.divider" :key="'d' + i" class="mdiv" role="separator"></div>
        <button v-else :key="it.key" type="button" class="mitem" role="menuitem"
          :class="{ danger: it.danger, positive: it.positive, sel: it.selected, dis: it.disabled }"
          :disabled="it.disabled" @click="onSelect(it)">
          <obs-icon v-if="it.icon" class="mico" :name="it.icon" size="15"></obs-icon>
          <span class="mlabel">{{ it.label ?? it.name ?? it.key }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { font-family: var(--font-family, 'Poppins', sans-serif); }
.ctx { display: inline-block; }
.ctx.disabled { opacity: .5; pointer-events: none; }

/* ⋯ dots trigger */
.dots { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0;
  border: 0; border-radius: 4px; background: transparent; color: var(--neutral-regular, #7186a8); cursor: pointer; }
.dots:hover, .dots.act { background: var(--neutral-lighter, #e3e8f2); color: var(--page-text-color, #1d2a3e); }
/* bordered kebab (e.g. the bulk-bar "More") — a bordered icon button like the adjacent actions */
:host([bordered]) .dots { width: 34px; height: 34px; border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px; }
:host([bordered]) .dots:hover, :host([bordered]) .dots.act { background: var(--neutral-lightest, #ecf1f9); }

/* button trigger */
.btn-trig { display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 12px;
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; background: var(--page-background-color, #fff);
  color: var(--page-text-color, #1d2a3e); font-size: 0.8rem; cursor: pointer; }
.btn-trig .chev { color: var(--neutral-light, #6a7fa0); transition: transform .15s; }
.btn-trig .chev.up { transform: rotate(180deg); }

/* menu surface — shared by inline + popover */
.menu { padding: 6px; background: var(--page-background-color, #fff); border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 6px; box-shadow: 0 6px 20px var(--neutral-shadow-light, rgba(29, 42, 62, .12)); }
.menu[popover] { border: 1px solid var(--border-color, #e3e8f2); margin: 0; inset: auto; overflow: visible; }
.menu.inline { display: inline-block; min-width: 200px; }

/* rows */
.mitem { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border: 0; border-radius: 4px;
  background: transparent; color: var(--page-text-color, #1d2a3e); font-size: 0.8rem; text-align: left; cursor: pointer; }
.mitem:hover { background: var(--neutral-lighter, #e3e8f2); }
.mitem.sel { background: var(--code-tag-background-color, #eaf1fb); color: var(--primary, #111c2c); font-weight: 600; }
.mitem.danger { color: var(--secondary-red, #ec5b5b); }
.mitem.positive { color: var(--secondary-green, #1aae9f); }
.mitem.dis { color: var(--neutral-light, #98a7bf); cursor: not-allowed; }
.mitem.dis:hover { background: transparent; }
.mico { flex: 0 0 auto; }
.mlabel { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mdiv { height: 1px; margin: 6px 4px; background: var(--border-color, #e3e8f2); }
</style>
