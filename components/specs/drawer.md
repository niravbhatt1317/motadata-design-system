# Drawer (`FlotoDrawer`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Organism (overlay) |
| **Maturity** | 🟢 Stable — the product's most-used overlay |
| **Source** | `src/components/_base-drawer.vue` (global `FlotoDrawer`, wraps kit `MDrawer` → Ant `a-drawer`); form variant `src/components/crud/_base-drawer-form.vue` |
| **Storybook** | `Organisms/Drawer` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/drawer.json`](../registry/drawer.json) |
| **Family** | overlays — sibling of [Modal](./modal.md); `FlotoDrawerForm` is the form variant |
| **Figma** | TODO |

## Usage (product analytics)

- **`FlotoDrawer` 99×** + **`FlotoDrawerForm` 59×** = **158×** — the **most-used overlay**
  (more than `MModal` 39 + `FlotoConfirmModal` 71 combined).
- `open` 27× · `width` 14× (default 40%).
- Dozens of app-specific `*Drawer` composites (IncidentDetails, SyncApproval, RunbookApproval,
  FirmwareUpgradeApproval, CredentialSelection, CatalogSelection, AttachRules, ViewDetail, …).

## Overview

A **slide-in side panel** (from the right) over a backdrop. Use it for **detail views, edit
forms, and record-contextual content** that's too long or too rich for a centered modal. Open
via the **`open`** prop (toggles) or a **`trigger`** slot. `FlotoDrawerForm` = `FlotoForm`
(vertical) + `FlotoDrawer` for the common Add/Edit-in-a-drawer flow.

## Anatomy

```text
                              ┌──────────────────────────┐
                              │  Title              [×]   │  ← title slot (text-primary) + built-in ×
                              │  ───────────────────────  │
   (blurred backdrop)         │  Body (scrollable —       │  ← default slot, scrolls via FlotoScrollView
                              │  FlotoScrollView)         │
                              │  ───────────────────────  │
                              │            [Cancel][Save] │  ← actions slot (60px fixed footer)
                              └──────────────────────────┘
```

## `obs-drawer` (DS element) — variants & when to use

`<obs-drawer>` is a slide-in side panel on the native `<dialog>` (`showModal`: top-layer, focus-trap, Esc)
with a **blur-only backdrop** (no dark scrim, matching the product), square inner corners, and a slide
transition. It composes `obs-button` (footer) + `obs-icon` (✕). Open with the `open` prop or `el.show()`/
`el.hide()`; **it never auto-opens** and **only one overlay (drawer/modal) is open at a time**.

| Variant | Turn it on with | Use when |
| --- | --- | --- |
| **detail / form** (default) | `width="480"` (or 40%) + a `footer` preset | a focused detail panel or an edit form, contextual to a record |
| **placement** | `placement="right"` (default) / `"left"` | which edge it slides from |
| **width tiers** | `width="360"`/`40%` · `50–70%` · `85–96%` | simple panel · richer editor · **large multi-pane** wizard (a wide drawer, NOT a modal) |
| **multi-pane** | `scrolled-content="false"` | a large drawer whose columns each scroll independently (left nav + main + reference), e.g. registration wizards |
| **padded body** | `use-padding` | extra horizontal body padding for plain text/forms |

**Footer presets** (`footer=` — used when the `actions` slot is empty; Save/Reset/Delete/Back emit
`footer-action` `{action}`, Cancel/Close close it):
`close` · `cancel-save` · `reset-cancel-save` · `delete-split` (destructive left, Cancel/Save right) ·
`note-split` (a "* fields are mandatory" note + Back/Cancel/Save). Or provide your own via the `actions` slot.

**Behaviour:** `esc-closable` (default true) · `mask-closable` (default **false** — the backdrop does NOT
close, to avoid losing form input). Events: `open` · `close` · `after-close` (slide-out ended) ·
`footer-action` `{action}`.

**Drawer vs the rest:** long/complex or **record-contextual** content (details, edit-in-place, multi-pane
wizards) → **drawer**. A short interrupting task / yes-no confirm → **`obs-modal`**. A whole record with many
sections or deep-linkable → a **full page/route**. A small anchored value picker → a **popover/dropdown**.

## Widths / sizes (the full range)

`width` (default **40%**) spans a real range in the product:

| Width | Use |
| --- | --- |
| `360`px / 40% | simple detail / form panels (default) |
| 50–70% | richer content / editors |
| **85–96%** (`width="90%"` ~24×, plus `96%` / `85%` / `100%`) | **large / full-screen drawers** for complex **multi-pane** flows — a left nav + main scrollable form + a right reference panel (e.g. **APM Application Registration** at `width="96%"`). Use a wide drawer (not a modal) for rich config/registration wizards. See the **Large / full-screen** story. |

## Options / API

**FlotoDrawer:** `open` (Boolean, toggles) · `width` (px/%, default **40%**) ·
`scrolledContent` (default **true** → wraps the body in `FlotoScrollView`) · `usePadding` ·
plus Ant `a-drawer` attrs via `$attrs` (e.g. `placement`). Slots: **`trigger`**
(`{ open, close, toggle }`) · **`title`** / `title-row` · default (body) · **`actions`**
(`{ hide }`, a fixed footer). Emits **`show`** / **`hide`**.

**FlotoDrawerForm:** `open` · `width` (40%) · `scrolledContent`. Slots: `trigger` · `header` /
`header-row` · default (body, gets `submit`) · `actions` (`{ hide, submit }`). It wraps a
vertical `FlotoForm` and **suppresses `MForm`'s default Submit** (`<template #submit><span/>`),
so only the footer submits.

**`obs-drawer` element props:** `open` (reflects `el.open`) · `title` · `width` (px/%; default 40%) ·
`placement` (right | left) · `scrolled-content` (default true; `="false"` → multi-pane) · `use-padding` ·
`mask-closable` (default false) · `esc-closable` (default true) · `footer` (preset — see above). Methods:
`el.show()` / `el.hide()`. Slots: `title` · default (body) · `actions` (footer). Or `[data-close]` on any
slotted element closes the drawer.

## Behaviors

- **Open/close:** `open` prop / `trigger` slot; the drawer has a **built-in close ×** (Ant
  `a-drawer`, unlike `MModal`), plus the actions footer. **`maskClosable: false`** — clicking
  the backdrop doesn't close (avoids losing form input).
- **Scroll:** the body scrolls inside the panel (`scrolledContent` → `FlotoScrollView`); the
  title and actions footer stay pinned. With an `actions` slot, the body reserves ~65px at the
  bottom for the footer.
- **`@hide`** fires ~500ms after close (after the slide-out animation).

## Accessibility

- Ant `a-drawer` — `role="dialog"`, focus trap, **built-in close ×** (a real, discoverable
  dismiss — better than `MModal`, which has none). Escape closes.
- ⚠️ No visible focus ring inside ([SF-001](../../findings/SF-001-focus-visible.md)).
- Give the drawer a clear **title** describing the record/task.

## Findings & Inconsistencies

### F1 — `@hide` is delayed ~500ms · Low · Documented

`handlevisibleChange` emits `hide` after a 500ms `setTimeout` (to let the slide-out animation
finish). Parents toggling `open` off should account for the delay (the panel lingers briefly).
Not a bug — document so consumers don't double-handle.

### F2 — No visible focus ring · High · Open *(a11y)* → [SF-001](../../findings/SF-001-focus-visible.md)

System-wide; matters in a focus-trapped panel.

### F3 — `.actions` footer has no inter-button gap · Low · Open

The `.actions` bar is `display:flex; justify-content:flex-end` but sets **no gap**, so adjacent
footer buttons **touch** (measured 0px) unless you add **`mr-2`** to the non-last button (the
product convention, e.g. `instance-grid`). **Solution:** add `gap: 8px` (or `& > * + * { margin-left }`)
to `.actions` in `drawer.less`; until then, put `class="mr-2"` on every button except the last.

## Footer actions — button layout (2 / 3 / 4)

The footer/`actions` bar is **right-aligned** (`justify-content: flex-end`), buttons spaced
with **`mr-2`** (8px) on the non-last. Layout by count:

| Count | Layout |
| --- | --- |
| **2** | `[ … Cancel  Save ]` — Cancel `mr-2`, primary far-right |
| **3** | all right-aligned (`Reset · Cancel · Save`, `mr-2` gaps) — **or** split: a **destructive** action (Delete) on the **left**, the confirm group (Cancel + Save) on the right (`justify-between`) |
| **4** | **split** — a tertiary action or a "* mandatory" note on the **left**, the confirm group on the right; beyond this, move rarely-used actions into a menu |

Rules: **primary far-right**, **Cancel** immediately to its left; **destructive / tertiary /
notes go left** (separated from the confirm group). See the **Footer actions** story.

## Do / Don't

### Do

- Use a Drawer for **detail views, edit forms, and long/record-contextual content**.
- Use **`FlotoDrawerForm`** for Add/Edit forms (vertical form + validation + footer submit).
- Put primary/secondary actions in the **`actions`** footer (Cancel left, Save right).

### Don't

- Don't use a Drawer for a **short confirmation** — use **`FlotoConfirmModal`**.
- Don't rely on backdrop-click to close (disabled) — use the × or a footer Cancel.
- Don't add an `MForm` inside without suppressing its default Submit (two submit buttons).

## Related

[Modal](./modal.md) (`MModal` / `FlotoConfirmModal`) · `FlotoDrawerForm` (form variant) ·
`FlotoForm` / `FlotoFormItem` (fields inside) · `MButton` (footer actions).

## Changelog

- **2026-07-14** — Full element docs pass: added the "obs-drawer — variants & when to use" table (detail/
  form · placement · width tiers · multi-pane via `scrolled-content=false` · use-padding), the footer
  presets, the element props list, the behaviour (esc/mask-closable, events), and the drawer-vs-modal-vs-
  page-vs-popover routing. Overlay guarantees verified: never auto-opens, one overlay open at a time, closed
  drawer is `display:none` (no stacking). Uses the shared single-overlay registry with obs-modal.
- **2026-06-08** — Added (decision-grade Usage) — the **Drawer**, the product's most-used
  overlay (158×). Deep-dive of `_base-drawer.vue` (99×) + `FlotoDrawerForm` (59×): `open`-prop /
  `trigger` opening; `title` / body (scrollable via `FlotoScrollView`) / `actions` (fixed
  footer) slots; `width` default 40%; built-in × with `maskClosable:false`. Registered
  `FlotoDrawer` and `FlotoScrollView` in the preview; verified Basic (slide-in, title, actions,
  backdrop) and a Form drawer (2 fields, Cancel/Save). Findings F1 (delayed `@hide`), F2
  (focus → SF-001).
- **2026-06-11** — Reworked the **Large / full-screen** story for real fidelity. Read the actual
  `apm-application-registration-drawer.vue` end-to-end: it's `width="96%"` `:scrolled-content="false"`
  with a **2 : 6 : 4 `MRow`** body — a tinted deployment **nav** (`--drawer-sidebar-background`,
  selected on `--code-tag-background-color`), a **sectioned form** column (`--dashboard-background`,
  `section-heading`+`helper-text` split by **dividers**, ending in an *Apply Configuration* button),
  and a **right info** column (`vertical-line` headings + supported-tech **data tables** + a bordered
  **Verification** box, each column scrolling independently). The prior story was a loose 3-div
  approximation; replaced it with a faithful reproduction. Verified headless: drawer = 1382px (96%
  of 1440), columns render 230 / 691 / 461px (17 / 50 / 33%) side-by-side, no console errors. The
  left-nav uses the **real brand icons** (`vm` / `docker` / `kubernetes`, prefix `fal`) — already
  in `src/assets/icons/icons.js` and registered via the preview's `@assets/icons` import (verified
  each resolves to a real SVG path).
- **2026-06-11** — Replaced the story's inline one-off styles with **shared DS primitive classes**
  (`.ds-section-heading` / `.ds-helper-text` / `.ds-divider` / `.ds-accent-bar` / `.ds-panel` /
  `.ds-panel-heading` / `.ds-nav-item` / `.ds-spec-table`) — new file
  [`storybook/ds-primitives.less`](../../storybook/ds-primitives.less), loaded in the preview, mapped
  1:1 from the product's scoped classes. See [`ds-primitives.md`](../ds-primitives.md). Verified
  headless that each class resolves to the **same** token-derived computed value as the prior inline
  style (14px/600, `--primary` accent, `--border-color` divider, `--help-card-bg-color` panel, etc.)
  — zero visual change, now real reuse. Interactive pieces remain the real components (FlotoDrawer,
  MRow/MCol, MRadioGroup, FlotoFormItem, MButton, MIcon).
