// Showcase manifest for <obs-divider> — the thin rule that separates content (horizontal 126× · vertical 7×).
// A divider needs surrounding content to read, so every gallery example wraps it in real context.
const muted = 'color:var(--neutral-light,#6a7fa0)'
const sec = (t) => `<div style="${muted};font-size:0.8rem">${t}</div>`
const row = (inner) => `<div style="display:flex;align-items:center;${muted};font-size:0.8rem">${inner}</div>`
const block = (label, inner) => ({ html:
  `<div><div style="font-size:11px;${muted};font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div>${inner}</div>` })

export default {
  el: 'obs-divider',
  display: 'Divider',
  registry: 'divider',
  controls: [
    { prop: 'type', type: 'select', options: ['horizontal', 'vertical'] },
    { prop: 'text', type: 'text', label: 'Text (labelled rule)' },
    { prop: 'orientation', type: 'select', label: 'Orientation (with text)', options: ['', 'start', 'end'] },
    { prop: 'dashed', type: 'toggle' },
    { prop: 'dark', type: 'toggle' },
  ],
  playground: {
    attrs: { type: 'horizontal' },
    text: '',
    live: `<obs-divider></obs-divider>`,
  },
  gallery: [
    { group: 'Horizontal (default, 126×) — a full-width 1px rule between STACKED sections (settings forms, cards). margin 1rem 0', items: [
      block('section + rule + section', `${sec('Connection details')}<obs-divider></obs-divider>${sec('Advanced options')}`),
    ] },
    { group: 'Vertical (7×) — an inline 1px separator between items in a ROW (metadata strips, compare views, inline status). type="vertical"', items: [
      block('Running | v2.4.1 | Updated 2h ago', row(`<span>Running</span><obs-divider type="vertical"></obs-divider><span>v2.4.1</span><obs-divider type="vertical"></obs-divider><span>Updated 2h ago</span>`)),
    ] },
    { group: 'With text — a labelled section rule (the text prop or default slot). Orientation moves the label: center (default) · start · end', items: [
      block('centered label', `<obs-divider text="OR"></obs-divider>`),
      block('orientation="start"', `<obs-divider text="Section" orientation="start"></obs-divider>`),
      block('orientation="end"', `<obs-divider text="Section" orientation="end"></obs-divider>`),
    ] },
    { group: 'Dashed — a real dashed rule (obs-divider fixes the product’s F1: in the product `dashed` renders solid because the DS background override paints over Ant’s dashed border)', items: [
      block('dashed', `${sec('Above')}<obs-divider dashed></obs-divider>${sec('Below')}`),
      block('dashed + text', `<obs-divider dashed text="OPTIONAL"></obs-divider>`),
    ] },
    { group: 'Dark — the line tuned for a dark surface (--neutral-light); the page theme toggle shows it on both', items: [
      block('dark', `${sec('Above')}<obs-divider dark></obs-divider>${sec('Below')}`),
    ] },
    { group: 'In a toolbar — the vertical divider separates a bulk bar’s actions from its ⋮ More menu (the obs-toolbar bulk bar composes obs-divider here)', items: [
      block('actions | More', row(`<span style="font-weight:500;color:var(--page-text-color)">Acknowledge</span><span style="margin:0 10px">Assign</span><obs-divider type="vertical"></obs-divider><span style="margin-left:10px">⋮ More</span>`)),
    ] },
  ],
}
