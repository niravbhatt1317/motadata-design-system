<script setup>
// <obs-toolbar> — the control strip that frames a LIST/TABLE (or a widget). Three product compositions from the
// Toolbars family:
//   variant="" (grid, default) — a strip ABOVE a grid: a `start` slot (search) on the left + the default slot
//     (filter / column / primary Add) on the right, justified apart.
//   variant="bulk" — the floating SELECTION bar (a pill): a clear checkbox + "N items selected" + a divider +
//     the slotted bulk actions (primary + danger). Appears once rows are selected. Emits `clear`.
//   variant="widget" — a WIDGET header: the title on the left + the default slot (time-range pill + kebab) on the
//     right, with the widget's rounded-top chrome.
// NOT the page title bar (obs-page-header) and NOT the global top bar (obs-app-header). Values measured from
// organisms-toolbars-examples (bulk-action-bar / widget-header / grid-toolbar).
import { computed, useHost } from 'vue'
const props = defineProps({
  variant: { type: String, default: '' },        // '' (grid) | 'bulk' | 'widget'
  count: { type: [String, Number], default: null }, // (bulk) number of selected rows → "N items selected"
  title: { type: String, default: '' },           // (widget) the widget title
})
const emit = defineEmits(['clear'])
const host = useHost()
const countNoun = computed(() => `${props.count} ${Number(props.count) === 1 ? 'item' : 'items'} selected`)
const onClear = () => emit('clear')
</script>

<template>
  <div class="tb" :class="'v-' + (variant || 'grid')" :role="variant === 'bulk' ? 'toolbar' : null">
    <!-- bulk: [checkbox + count] then the slotted actions (which carry their own divider before "More") -->
    <template v-if="variant === 'bulk'">
      <span v-if="count !== null && count !== ''" class="tb-sel">
        <obs-checkbox checked class="tb-chk" @change="onClear"></obs-checkbox>
        <span class="tb-count">{{ countNoun }}</span>
      </span>
      <slot></slot>
    </template>
    <!-- grid / widget: lead (left) + main (right), justified apart -->
    <template v-else>
      <div class="tb-lead">
        <span v-if="variant === 'widget' && title" class="tb-title">{{ title }}</span>
        <slot name="start"></slot>
      </div>
      <div class="tb-main"><slot></slot></div>
    </template>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; }
.tb { display: flex; align-items: center; color: var(--page-text-color, #1d2a3e); font-size: var(--text-sm, 0.8rem); }
.tb.v-grid, .tb.v-widget { justify-content: space-between; }
.tb-lead { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tb-main { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
/* ── bulk: the floating selection pill ── */
.tb.v-bulk {
  display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px;   /* real: @padding-xs @padding-sm, gap @padding-xs */
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 8px;
  box-shadow: var(--tooltip-box-shadow, 0 2px 8px rgba(0,0,0,0.15));
  background: var(--page-background-color, #fff);
}
/* checkbox + count sit together as one tight group; a wider margin sets the selection apart from the actions */
.tb-sel { display: inline-flex; align-items: center; gap: 6px; margin-right: 16px; }
.tb-chk { display: inline-flex; }
/* the "N items selected" text is MUTED (--neutral-light) per _base-bulk-action-bar.vue, not page-text */
.tb-count { font-size: 13px; font-weight: 500; white-space: nowrap; color: var(--neutral-light, #6a7fa0); }
/* ── widget: the rounded-top widget header chrome ── */
.tb.v-widget {
  padding: 0 8px; border: 1px solid var(--border-color, #e3e8f2); border-bottom: none;
  border-radius: 6px 6px 0 0; background: var(--common-widget-bg, #fff);
}
.tb-title { font-size: 14px; font-weight: 500; padding: 8px 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
