# TagsList — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule (read-only display) |
| **Maturity** | ⚠️ **Unused (dead code)** — exists but has **0 usages** in the product |
| **Source** | `src/components/tags-list.vue` (composes `MTag` + `MPopover`) |
| **Storybook** | `Molecules/TagsList` (Examples · Usage · Changelog) |
| **Registry** | [`../registry/tags-list.json`](../registry/tags-list.json) |
| **Family** | Tag family — the read-only "overflow" display (see [`tag.md`](./tag.md); [D12](../../decisions/DECISIONS.md)) |
| **Figma** | N/A (dead code — do not build) |

> ⚠️ **This component is unused.** Documented at the owner's request for a complete
> catalog. The **live** equivalent of this pattern is **`SelectedItemPills`** (the picker
> "+N" pills). Prefer that. See finding **F1**.

## Usage (product analytics)

- **`<TagsList>` used 0× / 0 files.** Not imported anywhere. (`name: 'TagsList'`; the only
  "TagsList" matches in the codebase are unrelated data fields like `_objectTagsList`.)

## Overview

A read-only **tag overflow** display. Given an array of strings:

- **≤ `maxLength`** (default **2**) → render each tag inline as a neutral `tag-primary`
  chip (rounded, non-closable).
- **> `maxLength`** → render a single chip showing the **count**, with a hover **popover**
  listing every item.

Note it collapses to **just the count** (e.g. "5") — it never shows "first N + remaining",
unlike `SelectedItemPills` which shows the first item(s) then a `+N`.

## Anatomy

```text
≤ maxLength:   ⌜web-server⌟ ⌜database⌟          ← inline neutral chips
> maxLength:   ⌜ 5 ⌟  ──hover──▶  ┌──────────┐  ← count chip + popover list
                                  │ web-server│
                                  │ database  │
                                  │ …         │
                                  └──────────┘
```

## Options / API

- **`value`** (Array | Object) — the tags to display.
- **`maxLength`** (Number, default **2**) — inline threshold before collapsing to a count.

No events, no slots, no v-model. Pure presentational.

## Behaviors

- Renders nothing when `value` is empty.
- Hover (not click) opens the count popover (`trigger="hover"`, `placement="bottomRight"`).

## Design tokens used

`--tag-bg` / `--tag-color` (the neutral `tag-primary` chip, themed) · `--border-color`
(popover row dividers). Chip corner is `border-radius: 10px` (local `.application-item`).

## Accessibility

- Read-only text chips (`<span>`) — fine for contrast in both themes.
- The overflow affordance is **hover-only** — the count chip isn't focusable/click-openable,
  so keyboard/touch users can't reveal the full list. (Moot while unused; would matter if
  revived — prefer `SelectedItemPills`, which has the same caveat tracked there.)

## Findings & Inconsistencies

### F1 — Dead code (unused component) · Medium · Open

`tags-list.vue` is **never imported or rendered**. It duplicates a pattern already provided
(better) by `SelectedItemPills` (first-N + `+N` overflow, used in pickers/`LooseTags`).
**Solution:** **remove** `src/components/tags-list.vue` (dead-code cleanup), or — if a
count-only overflow display is genuinely wanted — fold it into `SelectedItemPills` behind a
prop instead of maintaining a second component.

### F2 — Count-only overflow (pattern inconsistency) · Low · Open

It collapses to **only a count** with no preview of any tag, whereas the product's live
pattern (`SelectedItemPills`) shows the first item(s) + `+N`. Two different overflow idioms
for the same concept. **Solution:** standardize on the `SelectedItemPills` idiom.

## Do / Don't

### Do

- For tag overflow in the product, use **`SelectedItemPills`** (live, themed, `+N`), not this.

### Don't

- Don't adopt `TagsList` in new code — it's unused/dead. Don't build it in Figma.

## Related

`SelectedItemPills` (the live overflow equivalent) · `MTag` · `MPopover` · `LooseTags`.
See the Tag family table in [`tag.md`](./tag.md).

## Changelog

- **2026-06-07** — Added to the catalog (badged **unused**) at the owner's request. Verified
  render (inline chips ≤ maxLength; count chip + hover popover above it). Logged dead-code
  finding F1 + pattern inconsistency F2; recommended removal / consolidation onto
  `SelectedItemPills`.
