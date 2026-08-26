# Link (`FlotoLink`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Atom (navigation) |
| **Maturity** | 🟢 Stable |
| **Source** | `src/components/_base-app-link.vue` (global `FlotoLink`) |
| **Storybook** | `Atoms/Link` (Examples · Usage · Accessibility · Changelog) |
| **Registry** | [`../registry/link.json`](../registry/link.json) |
| **Family** | the Button family's **navigation** relative (the thing a button should *not* be used for) |
| **Figma** | TODO |

## Usage (product analytics)

- **`<FlotoLink>` used 67× across 48 files.** `:to` (route) ~9× explicit (most pass it via
  `v-bind`); `as-button` form used for navigation CTAs. Wraps logos, menu items, breadcrumbs,
  and clickable values.

## Overview

The product's **navigation** control. Two modes (one prop, `asButton`):

- **Default** → renders a **`RouterLink`** (`<a>`): an in-content/inline navigation link.
- **`as-button`** → renders an **`MButton`** that **pushes the route on click**: a
  button-styled navigation CTA (takes any Button `variant`).

Everything except `asButton` passes through via `$attrs` (`to`, `target`, button props).

## Anatomy

```text
text link:   …go to ⟨the inventory list⟩…     ← <a href> (RouterLink), inherits text color
as-button:   [ Go to settings ]               ← MButton; navigates via $router.push on click
```

## Options / API

- **`asButton`** (Boolean, default false) — button-styled navigation vs a plain link.
- **`to`** (via `$attrs`) — the route/target (router location or path).
- **`target`**, and (when `asButton`) any **MButton** prop (`variant`, `size`, …) — all
  passed through.
- Slot: link/button content.

## Link variations (the full surface)

"Link" is broader than `FlotoLink`. The real variations in the product:

| Variation | How | Notes |
| --- | --- | --- |
| **Internal text link** | `FlotoLink` (RouterLink) | the default — in-content/menu/breadcrumb navigation |
| **Navigation CTA** | `FlotoLink as-button` | button-styled internal navigation (F1) |
| **External / new-tab link** | **plain `<a href target="_blank">`** (147×) | `FlotoLink` is **internal-only** — RouterLink can't resolve external URLs. ⚠️ Set `rel="noopener noreferrer"` ([SF-004](../../findings/SF-004-blank-rel-noopener.md)). |
| **In-table link style** | `class="k-link"` (25×) | subtle: `--page-text-color`, hover → pagination-active color (not brand-colored) |
| **Other class styles** | `resource-link` (8×, mostly legacy/commented), `link-label` (5×), `completed-link` (3×), `admin-page-link` (1×) | app-context link treatments |

Anchor appearance is also **context-scoped** (nav/header/dropdown/menu/steps style links
differently in `header.less`/`left-list.less`/`dropdown.less`/… ) — chrome styling, not
reusable variants.

## Behaviors

- **Default link** is a real `<a>` (RouterLink) → supports middle-click / open-in-new-tab.
- **`as-button`** navigates programmatically (`$router.push`) and only pushes if the target
  differs from the current route.

## Content & writing

Link text should name the destination ("the inventory list", "Settings") — not "click here".

## Accessibility

- **Default mode** is a true anchor — correct link semantics, keyboard + new-tab support. ✅
- ⚠️ **`as-button` is a `<button>`, not an anchor (F1):** it navigates via JS, so it loses
  native link affordances (no `href`, no middle-click / open-in-new-tab / right-click menu)
  and is announced as a button, not a link.
- **No visible focus ring** system-wide ([SF-001](../../findings/SF-001-focus-visible.md)).

## Findings & Inconsistencies

### F1 — `as-button` navigates but isn't a real link · Medium · Open *(a11y/UX)*

`as-button` renders an `MButton` and calls `$router.push` on click — so a *navigation* is
exposed as a *button* with no `href`. Users can't open it in a new tab / middle-click, and AT
announces "button" not "link". **Solution:** for navigation CTAs prefer a real anchor styled
as a button (RouterLink with a button class), so the href is present; reserve `as-button` for
cases where a true anchor isn't possible.

### F2 — Plain links have no built-in affordance · Low · Open

A default `FlotoLink` **inherits text color** — there's no global link color/underline, so a
bare link can look like normal text. Most usages add `text-primary` (navy) for affordance.
**Solution:** consider a default link style (color + hover underline) so links are
distinguishable without per-use classes.

### F3 — No external-link component; `target="_blank"` lacks `rel` · Low · Open *(security)* → [SF-004](../../findings/SF-004-blank-rel-noopener.md)

`FlotoLink` is **internal-only** (RouterLink), so external/help/doc links are written as raw
`<a href target="_blank">` — **147× across the app, none with `rel="noopener noreferrer"`**
(reverse-tabnabbing; mitigated by modern browsers but still flagged). **Solution:** a shared
`FlotoExternalLink` (or extend `FlotoLink` for an external `href`) that always emits
`target="_blank" rel="noopener noreferrer"`, plus a lint rule. Promoted to **SF-004**.

## Do / Don't

### Do

- Use `FlotoLink` for **navigation** (route/URL) — inline links, menus, breadcrumbs, logos.
- Use `as-button` for a **prominent navigation CTA**; pass a Button `variant`.
- Give the link text that names the destination; add an affordance (`text-primary`) for inline links.

### Don't

- Don't use a link for an **action** (save/delete/apply) — use a **Button**.
- Don't rely on `as-button` where users expect to open in a new tab (F1).

## Related

`MButton` (actions) · `MDropdown` (menus) · the Button family (this is its navigation member).

## Changelog

- **2026-06-07** — Added (decision-grade Usage from the start). Deep-dive of
  `_base-app-link.vue` (67×/48 files): `RouterLink` default + `as-button` MButton route-push;
  only own prop is `asButton`. Verified text link (`<a href>`) + as-button (navigating MButton)
  in Storybook (RouterLink + `$router` stubbed in preview). Findings F1 (`as-button` not a real
  link, a11y), F2 (no default link affordance). Closes the Button family's navigation relative.
- **2026-06-07** — Thorough link-variation sweep (owner flagged possible missed variants).
  Found and documented: **external links** (plain `<a target="_blank">`, 147×, FlotoLink is
  internal-only) + **class-based link styles** (`k-link` 25×, `resource-link`, `link-label`, …);
  added the **External link** story + variations table. New finding **F3** → promoted to
  **SF-004** (`target="_blank"` links lack `rel="noopener noreferrer"`).
