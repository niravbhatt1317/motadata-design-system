# Screen regions — product coverage

Inside the content panel: the region stack (Page header → Toolbar → Body → Footer) and the content layout
the body takes. All four regions and four content layouts are confirmed; the sweep adds **three-pane** and
**chart-over-grid** content layouts, plus an **explorer control bar** and **time-range** region variant.

## Regions — with product usage

| Region | Required | Where (files) |
| --- | --- | --- |
| **Page header** | yes | `FlotoPageHeader` everywhere (`before-title` / `title` / `after-title` slots), with `back-link`. Variant: **inline mini detail-header** (`inventory/components/monitor-details.vue`) — a sticky breadcrumb/status row inside the two-pane right panel. |
| **Toolbar / filter bar** | optional | `FlotoPaginatedCrud` `add-controls` slot: search + filter toggle + export (PDF/CSV) + column selector + create. Variant: **explorer control bar** (`MRadioGroup` type + filters + saved-view), and a **time-range picker / time-range slider** region under the header (dashboards, explorers). |
| **Body** | yes | table (`MGrid`) · form grid (`MRow`/`MCol`, 541/522 files) · dashboard (`vue-grid-layout`) · charts/data-viz · graph canvas. |
| **Footer / pagination** | optional | `FlotoPaginatedCrud` pager (server-side); form action bars (Save/Cancel in the form footer slot); the fixed **Bulk-action bar** at viewport bottom. |

## Content layouts — with product usage

| Content layout | Where (files) |
| --- | --- |
| **Single column** | most settings CRUD + forms + simple lists. |
| **Two-pane (tree/menu + content)** | `MonitorHierarchyLayout` (log/inventory/topology hierarchy); **Settings** (`splitpanes` left menu + content); policy create (`MMenu` type picker + form). |
| **Master-detail (list + drawer)** | alert, inventory, **ncm explorer** (multiple drawers), apm/rum drill-downs. |
| **Dashboard grid** | `vue-grid-layout` tiles (dashboard, ncm, apm, flow) + **masonry** (inventory heatmap). |
| **Three-pane** *(new)* | `metric-explorer/views/metric-explorer.vue`: saved-views sidebar + metric-picker (`MTab`+`MCollapse`) + chart. |
| **Chart-over-grid** *(new)* | `trap-viewer` (30% chart above 70% grid); log-dashboard (KPI cards above bubble chart + grid). |

## Coverage verdict

- **All four regions and the four catalogued content layouts are confirmed.**
- **Add two content layouts:** **three-pane** (saved-views + picker + content, in metric/apm explorers) and
  **chart-over-grid** (a fixed chart region above a grid).
- **Add region variants worth naming:** the **explorer control bar** (between header and content in every
  explorer) and the **global time-range** region (picker/slider) — both currently fold under "Toolbar /
  filter bar" but behave as their own region.
- **Left-panel variants** are not one thing: **hierarchy tree** (log), **saved-views sidebar**
  (metric/apm explorer), **metric-picker** (`MTab`+`MCollapse`), **vertical filter** (ncm) — document them
  as distinct left-panel kinds within the two-pane layout.

## Notable / different findings

- The **explorer control bar** is the most consistent un-named region: `MRadioGroup` (explorer/chart type) +
  filters + saved-view actions, sitting between the page header and the visualization in log/apm/flow/metric.
- **Time-range is a first-class region**, not a header afterthought — dashboards render a dedicated
  `TimeRangeSlider` row, and explorers a `TimeRangePicker`, scoping the whole body.
- **Three-pane** (metric-explorer) genuinely exceeds two-pane — a collapsible saved-views rail **and** a
  metric-picker panel **and** the chart.
- **Inline detail-header**: the two-pane right panel often gets a sticky `monitor-details` row that *acts as*
  a page header but is a component — blurring "page header region" vs "detail component".
- Settings has **no explicit footer**; form Save/Cancel live in the form's footer slot, and pagination is
  inside `FlotoPaginatedCrud`.

## Best practices

- Start every page with a **Page header** (title + breadcrumb) and put the **primary action** there.
- Add the **toolbar/filter bar** only when there's something to filter or bulk-act on; in explorers, give it
  the **control-bar** treatment (type radio + filters + saved view).
- Put the **time-range** in its own region (header-right picker or a slider row) so it visibly scopes the
  whole body.
- The body picks **one** content layout — don't combine a two-pane and a master-detail drawer on the same
  screen; escalate to **three-pane** only when a saved-views rail *and* a picker are both needed.
- Map each region to its catalogued component (PageHeader · FilterBar/GridToolbar/BulkActionBar · Table/Form ·
  FlotoPaginatedCrud pager) — see the Screen-regions **Usage** page for the linked table.
