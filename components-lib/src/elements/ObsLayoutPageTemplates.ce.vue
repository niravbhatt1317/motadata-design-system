<script setup>
// <obs-layout-page-templates> — Foundations/Layout/Page templates. The canonical page types ObserveOps
// repeats, as annotated wireframes inside the app frame (nav rail + header + body). Pick a `template`:
// list / form / detail / dashboard / explorer / wizard / graph. Skeleton mock from
// layout-page-templates.stories.js (built from the composition recipes).
import { computed } from 'vue'
const props = defineProps({ template: { type: String, default: 'list' } })
const t = computed(() => props.template)
</script>

<template>
  <div class="frame">
    <div class="rail"></div>
    <div class="cc">
      <div class="hdr"></div>
      <div class="body">
        <!-- 1. List view -->
        <template v-if="t === 'list'">
          <div class="row jb sh"><div class="bar" style="height:14px;width:30%"></div><div class="row g6"><div class="btn ghost" style="width:80px"></div><div class="btn pri" style="width:54px"></div></div></div>
          <div class="row g6 sh"><div class="btn ghost" style="width:64px"></div><div class="btn ghost" style="width:64px"></div></div>
          <div class="table"><div class="thead"></div><div v-for="n in 5" :key="n" class="trow"></div></div>
          <div class="row je sh"><div class="bar" style="height:14px;width:120px"></div></div>
        </template>
        <!-- 2. Form view -->
        <template v-else-if="t === 'form'">
          <div class="row jb sh"><div class="row g8"><div class="box16"></div><div class="bar" style="height:14px;width:120px"></div></div><div class="row g6"><div class="btn pri" style="width:54px"></div><div class="btn ghost" style="width:54px"></div></div></div>
          <div class="fcol">
            <div class="row g10"><div class="fl"><div class="tag">Name</div><div class="fld"></div></div><div class="fl"><div class="tag">Type</div><div class="fld"></div></div></div>
            <div class="row g10"><div class="fl"><div class="tag">Severity</div><div class="fld"></div></div><div class="fl"><div class="tag">Tags</div><div class="fld"></div></div></div>
            <div class="fl"><div class="tag">Description</div><div class="fld" style="height:38px"></div></div>
          </div>
        </template>
        <!-- 3. Detail view -->
        <template v-else-if="t === 'detail'">
          <div class="row jb sh"><div class="row g8"><div class="box16"></div><div class="bar" style="height:14px;width:110px"></div><span class="dot crit"></span></div><div class="btn ghost" style="width:64px"></div></div>
          <div class="row g14 sh tabs"><div class="tab on"></div><div class="tab"></div><div class="tab"></div></div>
          <div class="row g8 fill"><div class="pane sol"></div><div class="pane sol"></div></div>
        </template>
        <!-- 4. Dashboard view -->
        <template v-else-if="t === 'dashboard'">
          <div class="row jb sh"><div class="row g8"><div class="bar" style="height:14px;width:90px"></div><div class="btn ghost" style="width:60px"></div></div><div class="btn ghost" style="width:96px"></div></div>
          <div class="dash"><div v-for="n in 4" :key="n" class="tile"></div></div>
        </template>
        <!-- 5. Explorer view -->
        <template v-else-if="t === 'explorer'">
          <div class="row g8 fill">
            <div class="lpanel"><div v-for="n in 5" :key="n" class="lbar" :style="{ marginLeft: (n % 3 === 0 ? '10px' : '0') }"></div></div>
            <div class="col g8 fill"><div class="qbar"></div><div class="pane dsh"></div></div>
          </div>
        </template>
        <!-- 6. Wizard flow -->
        <template v-else-if="t === 'wizard'">
          <div class="row g6 sh steps">
            <span class="step on"></span><span class="conn on"></span><span class="step ring"></span><span class="conn"></span><span class="step ring2"></span><span class="conn"></span><span class="step ring2"></span>
          </div>
          <div class="wbody"><div v-for="n in 3" :key="n" class="wfield"></div></div>
          <div class="row jb sh"><div class="btn ghost" style="width:54px"></div><div class="btn pri" style="width:54px"></div></div>
        </template>
        <!-- 7. Graph / Canvas -->
        <template v-else>
          <div class="row g8 fill">
            <div class="lpanel" style="width:30%"><div v-for="n in 5" :key="n" class="lbar" :style="{ marginLeft: (n % 3 === 0 ? '10px' : '0') }"></div></div>
            <div class="canvas">
              <svg class="edges" preserveAspectRatio="none"><line x1="50%" y1="30%" x2="28%" y2="62%"/><line x1="50%" y1="30%" x2="72%" y2="60%"/><line x1="28%" y1="62%" x2="52%" y2="84%"/></svg>
              <span class="node pri" style="left:50%;top:30%"></span>
              <span class="node clear" style="left:28%;top:62%"></span>
              <span class="node crit" style="left:72%;top:60%"></span>
              <span class="node warn" style="left:52%;top:84%"></span>
              <div class="gtools"><span>+</span><span>−</span><span>⤢</span></div>
              <div class="minimap"><span class="mnode" style="left:30%;top:30%"></span><span class="mnode" style="left:60%;top:60%"></span></div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; color: var(--page-text-color, #1d2a3e); font-family: jetBrainsMono, 'JetBrains Mono', monospace; }
.frame { display: flex; width: 100%; max-width: 580px; margin: 0 auto; height: 300px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--page-background-color); }
.rail { width: 30px; flex-shrink: 0; background: var(--nav-panel-bg); border-right: 1px solid var(--border-color); }
.cc { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.hdr { height: 30px; flex-shrink: 0; border-bottom: 1px solid var(--border-color); }
.body { flex: 1; min-height: 0; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.row { display: flex; align-items: center; }
.col { display: flex; flex-direction: column; }
.jb { justify-content: space-between; }
.je { justify-content: flex-end; }
.g6 { gap: 6px; } .g8 { gap: 8px; } .g10 { gap: 10px; } .g14 { gap: 14px; }
.sh { flex-shrink: 0; }
.fill { flex: 1; min-height: 0; align-items: stretch; } /* body rows (detail panels, explorer/graph) fill height, not center-collapse */
.bar { background: var(--code-tag-background-color); border-radius: 4px; }
.btn { height: 18px; border-radius: 4px; }
.btn.ghost { border: 1px solid var(--border-color); }
.btn.pri { background: var(--primary); }
.box16 { width: 16px; height: 16px; border: 1px solid var(--border-color); border-radius: 4px; }
.table { flex: 1; border: 1px solid var(--border-color); border-radius: 4px; display: flex; flex-direction: column; overflow: hidden; }
.thead { height: 20px; background: var(--code-tag-background-color); }
.trow { height: 16px; border-top: 1px solid var(--border-color); }
.fcol { flex: 1; display: flex; flex-direction: column; gap: 10px; padding-top: 4px; }
.fl { flex: 1; }
.tag { font-size: 10px; color: var(--neutral-light); margin-bottom: 3px; }
.fld { height: 20px; border: 1px solid var(--border-color); border-radius: 4px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.crit { border: 2px solid var(--severity-critical); background: var(--severity-critical-dot-box); box-sizing: border-box; }
.tabs { border-bottom: 1px solid var(--border-color); padding-bottom: 5px; }
.tab { height: 10px; width: 50px; background: var(--code-tag-background-color); }
.tab.on { background: transparent; border-bottom: 2px solid var(--primary); }
.pane { border-radius: 4px; flex: 1; }
.pane.sol { border: 1px solid var(--border-color); }
.pane.dsh { border: 1px dashed var(--border-color); }
.dash { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; min-height: 0; }
.tile { border: 1px solid var(--border-color); border-radius: 4px; }
.lpanel { width: 32%; border: 1px solid var(--border-color); border-radius: 4px; display: flex; flex-direction: column; padding: 6px; gap: 5px; }
.lbar { height: 8px; background: var(--code-tag-background-color); border-radius: 3px; }
.qbar { height: 20px; border: 1px solid var(--border-color); border-radius: 4px; flex-shrink: 0; }
.steps { padding-bottom: 4px; }
.step { width: 16px; height: 16px; border-radius: 50%; }
.step.on { background: var(--primary); }
.step.ring { border: 2px solid var(--primary); box-sizing: border-box; }
.step.ring2 { border: 1px solid var(--border-color); box-sizing: border-box; }
.conn { height: 2px; width: 40px; background: var(--code-tag-background-color); }
.conn.on { background: var(--primary); }
.wbody { flex: 1; border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
.wfield { height: 18px; border: 1px solid var(--border-color); border-radius: 4px; }
.canvas { flex: 1; border: 1px solid var(--border-color); border-radius: 4px; position: relative; overflow: hidden; }
.edges { position: absolute; inset: 0; width: 100%; height: 100%; }
.edges line { stroke: var(--border-color); stroke-width: 2; }
.node { position: absolute; transform: translate(-50%, -50%); border-radius: 50%; box-sizing: border-box; }
.node.pri { width: 20px; height: 20px; background: var(--primary); }
.node.clear { width: 16px; height: 16px; border: 2px solid var(--severity-clear); background: var(--severity-clear-dot-box); }
.node.crit { width: 16px; height: 16px; border: 2px solid var(--severity-critical); background: var(--severity-critical-dot-box); }
.node.warn { width: 16px; height: 16px; border: 2px solid var(--severity-warning); background: var(--severity-warning-dot-box); }
.gtools { position: absolute; top: 6px; right: 6px; display: flex; flex-direction: column; gap: 3px; }
.gtools span { width: 16px; height: 16px; border: 1px solid var(--border-color); border-radius: 3px; background: var(--page-background-color); font-size: 10px; display: flex; align-items: center; justify-content: center; }
.minimap { position: absolute; bottom: 6px; right: 6px; width: 46px; height: 32px; border: 1px solid var(--border-color); border-radius: 3px; background: var(--page-background-color); opacity: .9; }
.mnode { position: absolute; width: 5px; height: 5px; border-radius: 50%; background: var(--neutral-light); }
</style>
