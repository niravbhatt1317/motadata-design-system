// Molecules / Data-Viz Tooltips — the chart & widget hover tooltips. These are NOT MTooltip:
// they're rendered by Highcharts (via src/components/chart/options/tooltip-builder.js +
// .hc-tooltip-bg / .highcharts-tooltip-container-class) or by widget components
// (heatmap-tooltip.vue, sparkline). Shown here as faithful REFERENCE reproductions (real tokens:
// --chart-tooltip-background, --severity-*) so the catalog covers every tooltip kind in the
// product — the styling is owned by the chart layer, not a DS Vue component.

const PANEL = 'background:var(--chart-tooltip-background);backdrop-filter:blur(15px);border-radius:4px;box-shadow:0 4px 16px var(--neutral-shadow-light);color:var(--page-text-color);font-size:11px'
const SEV = { down: 'var(--severity-down)', unreachable: 'var(--severity-unreachable)', critical: 'var(--severity-critical)', major: 'var(--severity-major)', warning: 'var(--severity-warning)', up: 'var(--severity-up)' }

export default {
  title: 'Molecules/Data-Viz Tooltips/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · The **chart & widget hover tooltips** — a distinct family from `MTooltip`. Highcharts renders them via the shared **`TooltipBuilder`** (`src/components/chart/options/tooltip-builder.js`) styled by **`hc-tooltip-bg`** / **`highcharts-tooltip-container-class`** (translucent `--chart-tooltip-background` + `blur(15px)`); widget tooltips (heatmap, sparkline) are Vue components. Shown here as **reference reproductions** (real tokens) — the styling is owned by the chart layer, not a DS component.',
      },
    },
  },
}

// Image 20 — a stacked column/bar tooltip: a title + one row per series (color square · name · value).
export const ChartBar = () => ({
  data: () => ({ rows: [['Down', 'down', 0], ['Unreachable', 'unreachable', 0], ['Critical', 'critical', 34], ['Major', 'major', 2], ['Warning', 'warning', 15]], sev: SEV }),
  template: `
    <div style="padding:40px">
      <div :style="'${PANEL};padding:10px 14px;min-width:230px'">
        <div class="font-bold" style="font-size:12px;margin-bottom:8px">Metric Threshold</div>
        <div v-for="r in rows" :key="r[0]" class="flex items-center justify-between" style="padding:2px 0">
          <div class="flex items-center">
            <span :style="{ width:'8px', height:'8px', borderRadius:'1px', marginRight:'8px', display:'inline-block', background: sev[r[1]] }"></span>
            <span>{{ r[0] }}</span>
          </div>
          <span class="font-bold" style="margin-left:32px">{{ r[2] }}</span>
        </div>
      </div>
    </div>`,
})
ChartBar.storyName = 'Chart tooltip — bar / series (Highcharts)'
ChartBar.parameters = { docs: { description: { story: 'The **Highcharts series tooltip** (`TooltipBuilder`) — a **title** + one row per series: an **8×8 color square** · the series name · the right-aligned **value**. This is the bar/column/line widget hover (e.g. the **Metric Threshold** severity breakdown). Panel = `hc-tooltip-bg` (`--chart-tooltip-background` + `blur(15px)`).' } } }

// Image 21 — a donut/pie tooltip: same panel, a single series row.
export const ChartDonut = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px">
      <div :style="'${PANEL};padding:10px 14px;min-width:180px'">
        <div class="font-bold" style="font-size:12px;margin-bottom:8px">Availability</div>
        <div class="flex items-center justify-between" style="padding:2px 0">
          <div class="flex items-center">
            <span :style="{ width:'8px', height:'8px', borderRadius:'1px', marginRight:'8px', display:'inline-block', background: sev.up }"></span>
            <span>Up</span>
          </div>
          <span class="font-bold" style="margin-left:32px">1</span>
        </div>
      </div>
    </div>`,
})
ChartDonut.storyName = 'Chart tooltip — donut / pie (Highcharts)'
ChartDonut.parameters = { docs: { description: { story: 'The **donut / pie** variant — same `TooltipBuilder` panel, a single series row (e.g. **Availability → Up 1**). Pie tooltips omit the date/time header.' } } }

// Image 22 — the heatmap hex tooltip (heatmap-tooltip.vue): primary/secondary label + a severity badge.
export const Heatmap = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px">
      <div :style="'${PANEL};display:flex;align-items:stretch;overflow:hidden;min-width:300px'">
        <div class="flex flex-col justify-center" style="flex:1;min-width:0;padding:10px 12px">
          <span class="font-500" style="font-size:14px">172.16.9.243</span>
          <span class="text-neutral-regular" style="font-size:11px">motadata(172.16.9.243)</span>
        </div>
        <div class="flex items-center justify-center font-500" :style="{ padding:'8px 18px', color:'var(--white-regular)', background: sev.warning }">Warning</div>
      </div>
    </div>`,
})
Heatmap.storyName = 'Heatmap tooltip (heatmap-tooltip.vue)'
Heatmap.parameters = { docs: { description: { story: 'The **hex heatmap** tooltip (`heatmap-tooltip.vue`, wrapped in a `.heatmap-tooltip` popover) — a **primary label** (IP/host) + **secondary** (instance) on the left, and a **severity badge** (the monitor\'s status color) on the right. Background is `--chart-tooltip-background`; the badge uses `--severity-*`.' } } }

// Sparkline tooltip — small chart-bg bubble with a value + timestamp.
export const Sparkline = () => ({
  template: `
    <div style="padding:40px">
      <div :style="'${PANEL};padding:6px 10px;min-width:120px'">
        <div class="font-bold" style="font-size:11px;margin-bottom:2px">12:30:00</div>
        <div class="flex items-center">
          <span style="width:8px;height:8px;border-radius:1px;margin-right:8px;display:inline-block;background:var(--primary-alt)"></span>
          <span>CPU&nbsp;</span><span class="font-bold" style="margin-left:auto">74%</span>
        </div>
      </div>
    </div>`,
})
Sparkline.storyName = 'Sparkline tooltip'
Sparkline.parameters = { docs: { description: { story: 'The **sparkline** mini-chart tooltip (`sparkline-options.vue`, className `shadow-lg hc-tooltip-bg sparkline-tooltip`) — the same `hc-tooltip-bg` surface, compacted: a timestamp + a value row.' } } }

// LIVE GRAPH node tooltip — topology / netroute / APM service-map node hover (10+3+2 components).
// A monitor info card on the graph canvas: severity dot + name | IP | type, tags, and metric rows.
// Surface = --topology-graph-tooltip-bg.
// NOTE: --topology-graph-tooltip-bg is DARK navy in BOTH themes (graph tooltips are fixed-dark
// overlays), so the text must be LIGHT in both — use --tooltip-text-color (white in light /
// light-grey in dark), NOT --page-text-color (which flips dark in light theme → invisible).
const GRAPH_PANEL = 'background:var(--topology-graph-tooltip-bg);border:1px solid var(--border-color);border-radius:6px;box-shadow:0 6px 20px var(--neutral-shadow-light);color:var(--tooltip-text-color);font-size:12px;min-width:300px'
export const LiveGraphNode = () => ({
  data: () => ({ sev: SEV, metrics: [['CPU Utilization', '74 %'], ['Memory Utilization', '61 %'], ['Interface In', '120 Mbps']] }),
  template: `
    <div style="padding:40px">
      <div :style="'${GRAPH_PANEL}'">
        <div class="flex items-center" style="padding:10px 14px;border-bottom:1px solid var(--border-color)">
          <span :style="{ width:'9px', height:'9px', borderRadius:'50%', marginRight:'8px', display:'inline-block', background: sev.major }"></span>
          <span class="font-600">core-switch-01</span>
          <span class="text-neutral-light" style="margin:0 8px">|</span><span class="text-neutral-light">10.0.0.1</span>
          <span class="text-neutral-light" style="margin:0 8px">|</span><span class="text-neutral-light">Switch</span>
        </div>
        <div style="padding:8px 14px">
          <div v-for="m in metrics" :key="m[0]" class="flex items-center justify-between" style="padding:3px 0">
            <span class="text-neutral-light">{{ m[0] }}</span><span class="font-600" style="margin-left:32px">{{ m[1] }}</span>
          </div>
        </div>
      </div>
    </div>`,
})
LiveGraphNode.storyName = 'Live graph — node tooltip (topology / netroute)'
LiveGraphNode.parameters = { docs: { description: { story: 'The **live graph (canvas) node tooltip** — shown on hovering a node in **topology / netroute / APM service-map** graphs (15 module components: topology 10 · netroute 3 · APM 2). A **monitor info card**: a **severity dot** + name | IP | type header (`tooltip-border-bot`), then metric rows. Surface = **`--topology-graph-tooltip-bg`**. Edge tooltips follow the same archetype (link A↔B + interface metrics).' } } }

// FLAME GRAPH tooltip — d3-flame-graph (APM traces + RUM). A span panel on the hc-tooltip-bg surface.
export const FlameGraph = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px">
      <div :style="'${PANEL};padding:10px 14px;min-width:260px'">
        <div class="font-600" style="font-size:12px;margin-bottom:6px">GET /api/v1/monitors</div>
        <div class="flex items-center justify-between" style="padding:2px 0"><span class="text-neutral-light">Self time</span><span class="font-bold">12.4 ms</span></div>
        <div class="flex items-center justify-between" style="padding:2px 0"><span class="text-neutral-light">Total time</span><span class="font-bold">148.7 ms</span></div>
        <div class="flex items-center justify-between" style="padding:2px 0"><span class="text-neutral-light">% of trace</span><span class="font-bold">63%</span></div>
        <div style="margin-top:6px;height:4px;border-radius:2px;background:var(--neutral-lighter);overflow:hidden"><div :style="{ width:'63%', height:'100%', background: sev.warning }"></div></div>
      </div>
    </div>`,
})
FlameGraph.storyName = 'Flame graph tooltip (APM / RUM traces)'
FlameGraph.parameters = { docs: { description: { story: 'The **flame-graph** span tooltip (`d3-flame-graph.vue`, class `hc-tooltip-bg flame-tooltip`) — shown on hovering a span in **APM trace** / **RUM performance** flame graphs (14 files). The span name + **self / total time** + **% of trace** with a proportion bar. Same `hc-tooltip-bg` surface as the chart tooltips, plus a connector line to the span.' } } }

// ---- Remaining Highcharts chart-type tooltips (same hc-tooltip-bg surface, distinct content) ----

// Bubble (packed-bubble): "<name>: <value>"  — bubble-options.vue
export const Bubble = () => ({
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 12px;min-width:150px'">
      <div class="flex items-center">
        <span style="width:10px;height:10px;border-radius:50%;margin-right:8px;display:inline-block;background:var(--primary-alt)"></span>
        <span>Ubuntu 22.04:&nbsp;</span><span class="font-bold">42</span>
      </div>
    </div></div>`,
})
Bubble.storyName = 'Chart tooltip — bubble (packed-bubble)'
Bubble.parameters = { docs: { description: { story: '**Packed-bubble** widget tooltip (`bubble-options.vue`) — `<name>: <value>` for the hovered bubble (e.g. an OS/category distribution). Same `hc-tooltip-bg` surface.' } } }

// Map / geo: region name + key:value rows  — map-chart-options.vue
export const MapGeo = () => ({
  data: () => ({ rows: [['Monitors', 18], ['Down', 2], ['Critical', 5]] }),
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 12px;min-width:170px'">
      <div class="font-bold" style="font-size:12px;margin-bottom:4px">California</div>
      <div v-for="r in rows" :key="r[0]" class="flex justify-between" style="padding:1px 0"><span class="text-neutral-light">{{ r[0] }}</span><span class="font-500" style="margin-left:24px">{{ r[1] }}</span></div>
    </div></div>`,
})
MapGeo.storyName = 'Chart tooltip — map / geo'
MapGeo.parameters = { docs: { description: { story: '**Geo map** widget tooltip (`map-chart-options.vue`) — the **region name** (bold) + its option **key : value** rows (monitor counts by location). Same `hc-tooltip-bg` surface.' } } }

// Radar: client name (bold) + value + unit  — radar-chart-options.vue
export const Radar = () => ({
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 12px;min-width:140px'">
      <div class="font-500">Client A</div>
      <div class="font-bold">74 Mbps</div>
    </div></div>`,
})
Radar.storyName = 'Chart tooltip — radar'
Radar.parameters = { docs: { description: { story: '**Radar** comparison widget tooltip (`radar-chart-options.vue`) — the series/**client name** (medium) + the axis **value + unit**. Same `hc-tooltip-bg` surface.' } } }

// Timeline / x-range (SLO): "<resource> entered into status <status> at <time>"  — timeline-chart-options.vue
export const Timeline = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 12px;max-width:280px'">
      <span>web-server-01 entered into status </span><span class="font-bold" :style="{ color: sev.critical }">Critical</span><span> at 12:30:00</span>
    </div></div>`,
})
Timeline.storyName = 'Chart tooltip — timeline / x-range (SLO)'
Timeline.parameters = { docs: { description: { story: '**SLO / availability timeline** (x-range) tooltip (`timeline-chart-options.vue`) — a sentence: *"&lt;resource&gt; entered into status &lt;status&gt; at &lt;time&gt;"*. Same `hc-tooltip-bg` surface.' } } }

// Gauge / circular-progress: a percentage  — gauge.vue / circular-progress-options.vue
export const Gauge = () => ({
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 14px;min-width:120px;text-align:center'">
      <div class="text-neutral-light" style="font-size:11px">CPU Utilization</div>
      <div class="font-bold" style="font-size:20px">74%</div>
    </div></div>`,
})
Gauge.storyName = 'Chart tooltip — gauge / circular-progress'
Gauge.parameters = { docs: { description: { story: '**Solid-gauge / circular-progress / KPI gauge** tooltip (`gauge.vue`, `circular-progress-options.vue`) — the metric label + its **percentage / value**. Same `hc-tooltip-bg` surface.' } } }

// Sankey / flow: link weight (from -> to)  — sankey-options.vue (via TooltipBuilder weight/sum)
export const Sankey = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 12px;min-width:180px'">
      <div class="flex items-center" style="padding:2px 0">
        <span style="width:8px;height:8px;border-radius:1px;margin-right:8px;display:inline-block;background:var(--primary)"></span>
        <span>WAN&nbsp;→&nbsp;Core&nbsp;</span><span class="font-bold" style="margin-left:auto">1.2 Gbps</span>
      </div>
    </div></div>`,
})
Sankey.storyName = 'Chart tooltip — sankey / flow'
Sankey.parameters = { docs: { description: { story: '**Sankey / flow** widget tooltip (`sankey-options.vue`, via `TooltipBuilder` node sum / link weight) — the **link (from → to)** or node + its **weight** (traffic flow / dependency). Same `hc-tooltip-bg` surface.' } } }

// Treemap: node path + value  — tree-map-with-levels.vue
export const Treemap = () => ({
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 12px;min-width:170px'">
      <div class="font-bold" style="font-size:12px;margin-bottom:2px">Production / web-tier</div>
      <div class="flex justify-between"><span class="text-neutral-light">Monitors</span><span class="font-500" style="margin-left:24px">42</span></div>
    </div></div>`,
})
Treemap.storyName = 'Chart tooltip — treemap'
Treemap.parameters = { docs: { description: { story: '**Treemap** widget tooltip (`tree-map-with-levels.vue`) — the node **path / label** + its **value** (group → tier breakdown). Same `hc-tooltip-bg` surface.' } } }

// Live graph — EDGE tooltip: link A <-> B + interface in/out  — *-edge-tooltip.vue
export const LiveGraphEdge = () => ({
  data: () => ({ rows: [['In', '120 Mbps'], ['Out', '86 Mbps'], ['Utilization', '34 %']] }),
  template: `
    <div style="padding:40px"><div :style="'${GRAPH_PANEL}'">
      <div class="flex items-center font-600" style="padding:10px 14px;border-bottom:1px solid var(--border-color)">
        core-switch-01 <span class="text-neutral-light" style="margin:0 8px">↔</span> edge-router-02
      </div>
      <div style="padding:8px 14px">
        <div class="text-neutral-light" style="font-size:11px;margin-bottom:4px">GigabitEthernet0/1</div>
        <div v-for="r in rows" :key="r[0]" class="flex items-center justify-between" style="padding:3px 0"><span class="text-neutral-light">{{ r[0] }}</span><span class="font-600" style="margin-left:32px">{{ r[1] }}</span></div>
      </div>
    </div></div>`,
})
LiveGraphEdge.storyName = 'Live graph — edge tooltip (link / interface)'
LiveGraphEdge.parameters = { docs: { description: { story: 'The **live graph edge tooltip** — hovering a **link** between two nodes in topology / netroute / service-map (incl. **SDN**, **Cisco ACI**, network-interface edges). Shows the **A ↔ B** endpoints + the **interface** name and **in / out / utilization** metrics. Surface `--topology-graph-tooltip-bg` (same as the node tooltip).' } } }

// Scatter — point x/y  — type:'scatter'
export const Scatter = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 12px;min-width:170px'">
      <div class="font-bold" style="font-size:11px;margin-bottom:4px">web-server-01</div>
      <div class="flex items-center" style="padding:1px 0">
        <span style="width:8px;height:8px;border-radius:50%;margin-right:8px;display:inline-block;background:var(--primary)"></span>
        <span class="text-neutral-light">Latency</span><span class="font-bold" style="margin-left:auto">120 ms</span>
      </div>
      <div class="flex items-center" style="padding:1px 0">
        <span style="width:8px;height:8px;display:inline-block;margin-right:8px"></span>
        <span class="text-neutral-light">Throughput</span><span class="font-bold" style="margin-left:auto">450 req/s</span>
      </div>
    </div></div>`,
})
Scatter.storyName = 'Chart tooltip — scatter (x / y)'
Scatter.parameters = { docs: { description: { story: '**Scatter** chart tooltip (`type:"scatter"`) — the point label + its **x / y** values (e.g. latency vs throughput per monitor). Same `hc-tooltip-bg` surface.' } } }

// Anomaly / forecast band — actual value + expected low-high range; out-of-range in anomaly color.
// areasplinerange + isAnomalySeries (tooltip-builder __getLowHighHtml + out-of-range coloring).
export const AnomalyBand = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:10px 14px;min-width:220px'">
      <div class="font-bold" style="font-size:11px;margin-bottom:6px">Jun 11, 12:30</div>
      <div class="flex items-center justify-between" style="padding:2px 0">
        <div class="flex items-center"><span :style="{ width:'8px', height:'8px', borderRadius:'1px', marginRight:'8px', display:'inline-block', background: sev.critical }"></span><span>CPU Utilization</span></div>
        <span class="font-bold" :style="{ color: sev.critical, marginLeft:'24px' }">72%</span>
      </div>
      <div class="flex items-center justify-between" style="padding:2px 0">
        <div class="flex items-center"><span style="width:8px;height:8px;border-radius:1px;margin-right:8px;display:inline-block;background:var(--primary-alt);opacity:.4"></span><span class="text-neutral-light">Expected range</span></div>
        <span class="font-500 text-neutral-light" style="margin-left:24px">40% – 60%</span>
      </div>
    </div></div>`,
})
AnomalyBand.storyName = 'Chart tooltip — anomaly / forecast band'
AnomalyBand.parameters = { docs: { description: { story: 'The **anomaly / forecast** tooltip (`areasplinerange` + `isAnomalySeries`, `tooltip-builder.js` `__getLowHighHtml` + out-of-range coloring) — the **actual value** (in the **anomaly color** when it breaches the band) over the **expected low–high range**. Used by **anomaly** & **forecast** widgets / metric-explorer / metric-insight. Same `hc-tooltip-bg` surface.' } } }

// Alert / availability segment — segmented-cell-tooltip.vue: start/end/duration + severity badge.
export const AlertSegment = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px"><div :style="'${PANEL};display:flex;align-items:stretch;overflow:hidden;min-width:320px'">
      <div class="flex flex-col justify-center" style="flex:1;min-width:0;padding:10px 12px;font-size:11px">
        <span>Start Time : Jun 11, 10:16:00</span>
        <span class="font-500 text-base">End Time : Jun 11, 12:30:00</span>
        <span style="font-weight:600">Duration : 2h 14m</span>
      </div>
      <div class="flex items-center justify-center font-500" :style="{ padding:'8px 18px', color:'var(--white-regular)', background: sev.critical }">Critical</div>
    </div></div>`,
})
AlertSegment.storyName = 'Alert / availability segment (segmented-cell)'
AlertSegment.parameters = { docs: { description: { story: 'The **alert / availability state-segment** tooltip (`segmented-cell-tooltip.vue`) — hovering a segment of an **alert / availability timeline bar**: **Start / End / Duration** on the left + a **severity badge** on the right (`--severity-*`). Same surface family as the heatmap tooltip.' } } }

// ===== Module-specific graph & widget tooltips (found in the exhaustive per-module sweep) =====

const ROW = 'display:flex;align-items:center;justify-content:space-between;padding:3px 0'
const kv = (label, val) => `<div style="${ROW}"><span class="text-neutral-light">${label}</span><span class="font-600" style="margin-left:24px">${val}</span></div>`

// APM service-map node — service + throughput / latency / error rate  (servicemap-tooltip.vue)
export const ServiceMapNode = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px"><div :style="'${GRAPH_PANEL};min-width:240px'">
      <div class="flex items-center font-600" style="padding:10px 14px;border-bottom:1px solid var(--border-color)">
        <span :style="{ width:'9px', height:'9px', borderRadius:'50%', marginRight:'8px', background: sev.warning }"></span>checkout-service
      </div>
      <div style="padding:8px 14px">${kv('Throughput','1.2k req/m')}${kv('Latency','148 ms')}${kv('Error rate','0.4 %')}</div>
    </div></div>`,
})
ServiceMapNode.storyName = 'Live graph — APM service-map node'
ServiceMapNode.parameters = { docs: { description: { story: 'The **APM service-map** node tooltip (`servicemap-tooltip.vue`) — a service node with **throughput / latency / error-rate** metrics (distinct from the monitor node tooltip). Surface `--topology-graph-tooltip-bg`.' } } }

// SDN tunnel edge — latency/loss/jitter KPI header + tunnel health (sdn-tunnel-edge-tooltip.vue)
export const SdnTunnelEdge = () => ({
  template: `
    <div style="padding:40px"><div :style="'${GRAPH_PANEL};min-width:360px'">
      <div class="flex" style="padding:12px 14px;border-bottom:1px solid var(--border-color);gap:24px;justify-content:center;text-align:center">
        <div><div class="font-bold" style="font-size:16px">24 ms</div><div class="text-neutral-light" style="font-size:10px">Latency</div></div>
        <div><div class="font-bold" style="font-size:16px">0.2 %</div><div class="text-neutral-light" style="font-size:10px">Loss</div></div>
        <div><div class="font-bold" style="font-size:16px">3 ms</div><div class="text-neutral-light" style="font-size:10px">Jitter</div></div>
      </div>
      <div class="font-600" style="padding:8px 14px 0">branch-vedge-01 → dc-vedge-02</div>
      <div style="padding:6px 14px">${kv('Local Color','biz-internet')}${kv('Site ID','100')}${kv('Health','Up')}</div>
    </div></div>`,
})
SdnTunnelEdge.storyName = 'Live graph — SDN tunnel edge (SD-WAN)'
SdnTunnelEdge.parameters = { docs: { description: { story: 'The **SD-WAN / SDN tunnel edge** tooltip (`sdn-tunnel-edge-tooltip.vue`) — a prominent **Latency / Loss / Jitter** KPI header + Cisco vEdge tunnel **color / site / health / status**. The most distinct graph-edge tooltip. Surface `--topology-graph-tooltip-bg`.' } } }

// Cisco ACI endpoint edge — MAC / IPv4 / IPv6 / endpoint group  (cisco-aci-edge-tooltip.vue)
export const CiscoAciEndpoint = () => ({
  template: `
    <div style="padding:40px"><div :style="'${GRAPH_PANEL};min-width:320px'">
      <div class="font-600" style="padding:10px 14px;border-bottom:1px solid var(--border-color)">Connection Info</div>
      <div style="padding:8px 14px">${kv('Endpoint','vm-web-07')}${kv('IPv4','10.20.4.17')}${kv('IPv6','fe80::a4:17')}${kv('MAC','00:50:56:a4:1b:0c')}${kv('Endpoint Group','EPG-Web')}</div>
    </div></div>`,
})
CiscoAciEndpoint.storyName = 'Live graph — Cisco ACI endpoint edge'
CiscoAciEndpoint.parameters = { docs: { description: { story: 'The **Cisco ACI endpoint** edge tooltip (`cisco-aci-edge-tooltip.vue`) — leaf → endpoint: **name, IPv4, IPv6, MAC, endpoint group**. Surface `--topology-graph-tooltip-bg`.' } } }

// Cisco ACI link edge — node ID / pod ID / role / state / interface  (cisco-aci-link-edge-tooltip.vue)
export const CiscoAciLink = () => ({
  template: `
    <div style="padding:40px"><div :style="'${GRAPH_PANEL};min-width:320px'">
      <div class="font-600" style="padding:10px 14px;border-bottom:1px solid var(--border-color)">Link Info</div>
      <div style="padding:8px 14px">${kv('Role','leaf')}${kv('Node ID','101')}${kv('Pod ID','1')}${kv('State','active')}${kv('Interface','eth1/49')}</div>
    </div></div>`,
})
CiscoAciLink.storyName = 'Live graph — Cisco ACI fabric link'
CiscoAciLink.parameters = { docs: { description: { story: 'The **Cisco ACI fabric link** tooltip (`cisco-aci-link-edge-tooltip.vue`) — leaf ↔ leaf/spine: **role, node ID, pod ID, state, interface** for each side. Surface `--topology-graph-tooltip-bg`.' } } }

// Network interface edge — both-sides interface metrics  (network-interface-edge-tooltip.vue)
export const NetworkInterfaceEdge = () => ({
  template: `
    <div style="padding:40px"><div :style="'${GRAPH_PANEL};min-width:360px'">
      <div class="font-600" style="padding:10px 14px;border-bottom:1px solid var(--border-color)">Link Info</div>
      <div style="padding:8px 14px">
        <div class="font-600" style="margin-bottom:2px">core-switch-01 · Gi0/1</div>
        ${kv('Status','Up')}${kv('Speed','1 Gbps')}${kv('In / Out','120 / 86 Mbps')}
      </div>
    </div></div>`,
})
NetworkInterfaceEdge.storyName = 'Live graph — network interface edge'
NetworkInterfaceEdge.parameters = { docs: { description: { story: 'The **network interface edge** tooltip (`network-interface-edge-tooltip.vue`) — per-link, both ends: interface **alias / status / IP / speed / in-out traffic** (live). Surface `--topology-graph-tooltip-bg`.' } } }

// Netroute hop node — latency min/avg/max + loss + transit  (netroute/node-tooltip.vue)
export const NetrouteNode = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px"><div :style="'${GRAPH_PANEL};min-width:300px'">
      <div class="flex items-center font-600" style="padding:10px 14px;border-bottom:1px solid var(--border-color)">
        <span :style="{ width:'9px', height:'9px', borderRadius:'50%', marginRight:'8px', background: sev.warning }"></span>10.0.3.1 <span class="text-neutral-light" style="margin-left:8px;font-weight:400">· Hop 3</span>
      </div>
      <div style="padding:8px 14px">${kv('Latency (min/avg/max)','8 / 14 / 22 ms')}${kv('Packet loss','2 %')}${kv('Alerts','1')}</div>
    </div></div>`,
})
NetrouteNode.storyName = 'Live graph — netroute hop node'
NetrouteNode.parameters = { docs: { description: { story: 'The **netroute hop node** tooltip (`netroute/node-tooltip.vue`) — a path hop: monitor (or "not monitored") + **latency min/avg/max**, **packet loss**, **alert count**, groups/tags. Surface `--topology-graph-tooltip-bg`.' } } }

// Netroute edge — source -> target + latency/loss + transit likelihood  (netroute/edge-tooltip.vue)
export const NetrouteEdge = () => ({
  template: `
    <div style="padding:40px"><div :style="'${GRAPH_PANEL};min-width:300px'">
      <div class="font-600" style="padding:10px 14px;border-bottom:1px solid var(--border-color)">10.0.2.1 ──► 10.0.3.1</div>
      <div style="padding:8px 14px">${kv('Latency (min/avg/max)','8 / 14 / 22 ms')}${kv('Packet loss','2 %')}${kv('Transit Likelihood','94 %')}</div>
    </div></div>`,
})
NetrouteEdge.storyName = 'Live graph — netroute edge (transit)'
NetrouteEdge.parameters = { docs: { description: { story: 'The **netroute edge** tooltip (`netroute/edge-tooltip.vue`) — source ──► target with **latency**, **packet loss**, and the netroute-specific **Transit Likelihood %**. Surface `--topology-graph-tooltip-bg`.' } } }

// RUM resource waterfall — resource + start/end/duration (xrange)  (rum-resource-waterfall.vue)
export const ResourceWaterfall = () => ({
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 12px;min-width:220px'">
      <div class="font-bold" style="font-size:11px;margin-bottom:4px">main.bundle.js</div>
      ${kv('Start','120 ms')}${kv('End','340 ms')}${kv('Duration','220 ms')}
    </div></div>`,
})
ResourceWaterfall.storyName = 'Chart tooltip — RUM resource waterfall'
ResourceWaterfall.parameters = { docs: { description: { story: 'The **RUM resource-timing waterfall** tooltip (`rum-resource-waterfall.vue`, x-range, `followPointer`) — a resource with **start / end / duration**. Same `hc-tooltip-bg` surface.' } } }

// Geo map marker — country + severity + metrics (RUM apdex/demographics)  (apdex-rating-by-country-map.vue)
export const GeoMapMarker = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 12px;min-width:180px'">
      <div class="flex items-center font-bold" style="font-size:12px;margin-bottom:4px"><span :style="{ width:'8px', height:'8px', borderRadius:'50%', marginRight:'8px', background: sev.up }"></span>United States</div>
      ${kv('Apdex','0.92')}${kv('Sessions','1.2k')}
    </div></div>`,
})
GeoMapMarker.storyName = 'Chart tooltip — geo map marker (RUM apdex)'
GeoMapMarker.parameters = { docs: { description: { story: 'The **geo-map marker** tooltip — RUM **apdex / demographics by country** (`apdex-rating-by-country-map.vue`, `rum-demographics.vue`) and Leaflet online-map markers: a **region** + **severity dot** + metric key/values. Same `hc-tooltip-bg` surface (Highcharts map / Leaflet `bindTooltip`).' } } }

// Availability bar segment — simple status % (MTooltip on a stacked %-bar)  (availability-bar.vue)
export const AvailabilityBar = () => ({
  data: () => ({ sev: SEV }),
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:6px 12px;min-width:90px'">
      <div class="flex items-center"><span :style="{ width:'8px', height:'8px', borderRadius:'1px', marginRight:'8px', background: sev.up }"></span><span>Up:&nbsp;</span><span class="font-bold">95%</span></div>
    </div></div>`,
})
AvailabilityBar.storyName = 'Availability bar segment (Up/Down %)'
AvailabilityBar.parameters = { docs: { description: { story: 'The **availability bar** segment tooltip (`availability-bar.vue`) — hovering a segment of a stacked up/down/maintenance **percentage bar** shows **`Status: %`** (e.g. *Up: 95%*). A plain `MTooltip` on the bar.' } } }

// Log pattern distribution — nested VALUE/COUNT/SHARE grid in a popover  (log-pattern-detection-grid.vue)
export const LogPatternDistribution = () => ({
  data: () => ({ rows: [['ERROR', 1240, '62%'], ['WARN', 530, '27%'], ['INFO', 220, '11%']] }),
  template: `
    <div style="padding:40px"><div :style="'${PANEL};padding:8px 0;min-width:240px'">
      <div class="font-bold" style="font-size:11px;padding:0 12px 6px">Value Distribution</div>
      <div style="display:grid;grid-template-columns:1fr auto auto;font-size:11px">
        <div class="text-neutral-light" style="padding:2px 12px">VALUE</div><div class="text-neutral-light" style="padding:2px 12px;text-align:right">COUNT</div><div class="text-neutral-light" style="padding:2px 12px;text-align:right">SHARE</div>
        <template v-for="r in rows"><div :key="r[0]+'a'" style="padding:2px 12px">{{ r[0] }}</div><div :key="r[0]+'b'" class="font-600" style="padding:2px 12px;text-align:right">{{ r[1] }}</div><div :key="r[0]+'c'" style="padding:2px 12px;text-align:right">{{ r[2] }}</div></template>
      </div>
    </div></div>`,
})
LogPatternDistribution.storyName = 'Log pattern — value distribution'
LogPatternDistribution.parameters = { docs: { description: { story: 'The **log pattern distribution** tooltip (`log-pattern-detection-grid.vue`) — hovering a pattern\'s count opens a **nested grid** (VALUE · COUNT · SHARE %) showing the value breakdown. A popover with an embedded `MGrid` (richer than a label tooltip).' } } }

ChartBar.parameters = { ...(ChartBar.parameters || {}), controls: { disable: true } }
ChartDonut.parameters = { ...(ChartDonut.parameters || {}), controls: { disable: true } }
ServiceMapNode.parameters = { ...(ServiceMapNode.parameters || {}), controls: { disable: true } }
SdnTunnelEdge.parameters = { ...(SdnTunnelEdge.parameters || {}), controls: { disable: true } }
CiscoAciEndpoint.parameters = { ...(CiscoAciEndpoint.parameters || {}), controls: { disable: true } }
CiscoAciLink.parameters = { ...(CiscoAciLink.parameters || {}), controls: { disable: true } }
NetworkInterfaceEdge.parameters = { ...(NetworkInterfaceEdge.parameters || {}), controls: { disable: true } }
NetrouteNode.parameters = { ...(NetrouteNode.parameters || {}), controls: { disable: true } }
NetrouteEdge.parameters = { ...(NetrouteEdge.parameters || {}), controls: { disable: true } }
ResourceWaterfall.parameters = { ...(ResourceWaterfall.parameters || {}), controls: { disable: true } }
GeoMapMarker.parameters = { ...(GeoMapMarker.parameters || {}), controls: { disable: true } }
AvailabilityBar.parameters = { ...(AvailabilityBar.parameters || {}), controls: { disable: true } }
LogPatternDistribution.parameters = { ...(LogPatternDistribution.parameters || {}), controls: { disable: true } }
Scatter.parameters = { ...(Scatter.parameters || {}), controls: { disable: true } }
AnomalyBand.parameters = { ...(AnomalyBand.parameters || {}), controls: { disable: true } }
AlertSegment.parameters = { ...(AlertSegment.parameters || {}), controls: { disable: true } }
Heatmap.parameters = { ...(Heatmap.parameters || {}), controls: { disable: true } }
Sparkline.parameters = { ...(Sparkline.parameters || {}), controls: { disable: true } }
LiveGraphNode.parameters = { ...(LiveGraphNode.parameters || {}), controls: { disable: true } }
FlameGraph.parameters = { ...(FlameGraph.parameters || {}), controls: { disable: true } }
Bubble.parameters = { ...(Bubble.parameters || {}), controls: { disable: true } }
MapGeo.parameters = { ...(MapGeo.parameters || {}), controls: { disable: true } }
Radar.parameters = { ...(Radar.parameters || {}), controls: { disable: true } }
Timeline.parameters = { ...(Timeline.parameters || {}), controls: { disable: true } }
Gauge.parameters = { ...(Gauge.parameters || {}), controls: { disable: true } }
Sankey.parameters = { ...(Sankey.parameters || {}), controls: { disable: true } }
Treemap.parameters = { ...(Treemap.parameters || {}), controls: { disable: true } }
LiveGraphEdge.parameters = { ...(LiveGraphEdge.parameters || {}), controls: { disable: true } }
