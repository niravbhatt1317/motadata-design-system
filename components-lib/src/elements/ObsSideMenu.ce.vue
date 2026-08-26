<script setup>
// <obs-side-menu> — the in-module SECTION navigation panel. ONE element, `mode` axis folding the product's four
// side-menu forms, each transcribed from its real render (navigation.stories.js + the product sources):
//   sections   (settings/left-menu.vue, 20×) — search + accordion of icon+name sections (9px/6px rows) → sub-items;
//               active leaf: --primary on --code-tag-background-color + inset --primary left rule.
//   categories (dashboard-dropdown.vue) — a SEGMENTED Dashboard/NOC switcher + a ＋ button; search + a toggle;
//               category groups WITH count tags → child dashboards (each with a th-large icon).
//   tree       (infinite-tree.vue) — UNDERLINE tabs + search; N-level nodes: chevron + type icon (--primary-alt)
//               + name + count badge; leaves show a leading chevron + count.
//   list       (report-sidebar.vue) — UNDERLINE tabs + search; a flat list (border-split rows), ★ favourite row,
//               active in weight 600, a pencil on hover for editable rows.
// Reuses obs-input (search) + obs-icon (all glyphs). Slots: `tabs-action` (right of tabs, e.g. ＋), `search-action`
// (right of search, e.g. a layout toggle). NOT the module rail (obs-sidebar), NOT sibling views (obs-tabs).
import { computed, reactive, ref, watch, useHost } from 'vue'
const props = defineProps({
  mode: { type: String, default: 'sections' },      // sections | categories | tree | list
  items: { type: [String, Array], default: '' },     // recursive [{label,icon?,count?,favorite?,edit?,children?}]
  active: { type: String, default: '' },
  search: { type: [Boolean, String], default: true },
  placeholder: { type: String, default: 'Search' },
  tabs: { type: [String, Array], default: '' },       // [{label,value}] or ["A","B"]
  tabStyle: { type: String, default: 'underline' },   // underline (tree/list) | segmented (categories Dashboard/NOC)
  activeTab: { type: String, default: '' },
})
const emit = defineEmits(['select', 'search', 'tab'])
const host = useHost()
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const parse = (raw) => { if (Array.isArray(raw)) return raw; const s = String(raw || '').trim(); return s[0] === '[' ? JSON.parse(s) : [] }
const tree = computed(() => parse(props.items))
const tabsArr = computed(() => parse(props.tabs).map((t) => (typeof t === 'string' ? { label: t, value: t } : { label: t.label ?? t.value, value: t.value ?? t.label })))
const curTab = ref(props.activeTab || (tabsArr.value[0] && tabsArr.value[0].value) || '')
const query = ref('')
const expanded = reactive({})
function seed(nodes, ancestors) {
  for (const n of nodes) {
    const kids = Array.isArray(n.children) && n.children.length
    if (kids) { if (ancestors === 0 && Object.keys(expanded).length === 0) expanded[key(n, '')] = true; if (findLeaf(n.children, props.active)) expanded[key(n, '')] = true; seed(n.children, ancestors + 1) }
  }
}
const key = (n, path) => (path ? path + '' + n.label : n.label)
function findLeaf(nodes, label) { for (const n of nodes) { if (!(n.children && n.children.length) && n.label === label) return true; if (n.children && findLeaf(n.children, label)) return true } return false }
seed(tree.value, 0)
const matches = (n, q) => n.label.toLowerCase().includes(q) || (n.children || []).some((c) => matches(c, q))
function flatten(nodes, depth, path, out) {
  const q = query.value.trim().toLowerCase()
  for (const n of nodes) {
    const p = key(n, path)
    const kids = Array.isArray(n.children) && n.children.length
    if (q && !matches(n, q)) continue
    const open = q ? (kids && matches(n, q)) : !!expanded[p]
    out.push({ label: n.label, icon: n.icon || '', logo: n.logo || '', count: n.count, favorite: !!n.favorite, edit: !!n.edit, depth, kids, open, path: p, leaf: !kids })
    if (kids && open) flatten(n.children, depth + 1, p, out)
  }
}
const rows = computed(() => { const out = []; flatten(tree.value, 0, '', out); return out })
// per-mode left inset (px): groups vs leaves, + depth
function padLeft(r) {
  const gp = props.mode === 'categories' ? 6 : 12
  if (r.kids) return gp + r.depth * 16
  const li = ({ sections: 40, categories: 28, tree: 34, list: 12 })[props.mode] ?? 12
  return li + Math.max(0, r.depth - 1) * 16
}
// internal active tracking so clicking a leaf moves the highlight (seeded from the `active` prop)
const curActive = ref(props.active)
watch(() => props.active, (v) => { curActive.value = v })
function onRow(r) { if (r.kids) expanded[r.path] = !expanded[r.path]; else { curActive.value = r.label; emit('select', { label: r.label }) } }
function onSearch(e) { const v = Array.isArray(e.detail) ? e.detail[0] : (e.detail ?? e.target?.value); query.value = String(v ?? ''); emit('search', { query: query.value }) }
// comma-list of labels for the reused obs-tabs / obs-radio; both emit `change` with the picked value
const tabsCsv = computed(() => tabsArr.value.map((t) => t.label).join(','))
function onTab(e) { const v = Array.isArray(e.detail) ? e.detail[0] : (e.detail ?? ''); curTab.value = String(v); emit('tab', { value: curTab.value }) }
</script>

<template>
  <div class="sm" :class="'m-' + mode">
    <!-- optional branding/header slot at the very top (a logo, a section title) — 0 height when unfilled -->
    <div class="sm-logo"><slot name="logo"></slot></div>
    <!-- header: REUSE obs-tabs (underline) or obs-radio as-button (segmented) + optional action (e.g. ＋) -->
    <div v-if="tabsArr.length" class="hd" :class="{ seg: tabStyle === 'segmented' }">
      <obs-radio v-if="tabStyle === 'segmented'" class="switcher" as-button :options="tabsCsv" :value="curTab" @change="onTab"></obs-radio>
      <obs-tabs v-else class="tabbar" :tabs="tabsCsv" :value="curTab" @change="onTab"></obs-tabs>
      <slot name="tabs-action"></slot>
    </div>
    <!-- search (obs-input) + optional action (e.g. a layout toggle) -->
    <div v-if="on(search)" class="srow">
      <obs-input class="sinput" type="text" prefix-icon="search" block :placeholder="placeholder" @input="onSearch"></obs-input>
      <slot name="search-action"></slot>
    </div>
    <!-- body -->
    <div class="rows" role="tree">
      <div v-for="r in rows" :key="r.path" class="row" :class="{ group: r.kids, leaf: r.leaf, active: r.leaf && r.label === curActive }"
        :style="{ paddingLeft: padLeft(r) + 'px' }" role="treeitem" :aria-expanded="r.kids ? String(r.open) : null" @click="onRow(r)">
        <obs-icon v-if="r.kids" :name="r.open ? 'chevronDown' : 'chevronRight'" size="12" class="chev"></obs-icon>
        <obs-icon v-else-if="mode === 'tree'" name="chevronRight" size="12" class="chev leaf-chev"></obs-icon>
        <obs-icon v-if="r.favorite" name="star" size="16" class="fav"></obs-icon>
        <!-- a monitor-type LOGO takes precedence over an icon (Router/Linux/…). A bare name → obs-logo (reuse the
             logos library); a URL/data-URI → an img -->
        <template v-if="r.logo">
          <img v-if="/^(data:|https?:|\/|\.)/.test(r.logo)" :src="r.logo" class="r-logo" alt="" />
          <obs-logo v-else :name="r.logo" size="20" class="r-logo"></obs-logo>
        </template>
        <!-- product .list-icon is 1.3rem (~20px): group/type icons are large; leaf item icons a touch smaller -->
        <obs-icon v-else-if="r.icon" :name="r.icon" :size="r.kids ? 19 : 16" class="r-ic"></obs-icon>
        <span class="lbl">{{ r.label }}</span>
        <!-- count REUSES obs-tag (tag-primary, squarish 4px — NOT the rounded pill); tree adds `numeric` → JetBrains Mono -->
        <obs-tag v-if="r.count != null && r.count !== ''" class="count" variant="tag-primary" :numeric="mode === 'tree'">{{ r.count }}</obs-tag>
        <obs-icon v-if="r.edit" name="pencil" size="12" class="pencil"></obs-icon>
      </div>
    </div>
    <!-- default (footer) slot at the bottom — e.g. a "+ New Category" action below the list. 0 height when unfilled -->
    <div class="sm-foot"><slot></slot></div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: block; height: 100%; }
/* Flush panel with a RIGHT divider only (matching the product: a full-height nav column separated from the
   content by a right border — no card border/radius). Surface = --side-menu-bg: WHITE in light (stays white on a
   gray page, NOT --page-background-color which goes gray in a real app's content area — the old bug), and the deep
   #07101f in dark (owner: side menus use the product's deepest surface, matching drawer/modal dark bg). */
.sm { display: flex; flex-direction: column; box-sizing: border-box; width: 100%; height: 100%; color: var(--page-text-color, #1d2a3e); border-right: 1px solid var(--border-color, #e3e8f2); overflow: hidden; font-size: 13px; background: var(--side-menu-bg, #fff); }
/* optional header (logo) + footer (default) slots — no box when the slot is unfilled; slotted content brings its own spacing */
.sm-logo, .sm-foot { display: block; flex: 0 0 auto; }
/* ── header ── REUSED components: obs-tabs (underline) / obs-radio as-button (segmented) */
.hd { display: flex; align-items: center; }
.hd:not(.seg) { padding: 0 12px; }
.tabbar { flex: 1; min-width: 0; }
/* segmented switcher (categories Dashboard/NOC) fills the header; the ＋ action sits on the right */
.hd.seg { gap: 10px; padding: 10px 8px 2px; }
.switcher { flex: 1; min-width: 0; }
/* ── search row ── the search input matches a 35px squared action button (custom prop pierces obs-input's shadow) */
.srow { display: flex; align-items: center; gap: 8px; padding: 8px; --input-height-base: 35px; }
.sinput { flex: 1; min-width: 0; }
/* ── rows ── */
/* theme-aware scrollbar — the shadow DOM doesn't inherit the app's scrollbar styling, so a scroll region defaults
   to the browser's (bright/white) bar, which reads badly on the dark #07101f surface. Use the DS scrollbar-thumb
   token (dark rgba(160,160,160,.5)) on a transparent track, thin. */
.rows { flex: 1; overflow: auto; padding-bottom: 6px; min-height: 0; scrollbar-width: thin; scrollbar-color: var(--utility-scrollbar-thumb, rgba(136,136,136,0.4)) transparent; }
.rows::-webkit-scrollbar { width: 8px; height: 8px; }
.rows::-webkit-scrollbar-track { background: transparent; }
.rows::-webkit-scrollbar-thumb { background: var(--utility-scrollbar-thumb, rgba(136,136,136,0.4)); border-radius: 4px; }
.row { display: flex; align-items: center; gap: 8px; padding: 7px 12px; cursor: pointer; text-decoration: none; color: inherit; }
.row.group { font-weight: 500; }
.chev { color: var(--neutral-light, #6a7fa0); flex-shrink: 0; width: 14px; }
.r-ic { color: var(--neutral-light, #6a7fa0); flex-shrink: 0; }
.lbl { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav { color: var(--secondary-yellow, #f5bc18); flex-shrink: 0; }
.count { flex-shrink: 0; }
/* monitor-type logo (Router/Linux/Windows) — the product renders a 20px logo image, not a monochrome icon */
.r-logo { flex-shrink: 0; width: 20px; height: 20px; object-fit: contain; display: block; }
.pencil { color: var(--neutral-light, #6a7fa0); flex-shrink: 0; visibility: hidden; }
.row:hover .pencil, .row.active .pencil { visibility: visible; }
/* hover on ANY non-active row — groups AND leaves get the same background (matching the product) */
.row:not(.active):hover { background: var(--nav-hover-bg, #ecf1f9); }
/* active leaf */
.row.leaf.active { color: var(--primary, #111c2c); background: var(--code-tag-background-color, #ecf1f9); }
/* ── per-mode row metrics (transcribed from the story) ── */
.m-sections .row.group { padding-top: 9px; padding-bottom: 9px; font-size: 13px; }
.m-sections .row.leaf { padding-top: 6px; padding-bottom: 6px; font-size: 13px; }
.m-sections .row.leaf.active { box-shadow: inset 2px 0 0 var(--primary, #111c2c); }
.m-categories .row.group { padding-top: 9px; padding-bottom: 9px; padding-right: 6px; font-size: 14px; }
.m-categories .row.leaf { padding-top: 7px; padding-bottom: 7px; padding-right: 6px; font-size: 13px; }
.m-tree .row.group { padding-top: 6px; padding-bottom: 6px; font-size: 13px; }
.m-tree .row.group .r-ic { color: var(--primary-alt, #1d2a3e); }
.m-tree .row.leaf { padding-top: 5px; padding-bottom: 5px; font-size: 13px; }
.m-tree .leaf-chev { width: 14px; }
.m-list .row { padding-top: 9px; padding-bottom: 9px; font-size: 14px; border-bottom: 1px solid var(--border-color, #e3e8f2); }
.m-list .row.active { font-weight: 500; } /* product .selection-menu selected = weight 500 (not 600) */
</style>
