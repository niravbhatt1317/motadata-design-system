<script setup>
// <obs-page-header> — the product's list/detail PAGE HEADER (FlotoPageHeader, 54×): an optional back button OR a
// section menu-toggle + the title (--primary-alt, weight 500, 18px) + an optional count pill on the left, and
// right-side actions (search / export / primary Add) via the default slot. A bottom divider (--border-color) by
// default. Variants: default · with-count · back · menu-toggle (module SECTION header) · with-subtitle ·
// with-breadcrumb · detail-meta · monitor-detail · title-only · no-divider.
// Sits at the TOP of a page. NOT the strip above a list/table (→ obs-toolbar) and NOT between-page nav
// (→ obs-sidebar / obs-breadcrumbs). The product page-header has no subtitle/breadcrumbs — those are separate.
// Values measured from the rendered story (organisms-toolbars-examples--page-header).
//
//   <obs-page-header heading="Monitors" count="128" back>
//     <obs-input type="search" placeholder="Search"></obs-input>
//     <obs-button variant="primary">Add Monitor</obs-button>
//   </obs-page-header>
import { useHost, computed } from 'vue'
const props = defineProps({
  heading: { type: String, default: '' },        // the page title (not `title` — that sets a native tooltip)
  subtitle: { type: String, default: '' },        // optional secondary line under the title (detail/drawer headers)
  count: { type: [String, Number], default: null }, // optional count pill next to the title
  meta: { type: String, default: '' },            // detail-header attribute strip: JSON [{label?,value,icon?,status?}]
  accent: { type: String, default: '' },          // left stripe colour: a severity level (up/critical/…) or a colour token
  back: { type: [Boolean, String], default: false },      // show the back chevron button (fires `back` on click)
  menuToggle: { type: [Boolean, String], default: false }, // a CIRCULAR toggle button + separator that shows/hides the module's side-menu (fires `menutoggle` {open}). The section-header variant (Settings, module sub-nav).
  menuOpen: { type: [Boolean, String], default: true },   // the side-menu's open state — flips the chevron (open → ‹ collapse, closed → › expand)
  noDivider: { type: [Boolean, String], default: false }, // remove the bottom rule (default: shown, per the 54× render)
})
const host = useHost()
// a custom-element Boolean attr coerces unreliably (back="" → false); treat presence as on, "false"/"0"/"no" as off
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
// the metadata strip (Session/Action/Resource detail headers): a wrapping " | "-separated key:value row
const metaItems = computed(() => {
  const raw = String(props.meta || '').trim()
  if (!raw || raw[0] !== '[') return []
  try { return JSON.parse(raw).filter((f) => f && f.value !== undefined && f.value !== null && f.value !== '') } catch (e) { return [] }
})
// accent stripe colour: a severity level → --severity-<level>; a token (--x) or raw colour used as-is
const accentColor = computed(() => {
  const a = String(props.accent || '').trim()
  if (!a) return ''
  if (a.startsWith('--')) return `var(${a})`
  if (a.startsWith('#') || a.startsWith('rgb') || a.startsWith('hsl')) return a
  return `var(--severity-${a}, var(--${a}, ${a}))`
})
// dispatch a native `back` event (NOT defineEmits — the emit name would collide with the `back` prop)
const onBack = () => { if (host) host.dispatchEvent(new CustomEvent('back', { bubbles: true, composed: true })) }
// the menu-toggle fires `menutoggle` with the NEW open state — the consumer shows/hides the module's obs-side-menu.
const onMenuToggle = () => { if (host) host.dispatchEvent(new CustomEvent('menutoggle', { detail: { open: !on(props.menuOpen) }, bubbles: true, composed: true })) }
// leading controls centre on the TITLE line for a simple header; a DETAIL header (subtitle/meta) top-aligns them.
const stacked = computed(() => !!props.subtitle || metaItems.value.length > 0)
</script>

<template>
  <div class="wrap" :class="{ 'no-divider': on(noDivider) }">
    <!-- the CONTENT is inset (--page-header-padding); the bottom divider lives on .wrap so it spans EDGE TO EDGE -->
    <div class="inner">
    <!-- optional breadcrumb trail above the header row (drop an obs-breadcrumbs here) -->
    <div class="crumb"><slot name="breadcrumb"></slot></div>
    <div class="ph">
      <div class="left" :class="{ stacked }">
        <!-- menu-toggle: a CIRCULAR button that shows/hides the module's side-menu, then a vertical separator. -->
        <template v-if="on(menuToggle)">
          <button class="menu-tgl" type="button" :aria-label="on(menuOpen) ? 'Hide menu' : 'Show menu'" :aria-expanded="String(on(menuOpen))" @click="onMenuToggle">
            <obs-icon class="tgl-ic" :class="{ open: on(menuOpen) }" :name="on(menuOpen) ? 'chevronLeft' : 'chevronRight'" size="18"></obs-icon>
          </button>
          <span class="tgl-sep" aria-hidden="true"></span>
        </template>
        <!-- back is a full-height LEFT GUTTER; the title/subtitle/meta form a left-aligned column beside it -->
        <button v-else-if="on(back)" class="back" type="button" aria-label="Back" @click="onBack">
          <obs-icon name="chevronLeft" size="16"></obs-icon>
        </button>
        <slot name="back"></slot>
        <span class="before"><slot name="before"></slot></span>
        <div class="titles">
          <div class="ttl-row">
            <span v-if="accentColor" class="accent" :style="{ background: accentColor }" aria-hidden="true"></span>
            <h4 v-if="heading" class="title">{{ heading }}</h4>
            <span v-if="count !== null && count !== ''" class="count">{{ count }}</span>
            <slot name="title"></slot>
          </div>
          <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
          <!-- detail-header metadata strip: [icon|status] Label: value, " | "-separated -->
          <div v-if="metaItems.length" class="meta">
            <template v-for="(f, i) in metaItems" :key="i">
              <span v-if="i > 0" class="meta-sep" aria-hidden="true">|</span>
              <span class="meta-item">
                <obs-icon v-if="f.icon" :name="f.icon" size="12" class="meta-ic" aria-hidden="true"></obs-icon>
                <obs-severity v-if="f.status" :severity="f.status" shape="dot" class="meta-dot"></obs-severity>
                <span v-if="f.label" class="meta-label">{{ f.label }}:</span>
                <span class="meta-value">{{ f.value }}</span>
              </span>
            </template>
          </div>
        </div>
      </div>
      <div class="right"><slot></slot></div>
    </div>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { display: block; }
/* The bottom divider lives on .wrap so it runs EDGE TO EDGE (full width) — it is NOT inset by the content padding.
   The CONTENT (breadcrumb + header row) is inset via --page-header-padding (a compact default; override to 0 when
   the surrounding page already pads, or to a larger value for a roomier header). */
.wrap { display: block; border-bottom: 1px solid var(--border-color, #e3e8f2); }
.wrap.no-divider { border-bottom-color: transparent; }
.inner { padding: var(--page-header-padding, 8px); }
/* breadcrumb slot: invisible (0 height) when unfilled; a small gap under it when present */
.crumb ::slotted(*) { display: block; margin-bottom: 4px; }
.ph {
  display: flex; align-items: center; justify-content: space-between;
  color: var(--page-text-color, #1d2a3e);
}
/* leading controls (menu-toggle / back / before-icon) centre on the title line for a SIMPLE header; a DETAIL header
   (with subtitle/meta) top-aligns them so they sit on the first line while the extra lines flow below. */
.left { display: flex; align-items: center; gap: 8px; min-width: 0; }
.left.stacked { align-items: flex-start; }
/* the before-slot (a leading icon, e.g. the Settings gear) — centred on the title line box */
.before { display: inline-flex; align-items: center; }
.left.stacked .before { height: 27px; }
.titles { display: flex; flex-direction: column; min-width: 0; }
.ttl-row { display: flex; align-items: center; gap: 10px; min-width: 0; }
.subtitle {
  margin-top: 2px; font-size: 0.75rem; line-height: 1.4;
  color: var(--neutral-theme-color, #6a7fa0);
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* accent stripe — a 3px type/severity bar before the title (RUM Session/Action/Resource) */
.accent { flex: 0 0 auto; width: 3px; height: 16px; border-radius: 2px; }
/* metadata strip — a wrapping " | "-separated key:value row (detail/drawer headers) */
.meta { display: flex; flex-wrap: wrap; align-items: center; row-gap: 2px; margin-top: 4px;
  font-size: 0.75rem; line-height: 1.5; color: var(--page-text-color, #1d2a3e); }
.meta-item { display: inline-flex; align-items: center; }
.meta-sep { margin: 0 8px; color: var(--neutral-light, #6a7fa0); }
.meta-ic { color: var(--neutral-theme-color, #6a7fa0); margin-right: 4px; display: inline-flex; }
.meta-dot { margin-right: 4px; display: inline-flex; }
.meta-label { color: var(--neutral-theme-color, #6a7fa0); margin-right: 4px; }
.meta-value { color: var(--page-text-color, #1d2a3e); }
.right { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.back {
  appearance: none; background: none; border: 0; padding: 0; cursor: pointer;
  height: 27px;                     /* = the title's line box (18px × 1.5) so the chevron centres on the TITLE line */
  display: inline-flex; align-items: center; color: var(--neutral-light, #a5bad0);
}
/* menu-toggle: a circular bordered button (shows/hides the module side-menu) + a vertical separator, matching the product */
.menu-tgl {
  appearance: none; flex: 0 0 auto; width: 26px; height: 26px; border-radius: 50%; padding: 0; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--border-color, #e3e8f2); background: var(--page-background-color, #fff); color: var(--neutral-light, #6a7fa0);
  transition: background .12s, border-color .12s, color .12s;
}
.menu-tgl:hover { background: var(--neutral-lightest, #ecf1f9); border-color: var(--neutral-lighter, #dfe5ef); color: var(--primary-alt, #3279be); }
.menu-tgl:focus-visible { outline: 2px solid var(--primary-alt, #3279be); outline-offset: 2px; }
.left.stacked .menu-tgl { margin-top: -1px; }  /* centre the 28px button on the 27px title line in a detail header */
/* Optical centring — a chevron's arms open away from its point, so its visual mass sits on the ARMS side.
   Closed (›, arms open left → mass left): nudge RIGHT. Open (‹, arms open right → mass right, big left gap):
   nudge LEFT. Same-magnitude, opposite sign, so each state reads centred in the circle. */
.tgl-ic { transform: translateX(1px); }
.tgl-ic.open { transform: translateX(-1px); }
/* separator: no side margin — the 8px .left gap already spaces it; a tighter cluster toggle · | · title */
.tgl-sep { flex: 0 0 auto; width: 1px; align-self: center; height: 22px; margin: 0; background: var(--border-color, #e3e8f2); }
.title {
  margin: 0; font-size: 18px; font-weight: 500; line-height: 1.5;
  color: var(--primary-alt, #1d2a3e);
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.count {
  display: inline-flex; align-items: center; height: 18px; padding: 0 4px;
  border-radius: 4px; font-size: 0.7rem;
  background: var(--timerange-background-color, #e3e8f2); color: var(--timerange-text-color, #7186a8);
}
</style>
