# Toolbars — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Organism |
| **Maturity** | 🟢 Stable |
| **Source** | `_base-page-header.vue` (`FlotoPageHeader`) · `widgets/views/components/widget-title.vue` (`WidgetTitle`) · `_base-bulk-action-bar.vue` (`BulkActionBar`) · grid toolbar composition · `column-selector.vue`. |
| **Storybook** | Organisms/Toolbars |
| **Registry** | [`registry/toolbars.json`](../registry/toolbars.json) |
| **Family** | [Toolbars](../family-map.md) |

## Why this is one family

A **toolbar** is an organism that *arranges* molecules/atoms (title · search · filters · actions).
The product has **several** distinct toolbars — catalogued here as **variants** of one family. They
**compose** the **Filters** molecules; they don't own them.

## The variants

| Variant | Source | Usage | What it is |
| --- | --- | --- | --- |
| **App header** | `layout/header.vue` | global | the app-shell **top bar** (logo · search · notifications · user) |
| **Page header** | `FlotoPageHeader` | **54×** | back + title + right-side actions |
| **Widget header** | `widget-title` | **58×** | title + time-range pill + kebab of widget actions |
| **Bulk action bar** | `_base-bulk-action-bar` | — | a floating N-selected toolbar |
| **Grid toolbar** | composition | — | search + filter + columns + Add over a grid |
| **Column chooser** | `column-selector` | 174× | the eye-button column show/hide dropdown |

### Page header (54×)

- **Left:** optional `back-button` + **title** (`--primary-alt`, font-500, with an optional count).
- **Right:** the default slot — actions (search, export, primary **Add**).
- **Props:** `title` · `back-link` · `main-header` · `use-divider`. **Slots:** `back-button` ·
  `before/after-title` · `title` · `title-append` · default · `additional-rows`.

### Widget header (58×)

- **Title** (ellipsis, font-500) + a **disabled `TimeRangePicker` pill** (the widget's window) + a
  **kebab** (`ellipsis-v` → `FlotoGridActions`): **Edit · Clone · Full Screen · Share · Export as CSV**.
- Slot: `flip-toggle`; emits `exit-fullscreen`.

### Bulk action bar

- A floating `role="toolbar"` shown when `selectedCount >= minSelection`: a **clear checkbox** +
  **"N items selected"**, inline **primary** actions + **danger** actions (`--secondary-red`), and a
  **"More"** (`ellipsis-v`) overflow. Emits `clear` / `selected`.

### Grid toolbar / Column chooser

- **Grid toolbar** — search + **filter** (opens the Filters molecules) + **columns** + **Add**.
- **Column chooser** (174×) — an eye-button dropdown of column checkboxes + Reset. *Product is
  show/hide only*; reordering is by **dragging grid headers** (Table → Basic). The grip drag here is a
  **DS enhancement**.

## Checked & scoped out (sweep recheck)

A census of every header / toolbar / action-bar / `role="toolbar"` confirmed the 6 archetypes above.
The rest are **variants, compositions, or other families** (not missed):

- **`FlotoGridActions`** (**88×**) — the **row action kebab** (Edit/Clone/Delete ⋮). The *action-menu*
  archetype, catalogued under **Popover** — and it's the kebab **composed into** the Widget header and
  the Bulk action bar's "More."
- **Detail headers** (RUM drill-down ×7, `guide-header`) — **Page-header variants** for detail views.
- **`bulk-provision-toolbar`** — a domain **variant of the Bulk action bar**.
- **Action footer** (`result-footer`, modal/drawer footers) — covered by **Modal / Drawer**.
- **`overlay-controls`** (metric-explorer) — a feature-specific control strip, not reusable.
- **`rule-group-header` / `permission-section-header`** — in-content **section labels**, not toolbars.
- **`FlotoNavBar` / left menu / breadcrumb / tabs** — **navigation** archetypes (a future *Navigation*
  family), not toolbars.

## Accessibility

- The **Bulk action bar** uses `role="toolbar"` + `aria-label`. **Verify** focus-visible ring
  (**SF-001**) and `aria-label`s on icon-only buttons (export, kebab, More, ×).

## Design tokens used

`--primary` · `--primary-alt` (title) · `--border-color` · `--page-background-color` ·
`--page-text-color` · `--neutral-light` · `--secondary-red` (danger) · `--common-widget-bg` ·
`--timerange-background-color`.

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low | Noted | Reproductions (the live Page/Widget headers use the router / widget store). |
| F2 | Low (a11y) | Open | Verify focus-visible ring + icon-button `aria-label`s (SF-001). |
| N1 | Info | — | **Taxonomy (2026-06-16):** consolidated the product's toolbars into one family; the former "Grid Toolbar" entry was folded in (Grid toolbar + Column chooser variants), and its filter molecules moved to **Filters**. |

## Do / Don't

- **Do** use the Page header for list/detail pages; compose toolbars from **Filters** + search +
  actions; use the Bulk action bar for multi-select; put destructive bulk actions in `--secondary-red`.
- **Don't** duplicate a filter inside a toolbar (compose the molecule); don't make a per-screen toolbar
  component; don't rely on the column chooser to reorder columns (that's grid-header drag).

## Related components

**Filters** (composed into toolbars) · **Table** (grid toolbar sits above it) · `FlotoDropdownPicker` ·
`MPopover` (kebab menus) · **Date & Time Pickers** (the widget time-range pill).

## Changelog

- **2026-06-16** — Added — the **Toolbars** family (organisms, by variant): **Page header** (54×),
  **Widget header** (58×), **Bulk action bar**, **Grid toolbar**, **Column chooser**. Surfaced the two
  **missing** big toolbars (Page header, Widget header) during the taxonomy reorg, and **folded in** the
  former "Grid Toolbar" entry (its filter molecules moved to **Filters**). Reproductions; verified
  render + the Widget-header kebab opens, no console errors. Findings F1 (reproduction), F2 (a11y).
