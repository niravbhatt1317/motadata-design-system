// Showcase manifest for <obs-widget-grid> — a LIVE draggable / droppable / resizable dashboard grid.
// Slot in <obs-widget-card data-x data-y data-w data-h> children; the grid snaps, pushes colliding cards
// down, compacts up under gravity, and auto-scrolls so a card can be dragged/resized past the fold.
// Cards are draggable by their HEADER and resizable from the BOTTOM-RIGHT corner. Emits layout-change.
const muted = 'color:var(--neutral-light,#6a7fa0)'
const bodyPad = 'height:100%;box-sizing:border-box;padding:10px 12px'
const tile = (title, sub) =>
  `<div style="${bodyPad}"><div style="font-weight:600;color:var(--page-text-color)">${title}</div>` +
  `<div style="${muted};font-size:0.8rem;margin-top:4px">${sub}</div></div>`

export default {
  el: 'obs-widget-grid',
  display: 'Widget Grid',
  registry: 'widget-grid',
  controls: [
    { prop: 'columns', type: 'text' },
    { prop: 'cellHeight', type: 'text', label: 'cell-height' },
    { prop: 'gap', type: 'text' },
  ],
  playground: {
    attrs: { columns: '12', 'cell-height': '80', gap: '10' },
    live: `<obs-widget-grid columns="12" cell-height="80" gap="10" style="display:block;min-height:340px">
  <obs-widget-card data-x="0" data-y="0" data-w="6" data-h="2" title="CPU Utilisation" time="1h">
    ${tile('72%', 'avg across 128 monitors')}
  </obs-widget-card>
  <obs-widget-card data-x="6" data-y="0" data-w="6" data-h="2" title="Memory" time="1h">
    ${tile('64%', 'avg across 128 monitors')}
  </obs-widget-card>
  <obs-widget-card data-x="0" data-y="2" data-w="4" data-h="2" title="Open Alerts" time="1h">
    ${tile('37', '5 critical · 12 major')}
  </obs-widget-card>
  <obs-widget-card data-x="4" data-y="2" data-w="8" data-h="2" title="Throughput" time="1h">
    ${tile('1.2 Gbps', 'ingress + egress')}
  </obs-widget-card>
</obs-widget-grid>`,
  },
  gallery: [
    {
      group:
        'A live mini dashboard — drag a card by its HEADER, resize from the BOTTOM-RIGHT corner. Cards snap to the 12-column lattice, colliding cards push down, and the board compacts up under gravity. On drop the grid writes the settled data-x/y/w/h back onto each card and fires layout-change (persist the board + reflow width-only chart widgets). Reuses obs-gauge and obs-severity-heatmap as widget bodies.',
      items: [
        {
          html: `<div style="width:100%">
  <obs-widget-grid columns="12" cell-height="80" gap="10" style="display:block;min-height:360px">
    <obs-widget-card data-x="0" data-y="0" data-w="4" data-h="3" title="Alert Count" time="1h 12m">
      <div style="display:flex;gap:14px;justify-content:center;align-items:center;height:100%">
        <obs-gauge value="5" total="42" severity="critical" label="Critical"></obs-gauge>
        <obs-gauge value="12" total="42" severity="major" label="Major"></obs-gauge>
        <obs-gauge value="25" total="42" severity="warning" label="Warning"></obs-gauge>
      </div>
    </obs-widget-card>

    <obs-widget-card data-x="4" data-y="0" data-w="4" data-h="3" title="Monitor Availability" time="1h 12m">
      <div style="display:flex;gap:14px;justify-content:center;align-items:center;height:100%">
        <obs-gauge value="118" total="128" severity="up" label="Up"></obs-gauge>
        <obs-gauge value="10" total="128" severity="down" label="Down"></obs-gauge>
      </div>
    </obs-widget-card>

    <obs-widget-card data-x="8" data-y="0" data-w="4" data-h="6" title="Infrastructure Heatmap" time="1h 12m">
      <obs-severity-heatmap style="display:block;height:100%" size="20"></obs-severity-heatmap>
    </obs-widget-card>

    <obs-widget-card data-x="0" data-y="3" data-w="8" data-h="3" title="Top Monitors by Alert Count" time="1h 12m">
      <div style="${bodyPad}">
        <div style="${muted};font-size:0.8rem">core-switch-01 · db-primary · edge-fw-02 · app-node-14</div>
        <div style="margin-top:8px;color:var(--page-text-color);font-weight:600">4 monitors trending up</div>
      </div>
    </obs-widget-card>
  </obs-widget-grid>
</div>`,
        },
      ],
    },
    {
      group:
        'Custom grid — columns="6", tighter rows (cell-height="64") and a wider gap="14". Same cards, a denser lattice; drag by header / resize from the bottom-right corner behave identically, and layout-change still fires on drop. cell-height and gap are grid-wide — set them here instead of resizing every card.',
      items: [
        {
          html: `<div style="width:100%">
  <obs-widget-grid columns="6" cell-height="64" gap="14" style="display:block;min-height:300px">
    <obs-widget-card data-x="0" data-y="0" data-w="3" data-h="2" title="CPU" time="1h">
      ${tile('72%', 'avg')}
    </obs-widget-card>
    <obs-widget-card data-x="3" data-y="0" data-w="3" data-h="2" title="Memory" time="1h">
      ${tile('64%', 'avg')}
    </obs-widget-card>
    <obs-widget-card data-x="0" data-y="2" data-w="2" data-h="2" title="Disk" time="1h">
      ${tile('48%', 'avg')}
    </obs-widget-card>
    <obs-widget-card data-x="2" data-y="2" data-w="4" data-h="2" title="Network Throughput" time="1h">
      ${tile('1.2 Gbps', 'ingress + egress')}
    </obs-widget-card>
  </obs-widget-grid>
</div>`,
        },
      ],
    },
  ],
}
