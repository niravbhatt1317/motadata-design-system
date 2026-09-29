# Widget Grid (`obs-widget-grid`) — Spec, Findings & Solutions

**Tier:** organism · **Source:** new (the framework-agnostic answer to `vue-grid-layout`) ·
**Element:** `<obs-widget-grid>` · **Status:** core · **Maturity:** stable · **Storybook:**
`Dashboard/Widget Grid` · **Registry:** `registry/widget-grid.json` · **Figma:** not started · **Family:** Dashboard
(pairs with [`widget-card`](./widget-card.md)).

## 1. Usage analytics

New DS element (no legacy product-wide sweep — this is the reusable extraction of the product's dashboard
board). Canonical use: **the Alert-Summary dashboard is one `obs-widget-grid`** wrapping every widget as an
`obs-widget-card` (`columns="12" cell-height="78" gap="10"`, `@layout-change` reflowing the charts). That
board carries gauges (Alert Count, Monitor Availability), an infrastructure severity heatmap, two pies and a
chart gallery — ~13 cards on a single 12-column grid. Props observed in real usage: `columns` · `cell-height`
· `gap` · the `layout-change` event. Treat "1 board = 1 grid" as the norm; a page rarely holds two.

## 2. Overview

A **live, user-arrangeable dashboard grid** — the surface where the end user **drags cards around, resizes
them, and expects the layout to stick**. Slot in `obs-widget-card` children carrying
`data-x`/`data-y`/`data-w`/`data-h`; the grid snaps each to a column lattice (default **12** columns),
**pushes colliding cards down**, **compacts everything upward under gravity**, and **auto-scrolls the page**
while you drag or resize a card past the current fold. On drop it writes the settled positions back onto each
card's `data-*` attributes and fires **`layout-change`** so you can persist the board (and reflow width-only
chart widgets). If the layout is **fixed and authored by you** — never rearranged at runtime — use a plain
CSS grid instead: this element carries drag/resize/collision machinery you would not use.

## 3. Anatomy

```text
 obs-widget-grid  (position: relative; height = tallest card's bottom edge)
 ┌──────────────────────────────────────────────────────────────┐
 │  ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐   │  each .cell is an absolutely-
 │  │ obs-widget-card│  │ obs-widget-card│  │  obs-widget-card │   │  positioned shadow-DOM wrapper
 │  │  (slot=c0)    │  │  (slot=c1)    │  │   (slot=c2)      │   │  holding one named slot; the
 │  └───────────────┘  └───────────────┘  │                  │   │  card is projected INTO it —
 │  ┌─────────────────────────────────┐   │                  │   │  never positioned directly.
 │  │  obs-widget-card (slot=c3)      │   └──────────────────┘   │
 │  └─────────────────────────────────┘                          │
 │        ┌ ─ ─ ─ ─ ─ ┐  ← placeholder: a dashed preview of the   │
 │        └ ─ ─ ─ ─ ─ ┘    dragged/resized card's target cell     │
 └──────────────────────────────────────────────────────────────┘
```

Each slotted card is assigned an internal `slot="cN"` and projected into a positioned `.cell` wrapper in the
grid's **own shadow DOM** — the reliable way to place a slotted element (transforming a slotted element
directly is buggy across browsers). A single dashed **placeholder** (`--nav-hover-bg` fill, `1px dashed
--primary` border) previews the target footprint during a gesture. The grid-area's height is computed from the
lowest card (`max(y + h) × unitY − gap`), so the page scrolls to fit the tallest column.

## 4. Options

| Option | What | Usage |
| --- | --- | --- |
| **12-column** (default) | `columns="12"` — the product's standard lattice; cards' `data-x`/`data-w` read on the same 12-wide grid the rest of the product uses | default |
| **custom columns** | any count — `columns="6"` for a denser/coarser board or a narrow panel; more columns for a wide wall board | as needed |
| **custom cell-height** | `cell-height` tunes row-unit height (px) grid-wide without touching card markup | as needed |
| **custom gap** | `gap` tunes the gutter (px) between cards on **both** axes | as needed |

Geometry (all derived from the measured host width `W`): `cellW = (W − (columns−1)·gap) / columns` ·
`unitX = cellW + gap` · `unitY = cell-height + gap`. A card of `data-w=w data-h=h` at `data-x=x data-y=y`
renders at `left = x·unitX`, `top = y·unitY`, `width = w·cellW + (w−1)·gap`, `height = h·cell-height + (h−1)·gap`.

## 5. Behaviors

**Idle.** Cards sit at their compacted grid positions; each transitions `transform/width/height .15s` when the
layout shifts around it.

**Sync.** On mount and on every child add/remove (a `MutationObserver` on `childList`), the grid re-reads all
`obs-widget-card` children into its item list (`data-x/y/w/h`, defaulting `0/0/4/3` if omitted) and compacts.

**Fluid.** A `ResizeObserver` on the host re-measures width and recomputes column width — the grid is fluid;
give it a block container with a real width so the column math resolves.

**Dragging (move).** A card's `card-dragstart` (dispatched from its **header**) starts `move` mode: the live
card lifts (`z-index: 50`, no transition) and follows the pointer; its grid `x` is `clamp(round(left/unitX), 0,
columns − w)` and `y` is `max(0, round(top/unitY))`; the dashed placeholder marks the target cell; colliding
cards **push down** and the board **compacts up** around the held card (`compact(fixed)` keeps the dragged card
anchored while the rest flow).

**Resizing.** `card-resizestart` (from the card's **bottom-right grip**) starts `resize` mode: the card grows
from its bottom-right corner; `w = clamp(round((w+gap)/unitX), 1, columns − x)` and `h = clamp(round((h+gap)/
unitY), 1, MAX_H)` where **`MAX_H = 40`** rows is a safety cap (so a held auto-scroll during resize can't grow
a card without bound); the placeholder previews the new footprint and neighbours reflow.

**Auto-scrolling.** While the pointer sits in the top/bottom **48px edge band** during a drag/resize, the
**nearest scrollable ancestor** (found by walking up for `overflow-y: auto|scroll` with real overflow; falls
back to the document scroller) scrolls **20px/frame** via `requestAnimationFrame`, and the drag math is
**compensated by how far it has scrolled** since the gesture began (`dy += scrollTop − startScrollTop`) — so a
card can be dragged or grown **past the current viewport fold** even while the cursor is pinned at the edge.

**Drop.** On `pointerup` the grid runs a final `compact`, **writes the settled `data-x/y/w/h` back onto each
card**, and emits **`layout-change`** once (detail = array of `{x,y,w,h}` in DOM order).

## 6. Content & writing

Nothing in the grid is text — it renders only chrome (placeholder + positioned wrappers). Authoring guidance
lives with the **cards**: give every `obs-widget-card` a real `title` (the board is navigable by content, not
by grid coordinates), and encode intended placement in `data-x/y/w/h` — not in CSS overrides. Because cards
gravity-compact upward, express layout *intent* in the origin coordinates and let the engine settle them; a
card placed at `data-y="99"` still lands directly under whatever precedes it.

## 7. Accessibility

**This is a pointer-only drag/resize surface — flag the keyboard gap honestly.** The grid moves and sizes
cards from `pointermove`/`pointerup`, driven by `card-dragstart`/`card-resizestart` (pointer gestures on the
card). There is currently **no keyboard path to rearrange or resize** a card, and **no live-region
announcement** of move/resize/drop state to assistive technology. Positioning is **presentational** — assistive
tech reads each card's own content, not its grid coordinates — so a board remains *readable* by content even
though it is not *rearrangeable* by keyboard. Mitigations today: (1) give every card a descriptive `title`;
(2) ensure the saved layout is a sensible default so a keyboard/AT user is never *forced* to rearrange to reach
content; (3) treat rearrangement as an enhancement over an already-usable static reading order. A keyboard
rearrange affordance (arrow-key move/resize with a live region) is a **known gap** for a future revision. See
`Dashboard/Widget Grid/Accessibility`.

## 8. Props / API

| Prop | Attr | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `columns` | `columns` | number \| string | `12` | Number of grid columns; cards' `data-x`/`data-w` are in these units. Coerced to a number; falls back to 12 if invalid. |
| `cellHeight` | `cell-height` | number \| string | `80` | Row-unit height (px). A card of height `h` renders `h × cell-height + (h−1) × gap` px tall. Falls back to 80. |
| `gap` | `gap` | number \| string | `10` | Gutter (px) between cells on **both** axes. `cellW = (W − (columns−1)·gap)/columns`. Falls back to 10. |

**Event** — `layout-change`: `detail` is an array of `{ x, y, w, h }`, one entry per `obs-widget-card` in DOM
order, carrying the **settled** grid positions after a drag or resize completes (fired once, on `pointerup`).
The grid **also** writes those values back onto each card's `data-x/y/w/h` attributes, so you can persist
either the event payload or read the attributes. Use it to save the board **and** to reflow chart widgets that
only auto-size on width (e.g. Highcharts reflows on width, so a taller card needs an explicit reflow on the
size change).

**Slots** — default: `obs-widget-card` children, each with `data-x`/`data-y`/`data-w`/`data-h` (column/row
origin + size in grid units; defaults `0/0/4/3` if omitted). The grid assigns every card an internal
`slot="cN"` and positions it via a shadow-DOM wrapper — **never** position or transform a card yourself. Only
`obs-widget-card` direct children are synced into the layout; other slotted elements are ignored by the engine.

**Methods** — none (positions are driven declaratively via the cards' `data-*` and read back via
`layout-change`). **CSS host:** `:host { display: block; width: 100% }`.

## 9. Design tokens used

`--nav-hover-bg` — the placeholder fill (fallback `rgba(72,89,117,.12)`). · `--primary` — the placeholder's
`1px dashed` border (fallback `#111c2c`). The grid itself paints nothing else — card surfaces, header,
severity colours, etc. are the **cards'** tokens (see [`widget-card`](./widget-card.md)). Both tokens resolve
in light and dark themes; the grid is theme-agnostic (it only positions).

## 10. Findings & inconsistencies

### F1 — Keyboard-only users cannot rearrange or resize · High · Open *(a11y)*

The gesture is pointer-driven end-to-end (`card-dragstart`/`card-resizestart` come from pointer interactions on
the card). There is no arrow-key move/resize and no live-region feedback. Content stays *readable* (positioning
is presentational), but the board is not *rearrangeable* without a pointer.

### F2 — Edge auto-scroll targets the nearest scrollable ancestor · Low · Documented

`findScrollParent` walks up for the first ancestor with `overflow-y: auto|scroll` **and** real overflow,
falling back to the document scroller. If the *intended* scroll container is not a scrollable ancestor of the
grid, dragging past the fold may scroll the document (or nothing) instead of the region you expected. **Ensure
the surface that should scroll is the grid's scrollable ancestor** (`overflow: auto/scroll`).

### F3 — Resize height is capped at `MAX_H = 40` rows · Low · By design

A deliberate safety cap so a held auto-scroll during a resize can't grow a card unboundedly. A card cannot be
resized taller than 40 row-units regardless of drag distance.

### F4 — Only `obs-widget-card` children are managed · Low · By design

Any other element slotted as a direct child is ignored by the layout engine (not positioned, not compacted).
Bodies (charts, gauges, heatmaps) belong **inside** a card's default slot, not as grid children.

## 11. Recommended solutions

**F1 (a11y):** add a keyboard affordance in a future revision — focus a card, then arrow-keys to move (with
`Shift` to resize), each step re-running `compact` and firing `layout-change`, announced via an `aria-live`
region ("Moved *Alert Count* to column 4, row 2"). Until then, always ship a sensible default layout and rely
on the cards' content order for AT. **F2:** guidance-only — make the intended scroll container the grid's
scrollable ancestor. **F3 / F4:** by design; documented so consumers don't fight them (encode height in
`data-h` up to 40; put visualisations inside a card, not as grid children).

## 12. Do / Don't

**Do:** make every child an `obs-widget-card` with `data-x/y/w/h`; give the grid a **block container with a
real width** (column width is measured from it); ensure the intended **scroll container** is the grid's
scrollable ancestor so edge auto-scroll can drag cards past the fold; **listen to `layout-change`** to persist
the board *and* reflow width-only chart widgets; let the grid **own positioning** — read settled positions from
the event detail or the cards' `data-*`.

**Don't:** don't nest a widget grid inside another widget grid; don't position/transform the cards yourself
(`left`/`top`/`transform`) — the grid places each via its own shadow-DOM wrapper (positioning a slotted element
directly is buggy across browsers); don't put non-`obs-widget-card` elements as direct children expecting
placement; don't fight the compaction — cards gravity-compact upward, so encode intent in `data-x/y`, not CSS.

## 13. Decision-grade usage

Decision flow (first match wins): **Does the END USER rearrange the layout at runtime** (drag cards, resize
them, and expect it to stick)? → `obs-widget-grid`. · **Is the layout authored by YOU and never rearranged?** →
a static CSS grid (`display: grid`) — don't pull in drag/resize/collision machinery you won't use. · **Just ONE
resizable/movable panel** (not a board of them)? → a split/panel primitive, not a grid. · **Building the
children:** each widget is an `obs-widget-card` (it emits `card-dragstart` from its header and `card-resizestart`
from its bottom-right grip — that's what the grid listens for); give the grid a block container with a real
width. · **Cards need to move past the fold?** → the grid already auto-scrolls the nearest scrollable ancestor;
just make that ancestor the real scroll container. Per-variant Use-when/Don't/Example/As-seen-in cards are
word-identical to `registry/widget-grid.json` `usageRules` and the `Dashboard/Widget Grid/Usage` page.

## 14. Related components

[`widget-card`](./widget-card.md) (the mandatory child — header drag handle + bottom-right resize grip; emits
the events the grid consumes) · [`gauge`](../registry/gauge.json), `severity-heatmap`, the chart library
(`data-viz`) — common **widget bodies** placed inside cards · a plain CSS grid (`display: grid`) — the
static-layout alternative when nothing is rearranged at runtime.

## 15. Changelog

- **2026-09-07** — Added `obs-widget-grid`: live drag/drop/resize dashboard grid — grid snap, collision
  push-down, gravity-up compaction, edge auto-scroll (48px band, 20px/frame) with scroll-compensated drag math,
  `layout-change` events, `MAX_H = 40` resize cap. Positions `obs-widget-card` children (`data-x/y/w/h`) via
  shadow-DOM wrappers + named slots (`slot="cN"`); re-syncs on child add/remove via `MutationObserver`; fluid
  columns via `ResizeObserver`. Props `columns` (12) · `cell-height` (80) · `gap` (10). Powers the Alert-Summary
  board (`columns="12" cell-height="78" gap="10"`). Full 15-section spec + decision-grade Usage authored and
  mirrored into the registry. Keyboard rearrange/resize flagged as a known a11y gap (F1) for a future revision.
