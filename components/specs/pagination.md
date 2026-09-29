# Pagination (`obs-pagination`)

## 1. Overview

The DS pagination footer as a **standalone element**, extracted from `obs-table` so any paged view — a card grid, a tile list, a custom list — can reuse the exact same control. It renders the seek controls (first / previous · numbered **square** cells · next / last), a page-size `<select>`, a `start - end of N items` range, and a **centered slot** for extra footer content (e.g. a severity legend).

## 2. Anatomy

- **Seek controls** — first (`skip-previous` `|◀`), previous (`skip-previous-no-line` `◀`), next (`skip-next-no-line` `▶`), last (`skip-next` `▶|`), all real `obs-icon` glyphs (Google Material Symbols). Disabled + dimmed at the ends.
- **Numbered cells** — uniform 28×28 squares; the active page has the `--pagination-active-bg` fill. Windowed (`1 … around-current … last`) past 7 pages.
- **Page-size select** — a native `<select>` (`appearance:none`) with an `obs-icon` chevron; 28px tall / 4px radius to match the squares.
- **Range** — `start - end of N items`, right-aligned.
- **Center slot** — the default slot, centered between controls and range.

## 3. Variants

- **split** (default) — controls left, range right; center slot empty.
- **centered** — controls left, slotted center content centered, range right. Auto-selected by filling the default slot.

## 4. Sizes

None — a single footer size.

## 5. States

`first-page` (First/Previous disabled) · `last-page` (Next/Last disabled) · `single-page` (all seek controls disabled; range + size select still shown).

## 6. Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `total` | Number | 0 | total item count across all pages |
| `page` | Number | 1 | current 1-based page (reflects to `el.page`) |
| `page-size` | Number | 50 | items per page |
| `page-sizes` | String CSV / Array | `10,20,50,100` | size options (current size merged + sorted) |
| `sizes-label` | String | `items per page` | label after the select |
| `hide-size` | Boolean | false | hide the size select + label |
| `hide-range` | Boolean | false | hide the range text |

## 7. Events

- `pagechange` — `detail` = new 1-based page (on any seek/number click; also fires with `1` when the size changes).
- `sizechange` — `detail` = new page size.

## 8. Slots

- **default** — centered footer content (e.g. a legend). Filling it selects the **centered** variant.

## 9. Behavior

Controlled or standalone: `page`/`page-size` props drive it, and it also advances its own internal state on click and emits, so a consumer can reslice their data. `obs-table` composes it (drives `total`/`page`/`page-size`, applies `pagechange`/`sizechange` to its row-slice state, and forwards its own `footer` slot into the center slot).

## 10. Accessibility

Seek controls carry `title` tooltips; disabled controls are dimmed + non-interactive. The size `<select>` is a native, keyboard- and screen-reader-accessible control; the visual caret is decorative (`pointer-events:none`). **Known gap:** numbered page cells are pointer-only (not yet keyboard-focusable) — follow-up: `role=button` + `tabindex` + Enter/Space.

## 11. Tokens

`--pagination-active-bg`, `--pagination-active-text`, `--border-color`, `--neutral-light`, `--page-text-color`, `--page-background-color`.

## 12. Do / Don't

**Do** reuse it for any non-table paged view; drive `total`/`page`/`page-size` and reslice on the events; put a footer legend in the default slot. **Don't** nest one inside `obs-table` (the table already composes it — use the table's `footer` slot); don't hand-roll seek arrows / numbered boxes.

## 13. Related

`table` (composes it) · `select` (the size control) · `icon` (seek glyphs).

## 14. Decision flow

Table? → the table already has it. Non-table paged view? → use `obs-pagination` directly. Footer legend/summary? → default slot (centered). Endless scroll? → not pagination.

## 15. Changelog

- **2026-09-15** — Extracted as a standalone element from `obs-table`'s footer so any paged view can reuse it (matching how the product reuses its Kendo pager in card views). `obs-table` now composes it; no `obs-table` API change.
