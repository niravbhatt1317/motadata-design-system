<script setup>
// <obs-notification-menu> — the interactive header NOTIFICATION panel (App Chrome family): a bell + unread-count
// badge trigger that opens a dropdown with a title, Alerts/System tabs, a scrollable list of notification rows
// (severity dot + text + time), and a View all / Clear all footer. Self-contained (renders its own trigger +
// top-layer popover) so it drops into <obs-app-header> (default slot / actions area), or stands alone. The turnkey
// form of the `notification-dropdown` recipe. Product source: components/layout/notification-dropdown.vue
// (MPopover + MBadge + MTab + RecycleScroller). Reuses obs-icon (bell + row glyphs) + obs-tabs (the tab strip).
import { ref, computed, nextTick, onBeforeUnmount, useHost } from 'vue'
const props = defineProps({
  count: { type: [Number, String], default: 0 },      // unread count shown in the badge (0 → no badge)
  title: { type: String, default: 'Alerts & Notifications' }, // panel header title
  tabs: { type: [String, Array], default: 'Alerts,System' }, // tab labels (comma-list or JSON)
  items: { type: [String, Array], default: '' },       // [{tab?, severity?, text, time?, unread?}]
  placement: { type: String, default: 'bottom-end' },  // bottom-end | bottom-start
  clearLabel: { type: String, default: 'Clear all' },
  viewallLabel: { type: String, default: 'View all' },
  emptyText: { type: String, default: 'You’re all caught up' },
})
const emit = defineEmits(['select', 'tab', 'clear', 'viewall', 'show', 'hide'])
const host = useHost()
const parseArr = (v) => {
  if (Array.isArray(v)) return v
  const s = String(v || '').trim()
  if (s.startsWith('[')) { try { return JSON.parse(s) } catch { return [] } }
  return s ? s.split(',').map((x) => x.trim()) : []
}
const tabList = computed(() => parseArr(props.tabs).map((t) => (typeof t === 'string' ? t : t.label)))
const allItems = computed(() => parseArr(props.items))
const badge = computed(() => { const n = Number(props.count) || 0; return n > 0 ? (n > 99 ? '99+' : String(n)) : '' })

const open = ref(false)
const curTab = ref('')
const rootRef = ref(null)
const panelRef = ref(null)
const panelPos = ref({})
// base tabs (label + optional explicit count); the tab KEY is the base label (so item.tab matches), the DISPLAY
// appends the count "Label (N)" like the product (Alerts (191) / System Notification (1822))
const baseTabs = computed(() => parseArr(props.tabs).map((t) => (typeof t === 'string' ? { label: t } : t)))
const keyOf = (t) => String(t.value ?? t.label)
const countOf = (t) => (t.count != null ? t.count : allItems.value.filter((r) => r.tab && String(r.tab).toLowerCase() === keyOf(t).toLowerCase()).length)
const tabsJson = computed(() => JSON.stringify(baseTabs.value.map((t) => { const c = countOf(t); return { key: keyOf(t), label: (c || c === 0) ? `${t.label} (${c})` : t.label } })))
const rows = computed(() => {
  const t = curTab.value || (baseTabs.value[0] && keyOf(baseTabs.value[0])) || ''
  return allItems.value.filter((r) => !r.tab || String(r.tab).toLowerCase() === String(t).toLowerCase())
})

function positionPanel() {
  nextTick(() => {
    const r = rootRef.value && rootRef.value.getBoundingClientRect()
    if (!r) return
    const width = 420
    const endAligned = props.placement !== 'bottom-start'
    const left = endAligned ? Math.round(r.right - width) : Math.round(r.left)
    panelPos.value = { position: 'fixed', inset: 'auto', margin: '0', left: `${Math.max(8, left)}px`, top: `${Math.round(r.bottom + 6)}px`, width: `${width}px` }
    const p = panelRef.value
    if (p && p.showPopover) { try { p.showPopover() } catch (e) { /* already open */ } }
  })
}
function openMenu() { if (!curTab.value) curTab.value = (baseTabs.value[0] && keyOf(baseTabs.value[0])) || ''; open.value = true; emit('show'); positionPanel() }
function closeMenu() { if (!open.value) return; open.value = false; const p = panelRef.value; if (p && p.hidePopover) { try { p.hidePopover() } catch (e) {} } emit('hide') }
function toggle() { open.value ? closeMenu() : openMenu() }
function onTab(e) { const v = Array.isArray(e.detail) ? e.detail[0] : (e.detail ?? ''); curTab.value = String(v); emit('tab', { value: curTab.value }) }
function onRow(r, i) { emit('select', { index: i, ...r }); }
function onClear() { emit('clear', { tab: curTab.value }) }
function onViewAll() { emit('viewall', { tab: curTab.value }); closeMenu() }
function onDocClick(e) { if (!open.value) return; const p = e.composedPath ? e.composedPath() : []; if (p.includes(rootRef.value) || p.includes(panelRef.value)) return; closeMenu() }
function onKey(e) { if (e.key === 'Escape') closeMenu() }
if (typeof document !== 'undefined') { document.addEventListener('click', onDocClick, true); document.addEventListener('keydown', onKey, true) }
onBeforeUnmount(() => { if (typeof document !== 'undefined') { document.removeEventListener('click', onDocClick, true); document.removeEventListener('keydown', onKey, true) } })
</script>

<template>
  <div ref="rootRef" class="nm">
    <button type="button" class="bell" :class="{ act: open }" aria-label="Notifications" :aria-expanded="String(open)" @click.stop="toggle">
      <obs-icon name="bell" size="18"></obs-icon>
      <span v-if="badge" class="badge">{{ badge }}</span>
    </button>

    <div v-if="open" ref="panelRef" popover="manual" class="panel" :style="panelPos" role="dialog" aria-label="Notifications">
      <div class="nhead"><span class="nh-title">{{ title }}</span></div>
      <obs-tabs v-if="baseTabs.length > 1" class="ntabs" :tabs="tabsJson" :value="curTab" @change="onTab"></obs-tabs>
      <div class="nlist" role="list">
        <button v-for="(r, i) in rows" :key="i" type="button" class="nrow" :class="{ unread: r.unread }" role="listitem" @click="onRow(r, i)">
          <span class="nbar" :style="{ background: r.severity ? 'var(--severity-' + r.severity + ', var(--neutral-light, #8e9fbc))' : 'var(--neutral-light, #8e9fbc)' }"></span>
          <span class="nbody">
            <span class="ntitle">{{ r.text ?? r.title ?? r.label }}</span>
            <span v-if="r.detail" class="ndetail">{{ r.detail }}</span>
            <span v-if="r.time" class="ntime">{{ r.time }}</span>
          </span>
          <obs-tag v-if="r.tag" class="ntag" variant="tag-primary" rounded>{{ r.tag }}</obs-tag>
        </button>
        <div v-if="!rows.length" class="nempty">
          <obs-icon name="bell" size="22" class="ne-ic"></obs-icon>
          <span>{{ emptyText }}</span>
        </div>
      </div>
      <div class="nfoot">
        <obs-link class="nf-link" @click="onViewAll">{{ viewallLabel }}</obs-link>
        <span class="nf-sep">|</span>
        <obs-link class="nf-link" @click="onClear">{{ clearLabel }}</obs-link>
      </div>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { font-family: var(--font-family, 'Poppins', sans-serif); display: inline-block; }
.nm { display: inline-block; }
/* bell trigger — matches the app-header 36px circular action button */
.bell { position: relative; width: 36px; height: 36px; border: 0; border-radius: 50%; padding: 0; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  background: none; color: var(--neutral-light, #6a7fa0); transition: background .15s, color .15s; }
.bell:hover, .bell.act { background: var(--neutral-lighter, #e3e8f2); color: var(--page-text-color, #1d2a3e); }
.badge { position: absolute; top: 3px; right: 3px; min-width: 15px; height: 15px; padding: 0 3px; box-sizing: border-box;
  border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;
  background: var(--secondary-red, #ec5b5b); color: var(--white-regular, #fff); font-size: 9px; font-weight: 600; line-height: 1; }

/* panel */
.panel { padding: 0; background: var(--page-background-color, #fff); border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 8px; box-shadow: 0 6px 20px var(--neutral-shadow-light, rgba(29, 42, 62, .14));
  color: var(--page-text-color, #1d2a3e); font-size: 0.8rem; overflow: hidden; }
.panel[popover] { margin: 0; inset: auto; }
/* header — the title on a subtle tinted bar (product: "Alerts & Notifications"). Tight vertical padding */
.nhead { padding: 8px 16px; background: var(--code-tag-background-color, #eef2f8); }
.nh-title { font-weight: 600; font-size: 0.92rem; }
.ntabs { display: block; padding: 4px 16px 0; border-bottom: 1px solid var(--border-color, #e3e8f2); }
/* list */
.nlist { max-height: 400px; overflow: auto; padding: 0; }
/* a row = a coloured severity BAR on the left edge + a body (title / optional detail / timestamp) + an optional
   right tag. NO resting background — hover only (product) */
.nrow { display: flex; align-items: stretch; gap: 12px; width: 100%; box-sizing: border-box; padding: 9px 16px 9px 0; border: 0;
  border-bottom: 1px solid var(--border-color, #e3e8f2); background: transparent; color: var(--page-text-color, #1d2a3e);
  font-size: 0.8rem; text-align: left; cursor: pointer; }
.nrow:hover { background: var(--neutral-lightest, #f3f5f9); }
.nbar { width: 3px; flex: 0 0 auto; border-radius: 0 2px 2px 0; align-self: stretch; }
.nbody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; padding-left: 13px; }
.ntitle { line-height: 1.35; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ndetail { line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ntime { color: var(--neutral-light, #8e9fbc); font-size: 0.72rem; }
.ntag { flex: 0 0 auto; align-self: center; }
.nempty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 34px 12px; color: var(--neutral-light, #8e9fbc); }
.ne-ic { color: var(--neutral-lighter, #c3cee0); }
/* footer — View All | Clear All (reused obs-link), centred, on a subtle bar. Tight vertical padding */
.nfoot { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 7px 10px; background: var(--code-tag-background-color, #eef2f8); }
.nf-link { cursor: pointer; }
.nf-sep { color: var(--neutral-light, #8e9fbc); }
</style>
