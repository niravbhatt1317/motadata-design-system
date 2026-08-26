# Tag (`MTag`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Atom |
| **Maturity** | 🟡 Stable-but-flawed (heavily used as a plain tag; the `variant` feature is broken) |
| **Source** | `@motadata/ui` kit → `ui/components/Tags/Tag.vue` (wraps Ant `a-tag`). Not overridden/excluded. |
| **Storybook** | `Atoms/Tag` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/tag.json`](../registry/tag.json) |
| **Figma** | TODO |

## Usage (product analytics)

- **`<MTag>` used 150× across 87 files** — almost always a **plain** tag (no variant).
- **`variant` used ~3× total** (primary/error/default ×1 each) — effectively unused.
- `<MStatusTag>` (the separate status component) used 30×.

## Overview

A compact label for categorization, metadata, or removable selections. Wraps `a-tag`;
maps `variant` → a color via `ColorPalette` (`ui/style/colorPalette.js`) or takes a raw
`color`. **In practice it's used as a plain or removable label, not a colored variant.**

## Anatomy

```text
┌───────────────┐
│  Label    [×] │   ← container (.ant-tag) · label (slot) · remove "×" (when closable)
└───────────────┘
```

## Options

- **Colored / status tags → CSS classes (the working mechanism):** apply a class, not the
  `variant` prop — colored text on a tinted background, legible in both themes:
  `tag-red` (75×) · `tag-green` (57×) · `tag-yellow` (15×) · `tag-orange` (9×) ·
  `tag-purple` (1×) · `tag-unknown` (2×). Plus state classes `.new` / `.provision` /
  `.unprovision` / `.used-count-pill` (48×). Example: `<MTag class="tag-red" :closable="false">`.
  (`tag-primary` (49×) is actually a neutral chip, not brand-blue.)
- **`variant` prop (ColorPalette keys) — avoid:** `default · primary · success · error ·
  warning · orange · neutral-lighter`; **colored ones are broken/illegible (F2)**. Use the
  classes above instead.
- **Modifiers:** `closable` (default **true**), `rounded` (10px pill; default is 4px squarish),
  `numeric` (count/metric font — JetBrains Mono + tabular figures, the product `.numeric-value`),
  `confirmable` (confirm-before-remove), `visible`, custom `color`.

## Behaviors

- **Removable:** with `closable`, a "×" emits `close`. `confirmable` wraps it in a confirm.
- **`closable` defaults to true** → every tag shows a "×" unless `:closable="false"` (F5).

## Content & writing

Short noun/label; for removable chips the label is the selected value.

## Accessibility

- A plain tag is a `<span>` label — fine.
- Default tag contrast (neutral text on a neutral chip) is legible in both themes; bg
  themes (`#e3e8f2` → `#2b394f`).
- ⚠️ **The remove "×" is not keyboard-accessible** (F4).

## Props / API

`closable` (default true) · `color` · `variant` · `rounded` (10px pill; default 4px squarish) ·
`numeric` (count/metric — JetBrains Mono tabular figures) · `confirmable` · `visible`.
Emits `close`; slots: default (label), `confirm-title`. No `model`.
Machine spec: [`../registry/tag.json`](../registry/tag.json).

## Design tokens used

`--tag-bg` / `--tag-color` (themed) for the plain tag. Variant colors come from
`ColorPalette` **static hex** (not tokens) — see F1/F6.

## Findings & Inconsistencies

### F2 — Colored variants are illegible (effectively broken) · High · Open

Measured: every colored `variant` (primary/success/error/warning) renders the **same
neutral chip background** (`--tag-bg`) with **white text** → in light theme that's white
on `#e3e8f2` (contrast ~1.2:1, unreadable). The product forces the tag bg to `--tag-bg`
regardless of `color`, so the variant only changes text color. This is why `variant` is
used only ~3×. **Use the `tag-*` CSS classes instead** (see Options — they're legible and
heavily used: `tag-red` 75×, `tag-green` 57×, …), or `MStatusTag` for status. Longer term,
either fix the `variant` override to produce a legible bg+text pair (token-based) or remove
the `variant` color feature in favor of the classes.

### F4 — Remove "×" is not keyboard-accessible · High · Open *(a11y)*

The close control is an `<a @click>` with **no `href`/`role`/`aria-label`/`tabindex`** —
confirmed not focusable. Keyboard/AT users can't remove tags, and the control is unlabeled.
**Solution:** use `<button type="button" aria-label="Remove {label}">` + a focus ring
(see [SF-001](../../findings/SF-001-focus-visible.md)).

### F1 — Variant set is small + static; no info/neutral · Medium · Open

Valid variants = ColorPalette keys only; `info`/`neutral` silently do nothing. Colors are
static hex (`success #89c540`, `error #f04e3e`, …) that **differ from the product's
severity tokens** (`#14b053`, `#ec5b5b`). **Solution:** document the real set; align to
tokens if variants are revived.

### F5 — `closable` defaults to true · Medium · Open

Display tags get an unexpected "×" unless `:closable="false"`. **Solution:** consider
defaulting `closable` to false; for now, document it loudly.

### F6 — Close "×" optically off (baseline layout, not flex) · Low · Open *(polish)*

`.ant-tag` uses `line-height: 22px` + inline/baseline layout (no flex). The thin Font-
Awesome `times` glyph (`vertical-align: -1.65px`) aligns by baseline, so the × *reads*
slightly off the label even though it's geometrically centered (**measured offset ~1px**).
Product-side, not Storybook. **Solution (optional polish):** `.ant-tag { display:
inline-flex; align-items: center; gap: 4px; }` in `tags.less` for optically-clean alignment
and controlled spacing.

### F3 — `neutral-ligher` class typo · Low · Open

`Tag.vue` applies the misspelled class `neutral-ligher` (missing "t") for the
`neutral-lighter` variant, so the themed `.neutral-lighter` LESS override never matches.
**Solution:** fix the typo to `neutral-lighter`.

### F7 — `MStatusTag` label inversion + silent fallback · Low · Open

`_base-status-tag.vue` `textMap` flips two labels: `poweredoff` renders **"Up"** and
`poweredon` renders **"Down"** (colours still follow `TAG_MAP`: poweredoff = red,
poweredon = green) — surprising for a reader. Also, a `status` not in `TAG_MAP` gets **no
colour class** and renders as a plain rounded tag (silent). **Solution:** document the
inversion explicitly; add an `unknown`/default colour mapping so unmapped statuses are
visibly neutral rather than silently plain.

## Do / Don't

### Do

- Use a plain tag for labels; `:closable="true"` for removable chips; `:rounded` for pills.
- Use `:numeric` for COUNT / metric tags (log-type counts, used-counts, %) — the numeric font
  aligns figures. Default is the 4px squarish shape (the Log tree counts); add `rounded` for a pill.
- Use `MStatusTag` for status/severity.

### Don't

- Don't use the color `variant`s (broken/illegible — F2).
- Don't assume `info`/`neutral` exist (F1); don't forget `closable` defaults to true (F5).

## Tag family (related components & treatments)

"Tag" is a **family**, not just `MTag`. Each member is classified by *what it is*
(decision [D12](../../decisions/DECISIONS.md) — own entry vs. variant vs. internal part):

| Member | Source | Role | Classification → home |
| --- | --- | --- | --- |
| `MTag` | `ui/components/Tags/Tag.vue` | base tag (+ `tag-*` colour classes, state classes) | **base** → this sheet |
| `tag-*` colour classes | `src/design/tags.less` | colour restyle of MTag | **variant** → Tag (ColoredTags story) |
| `MStatusTag` | `_base-status-tag.vue` | status/severity tag — maps status→`tag-*` (30×) | **variant** → Tag (Status story + section below) |
| **`SelectedItemPills`** | `dropdown-trigger/selected-item-pills.vue` | **teal `ant-tag-has-color` pills for picker selections** — truncated, with a **`+N` overflow popover** (default `maxItems: 1`); teal from `--main-tags-*` in `input.less`. | **internal part** → [DropdownPicker](./dropdown-picker.md) ✅ (preview story under Tag) |
| `MultipleTrigger` / `SingleTrigger` | `dropdown-trigger/` | picker triggers that render `SelectedItemPills` | **internal part** → [DropdownPicker](./dropdown-picker.md) ✅ |
| `LooseTags` | `loose-tags.vue` | free-form **tag input** (type to create tags) | **own entry** → [Molecules / Forms](./loose-tags.md) ✅ |
| `TagsList` | `tags-list.vue` | read-only tag overflow (count + popover) — **dead code, 0 usages** | documented **badged unused** → [Molecules / TagsList](./tags-list.md) ✅ (prefer `SelectedItemPills`) |

App-specific tag classes also exist: `filter-alert-tag` (7×), `os-tag`, `nav-beta-tag`,
plus the `main-tags` teal treatment. The **teal `key:value` + `+N` pills** seen in pickers
are `SelectedItemPills` — shown live in Storybook as **Atoms / Tag / Examples → "Selected
pills (picker, +N overflow)"** (rendered with `:tags="true"`, which adds the
`.loose-tags-input` ancestor that activates the teal `--main-tags-*` styling). Full
behavioural coverage (triggers, search, clear) comes with the DropdownPicker spec.

### Status / severity tag — `MStatusTag` (variant of Tag)

`_base-status-tag.vue` (registered globally as **`MStatusTag`**, used **30× / 28 files**).
It is **not a separate component** in the DS — it's a *semantic variant of Tag*: it renders
`<MTag rounded :closable="false" :class="tag-*">` and maps a **status string** to a
**colour class plus a capitalized label**. Shown live as **Atoms / Tag / Examples →
"Status / severity"**.

- **API:** `status` (String|Number) · `forcePrimary` (Boolean). Renders nothing when
  `status` is falsy.
- **Mapping (`TAG_MAP`, ~90 keys):** green = `up`/`on`/`active`/`success`/`healthy`/…;
  red = `down`/`off`/`critical`/`failed`/`disconnected`/…; yellow = `paused`/`queued`/
  `halted`/`starting`; orange = `suspended`/`fair`; purple = `unreachable`; neutral
  (`tag-primary`) = `maintenance`/`connected`/`standby`. Verified colours match the
  severity palette (`up` → `#14b053`, `down` → `#ec5b5b`, …).
- **`forcePrimary`** overrides any status to the neutral `tag-primary` chip.
- **Fallback:** a status **not** in the map gets no colour class → renders as a plain
  rounded tag (silent — easy to miss). Consider a documented default/`unknown` mapping.
- **Quirk (finding F7, low):** `textMap` inverts two labels — `poweredoff` shows **"Up"**
  and `poweredon` shows **"Down"** (the *colour* still follows `TAG_MAP`: poweredoff = red,
  poweredon = green). Intentional domain inversion, but surprising; document loudly.
- **Alignment:** `MStatusTag` carries `inline-flex items-center`, which is exactly the
  alignment plain `MTag` lacks (F6). This now renders in Storybook since the Tailwind
  pipeline was enabled — see [SF-002](../../findings/SF-002-storybook-tailwind.md) (Fixed).

## Changelog

- **2026-07-20** — Added the `numeric` modifier: a count/metric tag in the numeric font
  (`--numeric-font-family` JetBrains Mono + tabular figures — the product `.numeric-value`), the
  DS-native equivalent of the product's `<small class="tag-primary numeric-value">` count. Default is
  the 4px squarish tag (not the `rounded` pill). Added to the playground + a "Numeric" examples group;
  reused by the obs-side-menu tree counts.

- **2026-06-05** — Added (placeholder variants).
- **2026-06-06** — Full deep-dive: real variant set (ColorPalette) found; colored variants
  measured **illegible** (F2); examples refocused on plain/removable usage; findings F1–F5
  (with the SF-001 link); Option B pages.
- **2026-06-11** — Back-catalog re-audit (prop-value distribution sweep): added a **State
  classes** story rendering `used-count-pill` (48×), `new`, `provision`, `unprovision` —
  previously documented in text but not shown.
