<script setup>
// <obs-tags> — DS "Tags Input": one field, two TYPES.
//   type="loose"  → LooseTags (loose-tags.vue → MSelect mode="tags" + .loose-tags-input, 94×): free-create —
//                   type a value + Enter → a TEAL pill (JetBrains Mono, orange ✕). Optional `suggestions`.
//   type="select" → MSelect mode="multiple": pick ONLY from a fixed `options` list → NEUTRAL chips (Poppins,
//                   navy ✕, #ecf1f9 bg / #111c2c text, 2px radius); the menu shows a ✓ on chosen options.
// Both: removable pills + a dropdown + chevron. Render-accurate from the LooseTags "Default" + Select
// "Multiple" stories. Values are de-duped; loose lowercases + trims (F2). Disabled = read-only pills.
import { ref, computed, watch, useHost } from 'vue'

const props = defineProps({
  type: { type: String, default: 'loose' },   // loose | select
  value: { type: String, default: '' },         // comma-separated selected values
  options: { type: [String, Array], default: '' }, // select pick-list: comma/JSON string OR a real JS array
  suggestions: { type: String, default: '' },   // loose type: optional assist list
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },   // select: chevron → spinner, non-interactive
  block: { type: Boolean, default: false },     // full-width
  lowercase: { type: String, default: 'true' }, // loose default-true; off via lowercase="false" / :lowercase="false" (String type avoids Vue boolean-casting)
})
const emit = defineEmits(['change'])

const isSelect = computed(() => props.type === 'select')
const parse = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean)
// options as a real array of {value,label}/{value,text}/strings, OR "value:Label"/"value" comma string
const optList = computed(() => {
  if (Array.isArray(props.options)) return props.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label ?? o.text ?? o.value }))
  return parse(props.options).map((o) => { const i = o.indexOf(':'); return i > 0 ? { value: o.slice(0, i), label: o.slice(i + 1) } : { value: o, label: o } })
})
const labelOf = (v) => { const o = optList.value.find((x) => x.value === v); return o ? o.label : v }

const host = useHost()
const tags = ref(parse(props.value))
watch(() => props.value, (v) => { tags.value = parse(v) })
// reflect selected tags to the host `value` property (comma string) so `el.value` is readable after edits.
watch(tags, (v) => { if (!host) return; const s = v.join(','); try { if (host.value !== s) host.value = s } catch (e) { /* readonly host */ } }, { deep: true })

const text = ref('')
const open = ref(false)
const activeIdx = ref(0)
const inputEl = ref(null)
const lc = computed(() => props.lowercase !== 'false' && props.lowercase !== false)
function norm(s) { const t = s.trim(); return isSelect.value ? t : (lc.value ? t.toLowerCase() : t) }

const ph = computed(() => props.placeholder || (isSelect.value ? 'Select' : 'Add Tags'))
const interactive = computed(() => !props.disabled && !props.loading)

// the open menu items
const menuItems = computed(() => {
  const q = text.value.trim().toLowerCase()
  if (isSelect.value) {
    // pick-only: already-chosen options leave the list (they're now chips); no "create"
    return optList.value
      .filter((o) => !tags.value.includes(o.value) && (!q || o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)))
  }
  const picked = tags.value.map((t) => t.toLowerCase())
  const sugg = parse(props.suggestions).filter((s) => !picked.includes(s.toLowerCase()) && (!q || s.toLowerCase().includes(q)))
  const items = []
  if (q && !picked.includes(norm(text.value)) && !sugg.some((s) => s.toLowerCase() === q)) {
    items.push({ label: text.value.trim(), value: norm(text.value), create: true })
  }
  for (const s of sugg) items.push({ label: s, value: s })
  return items
})
const menuOpen = computed(() => open.value && interactive.value && menuItems.value.length > 0)

function commit(v) { tags.value = v; emit('change', tags.value) }
function selectAdd(v) { if (!tags.value.includes(v)) commit([...tags.value, v]); text.value = ''; activeIdx.value = 0 }
function add(raw) {              // loose: create/add
  const t = norm(raw)
  if (!t) return
  if (!tags.value.includes(t)) commit([...tags.value, t])
  text.value = ''; activeIdx.value = 0
}
function removeAt(i) { commit(tags.value.filter((_, idx) => idx !== i)) }
function onInput() { open.value = true; activeIdx.value = 0 }
function onKeydown(e) {
  if (e.key === 'Enter' || (e.key === ',' && !isSelect.value)) {
    e.preventDefault()
    const it = menuItems.value[activeIdx.value]
    if (isSelect.value) { if (it) selectAdd(it.value) }
    else add(it ? it.value : text.value)
  } else if (e.key === 'ArrowDown') { e.preventDefault(); open.value = true; activeIdx.value = Math.min(activeIdx.value + 1, menuItems.value.length - 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx.value = Math.max(activeIdx.value - 1, 0) }
  else if (e.key === 'Escape') { open.value = false }
  else if (e.key === 'Backspace' && !text.value && tags.value.length) { removeAt(tags.value.length - 1) }
}
function focusInput() { if (!props.disabled && inputEl.value) { inputEl.value.focus(); open.value = true } }
function onBlur() { setTimeout(() => { open.value = false; if (!isSelect.value) add(text.value) }, 150) }
function pick(it) { if (isSelect.value) selectAdd(it.value); else add(it.value); inputEl.value && inputEl.value.focus() }
function toggleMenu() { open.value ? (open.value = false) : focusInput() }
</script>

<template>
  <div class="box" :class="['t-' + type, { disabled, loading, block, open: menuOpen }]" @mousedown.self="focusInput">
    <span v-for="(t, i) in tags" :key="t + i" class="pill">
      <span class="pt">{{ isSelect ? labelOf(t) : t }}</span>
      <button v-if="interactive" class="rm" type="button" :aria-label="'Remove ' + t" @click="removeAt(i)">
        <obs-icon name="times" size="11"></obs-icon>
      </button>
    </span>
    <input v-if="interactive" ref="inputEl" class="inp" :placeholder="tags.length ? '' : ph"
      v-model="text" @input.stop="onInput" @keydown="onKeydown" @focus="open = true" @blur="onBlur" />
    <span v-else-if="!tags.length" class="ph">{{ ph }}</span>
    <span v-if="loading" class="arrow spin" aria-hidden="true">
      <obs-icon name="spinnerThird" size="14"></obs-icon>
    </span>
    <span v-else-if="!disabled || isSelect" class="arrow" :class="{ up: menuOpen, dim: disabled }"
      @mousedown.prevent="interactive && toggleMenu()" aria-hidden="true">
      <obs-icon name="chevronDown" size="10"></obs-icon>
    </span>
    <ul v-if="menuOpen" class="menu" role="listbox">
      <li v-for="(it, i) in menuItems" :key="it.value" class="mi" :class="{ active: i === activeIdx }"
        role="option" @mousedown.prevent="pick(it)" @mouseenter="activeIdx = i">
        <span class="mi-l">{{ it.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
/* native form controls don't inherit font-family — force Poppins (else they render in the UA font, e.g. Arial) */
button, input, select, textarea { font-family: inherit; }
/* the box — bordered field. loose = JetBrains Mono / transparent; select = Poppins / white. */
.box { position: relative; display: flex; flex-wrap: wrap; align-items: center; gap: 4px; min-height: 32px;
  box-sizing: border-box; padding: 2px 28px 3px 6px; border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 4px; background: transparent; font-size: 0.8rem; cursor: text; transition: border-color .15s; }
.box.t-loose { font-family: 'JetBrains Mono', monospace; }
.box.t-select { font-family: var(--font-family, 'Poppins', sans-serif); background: var(--page-background-color, #fff); min-width: 200px; }
:host([block]) { display: block; width: 100%; }
.box.block { width: 100%; }
.box:hover { border-color: var(--neutral-light, #6a7fa0); }
.box:focus-within { border-color: var(--primary, #111c2c); }   /* brand focus (product uses Ant blue — DS aligns it) */
.box.disabled { cursor: default; background: var(--neutral-lightest, #ecf1f9); }
.box.t-loose.disabled { padding-right: 6px; }   /* loose disabled has no chevron → no reserved gap */

/* the pill — loose = teal + orange ✕ (4px); select = neutral + navy ✕ (2px) */
.pill { display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 8px; border-radius: 4px;
  font-size: 0.8rem; line-height: 24px; white-space: nowrap; cursor: default; }
.t-loose .pill { background: var(--main-tags-bg-color, #cdf1ed); color: var(--main-tags-text-color, #218b81); }
.t-select .pill { background: var(--tag-bg, #ecf1f9); color: var(--primary, #111c2c); border-radius: 2px; }
.pt { display: inline-block; }
.rm { display: inline-flex; align-items: center; justify-content: center; padding: 0; margin: 0; border: 0;
  background: none; cursor: pointer; line-height: 0; font-size: 0.7rem; font-weight: 700; }
.t-loose .rm { color: var(--secondary-orange, #f47c22); }
.t-select .rm { color: var(--primary, #111c2c); }
.rm:hover { opacity: .8; }

/* the free-type input */
.inp { flex: 1 1 60px; min-width: 60px; height: 24px; border: 0; outline: none; background: transparent;
  font-family: inherit; font-size: 0.8rem; color: var(--page-text-color, #1d2a3e); padding: 0 2px; }
.inp::placeholder { color: var(--neutral-light, #6a7fa0); opacity: 1; }
/* static placeholder shown when not interactive (disabled-empty / loading) — fills the row so the affordance stays right */
.ph { flex: 1 1 auto; color: var(--neutral-light, #6a7fa0); font-size: 0.8rem; padding: 0 2px; line-height: 24px; }

/* chevron — flips up when open; dims when disabled; becomes a spinner when loading */
.arrow { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); display: inline-flex;
  color: var(--neutral-light, #6a7fa0); transition: transform .15s; cursor: pointer; }
.arrow.up { transform: translateY(-50%) rotate(180deg); }
.arrow.dim { opacity: .55; cursor: default; }
.arrow.spin { cursor: default; }
.arrow.spin obs-icon { animation: obs-tags-spin 2s linear infinite; }
@keyframes obs-tags-spin { to { transform: rotate(360deg); } }

/* suggestion / option menu — white card, Poppins, 32px rows, active bg --neutral-lightest */
.menu { position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 30; margin: 0; padding: 4px 0;
  list-style: none; background: var(--page-background-color, #fff); border-radius: 4px;
  box-shadow: 0 2px 8px var(--neutral-shadow-light, rgba(0, 0, 0, .15)); font-family: var(--font-family, 'Poppins', sans-serif);
  max-height: 220px; overflow: auto; }
.mi { display: flex; align-items: center; height: 32px; padding: 5px 12px;
  box-sizing: border-box; font-size: 0.8rem; color: var(--page-text-color, #1d2a3e); cursor: pointer; }
.mi-l { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mi.active, .mi:hover { background: var(--neutral-lightest, #ecf1f9); }
</style>
