# Form Field (`FlotoFormItem`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule (form field) |
| **Maturity** | 🟢 Stable — the backbone of every form |
| **Source** | `src/components/_base-form-item.vue` (global `FlotoFormItem`) — `MValidationProvider` (vee-validate) → `MFormItem` → label + control |
| **Storybook** | `Molecules/FormItem` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/form-item.json`](../registry/form-item.json) |
| **Family** | the form-controls host — wraps `Input` / `Select` / `Radio` / `Checkbox` / `LooseTags` / `DropdownPicker` |
| **Figma** | TODO |

## Usage (product analytics)

- **`<FlotoFormItem>` used 1783×** — the **most-used component** in the product (every field).
- `label` 611× · `rules` 272× · `id` 52× · `help`/`info-tooltip` a few. Wrapped by `FlotoForm`
  (`layout="horizontal"` or `"vertical"`).

## Overview

The **Form Field**: a label + validation + control + error/help message, in one wrapper. It
binds a vee-validate `MValidationProvider` to a `MFormItem` (Ant form-item). v-model binds
`value` + `update`. With **no default slot** it renders its own `MInput` (routed by `type`/
`inputType`); otherwise the **default slot is the control** (any input component).

## Anatomy

```text
Label *  ⓘ                         ← label · required asterisk (from rules) · optional info (i) tooltip
┌───────────────────────────────┐
│ control (MInput or slot)       │
└───────────────────────────────┘
  Help text  /  Error message      ← help (hint) OR the validation error (red) when invalid
```

## Options / API

- **`label`** — field label (renders the `<label>` + optional info tooltip).
- **`rules`** (String|Object) — vee-validate rules (`required|email|max:255` …). **`required`
  is derived from `rules`** — the asterisk shows when rules include `required` (no separate prop).
- **`help`** — hint text under the field.
- **`info-tooltip`** — an **(i)** icon by the label with hover help (HTML allowed).
- **`type`/`inputType`** — control type for the built-in `MInput` (text/number/textarea/…).
- **`validationLabel`**, **`vid`**, **`mode`** (`eager`), **`immediate`**, **`hideErrorMessage`**.
- **Layout** (from the parent `FlotoForm`/`MForm` `layout`): **vertical** (label above the
  control, 13×) or **horizontal** (label beside, via `labelCol`/`wrapperCol`, 14×) — both common.
- **`labelCol`/`wrapperCol`** — responsive grid split for label vs control (horizontal layout).
- **Sizes:** none — fields are one height (the control's). **`is-view`** read-only mode lives on
  the *inner controls*, not on `FlotoFormItem`.
- **Slots:** default (the control, gets `slotData`) · `before-input` · `input-children` · plus
  passthrough scoped slots to the inner `MInput`.
- **Methods:** `validate()` · `setValue(v)` · `addError(err)` · `focus()`.
- v-model: `value` + `update`. Emits `blur`.

## Behaviors

- **Required asterisk** appears when `rules` contain `required` (not `required_if`).
- **Validation:** on `eager` mode the field validates on interaction; **error** sets a red
  border + an inline message (`errors[0]`); **success** sets a valid status. The message is
  **pristine-gated** — it appears after the user interacts (type/blur), not on first paint.
- **Built-in vs custom control:** omit the slot for a plain `MInput`; use the slot to wrap a
  Select/Radio/Checkbox/picker and still get the label + validation.
- **Programmatic:** parents call `validate()` / `addError()` / `setValue()` / `focus()` via a ref.

## Content & writing

- Labels: short noun phrases, Title Case ("Polling Interval"). Don't repeat the label in the
  placeholder. Use `help` for a persistent hint, `info-tooltip` for a longer explanation.

## Accessibility

- The label is associated with the control via `MFormItem`; the required asterisk is visual —
  ensure the rule also conveys requirement to AT (the error message does).
- ⚠️ Inner controls have **no visible focus ring** ([SF-001](../../findings/SF-001-focus-visible.md)).
- Error messages are text (not color-only) — good; keep them specific.

## Findings & Inconsistencies

### F1 — `required` is derived, not explicit · Low · Documented

There's no `required` prop — the asterisk comes from parsing `rules` for `required`. Passing a
`required` attribute does nothing. **Solution:** document (done); a `required` convenience prop
that injects the rule could reduce confusion.

### F2 — Error message is pristine-gated · Low · Documented

Even with `immediate`, the inline message only shows after interaction (the red border shows
immediately). Expected vee-validate behavior; document so it's not mistaken for a bug.

### F3 — No visible focus ring on controls · High · Open *(a11y)* → [SF-001](../../findings/SF-001-focus-visible.md)

System-wide (the wrapped inputs strip `outline`).

## Do / Don't

### Do

- Wrap **every** form control in `FlotoFormItem` for a consistent label + validation + error.
- Put validation in `rules` (`required|email|max:255`); add reusable rules in `src/validations.js`.
- Use the default slot to wrap non-text controls (Select/Radio/Checkbox/picker).
- Use `help` for hints, `info-tooltip` for longer guidance.

### Don't

- Don't pass a `required` attribute expecting an asterisk — put `required` in `rules` (F1).
- Don't hand-roll labels/validation around a bare input — use this wrapper.
- Don't rely on `@input` — v-model uses `update`.

## Related

`Input` (the default control) · `Radio` / `Checkbox` / `Switch` / `DropdownPicker` / `LooseTags`
(slot controls) · `FlotoForm` (the form + layout) · `MValidationObserver` (form-level validate).

## Changelog

- **2026-06-07** — Added (decision-grade Usage from the start) — the Form Field molecule
  (1783×). Deep-dive of `_base-form-item.vue`: vee-validate provider → MFormItem → label +
  control + error; `required` derived from `rules`; built-in MInput vs slot control; help +
  info-tooltip; `validate()`/`setValue()`/`addError()`/`focus()`. Storybook: registered
  `MValidationProvider`/`Observer` + `src/validations` rules + FlotoFormItem in the preview;
  stories Basic · Required · Help · Info tooltip · Custom control · Validation error (verified
  the live email error message + red border). Findings F1 (derived required), F2 (pristine-gated
  message), F3 (focus → SF-001).
- **2026-06-07** — Fixed a Storybook-wide tooltip bug + coverage. Root cause: `MTooltip`
  renders `<VTippy>` (vue-tippy), which wasn't registered in the preview — so the info-tooltip
  dumped its content inline (always-on dark box, no (i) icon, no hover). Registered
  `VTippy` (vue-tippy `TippyComponent`) → **all `MTooltip`s now work** (icon trigger + hover
  popup; verified). Added a **Layout** story (vertical vs horizontal). Confirmed coverage: no
  size variants (one height); `is-view` is on the inner controls, not the field; the repeatable
  `multiple-form-items` pattern is a separate (related) component.
