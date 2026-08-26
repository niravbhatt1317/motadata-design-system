<script setup>
// <obs-logo> — renders a product monitor-type LOGO by name (Router, Linux, Windows, MySQL, Docker, AWS, …), the
// full-colour brand/technology marks from the product logo library (Assets → Logos). The logo counterpart of
// <obs-icon> (which draws monochrome glyphs): use a LOGO for a technology/vendor/monitor-type (they carry brand
// colour); use an ICON for a UI affordance. Names are case/space-insensitive and alias-friendly (docker →
// dockercontainer, aws → aws-cloud, vmware → vmware-esxi). An unknown name falls back to the generic `no-icon`.
// A CURATED common set (~114) is bundled; the full 242 live on the Assets → Logos page.
//
//   <obs-logo name="linux" size="24"></obs-logo>   ·   <obs-logo name="Windows"></obs-logo>   ·   el.name = 'mysql'
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
// the SMALL built-in common set (in the main bundle). The FULL 445 come from the opt-in observeops-logos bundle,
// which sets globalThis.__OBS_LOGOS__; we prefer that when present.
import { LOGOS as BUILTIN, LINE_LOGOS as BUILTIN_LINE, LOGO_ALIASES as BUILTIN_ALIASES } from './_logos.js'
const props = defineProps({
  name: { type: String, default: '' },           // monitor-type/logo key (case- & space-insensitive; aliases ok)
  variant: { type: String, default: 'color' },    // 'color' (full-colour brand mark) | 'line' (monochrome, inherits text colour)
  size: { type: [String, Number], default: 20 },  // px (number/plain digits) or any CSS length
  label: { type: String, default: '' },           // accessible name; empty → decorative (aria-hidden)
})
// bumped when the opt-in observeops-logos bundle finishes loading, so a rendered logo upgrades to the full set
const ready = ref(0)
const onLoaded = () => { ready.value++ }
onMounted(() => { try { globalThis.addEventListener('obs-logos-loaded', onLoaded) } catch (e) { /* non-DOM */ } })
onBeforeUnmount(() => { try { globalThis.removeEventListener('obs-logos-loaded', onLoaded) } catch (e) { /* non-DOM */ } })
// resolve tables: the full opt-in registry if loaded, else the built-in common set
const tables = () => {
  void ready.value // reactive dependency
  const reg = (typeof globalThis !== 'undefined' && globalThis.__OBS_LOGOS__) || null
  return reg && reg.LOGOS ? reg : { LOGOS: BUILTIN, LINE_LOGOS: BUILTIN_LINE, LOGO_ALIASES: BUILTIN_ALIASES }
}
// symmetric fallback: prefer the requested variant, else the other one, else the neutral no-icon — so a logo that
// exists in only ONE form (colour-only or line-only) still renders
const svg = computed(() => {
  const { LOGOS, LINE_LOGOS, LOGO_ALIASES } = tables()
  let k = String(props.name || '').trim().toLowerCase().replace(/\s+/g, '-')
  k = (LOGO_ALIASES && LOGO_ALIASES[k]) || k
  return props.variant === 'line'
    ? (LINE_LOGOS[k] || LOGOS[k] || BUILTIN['no-icon'] || '')
    : (LOGOS[k] || LINE_LOGOS[k] || BUILTIN['no-icon'] || '')
})
// Warn on an unresolved name, DISTINGUISHING "unknown name" from "full library not loaded" (G14) — a silent "?"
// for both is what led a consumer to conclude a real logo didn't exist and hand-draw one.
const warned = new Set()
function checkResolved() {
  const name = String(props.name || '').trim()
  if (!name || typeof console === 'undefined') return
  const { LOGOS, LINE_LOGOS, LOGO_ALIASES } = tables()
  let k = name.toLowerCase().replace(/\s+/g, '-'); k = (LOGO_ALIASES && LOGO_ALIASES[k]) || k
  if (LOGOS[k] || LINE_LOGOS[k] || warned.has(k)) return
  warned.add(k)
  const fullLoaded = !!(typeof globalThis !== 'undefined' && globalThis.__OBS_LOGOS__ && globalThis.__OBS_LOGOS__.LOGOS)
  if (fullLoaded) console.warn(`obs-logo: unknown name "${name}" — not in the logo library (rendering the no-icon placeholder).`)
  else console.warn(`obs-logo: "${name}" is not in the built-in set and the full logo library is not loaded — add \`import '@mtdt/observeops-ds-elements/logos'\` to enable all logos (rendering the no-icon placeholder for now).`)
}
onMounted(checkResolved)
watch(() => [props.name, ready.value], checkResolved)
const px = computed(() => (typeof props.size === 'number' || /^\d+$/.test(String(props.size)) ? `${props.size}px` : String(props.size)))
// aspect (w/h) from the svg's viewBox (or width/height attrs) so a WIDE wordmark (motadata_full → 150×40) gets a
// wide box instead of being squished into a square; a square mark → 1. `size` sets HEIGHT, width = height × aspect.
const sizeNum = computed(() => (typeof props.size === 'number' || /^\d+$/.test(String(props.size)) ? parseFloat(props.size) : null))
const aspect = computed(() => {
  const s = svg.value
  if (isImg.value || !s) return 1
  const vb = s.match(/viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)"/)
  if (vb && +vb[1] > 0 && +vb[2] > 0) return +vb[1] / +vb[2]
  const wa = s.match(/\bwidth="([\d.]+)"/), ha = s.match(/\bheight="([\d.]+)"/)
  if (wa && ha && +wa[1] > 0 && +ha[1] > 0) return +wa[1] / +ha[1]
  return 1
})
const boxW = computed(() => (sizeNum.value != null ? `${Math.round(sizeNum.value * aspect.value)}px` : 'auto'))
// some brand/software marks are raster (PNG data-URI) → render as an <img>; the rest are inline SVG
const isImg = computed(() => /^(data:|https?:|\/)/.test(svg.value))
</script>

<template>
  <img v-if="isImg" class="logo" :src="svg" :style="{ height: px, width: 'auto', maxWidth: '100%' }" :alt="label || ''" :aria-hidden="label ? null : 'true'" />
  <span v-else class="logo" :style="{ height: px, width: boxW, maxWidth: '100%' }" :role="label ? 'img' : null" :aria-label="label || null" :aria-hidden="label ? null : 'true'" v-html="svg"></span>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: inline-flex; line-height: 0; vertical-align: middle; color: inherit; } /* line variant inherits text colour */
.logo { display: inline-flex; align-items: center; justify-content: center; }
/* the svg fills the box, which is already sized to the logo's aspect (height × viewBox-aspect) — so wide wordmarks
   render wide and square marks stay square, with no distortion. */
.logo :deep(svg), .logo svg { width: 100%; height: 100%; display: block; }
</style>
