# Button (`MButton`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Atom |
| **Maturity** | 🟢 Stable (core, most-used component) |
| **Source** | `@motadata/ui` kit → `ui/components/Button/Button.vue` (wraps Ant `a-button`) |
| **Storybook** | `Atoms/Button` |
| **Registry** | [`../registry/button.json`](../registry/button.json) |
| **Figma** | TODO (library not built yet) |

> Documented to the [enhanced standard](../documentation-standard.md): Overview · Anatomy ·
> Options · Behaviors · Content · Accessibility · API · Tokens · Findings · Do/Don't ·
> Related · Changelog.

## Usage (product analytics)

- **`<MButton>` used 1,373× across 424 files — the most-used component in the product.**
- **By variant** (exact): default 301, neutral-lightest 320, transparent 255, primary 91,
  neutral 77, primary-alt 36, error 31, neutral-lighter 17, info 7, success 5, danger 3;
  unused: dashed/ghost/warning/neutral-light/topology-overlay.
- **By size** (approx; shared prop): `small` 76, `large` 9 — the rest default.
- **Modifiers** (approx; shared): `outline`/ghost ~11 explicit, `rounded="false"` 273, `loading` 518, `block` 0.
- **Icon buttons:** `shape="circle"` **218×** · `class="squared-button"` (35×35) **365×** — the
  squared form is more common than the circular one.

## Overview

The primary action control. Wraps Ant `a-button` and adds the project's variant system,
rounding, and shadow. `variant` routes two ways (`Button.vue`): values in
`{primary, dashed, danger, ghost, default}` → Ant `type`; everything else → a
`.button-<variant>` class (+ `type="primary"`). Renders a native `<button type="button">`.

## Anatomy

```text
┌──────────────────────────────────────┐
│  [leading icon]  Label  [trailing]    │   ← container (.ant-btn, variant class, radius)
└──────────────────────────────────────┘
         ▲ loading spinner replaces/precedes label when :loading
```

- **Container** — `.ant-btn` + variant class; height from `size`; radius from `rounded`.
- **Label** — default slot (text).
- **Icon(s)** — optional `<MIcon>` in the slot (leading/trailing).
- **Loading spinner** — shown when `:loading`.

## Options

### Variants — render distinctly ✅

| Variant | Applied as | Background | Usage |
| --- | --- | --- | --- |
| `primary` | Ant type | `#07101f` navy | 91 |
| `primary-alt` | class | `#1d2a3e` slate | 36 |
| `default` | Ant type | `#fff` / border `#e3e8f2` | 301 |
| `danger` | Ant type | light `#f5f5f5` (see F2) | 3 |
| `success` | class | `#14b053` green | 5 |
| `error` | class | `#ec5b5b` red | 31 |
| `neutral-lighter` | class | `#e3e8f2` | 17 |
| `neutral-lightest` | class | `#ecf1f9` | 320 |
| `transparent` | class | transparent | 255 |
| `dashed` / `ghost` | Ant type | white+dashed / transparent+border | 0 |

### Variants — render as navy ⚠️ (see F1)

`neutral` (77×), `info` (7×), `neutral-light`, `warning` — not allow-listed → navy.

### Sizes

`small` (~24px) · `default` (~34px) · `large` (~34px — **same as default, see F5**).

### Icon buttons (two forms — both heavily used)

The product has **two** icon-only button forms, both previously undocumented:

| Form | How | Usage | Notes |
| --- | --- | --- | --- |
| **`shape="circle"`** | Ant circular icon button | **218×** | Renders `border-radius: 4px` (not a true circle) because MButton's default `rounded` class overrides Ant's 50% — see F7. |
| **`class="squared-button"`** | `buttons.less` 35×35 square | **365×** | Fixed `35px × 35px`, 8px padding; the most-used icon-button treatment. |

Both wrap an `<MIcon>` with no text and take any `variant`. ⚠️ **They require an
`aria-label`** (no automatic name). Other contextual icon-button classes exist
(`.model-header-button` 3×, `.button-topology-overlay` 5×) — app-specific, not core.

### States & modifiers

`loading` · `disabled` · `outline` (ghost) · `block` (full width) · `rounded` (default
true) · `shadow` (default true — **inverted, see F6**) · `shape` (`circle`).

## Behaviors

- **Loading:** `:loading` shows a spinner and blocks clicks — use it to prevent
  double-submits during async actions.
- **Block:** `:block` makes the button span its container's width.
- **Label overflow:** buttons hug their label; no built-in truncation — keep labels short.
- **Rounded:** `rounded` (default) gives a pill radius; `:rounded="false"` squares it (4px).

## Content & writing

- **Action-first, concise labels:** "Save", "Create policy", "Delete" — verb + object.
- Avoid vague labels ("OK", "Submit") where a specific verb is clearer.
- One word or short phrase; no sentences. *(Confirm casing convention against product —
  appears sentence/Title case; standardize in a later content-guidelines pass.)*

## Accessibility

- **Semantics:** renders a native `<button type="button">` — correct role, Enter/Space
  activate. ✅
- **Icon-only buttons:** must have an accessible name — provide visually-hidden text or an
  `aria-label` (no automatic label). ⚠️
- **Target size:** default/large ≈ 34px tall, `small` ≈ 24px. Meets a ~28px pointer
  target but is **below the 44–48px touch-target** guideline (Uber Base uses 48px tap) —
  caution using `small` on touch surfaces. (See F4.)
- **Focus indicator:** **appears to be removed** (`outline: none`, no focus shadow) — a
  WCAG 2.4.7 risk. (See F3.)
- **Contrast:** primary navy `#07101f` + white text = high contrast ✅; verify the lighter
  variants (`neutral-lightest`, `transparent`) text contrast in both themes.

## Props / API

`variant` · `size` · `loading` (bool/obj) · `disabled` · `outline` · `block` ·
`rounded` (default true) · `shadow` (default true) · `shape`. Emits `click`.
Full machine spec: [`../registry/button.json`](../registry/button.json).

## Design tokens used

`--primary-button-bg` · `--primary-button-text` · `--btn-height` · `--btn-radius` ·
`--severity-*` (success/error) · `--neutral-*` (neutral variants) · `--primary` (focus,
proposed).

## Findings & Inconsistencies

### F1 — `variant` allow-list forces info/neutral/warning to navy · High · Proposed

`info`/`neutral`(77×)/`neutral-light`/`warning` render navy because
`src/design/buttons.less` only allow-lists certain variants to escape navy via a
high-specificity `:not(...)`. **Solution options A/B/C below.**

### F2 — `danger` renders light, not solid red · Low · Open

Ant 1.4 `type="danger"` styling; the codebase uses `error` (31×) for destructive actions.
**Solution:** standardize on `error`; optionally map `danger` → `error`.

### F3 — No visible focus indicator · High · Open *(a11y)* → see SF-001

Focused buttons show `outline: none` and no focus shadow → keyboard users can't see focus
(WCAG 2.4.7). **This is system-wide** — tracked as
[SF-001](../../findings/SF-001-focus-visible.md) (fix once globally with a `:focus-visible`
ring, don't patch per component).

### F4 — Small/large target sizes · Medium · Open *(new, a11y)*

`small` ≈ 24px is below the 44–48px touch target; risky on touch. **Solution:** reserve
`small` for dense desktop UIs; ensure ≥44px hit area on touch (padding) or avoid `small`.

### F5 — `large` renders the same height as `default` · Low · Open *(new)*

Measured `large` ≈ 34px = `default`. **Solution:** confirm intent; if `large` should be
bigger, add a size token; else drop `large` from the documented sizes (used only 9×).

### F6 — `shadow` prop is inverted/confusing · Low · Open *(new)*

`shadow` defaults to **true**, but `:shadow="true"` applies the `.button-shadow` class which
sets `box-shadow: none !important`. So the prop named "shadow" **removes** the shadow, and
variant hover styles re-add their own shadow. **Solution:** rename to `noShadow`/`flat`, or
invert the logic so `shadow` means what it says (document loudly meanwhile).

### F7 — `shape="circle"` isn't circular · Medium · Open *(new)*

Because `rounded` defaults to **true** (`.rounded { border-radius: 4px }`) and wins over Ant's
`.ant-btn-circle` (50%), `shape="circle"` buttons render as **4px-rounded squares**, not
circles (measured `border-radius: 4px`). **This is the real product behaviour, not a Storybook
artifact**, and it's not an edge case: of **198** `shape="circle"` buttons, only **24** pass
`:rounded="false"` (true circle) — **~174 render as rounded squares**. The prop name is
misleading for ~88% of its uses. **Solution:** if a true circle is intended, pass
`:rounded="false"` with `shape="circle"`, or have the `circle` shape override the radius (so
"circle" means circle).

## Recommended solution — F1 (the main one)

- **A (recommended):** add the variants to the allow-list + token-backed styles:

  ```less
  .ant-btn.ant-btn-primary:not(
    …existing…, .button-neutral, .button-info
  ) { background: var(--primary-button-bg); }
  .ant-btn.button-neutral { background: var(--neutral-button-bg); color: var(--neutral-button-text); }
  .ant-btn.button-info    { background: var(--secondary-blue, var(--primary-alt)); color: #fff; }
  ```

- **B:** deprecate info/neutral/neutral-light/warning; migrate ~84 usages.
- **C:** won't-fix; rename in docs (unlikely — "neutral" reading navy is confusing).

## Do / Don't

### Do

- Use `variant="primary"` for the single main action; `primary-alt` for secondary emphasis.
- Use `error` (not `danger`) for destructive actions, with a confirm.
- Use `neutral-lighter` / `neutral-lightest` / `transparent` for subtle actions.
- Give icon-only buttons an `aria-label`; show `:loading` during async work.

### Don't

- Don't use `neutral`/`info` expecting gray/blue — they render navy today (F1).
- Don't put two `primary` buttons in one action group.
- Don't rely on `small` for touch targets (F4); don't hardcode colors.

## Related components

`MConfirmBtn` (confirm-on-click) · `MDropdown` (menu trigger) · `FlotoGridActions` (row
actions). **Icon buttons** (`shape="circle"` / `.squared-button`) now documented above.
Button-*like* relatives (own families): **`FlotoLink`** (link-styled button, 67×) and the
**segmented control** (`MRadioGroup` `as-button`, 255× — part of the Radio family). See the
[Family Map](../family-map.md).

## Changelog

- **2026-06-05** — Added to Storybook. Variants corrected to the distinctly-rendering set;
  `primary-alt` added; `info`/`neutral`/etc. moved to a flagged "navy fallback" story (F1).
- **2026-06-05** — Light/dark verified (primary flips white-on-navy in dark).
- **2026-06-06** — Upgraded to the enhanced doc standard; added Anatomy, Behaviors,
  Content, Accessibility (F3 focus ring, F4 target size, F5 large-size), Related, Changelog.
- **2026-06-07** — Thorough button audit (whole product). Added the two **icon-button** forms
  (`shape="circle"` 218× + `.squared-button` 365×) — story + Options section + usage. New
  findings **F6** (inverted `shadow` prop) and **F7** (`shape="circle"` not circular). Noted
  button-like relatives `FlotoLink` (67×) and the segmented control (`MRadioGroup as-button`,
  255×); both filed in the Family Map.
</content>
