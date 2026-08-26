# Radio (`MRadioGroup`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Atom (selection control) |
| **Maturity** | 🟢 Stable (core selection control) |
| **Source** | `@motadata/ui` → `ui/components/Radio/RadioGroup.vue` (+ `Radio.vue`); wraps Ant `a-radio-group` |
| **Storybook** | `Atoms/Radio` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/radio.json`](../registry/radio.json) |
| **Family** | selection controls — sibling of [Checkbox](./checkbox.md) & [Switch](./switch.md); the `as-button` segmented control is the Button family's "segmented" relative |
| **Figma** | TODO |

## Usage (product analytics)

- **`<MRadioGroup>` used 225× across 136 files.**
- **Standalone `<MRadio>` is used 0×** — radios are always rendered through the **group** with
  an `:options` array.
- **`as-button` (segmented control) used 255×** — the segmented form is at least as common as
  the plain radio list. `buttonStyle` is never overridden (always `solid`).

## Overview

A **one-of-many** selection control. Use `MRadioGroup` with an `:options` array
(`{ value, text }`) and v-model the selected `value` (`model: { event: 'change' }`). Set
`as-button` to render a **segmented control** (joined buttons) instead of a radio list. An
`option` slot allows custom row rendering.

## Anatomy

```text
Radio list:        ◉ Low   ○ Medium   ○ High        ← a-radio per option
Segmented:        ┌──────┬──────┬─────┬─────┐
(as-button)       │ 1h   │ 24h* │ 7d  │ 30d │        ← a-radio-button; selected fills navy
                  └──────┴──────┴─────┴─────┘
```

## Options / API

- **`options`** (Array) — `{ value, text | label | title, disabled? }`; the selectable set.
- **`value`** (v-model) — the selected `value`.
- **`asButton`** (Boolean) — segmented control vs radio list.
- **`size`** (`small` · `default` · `large`) — mainly affects the segmented buttons.
- **`disabled`** (Boolean) — disable the whole group (per-option via `option.disabled`).
- **`buttonStyle`** (`solid` · `outline`, default `solid`) — never changed in the product.
- **`name`**, **`defaultValue`**.
- Slots: default (custom `a-radio`/`a-radio-button` children) · `option` (custom row).
- Emits **`change`**.

## Behaviors

- **Single selection** — picking one option deselects the others.
- **Segmented** (`as-button`): the selected button fills the brand color; the rest are
  outlined/joined. **The selected fill is context-dependent (see F4).**
- **Keyboard:** native radio behavior — Arrow keys move selection within the group, Space
  selects.

## Segmented variants (all real in the product)

- **Plain segmented** (`as-button`) — kit default; selected = navy `#111c2c` @ 0.8 opacity.
- **With icons** — an icon per option via the `option` slot (the `without-icon-margin`
  context, **14×**) — view/mode toggles.
- **Severity switch** — `class="radio-toggle-shadow alert-severity-buttons"` (the real
  `severity-switch.vue` combo): borderless segments with thin separators; selected = a tinted
  rounded chip. (`radio-toggle-shadow` 2×, `alert-severity-buttons` 2×.)
- **Radio dot color** (list) = cyan `#099dd9` (Ant `@primary-color`) — matches the product.
- `buttonStyle="outline"` exists but is **unused** (always `solid`).

## Design tokens used

Selected segment fill = primary/brand (measured `#111c2c` light → `#e3e8f2` dark); inherits
Ant radio tokens for the dot and borders.

## Accessibility

- Built on native `<input type="radio">` grouped by `name` — correct role and arrow-key
  navigation. ✅
- ⚠️ **No visible keyboard focus indicator** ([SF-001](../../findings/SF-001-focus-visible.md)).
- Ensure the group has a label (a field label or `aria-label`) describing what's being chosen.

## Findings & Inconsistencies

### F1 — Standalone `MRadio` + `variant`/`type` are effectively dead · Low · Open

`MRadio` is never used directly (0×); its `variant="info"` (→ `.radio-info`) and
`type="button"` paths are unexercised. The group is the real API. **Solution:** document the
group as the entry point; treat `MRadio` as an internal building block.

### F2 — `buttonStyle` outline unused · Low · Open

`buttonStyle` defaults to `solid` and is never set to `outline` (0×). **Solution:** document
`solid` as the de-facto style; keep `outline` only if a real need appears.

### F3 — No visible focus indicator · High · Open *(a11y)* → see [SF-001](../../findings/SF-001-focus-visible.md)

Same system-wide focus-ring gap as other controls.

### F4 — Segmented selected style is context-dependent · Medium · Open

The selected segment renders differently depending on the **ancestor**: standalone it uses the
kit's `.ant-radio-group-solid` (navy `#111c2c` **@ 0.8 opacity**), but inside form/panel
contexts `src/design/form.less` overrides it to a **solid `--primary` fill (`!important`),
11px padding, and icon spacing**. So the *same* `as-button` group looks slightly different
(opacity + padding) inside a form vs standalone. Storybook (loading the same stylesheets)
matches the product **for the same markup**; the divergence is purely the missing form
ancestor. **Solution:** decide on one canonical segmented appearance and move it out of the
form-scoped selectors into the component (kit) styles so it's consistent everywhere; meanwhile
the catalog shows the standalone look + documents the in-form override here.

## Do / Don't

### Do

- Use `MRadioGroup` with `:options` for one-of-many; v-model the value.
- Use `as-button` for a small set of always-visible, mutually-exclusive choices.
- Disable individual options with `option.disabled`.

### Don't

- Don't use a radio group for multi-select (use `Checkbox`) or an instant on/off (use `Switch`).
- Don't use radios for **many** options or when space is tight (use `DropdownPicker`).
- Don't render standalone `MRadio` — go through the group.

## Related

`Checkbox` (multi-select) · `Switch` (instant on/off) · `DropdownPicker` (many options) ·
Button's **segmented control** is this component with `as-button`.

## Changelog

- **2026-06-07** — Added (first authored to the decision-grade Usage standard). Deep-dive of
  `RadioGroup.vue`/`Radio.vue` (225×; standalone radio 0×; `as-button` 255×). Verified radio
  list + segmented in light/dark. Findings F1 (dead standalone/variants), F2 (`outline`
  unused), F3 (focus → SF-001). Closes the Button family's "segmented control" relative.
- **2026-06-07** — Fidelity deep-dive (owner flagged the segmented didn't match the product).
  Confirmed radio-list dots = cyan `#099dd9` (matches). Found the full segmented variant set
  and added stories: **with icons** (14×) and the **severity switch** combo
  (`radio-toggle-shadow` + `alert-severity-buttons`, the real `severity-switch.vue`). New
  finding **F4**: segmented selected style is context-dependent (kit navy @0.8 standalone vs
  solid `--primary` inside forms). Storybook matches the product for identical markup.
- **2026-06-07** — Fixed the icon-segmented story: the icon was wrapped in a `flex` span, whose
  baseline offset the selected segment by 7px (stair-step). Switched to the product's inline
  icon pattern (`.without-icon-margin`, icon `mr-1`) — segments now align (all `top: 40`).
  Authoring note: don't `flex`-wrap content inside Ant `vertical-align: baseline` radio
  buttons; keep it inline.
