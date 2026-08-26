# Data Visualization — Spec, Findings & Solutions

## Overview

The product's charts, stat tiles, topology map and dashboard grid — catalogued as a **decision guide, not a
web component**. Charts are **Highcharts v10** (all flow through `src/components/chart/chart.vue`), the
topology canvas is **Cytoscape.js** (`src/components/monitor-graph/graph.vue`), and the dashboard grid is
**vue-grid-layout** (`src/components/widgets/widgets.vue`). These engines are commercially licensed / heavy /
deeply app-coupled, so the DS deliberately ships **no `obs-*`** for them: the value here is machine-readable
guidance on *which* visualization to use and *how* to colour/token/state it, so an AI tool specifies a correct
dashboard and renders it with the product's component (in-repo) — or STOP-and-ASKs (standalone).

## Anatomy

- **Chart** (`chart.vue`) — registers the Highcharts modules + applies the categorical palette, wraps the
  low-level `highchart.vue` (instantiates Highcharts on a div, reflows via ResizeObserver). `props.options`
  is a plain Highcharts config.
- **Stat tiles** — metro-tile / kpi-gauge / topn / progress-with-count (single-value data-viz).
- **Topology graph** — `Graph` (`graph.vue`) over Cytoscape + extensions (panzoom, navigator minimap, dagre
  layout, HTML node labels); reused by Topology / APM / NetRoute / Alert-correlation.
- **Widget grid** — `Widgets` (GridLayout/GridItem) + `Widget` tile + `container.vue` type dispatcher +
  `widget-selector.vue` add-widget picker + `widget-title.vue` header/kebab.

## Options (the types / variants)

18 catalogued types — see the Usage page's decision flow + per-type table (mirrored in the registry
`usageRules`): trend-line, area, bar-column, pie-donut, gauge, kpi-tile, sparkline, heatmap, topn,
scatter-bubble, sankey-flow, treemap, timeline-xrange, geo-map, flame-graph, anomaly-forecast, topology-graph,
widget-grid.

## Behaviors & states

Every chart/widget has **loading** (skeleton/spinner, keep the tile chrome), **empty** (Highcharts
*no-data-to-display*, not a blank box) and **error** (inline message in the tile) states. The topology canvas
and widget grid own their own pan/zoom/drag interactions.

## Content

Series colours come from the **categorical** palette by order; status/threshold from severity tokens. Labels,
legends and tooltips use DS text tokens. Hover detail is the **Data-Viz Tooltips** family.

## Props / API

`Chart` takes a single `options: Object` (a Highcharts config). `Graph` takes nodes/edges + a layout name.
`Widgets` takes a layout of widget configs. These are the real product component APIs — the DS does not wrap
them.

## Design tokens used

`tokens/chart-palette.json` (categorical series, light + dark), `--common-widget-bg` (tile surface),
`--page-text-color`, `--border-color`, `--neutral-light` / `--neutral-lighter`, and the severity /
`--secondary-*` tokens for status/threshold encoding.

## Findings & Inconsistencies

- **No `obs-*` by design** — bundling a licensed/heavy engine into the framework-agnostic elements package
  would be wrong; guidance + the product component is the correct treatment.
- **Two map engines** — Highmaps (choropleth) and Leaflet (tiles) both back `geo-map`.
- **Heatmap / solid-gauge modules are not bundled in `chart.vue`** — they render via their own widget views;
  a generic `<Chart>` can't draw them without registering the extra module.

## Do / Don't

Do: pick the type by the question the viewer answers; colour from the categorical palette; render with the
product component; give every chart loading/empty/error. Don't: build an `obs-chart`, colour with `--primary`,
or improvise a chart standalone (STOP-and-ASK).

## Accessibility

Never encode by colour alone — label series + legend; offer a table alternative (`ChartWithGrid`) for critical
views; the canvas isn't screen-reader legible (the topology hierarchy tree is the accessible entry). See the
Accessibility page.

## Related components

`data-viz-tooltips` (the hover layer of this family), `table` (the data alternative + ChartWithGrid),
`toolbars` (widget header/kebab), `severity` (status/threshold colours), `navigation` (topology hierarchy tree).

## Changelog

See the Changelog page — catalogued 2026-07-05 as a decision guide (palette tokens + type-selection
decisionFlow + 18 usageRules).
