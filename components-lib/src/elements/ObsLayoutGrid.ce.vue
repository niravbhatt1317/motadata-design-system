<script setup>
// <obs-layout-grid> — Foundations/Layout/Grid. The product's 12-column grid (MRow/MCol over Ant a-row/a-col).
// Pick a `size` (1–12 span) → the row fills with 12/size equal columns; toggle the 16px `gutter`; `auto-size`
// adds the canonical "filling field + content-width action buttons" row. Reproduced with CSS (the visual: the
// proportional colour-coded cells) from layout-grid.stories.js. Machine spec: layout/grid.json.
import { computed } from 'vue'
const props = defineProps({
  size: { type: [String, Number], default: 6 },
  gutter: { type: Boolean, default: false },
  autoSize: { type: Boolean, default: false },
})
const span = computed(() => Math.max(1, Math.min(12, parseInt(props.size, 10) || 6)))
const count = computed(() => Math.floor(12 / span.value))
const cells = computed(() => Array.from({ length: count.value }, (_, i) => i))
const gap = computed(() => (props.gutter ? '16px' : '0px'))
</script>

<template>
  <div class="grid">
    <div class="row" :style="{ gap }">
      <div v-for="i in cells" :key="i" class="cell">{{ span }}</div>
    </div>
    <template v-if="autoSize">
      <div class="hint">A filling field + two <code>auto-size</code> action columns (they hug their content):</div>
      <div class="row mid" :style="{ gap }">
        <div class="field"></div>
        <span class="btn ghost">Reset</span>
        <span class="btn primary">Apply</span>
      </div>
    </template>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; color: var(--page-text-color, #1d2a3e); font-family: jetBrainsMono, 'JetBrains Mono', monospace; }
.grid { width: 100%; max-width: 720px; margin: 0 auto; }
.row { display: flex; align-items: stretch; }
.row.mid { align-items: center; margin-top: 14px; }
.cell { flex: 1 1 0; min-width: 0; background: var(--code-tag-background-color); color: var(--page-text-color);
  border: 1px solid var(--border-color); border-radius: 4px; padding: 14px 0; text-align: center; font-size: 13px; }
.field { flex: 1 1 0; height: 46px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--page-background-color); }
.btn { display: inline-flex; align-items: center; height: 46px; border-radius: 4px; font-size: 13px; flex-shrink: 0; white-space: nowrap; }
.btn.ghost { padding: 0 18px; border: 1px solid var(--border-color); }
.btn.primary { padding: 0 20px; background: var(--primary); color: var(--page-background-color); font-weight: 400; }
.hint { color: var(--neutral-light); font-size: 11px; margin: 16px 0 5px; }
.hint code { font-family: inherit; }
</style>
