<script setup>
// <obs-layout-shells> — Foundations/Layout/Layout shells. The 4 route shells (views/layouts/) + 2 content
// layouts that render inside Layout. Pick a `shell` → a recognizable preview morphs: nav+header for Layout,
// a centered sign-in card for LoginLayout, padded chrome-less for Empty/Public, a hierarchy tree for
// MonitorHierarchyLayout, a settings menu for the Settings two-pane. Skeleton mock from layout-shells.stories.js.
import { computed } from 'vue'
const CFG = {
  layout: { kind: 'route shell', nav: true, header: true, sub: 'main.vue · default', use: 'Every authenticated app page (the default — no override).' },
  login: { kind: 'route shell', bare: true, sub: 'login-layout.vue', use: 'Auth screens + disk-full error; also the not-logged-in fallback.' },
  empty: { kind: 'route shell', padded: true, sub: 'empty-layout.vue', use: 'Full-bleed, no nav/header, still live (socket + DB). Report export.' },
  public: { kind: 'route shell', padded: true, sub: 'public-layout.vue', use: 'Public / system page — upgrade or restore in progress.' },
  'monitor-hierarchy': { kind: 'content layout', nav: true, header: true, twoPane: 'tree', sub: 'monitor-hierarchy-layout.vue', use: 'Left hierarchy tree + content. Renders inside Layout.' },
  settings: { kind: 'content layout', nav: true, header: true, twoPane: 'menu', sub: 'settings/views/main.vue', use: 'splitpanes: left menu + content. Inside Layout.' },
}
const props = defineProps({ shell: { type: String, default: 'layout' } })
const cfg = computed(() => CFG[props.shell] || CFG.layout)
const tree = [{ i: 0, o: 1 }, { i: 1, o: 0 }, { i: 1, o: 0 }, { i: 0, o: 1 }, { i: 1, o: 0 }, { i: 0, o: 1 }]
</script>

<template>
  <div class="shell">
    <!-- bare: centered sign-in card (LoginLayout) -->
    <div v-if="cfg.bare" class="login">
      <div class="card">
        <span class="avatar"></span>
        <div class="signin">Sign in</div>
        <div class="ifield"></div><div class="ifield"></div>
        <div class="ibtn"></div>
      </div>
    </div>
    <template v-else>
      <div v-if="cfg.nav" class="rail">
        <span class="logo"></span>
        <span v-for="i in 6" :key="i" class="nico" :class="{ on: i === 2 }"></span>
      </div>
      <div class="cc">
        <div v-if="cfg.header" class="hdr">
          <span class="brand"></span>
          <span class="acts"><span class="ai"></span><span class="ai"></span><span class="ai bare"></span></span>
        </div>
        <div class="body" :class="{ padded: cfg.padded }">
          <div v-if="cfg.twoPane === 'tree'" class="pane tree">
            <div v-for="(r, i) in tree" :key="i" class="trow" :style="{ marginLeft: (r.i * 14) + 'px' }"><span class="tcar">{{ r.o ? '▾' : '▸' }}</span><span class="tbar"></span></div>
          </div>
          <div v-else-if="cfg.twoPane === 'menu'" class="pane menu">
            <div class="mhead">SETTINGS</div>
            <div v-for="n in 6" :key="n" class="mrow" :class="{ on: n === 2 }"></div>
          </div>
          <div class="content">
            <div class="ptitle">Page title</div>
            <div class="rule"></div>
            <div v-for="n in 5" :key="n" class="line" :style="{ width: n === 5 ? '55%' : '100%' }"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; color: var(--page-text-color, #1d2a3e); font-family: jetBrainsMono, 'JetBrains Mono', monospace; }
.shell { display: flex; width: 100%; max-width: 780px; margin: 0 auto; height: 340px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--page-background-color); }
.rail { width: 54px; flex-shrink: 0; background: var(--nav-panel-bg); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; padding: 11px 0; gap: 8px; }
.logo { width: 24px; height: 24px; border-radius: 50%; background: var(--code-tag-background-color); border: 1px solid var(--border-color); margin-bottom: 3px; }
.nico { width: 28px; height: 26px; border-radius: 7px; background: var(--code-tag-background-color); border: 1px solid var(--border-color); }
.nico.on { background: var(--primary); border: none; }
.cc { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.hdr { display: flex; align-items: center; justify-content: space-between; height: 42px; border-bottom: 1px solid var(--border-color); padding: 0 14px; flex-shrink: 0; }
.brand { width: 80px; height: 13px; border-radius: 4px; background: var(--code-tag-background-color); }
.acts { display: flex; align-items: center; gap: 7px; }
.ai { width: 22px; height: 22px; border-radius: 50%; background: var(--code-tag-background-color); border: 1px solid var(--border-color); }
.ai.bare { border: none; }
.body { flex: 1; min-height: 0; display: flex; background: var(--page-background-color); }
.body.padded { padding: 14px; }
.pane { width: 32%; border-right: 1px solid var(--border-color); padding: 12px 10px; display: flex; flex-direction: column; gap: 8px; overflow: hidden; }
.trow { display: flex; align-items: center; gap: 6px; }
.tcar { font-size: 9px; color: var(--neutral-light); }
.tbar { flex: 1; height: 8px; background: var(--code-tag-background-color); border-radius: 3px; }
.mhead { font-size: 9px; font-weight: 700; letter-spacing: .5px; color: var(--neutral-light); }
.mrow { height: 9px; border-radius: 3px; background: var(--code-tag-background-color); margin-bottom: 1px; }
.mrow.on { background: var(--nav-hover-bg); }
.content { flex: 1; min-width: 0; padding: 14px 16px; display: flex; flex-direction: column; }
.ptitle { font-weight: 600; font-size: 17px; margin-bottom: 9px; }
.rule { height: 1px; background: var(--border-color); margin-bottom: 14px; }
.line { height: 15px; border-radius: 4px; background: var(--code-tag-background-color); margin-bottom: 12px; }
/* login card */
.login { flex: 1; display: flex; align-items: center; justify-content: center; }
.card { width: 240px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--page-background-color); box-shadow: 0 8px 24px var(--neutral-shadow-light); padding: 22px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--code-tag-background-color); border: 1px solid var(--border-color); }
.signin { font-weight: 600; font-size: 14px; }
.ifield { width: 100%; height: 30px; border-radius: 5px; background: var(--code-tag-background-color); border: 1px solid var(--border-color); }
.ibtn { width: 100%; height: 32px; border-radius: 5px; background: var(--primary); }
</style>
