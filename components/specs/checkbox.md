# Checkbox (`MCheckbox`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Atom |
| **Maturity** | 🟢 Stable (core) — but has an open **accessibility** finding (F3) |
| **Source** | **Floto override** → `src/components/_base-checkbox.vue` (kit's `MCheckbox` is **excluded** in `main.js`) |
| **Storybook** | `Atoms/Checkbox` |
| **Registry** | [`../registry/checkbox.json`](../registry/checkbox.json) |
| **Figma** | TODO |

> Documented to the [enhanced standard](../documentation-standard.md).

## Usage (product analytics)

- **`<MCheckbox>` used 76× across 59 files.**
- **`<MCheckboxGroup>` 0×** (kit group unused; multi-select built ad-hoc).
- **`indeterminate` used ~5 sites** — select-all permission groups, hierarchy/tree
  pickers, NOC dashboard picker.

## Overview

A single boolean toggle, usually with a label. The product ships the Floto override
`_base-checkbox.vue` — a **`<template functional>`**, **fully-controlled** component (no
internal state) that renders the Ant checkbox markup and emits `change(checked)`. Bind
with `v-model` (or `:checked` + `@change`).

## Anatomy

```text
┌─ label (.ant-checkbox-wrapper) ───────────────┐
│  ┌──┐                                          │
│  │✔ │  Label text (default slot)               │
│  └──┘                                          │
│   ▲ box (.ant-checkbox-inner, 19px) + check (::after, navy) │
└────────────────────────────────────────────────┘
```

- **Wrapper** — `<label class="ant-checkbox-wrapper">` (clicking it toggles).
- **Box** — `.ant-checkbox-inner`, 19×19px, radius 3px.
- **Checkmark** — `::after`, navy (`--primary`).
- **Hidden input** — `<input type="checkbox">` (the real control for AT).
- **Label** — default slot (optional).

## Options / States

`unchecked` · `checked` · `indeterminate` (dash; partial-group) · `disabled`
(+ disabled-checked). All **controlled** — pass the state in.

**Context re-check (2026-06-07):** swept all checkbox styling (`checkbox.less`, kit override,
`table.less`, `app.less`, `general.less`) for hidden/context variants like Radio's segmented
set. Result: **none** — the table rules (`td.checkbox` 60px column, wrapper `float`) and
`.checkbox-label` are pure **layout**, not new looks. The only extra is an **unused
`.checkbox-info`** variant (info-blue checked) in the kit override — **0× usage**, and not part
of the Floto override's API (parallel to `radio-info`). So the checkbox surface is complete.

## Behaviors

- **Controlled only:** no internal state / no `defaultChecked`. The parent owns `checked`
  via `v-model`; without it the box won't change on click.
- **Indeterminate** is a parent-over-group signal (shown as a dash), not a stored value.

## Content & writing

- Label states the positive choice ("Send me updates", "Enable notifications").
- Keep labels short; avoid negatives ("Don't…") which confuse the checked meaning.

## Accessibility

- **Label association:** the `<input>` is nested in the `<label>` (implicit association) →
  clicking the label toggles. ✅ Provide a label (or an `aria-label` for a bare box).
- **Keyboard:** native input → Space toggles, Tab focuses. ✅
- **🔴 Screen-reader state is wrong (F3):** the override never binds `:checked` to the
  `<input>`, so the input reports `checked = false` even when visually checked. AT
  announces the wrong state.
- **Indeterminate not exposed (F4):** the dash is CSS-only; the input has no
  `indeterminate` property / `aria-checked="mixed"`, so AT can't announce "mixed".
- **Target size:** 19px box is below the ~24px+ min; the wrapper label extends the hit
  area, but a bare box (no label) is a small touch target (F5).

## Props / API (the override — not the kit's)

| Prop | Type | Notes |
| --- | --- | --- |
| `checked` | Boolean | **v-model** (`model: checked/change`) |
| `disabled` | Boolean | |
| `indeterminate` | Boolean | parent-over-group |
| `value` | Boolean/String | grouping id |

Event `change(checked)`; slot = label. **Not present:** `variant`, `defaultChecked`,
`autoFocus`. Machine spec: [`../registry/checkbox.json`](../registry/checkbox.json).

## Design tokens used

`--checkbox-bg` (checked fill: `#fff` light / `#2b394f` dark) ·
`--checkbox-checked-border-color` · `--primary` (checkmark) · `--neutral-lighter` (border).

## Findings & Inconsistencies

### F1 — Product `MCheckbox` is a functional override; kit's is excluded · Medium · Documented

Two `MCheckbox` implementations; the kit's (with `variant`/`defaultChecked`) is excluded
in `main.js` and effectively dead. Document the **override's** API. Storybook preview
replicates the exclusion+override (fixed).

### F2 — Checked state relies on the checkmark, not a colored fill · Low · Open

Checked fill is `--checkbox-bg` (white in light), not a brand fill — subtler than typical.
Confirm intent; if stronger affordance wanted, fill with `--primary` + white tick.

### F3 — `<input>.checked` not bound → screen readers announce wrong state · High · Open *(a11y)*

The functional template sets `:disabled` but **not `:checked`** on the input; the visual
checked is class-driven. So AT reads the input as unchecked even when checked.

**Solution:** bind the input's checked state in `_base-checkbox.vue`:

```vue
<input type="checkbox" :checked="props.checked" :disabled="props.disabled" @change="…" />
```

(and set the `indeterminate` DOM property — see F4).

### F4 — Indeterminate not exposed to AT · Medium · Open *(a11y)*

`indeterminate` only adds a CSS class; the input lacks the `indeterminate` property /
`aria-checked="mixed"`. **Solution:** set `inputEl.indeterminate = props.indeterminate`
(DOM property via a small directive/ref, since it's not a reflected attribute).

### F5 — 19px box is a small touch target · Low · Open

Fine with a label (extended hit area); risky as a bare box on touch. **Solution:** ensure
≥24px hit area (padding) for label-less checkboxes.

## Do / Don't

### Do

- Provide a label via the default slot; bind with `v-model`.
- Use `indeterminate` for a parent over a mixed group.

### Don't

- Don't use `variant`/`defaultChecked` (the override has neither).
- Don't use a checkbox for mutually-exclusive choices (`MRadio`) or instant settings (`MSwitch`).

## Related components

`MRadio` (mutually-exclusive) · `MSwitch` (instant on/off) · `MCheckboxGroup` (kit, unused)
· select-all/tree-picker patterns that use `indeterminate`.

## Changelog

- **2026-06-05** — Added to Storybook to the real (Floto override) API; preview fixed to
  exclude the kit's MCheckbox and register the override (F1). Light/dark verified.
- **2026-06-06** — Documented `indeterminate` product usage. Upgraded to enhanced standard;
  added Anatomy, Behaviors, Content, Accessibility — surfacing **F3** (SR state not bound,
  High) and **F4** (indeterminate not exposed) with fixes; Related; Changelog.
- **2026-06-07** — Context-variant re-check (post-Radio): swept all checkbox LESS for hidden
  variants → none (table/label rules are layout only); noted the unused `.checkbox-info`
  variant (0×). Surface confirmed complete.
</content>
