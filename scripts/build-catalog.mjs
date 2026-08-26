#!/usr/bin/env node
/**
 * build-catalog.mjs — regenerate design-system/component-catalog.html (the interactive "pick a component"
 * catalog). Encodes the FULL discovered inventory (components/inventory.md) — Atoms · Molecules · Organisms ·
 * Templates · Patterns · Infrastructure — cross-referenced with the registry (index.json) for which are
 * catalogued in the DS Storybook, their real usage, and their Storybook link. Injects the DS token CSS + the
 * obs-* web-components bundle + the dataset into scripts/catalog.tmpl.html → a self-contained HTML page.
 *
 * The page is built WITH the design system's own components (obs-input/button/switch/tag). Re-run after
 * cataloguing a component or editing the inventory:  node design-system/scripts/build-catalog.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DS = path.resolve(HERE, '..')
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const regPath = (id) => path.join(DS, 'components', 'registry', `${id}.json`)

// Known usage where registry.usage.total is absent (from family-map / sweeps).
const USE = { input: 181, severity: 80, table: 75, menu: 13, modal: 40, toolbars: 174, navigation: 50,
  filters: 82, 'date-time-pickers': 60, 'data-viz-tooltips': 94, tooltip: 94, popover: 35 }

// Catalogued lookup: id -> { display, storybook, usage, known }. Reads EVERY registry file (not just
// index.json.components) so the layout-* Foundations registries resolve too.
function catLookup() {
  const dir = path.join(DS, 'components', 'registry')
  const m = {}
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json') || f.startsWith('_')) continue
    const id = f.replace(/\.json$/, '')
    const r = readJson(path.join(dir, f))
    m[id] = { display: r.display, storybook: r.storybook, tier: r.tier,
      usage: (r.usage && r.usage.total) || USE[id] || null, known: (r.knownIssues || []).length,
      component: r.component || '' }
  }
  return m
}

// Uncatalogued usage overrides (kit components with a known count, not in the registry).
const USEO = { 'MBadge': 4, 'MAvatar': 1, 'MRate': 0, 'MCollapse (+Panel)': 22, 'MAlert': 2, 'MTimeline (+Item)': 0, 'MSteps / MStep': 0 }

// The full inventory. Tuple: [name, group, source, rec, catId, partOf, hint]
//   rec: primary|building-block|alternative|avoid|foundation|consolidate|pattern|infra|example
//   catId: '' if not catalogued; else the registry id (pulls usage/status/link)
const F = 'Foundations', A = 'Atoms', M = 'Molecules', O = 'Organisms', T = 'Templates', P = 'Patterns', I = 'Infrastructure'
const ITEMS = [
  // ── Foundations ─────────────────────────────────────────────────────────
  ['App shell', F, 'layout', 'foundation', 'layout-app-shell', '', 'The nav+header+content chrome every page sits in.'],
  ['Grid (MRow / MCol)', F, 'mkit', 'foundation', 'layout-grid', '', '12-col layout — use for every form/field layout.'],
  ['Screen regions', F, 'layout', 'foundation', 'layout-screen-regions', '', 'Page header · toolbar · body · footer skeleton.'],
  ['Layout shells', F, 'layout', 'foundation', 'layout-shells', '', 'Route/content shell patterns.'],
  ['Page templates', F, 'layout', 'foundation', 'layout-page-templates', '', 'Annotated page wireframes.'],
  ['Panel behaviours', F, 'layout', 'foundation', 'layout-panels', '', 'Drawer/modal/collapsible behaviours.'],
  ['Design tokens', F, 'std', 'foundation', '', '', '322 themed tokens — the portable core. Resolve every colour to one.'],

  // ── Atoms ───────────────────────────────────────────────────────────────
  ['Button', A, 'mkit', 'primary', 'button', '', 'The action control. Variants + sizes + icon buttons.'],
  ['Icon', A, 'mkit', 'primary', '', '', 'MIcon — Font Awesome (fal) wrapper. See Assets/Icons.'],
  ['Input', A, 'mkit', 'primary', 'input', '', 'MInput / InputNumber / Search / Group — the text control.'],
  ['Checkbox', A, 'mkit', 'primary', 'checkbox', '', 'Overrides the kit — use this, not a-checkbox.'],
  ['Radio', A, 'mkit', 'primary', 'radio', '', 'MRadio / MRadioGroup — single + grouped choice.'],
  ['Switch', A, 'mkit', 'primary', 'switch', '', 'Toggle.'],
  ['Tag', A, 'mkit', 'primary', 'tag', '', 'MTag / MCheckableTag — label / toggleable label.'],
  ['Divider', A, 'mkit', 'primary', 'divider', '', 'Separator rule (F1: dashed is a no-op).'],
  ['Severity', A, 'std', 'primary', 'severity', '', 'Severity colour bar / badge (status level).'],
  ['Link', A, 'floto', 'primary', 'link', '', 'FlotoLink — router / external link.'],
  ['Empty / error / skeleton', A, 'mkit', 'primary', '', '', 'MNoData / MDataError / MPlaceholder — use for every empty/error state.'],
  ['Loader / spinner', A, 'floto', 'primary', '', '', 'MLoader (_base-loader) — the spinner.'],
  ['Progress', A, 'std', 'primary', '', '', 'progress / radial-progress — bar / ring.'],
  ['MBadge', A, 'mkit', 'alternative', '', '', 'Count/status indicator — consider Severity/Tag first.'],
  ['MAvatar', A, 'mkit', 'alternative', '', '', 'Entity avatar (FlotoUserAvatar adds initials fallback).'],
  ['MAffix', A, 'mkit', 'alternative', '', '', 'Sticky wrapper.'],
  ['value-slider', A, 'std', 'alternative', '', '', 'Numeric slider.'],
  ['MRate', A, 'mkit', 'avoid', '', '', 'Star rating — unused in product.'],
  ['MFormItem (kit)', A, 'mkit', 'building-block', '', 'form-item', 'Label+validation shell; FlotoFormItem wraps it.'],
  ['MStatusArrow', A, 'floto', 'building-block', '', '', 'Status-coloured arrow icon.'],
  ['FlotoBackButton', A, 'floto', 'building-block', '', 'button', 'Nav back (trivial pattern).'],
  ['FlotoUserAvatar', A, 'floto', 'building-block', '', '', 'Avatar with initials fallback.'],
  ['flag-emoji', A, 'sub', 'building-block', '', '', 'Country flag.'],
  ['menu-toggle-button / hoverable-action', A, 'std', 'building-block', '', '', 'Small UI affordances.'],
  ['TreeNodeToggler', A, 'sub', 'building-block', '', 'InfiniteTree', 'Expand/collapse caret.'],

  // ── Molecules · Form & input ──────────────────────────────────────────────
  ['Form Item', M, 'floto', 'primary', 'form-item', '', 'FlotoFormItem — THE form field. Use for every field (validation+label+error+is-view).'],
  ['Dropdown Picker', M, 'floto', 'primary', 'dropdown-picker', '', 'FlotoDropdownPicker — search+virtual+multi. The base of all pickers.'],
  ['Date & Time Pickers', M, 'mkit', 'primary', 'date-time-pickers', '', 'MDatePicker / MTimePicker + range/granularity.'],
  ['Radio / Checkbox Group', M, 'mkit', 'primary', 'radio', '', 'MRadioGroup / MCheckboxGroup — grouped choices.'],
  ['Loose Tags', M, 'std', 'primary', 'loose-tags', '', 'Free-entry tag input.'],
  ['password-input / verify', M, 'std', 'primary', '', '', 'Password field + confirm.'],
  ['FlotoDropdownGridSelector', M, 'floto', 'alternative', '', 'dropdown-picker', 'Grid-style picker for large sets.'],
  ['MAutoComplete / MCascader / MTreeSelect', M, 'mkit', 'alternative', '', 'dropdown-picker', 'Typeahead / cascading / tree — prefer DropdownPicker for consistency.'],
  ['color / severity / image / file inputs', M, 'std', 'alternative', '', '', 'color-picker / severity-picker / image-selector / file-dropper — specialized inputs.'],
  ['code / JSON editors', M, 'std', 'alternative', '', '', 'code-editor / json-code-mirror / widget-json-editor (CodeMirror).'],
  ['Select', M, 'mkit', 'avoid', 'select', '', 'MSelect — raw select (2×). Prefer FlotoDropdownPicker (510×).'],
  ['Tags List', M, 'std', 'avoid', 'tags-list', '', 'Dead (0×) — use Loose Tags.'],
  ['column-selector', M, 'std', 'building-block', '', 'toolbars', 'Show/hide columns.'],
  ['multiple-form-items / date-remark-pairs', M, 'std', 'building-block', '', '', 'Repeater field groups.'],
  ['otp-input / inline-name-edit', M, 'sub', 'building-block', '', '', 'OTP, inline rename.'],
  ['granularity / time-range controls', M, 'sub', 'building-block', '', '', 'granularity-input / selection / time-range-picker (widget time controls).'],
  ['Data Picker (46 → 1)', M, 'floto', 'consolidate', '', 'dropdown-picker', 'The 46 data-pickers (group/tag/monitor/credential/role/…) collapse to ONE generic FlotoDropdownPicker + a registry.'],

  // ── Molecules · Display & overlay ─────────────────────────────────────────
  ['Tabs', M, 'mkit', 'primary', 'tabs', '', 'MTab / MTabPane (+ persisted variant).'],
  ['Tooltip', M, 'floto', 'primary', 'tooltip', '', 'FlotoTooltip — the themed override. (MTooltip is excluded in favour of this.)'],
  ['Popover', M, 'mkit', 'primary', 'popover', '', 'MPopover — click/hover panel.'],
  ['Menu', M, 'mkit', 'primary', 'menu', '', 'MMenu — vertical list of selectable rows.'],
  ['Navigation', M, 'floto', 'primary', 'navigation', '', 'Top nav / sidebar navigation.'],
  ['Data-viz Tooltip', M, 'sub', 'building-block', 'data-viz-tooltips', 'charts', 'Chart hover tooltip — part of the charts layer.'],
  ['MCard', M, 'mkit', 'primary', '', '', 'Bounded content region — an alternative to divider-separated sections.'],
  ['MCollapse (+Panel)', M, 'mkit', 'primary', '', '', 'Accordion — expandable sections (22×).'],
  ['MUpload', M, 'mkit', 'primary', '', '', 'File upload control for forms.'],
  ['MList', M, 'mkit', 'alternative', '', '', 'List display.'],
  ['MAlert', M, 'mkit', 'alternative', '', '', 'Inline alert (2×) — consider a toast/notification.'],
  ['MSteps / MStep', M, 'mkit', 'alternative', '', '', 'Wizard steps (rare).'],
  ['MComment', M, 'mkit', 'alternative', '', '', 'Comment thread.'],
  ['MTimeline (+Item)', M, 'mkit', 'alternative', '', '', 'Vertical event timeline (unused today).'],
  ['Scheduler', M, 'sub', 'alternative', 'scheduler', '', 'Recurrence / cron builder (16×).'],
  ['FlotoStatusTag', M, 'floto', 'building-block', '', 'tag', 'Maps a status STRING → coloured tag pill.'],
  ['MPagination', M, 'mkit', 'building-block', '', 'table', 'Pager — usually inside a Table.'],
  ['MPersistedTab / MPersistedColumns', M, 'floto', 'building-block', '', 'tabs', 'Tabs/columns with localStorage memory.'],
  ['MDropdown', M, 'mkit', 'building-block', '', 'menu', 'Overflow / menu actions.'],
  ['MConfirmBtn', M, 'mkit', 'building-block', '', 'button', 'Inline confirm popover.'],
  ['FlotoExpand', M, 'floto', 'building-block', '', '', 'Height-animated reveal.'],
  ['MPopper', M, 'floto', 'building-block', '', 'popover', 'Low-level positioning util.'],
  ['picker triggers / selected pills', M, 'sub', 'building-block', '', 'dropdown-picker', 'single-trigger / multiple-trigger / selected-item-pills — picker trigger displays.'],
  ['filter-bar building blocks', M, 'sub', 'building-block', '', 'filters', 'filter-condition / chip / match-toggle / trigger / quick-menu / empty-state.'],
  ['rich displays', M, 'sub', 'building-block', '', '', 'json-viewer / date-time-popover / counter-description / slo-progress-bar.'],
  ['monitor-type', M, 'std', 'building-block', '', '', 'Monitor-type label/icon.'],

  // ── Organisms ─────────────────────────────────────────────────────────────
  ['Paginated CRUD', O, 'floto', 'primary', '', '', 'FlotoPaginatedCrud — the canonical CRUD organism (grid+toolbar+drawer-form+delete-confirm).'],
  ['Form', O, 'floto', 'primary', '', '', 'FlotoForm — validation orchestration wrapper.'],
  ['Drawer Form', O, 'floto', 'primary', '', '', 'FlotoDrawerForm — form inside a drawer (create/edit flow).'],
  ['Table', O, 'floto', 'primary', 'table', '', 'MGrid / MServerGrid — data table / server-paginated.'],
  ['Drawer', O, 'floto', 'primary', 'drawer', '', 'FlotoDrawer — side-panel shell.'],
  ['Modal', O, 'mkit', 'primary', 'modal', '', 'MModal — dialog overlay.'],
  ['Filters', O, 'sub', 'primary', 'filters', '', 'Filters / FiltersContainer — the filter expression builder.'],
  ['Toolbars', O, 'sub', 'primary', 'toolbars', '', 'Grid toolbars / column chooser.'],
  ['Page Header', O, 'floto', 'primary', '', '', 'FlotoPageHeader — page title + actions.'],
  ['Confirm Modal', O, 'floto', 'primary', '', '', 'FlotoConfirmModal — destructive-action confirm.'],
  ['Content Loader', O, 'floto', 'primary', '', '', 'FlotoContentLoader — section loading overlay.'],
  ['No Data / empty states', O, 'floto', 'primary', '', '', 'FlotoNoData / FlotoModuleNoData — large empty states.'],
  ['Tree (hierarchy)', O, 'sub', 'primary', '', '', 'InfiniteTree / tree-node — master–detail hierarchy.'],
  ['Widget system', O, 'sub', 'primary', '', '', 'widget / widgets / form / group / selector / preview — the dashboard/charts layer (the main coverage gap).'],
  ['Server Card', O, 'floto', 'alternative', '', '', 'MServerCard — server-fetched card.'],
  ['item-selection panels', O, 'sub', 'alternative', '', '', 'monitor/group/table/tag/log-parser selection panels.'],
  ['api-socket-grid', O, 'sub', 'alternative', '', '', 'Socket-backed live grid.'],
  ['grid internals', O, 'sub', 'building-block', '', 'table', 'virtual-table / custom-cell / select-all / linked-records-detail-modal.'],
  ['Bulk Action Bar', O, 'floto', 'building-block', '', 'table', 'FlotoBulkActionBar — multi-select toolbar.'],
  ['Grid Actions', O, 'floto', 'building-block', '', 'table', 'FlotoGridActions — row action menu.'],
  ['Filter Bar', O, 'sub', 'building-block', '', 'filters', 'FlotoFilterBar — filter chips bar (+ legacy).'],
  ['notifications', O, 'sub', 'example', '', '', 'App toast/banner notifications (alert/expire).'],
  ['domain detail organisms', O, 'sub', 'example', '', '', 'interface / process / container / docker / wan-link detail views.'],

  // ── Templates ─────────────────────────────────────────────────────────────
  ['App shell (main.vue)', T, 'layout', 'primary', '', 'app-shell', 'Authenticated shell: NavBar + Header + scroll content.'],
  ['Auth / minimal / public layouts', T, 'layout', 'primary', '', '', 'login-layout / empty-layout / public-layout.'],
  ['Permission gate', T, 'floto', 'primary', '', '', 'MPermissionChecker — RBAC gate.'],
  ['License gate', T, 'floto', 'primary', '', '', 'License permission gate (name-collision — rename planned).'],
  ['Scroll views', T, 'floto', 'building-block', '', '', 'FlotoScrollView / FlotoNoScrollView — scroll containers.'],
  ['Module boundary', T, 'floto', 'building-block', '', '', 'FlotoModule — page error boundary wrapper.'],
  ['monitor-hierarchy-layout', T, 'layout', 'example', '', '', 'Inventory split-pane (sidebar + content).'],
  ['FlotoDummyPage', T, 'floto', 'example', '', '', 'Placeholder page.'],

  // ── Patterns (recipes — composed, not new components) ─────────────────────
  ['List / CRUD page', P, '', 'pattern', '', '', 'FlotoPageHeader + FlotoPaginatedCrud — the dominant screen type.'],
  ['Form in drawer', P, '', 'pattern', '', '', 'FlotoDrawerForm + FlotoForm + FlotoFormItem — create/edit flow.'],
  ['Master–detail', P, '', 'pattern', '', '', 'InfiniteTree + content panel — inventory, topology.'],
  ['Settings split-pane', P, '', 'pattern', '', '', 'Split menu + FlotoScrollView + RouterView — all settings sub-modules.'],
  ['Detail + tabs + widgets', P, '', 'pattern', '', '', 'MTab + MRow/MCol widget grid — dashboards / detail pages.'],
  ['Dashboard', P, '', 'pattern', '', '', 'Widget system in a grid layout.'],
  ['Filter + grid', P, '', 'pattern', '', '', 'FlotoFilterBar + MServerGrid — list filtering.'],
  ['Empty / loading / error', P, '', 'pattern', '', '', 'FlotoContentLoader + FlotoNoData + error-handler.'],
  ['Data-provider context', P, '', 'pattern', '', '', 'Render-prop providers feeding shared data into a subtree.'],

  // ── Infrastructure (non-visual — documented, not in the visual catalog) ────
  ['Data Providers (44 → 1)', I, 'sub', 'consolidate', '', '', '44 render-prop context providers paralleling the 46 pickers — collapse to one, like the pickers.'],
  ['Socket / DB / infra utilities', I, 'std', 'infra', '', '', 'socket-context · local-db-collection · severity-db · status-db · screen-blocker · shortcut-handler · user-preference · …'],
  ['Error handling', I, 'sub', 'infra', '', '', '_base-error-handler / _base-error-shower.'],
]

function buildData() {
  const CAT = catLookup()
  const rows = ITEMS.map(([name, group, source, rec, catId, partOf, hint]) => {
    const c = catId && CAT[catId]
    // Foundations are documented in the Storybook Foundations section even without an index entry.
    const catalogued = !!c || group === 'Foundations'
    return {
      name, group, source, rec, hint, partOf: partOf || null,
      component: c ? c.component : '',
      family: '—',
      status: catalogued ? 'catalogued' : 'todo',
      usage: c ? c.usage : (USEO[name] ?? null),
      storybook: c ? c.storybook : null,
      known: c ? c.known : 0,
    }
  })
  // Safety net: auto-include ANY catalogued registry not already covered by a curated ITEMS row, so a
  // newly-onboarded component can never be missing from the catalog. (Give it a curated row later for a
  // better group/recommendation/note.)
  const covered = new Set(ITEMS.map((t) => t[4]).filter(Boolean))
  const TIERG = { atom: 'Atoms', molecule: 'Molecules', organism: 'Organisms', foundation: 'Foundations' }
  for (const [id, c] of Object.entries(CAT)) {
    if (covered.has(id)) continue
    rows.push({ name: c.display || id, group: TIERG[c.tier] || 'Molecules', source: '', rec: 'primary',
      hint: '(auto-added from the registry — add a curated row in build-catalog.mjs ITEMS for grouping/recommendation)',
      partOf: null, component: c.component || '', family: '—', status: 'catalogued', usage: c.usage,
      storybook: c.storybook, known: c.known })
  }
  return rows
}

// ── Achievement metrics ──────────────────────────────────────────────────────
// (1) added% = catalogued / total (raw count).
// (2) coverage% = IMPACT-weighted — each component weighted by how essential it is to building the
//     product (role + real usage), so covering the foundational/high-usage few moves the needle most.
// (3) patterns buildable = of the DS's composed page patterns, how many are fully composable from the
//     components catalogued so far (the concrete "can you build real pages/flows" read).
const REC_WEIGHT = { foundation: 4, primary: 4, consolidate: 3, 'building-block': 1.5, alternative: 0.5, avoid: 0, example: 0, infra: 0, pattern: 0 }
// Each pattern → the component ROWS (by name) it needs; buildable when all are catalogued.
const PATTERNS = {
  'List / CRUD page': ['Page Header', 'Paginated CRUD'],
  'Form in drawer': ['Drawer Form', 'Form', 'Form Item'],
  'Master–detail': ['Tree (hierarchy)'],
  'Settings split-pane': ['Menu', 'Scroll views'],
  'Detail + tabs + widgets': ['Tabs', 'Widget system'],
  'Dashboard': ['Widget system'],
  'Filter + grid': ['Filters', 'Table'],
  'Empty / loading / error': ['Content Loader', 'No Data / empty states'],
  'Data-provider context': ['Data Providers (44 → 1)'],
}
function metrics(rows) {
  const total = rows.length
  const catalogued = rows.filter((r) => r.status === 'catalogued').length
  const wt = (r) => (REC_WEIGHT[r.rec] > 0 ? REC_WEIGHT[r.rec] + (Number(r.usage) > 0 ? Number(r.usage) / 100 : 0) : 0)
  let cw = 0, tw = 0
  for (const r of rows) { const w = wt(r); tw += w; if (r.status === 'catalogued') cw += w }
  const byName = Object.fromEntries(rows.map((r) => [r.name, r]))
  const isCat = (n) => byName[n] && byName[n].status === 'catalogued'
  const reqs = Object.values(PATTERNS)
  const patternsBuildable = reqs.filter((req) => req.every(isCat)).length
  return { total, catalogued, addedPct: Math.round((catalogued / total) * 100),
    coveragePct: Math.round((cw / tw) * 100), patternsBuildable, patternsTotal: reqs.length }
}

const css = fs.readFileSync(path.join(DS, 'css-package', 'dist', 'observeops-ds.css'), 'utf8')
const js = fs.readFileSync(path.join(DS, 'components-lib', 'dist', 'observeops-elements.js'), 'utf8')
const rows = buildData()
const data = JSON.stringify(rows)
const stats = metrics(rows)
const tmpl = fs.readFileSync(path.join(HERE, 'catalog.tmpl.html'), 'utf8')
const html = tmpl.replace('__DS_CSS__', () => css).replace('__DS_JS__', () => js)
  .replace('__DATA__', () => data).replace('__STATS__', () => JSON.stringify(stats))
const out = path.join(DS, 'component-catalog.html')
fs.writeFileSync(out, html)
console.log(`component-catalog.html ← ${rows.length} components (${stats.catalogued} catalogued = ${stats.addedPct}% added · ${stats.coveragePct}% impact coverage · ${stats.patternsBuildable}/${stats.patternsTotal} patterns buildable) · ${(html.length / 1024) | 0}KB`)
