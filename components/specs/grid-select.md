# Grid Select / Table Dropdown (`obs-grid-select`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Organism |
| **Maturity** | 🟢 Stable |
| **Source** | `FlotoDropdownGridSelector` + `MonitorPicker` / `AgentPicker` (~70×) — the product's "Select Agent / Select Monitor" picker. |
| **Element** | `obs-grid-select` |
| **Registry** | [`registry/grid-select.json`](../registry/grid-select.json) |
| **Family** | [Form Controls](../family-map.md) |
| **Composes** | `obs-table` (the dropdown grid) · `obs-icon` (search / chevron) · `obs-link` (Clear Selected) |

## Overview

A **dropdown whose menu is a searchable TABLE**, not an option list. Use it when the user picks a rich
**record** that needs several columns to tell apart — name, IP, type, status — often multi-select. The trigger
is an input-style button showing the selection (or placeholder); opening it drops a **top-layer popover** with a
search box, a selected-count badge + **View Selected / Clear Selected**, and the grid.

**The grid IS the DS `obs-table`** (composed). grid-select owns only the trigger + search + selected-actions and
drives obs-table's selection via `:selected` + `@change`/`@rowclick`. So sorting, checkboxes (with select-all /
indeterminate), the DS severity dot (`obs-severity`), status tags (`obs-tag`), sort icons (`obs-icon`), and every
obs-table cell `type` come for free — nothing is re-implemented.

## Anatomy

- **Trigger** — an input-style button: the selection label (`name (+N)` when multiple) or the placeholder, + a
  chevron (`obs-icon`).
- **Popover menu** (top layer, Popover API — escapes transform-animated ancestors like a drawer):
  - **Search box** (`searchable`, default on) — filters rows across all columns.
  - **Selected actions** (multiple, when something is selected) — a count badge · **View Selected / View All** ·
    **Clear Selected** (`obs-link`).
  - **The grid** — an `obs-table` (`selectable` when multiple; `sortable`; `hide-selection-info`).

## Options (props)

| Prop | Default | Notes |
| --- | --- | --- |
| `columns` | — | `[{key,title,width?,align?,sortable?,type?}]` — passed to the inner obs-table, so every obs-table cell `type` works (severity/dot/status/type/tags/sparkline/heat/bar). |
| `rows` | — | `[{id, …}]` — each row keyed by `row-key`. |
| `value` | — | selected id (single) or JSON id array (multiple); reflects to `el.value` on every edit. |
| `multiple` | `false` | checkbox multi-select + Select-All + selected badge + View/Clear Selected. |
| `searchable` | `true` | show the search box. |
| `placeholder` | `Select` | trigger text when nothing is selected. |
| `row-key` | `id` | the row's identity field. |
| `block` | `false` | full-width trigger (vs the default fixed width). |
| `disabled` | `false` | non-interactive trigger. |

**Events:** `change` (`detail[0]` = id single / id[] multiple) · `search` (query) · `show` / `hide` (menu open/close).

## Variants & when to use

| Variant | Turn it on with | Use when |
| --- | --- | --- |
| **single** | (default) | pick ONE record — clicking a row selects it and closes; `el.value` = the row id |
| **multiple** | `multiple` | bulk-pick records — checkboxes + Select-All + a selected badge + View/Clear Selected; `el.value` = a JSON id array |
| **searchable / not** | `searchable` (default on) / `searchable="false"` | large lists need the search box; a short list can drop it |
| **block** | `block` | the trigger should fill its container (form field width) |
| **disabled** | `disabled` | the picker is not available in the current state/permission |
| **rich cells** | column `type` | identify records by a severity dot, status tag, product type icons, etc. (any obs-table cell type) |

## Decision flow

1. Picking a rich **record** identified by multiple columns (name · IP · type · status), often multi-select? → **Grid Select**.
2. Picking a simple `{label}` value from a list? → the **Dropdown picker / Select**, not this.
3. A menu of **actions** (Edit / Delete)? → a **Menu**, not this.

## Behaviors

- **Selection** flows through the inner obs-table: multiple → checkbox / select-all `@change`; a row-body click
  → `@rowclick` (single: pick + close; multiple: toggle). grid-select owns the `selected` state and reflects `el.value`.
- **Search + View Selected** filter the rows grid-select hands to obs-table; **sorting** is obs-table's.
- **Top layer** — the menu uses the Popover API so it renders correctly inside animated/overflow-clipped ancestors.

## Accessibility

- The trigger is a `<button>` with the selection/placeholder. The open menu is a table — give sortable headers
  `aria-sort`, selectable rows `aria-selected`, the header checkbox = select-all, arrow-key row navigation, and
  announce the result / selected count. (Inherited from obs-table where applicable.)

## Design tokens used

`--border-color` · `--grid-header-hover-bg` · `--neutral-lightest` · `--primary` · `--primary-alt` ·
`--neutral-regular` · `--page-background-color` (+ the severity/status tokens via the composed obs-table).

## Do / Don't

- **Do** use for agent / monitor / device / interface / user / profile selection — records that need columns to
  tell apart; give a column a `type` for the severity dot / status tag / type icons; use `multiple` for bulk
  selection (checkboxes + Select-All + the selected badge + View/Clear Selected).
- **Don't** use for a short fixed `{label}` option list (use the plain Dropdown/Select); don't use for a menu of
  commands/actions (use a Menu).

## Related components

`obs-table` (the composed grid) · `obs-dropdown` / Select (simple `{label}` lists) · `obs-menu` (action menus) ·
`obs-checkbox` / `obs-tag` / `obs-severity` (the composed cell primitives).

## Changelog

- **2026-07-13** — Full docs treatment: this prose spec, the variants-and-when-to-use table, the rounded-out
  gallery, and the columns note (every obs-table cell type works).
- **2026-07-13** — Refactored to **compose `obs-table`** — deleted the hand-rolled table (glyph sort arrows /
  hand-rolled checkbox + status pill) and now drive obs-table's selection. Glyph arrows → obs-icon long-arrows,
  checkbox → obs-checkbox, status → obs-tag, severity → obs-severity.
- **2026-07-11** — Shipped `obs-grid-select` (the grid/table dropdown, ~70×): trigger reflects the selection;
  searchable table with sortable columns, checkbox multi-select + Select-All + selected badge + View/Clear
  Selected; value reflected to `el.value` + change event; top-layer popover menu.
