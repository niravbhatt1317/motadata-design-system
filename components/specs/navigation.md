# Navigation — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule |
| **Maturity** | 🟢 Stable |
| **Source** | `layout/navbar.vue` (`FlotoNavBar`) · `settings/components/left-menu.vue` · `report/components/report-steps.vue` (`ReportSteps`) + `product-setup/components/guide-section-step.vue` + `auth/two-factor-verification.vue` (the steppers — all bespoke, no `MSteps`) · `report/components/compliance-breadcrumb.vue` · `_base-back-button.vue` (`FlotoBackButton`). |
| **Storybook** | Molecules/Navigation |
| **Registry** | [`registry/navigation.json`](../registry/navigation.json) |
| **Family** | [Navigation](../family-map.md) |

## Why this is a family

The product's **wayfinding** components — distinct from **Toolbars** (which hold *actions*) and
**Tabs** (sibling views of one page). Catalogued by archetype.

## The archetypes

| Archetype | Source | Usage | What it is |
| --- | --- | --- | --- |
| **Primary nav** | `FlotoNavBar` | global | left vertical **module** nav (icon + label) |
| **Side menu** | `settings/left-menu` · Log/Topology hierarchy · Dashboard · Report/saved-views | many | the **left-panel** nav — 4 forms: section · tree · category-list · list/saved-views |
| **Steps** | `report-steps.vue` · `product-setup` guide · 2FA | 3 flows | numbered **wizard / stepper** (bespoke, no `MSteps`) |
| **Breadcrumb** | `compliance-breadcrumb` | — | back + **path trail** |
| **Back button** | `FlotoBackButton` | 3× | a **chevron-left** router link |
| **Tabs** | `MTab` | 86× | *its own family* (Molecules/Tabs) — cross-referenced |

### Primary nav

- The left vertical **module** sidebar (`MLayoutSider`). **Collapsed 65px** by default (brand mark +
  module icons only); **hover-expands to 170px** (`@mouseover`/`@mouseout` → `pinned`) revealing the
  **ObserveOps** logo + module labels. The **16 modules** come from `visibleMenuItems`
  (role/license-gated): Dashboards, Monitors, Alerts, SLO *(BETA)*, Reports, Topology, NCCM, NetRoute,
  Metric Explorer, Log Explorer, APM Explorer, RUM Explorer, Flow Explorer, Trap Explorer, Audits,
  Settings — each with its registered module icon. **Active** module highlights `--primary` on
  `--code-tag-background-color` with an inset left rule when expanded. `MMenu theme="dark"` +
  `MMenuItem` + `FlotoLink`. **Collapsed ↔ expanded is the primary variant.**

### Side menu (the left-panel — 4 forms)

The product's **left-hand panel** in list/explorer views. One archetype, **four forms** (all share a
shell: optional **tabs** + **search** + a scrollable list; selecting an item filters/navigates the main
view). Surfaced by a per-module sweep — the original entry only covered the first.

1. **Section menu** — `settings/components/left-menu.vue` (**20×**): a search atop an **`MCollapse`**
   accordion of sections (icon + name + optional beta tag) → sub-items; active item gets a `--primary`
   left rule. The Settings sub-nav.
2. **Tree** — **Log Explorer** `log/components/hierarchy/*`, **Topology** `topology-hierarchy.vue`, and
   **Inventory** (Monitors) via the shared **`@views/layouts/monitor-hierarchy-layout.vue`** — all on the
   shared **`components/hierarchy/infinite-tree.vue`**: tabs (Type / Group / Saved Query), search, then a
   **virtualised hierarchy** — each node a **chevron + type icon (or severity badge) + name + count
   badge** (`57.25 M`), nested; the Saved-Query tab is a flat `MMenu` list with Create/​delete.
3. **Category list** — **Dashboard** `dashboard/components/dashboard-dropdown.vue`: a **segmented**
   Dashboard / NOC View toggle + round **＋**, search + layout-toggle, then `MCollapse` **categories with
   count badges** (My Favorite 7, Server 6 …) and a **favourite star** per row.
4. **List / Saved views** — **Report** `report/components/report-sidebar.vue` + the **`ExplorerSavedViewList`**
   reused by **APM / RUM / Metric Explorer** (and the Log Saved-Query tab): tabs + search + a flat
   `MMenu` list with a **Favorites (★)** row, an **active** highlight, and a per-row **pencil** to inline-rename.

> **Not in this family (cross-refs):** the **faceted checkbox** left-panel (`vertical-filter/filters.vue` —
> APM/RUM/NCM) is a **Filter** → **Molecules/Filters → Vertical filter**; the **Metric Explorer**
> picker (`metric-picker.vue` → `counter-list.vue`, ⊕-add + drag) is a **picker** → cross-ref
> **DropdownPicker**. The **Flow** "Result By" sidebar is a *config* panel (sortable list + dropdowns),
> not nav.

### Steps

- A **count circle + label** per step: **completed** (✓ filled), **current** (filled + ring),
  **remaining** (grey); connectors fill `--primary` up to the current step. **All steppers are bespoke**
  (the product has no `MSteps`). Three real usages:
  - **Report builder** (`report-steps.vue`, `ReportSteps`) — horizontal 3-step wizard:
    *Report Properties → Visualizations & Preview → Schedule*. The reproduction models this one.
  - **Product setup / onboarding guide** (`product-setup/guide-sections.vue` + `guide-section-step.vue`)
    — vertical numbered step list (completed shows a green ✓) for the Log / Metric / Flow setup guides.
  - **Two-factor auth setup** (`auth/two-factor-verification.vue`) — a *Step 1 / 2 / 3* indicator with
    dividers.

### Breadcrumb / Back button

- **Breadcrumb** — a back chevron + a path (`Reports / Compliance / …`), current crumb bold. (Some are
  a back + title/subtitle context header rather than a full trail.)
- **Back button** (`FlotoBackButton`, 3×) — a `chevron-left` `MIcon` in a `FlotoLink`; also the Page
  header's `back-button` slot.

## App chrome & specialised navigators (from the full per-module sweep)

The 2026-06-16 per-module fan-out surfaced six more wayfinding components beyond the core archetypes:

| Member | Source | What it is |
| --- | --- | --- |
| **User account menu** | `components/layout/user-dropdown.vue` | header avatar → `MPopover`: profile, theme toggle, logout |
| **Notification dropdown** | `components/layout/notification-dropdown.vue` | header bell + badge → **Alerts / System** tabs + View all |
| **Global search / Omnibox** | `components/omnibox/searchbar.vue` | command/search palette (category + CodeMirror query + Execute) |
| **NOC Player** | `dashboard/components/noc-player.vue` | wallboard **rotator** — ‹ prev/next ›, countdown, play/pause |
| **Timeline scrollbar** | `netroute/components/timeline-scrollbar.vue` | **temporal** navigator (single ‹ › + batch ‹‹ ›› through time buckets) |
| **Graph expansion breadcrumb** | `netroute/components/graph-view.vue` | a **Breadcrumb variant** — closable tags of expanded graph nodes |

## Checked & scoped out (sweeps)

Swept the product for nav variants beyond the archetypes; these were considered and deliberately placed
elsewhere or confirmed absent:

| Candidate | Usage | Verdict |
| --- | --- | --- |
| Topology Full/Tree switch · chart-type selector | — | **Radio (segmented)** usage, not a new nav entry — cross-ref Atoms/Radio. |
| Topology category / APM section / Alert two-level tabs | — | **Tabs** usage (Alert adds a hover sub-menu) — cross-ref Molecules/Tabs. |
| ViewDetailDrawer (tabs inside a drawer) | — | **Drawer + Tabs** composition — cross-ref Organisms/Drawer. |
| Faceted checkbox sidebar (`vertical-filter/filters.vue`) | APM/RUM/NCM | A **Filter**, not nav → **Molecules/Filters → Vertical filter**. |
| Swap/reorder control · Role-navigation form · flame-graph zoom · Layer-3 toggle · shortcuts tooltip | — | **Not navigation** (reorder control / settings form / chart-zoom / filter toggle / help legend). |
| **Pagination** (`FlotoPaginatedCrud` / `k-pager`) | **79×** | A **page-nav** archetype, but it belongs to the **Table** family (grid footer) — cross-referenced, not duplicated here. |
| **Menu toggle** (`menu-toggle-button`) | 7× | The Primary nav's own collapse control — folded into Primary nav's **collapsed ↔ expanded** variant, not a separate entry. |
| `role="navigation"` landmark | 2× | An a11y attribute, not a component → tracked in **F2**. |
| `MMenu` | 13× | The shared primitive under Primary nav / Side menu → now catalogued in its own right in the **Menu** family (Molecules/Menu). |
| `MSubMenu` (flyout submenus) | **0×** | Confirmed **absent** — the product has no flyout/mega-menu pattern. |
| Context / action menu (`FlotoGridActions` · `MDropdown`) | grid rows · 1× | An action surface ("do something"), not wayfinding → now homed in the **Menu** family (Molecules/Menu). |

## Which navigation? (decision)

1. **Top-level modules?** → **Primary nav**.
2. **Sections within a module?** → **Side menu**.
3. **A multi-step flow?** → **Steps**.
4. **Location + a way up?** → **Breadcrumb**.
5. **Just back one level?** → **Back button**.
6. **Sibling views of one page?** → **Tabs** (Molecules/Tabs).

## Accessibility

- **Verify:** nav **landmarks** (`role="navigation"`), **`aria-current`** on the active item,
  focus-visible ring (**SF-001**), and that the **stepper** conveys step state (not color-only) to
  assistive tech.

## Design tokens used

`--nav-panel-bg` · `--code-tag-background-color` (active) · `--left-menu-text-color` · `--primary` ·
`--primary-alt` · `--border-color` · `--neutral-lightest` · `--neutral-light` · `--page-text-color`.

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low | Noted | Router/store-bound (`visibleMenuItems`, `FlotoLink`, `MCollapse`) → reproductions. |
| F2 | Low (a11y) | Open | Verify nav landmarks / `aria-current` / focus ring / stepper semantics. |

## Do / Don't

- **Do** use Primary nav for modules, Side menu for sections, Steps for ordered flows; put the Back
  button in the Page header slot.
- **Don't** use Tabs for module/section nav; don't hand-roll a sidebar; don't confuse a breadcrumb
  (location) with a toolbar (actions).

## Related components

**Tabs** (sibling-view nav) · **Toolbars** (Page header hosts the back button + breadcrumb) ·
`MMenu` / `MCollapse` (the primitives) · `Input` (the side-menu search).

## Changelog

- **2026-06-16** — Added a **second Steps example** — **Setup guide steps** (vertical
  `product-setup/guide-section-step.vue` pattern: 50×50 rounded index box, number → green ✓ when done,
  title + description) alongside the existing horizontal **report-builder** wizard. Verified light +
  dark.
- **2026-06-16** — Fidelity pass (round 2, against a product screenshot) — corrected the Primary nav
  logo from a square "M" to the real **ObserveOps donut mark** (coral wedge + ring + hollow centre,
  theme-aware ring via `--nav-text-color`); changed the active item from a tinted row + left rule to a
  **filled rounded pill** (`--primary` bg, `--nav-panel-bg` text, inset margins) matching the product;
  made the **BETA** tag a rounded grey pill; added the bottom **MaskGroup** decoration (translucent
  overlapping circles). Also **corrected the Steps source**: the product has **no `MSteps`** — the
  steppers are bespoke (`report-steps.vue`, the `product-setup` guide, and `two-factor-verification`).
- **2026-06-16** — Recheck — **rebuilt Primary nav for product fidelity** against the real
  `FlotoNavBar`: collapsible `MLayoutSider` (**collapsed 65px → hover-expand 170px**), the **ObserveOps**
  logo, the real **16 modules** with their registered icons, the **SLO BETA** tag, and the `--primary`
  active highlight + inset left rule. Verified collapsed + expanded in **both light and dark** themes
  (screenshots). Recorded the recheck sweep: **Pagination** (79×) → cross-referenced to the **Table**
  family; **menu toggle** folded into the collapsed↔expanded variant; `MSubMenu` flyouts confirmed
  **absent** (0×).
- **2026-06-16** — Added — the **Navigation** family (the wayfinding archetypes): **Primary nav**
  (`FlotoNavBar`), **Side menu** (`settings/left-menu`, 20×), **Steps** (`MSteps`), **Breadcrumb**,
  **Back button** (`FlotoBackButton`). **Tabs** stay their own family (cross-referenced). Surfaced as a
  separate family during the Toolbars recheck (nav ≠ toolbar). Reproductions (router/store-bound);
  verified Primary nav + Side menu + Steps render, no console errors. Findings F1 (reproduction),
  F2 (a11y landmarks/aria-current).
