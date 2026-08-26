<script setup>
// <obs-noc-player> — the NOC / wallboard ROTATOR chrome (Playback & Timeline family): a top bar that cycles a set of
// dashboards on a countdown — logo (left) · ‹ prev · current title · next › (center) · countdown + play/pause + exit
// (right) — over a body slot that holds the current dashboard. Self-contained playback: an internal countdown timer
// auto-advances; prev/next/space/Esc/←/→ drive it. Data-agnostic: it owns the rotation + emits `change`/`close`; the
// consumer renders the actual dashboard (widget grid) in the default slot. Source-derived from
// dashboard/components/noc-player.vue.
//
//   <obs-noc-player dashboards='["Network","Servers","Apps"]' interval="30"><!-- dashboard body --></obs-noc-player>
//   emits: change -> {index,name} · close · play · pause
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
  dashboards: { type: [String, Array], default: '' }, // [{name}] or a JSON/comma list of names to rotate
  current: { type: [Number, String], default: 0 },    // starting index
  interval: { type: [Number, String], default: 30 },  // seconds per dashboard
  paused: { type: [Boolean, String], default: false }, // start paused
  logo: { type: String, default: '' },                // brand logo image src (or use the `logo` slot)
  fullscreen: { type: [Boolean, String], default: false }, // fixed full-viewport overlay (the real wallboard mode)
})
const emit = defineEmits(['change', 'close', 'play', 'pause'])
const on = (v) => v !== false && v != null && v !== 'false' && v !== '0' && v !== 'no'

const list = computed(() => {
  const raw = props.dashboards
  if (Array.isArray(raw)) return raw.map((d) => (typeof d === 'string' ? { name: d } : d))
  const s = String(raw || '').trim()
  if (!s) return []
  if (s[0] === '[') { try { return JSON.parse(s).map((d) => (typeof d === 'string' ? { name: d } : d)) } catch (e) { return [] } }
  return s.split(',').map((n) => ({ name: n.trim() })).filter((d) => d.name)
})
const idx = ref(Number(props.current) || 0)
const seconds = computed(() => Math.max(1, Number(props.interval) || 30))
const countdown = ref(seconds.value)
const isPaused = ref(on(props.paused))
const isFullscreen = computed(() => on(props.fullscreen))
const many = computed(() => list.value.length > 1)
const currentName = computed(() => (list.value[idx.value] ? list.value[idx.value].name : ''))

watch(() => props.current, (v) => { idx.value = Number(v) || 0 })
watch(() => props.paused, (v) => { isPaused.value = on(v) })

let timer = null
function stop () { if (timer) { clearInterval(timer); timer = null } }
function start () {
  stop()
  if (isPaused.value || !many.value) return
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) { advance(1) }
  }, 1000)
}
function advance (dir) {
  const len = list.value.length
  if (!len) return
  idx.value = (idx.value + dir + len) % len
  countdown.value = seconds.value
  emit('change', { index: idx.value, name: currentName.value })
}
function next () { advance(1); if (!isPaused.value) start() }
function prev () { advance(-1); if (!isPaused.value) start() }
function toggle () { isPaused.value = !isPaused.value; if (isPaused.value) { stop(); emit('pause') } else { countdown.value = seconds.value; start(); emit('play') } }
function close () { emit('close') }
function onKey (e) {
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === ' ') { e.preventDefault(); toggle() }
}
onMounted(() => { countdown.value = seconds.value; start(); if (isFullscreen.value) document.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { stop(); document.removeEventListener('keydown', onKey) })
watch([seconds, list, isPaused], () => { start() })
</script>

<template>
  <div class="noc" :class="{ fs: isFullscreen }">
    <div class="bar">
      <div class="side">
        <slot name="logo"><img v-if="logo" :src="logo" class="logo" alt="logo" /></slot>
      </div>
      <div class="center">
        <obs-button v-if="many" class="sq" variant="neutral-lightest" squared title="Previous" aria-label="Previous dashboard" @click="prev">
          <obs-icon name="chevronLeft" size="16"></obs-icon>
        </obs-button>
        <h3 class="title" :title="currentName">{{ currentName }}</h3>
        <obs-button v-if="many" class="sq" variant="neutral-lightest" squared title="Next" aria-label="Next dashboard" @click="next">
          <obs-icon name="chevronRight" size="16"></obs-icon>
        </obs-button>
      </div>
      <div class="side right">
        <span v-if="many" class="count" :title="`${countdown}s until next dashboard`">{{ countdown }}</span>
        <obs-button v-if="many" class="sq" variant="neutral-lightest" squared :title="isPaused ? 'Play' : 'Pause'" :aria-label="isPaused ? 'Play' : 'Pause'" @click="toggle">
          <obs-icon :name="isPaused ? 'play' : 'pause'" size="15"></obs-icon>
        </obs-button>
        <obs-button class="sq" variant="neutral-lightest" squared title="Exit (Esc)" aria-label="Exit" @click="close">
          <obs-icon name="times" size="16"></obs-icon>
        </obs-button>
      </div>
    </div>
    <div class="body">
      <div v-if="!list.length" class="empty">
        <obs-icon name="exclamationTriangle" size="40"></obs-icon>
        <p>No dashboards available in this NOC</p>
      </div>
      <slot v-else></slot>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { display: block; }
.noc { display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); }
/* the real wallboard mode = a fixed full-viewport overlay; default (showcase) is an inline block card */
.noc.fs { position: fixed; inset: 0; z-index: 1000; }
.bar { display: flex; align-items: center; padding: 0.75rem 1rem; background: var(--page-background-color, #fff); border-bottom: 1px solid var(--border-color, #e3e8f2); }
.side { display: flex; flex: 1; align-items: center; min-width: 0; }
.side.right { justify-content: flex-end; gap: 8px; }
.center { display: flex; flex: 0 1 auto; align-items: center; justify-content: center; gap: 8px; min-width: 0; max-width: 50%; }
.logo { max-height: 32px; display: block; }
.title { margin: 0; min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; font-size: 1rem; font-weight: 600; color: var(--primary, #111c2c); }
/* squared buttons REUSE obs-button (variant neutral-lightest, squared) — matches the product squared-button */
.sq { flex: none; }
.count { display: inline-flex; align-items: center; justify-content: center; min-width: 30px; height: 32px; padding: 0 8px; font-weight: 600; color: var(--primary, #111c2c); background: var(--neutral-lighter, #e3e8f2); border-radius: 4px; }
.body { flex: 1; min-height: 0; padding: 0.5rem; overflow: auto; }
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; min-height: 180px; color: var(--neutral-light, #6a7fa0); }
.empty p { margin: 0; }
</style>
