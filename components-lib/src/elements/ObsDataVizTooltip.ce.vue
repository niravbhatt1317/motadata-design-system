<script setup>
// <obs-dataviz-tooltip> — Foundations of the chart/widget hover tooltips (a distinct family from <obs-tooltip>).
// Highcharts renders these via the shared TooltipBuilder (.hc-tooltip-bg, translucent --chart-tooltip-background
// + blur) and widget components; live-graph node/edge tooltips use --topology-graph-tooltip-bg. These are
// REFERENCE reproductions (real tokens) — the styling is owned by the chart layer, not a DS component. Pick a
// `kind`. Source: data-viz-tooltips.stories.js.
import { computed } from 'vue'
const sev = (l) => `var(--severity-${l})`
const kv = (l, v) => `<div class="row" style="padding:3px 0"><span class="tnl">${l}</span><span class="f6" style="margin-left:24px">${v}</span></div>`
const srow = (name, color, val) => `<div class="row" style="padding:2px 0"><span class="fic"><span class="sq" style="background:${color}"></span><span>${name}</span></span><span class="fb" style="margin-left:32px">${val}</span></div>`

const KINDS = {
  bar: { surface: 'panel', w: '230px', pad: '10px 14px', html:
    `<div class="title">Metric Threshold</div>${srow('Down', sev('down'), 0)}${srow('Unreachable', sev('unreachable'), 0)}${srow('Critical', sev('critical'), 34)}${srow('Major', sev('major'), 2)}${srow('Warning', sev('warning'), 15)}` },
  donut: { surface: 'panel', w: '180px', pad: '10px 14px', html: `<div class="title">Availability</div>${srow('Up', sev('up'), 1)}` },
  heatmap: { surface: 'panel', w: '300px', pad: '0', extra: 'display:flex;align-items:stretch;overflow:hidden', html:
    `<div style="flex:1;min-width:0;padding:10px 12px;display:flex;flex-direction:column;justify-content:center"><span class="f5" style="font-size:14px">172.16.9.243</span><span class="tnr" style="font-size:11px">motadata(172.16.9.243)</span></div><div class="badge" style="background:${sev('warning')}">Warning</div>` },
  sparkline: { surface: 'panel', w: '120px', pad: '6px 10px', html:
    `<div class="fb" style="font-size:11px;margin-bottom:2px">12:30:00</div><div class="fic"><span class="sq" style="background:var(--primary-alt)"></span><span>CPU&nbsp;</span><span class="fb" style="margin-left:auto">74%</span></div>` },
  flame: { surface: 'panel', w: '260px', pad: '10px 14px', html:
    `<div class="f6" style="font-size:12px;margin-bottom:6px">GET /api/v1/monitors</div>${kv('Self time', '<b>12.4 ms</b>')}${kv('Total time', '<b>148.7 ms</b>')}${kv('% of trace', '<b>63%</b>')}<div style="margin-top:6px;height:4px;border-radius:2px;background:var(--neutral-lighter);overflow:hidden"><div style="width:63%;height:100%;background:${sev('warning')}"></div></div>` },
  bubble: { surface: 'panel', w: '150px', pad: '8px 12px', html:
    `<div class="fic"><span class="dot" style="background:var(--primary-alt)"></span><span>Ubuntu 22.04:&nbsp;</span><span class="fb">42</span></div>` },
  'map-geo': { surface: 'panel', w: '170px', pad: '8px 12px', html:
    `<div class="title">California</div>${kv('Monitors', 18)}${kv('Down', 2)}${kv('Critical', 5)}` },
  radar: { surface: 'panel', w: '140px', pad: '8px 12px', html: `<div class="f5">Client A</div><div class="fb">74 Mbps</div>` },
  timeline: { surface: 'panel', w: 'auto', max: '280px', pad: '8px 12px', html:
    `<span>web-server-01 entered into status </span><span class="fb" style="color:${sev('critical')}">Critical</span><span> at 12:30:00</span>` },
  gauge: { surface: 'panel', w: '120px', pad: '8px 14px', extra: 'text-align:center', html:
    `<div class="tnl" style="font-size:11px">CPU Utilization</div><div class="fb" style="font-size:20px">74%</div>` },
  sankey: { surface: 'panel', w: '180px', pad: '8px 12px', html:
    `<div class="fic" style="padding:2px 0"><span class="sq" style="background:var(--primary)"></span><span>WAN&nbsp;→&nbsp;Core&nbsp;</span><span class="fb" style="margin-left:auto">1.2 Gbps</span></div>` },
  treemap: { surface: 'panel', w: '170px', pad: '8px 12px', html:
    `<div class="title" style="margin-bottom:2px">Production / web-tier</div><div class="row"><span class="tnl">Monitors</span><span class="f5" style="margin-left:24px">42</span></div>` },
  scatter: { surface: 'panel', w: '170px', pad: '8px 12px', html:
    `<div class="fb" style="font-size:11px;margin-bottom:4px">web-server-01</div><div class="fic" style="padding:1px 0"><span class="dot" style="width:8px;height:8px;background:var(--primary)"></span><span class="tnl">Latency</span><span class="fb" style="margin-left:auto">120 ms</span></div><div class="fic" style="padding:1px 0"><span style="width:8px;margin-right:8px;display:inline-block"></span><span class="tnl">Throughput</span><span class="fb" style="margin-left:auto">450 req/s</span></div>` },
  anomaly: { surface: 'panel', w: '220px', pad: '10px 14px', html:
    `<div class="fb" style="font-size:11px;margin-bottom:6px">Jun 11, 12:30</div><div class="row" style="padding:2px 0"><span class="fic"><span class="sq" style="background:${sev('critical')}"></span><span>CPU Utilization</span></span><span class="fb" style="margin-left:24px;color:${sev('critical')}">72%</span></div><div class="row" style="padding:2px 0"><span class="fic"><span class="sq" style="background:var(--primary-alt);opacity:.4"></span><span class="tnl">Expected range</span></span><span class="f5 tnl" style="margin-left:24px">40% – 60%</span></div>` },
  'alert-segment': { surface: 'panel', w: '320px', pad: '0', extra: 'display:flex;align-items:stretch;overflow:hidden', html:
    `<div style="flex:1;min-width:0;padding:10px 12px;display:flex;flex-direction:column;justify-content:center;font-size:11px"><span>Start Time : Jun 11, 10:16:00</span><span class="f5" style="font-size:13px">End Time : Jun 11, 12:30:00</span><span style="font-weight:600">Duration : 2h 14m</span></div><div class="badge" style="background:${sev('critical')}">Critical</div>` },
  'resource-waterfall': { surface: 'panel', w: '220px', pad: '8px 12px', html:
    `<div class="fb" style="font-size:11px;margin-bottom:4px">main.bundle.js</div>${kv('Start', '120 ms')}${kv('End', '340 ms')}${kv('Duration', '220 ms')}` },
  'geo-marker': { surface: 'panel', w: '180px', pad: '8px 12px', html:
    `<div class="fic fb" style="font-size:12px;margin-bottom:4px"><span class="dot" style="width:8px;height:8px;background:${sev('up')}"></span>United States</div>${kv('Apdex', '0.92')}${kv('Sessions', '1.2k')}` },
  'availability-bar': { surface: 'panel', w: '90px', pad: '6px 12px', html:
    `<div class="fic"><span class="sq" style="background:${sev('up')}"></span><span>Up:&nbsp;</span><span class="fb">95%</span></div>` },
  'log-distribution': { surface: 'panel', w: '240px', pad: '8px 0', html:
    `<div class="fb" style="font-size:11px;padding:0 12px 6px">Value Distribution</div><div style="display:grid;grid-template-columns:1fr auto auto;font-size:11px"><div class="tnl" style="padding:2px 12px">VALUE</div><div class="tnl" style="padding:2px 12px;text-align:right">COUNT</div><div class="tnl" style="padding:2px 12px;text-align:right">SHARE</div><div style="padding:2px 12px">ERROR</div><div class="f6" style="padding:2px 12px;text-align:right">1240</div><div style="padding:2px 12px;text-align:right">62%</div><div style="padding:2px 12px">WARN</div><div class="f6" style="padding:2px 12px;text-align:right">530</div><div style="padding:2px 12px;text-align:right">27%</div><div style="padding:2px 12px">INFO</div><div class="f6" style="padding:2px 12px;text-align:right">220</div><div style="padding:2px 12px;text-align:right">11%</div></div>` },
  // ── live-graph (dark) surface ──
  'graph-node': { surface: 'graph', w: '300px', html:
    `<div class="ghead"><span class="dot" style="background:${sev('major')}"></span><span class="f6">core-switch-01</span><span class="tnl" style="margin:0 8px">|</span><span class="tnl">10.0.0.1</span><span class="tnl" style="margin:0 8px">|</span><span class="tnl">Switch</span></div><div class="gbody">${kv('CPU Utilization', '74 %')}${kv('Memory Utilization', '61 %')}${kv('Interface In', '120 Mbps')}</div>` },
  'graph-edge': { surface: 'graph', w: '300px', html:
    `<div class="ghead f6">core-switch-01 <span class="tnl" style="margin:0 8px">↔</span> edge-router-02</div><div class="gbody"><div class="tnl" style="font-size:11px;margin-bottom:4px">GigabitEthernet0/1</div>${kv('In', '120 Mbps')}${kv('Out', '86 Mbps')}${kv('Utilization', '34 %')}</div>` },
  'service-map': { surface: 'graph', w: '240px', html:
    `<div class="ghead f6"><span class="dot" style="background:${sev('warning')}"></span>checkout-service</div><div class="gbody">${kv('Throughput', '1.2k req/m')}${kv('Latency', '148 ms')}${kv('Error rate', '0.4 %')}</div>` },
  'sdn-tunnel': { surface: 'graph', w: '360px', html:
    `<div class="ghead" style="gap:24px;justify-content:center;text-align:center"><div><div class="fb" style="font-size:16px">24 ms</div><div class="tnl" style="font-size:10px">Latency</div></div><div><div class="fb" style="font-size:16px">0.2 %</div><div class="tnl" style="font-size:10px">Loss</div></div><div><div class="fb" style="font-size:16px">3 ms</div><div class="tnl" style="font-size:10px">Jitter</div></div></div><div class="f6" style="padding:8px 14px 0">branch-vedge-01 → dc-vedge-02</div><div style="padding:6px 14px">${kv('Local Color', 'biz-internet')}${kv('Site ID', '100')}${kv('Health', 'Up')}</div>` },
  'aci-endpoint': { surface: 'graph', w: '320px', html:
    `<div class="ghead f6">Connection Info</div><div class="gbody">${kv('Endpoint', 'vm-web-07')}${kv('IPv4', '10.20.4.17')}${kv('IPv6', 'fe80::a4:17')}${kv('MAC', '00:50:56:a4:1b:0c')}${kv('Endpoint Group', 'EPG-Web')}</div>` },
  'aci-link': { surface: 'graph', w: '320px', html:
    `<div class="ghead f6">Link Info</div><div class="gbody">${kv('Role', 'leaf')}${kv('Node ID', '101')}${kv('Pod ID', '1')}${kv('State', 'active')}${kv('Interface', 'eth1/49')}</div>` },
  'interface-edge': { surface: 'graph', w: '360px', html:
    `<div class="ghead f6">Link Info</div><div class="gbody"><div class="f6" style="margin-bottom:2px">core-switch-01 · Gi0/1</div>${kv('Status', 'Up')}${kv('Speed', '1 Gbps')}${kv('In / Out', '120 / 86 Mbps')}</div>` },
  'netroute-node': { surface: 'graph', w: '300px', html:
    `<div class="ghead f6"><span class="dot" style="background:${sev('warning')}"></span>10.0.3.1 <span class="tnl" style="margin-left:8px;font-weight:400">· Hop 3</span></div><div class="gbody">${kv('Latency (min/avg/max)', '8 / 14 / 22 ms')}${kv('Packet loss', '2 %')}${kv('Alerts', '1')}</div>` },
  'netroute-edge': { surface: 'graph', w: '300px', html:
    `<div class="ghead f6">10.0.2.1 ──► 10.0.3.1</div><div class="gbody">${kv('Latency (min/avg/max)', '8 / 14 / 22 ms')}${kv('Packet loss', '2 %')}${kv('Transit Likelihood', '94 %')}</div>` },
}
const props = defineProps({
  kind: { type: String, default: 'bar' },
  block: { type: Boolean, default: false }, // stretch the card to the full width of its container
})
const k = computed(() => KINDS[props.kind] || KINDS.bar)
const cardStyle = computed(() => {
  // block: ignore the kind's intrinsic width and fill the container (maxWidth dropped too)
  if (props.block) return { padding: k.value.surface === 'graph' ? undefined : k.value.pad }
  const base = k.value.surface === 'graph'
    ? { minWidth: k.value.w }
    : { padding: k.value.pad, minWidth: k.value.w === 'auto' ? undefined : k.value.w, maxWidth: k.value.max }
  return base
})
</script>

<template>
  <div class="card" :class="[k.surface, { block }]" :style="cardStyle" :data-extra="k.extra || ''" v-html="k.html"></div>
</template>

<style>
:host([hidden]) { display: none !important; }
:host { display: inline-block; font-family: var(--font-family, 'Poppins', sans-serif); }
:host([block]) { display: block; width: 100%; }
.card { box-sizing: border-box; }
.card.block { width: 100%; }
/* chart/widget surface (hc-tooltip-bg) */
.card.panel { background: var(--chart-tooltip-background, rgba(255,255,255,.9)); backdrop-filter: blur(15px);
  border-radius: 4px; box-shadow: 0 4px 16px var(--neutral-shadow-light, rgba(70,70,70,.15));
  color: var(--page-text-color, #1d2a3e); font-size: 11px; }
/* live-graph (dark) surface */
.card.graph { background: var(--topology-graph-tooltip-bg, #07101f); border: 1px solid var(--border-color, #e3e8f2);
  border-radius: 6px; box-shadow: 0 6px 20px var(--neutral-shadow-light, rgba(70,70,70,.15));
  color: var(--tooltip-text-color, #cad3e2); font-size: 12px; }
.card[data-extra] { }
/* extras applied via attribute selector → use the value */
.card.panel[data-extra*="flex"] { display: flex; align-items: stretch; overflow: hidden; }
.card.panel[data-extra*="center"] { text-align: center; }
/* graph header / body */
.ghead { display: flex; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--border-color); }
.gbody { padding: 8px 14px; }
/* the severity badge (heatmap / alert-segment) */
.badge { display: flex; align-items: center; justify-content: center; font-weight: 500; padding: 8px 18px; color: var(--white-regular, #fff); }
/* utility classes used inside v-html content */
.fb { font-weight: 700; } .f6 { font-weight: 600; } .f5 { font-weight: 500; }
.tnl { color: var(--neutral-light, #8e9fbc); } .tnr { color: var(--neutral-regular, #7186a8); }
.row { display: flex; align-items: center; justify-content: space-between; }
.fic { display: flex; align-items: center; }
.sq { display: inline-block; width: 8px; height: 8px; border-radius: 1px; margin-right: 8px; flex-shrink: 0; }
.dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 8px; flex-shrink: 0; }
.title { font-weight: 700; font-size: 12px; margin-bottom: 8px; }
</style>
