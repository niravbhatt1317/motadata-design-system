<script setup>
// <obs-steps> — a wizard/stepper: a numbered progress track through the ordered stages of a multi-step flow. ONE
// element folding the product's three real step forms (all Ant a-steps / MSteps derivatives, source-derived):
//   horizontal (report-steps.vue, the Report wizard) — a numbered CIRCLE + label + a dashed connector between steps;
//               active = --primary fill / white, done = --secondary-green fill + ✓ + green connector, future = muted.
//   vertical   (compliance rules-form.vue) — a left-rail stepper: 24px circle (✓ when done) + label stacked down,
//               click a done/current step to navigate; future steps are disabled/muted.
//   dot        (Ant progressDot) — a compact dot track for dense/secondary flows (no number, just a state dot).
// Derives each step's state from `active` (index < active → finish, === active → process, > active → wait); a per-item
// `status:'error'` overrides (red). `clickable` makes done/current steps navigable (emits `change` with the index).
// Values transcribed from report-steps.vue (50px circle, 1.2rem, dashed --neutral-light connector, green/primary fills)
// + rules-form.vue (24px circle, ✓ icon, --primary border) + src/design/steps.less (status connector colours).
import { computed, ref, watch, useHost } from 'vue'
const props = defineProps({
  items: { type: [String, Array], default: '' },       // [{label, description?, status?}] or ["A","B",…]
  active: { type: [Number, String], default: 0 },        // current step index (0-based)
  direction: { type: String, default: 'horizontal' },    // horizontal | vertical
  variant: { type: String, default: 'number' },          // number (circle+index) | dot (compact)
  size: { type: String, default: 'default' },            // default | small
  fill: { type: String, default: 'solid' },              // solid (filled circle) | outline (lined circle)
  connector: { type: String, default: 'line' },          // line (default) | none (hide the connecting lines)
  completed: { type: String, default: 'primary' },       // completed-marker colour: primary (black/navy) | green
  compact: { type: [Boolean, String], default: false },  // hide labels/descriptions → a circles-only progress track
  clickable: { type: [Boolean, String], default: false },// done/current steps navigate on click (emits change)
  status: { type: String, default: 'process' },          // status of the CURRENT step (process|error|finish|wait)
})
const emit = defineEmits(['change'])
const host = useHost()
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const parse = (raw) => { if (Array.isArray(raw)) return raw; const s = String(raw || '').trim(); return s[0] === '[' ? JSON.parse(s) : (s ? s.split(',').map((x) => x.trim()) : []) }
const steps = computed(() => parse(props.items).map((s) => (typeof s === 'string' ? { label: s } : s)))
const cur = ref(Number(props.active) || 0)
watch(() => props.active, (v) => { cur.value = Number(v) || 0 })
// per-step state: an explicit item.status wins; else derived from the active index (the current step uses `status`)
function stateOf(i) {
  const s = steps.value[i]
  if (s && s.status) return s.status
  if (i < cur.value) return 'finish'
  if (i === cur.value) return props.status || 'process'
  return 'wait'
}
const canClick = computed(() => on(props.clickable))
const isCompact = computed(() => on(props.compact))
function onStep(i) { if (!canClick.value) return; if (i > cur.value) return; cur.value = i; emit('change', i) }
</script>

<template>
  <div class="st" :class="['d-' + direction, 'v-' + variant, 's-' + size, 'f-' + fill, 'c-' + connector, 'done-' + completed, { clk: canClick, compact: isCompact }]" role="list">
    <div v-for="(s, i) in steps" :key="i" class="step" :class="['is-' + stateOf(i), { last: i === steps.length - 1, nav: canClick && i <= cur }]"
      role="listitem" :aria-current="i === cur ? 'step' : null" @click="onStep(i)">
      <!-- rail: the marker (number/✓ circle or dot); the VERTICAL connector drops from it to the next marker -->
      <div class="rail">
        <span class="marker">
          <obs-icon v-if="stateOf(i) === 'finish' && variant === 'number'" name="check" size="12" class="ck"></obs-icon>
          <obs-icon v-else-if="stateOf(i) === 'error' && variant === 'number'" name="times" size="12" class="ck"></obs-icon>
          <template v-else-if="variant === 'number'">{{ i + 1 }}</template>
        </span>
        <span v-if="direction === 'vertical' && i !== steps.length - 1" class="line vline"></span>
      </div>
      <!-- body: title + optional description (hidden in compact / circles-only mode) -->
      <div v-if="!isCompact" class="body">
        <span class="title">{{ s.label }}</span>
        <span v-if="s.description" class="desc">{{ s.description }}</span>
      </div>
      <!-- HORIZONTAL connector sits AFTER the label and stretches to touch the NEXT circle (no trailing gap) -->
      <span v-if="direction === 'horizontal' && i !== steps.length - 1" class="line hline"></span>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; }
/* --step-done = the completed-marker colour (primary/black by default; green when done="green") */
.st { display: flex; color: var(--page-text-color, #1d2a3e); font-size: 13px; --step-done: var(--primary, #099dd9); }
.st.done-green { --step-done: var(--secondary-green, #21b573); }
.st.d-horizontal { flex-direction: row; align-items: center; }
.st.d-vertical { flex-direction: column; }
.step { display: flex; min-width: 0; }
/* gap:0 — spacing is set per-piece (marker→label 10px, label→line 8px) so the line can touch the next circle */
.st.d-horizontal .step { flex: 1; flex-direction: row; align-items: center; gap: 0; }
.st.d-horizontal .step.last { flex: 0 0 auto; }
.st.d-horizontal .marker { margin-right: 10px; }
.st.d-vertical .step { flex-direction: row; align-items: flex-start; gap: 12px; }

/* ── rail (marker + the vertical connector) ── */
.rail { position: relative; display: flex; align-items: center; flex-shrink: 0; }
.st.d-vertical .rail { flex-direction: column; align-self: stretch; }
.marker { display: flex; align-items: center; justify-content: center; box-sizing: border-box;
  border-radius: 50%; font-weight: 500; flex-shrink: 0; transition: box-shadow .3s, background-color .3s, border-color .3s; z-index: 1;
  border: 1px solid var(--border-color, #e3e8f2); color: var(--neutral-regular, #64769a);
  /* FILLED disc (product circle carries bg-neutral-lightest) — reads as a solid circle, not an outline */
  background: var(--neutral-lightest, #f3f5f9); }
/* default marker size 32px (Ant default); report wizard uses 50 (large), compliance 24 (small) */
.st.s-default .marker { width: 32px; height: 32px; font-size: 14px; }
.st.s-small .marker { width: 24px; height: 24px; font-size: 12px; }
.v-dot .marker { width: 10px !important; height: 10px !important; border-width: 0; background: var(--neutral-light, #8e9fbc); }

/* ── connector — thin 1px GREY line; NEVER green (Ant tail is 1px #e8e8e8) ── */
.line { background: var(--border-color, #e3e8f2); }
/* horizontal: a flex segment after the label; flex:1 makes it fill to (and touch) the next circle. margin-left is
   the only gap — between the label and the line — so there is no trailing gap before the next circle */
.hline { flex: 1; height: 1px; min-width: 16px; margin-left: 8px; }
.vline { width: 1px; flex: 1; margin: 4px 0; min-height: 20px; align-self: center; }

/* ── body ── */
.body { display: flex; flex-direction: column; min-width: 0; gap: 2px; }
.st.d-vertical .body { padding-bottom: 12px; }
.title { font-weight: 500; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.desc { color: var(--neutral-light, #8e9fbc); font-size: 12px; line-height: 1.3; white-space: normal; }

/* ── states — SOLID fill (default) ── (derived: wait/process/finish/error) ── */
.step.is-wait .marker { background: var(--neutral-lightest, #f3f5f9); border-color: var(--border-color, #e3e8f2); color: var(--neutral-light, #8e9fbc); }
.step.is-wait .title { color: var(--neutral-light, #8e9fbc); }
/* process = the CURRENT step: --primary fill + an OUTER GREY RING (halo) so the current stage stands out */
.step.is-process .marker { border-color: var(--primary, #099dd9); background: var(--primary, #099dd9); color: var(--primary-button-text, #fff);
  box-shadow: 0 0 0 3px var(--neutral-lighter, #dfe5ef); }
.step.is-process .title { color: var(--page-text-color, #1d2a3e); font-weight: 600; }
/* finish = a completed step: --step-done fill + ✓. The ✓/number uses --primary-button-text (the theme-aware
   on-primary colour) so it stays visible on the light circle in DARK theme (a hardcoded #fff vanished there). */
.step.is-finish .marker { border-color: var(--step-done); background: var(--step-done); color: var(--primary-button-text, #fff); }
.step.is-finish .title { color: var(--page-text-color, #1d2a3e); }
/* error = a failed step: red */
.step.is-error .marker { border-color: var(--secondary-red, #e0464d); background: var(--secondary-red, #e0464d); color: var(--primary-button-text, #fff); }
.step.is-error .title { color: var(--secondary-red, #e0464d); }

/* ── OUTLINE fill (lined circles) — transparent/page-bg fill, the colour lives on the border + the number/✓ ── */
.st.f-outline .marker { background: var(--page-background-color, #fff); }
.st.f-outline .step.is-wait .marker { background: var(--page-background-color, #fff); border-color: var(--neutral-regular, #64769a); color: var(--neutral-light, #8e9fbc); }
.st.f-outline .step.is-process .marker { background: var(--page-background-color, #fff); border-color: var(--primary, #099dd9); color: var(--primary, #099dd9); }
.st.f-outline .step.is-finish .marker { background: var(--page-background-color, #fff); border-color: var(--step-done); color: var(--step-done); }
.st.f-outline .step.is-error .marker { background: var(--page-background-color, #fff); border-color: var(--secondary-red, #e0464d); color: var(--secondary-red, #e0464d); }

/* dot variant: recolour the dot per state (no number/✓) */
.v-dot .step.is-process .marker { background: var(--primary, #099dd9); }
.v-dot .step.is-finish .marker { background: var(--step-done); }
.v-dot .step.is-error .marker { background: var(--secondary-red, #e0464d); }

/* ── connector="none" — hide the connecting lines (keep the flex spacer so circles still distribute) ── */
.st.c-none .line { background: transparent; }
/* ── compact / circles-only — no labels; give the row of circles a little breathing room ── */
.st.compact.d-vertical .rail { align-self: auto; }
.st.compact.d-vertical .vline { min-height: 16px; }

/* ── clickable navigation ── done/current steps get a pointer + hover lift; future steps stay inert */
.st.clk .step.nav { cursor: pointer; }
.st.clk .step.nav:hover .title { color: var(--primary, #099dd9); }
.st.clk .step:not(.nav) { cursor: not-allowed; }
</style>
