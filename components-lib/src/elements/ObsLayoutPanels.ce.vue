<script setup>
// <obs-layout-panels> — Foundations/Layout/Panel behaviours. How panels & overlays open / move / resize.
// Pick a `behaviour`: drawer / modal / collapse / expand / split / affix / dash / bulkbar / popover /
// fullscreen. Skeleton mock (420×300 frame) from layout-panels.stories.js. Machine spec: layouts.json → panels.
import { computed } from 'vue'
const props = defineProps({ behaviour: { type: String, default: 'drawer' } })
const b = computed(() => props.behaviour)
</script>

<template>
  <div class="frame">
    <!-- Drawer -->
    <div v-if="b === 'drawer'" class="rel full">
      <div class="dsh full"></div><div class="scrim"></div>
      <div class="drawer"><div class="bar w55"></div><div v-for="n in 4" :key="n" class="bar"></div></div>
    </div>
    <!-- Modal -->
    <div v-else-if="b === 'modal'" class="rel full">
      <div class="dsh full"></div><div class="scrim"></div>
      <div class="modal"><div class="bar w50"></div><div class="bar"></div><div class="bar w80"></div><div class="row je g8 mt4"><div class="mbtn ghost"></div><div class="mbtn pri"></div></div></div>
    </div>
    <!-- Collapsible -->
    <div v-else-if="b === 'collapse'" class="col gap12 full">
      <div class="sec muted">▸ Section A</div>
      <div class="sec open"><div class="sechead">▾ Section B</div><div class="secbody"><div class="bar"></div><div class="bar"></div></div></div>
      <div class="sec muted">▸ Section C</div>
    </div>
    <!-- Expandable rows -->
    <div v-else-if="b === 'expand'" class="col gap10 full">
      <div class="erow muted">▸ row</div>
      <div class="erow open"><div class="erhead">▾ row (expanded)</div><div class="erbody"><div class="bar"></div><div class="bar"></div></div></div>
      <div class="erow muted">▸ row</div>
    </div>
    <!-- Resizable / split -->
    <div v-else-if="b === 'split'" class="row full stretch">
      <div class="dsh" style="width:40%;border-radius:9px 0 0 9px"></div>
      <div class="handle"><span class="grip"></span></div>
      <div class="dsh" style="flex:1;border-radius:0 9px 9px 0"></div>
    </div>
    <!-- Affix / sticky -->
    <div v-else-if="b === 'affix'" class="col gap12 full">
      <div class="pinned">📌 pinned</div>
      <div v-for="n in 4" :key="n" class="bar faded"></div>
    </div>
    <!-- Dashboard tiles -->
    <div v-else-if="b === 'dash'" class="dashgrid full">
      <div v-for="n in 4" :key="n" class="tile"><span class="resize"></span></div>
    </div>
    <!-- Bulk-action bar -->
    <div v-else-if="b === 'bulkbar'" class="rel col gap12 full">
      <div v-for="n in 4" :key="n" class="brow"><span class="cbox" :class="{ on: n <= 2 }"></span><span class="bar f1"></span></div>
      <div class="bulkbar"><span>2 selected</span><span class="row g9"><span class="ba"></span><span class="ba"></span></span></div>
    </div>
    <!-- Popover -->
    <div v-else-if="b === 'popover'" class="center full">
      <div class="rel">
        <div class="anchor">anchor ▾</div>
        <div class="arrow"></div>
        <div class="pop"><div v-for="n in 3" :key="n" class="bar"></div></div>
      </div>
    </div>
    <!-- Full-screen / OmniBox -->
    <div v-else class="rel full">
      <div class="dsh full"></div><div class="scrim"></div>
      <div class="omni">
        <div class="omnibar"><span class="ico">🔍</span><span class="bar f1"></span></div>
        <div class="omnilist"><div v-for="n in 3" :key="n" class="bar"></div></div>
      </div>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; color: var(--page-text-color, #1d2a3e); font-family: jetBrainsMono, 'JetBrains Mono', monospace; }
.frame { width: 420px; max-width: 100%; height: 300px; margin: 0 auto; border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; background: var(--page-background-color); padding: 18px; box-sizing: border-box; }
.full { width: 100%; height: 100%; box-sizing: border-box; }
.rel { position: relative; }
.row { display: flex; align-items: center; }
.col { display: flex; flex-direction: column; }
.center { display: flex; align-items: center; justify-content: center; }
.stretch { align-items: stretch; }
.gap10 { gap: 10px; } .gap12 { gap: 12px; }
.g8 { gap: 8px; } .g9 { gap: 9px; }
.je { justify-content: flex-end; } .mt4 { margin-top: 4px; } .f1 { flex: 1; }
.bar { height: 14px; background: var(--code-tag-background-color); border-radius: 4px; }
.bar.w55 { width: 55%; } .bar.w50 { width: 50%; } .bar.w80 { width: 80%; }
.bar.faded { opacity: .6; }
.dsh { border: 1px dashed var(--border-color); border-radius: 9px; }
.scrim { position: absolute; inset: 0; background: var(--overlay-bg); }
/* drawer */
.drawer { position: absolute; top: 0; right: 0; bottom: 0; width: 58%; background: var(--page-background-color); border: 1px solid var(--border-color); border-radius: 9px 0 0 9px; box-shadow: -12px 0 24px var(--neutral-shadow-light); padding: 17px; display: flex; flex-direction: column; gap: 12px; box-sizing: border-box; }
/* modal */
.modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 64%; background: var(--page-background-color); border: 1px solid var(--border-color); border-radius: 9px; box-shadow: 0 14px 30px var(--neutral-shadow-light); padding: 16px; display: flex; flex-direction: column; gap: 11px; box-sizing: border-box; }
.mbtn { height: 24px; width: 56px; border-radius: 5px; }
.mbtn.ghost { border: 1px solid var(--border-color); }
.mbtn.pri { background: var(--primary); }
/* collapse */
.sec { border: 1px solid var(--border-color); border-radius: 8px; padding: 11px 16px; font-size: 16px; }
.sec.muted { color: var(--neutral-regular); }
.sec.open { padding: 0; flex: 1; display: flex; flex-direction: column; min-height: 0; }
.sechead { padding: 11px 16px; font-size: 16px; border-bottom: 1px solid var(--border-color); }
.secbody { flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 11px; min-height: 0; }
/* expand */
.erow { height: 28px; border: 1px solid var(--border-color); border-radius: 7px; display: flex; align-items: center; padding: 0 14px; font-size: 14px; }
.erow.muted { color: var(--neutral-regular); }
.erow.open { height: auto; flex: 1; padding: 0; border-color: var(--primary); display: flex; flex-direction: column; align-items: stretch; min-height: 0; }
.erhead { height: 28px; display: flex; align-items: center; padding: 0 14px; font-size: 14px; border-bottom: 1px solid var(--border-color); }
.erbody { flex: 1; padding: 13px 14px; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
/* split */
.handle { width: 21px; display: flex; align-items: center; justify-content: center; }
.grip { width: 6px; height: 78px; background: var(--primary); border-radius: 3px; }
/* affix */
.pinned { height: 42px; background: var(--code-tag-background-color); border: 1px solid var(--primary); border-radius: 8px; display: flex; align-items: center; padding: 0 16px; font-size: 16px; color: var(--neutral-regular); box-sizing: border-box; flex-shrink: 0; }
/* dash */
.dashgrid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 14px; }
.tile { border: 1px solid var(--border-color); border-radius: 8px; position: relative; }
.resize { position: absolute; bottom: 6px; right: 6px; width: 10px; height: 10px; border-right: 3px solid var(--neutral-light); border-bottom: 3px solid var(--neutral-light); }
/* bulkbar */
.brow { display: flex; align-items: center; gap: 12px; height: 26px; }
.cbox { width: 18px; height: 18px; border-radius: 4px; border: 1px solid var(--primary); }
.cbox.on { background: var(--primary); }
.bulkbar { position: absolute; left: 0; right: 0; bottom: 0; height: 46px; border-radius: 8px; background: var(--primary); color: var(--page-background-color); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-size: 14px; box-sizing: border-box; }
.ba { width: 64px; height: 24px; border: 1px solid var(--page-background-color); border-radius: 5px; opacity: .85; display: inline-block; }
/* popover */
.anchor { width: 130px; height: 36px; border: 1px solid var(--border-color); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--neutral-regular); }
.arrow { position: absolute; top: 38px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 12px; height: 12px; background: var(--page-background-color); border-left: 1px solid var(--border-color); border-top: 1px solid var(--border-color); }
.pop { position: absolute; top: 46px; left: 50%; transform: translateX(-50%); width: 180px; background: var(--page-background-color); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 10px 24px var(--neutral-shadow-light); padding: 12px; display: flex; flex-direction: column; gap: 9px; box-sizing: border-box; }
.pop .bar { height: 12px; }
/* fullscreen / omnibox */
.omni { position: absolute; top: 24px; left: 50%; transform: translateX(-50%); width: 76%; display: flex; flex-direction: column; gap: 10px; }
.omnibar { height: 40px; background: var(--page-background-color); border: 1px solid var(--border-color); border-radius: 8px; display: flex; align-items: center; gap: 9px; padding: 0 14px; box-shadow: 0 10px 24px var(--neutral-shadow-light); box-sizing: border-box; }
.ico { font-size: 15px; }
.omnilist { background: var(--page-background-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 9px; }
.omni .bar { height: 11px; }
</style>
