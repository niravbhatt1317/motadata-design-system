<script setup>
// <obs-layout-appshell> — Foundations/Layout/App shell. The authenticated app frame (views/layouts/main.vue
// `Layout`): NavBar (left, --nav-panel-bg) + Header (top) + the one scrolling content panel + a shell-level
// overlay layer. Two render modes: the interactive shell (toggle sidebar/header/overlay/empty — the
// Playground) and `anatomy` (the annotated leader-line diagram — the Examples reference). Skeleton mock built
// from the same tokens as the Storybook story (layout-app-shell.stories.js). No real components.
import { computed } from 'vue'
const props = defineProps({
  sidebar: { type: Boolean, default: false },
  header: { type: Boolean, default: false },
  overlay: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  anatomy: { type: Boolean, default: false }, // the annotated region-callout diagram
})
const navIcons = computed(() => [1, 2, 3, 4, 5, 6])
const rows = computed(() => [1, 2, 3, 4, 5, 6])
</script>

<template>
  <!-- ===== anatomy: fixed stage with leader-line callouts ===== -->
  <div v-if="anatomy" class="stage">
    <div class="frame">
      <div class="rail">
        <span class="logo"></span>
        <span v-for="i in navIcons" :key="i" class="nico" :class="{ on: i === 2 }"></span>
      </div>
      <div class="cc">
        <div class="hdr">
          <span class="brand"></span>
          <span class="acts"><span class="ai"></span><span class="ai"></span><span class="ai bare"></span></span>
        </div>
        <div class="content">
          <div class="ptitle">Page title</div>
          <div class="rule"></div>
          <div v-for="n in rows" :key="n" class="line" :style="{ width: n === 6 ? '55%' : '100%' }"></div>
          <div class="toast"><span class="tl"></span><span class="tl wide"></span></div>
        </div>
      </div>
    </div>
    <!-- callouts -->
    <span class="dot" style="left:436px;top:64px"></span><span class="lv" style="left:439px;top:44px;height:24px"></span><span class="chip" style="left:440px;top:16px;transform:translateX(-50%)">Header</span>
    <span class="dot" style="left:56px;top:368px"></span><span class="lv" style="left:59px;top:372px;height:32px"></span><span class="chip" style="left:48px;top:410px">NavBar</span>
    <span class="dot" style="left:396px;top:374px"></span><span class="lv" style="left:399px;top:378px;height:26px"></span><span class="chip" style="left:400px;top:410px;transform:translateX(-50%)">Content panel</span>
    <span class="dot" style="left:696px;top:368px"></span><span class="lv" style="left:699px;top:372px;height:32px"></span><span class="chip" style="right:108px;top:410px">Overlay layer (floats above)</span>
  </div>

  <!-- ===== interactive shell ===== -->
  <div v-else class="shell">
    <div v-if="sidebar" class="rail">
      <span class="logo"></span>
      <span v-for="i in navIcons" :key="i" class="nico" :class="{ on: i === 2 }"></span>
    </div>
    <div class="cc">
      <div v-if="header" class="hdr">
        <span class="brand"></span>
        <span class="acts"><span class="ai"></span><span class="ai"></span><span class="ai bare"></span></span>
      </div>
      <div class="content">
        <div v-if="empty" class="empty">
          <span class="ec"></span>
          <div class="eh">No items yet</div>
          <div class="es">Create your first item to get started.</div>
          <span class="eb"></span>
        </div>
        <div v-else class="page">
          <div class="ptitle">Page title</div>
          <div class="rule"></div>
          <div v-for="n in rows" :key="n" class="line" :style="{ width: n === 6 ? '55%' : '100%' }"></div>
        </div>
      </div>
      <div v-if="overlay" class="toast abs"><span class="tl"></span><span class="tl wide"></span></div>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; color: var(--page-text-color, #1d2a3e); font-family: jetBrainsMono, 'JetBrains Mono', monospace; }
/* shared region skeleton */
.rail { width: 60px; flex-shrink: 0; background: var(--nav-panel-bg); border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column; align-items: center; padding: 12px 0; gap: 9px; }
.logo { width: 26px; height: 26px; border-radius: 50%; background: var(--code-tag-background-color); border: 1px solid var(--border-color); margin-bottom: 4px; }
.nico { width: 30px; height: 28px; border-radius: 7px; background: var(--code-tag-background-color); border: 1px solid var(--border-color); }
.nico.on { background: var(--primary); border: none; }
.cc { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; }
.hdr { display: flex; align-items: center; justify-content: space-between; height: 46px; border-bottom: 1px solid var(--border-color); padding: 0 16px; flex-shrink: 0; }
.brand { width: 88px; height: 14px; border-radius: 4px; background: var(--code-tag-background-color); }
.acts { display: flex; align-items: center; gap: 8px; }
.ai { width: 24px; height: 24px; border-radius: 50%; background: var(--code-tag-background-color); border: 1px solid var(--border-color); }
.ai.bare { border: none; }
.content { flex: 1; min-height: 0; overflow: hidden; background: var(--page-background-color); }
.page { height: 100%; padding: 16px 18px; display: flex; flex-direction: column; }
.ptitle { font-weight: 600; font-size: 20px; margin-bottom: 10px; }
.rule { height: 1px; background: var(--border-color); margin-bottom: 16px; }
.line { height: 18px; border-radius: 4px; background: var(--code-tag-background-color); margin-bottom: 14px; }
.empty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 20px; }
.ec { width: 54px; height: 54px; border-radius: 50%; background: var(--code-tag-background-color); border: 1px solid var(--border-color); }
.eh { font-weight: 600; font-size: 15px; }
.es { color: var(--neutral-light); font-size: 12px; }
.eb { height: 30px; width: 120px; border-radius: 4px; background: var(--code-tag-background-color); border: 1px solid var(--border-color); }
.toast { border: 1px solid var(--border-color); border-left: 3px solid var(--secondary-green); border-radius: 6px;
  background: var(--page-background-color); box-shadow: 0 6px 18px var(--neutral-shadow-light); padding: 9px 11px; }
.toast.abs { position: absolute; right: 16px; bottom: 16px; width: 170px; }
.tl { display: block; height: 7px; width: 70%; background: var(--code-tag-background-color); border-radius: 3px; margin-bottom: 6px; }
.tl.wide { width: 92%; margin-bottom: 0; }

/* interactive shell frame */
.shell { display: flex; width: 100%; max-width: 820px; margin: 0 auto; height: 400px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--page-background-color); }

/* anatomy stage */
.stage { position: relative; width: 820px; height: 470px; }
.stage .frame { position: absolute; left: 30px; top: 70px; width: 760px; height: 330px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; display: flex; background: var(--page-background-color); }
.stage .rail { padding: 11px 0; }
.stage .content { display: flex; flex-direction: column; padding: 11px 14px; position: relative; }
.stage .ptitle { font-size: 18px; margin-bottom: 9px; flex-shrink: 0; }
.stage .rule { margin-bottom: 14px; flex-shrink: 0; }
.stage .line { height: 16px; margin-bottom: 13px; flex-shrink: 0; }
.stage .toast { position: absolute; right: 18px; bottom: 18px; width: 150px; padding: 8px 10px; }
.stage .tl { height: 6px; margin-bottom: 5px; }
.dot { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: var(--page-text-color); z-index: 3; }
.lv { position: absolute; width: 2px; background: var(--page-text-color); z-index: 2; }
.chip { position: absolute; background: var(--code-tag-background-color); color: var(--page-text-color); padding: 5px 11px; border-radius: 6px; font-size: 12px; white-space: nowrap; z-index: 3; }
</style>
