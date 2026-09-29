// Showcase manifest for <obs-widget-card> — the dashboard widget CHROME: a framed card with a grey
// header (title + hover time badge + hover kebab), a body SLOT for any widget content, a drag handle
// (the header) and a bottom-right resize grip. It emits card-dragstart / card-resizestart for an
// obs-widget-grid parent, plus an action event for the kebab items. A card needs a SIZE to render,
// so every example gives the host an explicit width + height, and the body is a simple padded div.
const muted = 'color:var(--neutral-light,#6a7fa0)'
const body = (label, extra = '') =>
  `<div style="height:100%;display:flex;align-items:center;justify-content:center;padding:16px;${muted};font-size:0.8rem;${extra}">${label}</div>`
const block = (label, inner) => ({ html:
  `<div><div style="font-size:11px;${muted};font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div>${inner}</div>` })

export default {
  el: 'obs-widget-card',
  display: 'Widget Card',
  registry: 'widget-card',
  controls: [
    { prop: 'title', type: 'text', label: 'Title' },
    { prop: 'time', type: 'text', label: 'Time badge (hover)' },
    { prop: 'static', type: 'toggle', label: 'Static (no drag/resize)' },
  ],
  playground: {
    attrs: { title: 'Monitor Availability', time: '1h 12m' },
    live: `<obs-widget-card title="Monitor Availability" time="1h 12m" style="width:360px;height:220px"><div style="padding:16px">widget body</div></obs-widget-card>`,
  },
  gallery: [
    { group: 'Standalone — a titled widget card framing a simple body. Hover the header to reveal the kebab (Full Screen · Share · Edit · Clone · Remove); hover the card to reveal the bottom-right resize grip', items: [
      block('title + body', `<obs-widget-card title="Monitor Availability" style="width:340px;height:200px">${body('widget body')}</obs-widget-card>`),
    ] },
    { group: 'With a time badge — the time prop (e.g. "1h 12m") shows the window the widget\'s data covers, revealed on hover beside the kebab', items: [
      block('title + time', `<obs-widget-card title="Infrastructure Heatmap" time="1h 12m" style="width:340px;height:200px">${body('heatmap')}</obs-widget-card>`),
    ] },
    { group: 'Without a time badge — omit the time prop and the header shows just the title + kebab (no pill). Use when the window is global to the board and already shown in the page header / timeline', items: [
      block('title only (no time)', `<obs-widget-card title="Monitor Availability" style="width:340px;height:200px">${body('no time badge')}</obs-widget-card>`),
    ] },
    { group: 'Static — chrome only (static prop): no drag handle, no resize grip, no card-dragstart / card-resizestart. Use standalone or on a locked / view-only board. static composes with time — a locked card can still carry a badge', items: [
      block('static (no drag/resize)', `<obs-widget-card static title="Availability (locked)" style="width:340px;height:200px">${body('static card')}</obs-widget-card>`),
      block('static + time badge', `<obs-widget-card static title="Availability (locked)" time="24h" style="width:340px;height:200px">${body('static, with badge')}</obs-widget-card>`),
    ] },
    { group: 'A real body — the card is chrome; drop a real DS visualization in the default slot. Here an obs-gauge row (Monitor-Availability dials), exactly as on the Alert-Summary board', items: [
      block('gauge row (real obs-gauge)', `<obs-widget-card title="Monitor Availability" time="1h 12m" style="width:340px;height:200px"><div style="height:100%;display:flex;align-items:center;justify-content:space-around;padding:8px 4px"><obs-gauge value="160" total="172" severity="up" label="Up"></obs-gauge><obs-gauge value="8" total="172" severity="down" label="Down"></obs-gauge><obs-gauge value="4" total="172" severity="unreachable" label="Unreachable"></obs-gauge></div></obs-widget-card>`),
    ] },
    { group: 'Placeholder bodies — any other visualization goes in the default slot (a chart, a heatmap, a table). Each here uses a placeholder body to show the frame', items: [
      block('chart', `<obs-widget-card title="Top Network Monitors by Alert Count" time="1h 12m" style="width:340px;height:200px">${body('chart', 'background:linear-gradient(180deg,transparent 60%,var(--neutral-lighter,#e3e8f2) 60%)')}</obs-widget-card>`),
      block('heatmap', `<obs-widget-card title="Infrastructure Heatmap" time="1h 12m" style="width:340px;height:200px">${body('severity honeycomb')}</obs-widget-card>`),
      block('table', `<obs-widget-card title="Recent Alerts" time="1h 12m" style="width:340px;height:200px">${body('table rows')}</obs-widget-card>`),
    ] },
    { group: 'On a grid — inside an obs-widget-grid, the header becomes a drag handle and the grip resizes the cell; the grid consumes card-dragstart / card-resizestart. Standalone (no grid) the card is just a static frame', items: [
      block('two cards in a widget grid', `<obs-widget-grid columns="12" cell-height="78" gap="10" style="display:block;height:200px"><obs-widget-card data-x="0" data-y="0" data-w="6" data-h="2" title="Monitor Availability" time="1h 12m">${body('gauges')}</obs-widget-card><obs-widget-card data-x="6" data-y="0" data-w="6" data-h="2" title="Alert Count" time="1h 12m">${body('gauges')}</obs-widget-card></obs-widget-grid>`),
    ] },
  ],
}
