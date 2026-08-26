import Highcharts from 'highcharts'
import HCMore from 'highcharts/highcharts-more'
import HeatmapModule from 'highcharts/modules/heatmap'
import SolidGaugeModule from 'highcharts/modules/solid-gauge'
import cytoscape from 'cytoscape'
import * as d3 from 'd3'
import { flamegraph } from 'd3-flame-graph'
import 'd3-flame-graph/dist/d3-flamegraph.css'
import { GridLayout, GridItem } from 'vue-grid-layout'
import worldMap from '@highcharts/map-collection/custom/world.geo.json'
import defaultConfig from '@components/chart/default-config'
import getWidgetChartCommonOptions from '@components/chart/options/chart-common-options'
import Chart from '@components/chart/chart.vue'
import HighMap from '@components/widgets/views/map/highmap.vue'

// Match the product by building charts through the SAME two layers the product's widget pipeline uses:
//   1. default-config.js — transparent bg + Poppins + CSS-variable colours (themes with data-theme).
//   2. getWidgetChartCommonOptions() — the "ObserveOps look": legend, gridlines, axis label weight 500 +
//      unit-aware labels, the product tooltip box (var(--border-color), hc-tooltip-bg, radius 10), plotOptions.
// We extract that combined layer once (empty data + minimal widgetProperties) and merge each story's per-type
// options (chart type, categories, series, data) on top. Falls back to default-config if the pipeline throws.
let PRODUCT_BASE
try {
  PRODUCT_BASE = getWidgetChartCommonOptions([], { legendEnabled: true }, { omitTooltipFormatter: true })
} catch (e) {
  PRODUCT_BASE = defaultConfig
}
const withBase = (opts) => Highcharts.merge(PRODUCT_BASE, opts)

// heatmap + solid-gauge aren't in chart.vue's bundled module set — register them on the shared Highcharts
// singleton (exactly as the product's heatmap-view / gauge-view do) so the real Chart can render them here.
// Done lazily at render time (guarded) — solid-gauge needs highcharts-more first, and registering at module
// top-level is fragile during the build.
let _extras = false
function ensureChartModules() {
  if (_extras) return
  for (const mod of [HCMore, HeatmapModule, SolidGaugeModule]) { try { mod(Highcharts) } catch (e) { /* already registered */ } }
  _extras = true
}

// Organisms / Data Visualization — the product's real Highcharts wrapper `Chart`
// (src/components/chart/chart.vue). Each story mounts the ACTUAL component with the PRODUCT'S real base config
// (default-config.js, via withBase()) merged under the per-type data — so the charts MATCH the product (Poppins,
// gridlines, tooltip, transparent bg) AND theme with light/dark (the config's CSS-var colours flip). This family
// is a GUIDE, not a web component — see the Usage page. EVERY catalogued type is
// storied: the Highcharts types via the real Chart; the non-Highcharts types via their real engine/component —
// geo-map (HighMap = Chart mapChart), topology-graph (Cytoscape), widget-grid (vue-grid-layout), flame-graph
// (d3-flame-graph). topn + kpi-tile are static references (the product metro-tile is socket-wired
// so it can't render live standalone).

const box = (inner, h = 320) =>
  `<div style="height:${h}px;background:var(--common-widget-bg);padding:12px;border:1px solid var(--border-color);border-radius:8px">${inner}</div>`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

export default {
  title: 'Organisms/Data Visualization/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Organism — the product renders all charts through the real `Chart` (Highcharts v10) ' +
          'component; the topology map is Cytoscape and the dashboard grid is vue-grid-layout. This family is a ' +
          '**decision guide, not an `obs-*` web component** (Highcharts is licensed/heavy/app-coupled). The ' +
          'stories below mount the real `Chart` to show each type + the categorical palette. See **Usage** for ' +
          'which chart when, and how to render it (product component in-repo, else STOP-and-ASK).',
      },
    },
  },
  argTypes: {
    chartType: { control: { type: 'select' }, options: ['line', 'areaspline', 'column', 'bar', 'pie'] },
  },
  args: { chartType: 'line' },
}

// Playground — switch the type on the same sample data
export const Playground = (args) => ({
  components: { Chart },
  props: Object.keys(args),
  computed: {
    options() {
      return withBase({
        chart: { type: this.chartType },
        title: { text: null },
        xAxis: { categories: MONTHS },
        yAxis: { title: { text: null } },
        series:
          this.chartType === 'pie'
            ? [{ name: 'Monitors', data: [['Up', 62], ['Down', 8], ['Maintenance', 5], ['Unknown', 3]] }]
            : [
                { name: 'CPU %', data: [42, 51, 48, 63, 58, 71, 66, 74] },
                { name: 'Memory %', data: [55, 53, 60, 58, 64, 62, 69, 72] },
              ],
      })
    },
  },
  template: box('<Chart :options="options" />'),
})

const story = (options, h) => {
  const s = () => ({ components: { Chart }, beforeCreate: ensureChartModules, data: () => ({ options: withBase(options) }), template: box('<Chart :options="options" />', h) })
  s.parameters = { controls: { disable: true } }
  return s
}

// Trend over time — the default
export const LineTrend = story({
  chart: { type: 'line' }, title: { text: null }, xAxis: { categories: MONTHS }, yAxis: { title: { text: null } },
  series: [{ name: 'CPU %', data: [42, 51, 48, 63, 58, 71, 66, 74] }, { name: 'Memory %', data: [55, 53, 60, 58, 64, 62, 69, 72] }],
})

// Area / stacked — trend with volume
export const AreaStacked = story({
  chart: { type: 'areaspline' }, title: { text: null }, xAxis: { categories: MONTHS }, yAxis: { title: { text: null } },
  plotOptions: { areaspline: { stacking: 'normal' } },
  series: [{ name: 'Inbound', data: [12, 18, 15, 22, 20, 28, 24, 30] }, { name: 'Outbound', data: [9, 11, 14, 12, 17, 15, 19, 21] }],
})

// Compare categories — vertical column
export const Column = story({
  chart: { type: 'column' }, title: { text: null }, xAxis: { categories: ['Critical', 'Major', 'Warning', 'Clear'] },
  yAxis: { title: { text: null } }, legend: { enabled: false },
  series: [{ name: 'Alerts', data: [14, 23, 31, 42] }],
})

// Compare — horizontal bar (long labels)
export const BarHorizontal = story({
  chart: { type: 'bar' }, title: { text: null }, xAxis: { categories: ['core-router-01', 'db-primary', 'web-frontend', 'cache-02'] },
  yAxis: { title: { text: null } }, legend: { enabled: false },
  series: [{ name: 'CPU %', data: [74, 66, 51, 38] }],
})

// Part-to-whole — donut
export const PieDonut = story({
  chart: { type: 'pie' }, title: { text: null },
  plotOptions: { pie: { innerSize: '62%' } },
  series: [{ name: 'Monitors', data: [['Up', 62], ['Down', 8], ['Maintenance', 5], ['Unknown', 3]] }],
})

// Inline micro-trend — sparkline (no axes/legend)
export const Sparkline = story({
  chart: { type: 'area', height: 60, margin: [2, 2, 2, 2] }, title: { text: null }, credits: { enabled: false },
  xAxis: { visible: false }, yAxis: { visible: false }, legend: { enabled: false }, tooltip: { outside: true },
  plotOptions: { series: { marker: { enabled: false }, lineWidth: 1.5, fillOpacity: 0.15 } },
  series: [{ data: [3, 4, 3, 5, 4, 6, 5, 7, 6, 8] }],
}, 90)

// Flow between nodes — sankey
export const Sankey = story({
  chart: { type: 'sankey' }, title: { text: null },
  series: [{ keys: ['from', 'to', 'weight'], data: [['Web', 'App', 30], ['App', 'DB', 22], ['App', 'Cache', 12], ['Web', 'CDN', 10]] }],
})

// Status / duration over time — x-range (SLO / availability)
export const StatusXRange = story({
  chart: { type: 'xrange' }, title: { text: null },
  xAxis: { type: 'datetime' }, yAxis: { categories: ['web', 'db', 'cache'], title: { text: null }, reversed: true },
  legend: { enabled: false },
  series: [{
    name: 'Uptime', pointWidth: 16, borderRadius: 3,
    data: [
      { x: Date.UTC(2026, 6, 1), x2: Date.UTC(2026, 6, 4), y: 0 },
      { x: Date.UTC(2026, 6, 2), x2: Date.UTC(2026, 6, 5), y: 1 },
      { x: Date.UTC(2026, 6, 1), x2: Date.UTC(2026, 6, 3), y: 2 },
    ],
  }],
})

// Single value vs a threshold — angular gauge (highcharts-more, bundled)
export const Gauge = story({
  chart: { type: 'gauge' }, title: { text: null }, pane: { startAngle: -90, endAngle: 90, background: null },
  yAxis: { min: 0, max: 100, tickInterval: 25, title: { text: 'CPU %' }, labels: { distance: 14 } },
  series: [{ name: 'CPU', data: [74], dataLabels: { format: '{y}%', borderWidth: 0 } }],
})

// Single value vs a threshold — solid gauge (module registered above)
export const SolidGauge = story({
  chart: { type: 'solidgauge' }, title: { text: null },
  pane: { center: ['50%', '72%'], size: '100%', startAngle: -90, endAngle: 90,
    background: { innerRadius: '62%', outerRadius: '100%', shape: 'arc' } },
  yAxis: { min: 0, max: 100, lineWidth: 0, tickAmount: 2, stops: [[0.1, '#14b053'], [0.55, '#e8b407'], [0.9, '#ec5b5b']], labels: { y: 16 } },
  series: [{ data: [74], dataLabels: { format: '{y}%', borderWidth: 0 } }],
})

// Correlation of two metrics — scatter
export const Scatter = story({
  chart: { type: 'scatter' }, title: { text: null },
  xAxis: { title: { text: 'Latency (ms)' } }, yAxis: { title: { text: 'Throughput' } }, legend: { enabled: false },
  series: [{ name: 'Endpoints', data: [[12, 80], [20, 60], [8, 95], [30, 45], [16, 70], [24, 52], [10, 88]] }],
})

// Distribution by size — packed bubble (highcharts-more, bundled)
export const PackedBubble = story({
  chart: { type: 'packedbubble' }, title: { text: null }, legend: { enabled: false },
  series: [{ name: 'Hosts', data: [{ value: 40, name: 'web' }, { value: 25, name: 'db' }, { value: 15, name: 'cache' }, { value: 30, name: 'app' }, { value: 12, name: 'queue' }] }],
})

// Hierarchical part-to-whole by area — treemap (bundled)
export const Treemap = story({
  chart: { type: 'treemap' }, title: { text: null },
  series: [{ type: 'treemap', layoutAlgorithm: 'squarified', data: [{ name: 'Logs', value: 40 }, { name: 'Metrics', value: 30 }, { name: 'Traces', value: 20 }, { name: 'Events', value: 10 }] }],
})

// Events over time — timeline (bundled)
export const Timeline = story({
  chart: { type: 'timeline' }, title: { text: null }, xAxis: { visible: false }, yAxis: { visible: false }, legend: { enabled: false },
  series: [{ data: [
    { name: 'Deploy', label: 'v2.1 released' },
    { name: 'Alert', label: 'CPU high on core-router-01' },
    { name: 'Ack', label: 'acknowledged' },
    { name: 'Resolved', label: 'back to normal' },
  ] }],
})

// Trend with an anomaly / forecast band — line + arearange (highcharts-more, bundled)
export const AnomalyBand = story({
  chart: { type: 'line' }, title: { text: null }, xAxis: { categories: MONTHS }, yAxis: { title: { text: null } },
  series: [
    { name: 'Expected range', type: 'arearange', data: [[44, 60], [46, 62], [50, 66], [52, 70], [56, 74], [58, 78], [60, 80], [62, 84]], lineWidth: 0, fillOpacity: 0.18, zIndex: 0, marker: { enabled: false } },
    { name: 'CPU %', type: 'line', data: [50, 54, 58, 61, 66, 90, 71, 74], zIndex: 1 },
  ],
})

// Density across two dimensions (host × time) — heatmap (module registered above)
export const Heatmap = story({
  chart: { type: 'heatmap' }, title: { text: null },
  xAxis: { categories: ['00h', '06h', '12h', '18h'] }, yAxis: { categories: ['web', 'db', 'cache'], title: { text: null } },
  colorAxis: { min: 0, minColor: '#e3e8f2', maxColor: '#ec5b5b' }, legend: { enabled: false },
  series: [{ name: 'Load', borderWidth: 1, data: [
    [0, 0, 10], [1, 0, 20], [2, 0, 40], [3, 0, 30],
    [0, 1, 15], [1, 1, 25], [2, 1, 35], [3, 1, 22],
    [0, 2, 5], [1, 2, 12], [2, 2, 22], [3, 2, 18],
  ], dataLabels: { enabled: true, color: '#1d2a3e' } }],
})

// ── The 6 non-Highcharts types — mounted via their REAL engine/component ──────────────────────────

// Geo map — the real HighMap component (Chart in mapChart mode) + the world map
export const GeoMap = () => ({
  components: { HighMap },
  data: () => ({
    options: {
      chart: { map: worldMap, backgroundColor: 'transparent', style: { fontFamily: 'var(--chart-font-family)' } }, title: { text: null }, credits: { enabled: false },
      colorAxis: { min: 0, minColor: '#e3e8f2', maxColor: '#3279be' },
      series: [{ name: 'Sessions', joinBy: ['hc-key', 'key'], borderColor: '#c9d3e3', borderWidth: 0.5,
        data: [{ key: 'us', value: 30 }, { key: 'in', value: 45 }, { key: 'gb', value: 18 }, { key: 'de', value: 12 }, { key: 'br', value: 20 }, { key: 'au', value: 9 }] }],
    },
  }),
  template: box('<HighMap :options="options" constructor-type="mapChart" />'),
})
GeoMap.parameters = { controls: { disable: true } }

// Dashboard widget-grid — the real vue-grid-layout engine (draggable + resizable tiles)
export const WidgetGrid = () => ({
  components: { GridLayout, GridItem },
  data: () => ({ layout: [
    { x: 0, y: 0, w: 4, h: 5, i: '0' }, { x: 4, y: 0, w: 4, h: 5, i: '1' }, { x: 8, y: 0, w: 4, h: 5, i: '2' },
    { x: 0, y: 5, w: 6, h: 5, i: '3' }, { x: 6, y: 5, w: 6, h: 5, i: '4' },
  ] }),
  template: `<div style="height:380px;overflow:auto;background:var(--common-main-bg);border:1px solid var(--border-color);border-radius:8px">
    <grid-layout :layout.sync="layout" :col-num="12" :row-height="28" :is-draggable="true" :is-resizable="true" :margin="[10, 10]" :use-css-transforms="true">
      <grid-item v-for="it in layout" :key="it.i" :x="it.x" :y="it.y" :w="it.w" :h="it.h" :i="it.i"
        style="background:var(--common-widget-bg);border:1px solid var(--border-color);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--neutral-regular);font-size:.85rem">
        Widget {{ Number(it.i) + 1 }} — drag / resize
      </grid-item>
    </grid-layout>
  </div>`,
})
WidgetGrid.parameters = { controls: { disable: true } }

// Topology graph — the real Cytoscape engine (severity-coloured node-edge map)
export const TopologyGraph = () => ({
  template: '<div ref="cy" style="height:360px;background:var(--common-widget-bg);border:1px solid var(--border-color);border-radius:8px"></div>',
  mounted() {
    const SEV = { critical: '#ec5b5b', warning: '#e8b407', clear: '#14b053' }
    const nodes = [
      { data: { id: 'core', label: 'core-router', sev: 'clear' } }, { data: { id: 'db', label: 'db-primary', sev: 'critical' } },
      { data: { id: 'web', label: 'web-frontend', sev: 'clear' } }, { data: { id: 'cache', label: 'cache-02', sev: 'warning' } },
      { data: { id: 'app', label: 'app-01', sev: 'clear' } },
    ]
    const edges = [['core', 'db'], ['core', 'web'], ['web', 'app'], ['app', 'db'], ['app', 'cache']].map(([source, target]) => ({ data: { source, target } }))
    cytoscape({ container: this.$refs.cy, elements: [...nodes, ...edges], layout: { name: 'cose', padding: 24 },
      style: [
        { selector: 'node', style: { 'background-color': (e) => SEV[e.data('sev')] || '#7186a8', label: 'data(label)', color: '#5b6b86', 'font-size': 10, 'text-valign': 'bottom', 'text-margin-y': 4, width: 22, height: 22 } },
        { selector: 'edge', style: { width: 2, 'line-color': '#c9d3e3', 'curve-style': 'bezier' } },
      ] })
  },
})
TopologyGraph.parameters = { controls: { disable: true } }

// Flame graph — the real d3-flame-graph engine (trace / call-stack). The flame rects use the library's fixed
// palette (a flame-graph convention), but the frame LABEL text is themed to a DS token so it stays legible in
// dark mode.
export const FlameGraph = () => ({
  template: '<div class="dv-flame" ref="fg" style="background:var(--common-widget-bg);border:1px solid var(--border-color);border-radius:8px;padding:8px;min-height:220px"></div>',
  mounted() {
    const data = { name: 'request', value: 100, children: [
      { name: 'auth', value: 20, children: [{ name: 'jwt.verify', value: 12, children: [] }] },
      { name: 'db.query', value: 50, children: [{ name: 'pg.exec', value: 38, children: [] }, { name: 'serialize', value: 8, children: [] }] },
      { name: 'render', value: 25, children: [{ name: 'template', value: 15, children: [] }] },
    ] }
    const chart = flamegraph().width((this.$refs.fg && this.$refs.fg.clientWidth) || 600).cellHeight(20).minFrameSize(1)
    d3.select(this.$refs.fg).datum(data).call(chart)
    // theme the frame LABELS to a DS token so they stay legible in dark mode (the flame rects keep the
    // library's conventional fixed palette)
    const st = document.createElement('style')
    st.textContent = '.dv-flame .d3-flame-graph-label, .dv-flame text, .dv-flame .frame text { fill: var(--page-text-color) !important; color: var(--page-text-color) !important; }'
    this.$refs.fg.appendChild(st)
  },
})
FlameGraph.parameters = { controls: { disable: true } }

// Top-N — a faithful static reference (the product's topn-view fires app/user API calls on import, so it
// can't render standalone). Ranked list with inline bars, DS tokens.
export const TopN = () => ({
  data: () => ({ rows: [
    { label: 'core-router-01', value: 74 }, { label: 'db-primary', value: 66 },
    { label: 'web-frontend', value: 51 }, { label: 'cache-02', value: 38 }, { label: 'app-01', value: 27 },
  ] }),
  template: box(`<div style="display:flex;flex-direction:column;gap:12px;padding:6px 4px">
      <div v-for="r in rows" :key="r.label" style="display:flex;align-items:center;gap:10px;font-size:.82rem">
        <span style="width:120px;color:var(--page-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ r.label }}</span>
        <span style="flex:1;height:10px;background:var(--neutral-lighter);border-radius:5px;overflow:hidden">
          <span :style="{display:'block',height:'100%',width:r.value+'%',background:'var(--primary-alt)',borderRadius:'5px'}"></span>
        </span>
        <span style="width:34px;text-align:right;color:var(--neutral-regular)">{{ r.value }}%</span>
      </div>
    </div>`, 220),
})
TopN.parameters = { controls: { disable: true } }

// KPI / metro tile — the product's metro-tile is socket-wired (live counters), so it can't render
// standalone; this is a faithful static reference of the same tile built from DS tokens.
export const KpiTile = () => ({
  template: box(`<div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:8px;padding:4px 8px">
      <div style="font-size:.8rem;color:var(--neutral-light)">Active Monitors</div>
      <div style="font-size:2.4rem;font-weight:700;line-height:1;color:var(--page-text-color)">1,204</div>
      <div style="font-size:.8rem;color:var(--secondary-green)">▲ 3.2% vs last week</div>
    </div>`, 150),
})
KpiTile.parameters = { controls: { disable: true } }
