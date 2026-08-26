# Tabs (`MTab` / `MTabPane`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule |
| **Maturity** | 🟢 Stable |
| **Source** | `ui/components/Tabs/Tab.vue` (`MTab` — wraps Ant `a-tabs`) + `ui/components/Tabs/TabPane.vue` (`MTabPane`). Persisted state: `src/components/_base-persisted-tab.vue` (`MPersistedTab` — renderless). |
| **Storybook** | Molecules/Tabs |
| **Registry** | [`registry/tabs.json`](../registry/tabs.json) |
| **Family** | [Navigation / Tabs](../family-map.md) |

## Usage analytics

- **86×** across **70** files. Top areas: `settings` (20), shared `components` (17), `rum` (7),
  `alert` (5), `log` (4), `apm` (3).
- **Always line / top / default.** No real `<MTab>` passes `type=`, `position=`, or `size=` — so
  despite Ant supporting **card / editable-card** types, **vertical** position, **size** variants,
  and a **`tabBarExtraContent`** slot, the product uses **none** of them.
- **Variant classes (the real API):** **`no-border`** (21×, dominant) · **`sticky-tab`** (8×) ·
  `topology-hierarchy-tab` (3×, icon-only) · `metric-picker-tabs` (1×) · `grey-tab` (defined, ~0) ·
  `flex-tabs` (content flex helper).
- **Label patterns:** **count appended to the label string** (`Alerts (${count})`,
  `${tab.title} (${getCounts(tab)})`) — *not* a separate badge; **leading icon** via the pane's
  `tab` slot; **dynamic** `v-for` over a tabs config array.

## Overview

In-page **tabbed navigation** that switches between **sibling views of one context** (Overview /
Performance / Logs of a monitor; Attributes / Metric / Style of a widget editor). `MTab` wraps Ant
`a-tabs` and applies its `variant` prop **as a CSS class**; panes are `MTabPane`. For page-to-page
navigation use the router/menu, not tabs.

## Anatomy

- **Tab bar** — the strip of tab triggers; bottom border `--border-color` (removed by `no-border`).
- **Tab trigger** — active = `--primary` text + a `--primary` underline/ink bar; inactive =
  `--tabs-text-color`; disabled = `--neutral-light`.
- **Tab pane** (`MTabPane`) — the content for the active key; label via the `tab` prop or `tab` slot.

## Options (props)

### `MTab`

| Prop | Default | Notes |
| --- | --- | --- |
| `value` | — | active key; `v-model` via `@change` (41× bind change) |
| `variant` | `''` | applied as a **class** on `a-tabs` — e.g. `no-border` |
| `defaultActive` | — | `defaultActiveKey` when uncontrolled |
| `animated` | `false` | slide animation between panes |
| `size` | `default` | **unused** in product |
| `position` | `top` | `tabPosition`; **unused** beyond `top` (no vertical tabs) |
| `type` | `line` | **unused** beyond `line` (no card/editable-card) |
| `tabBarGutter` / `tabBarStyle` | — | spacing / inline style of the bar |

### `MTabPane`

| Prop | Default | Notes |
| --- | --- | --- |
| `tab` | — | the label **string** (use the `tab` **slot** for icon/count markup) |
| `key` | — | the pane key — matches `MTab` `value` |
| `forceRender` | `false` | render content even when the pane is inactive |

### `MPersistedTab` (renderless)

| Prop | Default | Notes |
| --- | --- | --- |
| `moduleKey` | **required** | localStorage key → `${moduleKey}-tab` |
| `useLocalStorageTab` | `true` | persist the active tab |
| `defaultValue` / `value` | — | initial tab when nothing is stored |

Exposes a **scoped slot** `{ tab, setTab }` — wire to `<MTab :value="tab" @change="setTab">`.

## Behaviors

- **Controlled** via `value` + `@change` (the dominant pattern) or **uncontrolled** via
  `defaultActive`.
- **`no-border`** drops the bar's bottom rule (tabs on a card). **`sticky-tab`** pins the bar to the
  top of a scroll container (`position:sticky; top:0; background:var(--page-background-color)`).
- **`MPersistedTab`** remembers the active tab across reloads/navigation in localStorage; its sibling
  **`MPersistedColumns`** does the same for grid columns.

## Content & writing

- Short noun labels (Overview, Performance, Logs). Append a count as `Label (N)` when it helps the
  user gauge volume. Don't sentence-case or punctuate labels.

## Accessibility

- **Provided by Ant `a-tabs`:** `role="tablist"` / `role="tab"` / `role="tabpanel"`,
  **`aria-selected`** on the active tab, and **Left/Right arrow-key** navigation between tabs.
- **Verify:** keyboard **focus visibility** on the tab triggers (catalog-wide **SF-001**
  `:focus-visible` ring); and that **icon-only** tabs carry a meaningful accessible name.

## Design tokens used

`--primary` (active text + underline + ink bar) · `--tabs-text-color` (inactive) · `--border-color`
(bar) · `--page-background-color` (sticky bg) · `--neutral-light` (disabled / prev-next) ·
`--neutral-lightest` (`grey-tab` bar).

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low (a11y) | Open | Catalog-wide focus-ring removal (**SF-001**) may suppress the tab trigger's `:focus-visible` outline — verify keyboard focus is visible. |
| N1 | Info | — | Ant offers card/editable-card/vertical/size/`tabBarExtraContent`; the product uses none. Treat any of these as a **new pattern** requiring a deliberate decision, not a default. |

## Recommended solutions

- **F1:** adopt the shared `:focus-visible` ring (SF-001) so tab triggers show a visible focus state.
- **N1:** keep the line/top/default constraint unless a product need justifies a new tab style; if
  introduced, add it to this spec + a story so it's a documented variant, not an ad-hoc divergence.

## Do / Don't

- **Do** use tabs for sibling views of one context; use `no-border` on cards; `sticky-tab` on long
  panes; append `(N)` counts; build data-driven sets with `v-for`; use `MPersistedTab` for
  remembered tabs.
- **Don't** use tabs for page navigation; don't introduce card/vertical/closable tabs without a
  decision; don't build a separate count badge; don't depend on `tabBarExtraContent` to match the
  product.

## Related components

`FlotoDropdownPicker` (select) · `MGrid` / Table (tabbed detail panes often sit above a grid) ·
`MRadioGroup` `as-button` (a *segmented* control — a different "pick one" pattern, not view tabs).

## Changelog

- **2026-06-15** — Added (decision-grade). Deep-dive of `MTab`/`MTabPane` (86× / 70 files) + the
  renderless `MPersistedTab`. Established the **line/top/default-only** fidelity rule (no real usage
  passes type/position/size) and the class-based variant API (`no-border` 21×, `sticky-tab` 8×).
  Stories built with the **real** `MTab`/`MTabPane`: Basic · No border · Sticky · With counts ·
  Dynamic · With icons · Persisted. Verified the active indicator renders **`--primary` navy**
  (`rgb(17,28,44)`, text + underline + ink bar), interactivity (click switches panes), and no console
  errors; caught + fixed a blank `map` icon (not in the 543-set → `sitemap`). Finding F1 (focus ring
  → SF-001).

## The DS element — `<obs-tabs>`

The framework-agnostic Web Component (`design-system/components-lib`, `@mtdt/observeops-ds-elements`) that
renders the product tabs. Data-driven + slot-based, so no per-pane component is needed.

- **`tabs`** — the tab set: a JSON array of `{key,label,count?,icon?,disabled?}` **or** a simple comma list
  `"Overview,Performance,Logs"`.
- **`value`** — the active tab key (reflected to `el.value`; fires `change` on click).
- **`variant`** — `line` (default) · `no-border` · `sticky` · `grey` (the product's class-based variants, as one attr).
- **`persist-key`** — remember the active tab in `localStorage` (`<persist-key>-tab`); restored on mount
  (the `MPersistedTab` behaviour, built in — no wrapper needed).
- **Content** — one **named slot per key**: `<obs-tabs …><div slot="overview">…</div></obs-tabs>`; only the active shows.
- **No reflow on select** — the active weight-500 label width is reserved (invisible ghost) so switching tabs
  never shifts the row.

```html
<obs-tabs tabs='[{"key":"alerts","label":"Alerts","count":12},{"key":"logs","label":"Logs"}]'
          value="alerts" persist-key="monitor-detail">
  <div slot="alerts">…</div>
  <div slot="logs">…</div>
</obs-tabs>
```

Route away: between-page navigation → `obs-sidebar` / `obs-breadcrumbs`, not tabs.
