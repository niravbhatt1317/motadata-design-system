// Showcase manifest for <obs-menu> — the DS Menu (MMenu primitive + the Context/Action menu, FlotoGridActions).
// A vertical list of selectable icon+label rows with dividers and danger/positive colours. Two modes: a ⋯/button
// trigger opening a top-layer menu of ACTIONS (context), or the list rendered in place (inline primitive).
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
const ACTIONS = '[{"key":"edit","label":"Edit","icon":"pencil"},{"key":"clone","label":"Duplicate","icon":"save"},{"key":"dv","divider":true},{"key":"delete","label":"Delete","icon":"trash","danger":true}]'
const NAV = '[{"key":"overview","label":"Overview","icon":"grid","selected":true},{"key":"settings","label":"Settings","icon":"cog"},{"key":"sync","label":"Sync now","icon":"sync"},{"key":"dv","divider":true},{"key":"remove","label":"Remove","icon":"trash","danger":true}]'
const block = (label, inner, minH = '60px') => ({ html: `<div style="width:100%">${lbl(label)}<div style="min-height:${minH}">${inner}</div></div>` })
export default {
  el: 'obs-menu',
  display: 'Menu',
  registry: 'menu',
  events: ['select', 'show', 'hide'],
  controls: [
    { prop: 'mode', type: 'select', options: ['context', 'inline'] },
    { prop: 'trigger', type: 'select', options: ['dots', 'button'] },
    { prop: 'placement', type: 'select', options: ['bottom-end', 'bottom-start'] },
    { prop: 'label', type: 'text' },
    { prop: 'disabled', type: 'toggle' },
    { label: 'Content', slotPresets: [
      { label: 'Row actions', html: '', attrs: { items: ACTIONS, mode: 'context', trigger: 'dots' } },
      { label: 'Nav list (inline)', html: '', attrs: { items: NAV, mode: 'inline' } },
    ] },
  ],
  playground: {
    attrs: { trigger: 'dots', mode: 'context' },
    live: `<obs-menu id="pg-menu" trigger="dots" items='${ACTIONS}'></obs-menu>`,
  },
  gallery: [
    { group: 'Context / Action menu (FlotoGridActions) — a ⋯ trigger opens a menu of ACTIONS on a row', items: [
      block('click ⋯ to open; Delete is a danger (red) action; the menu renders in the top layer', `<obs-menu items='${ACTIONS}'></obs-menu>`),
    ] },
    { group: 'Button trigger — a labelled trigger instead of the ⋯ ellipsis', items: [
      block('trigger="button" with a label; same action menu below', `<obs-menu trigger="button" label="Actions" items='${ACTIONS}'></obs-menu>`),
    ] },
    { group: 'Inline (the MMenu primitive) — the list rendered in place, for nav / picker bodies', items: [
      block('mode="inline": selected row (primary tint) · icons · divider · danger row', `<obs-menu mode="inline" items='${NAV}'></obs-menu>`, '220px'),
    ] },
  ],
}
