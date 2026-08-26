<script setup>
// <obs-tooltip> — DS Tooltip (MTooltip / _base-tooltip.vue → VTippy, 94×). A transient hover/focus label
// anchored to a trigger. Dominant idiom: an info-circle trigger + a short hint. Dark bubble by default
// (--tooltip-background-color / --tooltip-text-color / --tooltip-box-shadow, no arrow); chart-like swaps it
// for a light chart-surface bubble (--chart-tooltip-background + page text). Non-interactive (dismisses on
// mouse-out) — for click panels use Popover. Slot the anchor in `trigger` (or pass trigger-label / default ⓘ).
import { computed, useId } from 'vue'
const ttId = useId() // links the bubble (role=tooltip) to its trigger via aria-describedby
const props = defineProps({
  placement: { type: String, default: 'top-start' }, // top | top-start | top-end | bottom | left | right
  disabled: { type: Boolean, default: false },
  chartLike: { type: Boolean, default: false },       // attr: chart-like
  triggerLabel: { type: String, default: '' },        // text trigger (a button); else the info-circle ⓘ
  open: { type: Boolean, default: false },             // force-show the bubble (for the static examples)
})
const cls = computed(() => ['p-' + props.placement, { open: props.open, chart: props.chartLike, disabled: props.disabled }])
</script>

<template>
  <span class="tt" :class="cls">
    <span class="trigger" :aria-describedby="disabled ? null : ttId">
      <slot name="trigger">
        <button v-if="triggerLabel" class="trig-btn" type="button">{{ triggerLabel }}</button>
        <obs-icon v-else class="info" name="infoCircle" size="15" label="More info" tabindex="0"></obs-icon>
      </slot>
    </span>
    <span v-if="!disabled" class="bubble" role="tooltip" :id="ttId"><slot /></span>
  </span>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: inline-block; font-family: var(--font-family, 'Poppins', sans-serif); }
/* native form controls don't inherit font-family — force Poppins (else they render in the UA font, e.g. Arial) */
button, input, select, textarea { font-family: inherit; }
.tt { position: relative; display: inline-flex; align-items: center; }
.trigger { display: inline-flex; align-items: center; }
.info { width: 15px; height: 15px; color: var(--primary-alt, #3279be); cursor: help; outline: none; }
.trig-btn { font: inherit; font-size: 13px; height: 32px; padding: 0 14px; border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 4px; background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); cursor: default; }

/* the bubble — hidden until hover/focus (or forced open) */
.bubble { position: absolute; z-index: 40; box-sizing: border-box; width: max-content; max-width: 260px;
  padding: 6px 10px; border-radius: 4px; font-size: 12px; line-height: 1.45; text-align: left; white-space: normal;
  background: var(--tooltip-background-color, #172336); color: var(--tooltip-text-color, #cad3e2);
  border: 1px solid var(--border-color, #e3e8f2); box-shadow: var(--tooltip-box-shadow, 0 2px 8px rgba(0,0,0,.15));
  opacity: 0; visibility: hidden; transition: opacity .12s ease; pointer-events: none; }
.tt:hover > .bubble, .tt:focus-within > .bubble, .tt.open > .bubble { opacity: 1; visibility: visible; }
/* chart-like: light chart-surface bubble */
.tt.chart > .bubble { background: var(--chart-tooltip-background, rgba(255,255,255,.9)); color: var(--page-text-color, #1d2a3e); backdrop-filter: blur(8px); }

/* placements */
.p-top > .bubble, .p-top-start > .bubble, .p-top-end > .bubble { bottom: 100%; margin-bottom: 8px; }
.p-bottom > .bubble, .p-bottom-start > .bubble, .p-bottom-end > .bubble { top: 100%; margin-top: 8px; }
.p-top > .bubble, .p-bottom > .bubble { left: 50%; transform: translateX(-50%); }
.p-top-start > .bubble, .p-bottom-start > .bubble { left: 0; }
.p-top-end > .bubble, .p-bottom-end > .bubble { right: 0; }
.p-left > .bubble { right: 100%; top: 50%; transform: translateY(-50%); margin-right: 8px; }
.p-right > .bubble { left: 100%; top: 50%; transform: translateY(-50%); margin-left: 8px; }
</style>
