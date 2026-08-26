// Showcase manifest for <obs-grid-select> — the grid / table dropdown (the "Select Agent / Monitor" picker, ~70×).
// A dropdown whose menu is a searchable TABLE with checkboxes, sortable columns, a selected badge + View/Clear
// Selected, and rich cells (severity ring · type icons · status tag). Composes real product icons.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
const COLS = '[{"key":"name","title":"MONITOR","type":"severity","sortable":true},{"key":"ip","title":"IP"},{"key":"type","title":"TYPE","type":"type"},{"key":"status","title":"STATUS","type":"status"}]'
const ROWS = '[{"id":"a1","name":"motadata(172.16.9.243)","ip":"172.16.9.243","status":"running","sev":"critical"},{"id":"a2","name":"motadata-VMware-Virtual-Platform","ip":"172.20.22.2","status":"running","sev":"critical"},{"id":"a3","name":"APMSandboxAgent","ip":"172.16.14.100","status":"running","sev":"critical"}]'
const el = (attrs) => `<obs-grid-select columns='${COLS}' rows='${ROWS}' ${attrs}></obs-grid-select>`
const block = (label, inner, minH = '340px') => ({ html: `<div style="width:100%">${lbl(label)}<div style="min-height:${minH}">${inner}</div></div>` })
export default {
  el: 'obs-grid-select',
  display: 'Grid Select',
  registry: 'grid-select',
  events: ['change', 'search', 'show', 'hide'],
  controls: [
    { prop: 'placeholder', type: 'text' },
    { prop: 'multiple', type: 'toggle' },
    { prop: 'searchable', type: 'toggle' },
    { prop: 'block', type: 'toggle' },
    { prop: 'disabled', type: 'toggle' },
  ],
  // A grid-select opens a POPOVER (not a modal), so the page stays interactive — safe to open on load.
  playground: {
    attrs: { placeholder: 'Select Agent', multiple: true },
    live: `<obs-grid-select id="pg-grid" placeholder="Select Agent" multiple columns='${COLS}' rows='${ROWS}'></obs-grid-select>`,
  },
  gallery: [
    { group: 'Multi-select (Select Agent, ~70×) — checkboxes + Select-All + selected badge + View/Clear Selected', items: [
      block('click the trigger to open; check rows; the trigger shows "name (+N)" and el.value reflects the ids', el('placeholder="Select Agent" multiple')),
    ] },
    { group: 'Single-select (Select Monitor) — click a row to pick and close', items: [
      block('single: picking a row closes the menu and reflects el.value = the row id', el('placeholder="Select Monitor"')),
    ] },
    { group: 'Rich cells — severity dot (Monitor, obs-severity) · product type icons (Type) · status tag (Status, obs-tag)', items: [
      block('columns carry a `type`: severity → obs-severity dot + name · type → server+config icons · status → obs-tag', el('placeholder="Select Agent" multiple')),
    ] },
    { group: 'No search — a short list can drop the search box (searchable="false")', items: [
      block('searchable="false" hides the search box', el('placeholder="Select Monitor" searchable="false"')),
    ] },
    { group: 'Block — a full-width trigger for form fields', items: [
      block('block stretches the trigger to its container width', el('placeholder="Select Agent" multiple block')),
    ] },
    { group: 'Disabled — the picker is unavailable in the current state/permission', items: [
      block('disabled — the trigger is non-interactive', el('placeholder="Select Agent" disabled'), '80px'),
    ] },
  ],
}
