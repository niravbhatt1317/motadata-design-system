<script setup>
// <obs-breadcrumbs> — the location TRAIL (+ optional back chevron): a path of crumbs (Reports / Compliance /
// PCI-DSS Audit) with the current (last) crumb in weight 500 and the ancestors as muted links. The smallest way to
// show "where am I + a click up one/many levels." Data-driven `items`; separator is `/` (default) or a chevron.
// Sits in a page header (obs-page-header has a `breadcrumb` slot). NOT module switching (obs-sidebar), NOT sibling
// views (obs-tabs), and NOT a graph-expansion trail. Values from the rendered Navigation/Breadcrumb story +
// compliance-breadcrumb.vue (padding 8px 0, border-bottom --border-color, gap 6px, 13px, current weight 500).
//
//   <obs-breadcrumbs back items='["Reports","Compliance","PCI-DSS Audit"]'></obs-breadcrumbs>
//   <obs-breadcrumbs separator="chevron" items='[{"label":"Home","href":"/"},{"label":"Monitors"}]'></obs-breadcrumbs>
import { computed, useHost } from 'vue'
const props = defineProps({
  items: { type: [String, Array], default: '' },     // JSON ["A","B"] or [{label,href?}]; or a "A / B / C" string
  separator: { type: String, default: '/' },          // the divider between crumbs: any text, or 'chevron' for ›
  back: { type: [Boolean, String], default: false },  // show a leading back chevron (emits `back`)
  divider: { type: [Boolean, String], default: false }, // a bottom rule under the trail (page-header context)
})
const emit = defineEmits(['navigate', 'back'])
const host = useHost()
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const chevronSep = computed(() => props.separator === 'chevron')
const crumbs = computed(() => {
  const raw = props.items
  let arr
  if (Array.isArray(raw)) arr = raw
  else { const s = String(raw || '').trim(); arr = s[0] === '[' ? JSON.parse(s) : (s ? s.split(chevronSep.value ? /\s*[/›>]\s*/ : props.separator).map((x) => x.trim()).filter(Boolean) : []) }
  return arr.map((c) => (typeof c === 'string' ? { label: c, href: '' } : { label: c.label ?? '', href: c.href ?? '' }))
})
const go = (c, i, e) => { if (!c.href) e.preventDefault(); emit('navigate', { label: c.label, href: c.href, index: i }) }
const onBack = () => { if (host) host.dispatchEvent(new CustomEvent('back', { bubbles: true, composed: true })) }
</script>

<template>
  <nav class="bc" :class="{ divider: on(divider) }" aria-label="Breadcrumb">
    <button v-if="on(back)" class="back" type="button" aria-label="Back" @click="onBack">
      <obs-icon name="chevronLeft" size="16"></obs-icon>
    </button>
    <ol class="trail">
      <li v-for="(c, i) in crumbs" :key="i" class="crumb">
        <a v-if="i < crumbs.length - 1" class="link" :href="c.href || '#'" @click="go(c, i, $event)">{{ c.label }}</a>
        <span v-else class="current" aria-current="page">{{ c.label }}</span>
        <span v-if="i < crumbs.length - 1" class="sep" aria-hidden="true">
          <obs-icon v-if="chevronSep" name="chevronRight" size="10"></obs-icon>
          <template v-else>{{ separator }}</template>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; }
.bc { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--page-text-color, #1d2a3e); min-width: 0; }
.bc.divider { padding: 8px 0; border-bottom: 1px solid var(--border-color, #e3e8f2); }
/* leading back chevron */
.back { appearance: none; background: none; border: 0; padding: 0; display: inline-flex; align-items: center; cursor: pointer; color: var(--neutral-light, #6a7fa0); flex-shrink: 0; }
.back:hover { color: var(--page-text-color, #1d2a3e); }
/* the trail */
.trail { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; min-width: 0; }
.crumb { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.link { color: var(--neutral-light, #6a7fa0); text-decoration: none; cursor: pointer; white-space: nowrap; }
.link:hover { color: var(--primary-alt, #1d2a3e); text-decoration: underline; }
.current { font-weight: 500; color: var(--page-text-color, #1d2a3e); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sep { display: inline-flex; align-items: center; color: var(--neutral-light, #6a7fa0); }
</style>
