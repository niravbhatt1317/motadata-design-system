<script setup>
// <obs-user-menu> — the interactive header ACCOUNT menu (App Chrome family): an avatar/initials trigger that opens
// a dropdown with a user header, account links, an optional theme toggle, and a danger Logout. Self-contained
// (renders its own trigger + top-layer popover) so it drops straight into <obs-app-header slot="user"> — or stands
// alone anywhere. The turnkey form of the `user-menu` recipe (compose obs-menu yourself for the granular path).
// Product source: components/layout/user-dropdown.vue (MPopover + avatar → My Profile / Setup Guide / Docs / theme / Logout).
// Reuses obs-icon (row glyphs) + obs-switch (the theme toggle). Popover pattern mirrors obs-menu (Popover API).
// The Dark/Light/Auto switcher is BUILT-IN and FUNCTIONAL by default: picking a mode flips the whole document
// (data-theme='dark-theme' on <html>, matching the DS CSS + showcase), persists the choice, and Auto follows the
// OS. No consumer wiring needed — anything built with the DS gets a working theme switch out of the box. Set
// manage-theme="false" to make it emit-only (the app applies the theme itself).
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, useHost } from 'vue'
const props = defineProps({
  name: { type: String, default: '' },            // display name shown in the dropdown header
  subtitle: { type: String, default: '' },        // secondary header line (email / role)
  avatar: { type: String, default: '' },          // avatar image src; if empty → initials
  initials: { type: String, default: '' },        // explicit initials (else derived from `name`)
  items: { type: [String, Array], default: '' },  // account links [{key,label,icon?,href?,danger?,divider?}]
  themeToggle: { type: [Boolean, String], default: true }, // show the Dark/Light/Auto theme switcher
  theme: { type: String, default: 'auto' },                // current theme selection: dark | light | auto
  manageTheme: { type: [Boolean, String], default: true }, // apply the chosen theme to <html> itself (built-in). false → emit-only
  logout: { type: [Boolean, String], default: true },      // show the danger Logout row
  logoutLabel: { type: String, default: 'Logout' },
  placement: { type: String, default: 'bottom-end' },      // bottom-end | bottom-start
})
const emit = defineEmits(['select', 'logout', 'theme', 'show', 'hide'])
const host = useHost()
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'
const parseArr = (v) => {
  if (Array.isArray(v)) return v
  const s = String(v || '').trim()
  if (s.startsWith('[')) { try { return JSON.parse(s) } catch { return [] } }
  return s ? s.split(',').map((x) => ({ key: x.trim(), label: x.trim() })) : []
}
const links = computed(() => parseArr(props.items))
const glyphs = computed(() => (props.initials
  ? props.initials
  : String(props.name || '').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()) || '')

const open = ref(false)
const curTheme = ref(props.theme || 'auto')

// --- built-in theme control: flip <html data-theme> so every DS token switches, exactly like the DS CSS/showcase ---
const managing = () => on(props.manageTheme) && typeof document !== 'undefined'
let mql = null
const prefersDark = () => (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
const resolvedDark = (mode) => (mode === 'dark' ? true : mode === 'light' ? false : prefersDark())
function onMql() { if (curTheme.value === 'auto') applyTheme('auto') }
function applyTheme(mode) {
  if (!managing()) return
  const dark = resolvedDark(mode)
  document.documentElement.setAttribute('data-theme', dark ? 'dark-theme' : '')
  try { localStorage.setItem('obs-theme-mode', mode); localStorage.setItem('obs-theme', dark ? 'dark' : 'light') } catch (e) { /* private mode */ }
  // Auto: track OS changes while it stays the selection
  if (mql && mql.removeEventListener) mql.removeEventListener('change', onMql)
  mql = null
  if (mode === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
    mql = window.matchMedia('(prefers-color-scheme: dark)')
    if (mql.addEventListener) mql.addEventListener('change', onMql)
  }
}
watch(() => props.theme, (v) => { curTheme.value = v || 'auto'; applyTheme(curTheme.value) })
onMounted(() => {
  // restore the user's OWN prior choice (don't hijack the page's initial theme when nothing was chosen yet)
  if (managing()) {
    let saved = null
    try { saved = localStorage.getItem('obs-theme-mode') } catch (e) { saved = null }
    if (saved) { curTheme.value = saved; applyTheme(saved) }
  }
})
const rootRef = ref(null)
const panelRef = ref(null)
const panelPos = ref({})

function positionPanel() {
  nextTick(() => {
    const r = rootRef.value && rootRef.value.getBoundingClientRect()
    if (!r) return
    const width = 240
    const endAligned = props.placement !== 'bottom-start'
    const left = endAligned ? Math.round(r.right - width) : Math.round(r.left)
    panelPos.value = { position: 'fixed', inset: 'auto', margin: '0', left: `${Math.max(8, left)}px`, top: `${Math.round(r.bottom + 6)}px`, minWidth: `${width}px` }
    const p = panelRef.value
    if (p && p.showPopover) { try { p.showPopover() } catch (e) { /* already open */ } }
  })
}
function openMenu() { open.value = true; emit('show'); positionPanel() }
function closeMenu() { if (!open.value) return; open.value = false; const p = panelRef.value; if (p && p.hidePopover) { try { p.hidePopover() } catch (e) {} } emit('hide') }
function toggle() { open.value ? closeMenu() : openMenu() }
function onSelect(it) { if (it.divider) return; emit('select', it.key ?? it.label); closeMenu() }
function onLogout() { emit('logout'); closeMenu() }
// reuse the DS segmented radio (obs-radio as-button) for the Dark/Light/Auto switcher; each option carries an
// obs-icon tag as its icon (obs-radio renders a leading `<` string via v-html → composes obs-icon)
const themeOptions = JSON.stringify([
  { value: 'dark', label: 'Dark', icon: '<obs-icon name="moon" size="14"></obs-icon>' },
  { value: 'light', label: 'Light', icon: '<obs-icon name="sun" size="14"></obs-icon>' },
  { value: 'auto', label: 'Auto', icon: '<obs-icon name="theme-auto" size="14"></obs-icon>' },
])
function onTheme(e) { const v = Array.isArray(e.detail) ? e.detail[0] : (e.detail ?? ''); curTheme.value = String(v); applyTheme(curTheme.value); emit('theme', { value: curTheme.value }) }
function onDocClick(e) { if (!open.value) return; const p = e.composedPath ? e.composedPath() : []; if (p.includes(rootRef.value) || p.includes(panelRef.value)) return; closeMenu() }
function onKey(e) { if (e.key === 'Escape') closeMenu() }
if (typeof document !== 'undefined') { document.addEventListener('click', onDocClick, true); document.addEventListener('keydown', onKey, true) }
onBeforeUnmount(() => { if (typeof document !== 'undefined') { document.removeEventListener('click', onDocClick, true); document.removeEventListener('keydown', onKey, true) } if (mql && mql.removeEventListener) mql.removeEventListener('change', onMql) })
</script>

<template>
  <div ref="rootRef" class="um">
    <button type="button" class="avatar" :class="{ act: open }" aria-label="Account menu" :aria-expanded="String(open)" @click.stop="toggle">
      <img v-if="avatar" :src="avatar" alt="" class="ava-img" />
      <span v-else class="ava-txt">{{ glyphs || '?' }}</span>
    </button>

    <div v-if="open" ref="panelRef" popover="manual" class="panel" :style="panelPos" role="menu">
      <!-- header: avatar + name + subtitle -->
      <div v-if="name || subtitle" class="uhead">
        <span class="uh-ava"><img v-if="avatar" :src="avatar" alt="" /><span v-else>{{ glyphs || '?' }}</span></span>
        <span class="uh-txt"><span class="uh-name">{{ name }}</span><span v-if="subtitle" class="uh-sub">{{ subtitle }}</span></span>
      </div>
      <obs-divider v-if="name || subtitle" class="udiv"></obs-divider>
      <!-- account links -->
      <div class="ugroup">
        <template v-for="(it, i) in links">
          <obs-divider v-if="it.divider" :key="'d' + i" class="udiv"></obs-divider>
          <a v-else-if="it.href" :key="'a' + i" :href="it.href" class="urow" :class="{ danger: it.danger }" role="menuitem" @click="onSelect(it)">
            <obs-icon v-if="it.icon" class="uico" :name="it.icon" size="15"></obs-icon><span class="ulbl">{{ it.label }}</span>
          </a>
          <button v-else :key="'b' + i" type="button" class="urow" :class="{ danger: it.danger }" role="menuitem" @click="onSelect(it)">
            <obs-icon v-if="it.icon" class="uico" :name="it.icon" size="15"></obs-icon><span class="ulbl">{{ it.label }}</span>
          </button>
        </template>
      </div>
      <!-- theme switcher — REUSES the DS segmented radio (obs-radio as-button) for Dark / Light / Auto -->
      <template v-if="on(themeToggle)">
        <obs-divider class="udiv"></obs-divider>
        <obs-radio class="tsw" as-button block size="default" :options="themeOptions" :value="curTheme" @change="onTheme"></obs-radio>
      </template>
      <!-- danger logout -->
      <template v-if="on(logout)">
        <obs-divider class="udiv"></obs-divider>
        <div class="ugroup">
          <button type="button" class="urow danger" role="menuitem" @click="onLogout">
            <obs-icon class="uico" name="signOutAlt" size="15"></obs-icon><span class="ulbl">{{ logoutLabel }}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button, a { font-family: inherit; }
:host { font-family: var(--font-family, 'Poppins', sans-serif); display: inline-block; }
.um { display: inline-block; }
/* avatar trigger — matches the app-header 32px avatar */
.avatar { width: 32px; height: 32px; border: 0; border-radius: 50%; padding: 0; cursor: pointer; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--primary, #111c2c); color: var(--white-regular, #fff); font-size: 12px; font-weight: 600;
  transition: box-shadow .15s; }
.avatar.act { box-shadow: 0 0 0 3px var(--neutral-lighter, #dfe5ef); }
.ava-img { width: 100%; height: 100%; object-fit: cover; }
.ava-txt { line-height: 1; }

/* dropdown panel (top layer) — tight; --divider-my keeps the reused obs-divider compact between groups */
.panel { padding: 5px; background: var(--page-background-color, #fff); border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 8px; box-shadow: 0 6px 20px var(--neutral-shadow-light, rgba(29, 42, 62, .14));
  color: var(--page-text-color, #1d2a3e); font-size: 0.8rem; --divider-my: 5px; }
.panel[popover] { margin: 0; inset: auto; overflow: visible; }

/* header */
.uhead { display: flex; align-items: center; gap: 10px; padding: 6px 8px; }
.uh-ava { width: 32px; height: 32px; border-radius: 50%; flex: 0 0 auto; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--primary, #111c2c); color: var(--white-regular, #fff); font-size: 13px; font-weight: 600; }
.uh-ava img { width: 100%; height: 100%; object-fit: cover; }
.uh-txt { display: flex; flex-direction: column; min-width: 0; }
.uh-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uh-sub { color: var(--neutral-light, #6a7fa0); font-size: 0.72rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* rows */
.ugroup { display: flex; flex-direction: column; }
.urow { display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box; padding: 7px 8px; border: 0; border-radius: 5px;
  background: transparent; color: var(--page-text-color, #1d2a3e); font-size: 0.8rem; text-align: left; text-decoration: none; cursor: pointer; }
.urow:hover { background: var(--neutral-lighter, #e3e8f2); }
.urow.danger { color: var(--secondary-red, #ec5b5b); }
.uico { flex: 0 0 auto; }
.ulbl { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* reused obs-divider between groups (compact — no default 1rem margin) */
.udiv { display: block; }
/* theme switcher — the reused obs-radio (full-width segmented), inset to align with the rows */
.tsw { display: block; width: 100%; box-sizing: border-box; padding: 2px 4px; }
</style>
