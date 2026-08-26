# Switch (`MSwitch`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Atom |
| **Maturity** | 🟢 Stable (core) — open a11y findings (F3, F4) |
| **Source** | `@motadata/ui` kit → `ui/components/Switch/Switch.vue` (wraps Ant `a-switch`). Not overridden; not excluded. |
| **Storybook** | `Atoms/Switch` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/switch.json`](../registry/switch.json) |
| **Figma** | TODO |

## Usage (product analytics)

- **`<MSwitch>` used 136× across 88 files.**
- `size="small"` ~76 (approx, shared prop). checked/unchecked **label slots: 0 files** (unused).

## Overview

An **instant** on/off toggle for a setting (applies immediately — no Save). Wraps Ant
`a-switch`; **controlled** (bind `v-model` / `:checked`).

## Anatomy

```text
  off:  ◖○────────◗   gray knob, white track
  on:   ◖────────●◗   green knob, white track   ← track color unchanged; knob signals state
```

Track · knob (gray→green) · optional `#checked` / `#unchecked` label slots (unused).

## Options / States

- **Sizes:** `default` (22×44px) · `small`.
- **States:** off · on · disabled · loading (controlled via `:checked`/`v-model`).

**Context re-check (2026-06-07):** swept all switch styling (kit override, `form.less`,
`table.less`, `input.less`) for hidden/context variants like Radio's segmented set. Result:
**none** — no consumer `*-switch` classes exist, and the table/form rules only set the track
token (`--switch-bg`) + alignment. The track stays static (`--switch-bg`/white) in both states;
only the knob colors green (verified: track `#fff`, knob `#14b053`) — this is product-accurate
(F2). The switch surface is complete (no segmented/variant explosion).

## Behaviors

- **Controlled:** always reflects `:checked`; toggling emits `change(value)`.
- **Loading:** `:loading` shows a spinner in the knob during async persistence.
- **Track is static color:** only the knob changes (gray off → green on) + slides position.

## Content & writing

Pair with a label naming what turns on ("Enable notifications"). On/off text slots exist
but the product doesn't use them.

## Accessibility

- **Semantics:** `role="switch"`; Space/Enter toggle. ✅
- **State:** `aria-checked="true"` when on ✅; **missing when off** (F4).
- **Target size:** ~22px tall — below the 44–48px touch target (F5).
- **Focus:** no visible focus ring (F3).
- **Theming:** track/border theme in dark (`#fff→#172336`); knob colors (`#a5bad0` off,
  `#14b053` on) are static but read acceptably in both themes.

## Props / API

`checked` (v-model) · `size` (default/small) · `disabled` · `loading` · `defaultChecked`
(**no-op — F1**) · `autoFocus`. Slots `checked` / `unchecked`. Emits `change`.
Machine spec: [`../registry/switch.json`](../registry/switch.json).

## Design tokens used

Kit LESS vars (static): `@white` (track) · `@neutral-light` (off knob/border) ·
`@secondary-green` (on knob). Track/border also pick up CSS-var theming in dark.

## Findings & Inconsistencies

### F1 — `defaultChecked` is a no-op · Medium · Open

`MSwitch` always passes `:checked` (default `false`) to `a-switch`, which overrides
`:defaultChecked` → the switch never starts on via `defaultChecked`. **Solution:** use
`:checked`/`v-model`; or in the kit, don't bind `:checked` when uncontrolled. Document
that `defaultChecked` does nothing.

### F2 — Track color doesn't change; state is knob-color-only · Medium · Open

Off and on share the same (white/dark) track; only the knob color (gray→green) + position
differ. Subtler than a track-fill switch and leans on color. **Solution:** confirm intent;
consider a checked **track** fill (e.g. `--severity-clear` tint) for a stronger signal.

### F3 — No visible focus indicator · High · Open *(a11y)* → see SF-001

`outline: none`, no focus shadow (WCAG 2.4.7). **System-wide** — tracked as
[SF-001](../../findings/SF-001-focus-visible.md); fix once globally.

### F4 — `aria-checked` absent in the OFF state · Medium · Open *(a11y)*

On exposes `aria-checked="true"`; off is null → AT may not announce "off". **Solution:**
ensure `aria-checked="false"` is set when unchecked.

### F5 — 22px height below touch target · Low · Open *(a11y)*

**Solution:** ensure ≥44px hit area (padding) on touch surfaces.

## Do / Don't

### Do

- Use for **immediate** on/off settings; show `:loading` while persisting.
- Control via `v-model` / `:checked`.

### Don't

- Don't use a switch in a form that needs explicit Save (use `MCheckbox`).
- Don't rely on `:defaultChecked` (F1).

## Related components

`MCheckbox` (needs Save) · `MRadio` (mutually exclusive).

## Changelog

- **2026-06-05** — Added (Playground · States · Sizes).
- **2026-06-06** — Full deep-dive: examples fixed to `:checked` (F1); on/off rendering
  measured (white track + gray→green knob, light/dark). Enhanced standard + Option B pages;
  a11y findings F3 (focus ring) + F4 (off-state aria-checked) + F5 (target size).
