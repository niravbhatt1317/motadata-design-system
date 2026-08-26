// Showcase manifest for <obs-timeline-scrollbar> — the temporal navigator bar (Playback & Timeline). Batch/step
// controls around a time WINDOW: « batch-back · ‹ step-back · START … END · step-forward › · batch-forward ». It
// emits `shift {direction, batch}`; the consumer moves its data window. Source: netroute/timeline-scrollbar.vue.
const box = (label, inner, w = '') => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:10px">${label}</div><div style="${w}">${inner}</div></div>` })

export default {
  el: 'obs-timeline-scrollbar',
  display: 'Timeline Scrollbar',
  registry: 'timeline-scrollbar',
  summary: 'The temporal navigator bar — batch (« ») and single-step (‹ ›) controls around a START–END time window of bucketed snapshots. Emits `shift {direction,batch}`; the consumer moves its window. Part of the Playback & Timeline family. Watch the console (shift events) as you click.',
  controls: [
    { prop: 'start', type: 'text', default: 'Jul 21, 06:00 PM' },
    { prop: 'end', type: 'text', default: 'Jul 21, 06:15 PM' },
    { prop: 'disabled', type: 'toggle' },
  ],
  playground: {
    attrs: { start: 'Wed, Jul 22, 2026 11:37:48 AM', end: 'Wed, Jul 22, 2026 07:49:42 PM' },
    text: '',
    // "under a chart" (the product placement): a skeleton temporal chart fills, the scrollbar is pinned at the very
    // bottom — the whole thing fills the viewport in fullscreen (⛶), exactly how the product docks it
    live: `<div class="pg-tl"><div class="pg-tl-chart pg-sk"></div><obs-timeline-scrollbar start="Wed, Jul 22, 2026 11:37:48 AM" end="Wed, Jul 22, 2026 07:49:42 PM"></obs-timeline-scrollbar></div>`,
  },
  gallery: [
    { group: 'Default — the window navigator: « steps a whole window back, ‹ steps one point back, then the START and END times, then ›  and » forward. Click a control and watch the console for the shift event', items: [
      box('start / end window + step + batch controls', `<div style="border:1px solid var(--border-color,#e3e8f2);border-radius:8px"><obs-timeline-scrollbar start="Jul 21, 06:00 PM" end="Jul 21, 06:15 PM"></obs-timeline-scrollbar></div>`),
    ] },
    { group: 'Under a chart — its natural home: a top rule separates it from the temporal chart above; it scrubs the visible window', items: [
      box('below a chart placeholder', `<div style="border:1px solid var(--border-color,#e3e8f2);border-radius:8px;overflow:hidden"><div style="height:120px;display:flex;align-items:center;justify-content:center;color:var(--neutral-light,#6a7fa0);font-size:12px">— temporal chart —</div><obs-timeline-scrollbar start="Jul 21, 06:00 PM" end="Jul 21, 06:15 PM"></obs-timeline-scrollbar></div>`),
    ] },
    { group: 'Disabled — all controls inert (e.g. while data is loading or at the edge of the available range)', items: [
      box('disabled', `<div style="border:1px solid var(--border-color,#e3e8f2);border-radius:8px"><obs-timeline-scrollbar disabled start="Jul 21, 06:00 PM" end="Jul 21, 06:15 PM"></obs-timeline-scrollbar></div>`),
    ] },
  ],
}
