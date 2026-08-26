<script setup>
// <obs-page-header> — the product's list/detail PAGE HEADER (FlotoPageHeader, 54×): an optional back button +
// the title (--primary-alt, weight 500, 16px) + an optional count pill on the left, and right-side actions
// (search / export / primary Add) via the default slot. A bottom divider (--border-color) by default.
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
</script>

<template>
  <div class="wrap" :class="{ 'no-divider': on(noDivider) }">
    <!-- the CONTENT is inset (--page-header-padding); the bottom divider lives on .wrap so it spans EDGE TO EDGE -->
    <div class="inner">
    <!-- optional breadcrumb trail above the header row (drop an obs-breadcrumbs here) -->
    <div class="crumb"><slot name="breadcrumb"></slot></div>
    <div class="ph">
      <div class="left">
        <!-- back is a full-height LEFT GUTTER; the title/subtitle/meta form a left-aligned column beside it -->
        <button v-if="on(back)" class="back" type="button" aria-label="Back" @click="onBack">
          <obs-icon name="chevronLeft" size="16"></obs-icon>
        </button>
        <slot name="back"></slot>
        <slot name="before"></slot>
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
.left { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
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
  height: 24px;                     /* = the title's line box (16px × 1.5) so the chevron centres on the TITLE line */
  display: inline-flex; align-items: center; color: var(--neutral-light, #a5bad0);
}
.title {
  margin: 0; font-size: 16px; font-weight: 500; line-height: 1.5;
  color: var(--primary-alt, #1d2a3e);
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.count {
  display: inline-flex; align-items: center; height: 18px; padding: 0 4px;
  border-radius: 4px; font-size: 0.7rem;
  background: var(--timerange-background-color, #e3e8f2); color: var(--timerange-text-color, #7186a8);
}
</style>
