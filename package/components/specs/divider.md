# Divider (`MDivider` / `obs-divider`) — Spec, Findings & Solutions

**Tier:** atom · **Source:** mkit (wraps Ant `a-divider`) · **Element:** `<obs-divider>` (framework-agnostic) ·
**Status:** core · **Maturity:** stable · **Storybook:** `Atoms/Divider` · **Registry:** `registry/divider.json` ·
**Figma:** not started

## 1. Usage analytics

Total **133×** across **93** files. By type: **horizontal 126** (implicit default), **vertical 7**
(`type="vertical"`). By module: settings 31 · shared components 14 · alert 10 · ncm-approval 6 · ncm 6 ·
topology 5 · apm 4 · … `dashed` and with-text/`orientation` have **zero** product uses. *(byType exact
from the sweep; the horizontal count is total − vertical.)*

## 2. Overview

A divider is a thin rule that marks a **semantic break** between content. Use **horizontal** (the
default) to separate stacked sections and **vertical** (`type="vertical"`) to separate inline items. If
you only want breathing room, that is **spacing**, not a divider — the product leans on plain horizontal
rules and reserves vertical for genuinely inline groupings.

## 3. Anatomy

A single `role="separator"` rule: the **line** (1px, `var(--border-color)`) and, for a with-text
divider, an **inner label** (`var(--page-text-color)`) breaking the line, positioned center / start / end.

## 4. Options

| Type | What | Usage |
| --- | --- | --- |
| `horizontal` (default) | full-width rule between stacked sections | 126× |
| `vertical` | inline separator between row items | 7× |
| `dashed` | dashed boundary — a **real** dashed line in `obs-divider` (a no-op in the product MDivider, F1) | 0× in product |
| with-text (`text` prop or slot + `orientation`) | labelled section rule | kit-supported |
| `dark` | tuned for a dark background (`--neutral-light`) | rare |

## 5. Behaviors

Static and decorative — no interactive states, no overflow behavior. A vertical divider is inline-block
and inherits line height from its row; a with-text divider splits into `::before`/`::after` segments
whose widths shift with `orientation` (`start` → label flush left, `end` → flush right).

## 6. Content & writing

With-text labels should be short section names (1–3 words), Title Case, no trailing punctuation. Prefer
a real heading when the section is important — a label-on-a-rule is a lightweight affordance, not a heading.

## 7. Accessibility

Ant renders `role="separator"`, conveying a thematic break to assistive tech. A rule is a **visual**
break, not a landmark/heading — give navigable sections a real heading. Line contrast is a low hairline
by design (`--border-color`: `#e3e8f2` light / `#1d2a3e` dark); never rely on a divider alone to convey
meaning. See `Atoms/Divider/Accessibility`.

## 8. Props / API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | string | `horizontal` | `horizontal` \| `vertical` (inline separator) |
| `dashed` | boolean | `false` | a **real** dashed line in `obs-divider` (product MDivider renders it solid — F1) |
| `orientation` | string | `''` (center) | `start` → left, `end` → right (label position, with-text) |
| `text` | string | `''` | optional label → a with-text section rule (or use the default slot) |
| `dark` | boolean | `false` | tuned for a dark background (`--neutral-light`) |

Slot: default = optional label content (renders a with-text divider; equivalent to `text`, slot wins). Events: none.
CSS hooks (vertical form): `--divider-height` (default `0.9em`) · `--divider-gap` (default `8px`) — lets a taller
separator (e.g. a toolbar bulk bar between an action group and its ⋮ More, 24px) reuse the element.

## 9. Design tokens used

`--border-color` (the line), `--page-text-color` (with-text label), `--neutral-lightest` (label
background in forms), `--action-dropdown-divider` (menu dividers), `--nav-divider-bg` (nav dividers).

## 10. Findings & inconsistencies

### F1 — `dashed` renders solid (no-op) · Low · Open in product · **Resolved in `obs-divider`**

In the **product MDivider**, the `dashed` prop has **no visible effect**. The DS override
`.ant-divider { background: var(--border-color) }` (general.less:213, form.less:448) paints a solid 1px line via
`background` over Ant's dashed `border-top`. Verified by computed style: the dashed element carries
`border-top-style: dashed` **and** `background: rgb(227,232,242)` on a 1px-high box — the solid fill wins. 0×
product use (the no-op is why). **`obs-divider` resolves this**: its `dashed` drops the background fill and paints
a real `1px dashed` border, so the element renders an actual dashed line (a deliberate divergence from the product
render).

Note: with-text / `orientation` are kit-supported but unused — surfaced as available options so the catalogue
matches reality.

## 11. Recommended solutions

**F1:** `obs-divider` already implements the fix — its `dashed` scopes off the `background` fill and paints Ant's
`border-top` as a real dashed rule. In the **product MDivider** the no-op remains; to fix it there, scope the
`.ant-divider { background }` fill to the non-dashed case (or add `.ant-divider-dashed { background: transparent }`).
Otherwise guidance-only: prefer spacing over dividers for non-semantic gaps; reserve vertical for inline groupings.

## 12. Do / Don't

**Do:** one rule per boundary; try whitespace first; inherit `var(--border-color)`; vertical for inline,
horizontal for stacked.  ·  **Don't:** use a divider as a spacer; stack dividers / box every section;
rely on a divider alone to convey meaning.

## 13. Decision-grade usage

Decision flow (first match wins): space-only → margin, not a divider · inline items → `vertical` ·
labelled group → with-text (`text`/slot) · else stacked → horizontal · modifiers `dashed` (a real dashed line in
`obs-divider`) / `dark`. Per-type
Use-when/Don't/Example/As-seen-in cards are word-identical to `registry/divider.json` `usageRules` and
the `Atoms/Divider/Usage` page.

## 14. Related components

`Table` (row rules) · `Toolbars` (inline action groups that use a vertical divider) · `Form Item`
(form-section boundaries) · spacing tokens (the first thing to try instead of a divider).

## 15. Changelog

- **2026-07-04** — Added to the DS (first catalogue). Swept 133×/93 files (126 horizontal + 7 vertical;
  with-text unused). Line verified as `var(--border-color)` (light + dark). Decision-grade Usage authored
  and mirrored into the registry.
- **2026-07-04** — **F1 (owner-caught):** `dashed` is a no-op (renders solid) — the `.ant-divider` background
  override paints over Ant's dashed border. Flagged in the Dashed story + Usage; measured by computed style.
- **2026-07-16** — **Fixed:** the `dark` variant filled the **with-text** divider as a solid block — its background
  paint outranked the with-text box's transparent background. Scoped the fill to the plain line (`.dh:not(.withtext)`)
  and recoloured the with-text `::before`/`::after` rules to `--neutral-light`; the labelled divider now renders as a
  line + label on a dark surface.
- **2026-07-16** — Shipped `<obs-divider>` (framework-agnostic element): `type` (horizontal/vertical) · `text`/slot
  with-text rule · `orientation` (start/center/end) · `dark`; `role="separator"` on every form; `--divider-height`/
  `--divider-gap` CSS hooks. Source-derived from Ant v1 defaults + DS overrides. **F1 resolved in the element** —
  `dashed` renders a real dashed line (a deliberate divergence from the product's solid no-op). `darkVariant` renamed
  to `dark`. Composed into the `obs-toolbar` bulk bar (replacing a hand-styled span).
