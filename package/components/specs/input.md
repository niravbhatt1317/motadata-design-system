# Input (`MInput`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Atom (form control) |
| **Maturity** | 🟢 Stable (core input primitive) |
| **Source** | `@motadata/ui` → `ui/components/Input/Input.vue` (+ `InputNumber`, `InputSearch`, `InputGroup`); wraps Ant `a-input` |
| **Storybook** | `Atoms/Input` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/input.json`](../registry/input.json) |
| **Family** | form controls — almost always wrapped by **`FlotoFormItem`** (label + validation, 1783×, own entry TODO) |
| **Figma** | TODO |

## Usage (product analytics)

- **`<MInput>` used 293×.** **`<FlotoFormItem>` used 1783×** — the dominant form-field wrapper
  (label + validation around a control).
- **`.material-input` 62×** (bottom-border style) · `full-border-text-area` 17× ·
  `full-bordered-addon-input` 6× · `no-border-input` 3× · `auto-height-input`/`text-lg-input` 2×.
- Kit siblings: `MInputNumber`, `MInputSearch`, `MInputGroup`.

## Overview

The product's text input. `MInput` is a **type-router**: the `type` prop selects the rendered
control. v-model binds **`value` + `update`** (note: the event is `update`, not `input`).

| `type` | Renders |
| --- | --- |
| `text` (default) | `a-input` |
| `password` | `a-input` with `type=password` (no show/hide toggle — see F2) |
| `number` | `MInputNumber` |
| `search` | `MInputSearch` (enter button, emits `search`) |
| `textarea` | `a-textarea` |
| `datetime` | date picker (separate concern) |

## Anatomy

```text
┌─ [prefix] ─ value ──────────── [suffix] ─┐   ← optional prefix/suffix inside the field
│ addonBefore │   input   │ addonAfter │       ← optional attached segments
└──────────────────────────────────────────┘
```

Slots: **prefix · suffix · addonBefore · addonAfter · enterButton** (search).

## Options

- **Type:** text · password · number (`MInputNumber`, 70× direct) · search · textarea (above).
- **Adornments:** `prefix`/`suffix` icons; `addonBefore`/`addonAfter` segments.
- **Clearable:** `allow-clear` (218× incl. pickers) — an **×** to clear when there's a value.
- **maxlength:** native char cap (7×). *(No built-in char counter — `show-count` is not
  supported by this Ant 1.4 kit; the product's `show-count` usage is on other components.)*
- **Style classes (parallel API):** **`.material-input`** (62× — bottom border only,
  Material underline) · `full-border-text-area` (17×, bordered textarea) ·
  `full-bordered-addon-input` (6×) · `no-border-input` (3×, borderless e.g. inline edit) ·
  `auto-height-input` / `text-lg-input` (2× each).
- **States:** default · disabled · read-only · **error** (`.has-error` → red border `#f04e3e`,
  applied by `FlotoFormItem` during validation).
- **Sizes:** Ant `small`/`default`/`large` exist (via `$attrs`) but are **effectively unused** —
  the product uses one height (`@input-height-base` 32px; search 36px).

## Behaviors

- **v-model = `value` + `update`** — bind `v-model` or `:value` + `@update`. Using `@input`
  alone won't update the model (F1).
- **Search** (`type=search`): Enter emits `search`; an enter/search button shows.
- **Number** (`type=number`): `MInputNumber` with steppers.

## Content & writing

Use a clear `placeholder` as a hint (not a substitute for a label — the label comes from
`FlotoFormItem`). Don't put the field's name only in the placeholder.

## Accessibility

- Native `<input>` / `<textarea>` — correct roles, keyboard, and (via `FlotoFormItem`) a
  programmatic label. Provide a label (`FlotoFormItem`) or `aria-label` for a bare input.
- ⚠️ **No visible focus ring** system-wide ([SF-001](../../findings/SF-001-focus-visible.md))
  — inputs strip `outline`.
- `placeholder` contrast: `--input-placeholder-color` is ~50% — verify it meets contrast.

## Findings & Inconsistencies

### F1 — v-model event is `update`, not `input` · Low · Documented

`MInput` uses `model: { event: 'update' }`. `v-model` works, but `@input` handlers won't fire
the model update — use `@update` (or `v-model`). **Solution:** document loudly (done); align to
`input`/`update:value` in a future API pass.

### F2 — `type="password"` has no show/hide toggle · Low · Open

`type=password` falls through to `a-input[type=password]` (no visibility toggle). A separate
`PasswordInput` component exists for show/hide. **Solution:** route `type=password` to
`a-input-password` (Ant has it) or point users to `PasswordInput`.

### F3 — No visible focus indicator · High · Open *(a11y)* → see [SF-001](../../findings/SF-001-focus-visible.md)

Inputs strip the focus outline (system-wide).

## Do / Don't

### Do

- Wrap inputs in **`FlotoFormItem`** for a label + validation (the standard form pattern).
- Pick the `type` for the data (number/search/textarea/password); bind with `v-model`.
- Use `prefix`/`suffix` for context icons; `addonBefore`/`addonAfter` for units/protocols.

### Don't

- Don't rely on `@input` to update the model — it's `update` (F1).
- Don't use the placeholder as the only label.
- Don't expect a password show/hide toggle from `MInput type=password` (F2).

## Related

`FlotoFormItem` (field wrapper — label + validation; own entry TODO) · `MInputNumber` ·
`MInputSearch` · `MInputGroup` · `LooseTags` (tag input) · date picker (`type=datetime`).

## Changelog

- **2026-06-07** — Added (decision-grade Usage from the start). Deep-dive of `Input.vue`
  (293×): type-router (text/password/number/search/textarea), v-model `value`/`update`,
  prefix/suffix/addon slots. Verified all types + adornments + the `.material-input` (62×,
  bottom-border `0/0/1/0`) in Storybook. Findings F1 (`update` event), F2 (no password toggle),
  F3 (focus → SF-001). Noted `FlotoFormItem` (1783×) as the field wrapper — its own entry next.
- **2026-06-07** — Deeper re-sweep (owner doubt re: missed variants). Added **Clearable**
  (`allow-clear`, verified ×) and **Error/validation state** (`.has-error` red border,
  verified) stories; deepened the Usage page (per-type descriptions + real product examples,
  adornments, styles/states, sizes). Corrected: **sizes are effectively unused** (one height);
  **`show-count` char counter is NOT supported** by the Ant 1.4 kit (so not an Input feature);
  `MInputNumber` used directly 70×.
