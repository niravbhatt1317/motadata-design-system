#!/usr/bin/env node
/**
 * build-elements-api.mjs — generate elements-api.json: the machine-readable API of every obs-* web component,
 * extracted from the ACTUAL .ce.vue source (defineProps + defineEmits), not the product-component registry.
 *
 * Fixes field-report C6 ("empty observedAttributes → an agent can't discover the element's own API"). Ships in
 * the package so a tool reads { 'obs-input': { attributes:[…], events:[…], referenceOnly:bool } } directly.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(HERE, '..', 'src', 'elements')
const OUT = path.join(HERE, '..', 'dist', 'elements-api.json')

// tag → Component file (from src/index.js) + referenceOnly (from the DS: filters/date/layout are visual-only)
const MAP = {
  'obs-button': 'ObsButton', 'obs-tag': 'ObsTag', 'obs-checkbox': 'ObsCheckbox', 'obs-switch': 'ObsSwitch',
  'obs-selected-pills': 'ObsSelectedPills', 'obs-radio': 'ObsRadio', 'obs-input': 'ObsInput', 'obs-link': 'ObsLink',
  'obs-select': 'ObsSelect', 'obs-severity': 'ObsSeverity', 'obs-tags': 'ObsTags', 'obs-tooltip': 'ObsTooltip',
  'obs-dataviz-tooltip': 'ObsDataVizTooltip', 'obs-date-time-picker': 'ObsDateTimePicker', 'obs-filters': 'ObsFilters',
  'obs-drawer': 'ObsDrawer', 'obs-icon': 'ObsIcon', 'obs-grid-select': 'ObsGridSelect',
  'obs-menu': 'ObsMenu', 'obs-color-picker': 'ObsColorPicker', 'obs-table': 'ObsTable', 'obs-modal': 'ObsModal',
  'obs-metric-list': 'ObsMetricList', 'obs-key-value': 'ObsKeyValue',
  'obs-layout-appshell': 'ObsLayoutAppShell', 'obs-layout-grid': 'ObsLayoutGrid', 'obs-layout-regions': 'ObsLayoutRegions',
  'obs-layout-shells': 'ObsLayoutShells', 'obs-layout-page-templates': 'ObsLayoutPageTemplates', 'obs-layout-panels': 'ObsLayoutPanels',
  'obs-tabs': 'ObsTabs', 'obs-steps': 'ObsSteps', 'obs-page-header': 'ObsPageHeader', 'obs-app-header': 'ObsAppHeader',
  'obs-user-menu': 'ObsUserMenu', 'obs-notification-menu': 'ObsNotificationMenu', 'obs-command-palette': 'ObsCommandPalette',
  'obs-toolbar': 'ObsToolbar', 'obs-divider': 'ObsDivider', 'obs-banner': 'ObsBanner', 'obs-sidebar': 'ObsSidebar',
  'obs-breadcrumbs': 'ObsBreadcrumbs', 'obs-side-menu': 'ObsSideMenu', 'obs-logo': 'ObsLogo',
  'obs-metric-picker': 'ObsMetricPicker', 'obs-noc-player': 'ObsNocPlayer', 'obs-timeline-scrollbar': 'ObsTimelineScrollbar',
}
const REFERENCE_ONLY = new Set(['obs-date-time-picker', 'obs-layout-appshell', 'obs-layout-grid',
  'obs-layout-regions', 'obs-layout-shells', 'obs-layout-page-templates', 'obs-layout-panels'])

// camelCase prop → kebab-case attribute (how you set it in HTML)
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

// Extract an enum from a prop's trailing note when it lists discrete values, e.g.
//   "current theme: dark | light | auto"  → ['dark','light','auto']
//   "footer preset — Values: close · cancel-save · delete-split"  → [...]
// Conservative: split on | / · , take the "Values:" tail if present, and only accept when EVERY part is a clean
// lowercase token (so prose notes never produce a bogus enum).
// Enums documented OUTSIDE the prop's trailing note (in a nearby comment block) — keyed "tag prop".
const ENUM_OVERRIDES = {
  'obs-drawer footer': ['close', 'cancel-save', 'reset-cancel-save', 'delete-split', 'note-split'],
}
function parseEnum(note) {
  if (!note) return null
  // prefer the text AFTER the last colon (e.g. "current theme selection: dark | light | auto"), else the whole note
  let seg = note.includes(':') ? note.slice(note.lastIndexOf(':') + 1) : note
  const parts = seg.split(/\s*[|·]\s*/).map((s) => s.trim()).filter(Boolean)
  if (parts.length < 2 || parts.length > 10) return null
  if (!parts.every((p) => /^[a-z][a-z0-9-]*$/.test(p))) return null
  return parts
}
function parseProps(src) {
  const m = src.match(/defineProps\(\{([\s\S]*?)\n\}\)/) // the defineProps object body
  if (!m) return []
  const body = m[1]
  const props = []
  // each line like:  name: { type: String, default: false }, // optional trailing note for AI tools
  const re = /^\s*([a-zA-Z0-9]+):\s*\{([^}]*)\}\s*,?\s*(?:\/\/\s*(.*))?$/gm
  let mm
  while ((mm = re.exec(body))) {
    const name = mm[1]
    const spec = mm[2]
    const note = (mm[3] || '').trim()
    const type = (spec.match(/type:\s*(\[[^\]]*\]|[A-Za-z]+)/) || [])[1] || 'String'
    const def = (spec.match(/default:\s*([^,]+?)(?:,|$)/) || [])[1]
    const en = parseEnum(note)
    props.push({ prop: name, attribute: kebab(name), type: type.replace(/\s+/g, ''), ...(def !== undefined ? { default: def.trim() } : {}), ...(en ? { enum: en } : {}), ...(note ? { note } : {}) })
  }
  return props
}
function parseEmits(src) {
  const m = src.match(/defineEmits\(\[([^\]]*)\]\)/)
  if (!m) return []
  return m[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean)
}
// Human-readable descriptions for elements whose slot NAME is dynamic (provided at runtime, not a fixed string).
const DYNAMIC_SLOT_NOTES = {
  'obs-tabs': 'one named content slot PER TAB — the slot name is that tab\'s `key` (e.g. <obs-tabs tabs=\'[{"key":"overview",…}]\'><div slot="overview">…</div></obs-tabs>). Only the active tab\'s pane shows.',
}
// Slots the element exposes — parsed from the template's <slot> tags (default = the unnamed slot). A slot whose
// name is BOUND (`:name`/`v-bind:name`) or isn't a plain slot-name token is DYNAMIC — never leak the JS expression
// as if it were a real slot name (that shipped "t.key" before); record it as a dynamic-slot note instead.
function parseSlots(src, tag) {
  const t = src.match(/<template>([\s\S]*)<\/template>/)
  if (!t) return { slots: [], dynamicSlots: undefined }
  const slots = []
  let hasDynamic = false
  const re = /<slot\b([^>]*?)\/?>/g
  let m
  while ((m = re.exec(t[1]))) {
    const attrs = m[1]
    if (/(?::name|v-bind:name)\s*=/.test(attrs)) { hasDynamic = true; continue } // bound name → dynamic
    const nm = (attrs.match(/(?:^|\s)name="([^"]+)"/) || [])[1]
    if (nm && !/^[a-zA-Z][\w-]*$/.test(nm)) { hasDynamic = true; continue } // not a valid slot-name token → dynamic
    const name = nm || 'default'
    if (!slots.includes(name)) slots.push(name)
  }
  return { slots, dynamicSlots: hasDynamic ? (DYNAMIC_SLOT_NOTES[tag] || 'also exposes a dynamic named slot whose name is provided at runtime') : undefined }
}

const api = {}
for (const [tag, comp] of Object.entries(MAP)) {
  const f = path.join(SRC, `${comp}.ce.vue`)
  if (!fs.existsSync(f)) continue
  const src = fs.readFileSync(f, 'utf8')
  const attributes = parseProps(src)
  for (const a of attributes) { const ov = ENUM_OVERRIDES[`${tag} ${a.prop}`]; if (ov && !a.enum) a.enum = ov } // enums documented elsewhere
  const { slots, dynamicSlots } = parseSlots(src, tag)
  api[tag] = {
    element: comp,
    referenceOnly: REFERENCE_ONLY.has(tag),
    attributes,
    events: parseEmits(src),
    slots,
    ...(dynamicSlots ? { dynamicSlots } : {}),
  }
}
const doc = {
  $note: 'The ACTUAL API of each obs-* web component (parsed from the element source), for tools that need to ' +
    'discover attributes/events/SLOTS without reverse-engineering the shadow DOM. Events deliver the value in ' +
    'event.detail as an ARRAY (unwrap detail[0]). String props with discrete values carry an `enum`. `slots` lists ' +
    'the named slots (plus "default" for the unnamed slot). `referenceOnly` = renders but has no functional data contract.',
  elements: api,
}
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(doc, null, 2) + '\n')
console.log(`elements-api.json: ${Object.keys(api).length} elements → ${path.relative(path.join(HERE, '..'), OUT)}`)
