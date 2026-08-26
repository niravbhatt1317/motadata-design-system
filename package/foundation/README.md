# Foundations — product coverage sweep

A page-by-page sweep of the ObserveOps product (2026-06-18) validating the four **Foundations/Layout**
elements against what the product actually does. Six parallel passes covered: inventory/monitors ·
alert/dashboard/NOC · the explorers (log/apm/rum/flow/trap/metric) · topology/ncm/netroute/slo/reports/audit ·
all ~23 settings submodules · auth/public/system pages + global chrome + the layout switcher.

Each file lists the **variants**, **where they're used in the product** (modules / pages / flows, with
files), a **coverage verdict**, **notable findings** (including things we'd missed or mis-filed), and
**best practices**.

| File | Element | Storybook |
| --- | --- | --- |
| [layout-shells.md](./layout-shells.md) | The outer page frame (route shells) + content layouts | Foundations/Layout/Layout shells · App shell |
| [page-templates.md](./page-templates.md) | The canonical page types | Foundations/Layout/Page templates |
| [panel-behaviours.md](./panel-behaviours.md) | How panels open / move / resize | Foundations/Layout/Panel behaviours |
| [screen-regions.md](./screen-regions.md) | Regions inside the content panel + content layouts | Foundations/Layout/Screen regions |

> **Status (2026-06-18):** every addition below has been **folded into the live Storybook** —
> Layout shells reclassified (4 route + 2 content), the **Graph / Canvas** page template added, **Modal /
> Expandable rows / Bulk-action bar / Popover / Full-screen** added to Panel behaviours, and **three-pane /
> chart-over-grid** added to Screen regions. Machine spec `layout/layouts.json` updated to match.

## Headline findings

1. **Route shells are 4, not 5.** The switcher in `src/app.vue` resolves **Layout** (default) /
   **LoginLayout** / **EmptyLayout** / **PublicLayout** from `route.meta.layout`. **`MonitorHierarchyLayout`
   has 0 route overrides** — it's a two-pane *content layout component* used inside `Layout`, not a route
   shell. Re-filed accordingly.
2. **A 7th page archetype exists — the Topology graph canvas** (Cytoscape: pan/zoom/minimap/keyboard/node-drag).
   It isn't a Dashboard or an Explorer; document it as **Graph / Canvas view**.
3. **Panel behaviours are broader than the catalogued 5.** Beyond Drawer/Collapsible/Resizable/Affix/Dashboard-tiles,
   the product leans heavily on **Modal** (37 files), **Expandable rows** (9), **Popover** (20+), a fixed
   **Bulk-action bar**, **resizable table columns**, and the full-screen **OmniBox** overlay.
4. **More content layouts than four** — add **three-pane** (metric-explorer: saved-views + picker + chart)
   and **chart-over-grid** (trap-viewer, log dashboard) to single / two-pane / master-detail / dashboard-grid.
5. **Two wizard shapes** — multi-route stateful (report builder, network discovery) vs single-view stepped
   (integration setup). Plus a **stateless utility-tool form** family (settings/utility) and **system/status
   message** pages.
