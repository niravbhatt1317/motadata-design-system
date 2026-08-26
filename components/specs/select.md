# Select (`MSelect`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Atom (form control) |
| **Maturity** | ⚠️ **Low-use** (2×) — the product's standard select is `FlotoDropdownPicker` |
| **Source** | `@motadata/ui` → `ui/components/Select/Select.vue` (wraps Ant `a-select`) |
| **Storybook** | `Atoms/Select` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/select.json`](../registry/select.json) |
| **Family** | select cluster — `FlotoDropdownPicker` (the real select) · `LooseTags` · `MTreeSelect` · this |
| **Figma** | N/A (low-use; build `DropdownPicker` instead) |

## Usage (product analytics)

- **`<MSelect>` used 2×** — both `mode="tags"` (in `LooseTags` and `object-tag-picker`).
- **`FlotoDropdownPicker` used 510×** — the de-facto select. **Use that**, not MSelect.
- `MTreeSelect` 0× · `MSelectOption`/`OptGroup` 0× direct.

## Overview

The kit's raw **Ant `a-select`** wrapper. Full-featured (modes, search, clear, sizes,
loading), but the product standardized on `FlotoDropdownPicker` instead — so MSelect survives
only as the low-level primitive behind a couple of tag inputs. Documented for completeness;
**reach for `FlotoDropdownPicker`** for an actual select. v-model is `value` + `change`.

## Options / API

- **`mode`** — `default` (single) · `multiple` (chips) · `tags` (free-type to create) · combobox.
- **`options`** — `{ value, text }` (label resolves `text||label||title||name`); or slot options.
- **`showSearch`** (default false) · **`allowClear`** (default **true**) · **`size`**
  (small/default/large) · **`loading`** (chevron → spinner) · `disabled` · `maxTagCount` ·
  `labelInValue` · `filterOption` (default case-insensitive on label) · `tokenSeparators`.
- **Slots:** default/`option` · `suffixIcon` · `clearIcon` · `removeIcon` ·
  `menuItemSelectedIcon` · `notFoundContent` (→ `MNoData`) · `dropdownRender`.
- **Emits:** `change` (model) · `search` · `select` · `deselect` · `blur` · `focus` · more.

## Behaviors

- **Single/multiple/tags** like Ant. **Multiple/tags** render removable chips in the field.
- **Search** (`show-search`) filters options on the label; empty → `MNoData`.
- **Loading** swaps the chevron for a spinner.

## Accessibility

- Built on Ant `a-select` → it **IS a real combobox** (`role`, `aria-expanded`,
  `aria-activedescendant`, listbox/options, keyboard open + type-ahead). **Notably, this
  low-use component is *more* accessible than the 510×-used `FlotoDropdownPicker`** (which has
  no combobox semantics — [SF-003](../../findings/SF-003-combobox-a11y.md)). A good reference
  for what fixing SF-003 should achieve.
- ⚠️ No visible focus ring system-wide ([SF-001](../../findings/SF-001-focus-visible.md)).

## Findings & Inconsistencies

### F1 — Superseded by `FlotoDropdownPicker` · Medium · Documented

The product chose the custom `FlotoDropdownPicker` (510×) over MSelect (2×) — likely for the
virtualized menu, custom triggers, and inline-add. So MSelect is effectively legacy/low-level.
**Solution:** use `FlotoDropdownPicker` for selects (and `LooseTags` for tag inputs); keep
MSelect only as the Ant primitive. Don't expand its usage.

### F2 — The accessible select is the unused one · Medium · Open *(a11y, ironic)*

MSelect (Ant) has proper combobox a11y; the widely-used `FlotoDropdownPicker` does not
([SF-003](../../findings/SF-003-combobox-a11y.md)). **Solution:** when fixing SF-003, mirror
Ant `a-select`'s ARIA — or, longer term, consider consolidating onto an accessible base.

### F3 — No visible focus ring · High · Open *(a11y)* → [SF-001](../../findings/SF-001-focus-visible.md)

System-wide.

### F4 — Clear "×" is invisible (icon prefix mismatch) · Low · Open

`Select.vue` hardcodes the clear icon as **`<MIcon name="times-circle" type="fas">`** (Font
Awesome **solid**), but the product registers **only `fal` (light)** icons (639 `fal`, 0 `fas`
in `icons.js`). So `fas times-circle` isn't in the library and the clear control renders
**empty** (`<i class="ant-select-clear-icon"><!----></i>`, no svg) — the **clear × is blank**.
The chip **remove** × works (it uses `name="times"`, default `fal`). (`type="fas"` is used 3×:
`Select.vue`, `TreeSelect.vue`, `navbar.vue` — all latently broken.) **Solution:** drop
`type="fas"` (use the default `fal`), or register the `fas` solid set.

### F5 — Clear "×" overlaps the dropdown chevron · Low · Open

When `allow-clear` shows the clear control, it sits **on top of** the custom `suffixIcon`
chevron (both absolutely positioned at the same right edge). Ant's clear masks the *default*
arrow with a white box, but MSelect's **custom chevron `MIcon` is wider** than that box, so the
chevron's left edge **pokes out beside the ×** (measured: chevron `left 123`, clear box
`left 129` — single; same in multiple). Result: the close icon appears *over/beside* the
dropdown icon. **Solution:** hide `.ant-select-arrow` while the clear is shown, or size the
clear mask to the custom chevron. **Net (F4+F5): MSelect's clear-all affordance is broken** —
low impact (MSelect is 2×, both `mode="tags"`, never with `allow-clear`). The catalog stories
therefore omit `allow-clear` and show removal via the working chip ×; for a clearable select
use **`FlotoDropdownPicker`**.

## Do / Don't

### Do

- For a real select, use **`FlotoDropdownPicker`** (single/multi/search/virtualized/custom trigger).
- For a free-form tag input, use **`LooseTags`**.
- Use MSelect only as the low-level Ant primitive when something specifically needs raw `a-select`.

### Don't

- Don't introduce new `MSelect` usages as "the select" — that's `FlotoDropdownPicker`.
- Don't reach for `mode="tags"` here — use `LooseTags`.

## Related

`FlotoDropdownPicker` (the product select) · `LooseTags` (tag input) · `MTreeSelect` (tree) ·
`MSelectOption`/`MSelectOptGroup` · `FlotoFormItem` (wrap it for label + validation).

## Changelog

- **2026-06-07** — Added (badged **low-use**, decision-grade Usage). Deep-dive of `Select.vue`:
  Ant `a-select` wrapper — modes (default/multiple/tags), `show-search`, `allow-clear` (default
  true), sizes, loading, rich slots (`notFoundContent` → `MNoData`); v-model `value`/`change`.
  Verified single/multiple/tags render. Findings F1 (superseded by DropdownPicker, 2× vs 510×),
  **F2** (ironically the *accessible* combobox vs SF-003), F3 (focus → SF-001).
