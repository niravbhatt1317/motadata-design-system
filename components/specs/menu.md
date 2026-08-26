# Menu — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule (primitive) |
| **Maturity** | 🟢 Stable |
| **Source** | `@motadata/ui` `MMenu` / `MMenuItem` / `MMenuDivider` (the primitive) · `components/_base-grid-actions.vue` (`FlotoGridActions`, the context/action menu) · `MDropdown` (1× — rich-text editor table options). |
| **Storybook** | Molecules/Menu |
| **Registry** | [`registry/menu.json`](../registry/menu.json) |
| **Family** | [Menu](../family-map.md) |

## Why this is a family

**Menu** is the shared **primitive** — a vertical list of selectable rows — that several other
families are *built from*. It is catalogued in its own right (the building block), alongside its one
direct **usage** that isn't already a family of its own: the **context / action menu**.

## The members

| Member | Source | Usage | What it is |
| --- | --- | --- | --- |
| **Menu** (primitive) | `MMenu` / `MMenuItem` / `MMenuDivider` | **13×** | a vertical list of selectable rows (icon + label), with dividers + danger/positive colours |
| **Context / Action menu** | `_base-grid-actions.vue` (`FlotoGridActions`) · `MDropdown` | grid rows · 1× | a **"⋯" trigger** → an `MMenu` of **actions** (an action surface, not a value picker) |

### Menu (the primitive)

- A panel of `MMenuItem`s — each an **icon + label** row — with **hover** (`--neutral-lighter`),
  **selected** (`--primary` text on `--code-tag-background-color`), `MMenuDivider` (`--border-color`),
  and **danger** (`--secondary-red`) / **positive** (`--secondary-green`) item colours.
- It is the building block beneath **Primary nav** & **Side menu** (Navigation), the **Dropdown picker**
  (Organisms/DropdownPicker), and the **Context/Action menu** below. Reused — never hand-rolled.

### Context / Action menu

- The `FlotoGridActions` pattern: an `MPopover` (placement `bottomRight`) triggered by an
  **ellipsis-v "⋯"** icon, opening an `MMenu` of **action** items. Items are **permission-gated**
  (create/edit/delete keys), support **dividers**, and colour **danger** actions red / **positive**
  green. The lone `MDropdown` usage (editor table options) is the same shape via the kit component.
- It is an **action surface** ("do something") — distinct from a value picker and from navigation.

## `obs-menu` (DS element) — modes, item shape & when to use

`<obs-menu>` is a vertical list of icon+label rows (dividers, danger/positive colours). Pass `items` as a
JSON array; it emits `select` with the chosen item's `key`. Two **modes**:

| Mode | Turn it on with | Use when |
| --- | --- | --- |
| **context** (default) | `mode="context"` + `trigger="dots"` or `"button"` (+ `label`) | a ⋯ / button that opens a **top-layer menu of ACTIONS** on a row/object (FlotoGridActions) |
| **inline** | `mode="inline"` | render the list **in place** — a nav / picker / dropdown body (the MMenu primitive) |

**Item shape:** `{ key, label, icon?, danger?, divider?, selected?, disabled? }` — `icon` is a DS icon name
(→ `obs-icon`); `danger:true` → red (Delete); `divider:true` → a rule; `selected:true` → the active nav row.
**Props:** `mode` · `trigger` (dots | button) · `label` (button trigger) · `placement` (bottom-end | bottom-start) ·
`disabled`. **Events:** `select` (`{key}`) · `show` / `hide`. Context menus render in the **top layer** (Popover API).

## Which menu? (decision)

1. **A list of items to render inside something** (nav, picker, dropdown)? → **Menu** primitive (inline mode).
2. **A "⋯" / button that opens a list of *actions*** on a row or object? → **Context / Action menu** (context mode).
3. **Pick a *value* from options** (single/multi)? → **Dropdown picker** / **Select** (not here).
4. **Go to a destination**? → **Navigation** (Primary nav / Side menu / Tabs).

## Accessibility

- **Verify:** the trigger has an accessible name (the "⋯" needs an `aria-label`), the open menu uses
  **`role="menu"` / `role="menuitem"`**, **arrow-key** navigation + **Esc** to close, focus returns to
  the trigger on close, and **danger** actions are not conveyed by colour alone (icon/label too).

## Design tokens used

`--page-background-color` (menu bg) · `--border-color` (border / divider) · `--neutral-lighter`
(hover) · `--code-tag-background-color` (selected bg) · `--primary` (selected text) ·
`--secondary-red` (danger) · `--secondary-green` (positive) · `--page-text-color`.

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low | Noted | The primitive is reproduced (the live `MMenu` needs Ant menu context); built from real tokens + `MIcon`. |
| F2 | Low (a11y) | Open | Verify `role=menu`/`menuitem`, arrow-key + Esc, trigger `aria-label`, focus return, non-colour-only danger. |
| F3 | Info | Noted | `MDropdown` appears only **1×** (editor); the product's standard action menu is `FlotoGridActions` (MPopover + MMenu). |

## Do / Don't

- **Do** reuse the **Menu** primitive (and `FlotoGridActions` for row actions); colour danger actions
  with `--secondary-red`; gate items by permission.
- **Don't** confuse a menu of **actions** with a **value picker** (use Dropdown picker / Select) or
  with **navigation**; don't hand-roll a `<ul>` dropdown; don't rely on colour alone for danger.

## Related components

**Navigation** (Primary nav / Side menu are built on `MMenu`) · **Dropdown picker** & **Select** (value
selection, built on the same primitive) · **Popover** (the floating container) · **Toolbars** (host the
"⋯" action menu) · **Table** (grid rows host `FlotoGridActions`).

## Changelog

- **2026-06-16** — Added — the **Menu** family: the **`MMenu` primitive** catalogued in its own right
  (the building block beneath Primary nav, Side menu, the dropdown picker) **+** the **Context / Action
  menu** (`FlotoGridActions` — a "⋯" trigger → `MMenu` of actions; the single `MDropdown` usage is the
  same shape). Surfaced during the Navigation recheck (MMenu was "scoped out" as a primitive; the
  context menu as an action surface) and promoted to real entries. Reproductions (real tokens + MIcon);
  verified the primitive + the opened context menu render. Findings F1–F3.
