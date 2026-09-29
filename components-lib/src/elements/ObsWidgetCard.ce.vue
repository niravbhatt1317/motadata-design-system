<script setup>
// <obs-widget-card> — the dashboard widget CARD chrome (product widget-title.vue + widget-layout.vue):
// grey header (title) + hover-revealed time badge + kebab (Full Screen · Share · Edit · Clone · Remove),
// a body SLOT for any chart, a bottom-right resize grip, and the header as a drag handle. The card doesn't
// own its position — it dispatches `card-dragstart` / `card-resizestart` (composed, bubbling) so an
// <obs-widget-grid> parent can drive the layout. Standalone (no grid) it's just a static card.
import { ref, onMounted, onBeforeUnmount, useHost } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  time: { type: String, default: '' },     // the hover time-range badge, e.g. '1h 12m'
  static: { type: Boolean, default: false }, // opt out of drag/resize (chrome only)
})
const emit = defineEmits(['action'])
const host = useHost()
const menuOpen = ref(false)

const MENU = [
  { key: 'fullscreen', label: 'Full Screen', icon: 'fullscreen' },
  { key: 'share', label: 'Share', icon: 'shareAlt' },
  { key: 'edit', label: 'Edit', icon: 'pencil' },
  { key: 'clone', label: 'Clone', icon: 'clone' },
  { key: 'remove', label: 'Remove', icon: 'trash', danger: true },
]
function act(key) { menuOpen.value = false; emit('action', key); host && host.dispatchEvent(new CustomEvent('action', { detail: key, bubbles: true, composed: true })) }

function fire(name, e) {
  if (props.static || !host) return
  host.dispatchEvent(new CustomEvent(name, { detail: { clientX: e.clientX, clientY: e.clientY }, bubbles: true, composed: true }))
}
function onHeadDown(e) { if (e.button !== 0) return; fire('card-dragstart', e) }
function onResizeDown(e) { if (e.button !== 0) return; e.stopPropagation(); fire('card-resizestart', e) }

// close the kebab menu on any outside click (through the shadow boundary)
function onDocClick(e) { if (!e.composedPath().includes(host)) menuOpen.value = false }
onMounted(() => document.addEventListener('click', onDocClick, true))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick, true))
</script>

<template>
  <div class="wcard">
    <header class="whead" :class="{ grab: !static }" @pointerdown="onHeadDown">
      <span class="wtitle">{{ title }}</span>
      <div class="wactions" @pointerdown.stop>
        <span v-if="time" class="wtime">{{ time }}</span>
        <button class="wkebab" aria-label="Widget options" @click.stop="menuOpen = !menuOpen">
          <obs-icon name="ellipsisV" size="14"></obs-icon>
        </button>
      </div>
    </header>

    <div class="wbody"><slot></slot></div>

    <span v-if="!static" class="wresize" @pointerdown="onResizeDown" aria-hidden="true"></span>

    <div v-if="menuOpen" class="wmenu" @pointerdown.stop>
      <a v-for="m in MENU" :key="m.key" class="mrow" :class="{ danger: m.danger }" @click="act(m.key)">
        <obs-icon :name="m.icon" size="14"></obs-icon><span>{{ m.label }}</span>
      </a>
    </div>
  </div>
</template>

<style>
:host { display: block; height: 100%; }
:host([hidden]) { display: none !important; }
* { box-sizing: border-box; }
.wcard { position: relative; display: flex; flex-direction: column; height: 100%;
  background: var(--page-background-color, #fff); border: 1px solid var(--widget-border-color, #e3e8f2);
  border-radius: 7px; font-family: var(--font-family, 'Poppins', sans-serif); }
/* header = grey bar + drag handle */
.whead { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 5px 10px;
  background: var(--code-tag-background-color, #ecf1f9); border-radius: 7px 7px 0 0; user-select: none; }
.whead.grab { cursor: grab; }
.whead.grab:active { cursor: grabbing; }
.wtitle { font-size: 12px; font-weight: 500; color: var(--page-text-color, #1d2a3e); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* time badge + kebab reveal on hover */
.wactions { display: flex; align-items: center; gap: 8px; opacity: 0; transition: opacity .12s; }
.wcard:hover .wactions, .wcard:focus-within .wactions { opacity: 1; }
.wtime { background: var(--neutral-lighter, #e3e8f2); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 500; color: var(--neutral-regular, #7186a8); white-space: nowrap; }
.wkebab { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; padding: 0;
  border: none; background: transparent; border-radius: 4px; cursor: pointer; color: var(--neutral-regular, #7186a8); }
.wkebab:hover { background: var(--neutral-lighter, #e3e8f2); color: var(--page-text-color, #1d2a3e); }
.wbody { flex: 1; min-height: 0; overflow: hidden; padding: 10px 12px 14px; border-radius: 0 0 7px 7px; }
/* resize grip, bottom-right */
.wresize { position: absolute; right: 0; bottom: 0; width: 16px; height: 16px; cursor: nwse-resize; opacity: 0; transition: opacity .12s;
  background: linear-gradient(135deg, transparent 0 50%, var(--neutral-light, #6a7fa0) 50% 60%, transparent 60% 72%, var(--neutral-light, #6a7fa0) 72% 82%, transparent 82%); }
.wcard:hover .wresize { opacity: .6; }
/* kebab menu */
.wmenu { position: absolute; top: 32px; right: 6px; z-index: 40; min-width: 150px; padding: 4px;
  background: var(--dropdown-background, #fff); border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px;
  box-shadow: 0 6px 16px var(--neutral-shadow-light, rgba(70,70,70,.15)); }
.mrow { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 4px; font-size: 13px;
  color: var(--page-text-color, #1d2a3e); text-decoration: none; cursor: pointer; }
.mrow obs-icon { color: var(--neutral-regular, #7186a8); }
.mrow:hover { background: var(--dropdown-hover-background, #ecf1f9); }
.mrow.danger { color: var(--severity-critical, #ec5b5b); }
.mrow.danger obs-icon { color: var(--severity-critical, #ec5b5b); }
</style>
