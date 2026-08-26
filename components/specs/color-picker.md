# Color Picker — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule |
| **Maturity** | 🟢 Stable |
| **Source** | `src/components/color-picker.vue` (`MPopover` + `vue-color` `Sketch`) |
| **Storybook** | Molecules/Color Picker |
| **Registry** | [`registry/color-picker.json`](../registry/color-picker.json) |
| **Family** | [Form Controls](../family-map.md) |

## Overview

A **color picker** lets a user choose a **color**. A 20×20 **swatch preview + chevron** trigger opens an
`MPopover` containing a color **canvas** (`vue-color`'s Sketch) and the product's **16-color preset palette**.
It supports **`transparent`** (the swatch renders with a red diagonal line). It lives in **Form Controls**
alongside Select / Dropdown / Input — reach for it only when the value being set *is a color*.

## Anatomy

- **Trigger** — a 20×20 color swatch (the current value) + a chevron. `hideArrow` hides the chevron.
- **Popover** — a `Sketch` canvas (hue/saturation + hex/RGBA inputs) + a **16-swatch preset grid**; the
  selected preset shows a `--primary` outline and the current hex is shown as text.
- **Transparent** — a bordered swatch with a `--secondary-red` diagonal line.

## Options / Variants

| Variant | What |
| --- | --- |
| color-picker | swatch trigger + preset palette + canvas |

States: **closed** (swatch only) · **open** (palette + canvas) · **transparent** (red diagonal swatch).

## Behaviors

- Click the swatch → the popover opens; pick a preset or a custom color on the canvas → `value` updates.
- `transparent` is a valid value where "no fill" makes sense.

## Props

| Prop | Type | Note |
| --- | --- | --- |
| `value` | string | the selected color (hex or `transparent`) |
| `placement` | string | popover placement |
| `hideArrow` | boolean | hide the chevron next to the swatch |

## Design tokens used

`--border-color` (transparent swatch border / popover) · `--secondary-red` (transparent diagonal) ·
`--primary` (selected preset outline) · `--page-background-color` · `--dropdown-background` (canvas bg).

## Which control? (decision)

1. **Fixed severity / status color?** → use the `--severity-*` token, **not** a free picker.
2. **A color the user picks freely** (brand, widget series, threshold, background)? → **Color Picker**.
3. **Not a color?** → a **Dropdown / Select / Input**.

## Do / Don't

- **Do** use it for brand/theme, chart series, threshold/gauge band, and dashboard background colors; offer the
  preset palette for quick on-brand picks; support `transparent` where no-fill is valid.
- **Don't** use it for fixed severity colors (use the token), for non-color values, or as the *sole* signal for
  meaning — pair color with a label/icon.

## Accessibility

- **Label the trigger** — the swatch is essentially icon-only; give it an `aria-label` (e.g. "Series color")
  and make it a focusable `<button>`.
- **Name every palette cell** — expose each swatch's color name/hex via `aria-label`/`title`.
- **Keyboard** — Enter/Space opens; arrows move between presets; Enter selects; Esc closes; focus returns to
  the trigger.
- **Not color-only** — the selected preset shows a `--primary` outline **and** the hex as text; never convey
  meaning by color alone.

## Findings & Inconsistencies

- No known DS-level defects. The underlying `vue-color` Sketch canvas may need explicit labels on its inputs.

## Related

Select · Dropdown picker · Input (Form Controls); Severity (for fixed status colors, via tokens).

## Changelog

- **2026-07-11** — Added — catalogued the Color Picker (Storybook Examples + Usage + Accessibility + Changelog,
  registry with states / decisionFlow / do / dont / usageRules). Found in the Group-C dropdown/menu sweep;
  placed in the Form Controls family.
