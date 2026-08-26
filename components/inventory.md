# Component Inventory (complete, tiered, source-tagged)

Every library-candidate component, classified by **atomic tier**, tagged by **source
layer** and **status**. Grounded in the actual files (enumerated 2026-06-05), not memory.

**Source:** `mkit` (@motadata/ui `M*`) · `floto` (`_base-*`/Floto globals) · `sub`
(shared subfolder) · `std` (standalone `src/components/*.vue`) · `layout` ·
`ant` (Ant 1.x).
**Status:** `core` (formalize) · `collapse` (merge duplicates) · `example` (story only)
· `infra` (non-visual; documented, not in visual catalog).

> Tier placement follows [`tier-rules.md`](./tier-rules.md). Per that rule, four
> components provisionally listed under Organisms below are actually **Molecules**
> (`FlotoPageHeader`, `FlotoConfirmModal`, `FlotoContentLoader`,
> `FlotoNoData`/`FlotoModuleNoData`) — they'll be moved when we author the per-tier specs.

## 1. Atoms

Irreducible primitives — the vocabulary everything else is built from.

| Component | Source | Status | Note |
| --- | --- | --- | --- |
| MButton | mkit | core | variants: primary/danger/ghost/default + neutral set; loading/block/outline |
| MIcon | mkit | core | Font Awesome wrapper (fal default); the icon atom |
| MInput / MInputNumber / MInputSearch / MInputGroup | mkit | core | text/number/search; base text control |
| MCheckbox | mkit | core | **overrides** M kit's — use this, not `a-checkbox` directly |
| MRadio | mkit | core | single radio |
| MSwitch | mkit | core | toggle |
| MTag / MCheckableTag | mkit | core | label / toggleable label |
| MBadge | mkit | core | count/status indicator |
| MAvatar | mkit | core | entity avatar |
| MRate | mkit | core | star rating |
| MDivider | mkit | core | separator |
| MNoData / MDataError / MPlaceholder | mkit | core | empty/error/skeleton graphics |
| MRow / MCol | mkit | core | 12-col grid primitives |
| MFormItem | mkit | core | label + validation-state shell (Floto wraps it) |
| MAffix | mkit | core | sticky wrapper |
| MLoader (`_base-loader`) / spinner | floto/std | core | spinner |
| MStatusArrow (`_base-status-arrow`) | floto | core | status-colored arrow icon |
| FlotoUserAvatar (`_base-user-avatar`) | floto | core | avatar with initials fallback |
| FlotoBackButton (`_base-back-button`) | floto | core | nav back |
| FlotoLink (`_base-app-link`) | floto | core | router/external link |
| flag-emoji | sub | core | country flag |
| severity-stripe / severity | std | core | severity color bar / badge |
| progress / radial-progress | std | core | progress bar / ring |
| value-slider | std | core | numeric slider |
| menu-toggle-button / hoverable-action | std | core | small UI affordances |
| TreeNodeToggler (`hierarchy/tree-node-toggler`) | sub | core | expand/collapse caret |

## 2. Molecules

Small composites with a single job — usable as one control/display unit.

### Form & input molecules

| Component | Source | Status | Note |
| --- | --- | --- | --- |
| **FlotoFormItem** (`_base-form-item`) | floto | core | **THE form field** — validation+label+error+is-view. Use for every field |
| FlotoDropdownPicker (`_base-dropdown-picker`) | floto | core | search + virtual list + multi-select; base of all pickers |
| FlotoDropdownGridSelector (`_base-dropdown-grid-selector`) | floto | core | grid-style picker for large sets |
| MSelect (+Option/OptGroup) | mkit | core | simple select |
| MAutoComplete / MCascader / MTreeSelect | mkit | core | typeahead / cascading / tree select |
| MDatePicker / MTimePicker | mkit | core | date / time |
| MRadioGroup / MCheckboxGroup | mkit | core | grouped choices |
| color-picker / severity-picker / image-selector / file-dropper | std | core | specialized inputs |
| password-input / password-verify | std | core | password field + confirm |
| time-picker / loose-tags / tags-list / column-selector | std | core | misc inputs/displays |
| code-editor / json-code-mirror / widget-json-editor | std/sub | core | code/JSON editors (CodeMirror) |
| multiple-form-items / date-remark-pairs | std | core | repeater field groups |
| otp-input / Inline-name-edit | sub | core | OTP, inline rename |
| granularity-input / granularity-selection / time-range-picker | sub | core | widget time controls |

### The 46 data-pickers → collapse to one

| Component | Source | Status | Note |
| --- | --- | --- | --- |
| **DataPicker** (proposed) | floto | collapse | ~70% identical wrappers over FlotoDropdownPicker → one generic + a registry |

Existing pickers (all `data-picker/`, → one generic + config): `_base-group-picker`,
`_base-tags-picker`, `_base-monitoring-hour-picker`, `_base-rpe-picker`,
`active-integration`, `additional-column`, `agent`, `apm-service`, `application-type`,
`auto-clear-policy`, `aws-region`, `benchmark`, `correction-profile`, `counter`,
`credential`, `currency-code`, `device-template`, `filter-counter`, `hierarchy`,
`integration-profile`, `interface`, `ldap-server`, `log-parser`, `metric-type`,
`monitor`, `monitor-type`, `monitoring-fields`, `ncm-monitor`, `netroute`,
`notify-time`, `object-tag`, `penalty-profile`, `policy`, `policy-tag`, `process`,
`role`, `rule`, `rum-service`, `runbook-plugin`, `slo-profile`, `snmp-trap-profile`,
`storage-profile`, `user-or-email`, `user`, `user-profile`, `vendor`.

### Display & overlay molecules

| Component | Source | Status | Note |
| --- | --- | --- | --- |
| FlotoStatusTag (`_base-status-tag`) | floto | core | status-mapped colored tag |
| MPagination | mkit | core | pager |
| MTab / MTabPane | mkit | core | tabs |
| MPersistedTab / MPersistedColumns | floto | core | tabs/columns with localStorage memory |
| MSteps / MStep | mkit | core | wizard steps |
| MCard (+Meta/Grid) | mkit | core | card |
| MList (+Item/Meta) | mkit | core | list |
| MCollapse (+Panel) | mkit | core | accordion |
| MMenu (+Item/Group/SubMenu/Divider) | mkit | core | menu |
| MAlert | mkit | core | inline alert |
| MModal / MDrawer / MTooltip / MPopover / MDropdown | mkit | core | overlays (toggle mixin). **MTooltip is overridden** — use Floto/Ant variant |
| MConfirmBtn | mkit | core | inline confirm popover |
| MUpload / MComment / MTimeline (+Item) | mkit | core | upload / comment / timeline |
| FlotoExpand (`_base-expand`) | floto | core | height-animated reveal |
| FlotoTooltip (`_base-tooltip`) | floto | core | themed tooltip (the override) |
| MPopper (`_base-popper`) | floto | core | low-level positioning util |
| single-trigger / multiple-trigger / selected-item-pills | sub | core | picker trigger displays |
| filter-condition / filter-chip / filter-match-toggle / filter-trigger / filter-quick-menu / filter-empty-state | sub | core | filter-bar building blocks |
| json-viewer / date-time-popover / counter-description(-node) / slo-progress-bar | sub | core | rich displays (some organism-ish) |
| monitor-type | std | core | monitor-type label/icon |

## 3. Organisms

Self-contained, often state/API-aware sections — the big reusable building blocks.

| Component | Source | Status | Note |
| --- | --- | --- | --- |
| **FlotoPaginatedCrud** (`crud/_base-paginated-crud`) | floto | core | grid+toolbar+drawer-form+delete-confirm. The canonical CRUD organism |
| FlotoForm (`_base-form`) | floto | core | validation orchestration wrapper |
| FlotoDrawerForm (`crud/_base-drawer-form`) | floto | core | form inside a drawer |
| MGrid (`crud/_base-grid`) / MServerGrid (`crud/_base-server-grid`) | floto | core | data table / server-paginated table |
| MServerCard (`crud/_base-server-card`) | floto | core | server-fetched card |
| virtual-table / custom-cell / select-all / linked-records-detail-modal | sub | core | grid internals + "in use by" modal |
| FlotoPageHeader (`_base-page-header`) | floto | core | page title + actions (molecule-ish) |
| FlotoBulkActionBar (`_base-bulk-action-bar`) | floto | core | multi-select toolbar |
| FlotoGridActions (`_base-grid-actions`) | floto | core | row action menu |
| FlotoConfirmModal (`_base-confirm-modal`) | floto | core | destructive-action confirm (molecule/organism) |
| FlotoContentLoader (`_base-content-loader`) | floto | core | section loading overlay |
| FlotoNoData / FlotoModuleNoData (`_base-no-data`, `_base-module-no-data`) | floto | core | empty states (large; organism-ish) |
| FlotoDrawer (`_base-drawer`) | floto | core | side panel shell |
| Filters / FiltersContainer / FilterGroup / instance-grid (`filters/`) | sub | core | filter expression builder |
| FlotoFilterBar (`filter-bar/_base-filter-bar`) | sub | core | filter chips bar (+ legacy variant) |
| monitor/group/table/tag/log-parser-selection (`item-selection/`) | sub | core | entity selection panels |
| InfiniteTree / tree-node-wrapper / tree-node (`hierarchy/`) | sub | core | hierarchical tree |
| widget / widgets / widget-form / widget-group / widget-selector / preview / save-as-widget (`widgets/`) | sub | core | dashboard widget system |
| api-socket-grid (+filters) (`common/`) | sub | core | socket-backed live grid |
| alert/custom/*-expire-notification (`common/`) | sub | example | app notifications (toast/banner) |
| interface/process/container/docker/wan-link-template, `_base-template-view` (`templates/`) | sub | example | domain detail organisms |

## 4. Templates

Page skeletons and structural wrappers — layout, no business content.

| Component | Source | Status | Note |
| --- | --- | --- | --- |
| main.vue | layout | core | authenticated shell: NavBar + Header + scroll content |
| login-layout / empty-layout / public-layout | layout | core | auth / minimal / public shells |
| monitor-hierarchy-layout | layout | example | inventory split-pane (sidebar + content) |
| FlotoModule (`_base-module`) | floto | core | page error boundary wrapper |
| FlotoScrollView / FlotoNoScrollView (`_base-scroll-view`, `_base-no-scroll-view`) | floto | core | scroll containers |
| MPermissionChecker (`_base-permission-checker`) | floto | core | RBAC gate |
| License gate (`_base-license-permission-checker`) | floto | core | license gate. **Name collision with above — rename** |
| FlotoDummyPage (`_base-dummy-page`) | floto | example | placeholder page |

> ⚠️ `FlotoFixedView` is referenced in older notes but was **not found** in the file
> scan — verify whether it exists / is named differently before cataloging.

## 5. Patterns

Recurring compositions (template + organisms). Documented as recipes + example stories,
not as new components.

| Pattern | Built from | Note |
| --- | --- | --- |
| **List / CRUD page** | FlotoPageHeader + FlotoPaginatedCrud | the dominant screen type |
| **Form in drawer** | FlotoDrawerForm + FlotoForm + FlotoFormItem | create/edit flow |
| **Master–detail** | hierarchy/InfiniteTree + content panel | inventory, topology |
| **Settings split-pane** | split menu + FlotoScrollView + RouterView | all settings sub-modules |
| **Detail + tabs + widgets** | MTab + MRow/MCol widget grid | dashboards/detail pages |
| **Dashboard** | widget system in a grid layout | dashboards |
| **Filter + grid** | FlotoFilterBar + MServerGrid | list filtering |
| **Empty / loading / error** | FlotoContentLoader + FlotoNoData + error-handler | states |
| **Data-provider context** | render-prop providers (see §7) | shared data into a subtree |

## 6. Pages (examples only)

238 module views in `src/modules/*/views/`. **Not** individual library entries — a few
become representative Storybook stories to show real composition. Suggested exemplars:
`alert/views/stream.vue`, `inventory/views/main.vue`, `settings/monitoring/*`,
`audit/views/*-list.vue`, a `dashboard` view. (575 module `components/` are likewise
examples, not library members.)

## 7. Non-visual / infrastructure (documented, not in visual catalog)

These are logic/plumbing — important to document under "how components are managed", but
they have no visual story.

- **Data-providers (44, `data-provider/`)** — render-prop context providers paralleling
  the 46 pickers (`monitor-provider`, `group-provider`, `policy-provider`, …). Document
  as the **provider pattern**; consider collapsing like the pickers.
- **Infra (`std`)** — `socket-context`, `socket-listener`, `local-db-collection`,
  `severity-db`, `status-db`, `network-state-checker`, `screen-blocker`,
  `shortcut-handler`, `user-preference`, `transitioned-router`, `graph-background`,
  `scrollable-export`, `sample-script-list`.
- **Error handling (`error-handler/`)** — `_base-error-handler`, `_base-error-shower`.

## Tally (library scope)

- Atoms ~30 · Molecules ~55 (incl. 46 pickers → 1) · Organisms ~35 · Templates ~10 ·
  Patterns ~9 · Pages = examples · Providers/infra = documented.
- **≈ 140 core catalog entries** after collapsing the pickers + providers.

## Open questions (decide before authoring specs)

1. **Scope** — confirm: library = `core` entries + representative `example` pages/
   patterns; the 238 pages + 575 module components are examples, not entries. (Recommended.)
2. **Tier-boundary rule** — adopt a crisp rule to settle boundary cases? Proposed:
   *atom* = no composition; *molecule* = one control, composes atoms, no API/state;
   *organism* = composes ≥2 molecules **or** owns state/API.
3. **Do/Don't depth** — start with **per-tier** Do/Don't + per-component for the
   highest-traffic ~25, then fill the rest? Or full per-component from the start.
4. **Storybook source** — stories import the **real** Vue 2 components (recommended;
   true to product) vs. rebuilt components.
</content>
