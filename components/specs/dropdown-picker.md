# DropdownPicker (`FlotoDropdownPicker`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Organism |
| **Maturity** | 🟡 Stable-but-flawed (the product's core select — heavily used; significant a11y gaps) |
| **Source** | `src/components/_base-dropdown-picker.vue` (global `FlotoDropdownPicker`); triggers in `src/components/dropdown-trigger/` |
| **Storybook** | `Organisms/DropdownPicker` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/dropdown-picker.json`](../registry/dropdown-picker.json) |
| **Family** | Tag family's host — renders `SelectedItemPills` (the teal `+N` pills) in read-only/multi modes |
| **Figma** | TODO |

## Usage (product analytics)

- **`<FlotoDropdownPicker>` used 510× across 241 files** — one of the most-used components
  in the product (the de-facto select).
- **`allow-clear` 218×** · **`:searchable="false"` 119×** · **`multiple` ~66×** ·
  `text-only` 15× · `use-popover` 26× · `:as-input="false"` 7×.

## Overview

The product's **custom select**: a popover-anchored, **virtualized** option menu with a
built-in search box, single or multi-select, keyboard navigation, and an optional inline
"add new option" affordance. It does **not** use a native `<select>` or Ant `a-select` — it
is composed from a popover (`MPopper` by default, `MPopover` when `use-popover`), an `MInput`
trigger, an `MMenu` + `RecycleScroller` list, and `MCheckbox` rows.

**Options** are objects: `{ key, text }` (label is resolved as `text || name || label`;
value/identity as `key || id || value`). **v-model** is the selected `key` (single) or an
**array of keys** (`multiple`); `model: { event: 'change' }`.

## Anatomy

```text
Trigger (asInput):  ┌─────────────────────────────┐
                    │ Web Server               ⌄ │   ← MInput (readonly) + chevron / clear ×
                    └─────────────────────────────┘
Open overlay:       ┌─────────────────────────────┐
                    │ 🔍 Search…              [+] │   ← search box (+ optional add button)
                    │ ──────────────────────────  │
                    │ ☑ Web Server                │   ← virtualized rows (RecycleScroller)
                    │ ☐ Database                  │     (checkboxes when multiple)
                    │ …                           │
                    │ ──────────────────────────  │
                    │                  [× Clear]  │   ← multi-select footer
                    └─────────────────────────────┘
```

## Options / API (selected — full list in the registry)

**Selection & data:** `value` (v-model) · `options` (via `$attrs`) · `externalOptions` ·
`disabledOptions` · `multiple` · `allowSelectAll` · `maxValues` (real cap) ·
`maxAllowedSelection` (**dead — F2**).

**Trigger & display:** **[element] `trigger`** = input | text | button | icon | chip (+ `triggerLabel` /
`triggerIcon`) — the one enum; `asInput`/`textOnly` are the legacy booleans it subsumes. `placeholder`
(default "Select") · `allowClear` · `wrap` (default **true**).

**[element] Option content (rich options):** `severity` (→ obs-severity dot) · `icon` (→ obs-icon) ·
`avatar` + `sublabel`/`email` (people row) · `children[]` (→ tree-select) · `description` (two-pane).

**Menu behavior:** `searchable` (default **true**) · `itemSize` (32) · `itemsToShow` (10) ·
`hideAllDropdownOptions` · `useAfterMenuDescription` (two-pane) · `showHelp` ·
`canUserAddOptions` + `addLabel` (inline add) · `defaultOpen` · `avoidKeyboardNavigation`.

**Popover:** `usePopover` (MPopover vs MPopper) · `placement` · `overlayClassName`
(default "picker-overlay") · `overlayStyle` · `minWidth` · `fixedPosition`.

**Emits:** `change` (model) · `show` · `hide` · `search` · `add` · `active-item-index-change`.

**Slots:** default (custom menu) · `menu-item` · `before-menu-text` · `after-menu-text` ·
`after-menu` · `helpbox` · `hovered-menu-description` · `trigger` (full trigger override).

## `obs-select` (DS element) — two axes + variants & when to use

The DS element `<obs-select>` is functional: pass `options` (comma string, JSON, or a JS array) and it
selects, searches, and reflects `el.value`. Rather than one component per Storybook tile, its surface is
**two orthogonal axes + route-aways** — pick independently from each:

**Axis A · Option content** — what each row shows (one rich `option` schema, composing DS primitives):

| Content | Give the option | Use when |
| --- | --- | --- |
| text | `{value,label}` | the default |
| **severity dot** | `severity:"critical"` (or `color:"--severity-critical"`) → `obs-severity` | the value has a status/severity (up/down/critical…) |
| **icon** | `icon:"server"` (a real `_icons.js` name) → `obs-icon` | options are a typed set (monitor types, object kinds) |
| **avatar / people** | `avatar:<url|true>` + `email`/`sublabel` | a user/assignee picker (name + email row) |
| description | `description:"…"` + `use-after-menu-description` | options need an explanation pane (two-pane) |

**Axis B · Trigger** — how it opens (the `trigger` enum, orthogonal to content & single/multiple):

| `trigger` | Use when | Product analog |
| --- | --- | --- |
| **input** (default) | a form field — bordered box + selection + chevron | most form selects |
| **text** | inline / compact header — plain text + caret, no box | "showing X" pickers (15×) |
| **button** | the opener reads as an ACTION with a label (`trigger-label`) | "Columns", "Group by", "Add filter" |
| **icon** | a compact toolbar/row — an icon button (+ a multi-select count badge) | toolbar **filter** / kebab / column buttons |
| **chip** | a compact token opener in a filter bar | filter chips |

*(Read-only pills — the input trigger's `multiple + disabled` appearance, "First (+N)" with a +N popover — is a display of the input trigger, not a separate trigger.)*

**Structure & selection variants** (combine with both axes):

| Variant | Turn on with | Use when |
| --- | --- | --- |
| single / multiple | `multiple` | one vs many (multi adds checkboxes + Select-All + Clear + "First (+N)") |
| searchable | `searchable` (auto by count; `="false"` to force off) | long lists need filtering; short ones don't (119×) |
| allow-clear | `allow-clear` | a value can be unset (× on hover, 218×) |
| disabled options | `disabled-options="a,b"` | some values are locked (greyed + ban) |
| inline-add | `can-user-add-options` + `add-label` | the user may add a missing option (emits `add`) |
| **tree-select** | options with nested `children[]` | HIERARCHICAL options (DC > Rack > Server) — expand/collapse, branch = subtree select |

**Route-aways — NOT this component:**

- A multi-**COLUMN** rich-row list / "virtualized rich-row list" / grid-dropdown → **`obs-grid-select`**
  (its menu is a searchable **table**, composing `obs-table`). A *columnless* rich list is Axis-A option content here.
- Free-form typed tags → `LooseTags`; 2–3 exclusive options → radio; on/off → switch.

**Events:** `change` (value | value[]) · `search` (query) · `add` (new option) · `show` / `hide`.

## Behaviors

- **Search** filters on `text`/`name`/`label` via a **web worker** (`arrayWorker.search`),
  debounced through a watcher; emits `search`.
- **Virtualization:** the list renders through `RecycleScroller` (`itemSize` px rows) — long
  option sets stay performant.
- **Keyboard (when open):** ↑/↓ move the active row, **Enter** selects, **Escape** closes
  (a `window` keydown listener bound on open). `avoidKeyboardNavigation` disables this.
- **Multi-select:** checkboxes per row, optional **Select All** header, **Clear** footer; the
  trigger shows `First item (+N)`. Read-only/`disabled` multi renders teal `SelectedItemPills`.
- **Inline add:** with `canUserAddOptions`, a `+` reveals an input; confirming emits `add`.
- **No data:** shows a themed illustration (light/dark SVG).

## Design tokens used

`--dropdown-hover-background` / `--left-menu-text-color-hover` (active/hover row) · the menu
inherits dropdown surface tokens (dark menu bg verified `#1d2a3e`) · trigger uses input
tokens. Pills (multi read-only) use the teal `--main-tags-*` (see [`tag.md`](./tag.md)).

## Accessibility

- **Keyboard (open):** ↑/↓/Enter/Escape work once the menu is open.
- ⚠️ See findings **F1** — this is the product's biggest a11y gap (no combobox semantics,
  not keyboard-openable, no focus ring).

## Findings & Inconsistencies

### F1 — Not an accessible combobox · High · Open *(a11y)* → promoted to [SF-003](../../findings/SF-003-combobox-a11y.md)

It re-implements a select with `div`/`span` + a **readonly `MInput`** trigger and an `MMenu`,
but exposes **no combobox semantics**: no `role="combobox"`/`listbox"`/`option`, no
`aria-expanded`, no `aria-activedescendant`, no labelled relationship. The trigger opens
**only on click** (no Enter/Space handler), so **keyboard users may be unable to open it**;
and there's no visible focus ring ([SF-001](../../findings/SF-001-focus-visible.md)). For a
control used **510×**, this is the highest-impact a11y issue in the system — **promoted to the
system register as [SF-003](../../findings/SF-003-combobox-a11y.md)** (full evidence + the
combobox-ARIA + keyboard-open + focus solution there).

### F2 — `maxAllowedSelection` prop is dead · Medium · Open

`maxAllowedSelection` is declared but **never referenced** in the logic; the actual cap is
`maxValues` (sliced in `handleChange`). Consumers pass `:max-allowed-selection` (e.g.
`LooseTags` `asDropdown` uses it for `singleSelection`) expecting a limit that **never
applies**. **Solution:** implement `maxAllowedSelection` (or alias it to `maxValues`) and
document the canonical prop.

### F3 — Three boolean props default to `true` · Low · Open

`searchable`, `asInput`, and `wrap` all default to **true** (each `eslint-disable`'d against
the project's `vue/no-boolean-default`). Consumers must remember to pass `:searchable="false"`
etc. **Solution:** keep but document loudly; revisit if a future API cleanup is done.

### F4 — Loose option schema · Low · Open

Labels resolve as `text || name || label` and identity as `key || id || value` in different
spots — three accepted shapes for the same concept. **Solution:** document a canonical
`{ key, text }` contract and normalize inputs.

## Storybook fidelity caveats

Two behaviors depend on the product runtime and **don't fully work in Storybook** (not
product bugs): **search filtering** needs the `arrayWorker` web worker (absent in SB, so the
list doesn't filter), and the **no-data illustration** needs an SVG-as-component loader
(absent in SB). Stories therefore use non-empty option sets; the search box renders but won't
filter. The preview registers `v-tooltip` (→ `MPopper`), `RecycleScroller`, and the picker
itself to render its real default mode.

## Do / Don't

### Do

- Use it as the standard select; pass `options` as `{ key, text }`, v-model the `key`(s).
- Use `multiple` + `allow-select-all` for multi-select; `:searchable="false"` for short lists.
- **[element]** pick from the two axes independently — option content (`severity`/`icon`/`avatar`) for row
  identity, and the `trigger` enum (input/text/button/icon/chip) for how it opens; use nested `children[]`
  for hierarchical (tree) options.
- **[element]** `icon` must be a real name from the DS icon library (`_icons.js`) — an unknown name renders blank.

### Don't

- Don't rely on `maxAllowedSelection` to cap selection (F2 — use `maxValues`).
- Don't assume keyboard/AT users can operate it today (F1).
- Don't forget `searchable`/`asInput`/`wrap` default to **true** (F3).
- **[element]** Don't build a component per Storybook tile — icon/severity/avatar are option content, triggers
  are one axis; a multi-COLUMN rich-row list is `obs-grid-select`, not this.

## Related

`SingleTrigger` / `MultipleTrigger` / `SelectedItemPills` (its triggers) · `LooseTags`
(uses it via `asDropdown`) · `MSelect` · `MPopover` / `MPopper` · `MMenu` · `MCheckbox`.

## Changelog

- **2026-07-14** — **Group B shipped on `obs-select`**, modelled as two orthogonal axes + route-aways
  rather than one component per Storybook tile:
  - **Option content** — rich options render `icon` → `obs-icon`, `severity` (or a `--severity-<level>`
    `color`) → an `obs-severity` dot, and `avatar` + `sublabel`/`email` → a people row. (This also
    replaced the old reuse violations: the option icon was `v-html` raw HTML and the dot a hand-drawn
    span.) So **icon-dot** and **avatar / people picker** are option content, not separate components.
  - **Trigger** — a `trigger` enum (`input | text | button | icon | chip`); `button` + `icon` are new
    (icon shows a multi-select count badge). Orthogonal to the menu content.
  - **Tree-select** — options with nested `children[]` render a real N-level hierarchy (flattened list,
    per-level indent, expand/collapse chevron; a branch checkbox = subtree select with indeterminate).
  - **Route-aways** — a multi-**column** rich-row / "virtualized rich-row list" is **`obs-grid-select`**
    (composes `obs-table`), not this; a columnless rich list is option content here.
  Plain and one-level-group selects verified byte-identical (regression).
- **2026-06-07** — Added. Full deep-dive of `_base-dropdown-picker.vue` + the
  `dropdown-trigger/` family (510×/241 files). Verified live (trigger, open menu, virtualized
  list, multi-select + Select All + Clear, dark theme) by registering `v-tooltip`/`MPopper`/
  `RecycleScroller` in the preview. Findings F1 (a11y, High) – F4; Storybook caveats noted.
