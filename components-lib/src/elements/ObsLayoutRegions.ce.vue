<script setup>
// <obs-layout-regions> — Foundations/Layout/Screen regions. Inside the content panel a page stacks: Page
// header (required) → Toolbar/filter bar (optional) → Body (required) → Footer/pagination (optional). The
// body takes one of 6 content layouts. Two modes: the interactive content panel (pick `shape` + toggle
// toolbar/footer — the Playground) and `callouts` (the annotated 4-region wireframe — the Examples reference).
// Skeleton mock from layout-screen-regions.stories.js. Machine spec: layout/layouts.json → screenRegions.
import { computed } from 'vue'
const props = defineProps({
  shape: { type: String, default: 'two-pane' }, // single|two-pane|master-detail|dashboard|three-pane|chart-over-grid
  toolbar: { type: Boolean, default: false },
  footer: { type: Boolean, default: false },
  callouts: { type: Boolean, default: false }, // the annotated region-stack wireframe
})
const isCol = computed(() => props.shape === 'chart-over-grid')
</script>

<template>
  <!-- ===== annotated region stack ===== -->
  <div v-if="callouts" class="stage">
    <div class="frame">
      <div class="rhead"><span class="t"></span><span class="b"></span></div>
      <div class="rtool"><span class="ti"></span><span class="ti"></span></div>
      <div class="rbody"><span class="bh"></span><span v-for="n in 4" :key="n" class="brow"></span></div>
      <div class="rfoot"><span class="fi"></span></div>
    </div>
    <span class="dot" style="left:396px;top:40px"></span><span class="lh" style="left:400px;top:43px;width:40px"></span><span class="chip" style="left:448px;top:31px">Page header</span>
    <span class="dot" style="left:396px;top:81px"></span><span class="lh" style="left:400px;top:84px;width:40px"></span><span class="chip" style="left:448px;top:72px">Toolbar / filter bar · optional</span>
    <span class="dot" style="left:396px;top:193px"></span><span class="lh" style="left:400px;top:196px;width:40px"></span><span class="chip" style="left:448px;top:184px">Body</span>
    <span class="dot" style="left:396px;top:307px"></span><span class="lh" style="left:400px;top:310px;width:40px"></span><span class="chip" style="left:448px;top:298px">Footer / pagination · optional</span>
  </div>

  <!-- ===== interactive content panel ===== -->
  <div v-else class="panel">
    <div class="phead">
      <div class="ptitle">Page title</div>
      <span class="add">+ Add</span>
    </div>
    <div v-if="toolbar" class="ptool"><span class="ts wide"></span><span class="ts"></span><span class="ts"></span></div>
    <div class="pbody" :class="{ col: isCol }">
      <template v-if="shape === 'single'"><div class="bx dsh"></div></template>
      <template v-else-if="shape === 'two-pane'"><div class="bx sol" style="width:30%"></div><div class="bx dsh"></div></template>
      <template v-else-if="shape === 'master-detail'"><div class="bx dsh"></div><div class="bx drawer"></div></template>
      <template v-else-if="shape === 'dashboard'"><div class="dash"><div v-for="n in 4" :key="n" class="bx sol"></div></div></template>
      <template v-else-if="shape === 'three-pane'"><div class="bx sol" style="width:18%"></div><div class="bx sol" style="width:26%"></div><div class="bx dsh"></div></template>
      <template v-else><div class="bx sol" style="height:40%;flex:none"></div><div class="bx dsh"></div></template>
    </div>
    <div v-if="footer" class="pfoot"><span class="fs"></span></div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; color: var(--page-text-color, #1d2a3e); font-family: jetBrainsMono, 'JetBrains Mono', monospace; }

/* interactive content panel */
.panel { display: flex; flex-direction: column; width: 100%; max-width: 760px; margin: 0 auto; height: 360px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--page-background-color); }
.phead { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; padding: 12px 16px; border-left: 3px solid var(--primary); }
.ptitle { font-weight: 600; font-size: 16px; }
.add { height: 26px; padding: 0 12px; display: inline-flex; align-items: center; border-radius: 4px; background: var(--primary); color: var(--nav-panel-bg); font-size: 12px; font-weight: 400; }
.ptool { display: flex; align-items: center; gap: 8px; flex-shrink: 0; padding: 8px 16px; background: var(--code-tag-background-color); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
.ts { height: 24px; width: 70px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--page-background-color); }
.ts.wide { width: 120px; }
.pbody { flex: 1; min-height: 0; position: relative; display: flex; gap: 12px; padding: 14px 16px; }
.pbody.col { flex-direction: column; }
/* sized boxes keep their inline width:%; only the fill (dashed) box grows to absorb the rest */
.bx { min-width: 0; border-radius: 6px; }
.bx.sol { border: 1px solid var(--border-color); }
.bx.dsh { border: 1px dashed var(--border-color); flex: 1 1 0; }
.bx.drawer { position: absolute; top: 14px; right: 16px; bottom: 14px; width: 44%; flex: none; border: 1px solid var(--primary); background: var(--page-background-color); box-shadow: -12px 0 24px var(--neutral-shadow-light); }
.dash { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px; }
.dash .bx { flex: none; }
.pfoot { display: flex; justify-content: flex-end; flex-shrink: 0; padding: 8px 16px; border-top: 1px solid var(--border-color); }
.fs { height: 18px; width: 130px; background: var(--code-tag-background-color); border-radius: 4px; }

/* annotated stage */
.stage { position: relative; width: 720px; height: 350px; }
.frame { position: absolute; left: 20px; top: 20px; width: 380px; height: 310px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; background: var(--page-background-color); }
.rhead { height: 48px; border-left: 3px solid var(--primary); display: flex; align-items: center; justify-content: space-between; padding: 0 12px; flex-shrink: 0; }
.rhead .t { height: 12px; width: 40%; background: var(--code-tag-background-color); border-radius: 3px; }
.rhead .b { height: 20px; width: 46px; background: var(--primary); border-radius: 4px; }
.rtool { height: 34px; border-top: 1px solid var(--border-color); background: var(--code-tag-background-color); display: flex; align-items: center; gap: 6px; padding: 0 12px; flex-shrink: 0; }
.rtool .ti { height: 14px; width: 54px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--page-background-color); }
.rbody { flex: 1; border-top: 1px solid var(--border-color); border-left: 3px solid var(--primary); display: flex; flex-direction: column; min-height: 0; }
.rbody .bh { height: 22px; background: var(--code-tag-background-color); flex-shrink: 0; }
.rbody .brow { flex: 1; border-top: 1px solid var(--border-color); margin: 0 12px; }
.rfoot { height: 38px; border-top: 1px solid var(--border-color); background: var(--code-tag-background-color); display: flex; align-items: center; justify-content: flex-end; padding: 0 12px; flex-shrink: 0; }
.rfoot .fi { height: 14px; width: 92px; background: var(--page-background-color); border: 1px solid var(--border-color); border-radius: 4px; }
.dot { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: var(--page-text-color); z-index: 3; }
.lh { position: absolute; height: 2px; background: var(--page-text-color); z-index: 2; }
.chip { position: absolute; background: var(--code-tag-background-color); color: var(--page-text-color); padding: 5px 11px; border-radius: 6px; font-size: 12px; white-space: nowrap; z-index: 3; }
</style>
