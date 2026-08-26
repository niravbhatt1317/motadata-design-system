// Showcase manifest for <obs-severity> — the severity-level indicator in its render shapes.
const LEVELS = ['critical', 'major', 'warning', 'clear', 'up', 'down', 'maintenance', 'unreachable', 'suspended', 'disable', 'none', 'unknown', 'stop']
// The `severity-stripe` variant in its real product usage: a coloured left rule down list rows
// (each row = the rule + the monitor's severity dot + its name). Mirrors the Storybook "Stripe" story.
const STRIPE_ROWS = [['critical', 'core-switch-01'], ['down', 'db-primary'], ['warning', 'web-03'], ['clear', 'cache-02'], ['maintenance', 'lb-edge-1']]
const stripeList = `<div style="border:1px solid var(--border-color);border-radius:6px;overflow:hidden;max-width:340px">` +
  STRIPE_ROWS.map(([s, n], i) =>
    `<obs-severity shape="stripe" severity="${s}" style="display:flex${i < STRIPE_ROWS.length - 1 ? ';border-bottom:1px solid var(--border-color)' : ''}">` +
    `<obs-severity severity="${s}" style="margin-right:8px"></obs-severity>${n}</obs-severity>`).join('') +
  `</div>`
export default {
  el: 'obs-severity',
  controls: [
    { prop: 'severity', type: 'select', options: LEVELS },
    { prop: 'shape', type: 'select', options: ['dot', 'chip', 'text', 'bg', 'bar', 'stripe'] },
    { prop: 'displayText', type: 'toggle', attr: 'display-text', label: 'Show label (dot)' },
    { prop: 'value', type: 'text', label: 'Value (text/chip/bg)' },
  ],
  playground: { attrs: { severity: 'critical', 'display-text': true }, text: '' },
  events: [],
  gallery: [
    { group: 'Levels — the dot (2px ring + light centre; down solid, up green+red)', items:
      LEVELS.map((l) => ({ attrs: { severity: l, 'display-text': true } })) },
    { group: 'Shapes — the same level in every render mode', items: [
      { attrs: { severity: 'critical', shape: 'dot', 'display-text': true } },
      { attrs: { severity: 'critical', shape: 'chip' } },
      { attrs: { severity: 'critical', shape: 'text', value: '98.6' } },
      { attrs: { severity: 'critical', shape: 'bg' } },
      { attrs: { severity: 'critical', shape: 'bar' } },
    ] },
    { group: 'Stripe (bar) — a standalone coloured accent rule', items:
      ['critical', 'major', 'warning', 'clear', 'down', 'maintenance'].map((l) => ({ attrs: { severity: l, shape: 'bar' } })) },
    { group: 'Stripe (table) — a coloured left rule down list/table rows', items: [
      { html: stripeList, caption: 'severity-stripe · one rule per row = that row’s monitor severity' },
    ] },
    { group: 'Solid chips', items: ['critical', 'major', 'warning', 'clear', 'maintenance'].map((l) => ({ attrs: { severity: l, shape: 'chip' } })) },
    { group: 'Bg-fill cells', items: ['critical', 'major', 'warning', 'clear', 'down'].map((l) => ({ attrs: { severity: l, shape: 'bg' } })) },
  ],
}
