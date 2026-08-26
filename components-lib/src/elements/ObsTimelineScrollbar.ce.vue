<script setup>
// <obs-timeline-scrollbar> — the temporal NAVIGATOR bar (Playback & Timeline family): a horizontal strip that steps a
// time WINDOW backward/forward over bucketed snapshots. Left: batch-back (« ) + step-back ( ‹ ) + the window START
// time; right: the window END time + step-forward ( › ) + batch-forward ( » ). Single-step shifts one point; batch
// shifts a whole window. Data/behaviour-agnostic: it renders the controls + times and EMITS `shift {direction,batch}`;
// the consumer moves its data window. Source-derived from netroute/components/timeline-scrollbar.vue.
//
//   <obs-timeline-scrollbar start="Jul 21, 06:00 PM" end="Jul 21, 06:15 PM"></obs-timeline-scrollbar>
//   emits: shift -> { direction: 'backward'|'forward', batch: boolean }
import { computed } from 'vue'
const props = defineProps({
  start: { type: String, default: '' },          // the window START time label
  end: { type: String, default: '' },            // the window END time label
  disabled: { type: [Boolean, String], default: false }, // disable all controls
})
const emit = defineEmits(['shift'])
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const isDisabled = computed(() => on(props.disabled))
const shift = (direction, batch) => { if (!isDisabled.value) emit('shift', { direction, batch }) }
</script>

<template>
  <div class="tl" :class="{ disabled: isDisabled }">
    <div class="side">
      <obs-button class="nav" variant="neutral-lightest" size="small" title="Previous window" aria-label="Previous window" :disabled="isDisabled" @click="shift('backward', true)">
        <obs-icon name="chevronDoubleLeft" size="14"></obs-icon>
      </obs-button>
      <obs-button class="nav" variant="neutral-lightest" size="small" title="Step back" aria-label="Step back" :disabled="isDisabled" @click="shift('backward', false)">
        <obs-icon name="chevronLeft" size="14"></obs-icon>
      </obs-button>
      <span class="time">{{ start }}</span>
    </div>
    <div class="side end">
      <span class="time">{{ end }}</span>
      <obs-button class="nav" variant="neutral-lightest" size="small" title="Step forward" aria-label="Step forward" :disabled="isDisabled" @click="shift('forward', false)">
        <obs-icon name="chevronRight" size="14"></obs-icon>
      </obs-button>
      <obs-button class="nav" variant="neutral-lightest" size="small" title="Next window" aria-label="Next window" :disabled="isDisabled" @click="shift('forward', true)">
        <obs-icon name="chevronDoubleRight" size="14"></obs-icon>
      </obs-button>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { display: block; }
/* the full-width bar with a top rule (matches the product's timeline-scrollbar) */
.tl {
  display: flex; align-items: center; justify-content: space-between; width: 100%; box-sizing: border-box;
  height: 40px; padding: 0 12px;
  background: var(--timeline-scrollbar-background-color, var(--page-background-color, #fff));
  border-top: 1px solid var(--border-color, #e3e8f2);
  color: var(--page-text-color, #1d2a3e);
}
.side { display: flex; flex: 0 1 auto; align-items: center; gap: 6px; min-width: 0; }
/* the times shrink + ellipsize rather than colliding in a narrow bar (they show full in the wide/fullscreen view) */
.time { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--page-text-color, #1d2a3e); }
/* step/batch buttons REUSE obs-button (variant neutral-lightest) — its icon inherits --page-text-color (readable,
   theme-flipping) via obs-icon's currentColor */
.nav { flex: none; }
.tl.disabled .nav, .nav:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
