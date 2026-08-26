<script setup>
// <obs-select> — the product's DropdownPicker (FlotoDropdownPicker), matched to the rendered Storybook.
// single / multiple (Select-All + bordered "✕ Clear" + "First (+N)") / not-searchable / allow-clear (× on
// hover) / text-only / read-only grey-blue pills (multi+disabled, "First +N") / disabled-options (grey+ban) /
// inline-add / two-pane. Full-width flat rows; selected = light-blue bg + bold (no check icon); multi checkbox
// = white box + grey-blue border + navy tick (obs-checkbox). Menu is fixed-positioned and flips up when there's
// no room below (escapes the stage clip). options = comma string OR JSON [{value,label,disabled?,description?}].
import { ref, watch, computed, nextTick, useHost } from 'vue'
const props = defineProps({
  options: { type: [String, Array] }, // comma string, JSON string, OR a real JS array (el.options = [...])
  value: { type: String },
  placeholder: { type: String },
  multiple: { type: Boolean, default: false },
  allowSelectAll: { type: Boolean, default: false },
  allowClear: { type: Boolean, default: false },
  block: { type: Boolean, default: false }, // full-width instead of the fixed 240px
  // NOT Boolean-typed: a Boolean type makes an ABSENT attr cast to false (Vue), which would break the
  // default (searchable=auto, asInput=input-mode). String type keeps unset=undefined; off()/on() still accept
  // a real boolean (:searchable="false") so framework bindings work.
  searchable: { type: String }, // unset → AUTO (by option count); off via searchable="false" / :searchable="false"
  asInput: { type: String },     // unset → input mode; off via as-input="false" / :as-input="false"
  textOnly: { type: Boolean, default: false },
  // trigger STYLE — one enum consolidating the legacy asInput/textOnly + adding button/icon triggers.
  // unset → derived from the legacy props (text-only → 'text', as-input=false → 'chip', else 'input').
  trigger: { type: String },     // input | text | button | icon | chip
  triggerIcon: { type: String }, // the glyph for the `icon` (and leading `button`) trigger; default chevronDown/ellipsisV
  triggerLabel: { type: String },// optional fixed label for the button/icon trigger (else the selection/placeholder)
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabledOptions: { type: String },
  canUserAddOptions: { type: Boolean, default: false },
  addLabel: { type: String },
  useAfterMenuDescription: { type: Boolean, default: false },
  maxValues: { type: Number, default: 0 },
  maxItems: { type: Number, default: 1 }, // read-only pills: how many before "+N"
  removeClearBtn: { type: Boolean, default: false },
  // ── column-chooser variant (the table show/hide-columns dropdown) ──
  columns: { type: [String, Array], default: '' }, // [{key,label,checked?,locked?}] → column-chooser menu (drag-reorder + heading + reset)
  heading: { type: String, default: '' },           // section header at the top of the menu (e.g. "COLUMNS")
  resetLabel: { type: String, default: '' },         // reset-footer text ('' = no footer), e.g. "Reset Column Preference"
})
const emit = defineEmits(['change', 'show', 'hide', 'search', 'add', 'reorder', 'reset'])

// ── column-chooser mode ──
function parseCols() {
  const raw = props.columns
  const arr = Array.isArray(raw) ? raw : (typeof raw === 'string' && raw.trim()[0] === '[' ? (() => { try { return JSON.parse(raw) } catch (e) { return [] } })() : [])
  return arr.map((c, i) => ({ key: String(c.key ?? c.label ?? i), label: String(c.label ?? c.key ?? ''), checked: c.checked !== false, locked: c.locked === true || c.locked === 'true' }))
}
const cCols = ref(parseCols())
const cInit = ref(parseCols())
watch(() => props.columns, () => { cCols.value = parseCols(); cInit.value = parseCols() })
const isColumns = computed(() => cCols.value.length > 0)
const cDrag = ref(null)
const cOver = ref(null)
const emitCols = () => emit('change', cCols.value.filter((c) => c.checked).map((c) => c.key))
function toggleCol(c) { if (c.locked) return; c.checked = !c.checked; cCols.value = [...cCols.value]; emitCols() }
function cDragStart(i) { if (cCols.value[i].locked) return; cDrag.value = i }
function cDragOver(i) { if (cDrag.value === null || cCols.value[i].locked) return; cOver.value = i }
function cDrop(i) {
  if (cDrag.value === null || cCols.value[i].locked) { cDrag.value = cOver.value = null; return }
  const next = [...cCols.value]; const [m] = next.splice(cDrag.value, 1); next.splice(i, 0, m)
  cCols.value = next; cDrag.value = cOver.value = null; emit('reorder', cCols.value.map((c) => c.key))
}
function cDragEnd() { cDrag.value = cOver.value = null }
function resetCols() { cCols.value = parseCols().map((c) => ({ ...c })); cDrag.value = cOver.value = null; emit('reset'); emitCols() }

function parseVal(v) { return v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : [] }
const rootRef = ref(null)
const menuRef = ref(null)
const searchRef = ref(null)
const addRef = ref(null)
const open = ref(false)
const q = ref('')
const activeIdx = ref(-1)
const hoverIdx = ref(-1)
const hovering = ref(false)
const pillsOpen = ref(false)
const addOpen = ref(false) // inline-add input row visible
const addText = ref('')
const selected = ref(parseVal(props.value))
const extra = ref([])
const menuPos = ref({})
const valHover = ref(false)      // text-only multi: hovering the trigger previews ALL selected values
const valPopPos = ref({})
watch(() => props.value, (v) => { selected.value = parseVal(v) })
// reflect the selection back to the host `value` property so `el.value` is readable after picking (was stale).
// Guarded against the round-trip loop: only write when the string form actually differs.
const host = useHost()
watch(selected, (v) => {
  if (!host) return
  const s = props.multiple ? v.join(',') : (v[0] || '')
  try { if (host.value !== s) host.value = s } catch (e) { /* readonly host */ }
}, { deep: true })

const ph = computed(() => props.placeholder || 'Select')
const off = (v) => v === 'false' || v === false
const on = (v) => v === 'true' || v === true || v === '' // explicit opt-in (bare attr or true)
// DS RULE — searchable is AUTO by option count: show the search box only when the list is long enough to be
// worth scanning (> ~8 options); short lists (status/severity/priority) scan faster WITHOUT it. Override
// explicitly with searchable / searchable="false". This is more opinionated than the product (always-on) on
// purpose, so a consumer/AI doesn't have to decide per-field.
const AUTO_SEARCH_MIN = 8
// inline-add (canUserAddOptions) and two-pane (useAfterMenuDescription) ALWAYS need the search box — you type
// the new value there, and the two-pane list is meant to be searched. They win over the auto-by-count default.
const isSearchable = computed(() =>
  (props.canUserAddOptions || props.useAfterMenuDescription) ? true
  : off(props.searchable) ? false
  : on(props.searchable) ? true
  : items.value.length > AUTO_SEARCH_MIN)
const isAsInput = computed(() => !off(props.asInput))
// resolved trigger kind: explicit `trigger` prop wins; else derive from the legacy asInput/textOnly props.
const TRIGGERS = ['input', 'text', 'button', 'icon', 'chip']
const triggerKind = computed(() => {
  if (props.trigger && TRIGGERS.includes(props.trigger)) return props.trigger
  if (isColumns.value) return 'icon'   // column-chooser opens from an eye icon button by default
  if (props.textOnly) return 'text'
  if (!isAsInput.value) return 'chip'
  return 'input'
})
// options → a shallow tree: a node is either a leaf {value,label,color?,icon?,disabled?} or a group
// {group:true,value,label,children:[leaf…]}. `items` flattens to leaves (all selection logic runs on leaves,
// unchanged); `tree` drives rendering when groups are present. color/icon/children are optional add-ons —
// absent for every existing usage, so plain selects render byte-identical.
const leafOf = (o, dis) => {
  if (typeof o === 'string') return { value: o, label: o, disabled: dis.has(o) } // string options honor disabled too
  // accept any option shape: {value|key, label|text|name} (see G5). Warn (don't render empty) on an unknown shape.
  if (o && o.value == null && o.key == null && o.label == null && o.text == null && o.name == null)
    try { console.warn('obs-select: unrecognised option shape', o, '— expected {value|key, label|text}') } catch (e) {}
  const value = o.value ?? o.key
  return { value, label: o.label ?? o.text ?? o.name ?? value, disabled: !!o.disabled || dis.has(value), description: o.description, color: o.color, icon: o.icon, severity: o.severity, avatar: o.avatar, sublabel: o.sublabel ?? o.email }
}
// RECURSIVE parse — a node is a leaf, or a branch {group:true, children:[node…]} to ANY depth (tree-select).
// One-level groups are just a tree of depth 1, so existing grouped usages are unchanged.
const nodeOf = (o, dis) => {
  const base = leafOf(o, dis)
  return (o && typeof o === 'object' && Array.isArray(o.children))
    ? { ...base, value: o.value ?? o.key, label: o.label ?? o.text ?? o.name ?? o.value ?? o.key, group: true, children: o.children.map((c) => nodeOf(c, dis)) }
    : base
}
const tree = computed(() => {
  const dis = new Set(parseVal(props.disabledOptions))
  let raw = []
  if (Array.isArray(props.options)) raw = props.options // a real JS array set as a property (no longer throws)
  else {
    const s = (props.options || '').trim()
    if (s.startsWith('[')) { try { raw = JSON.parse(s) } catch { raw = [] } }
    else if (s) raw = s.split(',').map((x) => x.trim()).filter(Boolean)
  }
  return raw.map((o) => nodeOf(o, dis))
})
// all selectable LEAVES (recursively), for selection logic + labelFor
const collectLeaves = (nodes, out) => { for (const n of nodes) { if (n.group && n.children) collectLeaves(n.children, out); else out.push(n) } return out }
const items = computed(() => collectLeaves(tree.value, []).concat(extra.value))
const hasGroups = computed(() => tree.value.some((n) => n.group))
const filtered = computed(() => { const s = q.value.toLowerCase(); return items.value.filter((o) => !s || String(o.label).toLowerCase().includes(s)) })
const selectableValues = computed(() => items.value.filter((o) => !o.disabled).map((o) => o.value))
const allSelected = computed(() => selectableValues.value.length > 0 && selectableValues.value.every((v) => selected.value.includes(v)))
const expandedSet = ref(new Set())
const dotColor = (c) => (c && String(c).startsWith('--') ? `var(${c}, #6a7fa0)` : c)
// option content (rich options) — compose DS primitives, not hand-drawn spans:
//   o.icon → <obs-icon> · o.severity (or a --severity-<level> color) → <obs-severity> dot · o.avatar → people row.
// sevOf derives a severity LEVEL from o.severity or a "--severity-<level>" color token (else '' = no dot).
const sevOf = (o) => { if (o.severity) return String(o.severity).toLowerCase().trim(); const m = o.color && String(o.color).match(/^--severity-([a-z]+)/i); return m ? m[1].toLowerCase() : '' }
// a non-severity color (a plain token/hex) still renders a simple dot via dotColor (rare; keeps back-compat)
const plainDot = (o) => (o.color && !sevOf(o))
const isImg = (s) => typeof s === 'string' && /^(https?:|data:|blob:|\/|\.\.?\/)/.test(s)
const initials = (label) => String(label || '').trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '?'
// ── tree-select (N-level hierarchy) — expand/collapse per branch; a search auto-expands everything ──
function toggleExpand(n) { const s = new Set(expandedSet.value); s.has(n.value) ? s.delete(n.value) : s.add(n.value); expandedSet.value = s }
const isExpanded = (n) => (!!q.value || expandedSet.value.has(n.value))
// under search: a branch is visible if it or ANY descendant matches; a leaf if it matches
const matchNode = (n) => { const s = q.value.toLowerCase(); if (!s) return true; if (String(n.label).toLowerCase().includes(s)) return true; return !!(n.group && n.children && n.children.some(matchNode)) }
// flatten the (visible, expanded) tree into a render list carrying its depth level
const flat = computed(() => {
  const out = []
  const walk = (nodes, level) => { for (const n of nodes) { if (!matchNode(n)) continue; const branch = !!(n.group && n.children); out.push({ ...n, __level: level, __branch: branch }); if (branch && isExpanded(n)) walk(n.children, level + 1) } }
  walk(tree.value, 0)
  return out
})
// a branch's descendant leaves — for its subtree checkbox (all / indeterminate / toggle-all)
const leavesUnder = (n) => { const out = []; const w = (ns) => (ns || []).forEach((c) => (c.group && c.children ? w(c.children) : out.push(c))); w(n.children); return out }
function branchAllSel(n) { const k = leavesUnder(n).filter((c) => !c.disabled); return k.length > 0 && k.every((c) => selected.value.includes(c.value)) }
function branchSomeSel(n) { return !branchAllSel(n) && leavesUnder(n).some((c) => selected.value.includes(c.value)) }
function toggleBranch(n) {
  const keys = leavesUnder(n).filter((c) => !c.disabled).map((c) => c.value)
  let sel = [...selected.value]
  if (branchAllSel(n)) sel = sel.filter((v) => !keys.includes(v))
  else for (const k of keys) if (!sel.includes(k)) sel.push(k)
  selected.value = sel; emit('change', [...selected.value])
}
const atCap = computed(() => props.maxValues > 0 && selected.value.length >= props.maxValues)
function labelFor(v) { const o = items.value.find((i) => i.value === v); return o ? o.label : v }

function positionMenu() {
  const root = rootRef.value; if (!root) return
  const trig = root.querySelector('.trig, .t-text, .t-chip, .t-btn, .t-icon') || root
  const r = trig.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight
  const W = props.useAfterMenuDescription ? 600 : Math.max(r.width, 200)
  let left = Math.min(r.left, vw - W - 8); if (left < 8) left = 8
  const below = vh - r.bottom - 8, above = r.top - 8
  const up = below < 260 && above > below
  const maxH = Math.max(160, Math.min(440, up ? above : below))
  // inset:auto + margin:0 so the popover UA styles (inset:0; margin:auto) don't override our left/top
  const base = { position: 'fixed', inset: 'auto', margin: '0', left: left + 'px', width: W + 'px', maxHeight: maxH + 'px' }
  if (up) base.bottom = (vh - r.top + 4) + 'px'; else base.top = (r.bottom + 4) + 'px'
  menuPos.value = base
}
function onReflow() { if (open.value) positionMenu() }
function openMenu() {
  if (props.disabled || props.loading) return
  open.value = true; emit('show')
  activeIdx.value = Math.max(0, filtered.value.findIndex((o) => selected.value.includes(o.value)))
  // product auto-focuses search on open — but preventScroll so focusing doesn't scroll an ancestor (which would
  // shift the trigger AFTER we positioned, leaving the menu detached); reposition again next frame once settled.
  nextTick(() => {
    // Render the menu in the top layer (Popover API) so it escapes a transform-animated ancestor (e.g. a sliding
    // drawer) — position:fixed alone is relative to a transformed ancestor and throws the menu off-screen (C4).
    // In browsers without the API the `popover` attribute is inert and the menu shows via position:fixed as before.
    try { const el = menuRef.value; if (el && el.showPopover && !el.matches(':popover-open')) el.showPopover() } catch (e) { /* unsupported */ }
    positionMenu()
    if (isSearchable.value && searchRef.value) searchRef.value.focus({ preventScroll: true })
    requestAnimationFrame(() => positionMenu())
  })
  window.addEventListener('scroll', onReflow, true); window.addEventListener('resize', onReflow)
}
function closeMenu() {
  if (!open.value) return
  open.value = false; q.value = ''; activeIdx.value = -1; emit('hide')
  window.removeEventListener('scroll', onReflow, true); window.removeEventListener('resize', onReflow)
}
function toggleOpen() { open.value ? closeMenu() : openMenu() }

function choose(o) {
  if (o.disabled) return
  if (props.multiple) {
    const i = selected.value.indexOf(o.value)
    if (i >= 0) selected.value.splice(i, 1); else { if (atCap.value) return; selected.value.push(o.value) }
    selected.value = [...selected.value]; emit('change', [...selected.value])
  } else { selected.value = [o.value]; emit('change', o.value); closeMenu() }
}
function toggleSelectAll() {
  selected.value = allSelected.value ? [] : (props.maxValues > 0 ? selectableValues.value.slice(0, props.maxValues) : [...selectableValues.value])
  emit('change', [...selected.value])
}
function clearAll(e) { if (e) e.stopPropagation(); selected.value = []; emit('change', props.multiple ? [] : '') }
// inline-add: "+" opens the "Add <label>" input row (✓ confirm / ✕ cancel), product behaviour
function openAdd() { addOpen.value = true; addText.value = ''; nextTick(() => { addRef.value && addRef.value.focus(); positionMenu() }) }
function cancelAdd() { addOpen.value = false; addText.value = ''; nextTick(positionMenu) }
function confirmAdd() {
  const t = addText.value.trim(); if (!t) return
  if (!items.value.some((o) => o.value === t)) extra.value = [...extra.value, { value: t, label: t }]
  emit('add', t)
  if (props.multiple) { if (!selected.value.includes(t)) selected.value = [...selected.value, t]; emit('change', [...selected.value]) }
  else { selected.value = [t]; emit('change', t) }
  addOpen.value = false; addText.value = ''; nextTick(positionMenu)
}
function onSearch(e) { q.value = e.target.value; activeIdx.value = 0; emit('search', q.value); nextTick(positionMenu) }
function onKeydown(e) {
  if (!open.value) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); openMenu() } return }
  if (e.key === 'Escape') { e.preventDefault(); closeMenu() }
  else if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
  else if (e.key === 'Enter') { e.preventDefault(); const o = filtered.value[activeIdx.value]; if (o) choose(o) }
}
function move(d) { const n = filtered.value.length; if (!n) return; let i = activeIdx.value; for (let k = 0; k < n; k++) { i = (i + d + n) % n; if (!filtered.value[i].disabled) break } activeIdx.value = i }
function onFocusOut(e) { if (!e.currentTarget.contains(e.relatedTarget)) closeMenu() }

const showClear = computed(() => props.allowClear && !props.removeClearBtn && selected.value.length && !props.disabled && !props.loading)
const firstLabel = computed(() => (selected.value.length ? labelFor(selected.value[0]) : ''))
const extraCount = computed(() => Math.max(0, selected.value.length - 1))
const multiTriggerText = computed(() => (firstLabel.value + (extraCount.value ? ` (+${extraCount.value})` : '')))
function showValPop(e) {
  if (open.value || !props.multiple || selected.value.length < 2) return
  const r = e.currentTarget.getBoundingClientRect()
  valPopPos.value = { position: 'fixed', left: Math.round(r.left) + 'px', top: Math.round(r.bottom + 6) + 'px' }
  valHover.value = true
}
function hideValPop() { valHover.value = false }
const hoverDesc = computed(() => { const o = filtered.value[hoverIdx.value]; return o ? o.description : null })
</script>

<template>
  <div
    ref="rootRef" class="sel" :class="{ open, disabled, multiple, block, text: triggerKind === 'text', chip: triggerKind === 'chip', btn: triggerKind === 'button', ic: triggerKind === 'icon', twopane: useAfterMenuDescription }"
    tabindex="0" role="combobox" :aria-expanded="open" aria-haspopup="listbox" @keydown="onKeydown" @focusout="onFocusOut"
  >
    <!-- read-only pills (multiple + disabled); +N opens a popover listing the rest -->
    <div v-if="multiple && disabled" class="pills">
      <template v-if="selected.length">
        <span class="pill" v-for="v in selected.slice(0, maxItems)" :key="v">{{ labelFor(v) }}</span>
        <span v-if="selected.length > maxItems" class="pill more" role="button" tabindex="0" @click="pillsOpen = !pillsOpen">
          +{{ selected.length - maxItems }}
          <div v-if="pillsOpen" class="pill-pop">
            <div class="pill-pop-item" v-for="v in selected.slice(maxItems)" :key="v">{{ labelFor(v) }}</div>
          </div>
        </span>
      </template>
      <span v-else class="ph">{{ ph }}</span>
    </div>
    <!-- text-only trigger: plain text, no caret (matches the product) -->
    <span v-else-if="triggerKind === 'text'" class="t-text" :class="{ ph: !selected.length }" @click="toggleOpen" @mouseenter="showValPop" @mouseleave="hideValPop">{{ selected.length ? (multiple ? multiTriggerText : firstLabel) : ph }}</span>
    <!-- chip trigger -->
    <button v-else-if="triggerKind === 'chip'" class="t-chip" :disabled="disabled" @click="toggleOpen">
      <span :class="{ ph: !selected.length }">{{ selected.length ? (multiple ? multiTriggerText : firstLabel) : ph }}</span>
    </button>
    <!-- button trigger: a button-styled CTA (label/selection + caret) -->
    <button v-else-if="triggerKind === 'button'" class="t-btn" :class="{ open }" :disabled="disabled" @click="toggleOpen">
      <span :class="{ ph: !selected.length && !triggerLabel }">{{ triggerLabel || (selected.length ? (multiple ? multiTriggerText : firstLabel) : ph) }}</span>
      <obs-icon class="chev" :class="{ up: open }" :name="triggerIcon || 'chevronDown'" size="13"></obs-icon>
    </button>
    <!-- icon trigger: an icon-only button (compact); a badge shows the multi-select count -->
    <button v-else-if="triggerKind === 'icon'" class="t-icon" :class="{ on: selected.length, open, bordered: isColumns }" :disabled="disabled" :aria-label="triggerLabel || ph" @click="toggleOpen">
      <obs-icon :name="triggerIcon || (isColumns ? 'eye' : 'ellipsisV')" size="16"></obs-icon>
      <span v-if="multiple && selected.length" class="t-badge">{{ selected.length }}</span>
    </button>
    <!-- input-style trigger -->
    <button v-else class="trig" :class="{ open }" :disabled="disabled" @click="toggleOpen" @mouseenter="hovering = true" @mouseleave="hovering = false">
      <span class="vals"><span v-if="selected.length" class="single">{{ multiple ? multiTriggerText : firstLabel }}</span><span v-else class="ph">{{ ph }}</span></span>
      <span class="tools">
        <span v-if="showClear && hovering" class="clr" role="button" tabindex="-1" aria-label="Clear" @click="clearAll">
          <obs-icon name="timesCircle" size="15"></obs-icon>
        </span>
        <span v-else-if="loading" class="spin" aria-hidden="true"></span>
        <obs-icon v-else class="chev" :class="{ up: open }" name="chevronDown" size="13"></obs-icon>
      </span>
    </button>

    <!-- hover preview of ALL selected values (text-only multi) — outside the trigger v-if/else chain so it can't break it -->
    <div v-if="valHover && !open && textOnly && multiple && selected.length > 1" class="val-pop" :style="valPopPos">
      <div v-for="v in selected" :key="v" class="val-pop-item">{{ labelFor(v) }}</div>
    </div>

    <!-- menu -->
    <div v-if="open" ref="menuRef" popover="manual" class="menu" :class="{ twopane: useAfterMenuDescription, grouped: hasGroups, cols: isColumns }" :style="menuPos">
      <!-- column-chooser variant: heading + draggable checkbox rows + reset footer -->
      <div v-if="isColumns" class="ccm">
        <div v-if="heading" class="cc-hd">{{ heading }}</div>
        <div class="cc-rows">
          <div
            v-for="(c, i) in cCols" :key="c.key" class="cc-row" :class="{ dragging: cDrag === i, over: cOver === i && cDrag !== i, locked: c.locked }"
            :draggable="!c.locked" @click="toggleCol(c)"
            @dragstart="cDragStart(i)" @dragover.prevent="cDragOver(i)" @drop.prevent="cDrop(i)" @dragend="cDragEnd"
          >
            <obs-icon name="gripVertical" size="14" class="cc-grip" aria-hidden="true"></obs-icon>
            <obs-checkbox class="cc-cbx" :checked="c.checked" :disabled="c.locked"></obs-checkbox>
            <span class="cc-lbl">{{ c.label }}</span>
          </div>
        </div>
        <div v-if="resetLabel" class="cc-reset" role="button" @click="resetCols">
          <obs-icon name="undo" size="14" class="cc-ric"></obs-icon>{{ resetLabel }}
        </div>
      </div>
      <div v-else class="pane">
        <!-- isSearchable is forced true for inline-add + two-pane (see the computed), so this covers the "+" row -->
        <div v-if="isSearchable" class="srow">
          <div class="msearch">
            <obs-icon class="sic" name="search" size="13"></obs-icon>
            <input ref="searchRef" :value="q" placeholder="Search" @input.stop="onSearch" />
          </div>
          <button v-if="canUserAddOptions" class="addbtn" aria-label="Add option" @mousedown.prevent @click="openAdd"><obs-icon name="plus" size="14"></obs-icon></button>
        </div>
        <div v-if="canUserAddOptions && addOpen" class="addinput">
          <input ref="addRef" :value="addText" :placeholder="`Add ${addLabel || 'option'}`" @input.stop="addText = $event.target.value" @keydown.enter.prevent="confirmAdd" @keydown.esc.prevent="cancelAdd" />
          <button class="ok" aria-label="Confirm" @mousedown.prevent @click="confirmAdd"><obs-icon name="check" size="15"></obs-icon></button>
          <button class="cancel" aria-label="Cancel" @mousedown.prevent @click="cancelAdd"><obs-icon name="times" size="15"></obs-icon></button>
        </div>
        <button v-if="multiple && allowSelectAll" class="mopt selall" @click="toggleSelectAll">
          <span class="cbx" :class="{ ck: allSelected }" aria-hidden="true"></span><span class="mlbl">Select All</span>
        </button>
        <div class="opts" role="listbox" :aria-multiselectable="multiple">
          <!-- tree / grouped rendering (options with `children`, to ANY depth) — a flattened list, indented per
               level, with an expand chevron on branches. Branch checkbox = subtree select (all/indeterminate);
               leaf checkbox = the leaf. A one-level group is just depth-1 (unchanged). -->
          <template v-if="hasGroups">
            <button
              v-for="node in flat" :key="(node.__branch ? 'g-' : 'o-') + node.value"
              type="button" class="mopt tnode" :class="{ branch: node.__branch, on: !node.__branch && selected.includes(node.value), dis: node.disabled }"
              :style="{ paddingLeft: (12 + node.__level * 18) + 'px' }"
              role="option" :aria-selected="!node.__branch && selected.includes(node.value)"
              @click="node.__branch ? toggleExpand(node) : choose(node)"
            >
              <span class="tchev-slot"><obs-icon v-if="node.__branch" class="tchev" :class="{ open: isExpanded(node) }" name="chevronRight" size="10"></obs-icon></span>
              <span v-if="multiple" class="cbx" :class="node.__branch ? { ck: branchAllSel(node), ind: branchSomeSel(node) } : { ck: selected.includes(node.value) }" aria-hidden="true" @click.stop="node.__branch ? toggleBranch(node) : choose(node)"></span>
              <span v-if="node.avatar" class="mav" :class="{ img: isImg(node.avatar) }" aria-hidden="true"><img v-if="isImg(node.avatar)" :src="node.avatar" alt="" /><template v-else>{{ initials(node.label) }}</template></span>
              <obs-severity v-if="sevOf(node)" :severity="sevOf(node)" shape="dot"></obs-severity>
              <span v-else-if="plainDot(node)" class="mdot" :style="{ background: dotColor(node.color) }" aria-hidden="true"></span>
              <obs-icon v-if="node.icon" class="mic" :name="node.icon" size="16"></obs-icon>
              <span class="mlbl" :class="{ two: node.sublabel, br: node.__branch }"><span class="ml-main">{{ node.label }}</span><span v-if="node.sublabel" class="ml-sub">{{ node.sublabel }}</span></span>
            </button>
            <div v-if="!flat.length" class="empty"><span class="empty-ic" aria-hidden="true"></span>No data</div>
          </template>
          <!-- flat rendering (no groups) — unchanged DOM; color/icon spans only render when provided -->
          <template v-else>
            <button
              v-for="(o, i) in filtered" :key="o.value" class="mopt"
              :class="{ on: selected.includes(o.value), dis: o.disabled, active: i === activeIdx }"
              role="option" :aria-selected="selected.includes(o.value)"
              @click="choose(o)" @mouseenter="hoverIdx = i; activeIdx = i" @mouseleave="hoverIdx = -1"
            >
              <span v-if="multiple" class="cbx" :class="{ ck: selected.includes(o.value) }" aria-hidden="true"></span>
              <span v-if="o.avatar" class="mav" :class="{ img: isImg(o.avatar) }" aria-hidden="true"><img v-if="isImg(o.avatar)" :src="o.avatar" alt="" /><template v-else>{{ initials(o.label) }}</template></span>
              <obs-severity v-if="sevOf(o)" :severity="sevOf(o)" shape="dot"></obs-severity>
              <span v-else-if="plainDot(o)" class="mdot" :style="{ background: dotColor(o.color) }" aria-hidden="true"></span>
              <obs-icon v-if="o.icon" class="mic" :name="o.icon" size="16"></obs-icon>
              <span class="mlbl" :class="{ two: o.sublabel }"><span class="ml-main">{{ o.label }}</span><span v-if="o.sublabel" class="ml-sub">{{ o.sublabel }}</span></span>
              <span v-if="o.disabled" class="ban" aria-hidden="true"></span>
            </button>
            <div v-if="!filtered.length" class="empty"><span class="empty-ic" aria-hidden="true"></span>No data</div>
          </template>
        </div>
        <div v-if="multiple && selected.length" class="foot">
          <button class="clearbtn" @click="clearAll"><obs-icon class="x" name="times" size="12"></obs-icon>Clear</button>
        </div>
      </div>
      <div v-if="useAfterMenuDescription" class="descpane">
        <template v-if="hoverDesc"><div class="desc-title">{{ labelFor(filtered[hoverIdx].value) }}</div><div class="desc-body">{{ hoverDesc }}</div></template>
        <div v-else class="desc-hint">Hover an option to see details.</div>
      </div>
    </div>
  </div>
</template>

<style>
:host([hidden]) { display: none !important; }
/* native form controls don't inherit font-family — force Poppins (else they render in the UA font, e.g. Arial) */
button, input, select, textarea { font-family: inherit; }
.sel.text, .sel.btn, .sel.ic { width: auto; display: inline-flex; }
:host([block]) { display: block; width: 100%; }
.sel.block { width: 100%; }
.sel { position: relative; display: inline-block; width: 240px; outline: none;
  font-family: var(--font-family, 'Poppins', sans-serif); font-size: var(--text-sm, 0.8rem); color: var(--page-text-color, #1d2a3e); }
.ph { color: var(--input-placeholder-color, rgba(43, 57, 79, 0.5)); }
/* input-style trigger */
.trig { display: flex; align-items: center; gap: 8px; width: 100%; min-height: var(--input-height-base, 32px);
  padding: 3px 9px 3px 11px; border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px;
  background: var(--page-background-color, #fff); color: var(--input-text-color, #1d2a3e); cursor: pointer; font: inherit; text-align: left; transition: border-color 0.15s; }
.trig:hover { border-color: var(--neutral-light, #8e9fbc); }
.sel.disabled .trig, .sel.disabled .t-chip { background: var(--neutral-lightest, #ecf1f9); opacity: 0.75; cursor: not-allowed; }
.vals { flex: 1; min-width: 0; }
.single { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tools { flex: 0 0 auto; display: inline-flex; align-items: center; color: var(--neutral-light, #8e9fbc); }
.clr { display: inline-flex; cursor: pointer; }
.clr:hover { color: var(--page-text-color, #1d2a3e); }
.clr:hover { color: var(--page-text-color, #1d2a3e); }
.chev { display: block; transition: transform 0.15s; }
.chev.up { transform: rotate(180deg); }
.spin { width: 12px; height: 12px; border: 1.5px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: obsselspin 0.7s linear infinite; }
@keyframes obsselspin { to { transform: rotate(360deg); } }
/* text-only trigger */
.t-text { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; color: var(--page-text-color, #1d2a3e); }
/* text-only multi: hover preview listing all selected values (fixed → escapes the chip row's overflow clip) */
.val-pop { z-index: 1000; min-width: 140px; max-height: 260px; overflow: auto; padding: 6px 0; background: var(--dropdown-background, #fff); border: 1px solid var(--border-color, #e3e8f2); border-radius: 8px; box-shadow: 0 8px 24px var(--neutral-shadow-light, var(--neutral-shadow-light, rgba(7, 16, 31, 0.16))); }
.val-pop-item { padding: 5px 16px; font-size: 13px; font-weight: 400; color: var(--page-text-color, #1d2a3e); white-space: nowrap; }
/* chip trigger */
.t-chip { display: inline-flex; align-items: center; max-width: 100%; padding: 2px 10px; border: none; border-radius: 4px; background: var(--code-tag-background-color, #ecf1f9); color: var(--page-text-color, #1d2a3e); cursor: pointer; font: inherit; }
/* button trigger — a default-button-styled CTA + caret */
.t-btn { display: inline-flex; align-items: center; gap: 8px; height: var(--btn-height, 2.1rem); padding: 0 12px; border: 1px solid var(--default-button-border, #e3e8f2); border-radius: var(--btn-radius, 4px); background: var(--default-button-bg, #fff); color: var(--default-button-text, #1d2a3e); cursor: pointer; font: inherit; font-size: var(--text-sm, 0.8rem); white-space: nowrap; transition: border-color 0.15s, background 0.15s; }
.t-btn:hover:not(:disabled) { background: var(--default-button-hover-bg, var(--neutral-lightest, #ecf1f9)); border-color: var(--outline-button-hover-border, rgba(17, 28, 44, 0.5)); }
.t-btn .chev { color: var(--neutral-light, #8e9fbc); transition: transform 0.15s; }
.t-btn .chev.up { transform: rotate(180deg); }
.sel.disabled .t-btn, .sel.disabled .t-icon { opacity: 0.6; cursor: not-allowed; }
/* icon trigger — a compact icon-only button (+ a count badge for multi-select) */
/* an icon-only trigger IS an icon button → match obs-button `.squared` (35×35) so it lines up beside sibling
   icon buttons in a toolbar (the column-chooser eye next to the filter obs-button), not the 32px input height */
/* rest at the same dark colour as obs-button `.v-default` (--default-button-text) so the eye matches the sibling
   filter/grid icon buttons — not the muted --neutral-regular, which read as a lighter grey next to them */
.t-icon { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 35px; height: 35px; border: 1px solid var(--default-button-border, #e3e8f2); border-radius: 4px; background: var(--default-button-bg, #fff); color: var(--default-button-text, #1d2a3e); cursor: pointer; font: inherit; transition: border-color 0.15s, color 0.15s; }
.t-icon:hover:not(:disabled), .t-icon.open, .t-icon.on { border-color: var(--neutral-light, #8e9fbc); color: var(--page-text-color, #1d2a3e); }
.t-badge { position: absolute; top: -6px; right: -6px; min-width: 16px; height: 16px; padding: 0 4px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; background: var(--primary, #111c2c); color: var(--white-regular, #fff); font-size: 10px; font-weight: 600; }
/* read-only pills (grey-blue, rounded, bold; "First +N" with a popover for the rest) */
.pills { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-height: var(--input-height-base, 32px); }
.pill { display: inline-flex; align-items: center; padding: 3px 11px; border-radius: 100px; font-size: 12px; font-weight: 600; background: var(--neutral-lighter, #e3e8f2); color: var(--page-text-color, #1d2a3e); }
.pill.more { position: relative; cursor: pointer; }
.pill-pop { position: absolute; z-index: 1000; top: calc(100% + 6px); left: 0; min-width: 120px; padding: 4px 0; background: var(--dropdown-background, #fff); border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px; box-shadow: 0 8px 24px var(--neutral-shadow-light, rgba(7, 16, 31, 0.16)); }
.pill-pop-item { padding: 7px 14px; font-size: 13px; font-weight: 400; color: var(--page-text-color, #1d2a3e); white-space: nowrap; }
.pill-pop-item + .pill-pop-item { border-top: 1px solid var(--border-color, #e3e8f2); }
/* menu (fixed-positioned via inline style; flips up when no room) */
/* popover top-layer: reset the UA popover box so only .menu's own styling applies (position comes from :style) */
.menu:popover-open, .menu[popover] { border: 0; padding: 0; margin: 0; inset: auto; }
.menu { z-index: 1000; display: flex; overflow: hidden; background: var(--dropdown-background, #fff);
  border: 1px solid var(--border-color, #e3e8f2); border-radius: 6px; box-shadow: 0 8px 24px var(--neutral-shadow-light, rgba(7, 16, 31, 0.16)); padding: 0; }
.pane { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
.menu.twopane .pane { flex: 0 0 260px; }
/* ── column-chooser variant (columns prop): COLUMNS header + draggable checkbox rows + reset footer ── */
.menu.cols { min-width: 220px; display: block; font-size: var(--text-sm, 0.8rem); }
.cc-hd { padding: 8px 12px; font-size: 11px; color: var(--neutral-light, #6a7fa0); border-bottom: 1px solid var(--border-color, #e3e8f2); }
.cc-row { display: flex; align-items: center; padding: 7px 12px; font-size: 13px; cursor: pointer; border-top: 2px solid transparent; }
.cc-row.over { border-top-color: var(--primary, #111c2c); background: var(--neutral-lighter, #e3e8f2); }
.cc-row.dragging { opacity: 0.4; }
.cc-row.locked { cursor: default; }
.cc-grip { color: var(--neutral-light, #6a7fa0); margin-right: 8px; cursor: grab; opacity: 0.5; display: inline-flex; flex: 0 0 auto; }
.cc-row.locked .cc-grip { opacity: 0.15; cursor: default; }
.cc-cbx { pointer-events: none; margin-right: 6px; display: inline-flex; flex: 0 0 auto; }
.cc-lbl { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cc-reset { display: flex; align-items: center; padding: 8px 12px; font-size: 12px; cursor: pointer; color: var(--neutral-light, #6a7fa0); border-top: 1px solid var(--border-color, #e3e8f2); }
.cc-reset:hover { background: var(--neutral-lightest, #ecf1f9); }
.cc-ric { margin-right: 8px; display: inline-flex; flex: 0 0 auto; }
/* search row — inset (my-2 px-2); border is on the input itself, navy on focus, icon in the left padding */
.srow { display: flex; align-items: center; gap: 6px; margin: 8px; }
.msearch { position: relative; flex: 1; min-width: 0; height: 32px; }
.sic { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: var(--neutral-light, #8e9fbc); pointer-events: none; }
.msearch input { width: 100%; height: 32px; padding: 4px 11px 4px 30px; border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; background: var(--page-background-color, #fff); color: var(--input-text-color, #1d2a3e); font: inherit; font-size: var(--text-sm, 0.8rem); outline: none; box-sizing: border-box; }
.msearch input:focus { border-color: var(--checkbox-checked-color, #111c2c); }
.msearch input::placeholder { color: var(--input-placeholder-color, rgba(43, 57, 79, 0.5)); }
.addbtn { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); cursor: pointer; font: inherit; font-size: 18px; line-height: 1; }
.addbtn:hover:not(:disabled) { border-color: var(--neutral-light, #8e9fbc); }
.addbtn:disabled { opacity: 0.5; cursor: not-allowed; }
/* inline-add input row ("Add <label>" + ✓ / ✕), shown after clicking "+" */
.addinput { display: flex; align-items: center; gap: 6px; margin: 0 8px 6px; padding: 2px 0 8px; border-bottom: 1px solid var(--border-color, #e3e8f2); }
.addinput input { flex: 1; min-width: 0; height: 28px; padding: 0 9px; border: none; background: transparent; color: var(--input-text-color, #1d2a3e); font: inherit; font-size: var(--text-sm, 0.8rem); outline: none; }
.addinput input::placeholder { color: var(--input-placeholder-color, rgba(43, 57, 79, 0.5)); }
.ok, .cancel { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; padding: 0; border: none; background: none; cursor: pointer; }
.ok { color: var(--secondary-green, #14b053); }
.cancel { color: var(--secondary-red, #ec5b5b); }
.opts { flex: 1; min-height: 0; overflow: auto; }
.mopt { display: flex; align-items: center; gap: 9px; width: 100%; min-height: 32px; padding: 5px 12px; border: none; border-radius: 0;
  background: none; color: var(--page-text-color, #1d2a3e); cursor: pointer; font: inherit; font-size: 13px; font-weight: 400; text-align: left; }
.mopt:hover:not(.dis), .mopt.active:not(.dis) { background: var(--code-tag-background-color, #ecf1f9); }
.mopt.on { font-weight: 500; color: var(--checkbox-checked-color, #111c2c); }
.mopt.dis { color: var(--neutral-light, #8e9fbc); opacity: 0.55; cursor: not-allowed; }
.selall { border-bottom: 1px solid var(--border-color, #e3e8f2); margin-bottom: 2px; }
.mlbl { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* two-line label (avatar / people rows): name + a muted sub-label (e.g. email) */
.mlbl.two { display: flex; flex-direction: column; line-height: 1.25; }
.mlbl .ml-sub { font-size: 11px; color: var(--neutral-light, #8e9fbc); overflow: hidden; text-overflow: ellipsis; }
.mdot { flex: 0 0 auto; width: 10px; height: 10px; border-radius: 50%; }
/* option primitives compose DS elements (obs-severity dot / obs-icon) — size them to the row + inline-flex host */
.opts obs-severity, .opts obs-icon { flex: 0 0 auto; display: inline-flex; align-items: center; }
.mic { flex: 0 0 auto; color: var(--neutral-regular, #7186a8); }
/* avatar (people picker) — a circular img or initials chip */
.mav { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; overflow: hidden;
  background: var(--primary-alt, #3279be); color: var(--white-regular, #fff); font-size: 10px; font-weight: 600; }
.mav img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* tree / grouped menus: a fixed chevron gutter (so leaves align under their branch), chevron rotates when open */
.mopt.branch { font-weight: 500; }
.mopt.branch .mlbl { color: var(--page-text-color, #1d2a3e); }
.tchev-slot { flex: 0 0 auto; width: 12px; display: inline-flex; align-items: center; justify-content: center; }
.tchev { color: var(--neutral-light, #8e9fbc); transition: transform .12s; }
.tchev.open { transform: rotate(90deg); }
.ban { flex: 0 0 auto; position: relative; width: 12px; height: 12px; border: 1.5px solid currentColor; border-radius: 50%; }
.ban::after { content: ''; position: absolute; inset: 0; margin: auto; width: 12px; height: 1.5px; background: currentColor; transform: rotate(45deg); }
/* multi checkbox = obs-checkbox (white box, grey-blue border, navy tick) */
.cbx { position: relative; flex: 0 0 auto; width: 18px; height: 18px; border-radius: 3px; box-sizing: border-box; border: 1.5px solid var(--neutral-lighter, #e3e8f2); background: var(--checkbox-bg, #fff); }
.cbx.ck { border-color: var(--checkbox-checked-border-color, #6a7fa0); }
.cbx.ck::after { content: ''; position: absolute; left: 5px; top: 1px; width: 4px; height: 9px; border: solid var(--checkbox-checked-color, #111c2c); border-width: 0 2px 2px 0; transform: rotate(45deg); }
.cbx.ind { border-color: var(--primary-alt, #3279be); }
.cbx.ind::after { content: ''; position: absolute; left: 3px; right: 3px; top: 50%; height: 2px; border-radius: 1px; background: var(--primary-alt, #3279be); transform: translateY(-50%); }
.empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px; color: var(--neutral-light, #8e9fbc); font-size: 13px; }
.empty-ic { width: 30px; height: 24px; border: 2px solid currentColor; border-radius: 4px; opacity: 0.5; }
/* bordered "✕ Clear" footer, right-aligned */
.foot { display: flex; justify-content: flex-end; padding: 6px 8px 8px; border-top: 1px solid var(--border-color, #e3e8f2); margin-top: 2px; }
.clearbtn { display: inline-flex; align-items: center; gap: 7px; padding: 5px 14px; border: 1px solid var(--border-color, #e3e8f2); border-radius: 4px; background: var(--page-background-color, #fff); color: var(--page-text-color, #1d2a3e); cursor: pointer; font: inherit; font-size: 13px; }
.clearbtn:hover { border-color: var(--neutral-light, #8e9fbc); }
.clearbtn .x { font-size: 14px; line-height: 1; }
/* two-pane description */
.descpane { flex: 1; min-width: 0; padding: 14px; border-left: 1px solid var(--border-color, #e3e8f2); }
.desc-title { font-weight: 600; font-size: 13px; margin-bottom: 8px; }
.desc-body { color: var(--neutral-light, #8e9fbc); font-size: 12px; line-height: 1.5; }
.desc-hint { color: var(--neutral-light, #8e9fbc); font-size: 12px; }
</style>
