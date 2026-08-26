<script setup>
// <obs-divider> — a thin rule that marks a semantic break between content (the product's MDivider / Ant a-divider,
// 133× / 93 files). Two forms:
//   type="" (horizontal, default, 126×) — a full-width 1px rule between STACKED sections; margin 1rem 0.
//   type="vertical" (7×) — an inline 1px separator between items in a ROW (metadata strips, compare views).
// Optional `text` (or default slot) renders a LABELLED section rule; `orientation` (start|end) moves the label.
// `dark` tunes the line for a dark surface (--neutral-light). Values are source-derived from the Ant v1 divider
// defaults + the DS overrides (general.less:212 `background: var(--border-color)` · ui/style/override/divider.less
// `margin: 1rem 0` · divider-with-text table layout).
// NOTE: unlike the product (known-issue F1 — `dashed` renders solid because the DS background override paints over
// Ant's dashed border), obs-divider makes `dashed` ACTUALLY dashed (a real border-based rule) — a deliberate fix.
import { computed, useHost } from 'vue'
const props = defineProps({
  type: { type: String, default: 'horizontal' },        // 'horizontal' (default) | 'vertical'
  dashed: { type: [Boolean, String], default: false },   // dashed instead of solid (real dashed — fixes product F1)
  orientation: { type: String, default: '' },            // '' (center) | 'start' | 'end' — label position (with-text)
  text: { type: String, default: '' },                   // optional label → a with-text section rule
  dark: { type: [Boolean, String], default: false },     // tuned for a dark background (--neutral-light)
})
const host = useHost()
const isVertical = computed(() => props.type === 'vertical')
// a with-text divider when a `text` prop OR slotted label is present (never for the vertical form)
const hasText = computed(() => !isVertical.value && (!!String(props.text || '').trim() || !!(host && host.textContent && host.textContent.trim())))
const orientClass = computed(() => (hasText.value ? 'o-' + (props.orientation === 'start' ? 'start' : props.orientation === 'end' ? 'end' : 'center') : ''))
</script>

<template>
  <div v-if="isVertical" class="dv" role="separator" aria-orientation="vertical"></div>
  <div v-else-if="hasText" class="dh withtext" :class="orientClass" role="separator">
    <span class="txt"><slot>{{ text }}</slot></span>
  </div>
  <div v-else class="dh" role="separator"></div>
</template>

<style>
:host([hidden]) { display: none !important; }
/* horizontal (default): a block, full-width 1px rule */
:host { display: block; }
/* vertical margin is themeable via --divider-my so a dense surface (a dropdown menu) can use a tight divider */
.dh { width: 100%; height: 1px; margin: var(--divider-my, 1rem) 0; background: var(--border-color, #e3e8f2); }
/* vertical: an inline 1px separator (host becomes inline so it sits between row items) */
:host([type='vertical']) { display: inline-block; vertical-align: middle; }
/* height/gap are overridable (--divider-height / --divider-gap) so a taller separator — e.g. a toolbar bulk bar
   between an action group and its ⋮ More — can reuse this instead of a hand-styled span */
.dv { display: inline-block; width: 1px; height: var(--divider-height, 0.9em); margin: 0 var(--divider-gap, 8px); background: var(--border-color, #e3e8f2); position: relative; top: -0.06em; vertical-align: middle; }
/* dark surface variant — fill the plain line, but NOT the with-text box (its box is transparent; its rules are the
   ::before/::after borders, recoloured below) */
:host([dark]) .dh:not(.withtext), :host([dark]) .dv { background: var(--neutral-light, #8e9fbc); }
/* dashed — a REAL dashed line (border-based), unlike the product's solid-line F1 no-op */
:host([dashed]) .dh:not(.withtext) { height: 0; background: none; border-top: 1px dashed var(--border-color, #e3e8f2); }
:host([dashed]) .dv { width: 0; background: none; border-left: 1px dashed var(--border-color, #e3e8f2); }
/* with-text: a table row — a label flanked by 1px side rules (center 50/50, start 5/95, end 95/5) */
.dh.withtext {
  display: table; width: 100%; height: auto; margin: 16px 0; background: transparent;
  white-space: nowrap; text-align: center; color: var(--page-text-color, #1d2a3e);
  font-weight: 500; font-size: var(--font-size-lg, 1rem);
}
.dh.withtext::before, .dh.withtext::after {
  position: relative; top: 50%; display: table-cell; width: 50%;
  border-top: 1px solid var(--border-color, #e3e8f2); transform: translateY(50%); content: '';
}
:host([dashed]) .dh.withtext::before, :host([dashed]) .dh.withtext::after { border-top-style: dashed; }
:host([dark]) .dh.withtext::before, :host([dark]) .dh.withtext::after { border-top-color: var(--neutral-light, #8e9fbc); }
.dh.withtext .txt { display: inline-block; padding: 0 24px; }
.dh.withtext.o-start::before { width: 5%; } .dh.withtext.o-start::after { width: 95%; } .dh.withtext.o-start .txt { padding: 0 10px; }
.dh.withtext.o-end::before { width: 95%; } .dh.withtext.o-end::after { width: 5%; } .dh.withtext.o-end .txt { padding: 0 10px; }
</style>
