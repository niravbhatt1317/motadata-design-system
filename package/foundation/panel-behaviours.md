# Panel behaviours — product coverage

How panels open, move and resize. The five catalogued behaviours are confirmed and heavily used — but the
sweep shows the product's real overlay/panel vocabulary is **wider**: Modal, Expandable rows, Popover, a
fixed Bulk-action bar, resizable table columns, and the full-screen OmniBox all recur enough to belong here.

## The variants (catalogued) — with product usage

| Behaviour | Count | Where (files) |
| --- | --- | --- |
| **Drawer (slide-over)** | **146 usages / 30 files** | `_base-drawer.vue` (FlotoDrawer) · `crud/_base-drawer-form.vue` (FlotoDrawerForm); inventory forms (wan-link / container-runtime / credential, 40%); **apm/rum drill-downs (90%)**; ncm (ViewDetail / Restore / Firmware / Compare / Terminal); widget-selector; topology detail; alert correlation-drawer; settings CRUD forms. |
| **Collapsible** | **19 files** | `filters/vertical-filter` groups; navbar hover-expand; metric-explorer `MCollapse` metric hierarchy; settings sections; the collapsible left tree. |
| **Resizable / split** | **~2–3 true splits** | **`splitpanes` library** in `settings/views/main.vue` (left menu + content) and **topology** (tree + graph); `apm/.../trace-drill-down` chart-split-pane (CSS). Genuinely drag-resizable panes are rare. |
| **Affix / sticky** | mostly CSS/JS | monitor-details sticky header; `monitor-sidebar` scroll-offset (JS-managed); report-wizard footer; ncm bulk-action bar; time-range pickers pinned in headers. **No `<a-affix>` widget** — sticky is CSS/flex/JS, not a component. |
| **Dashboard tiles** | **5 files** | `widgets/widgets.vue` (vue-grid-layout: drag + resize + reorder) · dashboard · ncm overview · apm · flow. Plus **VueMasonryWall** (inventory heatmap) as a responsive masonry variant. |

## Additional behaviours the sweep surfaced (not in the catalogued 5)

| Behaviour | Count | Where / what |
| --- | --- | --- |
| **Modal** | **37 files** | `_base-confirm-modal.vue` (FlotoConfirmModal), metric-explorer (anomaly/compare/arithmetic/forecast/outlier), error-modal, suppress-alert (**form-in-modal**), ncm compare/terminal/firmware, approval-request. Confirm-delete and form-in-modal are everyday flows. |
| **Expandable rows** | **9 files** | inline row→detail expansion: alert stream grid, log-grid, apm tree-list, ncm triggered-policies, pivot-table. A list interaction distinct from drawer/modal. |
| **Popover** | **20+** | `_base-popper.vue`; user-dropdown, column/filter selectors, date pickers, the alert-dashboard sub-tab dropdowns. Small, non-blocking, contextual. |
| **Bulk-action bar** | **2 files** | `_base-bulk-action-bar.vue` + rediscover bulk-provision toolbar — a **fixed bottom** bar that animates in on selection. |
| **Resizable columns** | **50+ tables** | Ant table `minResizableWidth` — column drag-resize (distinct from pane-resize). |
| **Full-screen overlay** | a few | **OmniBox** global search (portal, blocks the page), ScreenBlocker, NOC-player full-screen, fixed top-right toast notifications. |

## Coverage verdict

- The catalogued **five are real and well-exercised** — Drawer is the dominant record surface (146 usages).
- **Recommended additions** to the Panel-behaviours page (they're as common as the five): **Modal**
  (confirm + form-in-modal), **Expandable rows**, **Popover**, **Bulk-action bar**, **Resizable columns**,
  and the **OmniBox full-screen overlay**. Several already exist as *components* (Modal, Popover, BulkActionBar)
  but aren't framed as *behaviours* on the foundation page.
- **Two clarifications:** "Resizable / split" in product means the **`splitpanes` library** (rare, ~2–3
  places), not the 20+ the raw grep implied (those were resizable *columns*). "Affix" is **CSS/JS sticky**,
  not an `<a-affix>` widget.

## Notable / different findings

- **Drawer width is semantic**: ~40% for create/edit forms, **90% for deep drill-downs** (apm traces, rum
  sessions, apm database) — almost a full-page surface that keeps list context.
- **Modal vs Drawer is a deliberate split**: small action/confirm/collect → **Modal**; panel-sized,
  scrollable record/detail → **Drawer**; high-complexity record → **full page/route**.
- **Masonry vs rigid grid**: dashboard tiles are usually `vue-grid-layout` (rigid, draggable) but the
  inventory heatmap uses **VueMasonryWall** (responsive masonry) — same "tiles" idea, different reflow.
- **Bulk-action bar** is a unique floating surface (fixed, bottom, appears on selection) — neither modal nor
  drawer.
- **No bottom-sheet** pattern exists — every side panel is a right-edge drawer.

## Best practices

- **Drawer = default off-list surface** (create/edit/detail). Always backdrop + ESC-to-close; 40% for forms,
  90% only for genuine deep dives.
- **Modal** for confirm/collect (`FlotoConfirmModal`, `variant=error` for destructive); keep it small.
- **Collapsible** for *optional* detail — never hide required fields collapsed by default.
- **Resizable splits** (`splitpanes`) need a sensible min-width and a remembered default; don't let a pane
  collapse to zero.
- **Affix** sparingly — pin only things useful while scrolling (filters, hierarchy sidebar, wizard footer).
- **Dashboard tiles**: snap to grid, persist size/position per board; use masonry only when tile heights
  genuinely vary.
