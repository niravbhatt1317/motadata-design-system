# Table / Grid (`MGrid`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Organism |
| **Maturity** | 🟢 Stable |
| **Source** | `src/components/crud/_base-grid.vue` (**MGrid**) — wraps the **Kendo Vue Grid** (`@progress/kendo-vue-grid`) + `gridWorker` / `arrayWorker`. Fetch+paginate wrapper: **`FlotoPaginatedCrud`**. |
| **Storybook** | Organisms/Table |
| **Registry** | [`registry/table.json`](../registry/table.json) |
| **Family** | [Data Table](../family-map.md) |

## Usage analytics

- **MGrid 75×** across 69 files · **FlotoPaginatedCrud 76×** (the usual driver). Top modules:
  settings, apm, ncm, slo, alert — i.e. **every list / inventory / drill-down view**.
- States in the wild (from the sweep): **expandable** 8× · **selectable** 7× · `hide-selection-info`
  5× · `disable-pre-selected-item` 4× · grouping (`default-group`). Classes: `hide-expand-column`
  (6×), `hide-header`, `hide-grouping`, `tabular-content-grid`, `service-grid`, `rum-grid`.

## Overview

The product's **primary data table**. `MGrid` wraps the Kendo grid and offloads sort/filter/group/
page to web workers; **`FlotoPaginatedCrud`** wraps `MGrid` to own fetch + paging + search + filters
for list pages. Features: resizable / reorderable / sortable columns, **client + server paging**,
**grouping**, **selection** (→ bulk-action bar), **expandable detail rows**, and **per-column cell
slots**. For a few static key/values, use a list/cards instead.

## Anatomy

- **Header** — column titles on `--grid-header-bg`; sortable, resizable, reorderable. Optional
  select-all checkbox.
- **Rows** — `--border-color` bottom divider; **hover** highlight; **selected** = `--neutral-lightest`
  plus a `--primary` left accent; optional **detail row** (expand); optional **group header** rows.
- **Footer** — pager (range + page controls) when `paging`.
- **Selection tag** — "N items selected" (`MTag`) above the grid unless `hide-selection-info`.

## Options (key props)

| Prop | Default | Notes |
| --- | --- | --- |
| `columns` | — | column defs (field/title/width/cell/sortable) |
| `data` | — | rows (client mode) |
| `selectable` | `false` | checkbox column + selection |
| `expandable` | `false` | chevron + `detailRow` slot |
| `paging` / `default-page-size` | `false` / `50` | client paging |
| `external-take` / `external-skip` / `total-count` | — | **server paging** |
| `default-sort` / `default-group` | — | initial sort / grouping |
| `filters` / `search-term` / `use-search-term-loading` | — | filtering / search (+ spinner) |
| `max-allowed-selection` / `pre-selected-items` / `selection-disabled-items` / `disable-pre-selected-item` | — | selection control |
| `hide-selection-info` | `false` | hide the "N selected" tag |
| `row-height` | — | virtualization (non-paging) |

**`obs-table` element props** (in addition to `columns` / `rows`):

| Prop | Default | Notes |
| --- | --- | --- |
| `sortable` | `true` | sort columns with `sortable:true` |
| `selectable` / `expandable` | `false` | checkbox column / chevron + detail row |
| `group-by` | — | group rows under band headers by a column key |
| `group-collapsible` | `true` | `"false"` → pivot/report grid (no chevron, all rows visible) |
| `editable` | `false` | inline editing — pencil per row; `editable:true` columns become inputs |
| `variant` | `default` | `bordered` / `borderless-rows` |
| `header-style` | `default` | `tinted` |
| `hide-header` | `false` | hide the header row |
| `page-size` | `0` | `>0` → paginate |
| `loading` | `false` | content loader |
| `row-actions` | — | `[{key,label,icon,danger?}]` → a ⋯ menu per row |

## Behaviors

- **Workers:** sort/filter/group/page run in `gridWorker`/`arrayWorker`; the grid shows a
  `FlotoContentLoader` while `processingData`.
- **Server vs client:** `external-*` + `total-count` + `@data-state-change` = server-side; otherwise
  the grid pages/sorts in memory.
- **Columns:** resizable + reorderable; `@column-change` persists layout. Some columns are
  sort-disabled (`SORT_DISABLED_COLUMNS`).

## `obs-table` (DS element) — variants & when to use

The framework-agnostic `<obs-table>` reproduces the product grid chrome and is **functional**: pass
`columns` + `rows` (JSON or arrays) and it sorts, selects, paginates, groups, edits, and emits events.
It composes the DS primitives — `obs-checkbox` (selection), `obs-tag` (status cells), `obs-menu` (row
actions), `obs-icon` (glyphs), `obs-input` (inline edit), `obs-link` (Save/Cancel). Pick a variant:

| Variant | Turn it on with | Use when | Not this — use instead |
| --- | --- | --- | --- |
| **basic** | `columns` + `rows` (+ `sortable`, default on) | a plain sortable dataset | a single record's fields → `obs-key-value`; big KPI values → `obs-metric-list` |
| **selectable** | `selectable` | bulk operations on rows (header select-all → indeterminate on partial) | single drill-down → `rowclick` |
| **expandable** | `expandable` + each row's `detail` HTML | each row has drill-down detail below it | real parent/child hierarchy → `tree` |
| **sortable** | `sortable` (default `true`) + column `sortable:true` | click a header to sort (arrow + `--primary`) | — |
| **cell-types** | column `type` (`severity`/`dot`/`status`/`type`/`tags`/`sparkline`/`heat`/`bar`) | columns need rich, non-text rendering | plain text → leave as default |
| **grouping** | `group-by="<key>"` | rows bucketed under collapsible band headers with counts | static report → `group-collapsible="false"` |
| **pivot / report** | `group-by="<key>"` + `group-collapsible="false"` | a static report grid — no chevron, no count, **every child row always visible** | user should collapse bands → plain `grouping` |
| **tree** | `tree` + rows carry a `children` array | genuine hierarchy (parent/child levels), chevron + indent per level | flat grouped buckets → `grouping` |
| **editable (inline)** | `editable` + column `editable:true` | quick in-place edits to a few fields; pencil per row → inputs → Save/Cancel; emits `save {id,values}` | a full record with validation → a drawer/modal form |
| **style: bordered** | `variant="bordered"` | a dense data grid (internal column+row grid, **no outer frame**) | — |
| **style: borderless-rows** | `variant="borderless-rows"` | a light widget list (no row dividers, airy) | — |
| **header: tinted** | `header-style="tinted"` | the item-list tinted header bar | default transparent `.k-grid` header |
| **hide-header** | `hide-header` | compact widget grids with no header | — |
| **pagination** | `page-size="<n>"` (`>0`) | the dataset spans pages (Kendo pager) | live socket feeds → streaming grid |
| **empty / loading** | `rows='[]'` + `empty-text` / `loading` | no records / fetching | — |

**Events:** `change` (selection), `sort`, `rowaction`, `pagechange`, `rowclick`, and for inline edit
`edit` (row entered edit), `save` (`{id, values}`), `canceledit`.

**Note (custom-element booleans):** `group-collapsible` is a boolean *attribute*, so the pivot mode is
the literal string — `group-collapsible="false"`. Omitting it leaves grouping collapsible (the default).

## Content & writing

- Column titles short and consistent; empty → **"No records found"**.

## Accessibility

- Verify Kendo grid + **custom cell slots** keep table roles (`row`/`columnheader`/`gridcell`),
  **`aria-sort`** on sortable headers, **`aria-selected`** on selected rows, an accessible
  select-all, and **focus rings** on cell controls (SF-001). Announce empty/loading via a live
  region. See the Accessibility page (**F2**).

## Props / API

See the table above and [`registry/table.json`](../registry/table.json).

## Design tokens used

`--grid-header-bg` · `--border-color` · `--neutral-lightest` (selected) · `--neutral-lighter`
(group header) · `--primary` (selected accent) · `--neutral-dark` (header text) ·
`--page-background-color`.

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low | Open | Heavy: Kendo grid + 2 web workers — not trivially renderable outside the app (Storybook shows **reproductions**, not the live grid). |
| F2 | Medium (a11y) | Open | Verify table roles / `aria-sort` / `aria-selected` / focus survive the Kendo grid + custom cell slots. |

## Recommended solutions

- **F1:** keep the catalog as faithful reproductions; if a live grid is wanted later, sandbox the
  Kendo grid with mocked workers in a dedicated story.
- **F2:** audit the rendered grid for ARIA (sort/selected/roles) and adopt the SF-001 focus ring on
  cell controls.

## Do / Don't

- **Do** use `FlotoPaginatedCrud` for fetched lists; server-page large data; row actions in a kebab;
  multi-select via the bulk bar; keep the header in empty/loading. **[element]** give rows a stable
  `id`, drive rich cells via each column's `type`, and persist inline edits from the `save` event.
- **Don't** use a grid for a few static key/values (→ `obs-key-value`) or big-value metrics
  (→ `obs-metric-list`); don't client-load huge datasets; don't hand-roll selection/sorting/paging;
  don't inline-edit a whole validated record (use a drawer/modal form); don't add an outer
  surrounding border (the product grid is borderless — `bordered` draws only the internal cell grid).

## Related components

`FlotoPaginatedCrud` · `FlotoGridActions` (row kebab) · bulk-action bar · `MStatusTag` / `MTag`
(cells) · `MCheckbox` (selection) · `FlotoDropdownPicker` (filters).

## Changelog

- **2026-07-13** — Documented the full `obs-table` element surface: added a "variants & when to use"
  table (basic · selectable · expandable · sortable · cell-types · grouping · **pivot/report** ·
  tree · **inline editing** · style variants · pagination · empty/loading), the element props table,
  the events list, and the custom-element boolean note for `group-collapsible="false"`. The Details-
  tab playground now toggles every variant on one dataset (grouping/pivot/editable included).
- **2026-06-12** — Added (decision-grade Usage). `/component-sweep` on `MGrid` (75×) +
  `FlotoPaginatedCrud` (76×): Kendo grid + workers; states selectable/expandable/grouping/paging;
  per-column cell slots. 8 reference-reproduction stories (Basic · Selectable · Expandable · Cell
  types · Grouping · Empty · Loading · Pagination) on the real `table.less` chrome; verified render
  plus the selected-row accent. Findings F1 (heavy/reproductions), F2 (a11y).
