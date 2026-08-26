// Showcase manifest for <obs-dataviz-tooltip> — the chart & widget hover tooltips (reference reproductions).
const CHART = ['bar', 'donut', 'heatmap', 'sparkline', 'flame', 'bubble', 'map-geo', 'radar', 'timeline', 'gauge', 'sankey', 'treemap', 'scatter', 'anomaly', 'alert-segment', 'resource-waterfall', 'geo-marker', 'availability-bar', 'log-distribution']
const GRAPH = ['graph-node', 'graph-edge', 'service-map', 'sdn-tunnel', 'aci-endpoint', 'aci-link', 'interface-edge', 'netroute-node', 'netroute-edge']
export default {
  el: 'obs-dataviz-tooltip',
  display: 'Data-Viz Tooltips',
  controls: [
    { prop: 'kind', type: 'select', options: [...CHART, ...GRAPH] },
    { prop: 'block', type: 'toggle', label: 'Full width (block)' },
  ],
  playground: { attrs: { kind: 'bar' } },
  gallery: [
    { group: 'Chart & widget tooltips — hc-tooltip-bg (translucent --chart-tooltip-background + blur)', items:
      CHART.map((k) => ({ attrs: { kind: k } })) },
    { group: 'Live-graph tooltips — dark --topology-graph-tooltip-bg (node / edge)', items:
      GRAPH.map((k) => ({ attrs: { kind: k } })) },
    { group: 'Full width (block) — the card stretches to its container instead of its intrinsic width', items: [
      { html: '<div style="width:100%"><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:\'JetBrains Mono\',monospace;margin-bottom:6px">kind="log-distribution" block</div><obs-dataviz-tooltip kind="log-distribution" block></obs-dataviz-tooltip></div>' },
      { html: '<div style="width:100%"><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:\'JetBrains Mono\',monospace;margin-bottom:6px">kind="graph-node" block</div><obs-dataviz-tooltip kind="graph-node" block></obs-dataviz-tooltip></div>' },
    ] },
  ],
}
