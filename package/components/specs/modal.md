# Modal (`MModal`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Organism (overlay) |
| **Maturity** | 🟢 Stable (core dialog) |
| **Source** | `@motadata/ui` → `ui/components/Modal/Modal.vue` (wraps Ant `a-modal`); confirm variant `src/components/_base-confirm-modal.vue` |
| **Storybook** | `Organisms/Modal` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/modal.json`](../registry/modal.json) |
| **Family** | overlays — `MModal` (dialog) · `FlotoConfirmModal` (confirm) · **`FlotoDrawer`** (side panel, 158× — own entry) |
| **Figma** | TODO |

## Usage (product analytics)

- **`MModal` 39×** · **`FlotoConfirmModal` 71×** (the confirm dialog) · **`FlotoDrawer` 158×**
  (slide-in panel — the most-used overlay) · `FlotoDrawerForm` 59×.
- ~40 app-specific `*Modal` / `*Drawer` composites (AnomalyModal, IncidentDetailsDrawer, …).

## Overview

A centered **dialog** over a dimmed backdrop. `MModal` is the base; **`FlotoConfirmModal`** is
the confirm/destructive-action variant built on it. Open it via the **`trigger`** slot (which
gives an `open` fn) or, for the confirm, the **`open`** prop. Mounts in a portal on `body`.

## Anatomy

```text
        ┌───────────────────────────────┐
        │  Title                    ✕    │   ← header: --primary title + close ✕
        │  ─────────────────────────────│
        │  Body (default slot, 24px)     │
        │  ─────────────────────────────│
        │           [Cancel]  [ Save ]   │   ← footer: Cancel + confirm (divider on top)
        └───────────────────────────────┘
                (dimmed, blurred backdrop)
```

## `obs-modal` (DS element) — variants & when to use

`<obs-modal>` is a centered dialog built on the native `<dialog>` (`showModal`: top-layer, focus-trap,
Esc, `::backdrop` for free). It composes `obs-button` (footer) + `obs-icon` (✕ / confirm icon). Open it
with the **`open`** prop or `el.show()`/`el.hide()`; **it never auto-opens** and **only one overlay
(modal/drawer) is open at a time** (opening one closes the other).

| Variant | Turn it on with | Use when |
| --- | --- | --- |
| **default** | (nothing) — title + body + Cancel/Save footer | a focused short task/form that must interrupt |
| **confirm** | `variant="confirm"` + `icon` + `confirm-variant` | a yes/no or **destructive** confirmation (FlotoConfirmModal) — a coloured-border card, icon in a coloured circle (left), message + left-aligned Cancel/confirm (outline) on the right |
| **hide-footer** | `hide-footer` | read-only / detail content — the header ✕ is the way out |
| **no-padding** | `no-padding` | a full-bleed body (a list/grid manages its own padding) |
| **scrollable** | `scrollable` | long content — a fixed-height body scrolls, header/footer stay pinned |
| **restrict-width / width** | `restrict-width` (1020px) or `width="400"` | side-by-side / comparison content (wide); a narrow confirm (small) |

**Confirm sub-props:** `confirm-variant` (primary | error) · `confirm-text` (default "Save") ·
`cancel-text` (default "Cancel") · `icon` (a DS icon name, e.g. `trash`).
**Behaviour:** `esc-closable` (default true) · `mask-closable` (default **false** — the backdrop does NOT close).

**Composition patterns (not new props — build them in the body):**

- **View ↔ edit record** — toggle a read-only view (`obs-key-value` + an Edit button) and an edit form
  (`obs-input block` fields + Cancel/Save). The product `is-view` pattern.
- **Compare** — a `restrict-width` (1020px) modal holding side-by-side `obs-key-value` panels.

**Events:** `show` / `hide` · `confirm` (footer confirm) · `cancel` (Cancel / ✕ / Esc) · `close`.

**When NOT a modal:** long/complex or record-contextual content → **`obs-drawer`**; a whole record with many
sections / deep-linkable → a **full page/route**; a small anchored value picker → a **popover/dropdown**;
a brief status message → a **notification**.

## Options / API

**MModal:** `width` (px/%) · `centered` · `confirmLoading` (spinner on Ok during async) ·
`preventAutoCloseOnConfirm` · `overlayClassName`. Slots: **`trigger`** (`{ open, close, toggle }`)
· `title` · default (body) · **`footer`** (`{ cancel, success }`). Emits **`success`** / **`cancel`**.

**FlotoConfirmModal:** `open` (Boolean, toggles) · `variant` (default `error`) · `width` (450) ·
`successText` ('Yes') · `cancelText` ('No') · `hideIcon` · `iconShadow` · `disableAutoHide`.
Slots: `icon` · `message` · `header` · `cancel-action` / `confirm-action`. Emits `confirm` / `hide`.

**`obs-modal` element props:** `open` (reflects `el.open`) · `title` · `width` (px/%; ignored for confirm) ·
`variant` (default | confirm) · `icon` · `confirm-variant` (primary | error) · `confirm-text` · `cancel-text` ·
`hide-footer` · `no-padding` · `scrollable` · `restrict-width` · `esc-closable` (default true) ·
`mask-closable` (default false). Methods: `el.show()` / `el.hide()`. Single default slot (body / confirm message).

## Header pattern (the product convention)

Because MModal's built-in × is off, **real modals add their own header** in the `title` slot —
a flex row with a **`text-primary` (navy) title** on the left and a **close ×** (`MIcon name="times"`
wired to the modal's `hide()`) on the right. ~26 modals do this. Always include this header ×
**or** a footer Cancel so there's a visible way out (F1).

## Overlay variants (`overlay-class-name`)

Real, used modal style variants (defined in `src/design/modal.less`):

| Class | Effect | Usage |
| --- | --- | --- |
| `hide-footer` | removes the footer (read-only / detail modals) | 4× |
| `scrollable-modal` | fixed-height **flex-column** body (top 50px, rounded header) — the body itself has **no `overflow`**, so wrap the content in a `flex:1; min-height:0; overflow-y:auto` child (else it spills out, F3) | several |
| `scrollable-modal.restrict-width` | caps width at 1020px | — |
| `scrollable-modal.smaller-modal` | body height 50vh | 2× |
| `no-padding-modal` / `no-padding-confrim-modal` | strips content padding | 11× |

> `readable-content-overlay` was previously listed here — it is a **Popover/Tooltip** overlay class
> (on `MPopover` 9× / `MTooltip` 5×, defined in `popover.less`), **not** a modal variant. Removed (see
> the correction note below).

The backdrop **blurs** the page behind it (`backdrop-filter: blur(3px)`).

## Dimensions (verified)

| Part | Value | Notes |
| --- | --- | --- |
| Content corner radius | **16px** (regular) · **20px** (confirm, `@overlay-border-radius`) | confirm also has a 2px red/variant border |
| Header corner radius | **20px** (top corners) | note the 4px mismatch vs the 16px content — a product inconsistency, kept faithful |
| Header padding | `5px 16px` | tight — the title bar is short |
| Body padding | `24px` (Ant default — not overridden in the kit) | a bare paragraph looks spacious; real forms fill it |
| Footer padding | `10px 16px` (Ant default; `.widget-form-modal` uses 12px) | |

All measured to match `src/design/modal.less`. The body's 24px is Ant's default — modals look
right when filled with a real form (the demo uses a `FlotoForm`), but airy with just text.

## Behaviors

- **Open/close:** trigger slot (`open`) or `open` prop; closes via the header × / footer
  **Cancel** / **Escape** (verified) / `success`. **No built-in × and no backdrop-close**
  (`closable`/`maskClosable` hardcoded false — F1).
- **`destroyOnClose: true`** — body content is re-created each open (fresh form state).
- **Confirm:** Cancel (`default`) on the left, the action on the right (matches the form-field
  placement convention); `error` variant for destructive.

## Content & writing

Title = a short noun/verb phrase ("Edit monitor", "Delete monitor?"). The confirm message
states the consequence ("This can't be undone."); the action button names the verb (**Delete**),
not "Yes/OK".

## Accessibility

- Ant `a-modal` traps focus and restores it on close; **Escape closes** (works even though the
  × is hidden). Renders with `role="dialog"`.
- ⚠️ **No visible close affordance besides the footer** (F1) — provide a footer **Cancel** (or a
  ×) so mouse users aren't stuck relying on Escape.
- ⚠️ No visible focus ring inside ([SF-001](../../findings/SF-001-focus-visible.md)).

## Findings & Inconsistencies

### F1 — No × close and no backdrop-close · Medium · Open *(UX/a11y)*

`Modal.vue` hardcodes `:closable="false"` and `:maskClosable="false"`, so there's **no
top-right ×** and clicking the backdrop doesn't close. Escape works and the footer Cancel works,
but if a modal's footer omits a cancel, **mouse users have no discoverable way to dismiss it**.
**Solution:** make `closable` a prop (default a visible ×), or require a footer Cancel; keep
`maskClosable` opt-in for forms (to avoid accidental data loss).

### F2 — No visible focus ring · High · Open *(a11y)* → [SF-001](../../findings/SF-001-focus-visible.md)

System-wide; matters inside dialogs where focus is trapped.

### F3 — `scrollable-modal` body has no overflow (content can spill) · Low · Open

`scrollable-modal` sets the body to a fixed height + `display:flex; flex-direction:column`, but
**doesn't set `overflow`** on the body itself — so long content spilling directly into the body
**overflows the modal** instead of scrolling. The body's child must be the scroll container
(`flex:1; min-height:0; overflow-y:auto`). **Solution:** add `overflow:auto` (or a flex-1
scroll child) in the variant, or document the required structure (done). Caught in the catalog
(the demo overflowed until the content was wrapped in a scroll container).

## Do / Don't

### Do

- Use `MModal` for a focused task/dialog; **`FlotoConfirmModal`** for yes/no + destructive confirms.
- Always include a footer **Cancel** (so there's a visible way out — F1).
- Use a **`FlotoDrawer`** instead when the content is long, or contextual to a record (details).

### Don't

- Don't rely on a × or backdrop-click to close — they're disabled (F1).
- Don't use a modal for content that's better inline or in a drawer.
- Don't write "Yes/OK" action labels — name the verb (Delete, Save).

## Related

`FlotoConfirmModal` (confirm) · **`FlotoDrawer`** / `FlotoDrawerForm` (side panel — own entry) ·
`MButton` (footer actions) · `FlotoFormItem` (fields inside).

## Changelog

- **2026-07-16** — Completeness pass: declared the prop enums (`variant` default/confirm; `confirm-variant`
  primary/error), documented the default slot (body / confirm message) and the imperative `show()`/`hide()` API,
  re-pointed the decision flow at the obs-* elements (obs-modal `variant="confirm"` for confirms, obs-drawer for
  record-contextual / full-screen), and drove + asserted every functional prop (hide-footer · no-padding · scrollable
  · restrict-width · esc-closable · mask-closable · confirm) in a behaviour test (9/9) recorded in the coverage
  ledger's `## Behaviour` section. Playground reaches every variant via the Scenario presets + toggles.
- **2026-07-14** — Full element docs: added the "obs-modal — variants & when to use" table (default ·
  confirm · hide-footer · no-padding · scrollable · restrict-width/width), the element props list, the
  confirm sub-props + behaviour (esc/mask-closable), the composition patterns (view↔edit, compare), the
  events, and the modal-vs-drawer-vs-page-vs-popover routing. The Details playground now switches Scenario
  (Detail/Confirm/Scrollable/Compare) + exposes the confirm sub-props. Confirm variant rebuilt to match
  FlotoConfirmModal (coloured-border card · icon-circle-left · outline confirm). Overlay fixes: never
  auto-opens; only one overlay open at a time; closed dialogs are `display:none` (scoped `.modal[open]`).
- **2026-06-07** — Added (decision-grade Usage). Deep-dive of `Modal.vue` (39×) + the confirm
  variant `_base-confirm-modal.vue` (71×): trigger-slot / `open`-prop opening; title/body/footer
  slots; `width`/`centered`/`confirmLoading`. Registered `FlotoConfirmModal` in the preview;
  verified Basic (trigger → dialog, 2 footer btns, backdrop) and Confirm (error, icon + Delete)
  open correctly; Escape closes, no × (F1). Drawer (158×) flagged as the related own entry.
- **2026-06-08** — Fidelity pass (owner flagged it didn't match the product). Found the real
  modals add their **own header** (text-primary title + close ×, ~26 modals) and use **overlay
  variants** (`hide-footer` 4×, `scrollable-modal`+`restrict-width`/`smaller-modal`,
  `no-padding-*` 11×) — and the backdrop **blurs**. Reworked the
  stories to the product header pattern + added **HideFooter** and **Scrollable** variant
  stories; documented the header pattern + variants. Confirmed real usage (metric-explorer
  Anomaly/Forecast/Outlier/Compare modals, error/detail modals; delete confirms in CRUD lists).
- **2026-06-11** — Triple-check audit of the **whole overlay/dialog family** (owner: "make sure no
  type of modal is missed"). Confirmed the family is complete at the **component level** — MModal
  (39×), FlotoConfirmModal (71×), FlotoDrawer (99×), FlotoDrawerForm (59×); `MDrawer` is internal
  (wrapped by FlotoDrawer, 0 direct app use); `FlotoFormModal` doesn't exist; no programmatic
  `Modal.confirm`/`$confirm` service; no lightbox/viewer/fullscreen mechanisms; all 42 custom
  `*-modal/-drawer` files build on those 4 bases. Added the two **MModal variants that existed but
  weren't showcased**: **`no-padding`** (body → 8px, full-bleed lists/grids; verified) and **`large
  (restrict-width)`** (content forced to **1020px**; verified). **Correction:** `readable-content-overlay`
  is a **popover/tooltip** class (on MPopover 9× / MTooltip 5×, defined in `popover.less`), **not** a
  modal variant — removed it from the modal variant list above. Open: the **Popover / Tooltip family**
  (MPopover 35×, MTooltip 94×, MPopper 2×) is a separate overlay family **not yet catalogued** as its
  own component.
