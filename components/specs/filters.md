# Filters — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule |
| **Maturity** | 🟢 Stable |
| **Source** | `filters/filters-container.vue` (`FiltersContainer`) + `FilterGroup` + `FilterCondition` + `FilterTrigger` · `filter-bar/_base-filter-bar.vue` (`FlotoFilterBar`) · `filter-bar/filter-quick-menu.vue` · the filter-row pattern. |
| **Storybook** | Molecules/Filters |
| **Registry** | [`registry/filters.json`](../registry/filters.json) |
| **Family** | [Filters](../family-map.md) |

## Why this is a family

The product's filtering UIs were scattered across screens (Grid Toolbar, Monitoring config). They're
really **four filter archetypes** — catalogued here by *what they are*, regardless of where they sit.
The **Toolbars** (organisms) *compose* these molecules.

## The five archetypes

| Archetype | Source | Usage | What it is |
| --- | --- | --- | --- |
| **Expression builder** | `FiltersContainer` | **32×** | a nested **AND/OR** query builder |
| **Filter bar** | `FlotoFilterBar` | ~50× | an inline **chip** bar + Match All/Any |
| **Quick filters** | `filter-quick-menu` | — | a **preset** one-click menu |
| **Filter row** | pattern | — | a few **multi-selects** + Reset/Apply |
| **Vertical filter** | `vertical-filter/filters.vue` · NCM | APM/RUM/NCM | the **faceted left-panel** (checkbox + count groups) |

### Vertical filter (the faceted left-panel sidebar)

- The left-hand **faceted filter** panel — a **search** atop **collapsible groups** (`MCollapse`), each
  row a **checkbox + optional status/type icon + label + count** (right-aligned); checking rows filters
  the grid. The shared component is **`components/filters/vertical-filter/filters.vue`** (used by **APM
  Explorer**, **APM Error Tracker**, **RUM Sessions**); **NCM**'s `explorer-grid-virtical-filter.vue` is
  a richer variant adding **status icons** (backup) and **device-type icons** (switch/router).
- It **looks like a Navigation side menu but it filters, it doesn't navigate** — so it lives here, not in
  Navigation (cross-referenced from **Navigation → Side menu**). Surfaced by the 2026-06-16 left-panel
  sweep.

### Expression builder (the 32× one)

- **Presentation:** it is an **`MPopover`** (placement `bottomLeft`, `has-arrow`) opened from a
  **`FilterTrigger`** input (a filter-icon box that renders the applied query, or a "Search"
  placeholder) — **not** an inline panel. The popover has a **close ×**, **Pre Filters / Post Filters**
  tabs (`MTab`), the builder, and a **Reset / Clear / Apply** footer. **Apply** emits the query (the
  trigger then shows it) and closes; **Clear** empties; **Reset** reverts to the applied state.
- **"Group(s) matching All/Any"** wraps one or more **groups** (Pre allows up to 3 groups, Post 1).
- Each group: **"Include/Exclude → Group matching All/Any → Criteria"** + a list of **conditions**.
- Each condition: **counter · operator · value** (type-aware — `FilterCondition` picks the operator set
  and value control from the field type; **Between** → From/To). **Add Condition** (max 3) /
  **Add New Group** extend it; **×** removes.

### Filter bar (~50×) — *moved here from Grid Toolbar*

- An inline **chip** bar: `default-chips` (no ×) + completed chips (`Type = … (+N) ×`) + a stub.
- **+ Filter** adds · **×** removes · **Match All/Any** toggle + **Clear All** (once a filter applies).
- Chips scroll horizontally; the segment picker floats `position:fixed` so the row never clips it.

### Quick filters — *moved here from Grid Toolbar*

- A **thumbs-up** button → a panel of **preset** filters (`{ key, label, condition }`); picking one
  applies that condition.

### Filter row — *re-homed from the retired Monitoring Config (Collection Filters)*

- A small set of multi-selects (**Groups · Severity · Tags**) + **Reset / Apply** + close **×**.

## Which filter? (decision)

1. **Complex AND/OR across groups?** → **Expression builder**.
2. **Compact chip bar over a grid?** → **Filter bar**.
3. **One-click presets?** → **Quick filters**.
4. **A few simple facets?** → **Filter row**.
5. **Plain text search?** → the **Input** `search` type (181×), **not** a filter.

## Accessibility

- Inherits from the composed controls (`FlotoDropdownPicker`, chips, `MButton`). **Verify**
  focus-visible ring (**SF-001**) on the chips/selects, and an `aria-label` on icon-only triggers
  (thumbs-up, ×).

## Design tokens used

`--code-tag-background-color` (chips) · `--border-color` · `--page-background-color` ·
`--page-text-color` · `--neutral-light` · `--neutral-button-text` · `--primary` · `--dropdown-background`.

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low | Noted | Store-bound; `FilterCondition` is 500+ lines — catalogued as reproductions (the Filter bar reproduction is fully interactive). |
| N1 | Info | — | **Taxonomy:** this family was created (2026-06-16) to gather filters by archetype, moving Filter bar + Quick filters out of "Grid Toolbar" and re-homing "Collection Filters" from the retired "Monitoring Config." |

## Do / Don't

- **Do** use the Expression builder for real query logic; the Filter bar for a compact chip filter;
  Quick filters for presets; a Filter row for a few facets.
- **Don't** hand-roll a condition builder; don't put plain search here (→ Input); don't duplicate a
  filter across screens — compose the one molecule in a Toolbar.

## Related components

`FlotoDropdownPicker` (the selects inside) · **Input** (`search` type) · `Tag` (the chips) · **Table**
(filters sit above grids) · **Toolbars** (compose these).

## Changelog

- **2026-06-16** — Expression builder — corrected the **presentation** to match the product: it now
  lives inside an **`MPopover`** opened from a **`FilterTrigger`** input (it was an inline panel before),
  with **Pre / Post Filters** tabs, a close ×, and a **Reset / Clear / Apply** footer. Made it **fully
  functional** — open/close, switch tabs, add/remove conditions (max 3) and groups (3 pre / 1 post),
  Include/Exclude + All/Any selects, **Between** → From/To, and **Apply** renders the query back into the
  trigger. Verified interaction (add/edit/apply/clear) + light + dark.
- **2026-06-16** — Added — the **Filters** family, by component archetype. Catalogued the **missing**
  **Expression builder** (`FiltersContainer`, **32×** — a nested AND/OR query builder), **moved** the
  **Filter bar** (~50×) and **Quick filters** out of the context-shaped "Grid Toolbar," and **re-homed**
  the **Filter row** from the retired "Monitoring config." Stories: Expression builder · Filter bar
  (interactive) · Quick filters · Filter row. Reproductions (store-bound); verified render + the moved
  Filter bar still interactive, no console errors.
