# Layout shells — product coverage

The outer page frame. Source: `src/views/layouts/`. The shell is chosen by the switcher in
`src/app.vue` (watch on `$route`): if not logged in → **LoginLayout**; otherwise default **Layout**;
then the first `route.matched[].meta.layout` override wins.

## The variants

### Route shells (4 — selected by `meta.layout`)

| Shell | File | Chrome | Selected when |
| --- | --- | --- | --- |
| **Layout** (default) | `views/layouts/main.vue` | NavBar (left) + Header (top) + scrolling content + overlay layer (OmniBox, notifications, portals, DB/socket) | every authenticated route with no override |
| **LoginLayout** | `views/layouts/login-layout.vue` | bare — centered, no chrome, no socket | `meta.layout: 'LoginLayout'` **and** the not-logged-in fallback |
| **EmptyLayout** | `views/layouts/empty-layout.vue` | no nav/header, padded; keeps socket + local DB | `meta.layout: 'EmptyLayout'` |
| **PublicLayout** | `views/layouts/public-layout.vue` | no chrome; socket with `isMotadataUpdatingOrRestoring` | `meta.layout: 'PublicLayout'`, `public: true` |

Observed route overrides (excluding chart-layout props): **LoginLayout ×3 · PublicLayout ×2 · EmptyLayout ×1**;
everything else inherits the default **Layout**.

### Content layouts (rendered *inside* `Layout` — not route shells)

| Layout | File | What |
| --- | --- | --- |
| **MonitorHierarchyLayout** | `views/layouts/monitor-hierarchy-layout.vue` | two-pane: collapsible/affixable left **hierarchy tree** + right content. **0 route overrides; used as a component in 4 files.** |
| **Settings two-pane** | `modules/settings/views/main.vue` | `splitpanes` (library) draggable split: left **menu** (15%, `MCollapse`+`MMenu`) + right `RouterView` (85%); hidden via `meta.hideSettingsMenu` |

## Where it's used in the product

| Shell | Pages / flows (files) |
| --- | --- |
| **Layout** | All of inventory, alert, dashboard, topology, ncm, netroute, slo, reports, audit, the explorers, and settings. The product's default. |
| **LoginLayout** | `auth/views/login.vue`, `auth/views/reset-password.vue`, the forgot-password modal (in login), and the `views/errors/_disk-space-full.vue` page. |
| **EmptyLayout** | `/reports/export/:id` — the print-safe report renderer (`views/print/report-renderer.vue`). Chrome-free so PDF/print output is clean. |
| **PublicLayout** | `/upgrade` and `/restore` system pages (`views/upgrade-restore/upgrade-restore-progress.vue`) — full-screen maintenance progress. |
| **MonitorHierarchyLayout** (content) | `modules/log/views/main.vue` (log explorer tree), inventory monitor hierarchy, topology (tree + graph), + 1 more. |
| **Settings two-pane** (content) | `modules/settings/views/main.vue` — wraps every settings submodule. |

## Coverage verdict

- **All four route shells are catalogued and fully covered.** No 5th/6th route shell exists.
- **Correction:** the Storybook "Layout shells" page and `layout/layouts.json` list **MonitorHierarchyLayout**
  among the five shells. It is **not** a route shell (0 `meta.layout` overrides) — it's a two-pane **content
  layout** component. The doc should present **4 route shells + 2 content layouts** (MonitorHierarchyLayout,
  Settings two-pane). Functionally still covered; the *classification* is the fix.

## Notable / different findings

- **The switcher is auth-aware**, not purely meta-driven: unauthenticated always forces LoginLayout
  regardless of the target route's meta (`app.vue` lines ~63–76).
- **Settings two-pane uses the `splitpanes` library** (genuinely drag-resizable), distinct from the
  CSS/transition sidebars elsewhere — the only first-class resizable split in product chrome besides topology.
- **`MonitorHierarchyLayout` sidebar can be affix + collapsible simultaneously** (`affixed-sidebar` →
  absolutely-positioned overlay that doesn't reflow the grid) — a hybrid not captured by "sticky" or
  "collapsible" alone.
- **`hideSettingsMenu` route meta** full-screens settings create/edit forms by collapsing the left menu —
  a per-route content-layout toggle.

## Best practices

- Don't override the shell unless required — **Layout** is right for almost every authenticated page.
- **Auth screens must use LoginLayout** (no socket/DB boot). **Print/export → EmptyLayout.** **System
  maintenance → PublicLayout.**
- Reach for **MonitorHierarchyLayout** when a module needs a persistent left tree + detail; use the provided
  context (`hideHierarchy()` / `showHierarchy()`) to toggle it.
- For configuration modules, follow the **Settings two-pane** pattern (left menu + content, `hideSettingsMenu`
  on full-screen forms) rather than inventing a new sidebar.
