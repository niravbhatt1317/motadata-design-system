<script setup>
// <obs-sidebar> — the product's PRIMARY navigation: the left vertical MODULE rail (FlotoNavBar / layout/navbar.vue).
// Collapsed to 65px (logo mark + module icons) by default; HOVER-expands to 170px (logo + wordmark + labels), or
// pin it open with `expanded`. The expansion OVERLAYS the page (the host reserves only the 65px rail in flow) —
// it never widens/squeezes the content beside it. Data-driven module list (icon + label, optional BETA tag). Pixel-matched to the
// product (src/design/nav.less + navbar.vue): item height 40px, padding-left 17px (expanded) / centred (collapsed),
// radius 6px; ACTIVE = --primary-alt on --nav-selected-text-color; HOVER = --nav-hover-bg; logo row = header-height
// - 2 (53px); the decorative mask-group blobs sit bottom-right. Theme-aware (--nav-panel-bg / --nav-text-color).
// Pairs with obs-app-header. NOT an in-module section menu and NOT sibling-view switching (obs-tabs).
//
//   <obs-sidebar active="inventory" items='[{"key":"dashboard","label":"Dashboards","icon":"dashboard"}, …]'>
//     <img slot="logo" src="motadata.png" />   <!-- optional: real logo image (else a recreated donut mark) -->
//   </obs-sidebar>
import { computed, ref, useHost } from 'vue'
const props = defineProps({
  items: { type: [String, Array], default: '' },        // JSON [{key,label,icon,beta?}] → the module list
  active: { type: String, default: '' },                 // the active module key (highlighted --primary-alt)
  brand: { type: String, default: 'ObserveOps' },        // wordmark text shown when expanded
  expanded: { type: [Boolean, String], default: false }, // pin the rail open (otherwise it hover-expands)
})
const emit = defineEmits(['navigate'])
const host = useHost()
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const hovering = ref(false)
const isExpanded = computed(() => on(props.expanded) || hovering.value)
const navItems = computed(() => {
  const raw = props.items
  const arr = Array.isArray(raw) ? raw : (String(raw || '').trim()[0] === '[' ? JSON.parse(String(raw)) : [])
  return arr.map((m, i) => ({ key: m.key ?? String(i), label: m.label ?? m.key ?? '', icon: m.icon ?? '', beta: m.beta === true || m.beta === 'true' }))
})
const go = (m) => emit('navigate', { key: m.key, label: m.label })
</script>

<template>
  <nav class="sb" :class="{ expanded: isExpanded }" aria-label="Primary" @mouseenter="hovering = true" @mouseleave="hovering = false">
    <a class="logo" href="#" @click.prevent>
      <span class="mark">
        <!-- default mark: the real Motadata donut from the logo library (obs-logo) — override via slot="logo" -->
        <slot name="logo">
          <obs-logo name="motadata" size="30" class="mk"></obs-logo>
        </slot>
      </span>
      <span v-show="isExpanded" class="name">{{ brand }}</span>
    </a>
    <div class="items">
      <a v-for="m in navItems" :key="m.key" class="item" :class="{ active: m.key === active }" href="#"
        :aria-current="m.key === active ? 'page' : null" @click.prevent="go(m)">
        <obs-icon :name="m.icon" size="21.5" class="ic"></obs-icon>
        <span v-show="isExpanded" class="lbl">{{ m.label }}<span v-if="m.beta" class="beta">BETA</span></span>
      </a>
    </div>
    <!-- decorative product "Mask Group" (bottom-right, clipped by the rail): two gradient circles — a large
         green→blue circle + a small yellow→orange circle. The real product SVG (data-* markers stripped). -->
    <svg class="blobs" aria-hidden="true" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-53)">
        <g transform="matrix(1,0,0,1,53,0)">
          <linearGradient id="obs-nav-blob-a" gradientUnits="userSpaceOnUse" x1="-297.2444" y1="394.3487" x2="-295.9104" y2="393.0217" gradientTransform="matrix(148 0 0 -148 44002 58346)"><stop offset="0" stop-color="rgb(137,197,64)"></stop><stop offset="1" stop-color="rgb(9,157,217)"></stop></linearGradient>
          <circle cx="118" cy="90" r="74" fill="url(#obs-nav-blob-a)" opacity="0.5"></circle>
        </g>
        <g transform="matrix(1,0,0,1,53,0)">
          <linearGradient id="obs-nav-blob-b" gradientUnits="userSpaceOnUse" x1="-294.9074" y1="399.1977" x2="-293.5734" y2="397.8707" gradientTransform="matrix(68 0 0 -68 20046 27214)"><stop offset="0" stop-color="rgb(245,188,24)"></stop><stop offset="1" stop-color="rgb(245,133,24)"></stop></linearGradient>
          <circle cx="65" cy="50" r="34" fill="url(#obs-nav-blob-b)" opacity="0.5"></circle>
        </g>
      </g>
    </svg>
  </nav>
</template>

<style>
:host([hidden]) { display: none !important; }
/* The host reserves ONLY the collapsed rail width (65px) in the page flow and never grows — so hover/pin
   expansion overlays the page ON TOP (never squeezes/reflows content). The inner .sb is absolutely
   positioned inside the fixed-width host, so widening it to 170px overflows to the right over the content.
   z-index keeps the expanded panel above the page. */
:host { display: inline-block; position: relative; flex: 0 0 auto; width: 65px; height: 100%; z-index: 40; }
.sb {
  position: absolute; top: 0; left: 0; box-sizing: border-box; display: flex; flex-direction: column;
  width: 65px; height: 100%; min-height: var(--sidebar-min-height, 620px); padding-top: 4px;
  background: var(--nav-panel-bg, #f6f9fc); color: var(--nav-text-color, #1d2a3e);
  border-right: 1px solid var(--border-color, #e3e8f2);   /* the rail is 64px content + this 1px divider = 65px total (box-border) */
  box-shadow: 2px 0 8px var(--nav-shadow-color, rgba(70, 70, 70, 0.08)); transition: width 0.15s; overflow: hidden;
}
.sb.expanded { width: 170px; }
/* logo row — the mark (+ wordmark when expanded); height = header-height − 2. The mark is centred on the SAME
   vertical axis as the module icons below it: icon centre = 8 margin + 17 pad + 11 (half of 22) = 36px; a 30px mark
   at padding-left 13 centres at 8 + 13 + 15 = 36px. (product: logo 30×30, module icons ~22.) */
.logo { position: relative; z-index: 1; display: flex; align-items: center; height: 53px; margin: 0 8px 0; padding-left: 13px; gap: 10px; text-decoration: none; color: inherit; white-space: nowrap; flex-shrink: 0; }
.sb:not(.expanded) .logo { justify-content: center; padding-left: 0; }
.mark { display: inline-flex; align-items: center; flex-shrink: 0; }
.mark .mk { width: 30px; height: 30px; display: block; }
.mark ::slotted(img) { width: 30px; height: 30px; display: block; }
.name { font-size: 13px; font-weight: normal; color: var(--page-text-color, #1d2a3e); }
/* module list — sits ABOVE the decorative blobs */
.items { position: relative; z-index: 1; display: flex; flex-direction: column; flex: 1; min-height: 0; }
.item { display: flex; align-items: center; height: 40px; margin: 0 8px 4px; padding-left: 17px; gap: 14px; border-radius: 6px; text-decoration: none; white-space: nowrap; color: var(--nav-text-color, #1d2a3e); flex-shrink: 0; cursor: pointer; }
.sb:not(.expanded) .item { justify-content: center; padding-left: 0; gap: 0; }
.item:hover:not(.active) { background: var(--nav-hover-bg, #ecf1f9); }
.item.active { background: var(--primary-alt, #1d2a3e); color: var(--nav-selected-text-color, #f6f9fc); }
.ic { flex-shrink: 0; }
.lbl { display: inline-flex; align-items: center; font-size: 13px; gap: 8px; }
.beta { font-size: 9px; padding: 2px 7px; border-radius: 5px; background: var(--code-tag-background-color, #ecf1f9); color: var(--nav-text-color, #1d2a3e); letter-spacing: 0.5px; }
/* decorative blobs — clipped to the panel's bottom-right, BEHIND the menu items (z-index 0). The product's real
   "Mask Group" SVG (src/components/layout/mask-group.vue): a big green→blue circle + a small yellow→orange circle,
   each at opacity 0.5 (per-circle, so the overlap composites/darkens like the product). Position/size from
   nav.less .mask-group (right:-75 200×200), nudged to bottom:-90 (owner). Exact product colors (#89c540/#099dd9, #f5bc18/#f58518). */
.blobs { position: absolute; z-index: 0; right: -75px; bottom: -90px; width: 200px; height: 200px; pointer-events: none; }
</style>
