<script setup>
// <obs-icon> — the reusable DS icon element. Renders a REAL product icon from the shared library (_icons.js,
// extracted from src/assets/icons/icons.js) by name. Reactive: change `name` and the glyph swaps. `currentColor`
// so it inherits the surrounding text color; size in px (number) or any CSS length. Decorative by default
// (aria-hidden); pass `label` to give it an accessible name (role=img).
//   <obs-icon name="kubernetes" size="24"></obs-icon>   ·   el.name = 'docker'  → icon changes
import { computed } from 'vue'
import { ICONS } from './_icons.js'
const props = defineProps({
  name: { type: String, default: '' },          // icon key from the library (e.g. 'vm', 'docker', 'search')
  size: { type: [String, Number], default: 16 }, // px (number/plain digits) or any CSS length (e.g. '1.2em')
  label: { type: String, default: '' },          // accessible name; empty → decorative (aria-hidden)
})
// Accept both the camelCase key and the kebab name shown on the Assets → Icons page (e.g. 'chevron-double-left').
const toCamel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
const icon = computed(() => ICONS[props.name] || ICONS[toCamel(props.name)] || null)
const px = computed(() => (typeof props.size === 'number' || /^\d*\.?\d+$/.test(String(props.size)) ? `${props.size}px` : String(props.size)))
</script>

<template>
  <svg
    v-if="icon"
    :width="px" :height="px"
    :viewBox="`0 0 ${icon.w} ${icon.h}`"
    fill="currentColor"
    :role="label ? 'img' : null"
    :aria-label="label || null"
    :aria-hidden="label ? null : 'true'"
  ><path :d="icon.p" :fill-rule="icon.fr || null" :clip-rule="icon.fr || null" /></svg>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: inline-flex; line-height: 0; vertical-align: middle; color: inherit; }
svg { display: block; }
</style>
