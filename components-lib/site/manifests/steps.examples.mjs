// Showcase manifest for <obs-steps> — a wizard/stepper (the product's report-steps.vue + compliance rules-form.vue,
// both Ant a-steps / MSteps derivatives). ONE element: direction (horizontal|vertical) × variant (number|dot) ×
// per-step status; `active` drives the derived wait/process/finish states, `clickable` makes done steps navigable.
const J = (v) => JSON.stringify(v)
const REPORT = ['Report Properties', 'Visualizations & Preview', 'Schedule']
const WIZARD = [
  { label: 'General', description: 'Name & scope' },
  { label: 'Rules', description: 'Define conditions' },
  { label: 'Notification', description: 'Recipients' },
  { label: 'Review', description: 'Confirm & save' },
]
const ERR = [
  { label: 'Upload', description: 'File received' },
  { label: 'Validate', status: 'error', description: 'Schema mismatch' },
  { label: 'Import' },
]
// circles-only track: labels don't render in compact mode, but keep them for the a11y tree
const DOTS = ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5']
const box = (label, inner, w = '') => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:10px">${label}</div><div style="${w}">${inner}</div></div>` })

export default {
  el: 'obs-steps',
  display: 'Steps',
  registry: 'steps',
  // A Preset is a quick-start LOOK: it sets EVERY style attr, so picking one updates all the individual controls
  // below (no stale knobs). Then every axis stays independently controllable — so you can e.g. pick Vertical, then
  // flip Fill to outline or Completed to green. Presets = shortcuts; the controls = free mixing.
  controls: [
    { label: 'Preset', slotPresets: [
      { label: 'Horizontal — filled (report wizard)', attrs: { direction: 'horizontal', variant: 'number', fill: 'solid', connector: 'line', completed: 'primary', size: 'default', compact: null, status: 'process', items: J(REPORT), active: '1' }, html: '' },
      { label: 'Horizontal — lined circles', attrs: { direction: 'horizontal', variant: 'number', fill: 'outline', connector: 'line', completed: 'primary', size: 'default', compact: null, status: 'process', items: J(REPORT), active: '1' }, html: '' },
      { label: 'Horizontal — completed green', attrs: { direction: 'horizontal', variant: 'number', fill: 'solid', connector: 'line', completed: 'green', size: 'default', compact: null, status: 'process', items: J(['Draft', 'Review', 'Publish', 'Done']), active: '2' }, html: '' },
      { label: 'Circles only (compact, no lines)', attrs: { direction: 'horizontal', variant: 'number', fill: 'solid', connector: 'none', completed: 'green', size: 'default', compact: true, status: 'process', items: J(DOTS), active: '2' }, html: '' },
      { label: 'Dot (compact track)', attrs: { direction: 'horizontal', variant: 'dot', fill: 'solid', connector: 'line', completed: 'primary', size: 'default', compact: null, status: 'process', items: J(REPORT), active: '1' }, html: '' },
      { label: 'Vertical (form wizard)', attrs: { direction: 'vertical', variant: 'number', fill: 'solid', connector: 'line', completed: 'primary', size: 'small', compact: null, status: 'process', items: J(WIZARD), active: '2' }, html: '' },
      { label: 'Vertical — lined circles', attrs: { direction: 'vertical', variant: 'number', fill: 'outline', connector: 'line', completed: 'primary', size: 'small', compact: null, status: 'process', items: J(WIZARD), active: '2' }, html: '' },
      { label: 'Error state', attrs: { direction: 'horizontal', variant: 'number', fill: 'solid', connector: 'line', completed: 'primary', size: 'default', compact: null, status: 'process', items: J(ERR), active: '1' }, html: '' },
    ] },
    { prop: 'active', type: 'text' },
    { prop: 'direction', type: 'select', options: ['horizontal', 'vertical'] },
    { prop: 'variant', type: 'select', options: ['number', 'dot'] },
    { prop: 'fill', type: 'select', options: ['solid', 'outline'] },
    { prop: 'connector', type: 'select', options: ['line', 'none'] },
    { prop: 'completed', type: 'select', options: ['primary', 'green'] },
    { prop: 'size', type: 'select', options: ['default', 'small'] },
    { prop: 'status', type: 'select', options: ['process', 'error', 'finish', 'wait'], label: 'Current-step status' },
    { prop: 'compact', type: 'toggle' },
    { prop: 'clickable', type: 'toggle' },
  ],
  playground: {
    attrs: { direction: 'horizontal', active: '1' },
    text: '',
    live: `<obs-steps direction="horizontal" active="1" items='${J(REPORT)}'></obs-steps>`,
  },
  gallery: [
    { group: 'Horizontal (default) — the Report wizard: a numbered circle + label + a thin 1px connector. Done steps are a --primary fill + ✓, the current step is a --primary fill with an outer grey ring, future steps are a muted filled disc', items: [
      box('active="1" (step 2 of 3 in progress)', `<obs-steps direction="horizontal" active="1" items='${J(REPORT)}'></obs-steps>`, 'max-width:760px'),
    ] },
    { group: 'Lined circles (fill="outline") — the same wizard with OUTLINED markers: a transparent circle with a coloured ring + number/✓, for a lighter look on dense pages', items: [
      box('fill="outline"', `<obs-steps direction="horizontal" fill="outline" active="1" items='${J(REPORT)}'></obs-steps>`, 'max-width:760px'),
    ] },
    { group: 'Circles only (compact + connector="none") — just the progress circles, NO labels and NO connecting lines. completed="green" tints the done circles green (or leave it primary/black). A compact progress indicator', items: [
      box('compact connector="none" completed="green"', `<obs-steps direction="horizontal" compact connector="none" completed="green" active="2" items='${J(DOTS)}'></obs-steps>`, 'max-width:320px'),
      box('compact connector="none" completed="primary" (black)', `<obs-steps direction="horizontal" compact connector="none" completed="primary" active="2" items='${J(DOTS)}'></obs-steps>`, 'max-width:320px'),
      box('compact + outline circles', `<obs-steps direction="horizontal" compact connector="none" fill="outline" active="2" items='${J(DOTS)}'></obs-steps>`, 'max-width:320px'),
    ] },
    { group: 'Completed colour (completed="green") — a full wizard whose DONE steps read green instead of primary/black, while the current step stays primary', items: [
      box('completed="green"', `<obs-steps direction="horizontal" completed="green" active="2" items='${J(['Draft', 'Review', 'Publish', 'Done'])}'></obs-steps>`, 'max-width:760px'),
    ] },
    { group: 'Vertical — a left-rail form wizard (compliance rules-form): steps stack top-to-bottom with a title + description; small 24px markers', items: [
      box('direction="vertical" size="small" active="2"', `<obs-steps direction="vertical" size="small" active="2" items='${J(WIZARD)}'></obs-steps>`, 'max-width:280px'),
      box('vertical + outline circles', `<obs-steps direction="vertical" size="small" fill="outline" active="2" items='${J(WIZARD)}'></obs-steps>`, 'max-width:280px'),
    ] },
    { group: 'Clickable — set clickable so a user can jump back to any completed/current step (emits `change` with the index); future steps stay inert', items: [
      box('clickable — click a done step', `<obs-steps direction="vertical" size="small" active="2" clickable items='${J(WIZARD)}'></obs-steps>`, 'max-width:280px'),
    ] },
    { group: 'Dot — a compact state-dot track (Ant progressDot) for a dense or secondary flow where numbers add noise', items: [
      box('variant="dot"', `<obs-steps direction="horizontal" variant="dot" active="1" items='${J(REPORT)}'></obs-steps>`, 'max-width:640px'),
    ] },
    { group: 'Error — a per-step status:"error" marks a failed stage in red (validation failed, import blocked). The current step’s status can also be set via the `status` prop', items: [
      box('items = [{…, status:"error"}]', `<obs-steps direction="horizontal" active="1" items='${J(ERR)}'></obs-steps>`, 'max-width:700px'),
      box('status="error" (current step failed)', `<obs-steps direction="horizontal" active="1" status="error" items='${J(REPORT)}'></obs-steps>`, 'max-width:760px'),
    ] },
    { group: 'Sizes — default (32px marker) vs small (24px, matches the compliance form rail)', items: [
      box('size="default"', `<obs-steps direction="horizontal" active="1" size="default" items='${J(REPORT)}'></obs-steps>`, 'max-width:640px'),
      box('size="small"', `<obs-steps direction="horizontal" active="1" size="small" items='${J(REPORT)}'></obs-steps>`, 'max-width:700px'),
    ] },
  ],
}
