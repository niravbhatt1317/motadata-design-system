<script setup>
// <obs-selected-pills> — the teal key:value "selected item" pills from a picker/multi-select
// (maps to SelectedItemPills / DropdownPicker, Tag family). Shows the first `max-items` pills,
// then a "+N" pill that opens a popover listing the rest. Teal = --main-tags-* (input.less).
//
// `value` accepts a CSV string ("a:1,b:2") or a JSON array attribute, or an Array set as a property.
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
  value: { type: [String, Array], default: '' },
  maxItems: { type: Number, default: 1 },
})
const items = computed(() => {
  const v = props.value
  if (Array.isArray(v)) return v.filter(Boolean)
  const s = String(v || '').trim()
  if (!s) return []
  if (s.startsWith('[')) { try { return JSON.parse(s).filter(Boolean) } catch (e) { return [] } }
  return s.split(',').map((x) => x.trim()).filter(Boolean)
})
const label = (it) => (it && typeof it === 'object' ? it.text : it)
const shown = computed(() => items.value.slice(0, props.maxItems))
const rest = computed(() => items.value.slice(props.maxItems))

const open = ref(false)
const root = ref(null)
function toggle() { open.value = !open.value }
function onDocClick(e) { if (root.value && !root.value.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div ref="root" class="pills">
    <span v-for="(it, i) in shown" :key="i" class="pill" :title="label(it)">{{ label(it) }}</span>
    <span v-if="rest.length" class="more">
      <span class="pill more-pill" @click.stop="toggle">+{{ rest.length }}</span>
      <div v-if="open" class="popover">
        <div v-for="(it, i) in rest" :key="i" class="pop-item" :title="label(it)">{{ label(it) }}</div>
      </div>
    </span>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
.pills { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px; font-family: var(--font-family, 'Poppins', sans-serif); }
.pill {
  display: inline-flex; align-items: center; max-width: 220px; box-sizing: border-box;
  padding: 0 7px; border-radius: 4px; line-height: 22px;
  font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 500;
  color: var(--main-tags-text-color, #218b81); background: var(--main-tags-bg-color, #cdf1ed);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.more { position: relative; display: inline-flex; }
.more-pill { cursor: pointer; }
/* matches the real Ant popover (readable-content-overlay picker-overlay): white box, 4px radius,
   soft shadow; list rows in the regular font (Poppins, not monospace) with thin dividers between. */
.popover {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 20; min-width: 160px;
  background: var(--common-widget-bg, #fff); border-radius: 4px;
  box-shadow: 0 2px 8px var(--neutral-shadow-light, rgba(0, 0, 0, 0.15)); padding: 0 14px;
}
.pop-item {
  font-family: var(--font-family, 'Poppins', sans-serif); font-size: 0.8rem;
  color: var(--page-text-color, #1d2a3e); padding: 8px 0; white-space: nowrap;
  border-bottom: 1px solid var(--border-color, #e3e8f2);
}
.pop-item:last-child { border-bottom: none; }
</style>
