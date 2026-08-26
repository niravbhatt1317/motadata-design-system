# Data-Viz Tooltips — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule (reference patterns) |
| **Maturity** | 🟢 Stable |
| **Source** | `src/components/chart/options/tooltip-builder.js` (`TooltipBuilder`) + `.hc-tooltip-bg` / `.highcharts-tooltip-container-class` (Highcharts) · `heatmap-tooltip.vue` + sparkline (Vue widgets) · graph canvases (vis-network / d3, `--topology-graph-tooltip-bg`) · d3 flame graph. |
| **Storybook** | Molecules/Data-Viz Tooltips |
| **Registry** | [`registry/data-viz-tooltips.json`](../registry/data-viz-tooltips.json) |
| **Family** | Tooltip family (see also [`tooltip.md`](./tooltip.md)) |

## Why this is a family

The product's **chart & widget hover tooltips** are a **distinct family from `MTooltip`** — they are
**not** DS Vue components. They are owned by the **chart layer**: most are rendered by Highcharts via
the shared **`TooltipBuilder`**, the graph tooltips by canvas libraries (vis-network / d3), and a few by
widget Vue components (heatmap, sparkline). We catalogue them as **reference reproductions** (built from
real tokens — `--chart-tooltip-background`, `--severity-*`, `--topology-graph-tooltip-bg`) so a designer
or AI can map **place → tooltip** without us re-implementing chart internals.

## Render mechanisms (the 4 surfaces)

| Mechanism | Surface token / class | Tooltips |
| --- | --- | --- |
| **Highcharts `TooltipBuilder`** | `--chart-tooltip-background` + `blur(15px)` (`hc-tooltip-bg`) | series/bar, donut/pie, bubble, map/geo, radar, timeline/x-range, gauge, sankey, treemap, scatter, anomaly/forecast band, RUM waterfall, geo marker, log-pattern, sparkline |
| **Vue widget component** | component-scoped | heatmap (`heatmap-tooltip.vue`), alert/availability segment, availability bar |
| **Graph canvas** (vis-network / d3) | `--topology-graph-tooltip-bg` (fixed-dark both themes) | live-graph node/edge, APM service-map node, SDN tunnel edge, Cisco ACI endpoint/link, network interface edge, netroute node/edge |
| **d3 flame graph** | `hc-tooltip-bg` surface | flame-graph span (APM / RUM traces) |

## Which tooltip → where (lookup)

| Tooltip | Where used | Renderer |
| --- | --- | --- |
| Bar / series | severity/metric stacked columns & line charts | Highcharts `TooltipBuilder` |
| Donut / pie | status/distribution donuts | Highcharts |
| Bubble (packed-bubble) | grouped-count bubble widgets | Highcharts |
| Map / geo | geo-distribution maps | Highcharts |
| Radar | multi-axis comparison | Highcharts |
| Timeline / x-range | SLO / availability timelines | Highcharts |
| Gauge / circular-progress | KPI gauges | Highcharts |
| Sankey / flow | flow / traffic sankey | Highcharts |
| Treemap | capacity / hierarchy treemaps | Highcharts |
| Scatter (x / y) | correlation scatter | Highcharts |
| Anomaly / forecast band | anomaly & forecast charts (actual vs expected range) | Highcharts |
| RUM resource waterfall | RUM page resource timing | Highcharts |
| Geo map marker (RUM apdex) | RUM geo apdex map | Highcharts |
| Log pattern distribution | log pattern value distribution | Highcharts |
| Sparkline | inline mini-trends (grid cells, KPIs) | Highcharts (mini) |
| Heatmap | heatmap widgets | `heatmap-tooltip.vue` |
| Alert / availability segment | segmented availability cells | Vue (segmented-cell) |
| Availability bar segment | Up/Down % bars | Vue |
| Live graph — node | topology / netroute maps | graph canvas |
| Live graph — edge | link / interface edges | graph canvas |
| APM service-map node | APM service map | graph canvas |
| SDN tunnel edge | SD-WAN tunnels | graph canvas |
| Cisco ACI endpoint | ACI endpoint edges | graph canvas |
| Cisco ACI fabric link | ACI fabric links | graph canvas |
| Network interface edge | interface topology | graph canvas |
| Netroute hop node | netroute path hops | graph canvas |
| Netroute edge (transit) | netroute transit edges | graph canvas |
| Flame graph span | APM / RUM trace flame graphs | d3 flame graph |

## Accessibility

- These are **hover-only, canvas/SVG-rendered** surfaces — they are **not keyboard-reachable** and not
  exposed to assistive tech (a known limitation of the chart libraries). Where the underlying data
  matters for a11y, it must also be available in an adjacent **table / legend** (verify per widget).

## Design tokens used

`--chart-tooltip-background` · `--topology-graph-tooltip-bg` · `--tooltip-text-color` ·
`--severity-{down,unreachable,critical,major,warning,up,…}` · `--page-text-color` · `--border-color`.

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low | Noted | Owned by the chart layer (Highcharts/vis-network/d3), **not** DS components → catalogued as **reference reproductions** (real tokens), not live renders. |
| F2 | Low (a11y) | Open | Hover-only, canvas-rendered → not keyboard-reachable / not in the a11y tree; ensure the data also exists in a table/legend. |

## Related components

**Tooltip** (`MTooltip` — the UI/text tooltip family) · **Table** (sparkline cells) · the chart/widget
layer (`src/components/chart`, `src/components/widgets`).

## Changelog

- **2026-06-16** — Added the **registry + spec** (this page) and a **which-tooltip→where** lookup table,
  so the family matches the "four pages move together" rule (it was previously a **story only**). No
  story changes — the ~28 reference reproductions already cover every mechanism (Highcharts series,
  donut, bubble, map, radar, timeline, gauge, sankey, treemap, scatter, anomaly band, waterfall, geo
  marker, log-pattern, sparkline; heatmap & segment Vue widgets; 9 graph-canvas node/edge tooltips; the
  d3 flame graph). Findings F1 (reproduction), F2 (a11y).
