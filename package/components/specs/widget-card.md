# Widget Card (`obs-widget-card`) — Spec, Findings & Solutions

**Tier:** organism · **Source:** new (models the product `widget-title.vue` + `widget-layout.vue` chrome) ·
**Element:** `<obs-widget-card>` (framework-agnostic) · **Status:** core · **Maturity:** stable ·
**Storybook:** `Dashboard/Widget Card` · **Registry:** `registry/widget-card.json` · **Figma:** not started

## 1. Usage analytics

A **new** DS element — it has no per-file product grep count because it factors the widget *chrome* that
every dashboard tile in the product duplicates by hand (a grey title bar + an absolutely-positioned kebab +
drag/resize wiring around a chart). On the DS starter's **Alert-Summary** board it wraps **every** widget:
Infrastructure Heatmap, Monitor Availability, Alert Count, Top Network / Server Monitors, and an
eight-tile chart gallery — 13 cards, each carrying `time="1h 12m"`, each a child of one `obs-widget-grid`.
The three axes that vary in real use are: **interactive vs `static`**, **with vs without a `time` badge**,
and **the slotted body** (heatmap / gauge row / chart / table). It is always used *inside* a grid; standalone
it degrades to a plain framed card.

## 2. Overview

`obs-widget-card` is the **frame around one dashboard widget**, not the widget. It renders the repeated
chrome — a grey header with the title, a hover-revealed time badge and a hover-revealed kebab menu
(**Full Screen · Share · Edit · Clone · Remove**), a body **slot** for the actual visualization, a **drag
handle** (the whole header) and a **resize grip** (bottom-right). Crucially the card **does not own its
position or size**: on pointer-down it dispatches `card-dragstart` / `card-resizestart` (bubbling +
composed) so an `obs-widget-grid` ancestor drives the layout. With no grid listening — or with the `static`
prop — it is simply a titled card. Put the chart/gauge/heatmap in the default slot; reach for a **generic
card** for any non-dashboard surface (settings panel, KPI tile, form card).

## 3. Anatomy

```text
┌───────────────────────────────────────────────┐  ← .wcard (border --widget-border-color, radius 7px)
│  Title …ellipsised     [ 1h 12m ] [ ⋮ ]        │  ← .whead  grey bar, padding 5px 10px, = drag handle
├───────────────────────────────────────────────┤     .wtime badge + .wkebab reveal on hover/focus-within
│                                                │
│                <slot> — the body               │  ← .wbody  flex:1, overflow:hidden, pad 10px 12px 14px
│         (heatmap / gauge row / chart / table)  │
│                                             ◪  │  ← .wresize grip bottom-right (hover → opacity .6)
└───────────────────────────────────────────────┘
                                                     .wmenu (kebab-open) — absolute, top:32px right:6px, z:40
```

Parts: **card** (`--page-background-color` on a 1px `--widget-border-color` border, radius 7px) · **header**
(grey `--code-tag-background-color`, 5px/10px padding, `user-select:none`, `cursor:grab` when interactive) ·
**title** (12px / 500 / `--page-text-color`, single line, ellipsised) · **time badge** (`--neutral-lighter`
pill, 11px / `--neutral-regular`) · **kebab** (22×22 button, `ellipsisV` icon, `aria-label="Widget
options"`) · **body** (`<slot>`, clips overflow, fills remaining height) · **resize grip** (16×16
`nwse-resize` corner, striped `--neutral-light` gradient, `aria-hidden`) · **menu** (dropdown of five rows,
Remove tinted `--severity-critical`).

## 4. Options

| Variant | What | Prop | Usage |
| --- | --- | --- | --- |
| `default` (interactive) | Header = drag handle, grip bottom-right; emits `card-dragstart` / `card-resizestart` for the grid | — | every dashboard widget |
| `with-time` | Header carries a `time` badge (e.g. `1h 12m`), revealed on hover beside the kebab | `time` | common (every Alert-Summary tile) |
| `static` | Chrome only — no drag handle, no grip, no drag/resize events; a plain framed card | `static` | locked / view-only / standalone boards |

These compose freely: a card can be `static` **and** carry a `time` badge; the slotted body is orthogonal to
all three. The kebab, title header and hover behavior are present in **every** variant (the menu never
depends on `static`).

## 5. Behaviors

- **Hover / focus-within reveal.** At rest the time badge, kebab and resize grip are `opacity:0`. Hovering
  (or focusing) the card fades the badge + kebab in and the grip to `opacity:.6` (`.12s`). This is a
  discoverability trade-off — see §7.
- **Drag.** `pointerdown` on the header (**left button only**, `e.button === 0`) dispatches
  **`card-dragstart`** `{ clientX, clientY }`; the header shows `grab` → `grabbing`. The card itself never
  moves — the `obs-widget-grid` parent repositions the cell.
- **Resize.** `pointerdown` on the grip dispatches **`card-resizestart`** `{ clientX, clientY }` and
  **`stopPropagation()`** so the same gesture is not also read as a drag. The grid resizes the cell.
- **`static` short-circuits both.** When `static`, `fire()` returns early: no `grab` cursor, the grip is not
  rendered, and neither drag nor resize event is emitted.
- **Kebab menu.** Clicking the kebab toggles the menu; choosing a row emits **`action`** (the row key) and
  closes it. An outside click closes it — the handler tests `e.composedPath().includes(host)` so it works
  **across the shadow boundary**, and is bound capture-phase on `document` (cleaned up on unmount).
- **No intrinsic size.** `:host { display:block; height:100% }` — the card fills its host box. Inside a grid
  the cell (`data-x/y/w/h`) sets the footprint; standalone you must give the host an explicit width + height
  or the body has nothing to fill.

## 6. Content & writing

The **title** is a short widget name (Title Case, 1–5 words, e.g. *Infrastructure Heatmap*, *Top Network
Monitors by Alert Count*); it ellipsises on overflow, so keep it terse. The **time** badge is a compact
window label (`1h 12m`, `24h`, `7d`) describing the span the widget's data covers — not a timestamp; omit it
when the window is global to the board and already shown in the page header/timeline. The **body** holds
exactly **one** visualization; don't stack unrelated widgets in a single card. The menu labels are fixed
(Full Screen · Share · Edit · Clone · Remove) — consumers act on the `action` key, they don't relabel rows.

## 7. Accessibility

The kebab button carries **`aria-label="Widget options"`**; the resize grip is **`aria-hidden`** decoration;
title and badge are plain text. Provide a meaningful `title` so each widget is identifiable to assistive
tech. The slotted body owns its **own** data-accessibility (table semantics, chart alt text, gauge labels) —
the card is chrome only.

Known weaknesses (see §10): (a) the time badge + kebab are **hover/focus-revealed**, weak discoverability —
never place a widget's *only* action in the kebab; (b) the menu rows are `<a>` elements without `href`,
`role="menu"`/`menuitem` or roving tabindex, so they are not keyboard-focusable and screen-reader menu
navigation is limited; (c) drag (header) and resize (grip) are **pointer-only** (`pointerdown`, left button)
— there is no keyboard path to move or resize a widget. See `Dashboard/Widget Card/Accessibility`.

## 8. Props / API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | string | `''` | Widget title in the grey header — single line, ellipsised on overflow |
| `time` | string | `''` | Hover-revealed time-range badge (e.g. `1h 12m`). Empty → no badge rendered |
| `static` | boolean | `false` | Chrome only: hides the grip, drops the `grab` cursor, suppresses `card-dragstart` / `card-resizestart` |

**Events** (all `bubbles: true, composed: true`):

| Event | Detail | Fires |
| --- | --- | --- |
| `card-dragstart` | `{ clientX: number, clientY: number }` | `pointerdown` on header (left button, non-`static`) — grid begins a drag |
| `card-resizestart` | `{ clientX: number, clientY: number }` | `pointerdown` on grip (left button, non-`static`) — `stopPropagation`, grid begins a resize |
| `action` | `string` — `'fullscreen' \| 'share' \| 'edit' \| 'clone' \| 'remove'` | a kebab row chosen. Emitted as a Vue emit **and** dispatched as a composed CustomEvent; menu closes |

**Slot:** `default` = the widget **body** (the visualization the card frames). The body area clips overflow
and fills the remaining height under the header. **CSS:** `:host { display:block; height:100% }` — the card
takes its footprint from the host box (a grid cell, or an explicit width/height when standalone).

## 9. Design tokens used

Frame: `--page-background-color` (card bg), `--widget-border-color` (border), `--font-family`. Header:
`--code-tag-background-color` (grey bar), `--page-text-color` (title). Badge / kebab: `--neutral-lighter`
(badge bg + kebab hover), `--neutral-regular` (badge text + kebab icon). Grip: `--neutral-light` (stripes).
Menu: `--dropdown-background`, `--border-color`, `--neutral-shadow-light` (shadow),
`--dropdown-hover-background` (row hover), `--severity-critical` (the Remove row + its icon). Every surface
inherits a theme token — never hardcode the grey header or menu colours.

## 10. Findings & inconsistencies

### F1 — Position/size are not owned by the card · By design · Info

The card only *signals* drag/resize (`card-dragstart` / `card-resizestart`); it never repositions itself.
With no `obs-widget-grid` ancestor listening, those events go nowhere and the card stays put. This is
intentional (the grid owns layout + collision + gravity), but it means a bare `obs-widget-card` looks
"broken" if you expect it to drag. **Use `static`** on standalone cards to hide the affordances that won't
do anything.

### F2 — Kebab menu is not a real ARIA menu · Low · Open

Rows are `<a>` elements without `href`, so they are **not keyboard-focusable** and there is no
`role="menu"`/`menuitem`, no roving tabindex, and no arrow-key navigation. Mouse users are fine; keyboard /
screen-reader menu semantics are absent.

### F3 — Drag & resize are pointer-only · Low · Open

Both gestures are `pointerdown`-driven with no keyboard equivalent, so a keyboard-only user cannot rearrange
the board. Acceptable for a mouse-first dashboard editor, but arrangement should not be the *only* way to
achieve a task.

### F4 — Hover-only reveal of the badge + kebab · Low · By design

The time badge and kebab appear only on hover / focus-within. It keeps the board calm, but it hides the
menu until interaction — don't route a widget's sole action through it.

## 11. Recommended solutions

**F1:** guidance-only — always nest interactive cards in an `obs-widget-grid`; use `static` when there is no
grid. **F2:** if keyboard menu access becomes required, promote rows to `<button role="menuitem">` with a
roving tabindex and arrow-key handling on a `role="menu"` container; low priority while the kebab holds only
secondary actions. **F3:** add optional keyboard nudge (arrow keys move / resize the focused card) at the
`obs-widget-grid` level, not the card. **F4:** keep the reveal, but never make the kebab the *only* path to a
widget action — surface load-bearing controls in the body or page chrome.

## 12. Do / Don't

**Do:** put the visualization in the default slot (the card is chrome, not content) · give the card a size
(grid cell, or explicit host width + height standalone) · nest it in an `obs-widget-grid` so
`card-dragstart` / `card-resizestart` actually drive layout · set `time` to the window the data covers ·
use `static` on locked / view-only / standalone cards · let the header, badge, kebab and grip inherit theme
tokens.

**Don't:** use it as a generic content card (reach for a plain card off-dashboard) · wire your own
drag/resize handlers onto it (the grid owns that; the card only signals start) · render it with no size and
expect the body to show · stuff multiple unrelated widgets into one card · rely on the kebab/time being
visible at rest or put a widget's only control there.

## 13. Decision-grade usage

Decision flow (first match wins): **not a dashboard widget** (settings panel, KPI tile, form card) → a
generic card, *not* this · **locked / view-only / standalone** (no rearrange) → `obs-widget-card static` ·
**many widgets the user arranges** → each `obs-widget-card` inside one `obs-widget-grid` (consumes
`card-dragstart` / `card-resizestart`) · **the chart/gauge/heatmap itself** → a separate element
(`obs-gauge`, `obs-severity-heatmap`, a chart) placed in the body slot; the card never renders data ·
otherwise a single titled, draggable, resizable widget → `obs-widget-card` with the visualization slotted.
Per-variant Use-when / Don't / Example / As-seen-in cards are word-identical to `registry/widget-card.json`
`usageRules` and the `Dashboard/Widget Card/Usage` page.

## 14. Related components

`Widget Grid` (`obs-widget-grid` — the parent that consumes `card-dragstart` / `card-resizestart`, snaps to
12 columns, handles collision + gravity + autoscroll; a card is meaningless without it once you want
drag/resize) · `Gauge` (`obs-gauge` — Monitor-Availability / Alert-Count dials that sit in the body) ·
`Severity Heatmap` (`obs-severity-heatmap` — the honeycomb body) · **Charts / Data-viz** (the line / bar /
pie / area gallery rendered into a card body). The card frames all of them; it renders none of them.

## 15. Changelog

- **2026-09-07** — Added `obs-widget-card`: dashboard widget chrome — grey header (`title` + hover `time`
  badge + hover kebab: Full Screen / Share / Edit / Clone / Remove), body slot, header drag handle +
  bottom-right resize grip. Emits `card-dragstart` / `card-resizestart` (bubbling + composed) for
  `obs-widget-grid`, plus `action` for the kebab rows. `static` prop opts out of drag/resize. Header padding
  5px/10px. Used across the Alert-Summary board (heatmap, gauges, TopN, chart gallery). Spec + registry +
  showcase manifest authored; audit + registry-validation gates green.
</content>
</invoke>
