# Tooltip (`MTooltip`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule |
| **Maturity** | 🟢 Stable |
| **Source** | `src/components/_base-tooltip.vue` (Floto override — the kit `MTooltip` is **excluded** in the preview/app and this ships instead). Renders via **VTippy** (vue-tippy). |
| **Storybook** | Molecules/Tooltip |
| **Registry** | [`registry/tooltip.json`](../registry/tooltip.json) |
| **Family** | [Popover / Tooltip](../family-map.md) |

## Usage analytics

- **94×** across the app. The dominant pattern is an **info-circle icon trigger + a short text
  hint**.
- **Placement (VTippy names):** `top-start` (default) **73×** · `top` 11× · `left` 6× ·
  `bottomRight` 2× · `topLeft`/`right` 1×. The default dominates.
- Overlay-class variants: `chart-like-tooltip` (2×, chart-surface background), `noc-dashboard-tooltip` (1×).
- **Sibling tooltip mechanisms (intentional):** native **`title=""`** attribute (~59× — browser
  tooltip for plain/truncated text), the **`v-tooltip` directive** (1×, negligible), the **data-viz
  tooltips** (Highcharts `TooltipBuilder` chart tooltip + sparkline + `heatmap-tooltip.vue` — see
  **Molecules/Data-Viz Tooltips**), and **graph/topology tooltips** (vis-network/d3 edge & node).
  **The product has 7 distinct tooltip kinds** — full taxonomy on the Data-Viz Tooltips Usage page.

## Overview

A **transient, non-interactive label** revealed on **hover/focus**, anchored to a trigger. Note
the project **overrides the kit tooltip**: `main.js`/preview exclude `MTooltip` from the kit and
register the Floto `_base-tooltip.vue`, which renders through **VTippy** (vue-tippy) rather than
Ant `a-tooltip`. Use it for brief hints; for anything the user clicks or types into, use
**`MPopover`**.

## Anatomy

- **Trigger** (`trigger` slot) — the anchored element (commonly an `info-circle` `MIcon`).
- **Bubble** — the floating content (default slot), **no arrow** (`:arrow="false"`), animation
  `shift-toward`, appended to the closest `.__panel` or `document.body`.

## Options (props)

| Prop | Default | Notes |
| --- | --- | --- |
| `placement` | `top-start` | VTippy placement (`top`/`bottom`/`left`/`right` + `-start`/`-end`) |
| `disabled` | `false` | short-circuits — renders the trigger inline, no tooltip |
| `trigger` | `hover focus` | **declared but not wired to VTippy (F1)** |
| `overlayClassName` | — | e.g. `chart-like-tooltip` |
| `getPopupContainer` | — | defaults to closest `.__panel` or `document.body` |

## Behaviors

- Shows on **hover/focus**; `interactive:true` lets the pointer move onto the bubble without it
  closing. `lazy:true` defers creation until first trigger.
- `disabled` is the supported on/off switch (not the `trigger` prop).

## Content & writing

- Brief, plain hints — a phrase or one sentence. No interactive controls.

## Accessibility

- **Keyboard/SR:** the bubble content is **not** associated with the trigger via
  `aria-describedby`, and icon-only triggers have **no accessible name** — screen-reader users
  may miss the hint (**F3**). Recommended: add `aria-label` to icon triggers and wire
  `aria-describedby` to the bubble id.
- **Focus ring:** removed on the overlay (`:focus { outline:none }` in `_base-popper.less`) — see
  [SF-001](../../findings/SF-001-focus-visible.md) (**F2**).
- Tooltips appear on **focus** too (good), but the missing aria wiring limits SR value.

## Props / API

See the table above and [`registry/tooltip.json`](../registry/tooltip.json).

## Design tokens used

`--tooltip-background-color` · `--tooltip-text-color` · `--tooltip-box-shadow` · `--border-color`
· `--chart-tooltip-background` (chart variant).

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low | Open | `trigger` prop declared (default `hover focus`) but **not passed to VTippy** — changing it does nothing. |
| F2 | Medium (a11y) | Open | No focus ring on the overlay — links to **SF-001**. |
| F3 | Medium (a11y) | Open | Tooltip content not linked via `aria-describedby`; icon-only triggers lack an accessible name. |

## Recommended solutions

- **F1:** either bind `:trigger="trigger"` on `<VTippy>` or remove the dead prop.
- **F2:** adopt the `:focus-visible` ring from SF-001.
- **F3:** add `aria-label` to icon triggers; generate a bubble id and set `aria-describedby` on the
  trigger when the tooltip is open.

## Do / Don't

- **Do** keep content brief and non-interactive; use the info-circle idiom; use `:disabled` when
  the hint is redundant.
- **Don't** put buttons/links/inputs in a tooltip (it dismisses on mouse-out) — use **Popover**;
  don't rely on the `trigger` prop to change activation (F1).

## Related components

`MPopover` (interactive panel) · `FlotoDropdownPicker` (select) · `MModal` (dialog).

## Changelog

- **2026-06-11 (nth-level audit)** — Documented the **three intentional tooltip kinds** (native
  `title=` ~59×, `MTooltip` 94×, graph/canvas tooltips), the real placement distribution
  (`top-start` 73× default · `top` 11× · `left` 6×), and the VTippy-vs-Ant placement-name split.
- **2026-06-11** — Added (decision-grade Usage). Deep-dive of `_base-tooltip.vue` (94×, VTippy
  override). Stories: Basic (info idiom) · Placements · Disabled · Rich content · Playground —
  verified the bubble shows on hover with the hint text, no console errors. Findings F1 (dead
  `trigger` prop), F2 (focus → SF-001), F3 (aria wiring).
