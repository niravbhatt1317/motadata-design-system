# Component Family Map

The **single place** where every component *family* is enumerated **once**, so we never
re-discover or re-audit it. When we scope any component (PROCESS Phase 0), we fill in its
whole family here — base + variants + internal parts + own-entry relatives + dead members —
with tier, usage, classification ([D12](../decisions/DECISIONS.md)) and status. Thereafter
each member is **pre-scoped**: picking it up later means reading this row, not re-sweeping.

**Classification:** `base` · `variant` (restyle of the base) · `internal` (only exists inside
a parent) · `own-entry` (its own page, filed by what it is) · `dead` (unused — document, don't
build).
**Status:** ✅ done · ⏳ todo · ⚠️ unused.

**Add order within a family:** batch **variants + internal parts with the base** (same pass).
**Own-entry** members are their own scheduled items, ordered by **usage × tier × priority**
(not forced immediately). Dead members are documented, never built.

> This map is the backlog + the anti-re-audit guarantee. Keep it current: every Phase 0
> updates the relevant family; every component finished flips its status to ✅.
>
> **Structure layer (not a component family):** the **grid**, **app shell**, **layout shells**,
> **screen regions** and **panel behaviours** are documented separately under **Foundations/Layout**
> in Storybook, with machine specs `layout/grid.json` + `layout/layouts.json` (indexed from
> `components/index.json` → `layout`). They describe *where* components sit, not which components exist.

## Tag family ✅ (complete)

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MTag` | atom | 150× | base | ✅ Atoms/Tag |
| `tag-*` colour classes | atom | 100s | variant | ✅ (ColoredTags) |
| `MStatusTag` | atom | 30× | variant — status STRING → tag-* pill | ✅ (Status story) |
| `Severity` (`severity.vue` + stripe/picker/count-box) | atom | **80×** | own-entry — severity LEVEL dot/badge (NOT MStatusTag) | ✅ Atoms/Severity (registry + story) |
| `SelectedItemPills` | atom | — | internal (DropdownPicker) | ✅ (preview story) |
| `SingleTrigger` / `MultipleTrigger` | molecule | — | internal (DropdownPicker) | ✅ (in picker) |
| `LooseTags` | molecule | 94× | own-entry (Forms) | ✅ Molecules/LooseTags |
| `TagsList` | molecule | 0× | dead | ✅ documented (unused) |

## Select / DropdownPicker family ✅ (complete)

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `FlotoDropdownPicker` | organism | 510× | base (the product's select) | ✅ Organisms/DropdownPicker |
| `SingleTrigger` / `MultipleTrigger` / `SelectedItemPills` | — | — | internal | ✅ (documented in picker) |
| `MSelect` (raw Ant select) | atom | 2× | own-entry (low-use primitive) | ✅ Atoms/Select (badged low-use) |
| `MTreeSelect` (tree select) | atom | 0× | unused kit member | documented (note in Select) |
| app `*Selection`/`*Selector` (Monitor/Group/Tag/Column/Severity…) | — | app | app-specific composites on DropdownPicker | n/a |

## Button family ✅ (icon gap closed; thorough audit done)

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MButton` | atom | 1,373× | base | ✅ Atoms/Button |
| variants (primary/navy/…) | atom | — | variant | ✅ |
| icon-only `shape="circle"` | atom | 218× | variant | ✅ (IconButtons story) |
| icon-only `.squared-button` (35×35) | atom | **365×** | variant (class) | ✅ (IconButtons story) |
| contextual `.model-header-button` / `.button-topology-overlay` | atom | 3× / 5× | variant (app context) | documented (note) |
| `FlotoLink` (internal navigation link) | atom | 67× | own-entry | ✅ Atoms/Link |
| external link (`<a target=_blank>`) | atom | 147× | variation (not FlotoLink — internal-only) | ✅ documented (Link + SF-004) |
| `k-link` / `resource-link` / `link-label` (link-style classes) | atom | 25× / 8× / 5× | variant (class) | ✅ documented (Link spec) |
| segmented control (`MRadioGroup as-button`) | atom | 255× | own-entry → **Radio family** | ⏳ todo (with Radio) |
| `FlotoBackButton` | atom | 2× | pattern (trivial) | ⏳ low priority |
| editor buttons (`LinkButton`, `TableButton`, `EmbedButton`, `ImageButton`) · `MenuToggleButton` · `ProvisionButton` | — | app | app-specific (not DS) | n/a |

## Checkbox family ✅ (context re-check done)

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MCheckbox` (Floto override) | atom | 76× | base | ✅ Atoms/Checkbox |
| `MCheckboxGroup` (kit) | atom | **0×** | dead/unused | ✅ documented (unused) |
| `.checkbox-info` (info-blue checked) | atom | **0×** | unused variant (kit override) | ✅ documented (note, F6) |
| `CheckBoxTable` | — | app | app-specific | n/a |

*Context re-check (2026-06-07): no hidden/context checkbox variants — table/label rules are layout only.*

## Switch family ✅ (context re-check done)

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MSwitch` | atom | 136× | base | ✅ Atoms/Switch |
| `SeveritySwitch` / `SloStatusSwitch` / `monitoring-switch` | — | app | app-specific (domain toggles) | n/a |
| `switch-port-view` / `stacked-switch` | — | app | unrelated (network-switch hardware views) | n/a |

*Context re-check (2026-06-07): no consumer `*-switch` classes and no context variants — track
stays `--switch-bg`, only the knob colors green (product-accurate, F2). Surface complete.*

## Input family ✅ (complete — Input + FlotoFormItem done)

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MInput` | atom | 293× | base (type-router) | ✅ Atoms/Input |
| types: password / number / search / textarea | atom | — | variant (via `type`) | ✅ (Types story) |
| **autocomplete** (search + typed-suggestion list) | atom | — | variant (search + `auto-complete-list.vue` / omnibox) | ✅ (Autocomplete story) |
| adornments: prefix/suffix, addonBefore/After | atom | — | variant (slots) | ✅ (Adornments story) |
| `.material-input` (bottom-border) | atom | 62× | variant (class) | ✅ (Material story) |
| `full-border-text-area` / `full-bordered-addon-input` / `no-border-input` / `auto-height-input` / `text-lg-input` | atom | 17/6/3/2/2× | variant (class) | ✅ documented (note) |
| `MInputNumber` / `MInputSearch` / `MInputGroup` | atom | — | kit siblings (reached via `type`) | ✅ documented |
| **`FlotoFormItem`** (field wrapper: label + validation) | molecule | **1783×** | own-entry | ✅ Molecules/FormItem |
| `PasswordInput` / `OTPInput` / `ScheduleInput` / `TimeRangeInput` / `GranularityInput` … | — | app | app-specific composite inputs | n/a |

## Color Picker family ✅ (complete)

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| **Color Picker** (`color-picker.vue`) | molecule | — | own-entry (Form Controls) — swatch trigger + 16-preset palette + canvas; supports transparent | ✅ Molecules/Color Picker |

## Overlay family ✅ (complete)

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MModal` | organism | 39× | base (dialog) | ✅ Organisms/Modal |
| `FlotoConfirmModal` | organism | 71× | variant (confirm) | ✅ (in Modal — Confirm story) |
| MModal `hide-footer` | organism | 4× | variant (overlay-class) | ✅ (HideFooter story) |
| MModal `scrollable-modal` (+ `smaller-modal`) | organism | ~8× | variant (overlay-class) | ✅ (Scrollable story) |
| MModal `no-padding-modal` / `no-padding-confrim-modal` | organism | 13× | variant (overlay-class) | ✅ (No-padding story) |
| MModal `restrict-width` (1020px wide) | organism | ~5× | variant (overlay-class) | ✅ (Large story) |
| MModal app one-offs (`widget-form-modal`, `share-modal`, `compare-metric-modal`, `diff-view-modal`, `error-modal`) | organism | 1× each | app-specific overlay-class | documented (niche, not showcased) |
| `FlotoDrawer` (slide-in panel) | organism | 99× | base (drawer) | ✅ Organisms/Drawer |
| `FlotoDrawerForm` | organism | 59× | variant of Drawer (drawer + form) | ✅ (in Drawer) |
| large / full-screen drawer (width 85–96%, multi-pane) | organism | ~30× | variant (width) | ✅ (Large story) |
| `MDrawer` (kit primitive) | organism | 0× direct | internal — wrapped by FlotoDrawer | n/a (not used directly) |
| app `*Modal` / `*Drawer` (Anomaly/Incident/Approval…) | — | 42 files | app-specific composites on the 4 bases | n/a |

**Audit (2026-06-11):** verified complete at the component level — `FlotoFormModal` does **not** exist;
no programmatic `Modal.confirm`/`$confirm` service (confirms are the declarative `FlotoConfirmModal`);
no lightbox/viewer/fullscreen/stepper dialog mechanisms; all 42 custom `*-modal/-drawer` files build
on the 4 bases above.

## Popover / Tooltip family ✅ (complete)

Distinct from modals (transient, anchored overlays — not center-interrupting dialogs).
`readable-content-overlay` belongs here, **not** to Modal.

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MTooltip` (`_base-tooltip.vue`, VTippy override) | molecule | 94× | base (hover label) | ✅ Molecules/Tooltip |
| `MPopover` (kit, `a-popover`) | molecule | 35× | base (click panel) | ✅ Molecules/Popover |
| `MPopper` (`_base-popper.vue`, `v-popover`) | molecule | 2× direct | positioning primitive (powers FlotoDropdownPicker) | ✅ (documented in Popover) |
| action / kebab menu (`_base-grid-actions`) | molecule | — | MPopover pattern | ✅ (Action menu story) |
| rich panel (color/date picker) | molecule | — | MPopover pattern | ✅ (Rich panel story) |
| `chart-like-tooltip` | molecule | 2× | MTooltip overlay-class variant | ✅ (Tooltip variant story) |
| `readable-content-overlay` (max-width readable popover) | — | ~25× | overlay-class on MPopover/MTooltip | documented (note) |
| **native `title=""`** | — | ~59× | browser tooltip (truncation hints) | documented (note) |
| **chart tooltip** (Highcharts `TooltipBuilder`, `hc-tooltip-bg`) | molecule | every widget chart | data-viz — bar/line/donut + bubble/map/radar/sankey/timeline/gauge/treemap (share surface) | ✅ Molecules/Data-Viz Tooltips |
| **sparkline tooltip** (`sparkline-tooltip`) | molecule | sparkline widgets | data-viz | ✅ (in Data-Viz Tooltips) |
| **heatmap tooltip** (`heatmap-tooltip.vue`) | molecule | heatmap widget | data-viz | ✅ (in Data-Viz Tooltips) |
| **live graph node/edge tooltips** (topology 10 · netroute 3 · APM 2) | — | topology/netroute/service-map canvas | data-viz (`--topology-graph-tooltip-bg`) | ✅ (Live graph story; archetype) |
| **flame graph tooltip** (`d3-flame-graph`, `flame-tooltip`) | — | APM trace / RUM (14 files) | data-viz | ✅ (Flame graph story) |

**Full tooltip taxonomy (7 kinds)** documented on **Molecules → Data-Viz Tooltips → Usage** —
`MTooltip` · `chart-like-tooltip` · native `title=` · Highcharts chart (10+ chart types) ·
sparkline · heatmap · live-graph node/edge (topology/netroute/APM) · flame graph. The chart-type
and graph variants share their renderer's surface; visually-distinct archetypes have stories.

## Radio family ✅ (complete)

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MRadioGroup` | atom | 225× | base (the entry point — use `:options`) | ✅ Atoms/Radio |
| `MRadio` (standalone) | atom | 0× | internal building block | ✅ (documented, unused standalone) |
| `MRadioGroup` `as-button` (segmented control) | atom | 255× | variant | ✅ (Segmented story) — also the Button family's segmented relative |
| segmented **with icons** (`without-icon-margin`) | atom | 14× | variant | ✅ (Segmented-with-icons story) |
| **severity switch** (`radio-toggle-shadow` + `alert-severity-buttons`) | atom | 2× | variant (app combo) | ✅ (Severity-switch story) |
| `.radio-info` (info-colored dot) | atom | — | variant | documented (note) |

## Data Table family ✅ (complete)

The product's primary data table. `MGrid` is the grid; `FlotoPaginatedCrud` is the fetch+paginate
driver. States/variants are showcased as reference reproductions (the live grid is Kendo + workers).

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MGrid` (`_base-grid.vue`, Kendo Vue Grid) | organism | 75× | base (the grid) | ✅ Organisms/Table |
| `FlotoPaginatedCrud` | organism | 76× | wrapper (fetch + paging + search + filters) | ✅ (documented in Table Usage) |
| `selectable` (+ bulk-action bar) | organism | 7× | state | ✅ (Selectable story) |
| `expandable` (+ `detailRow`) | organism | 8× | state | ✅ (Expandable story) |
| grouping (`default-group`) | organism | — | state | ✅ (Grouping story) |
| server paging (`external-take`/`skip` + `total-count`) | organism | — | mode | ✅ (Pagination story) |
| per-column cell slots (status/tags/sparkline/actions/…) | organism | — | composition | ✅ (Cell types story) |
| empty / loading | organism | — | state | ✅ (stories) |
| `_base-server-grid.vue` · `virtual-table.vue` | organism | — | internal variants | documented (note) |
| app `*-grid` / `*-table` composites | — | many | app-specific column sets | n/a |
| **Filter bar** (`FlotoFilterBar` / `FlotoLegacyFilterBar`) | molecule | ~50× | filter — condition chips + match | ✅ **Molecules/Filters** (moved out of Grid Toolbar) |
| **Column chooser** (`column-selector.vue`) | organism | 174× (column-change) | toolbar accessory — show/hide columns | ✅ **Organisms/Toolbars** |

## Divider family ✅ (complete)

A thin rule that marks a semantic break. `MDivider` wraps Ant `a-divider`; the line renders
`var(--border-color)`. Product reality: 126 horizontal (default) + 7 vertical; dashed / with-text are
kit-supported but unused (shown as available options).

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MDivider` (horizontal) | atom | 126× | base — full-width rule between stacked sections | ✅ Atoms/Divider |
| `MDivider type="vertical"` | atom | 7× | variant — inline separator between row items | ✅ (Vertical story) |
| `dashed` / with-text (`orientation`) | atom | 0× | variant — kit-supported, unused in product | ✅ (Dashed & with-text story, flagged) |
| `darkVariant` | atom | rare | modifier — dark-background tuning | ✅ (documented) |

## Toolbars family ✅ (complete)

The product's **toolbar compositions**, as variants of one organism family. A toolbar *arranges*
molecules/atoms (title · search · filters · actions) — it **composes** the Filters molecules.

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| **App header** (`layout/header.vue`, `Header`) | organism | global | variant — app-shell top bar (logo · search · notifications · user) | ✅ Organisms/Toolbars (added in recheck) |
| **Page header** (`_base-page-header.vue`, `FlotoPageHeader`) | organism | **54×** | variant — back + title + actions | ✅ Organisms/Toolbars (NEW — was missing) |
| **Widget header** (`widgets/views/components/widget-title.vue`) | organism | **58×** | variant — title + time-range pill + kebab | ✅ (NEW — was missing) |
| **Bulk action bar** (`_base-bulk-action-bar.vue`) | organism | — | variant — floating N-selected toolbar | ✅ |
| **Grid toolbar** (composition) | organism | — | variant — search + filter + columns + Add | ✅ (folded in from Grid Toolbar) |
| **Column chooser** (`column-selector.vue`) | organism | 174× | variant — eye-button column show/hide | ✅ (folded in from Grid Toolbar) |

## Navigation family ✅ (complete)

Wayfinding — distinct from Toolbars (actions) and Tabs (sibling views). Catalogued by archetype.

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| **Primary nav** (`layout/navbar.vue`, `FlotoNavBar`) | molecule | global | base — collapsible left module sidebar (65px ↔ 170px hover-expand), 16 modules + ObserveOps logo + SLO BETA | ✅ Molecules/Navigation (rebuilt for fidelity, light + dark verified) |
| **Side menu** — **left-panel** nav, 4 forms: **section** (`settings/left-menu.vue`, 20×) · **tree** (Log/Topology `infinite-tree.vue`) · **category list** (`dashboard-dropdown.vue`) · **list/saved-views** (`report-sidebar.vue`, `ExplorerSavedViewList`) | molecule | many | archetype — searchable/collapsible left panel (tabs + search + list; counts, tree, inline-edit) | ✅ (Side menu · Tree · Categories · List stories) |
| Metric Explorer picker (`metric-picker.vue` → `counter-list.vue`) | molecule | — | **picker** (⊕-add + drag) — *not nav* | ↗ cross-ref (DropdownPicker) · story in Navigation |
| Faceted left-panel (`vertical-filter/filters.vue`) | molecule | APM/RUM/NCM | **Vertical filter** — *filters, not navigates* — **Filters family** | ↗ cross-ref (Filters) |
| **Steps** (`report-steps.vue` · `product-setup` guide · 2FA — **bespoke, no `MSteps`**) | molecule | 3 flows | archetype — numbered wizard/stepper | ✅ (Steps story) |
| **Breadcrumb** (`compliance-breadcrumb.vue` pattern) | molecule | — | archetype — back + path trail | ✅ (Breadcrumb story) |
| **Back button** (`_base-back-button.vue`, `FlotoBackButton`) | atom | 3× | archetype — chevron-left router link | ✅ (Back button story) |
| **Tabs** (`MTab`) | molecule | 86× | sibling-view nav — **own family** (Molecules/Tabs) | ✅ cross-referenced |
| **User account menu** (`layout/user-dropdown.vue`) | molecule | global | app chrome — avatar → profile/theme/logout | ✅ (User menu story) |
| **Notification dropdown** (`layout/notification-dropdown.vue`) | molecule | global | app chrome — bell → Alerts/System tabs | ✅ (Notification story) |
| **Global search / Omnibox** (`components/omnibox/searchbar.vue`) | molecule | global | command/search palette | ✅ (Omnibox story) |
| **NOC Player** (`dashboard/components/noc-player.vue`) | molecule | — | wallboard rotator (prev/next/play/countdown) | ✅ (NOC Player story) |
| **Timeline scrollbar** (`netroute/components/timeline-scrollbar.vue`) | molecule | — | temporal navigator (time-bucket stepper) | ✅ (Timeline story) |
| **Graph expansion breadcrumb** (`netroute/components/graph-view.vue`) | molecule | — | Breadcrumb variant (graph traversal tags) | ✅ (Graph breadcrumb story) |
| **Pagination** (`FlotoPaginatedCrud` / `k-pager`) | molecule | 79× | page-nav — **Table family** (grid footer) | ↗ cross-ref (Table) |
| **Menu / Context menu** (`MMenu` · `FlotoGridActions`) | molecule | 13× · 1× | primitive + action surface — **own family** (Molecules/Menu) | ↗ cross-ref (Menu) |
| ~~Menu toggle / MSubMenu flyouts~~ | — | 7× / **0×** | toggle folded into Primary nav variant; flyouts **absent** | scoped out |

## Menu family ✅ (complete)

The shared **`MMenu` primitive** (the building block beneath Primary nav, Side menu, the dropdown
picker) **+** its action-surface usage. Promoted from the Navigation recheck's "scoped out" list.

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| **Menu** (`MMenu` / `MMenuItem` / `MMenuDivider`) | molecule | 13× | primitive — vertical list of selectable rows (icon + label), dividers, danger/positive | ✅ Molecules/Menu |
| **Context / Action menu** (`_base-grid-actions.vue`, `FlotoGridActions` · `MDropdown` 1×) | molecule | grid rows · 1× | action surface — "⋯" trigger → `MMenu` of actions (not a value picker) | ✅ (Context menu story) |

## Filters family ✅ (complete)

The product's **filtering components by archetype** (not by screen). Molecules; the Toolbars compose
them. Created in the 2026-06-16 taxonomy correction.

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| **Expression builder** (`filters/filters-container.vue` + `FilterGroup` + `FilterCondition`) | molecule | **32×** | base — nested AND/OR query builder | ✅ Molecules/Filters (NEW — was missing) |
| **Filter bar** (`filter-bar/_base-filter-bar.vue`) | molecule | ~50× | archetype — inline chip bar + Match | ✅ (moved from Grid Toolbar) |
| **Quick filters** (`filter-bar/filter-quick-menu.vue`) | molecule | — | archetype — preset one-click menu | ✅ (moved from Grid Toolbar) |
| **Filter row** (`metric-collection-filters.vue` pattern) | molecule | — | archetype — multi-selects + Reset/Apply | ✅ (re-homed from retired Monitoring Config) |
| **Vertical filter** (`vertical-filter/filters.vue` · NCM `explorer-grid-virtical-filter.vue`) | molecule | APM/RUM/NCM | archetype — faceted left-panel (checkbox + count groups) | ✅ (Vertical filter story; from the left-panel sweep) |
| search box (`MInputSearch`) | atom | 181× | NOT a filter — the Input `search` type | → Input family |

## Navigation / Tabs family ✅ (complete)

In-page tabbed navigation — switch between sibling views of one context. **Product uses line / top /
default tabs only** (Ant's card / editable-card / vertical / size / `tabBarExtraContent` are unused).

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `MTab` (`ui/components/Tabs/Tab.vue`, wraps `a-tabs`) | molecule | 86× / 70 files | base (the tab strip) | ✅ Molecules/Tabs |
| `MTabPane` (`ui/components/Tabs/TabPane.vue`) | molecule | 86× | base (a pane + its label) | ✅ (in Tabs) |
| `variant="no-border"` | molecule | 21× | variant (class) — dominant | ✅ (No border story) |
| `sticky-tab` | molecule | 8× | variant (class) — pinned bar | ✅ (Sticky story) |
| count-in-label (`Alerts (N)`) | molecule | many | pattern | ✅ (With counts story) |
| dynamic (`v-for` panes) | molecule | many | pattern | ✅ (Dynamic story) |
| icon labels (`topology-hierarchy-tab` icon-only) | molecule | 3× | variant (class) | ✅ (With icons story) |
| `MPersistedTab` (`_base-persisted-tab.vue`, renderless localStorage) | molecule | 2× | state wrapper | ✅ (Persisted story) |
| `MPersistedColumns` | — | 30× | sibling (persists grid columns, not tabs) | documented (note) |
| `card` / `editable-card` / vertical / `size` / `tabBarExtraContent` | molecule | 0× | Ant-available, unused in product | documented (note — new pattern needs a decision) |

## Date & Time Pickers family ✅ (complete)

Date/time selection. The **hero is `TimeRangePicker`** (the observability time-window control), not the
kit date picker. `MDatePicker` is the form date-*time* field (always `show-time`); time-of-day is rare.

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `TimeRangePicker` (`widgets/time-range-picker.vue`) | molecule | 42× / 35 files | base (the hero — relative presets + custom range) | ✅ Molecules/Date & Time Pickers (reproduction) |
| `hide-custom-time-range` | molecule | 24× | variant (presets-only) — dominant | ✅ (Presets story toggle) |
| `bordered` / `pill-style` / `hide-selected-time` / `only-label` | molecule | — | trigger display variants | ✅ (Trigger story) |
| `max-selectable-range-days` (93 / 365) | molecule | 2× | range constraint | ✅ (Custom story note) |
| `excluded-options` | molecule | 7× | variant (drop specific presets) | ✅ (noted in Presets/Usage) |
| `TimeRangeSlider` (`time-range-picker/time-range-slider.vue`) | molecule | 2× (dashboard + alert correlation) | variant (timeline scrubber — square handles, navy track) | ✅ Slider story |
| `MDatePicker` (`Datepicker.vue`, wraps `a-date-picker`) | molecule | 10× / 8 files | base (date-time form field; always `show-time`; no size/format/mode) | ✅ (real component) |
| `MTimePicker` (kit) / `TimePicker` (`time-picker.vue`, a FlotoDropdownPicker of times) | molecule | **0× standalone** | time-of-day — entered via `show-time` or the range custom view, never standalone | ✅ (kit shown for ref; custom one is internal) |
| `DateTimePopover` (`common/date-time-popover.vue`) | molecule | 1× | variant (custom-range-only popover) | documented (Usage) |
| `Scheduler / Recurrence` (`schedule-input/`) | — | 17 files | **separate family** (Once/Daily/Weekly/Monthly builder) — out of scope here | documented (note — future entry) |
| `DateRangePicker` (kit) / `NotifyTimePicker` / week/month/quarter/calendar pickers | — | 0 / absent | dead / not a product pattern | documented (note) |

## Scheduler / Recurrence family ✅ (complete)

A recurrence builder (how often + when a job runs). Date/time-*adjacent* but distinct from the pickers
— it produces a **recurrence rule**, not a value. A composition of already-catalogued primitives.

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `ScheduleInput` (`schedule-input/index.vue`) | molecule | 16× | base (the recurrence builder) | ✅ Molecules/Scheduler (reproduction) |
| `Once` / `Daily` sub-form (`once-input.vue`) | molecule | — | type — Start Date + Hours | ✅ (Default story) |
| `Weekly` sub-form (`weekly-input.vue`) | molecule | — | type — Days (Mon–Sun) + Start Date + Hours | ✅ (Default story) |
| `Monthly` sub-form (`monthly-input.vue`) | molecule | — | type — Months + Dates (1–31) + Start Date + Hours | ✅ (Default story) |
| `excluded-schedule-options` | molecule | — | variant (drop types) | ✅ (Excluded types story) |
| `show-only-once` | molecule | — | variant (Once only) | ✅ (Show only once story) |
| built from `MRadioGroup as-button` · `MDatePicker` · custom `TimePicker` · `FlotoDropdownPicker` · `FlotoFormItem` | — | — | composition (all catalogued) | ✅ |

## ~~Monitoring Config family~~ → RETIRED (re-homed by component type)

**Taxonomy correction (2026-06-16):** "Monitoring Config" was a **module-shaped** bucket, not a
component type — against the DS rule that every entry names a component *archetype*, never a
module/screen. Its members were re-homed by what they **are**:

| Was (Monitoring Config) | Is (archetype) | Re-homed to |
| --- | --- | --- |
| `MetricPollTime` | a **Number Input** + min/max validation | **Input** family (a documented *usage*, not a component) |
| `MonitoringHourPicker` | a **multi-select** (`FlotoDropdownPicker`) | **Select / DropdownPicker** family (a documented *usage*) |
| `MetricCollectionFilters` | a **filter row** | **Filters** family (the *Filter row* archetype) |
| `ServerMetric*` / `MonitorMetricCollectionTime` / bulk / provider | feature composites | n/a (feature screens, not DS components) |

## Data Visualization family ✅ (guide, not a component)

| Member | Tier | Usage | Classification | Status |
| --- | --- | --- | --- | --- |
| `Chart` (Highcharts) + `Graph` (Cytoscape) + `Widgets` (vue-grid-layout) | organism | 38× / 6× / 5× | `data-viz` — decision guide, no obs-* by design | ✅ Organisms/Data Visualization |
