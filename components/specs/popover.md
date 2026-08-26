# Popover (`MPopover`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule |
| **Maturity** | 🟢 Stable |
| **Source** | `ui/components/Popover/Popover.vue` (kit; wraps Ant `a-popover`). Positioning primitive: `src/components/_base-popper.vue` (**MPopper**, wraps `v-popover`). |
| **Storybook** | Molecules/Popover |
| **Registry** | [`registry/popover.json`](../registry/popover.json) |
| **Family** | [Popover / Tooltip](../family-map.md) |

## Usage analytics

- **MPopover 35×** · **MPopper 2×** (direct — but MPopper also powers **FlotoDropdownPicker**'s
  positioning, so its real footprint is much larger).
- Patterns: **action/kebab menus** (`_base-grid-actions.vue`), **color picker**
  (`color-picker.vue`), **date/time pickers**, rich panels, **"+N overflow" hover reveals**
  (`tags-list.vue`). Overlay classes: `picker-action-dropdown`, `color-picker-popover`,
  `picker-overlay`, `readable-content-overlay`.
- **Opening behavior:** `trigger` — **click 20×**, **hover 13×** (passive reveals), explicit
  click 2×. Transition: **`transition-name="slide-up"` 16×**.
- **Placement (Ant names):** **`bottomLeft` 11×** (most common) · `bottomRight` 9× · `bottom` 7× ·
  `leftTop` 4× · `top`/`right` 1×. Default `bottom`. ⚠️ Ant names — **not** the Tooltip's VTippy
  `top-start` names.

## Overview

A **click-triggered floating panel** anchored to a trigger, holding **interactive** content —
unlike a Tooltip (hover, non-interactive). `MPopover` wraps Ant `a-popover`; **`MPopper`** is the
lower-level `v-popover` primitive used as the picker positioning engine. Use a Popover for
anchored menus/pickers/mini-forms; for a center-interrupting task use **`MModal`**, and for
select-from-options use **`FlotoDropdownPicker`**.

## Anatomy

- **Trigger** (`trigger` slot, scope `{ hide, show, toggle }`) — the anchor.
- **Title** (optional `title` slot) — a header row.
- **Content** (default slot, scope `{ hide, show, toggle }`) — the interactive panel.

## Options (props)

| Prop | Default | Notes |
| --- | --- | --- |
| `trigger` | `click` | `click` / `hover` / `focus` / `contextmenu` |
| `placement` | `bottom` | `bottom` / `bottomRight` / `top` / `left` / `right` … |
| `visible` | — | controlled mode; pair with `@visibleChange` (one-way — F1) |
| `overlayClassName` | — | e.g. `color-picker-popover`, `picker-action-dropdown` |
| `overlayStyle` | — | inline overlay style (width/padding/radius) |
| `destroyTooltipOnHide` | `true` | re-creates content each open |
| `getPopupContainer` | — | defaults to closest `.__panel` or `document.body` |

## Behaviors

- Opens on **click** by default; the slot scope `{ hide, show, toggle }` lets content drive
  dismissal (an action item calls `hide()` on select).
- `destroyTooltipOnHide` re-mounts the content each open (fresh state).
- **MPopper** adds a ResizeObserver to keep the panel positioned as content resizes; boundary is
  the closest `.__panel` or the viewport.

## Content & writing

- Title is a short noun; content is the interactive panel. Keep menus to a handful of items —
  beyond ~7, reconsider the pattern.

## Accessibility

- **Disclosure semantics missing (F2):** the trigger has no `aria-haspopup`/`aria-expanded`,
  focus is **not** moved into the panel on open, and there is **no focus trap** — keyboard/SR
  users aren't told a panel opened or guided into it. Recommended: set `aria-haspopup` +
  `aria-expanded` on the trigger; move focus to the first focusable on open; restore on close.
- **Focus ring** removed on the overlay (`:focus { outline:none }` in `_base-popper.less`) —
  **F3**, links to [SF-001](../../findings/SF-001-focus-visible.md).
- Escape/outside-click dismissal comes from `a-popover`; verify Escape returns focus to the trigger.

## Props / API

See the table above and [`registry/popover.json`](../registry/popover.json).

## Design tokens used

`--page-background-color` · `--border-color` · `--page-text-color` (panel surface/border/text).

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low | Open | `visible` is one-way — controlled mode needs an explicit `@visibleChange` handler to stay in sync. |
| F2 | Medium (a11y) | Open | No `aria-haspopup`/`aria-expanded`, no focus move into the panel, no focus trap. |
| F3 | Medium (a11y) | Open | No focus ring on the overlay — links to **SF-001**. |

## Recommended solutions

- **F1:** document/standardize the controlled pattern (`:visible` + `@visibleChange`), or expose a
  `v-model:visible`.
- **F2:** add disclosure ARIA + focus management (move in on open, restore on close, Escape closes).
- **F3:** adopt the `:focus-visible` ring from SF-001.

## Do / Don't

- **Do** use for interactive, click-triggered content; give items a `hide()` on select; anchor row
  actions `bottomRight`.
- **Don't** use for plain hints (use **Tooltip**); don't use for center-interrupting tasks or
  confirmations (use **Modal**); don't hand-roll a select dropdown (use **FlotoDropdownPicker**).

## Related components

`MTooltip` (hover label) · `FlotoDropdownPicker` (select; uses MPopper) · `MModal` (dialog).

## Changelog

- **2026-06-11 (nth-level audit)** — Documented the real opening/placement behavior: `trigger`
  click 20× / **hover 13×** (+N overflow reveals), `transition-name="slide-up"` 16×, placement
  **`bottomLeft` 11×** (most common) / `bottomRight` 9× / `leftTop` 4×; Ant placement names (not
  VTippy). Added **Behavior: hover trigger** + **Placements** stories.
- **2026-06-11** — Added (decision-grade Usage). Deep-dive of `Popover.vue` (35×, kit `a-popover`)
  and `_base-popper.vue` (MPopper, the picker engine). Stories: Basic (title + content) · Action /
  kebab menu · Rich panel (color picker) · Playground — verified click-open with title + items, no
  console errors. Findings F1 (one-way `visible`), F2 (disclosure ARIA + focus), F3 (focus → SF-001).
