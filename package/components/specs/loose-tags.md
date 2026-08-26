# LooseTags — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule (form input) |
| **Maturity** | 🟢 Stable (heavily used; a few small inconsistencies) |
| **Source** | `src/components/loose-tags.vue` (composes `MSelect mode="tags"` / `FlotoDropdownPicker` / `SelectedItemPills`) |
| **Storybook** | `Molecules/LooseTags` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/loose-tags.json`](../registry/loose-tags.json) |
| **Family** | Tag family — the **input** member (see [`tag.md`](./tag.md); classification per [D12](../../decisions/DECISIONS.md)) |
| **Figma** | TODO |

## Usage (product analytics)

- **`<LooseTags>` used 94× across 80 files** — one of the most-used form inputs.
- Dominant config is the **default editable mode with a `:counter`** (counter passed ~69×,
  it scopes which existing tags are suggested).
- `asDropdown` ~10× · `tagType` ~24× · `userTagOnly` ~4× · `singleSelection` ~2×.

## Overview

A free-form **tag input**: the user types a value and presses Enter to add a removable
teal pill; previously-used tags are offered as suggestions (fetched from the API). It is the
home of the teal `key:value` pills — the default mode renders
`<MSelect mode="tags" class="loose-tags-input">`, and the `.loose-tags-input` context is what
paints the selected pills teal. v-model is an **array of strings**.

It renders one of **three modes**:

1. **Default (editable)** — `MSelect mode="tags"`; type-to-create + suggestions. *(Shown in
   Storybook.)*
2. **`disabled` (read-only)** — `SelectedItemPills` teal pills, truncated with `+N`; no input,
   no API call. *(Shown in Storybook.)*
3. **`asDropdown`** — a searchable, multi-select `FlotoDropdownPicker` rendered `as-input`.
   *(Covered by the DropdownPicker spec.)*

## `obs-tags` (DS element) — two types & when to use

The DS element is a multi-value pill input with a **`type`** prop. `value` is an array of strings (comma
string or JSON); it emits `change` with the selected values. Both types have removable pills + a dropdown.

| `type` | Use when | Pills | Product |
| --- | --- | --- | --- |
| **loose** (default) | the user **free-creates** values — type + Enter to add. Optionally offer autocomplete via `suggestions`. | teal (JetBrains Mono, orange ✕) | LooseTags / `MSelect mode="tags"` (94×) |
| **select** | the user **picks only from a fixed list** — pass `options` (`value:Label,…`); a chevron dropdown with a ✓ on chosen. | neutral navy chips | `MSelect mode="multiple"` |

**Element props:** `type` · `value` · `options` (select) · `suggestions` (loose) · `placeholder` ·
`disabled` (read-only pills) · `loading` (select — chevron → spinner). **Event:** `change` (`string[]`).

**Decision:** free-typed labels (tags, keywords) → **loose**; a constrained multi-select from known options →
**select** (or, for a rich record picker with columns, `obs-grid-select`).

## Anatomy

```text
┌───────────────────────────────────────────────┐
│  ⌜web-server ×⌟ ⌜database ×⌟ ⌜prod ×⌟  | type… │  ← teal pills (orange ×) + free-text input
└───────────────────────────────────────────────┘
       ▼ suggestions (existing tags, from API)
```

## Options / API

- **`value`** (Array, v-model) — the tags. `model: { event: 'change' }`, so bind with
  `v-model` or `:value` + `@change`.
- **`disabled`** (Boolean) — read-only pills (mode 2).
- **`asDropdown`** (Boolean) — searchable picker (mode 3).
- **`singleSelection`** (Boolean) — caps selection to 1 (**only effective in `asDropdown`**
  via `max-allowed-selection`).
- **`counter`** (Object `{ key }`) — scopes suggestions; a `watch` refetches when it changes.
- **`tagType`** (String) / **`userTagOnly`** (Boolean) — further filter the suggestion fetch.
- **`placeholder`** (String, default `' '`) — **only used in `asDropdown`** (see F1).
- **`sm`** (Boolean, default true) — **currently dead** (see F3).

Emits **`change`** (the normalized array). Slots: `clearIcon` (set to `times-circle`).

## Behaviors

- **Default mode** normalizes on change: `lowercase` → `trim` → **de-duplicate** → drop empties.
- **`asDropdown` mode** only `trim`s + drops empties (**preserves case** — see F2).
- **Suggestions** are fetched once on `created()` (when not `disabled`) and refetched when
  `counter` changes.

## Content & writing

Short, lowercase tag tokens (default mode lowercases anyway). Placeholder in the editable
mode is the fixed string **"Add Tags"** (the `placeholder` prop is ignored there — F1).

## Design tokens used

`--main-tags-bg-color` / `--main-tags-text-color` (teal pills, themed: `#cdf1ed`/`#218b81`
light → `#183a42`/`#2ec4b6` dark) · `--secondary-orange` (the pill remove ×). Pill font is
**`JetBrains Mono`** (set on `.loose-tags-input`).

## Accessibility

- Built on Ant Select (`mode="tags"`) — combobox semantics; Enter adds, Backspace removes
  the last pill, Arrow keys navigate suggestions.
- ⚠️ **No visible keyboard focus indicator** ([SF-001](../../findings/SF-001-focus-visible.md)).
- The pill remove × is Ant's control (orange); verify it exposes an accessible name.
- The native clear is hidden (`.ant-select-selection__clear { display: none }`), so removal
  is per-pill only in the editable mode.

## Findings & Inconsistencies

### F1 — `placeholder` prop ignored in the editable mode · Medium · Open

The default `MSelect` branch hardcodes `placeholder="Add Tags"`; the `placeholder` prop is
only wired to the `asDropdown` branch. Consumers setting `:placeholder` on a normal LooseTags
see no effect. **Solution:** bind `:placeholder="placeholder"` on the `MSelect` too (default
it to "Add Tags").

### F2 — Case handling differs by mode · Low · Open

Default mode **lowercases** every tag; `asDropdown` mode **preserves case**. The same
component yields differently-cased data depending on a boolean prop. **Solution:** pick one
normalization (or expose a `lowercase`/`normalize` prop) and apply it in both branches.

### F3 — `sm` prop + `size` computed are dead · Low · Open

`sm` (default true) drives a `size` computed returning `'small'`, but `size` is **never bound**
to the `MSelect`/picker — so the input is always default size. **Solution:** bind `:size="size"`
or remove the dead prop/computed.

### F4 — Suggestion fetch has no error handling · Low · Open

`getAllTagsApi(...).then(...)` has **no `.catch`** — a failed/offline request becomes an
unhandled rejection (visible as a 404 `pageerror` in Storybook). **Solution:** add `.catch`
to fall back to `tagOptions = []` (and optionally a non-blocking notice).

## Do / Don't

### Do

- Use LooseTags for capturing a **list of free-form or known tags** (v-model an array).
- Pass a `:counter` so suggestions are scoped to the relevant entity.
- Use `disabled` for read-only display of an existing tag list.

### Don't

- Don't rely on the `placeholder` prop in the editable mode (F1) or on `sm` for sizing (F3).
- Don't assume case is preserved — default mode lowercases (F2).
- Don't use `asDropdown` expecting this spec to cover it — that path is the DropdownPicker.

## Related

`MTag` / `MStatusTag` (the display members), `SelectedItemPills` (its read-only render),
`FlotoDropdownPicker` (its `asDropdown` render), `MSelect`. See the Tag family table in
[`tag.md`](./tag.md).

## Changelog

- **2026-06-07** — Added. Full deep-dive: 3 render modes mapped; teal pills + JetBrains Mono
  verified in light + dark; findings F1–F4; classified as the Tag family's input member (D12);
  Storybook Examples + Usage/Accessibility/Changelog pages.
