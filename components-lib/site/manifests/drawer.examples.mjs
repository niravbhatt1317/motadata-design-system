// Showcase manifest for <obs-drawer> — the product's most-used overlay (FlotoDrawer, 99×). A drawer is a
// click-to-open overlay (native <dialog> showModal → top layer), so each example is a REAL <obs-button> trigger
// that opens the drawer; close via the ✕, Esc, the inert backdrop (mask-closable=false), or a [data-close] button.
// Everything composes REAL DS components — obs-button, obs-input, obs-radio — not raw HTML controls.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
let n = 0
// a real <obs-button> trigger + the drawer it opens (trigger label overridable for the large variant)
const demo = (label, { title, width = '480', attrs = '', body, actions = '', trigger = 'Open drawer' }) => {
  const id = `dw${++n}`
  return { html: `<div style="width:100%">${lbl(label)}` +
    `<obs-button variant="default" onclick="document.getElementById('${id}').open=true">${trigger}</obs-button>` +
    `<obs-drawer id="${id}" title="${title}" width="${width}" ${attrs}>${body}${actions}</obs-drawer>` +
    `</div>` }
}
const P = (t) => `<p style="color:var(--page-text-color,#1d2a3e);margin:0 0 10px">${t}</p>`
// footer button groups built from real obs-buttons (Cancel carries [data-close] so the drawer closes it)
const closeBtn = '<obs-button variant="default" data-close slot="actions">Close</obs-button>'
const cancelSave = '<obs-button variant="default" data-close slot="actions" style="margin-right:8px">Cancel</obs-button><obs-button variant="primary" slot="actions">Save</obs-button>'
// footer-actions illustration bars (the .actions layout patterns — real obs-buttons)
const fbtn = (t) => `<obs-button variant="default" style="margin-right:8px">${t}</obs-button>`
const saveBtn = '<obs-button variant="primary">Save</obs-button>'
const FBAR = 'display:flex;align-items:center;height:60px;padding:0 24px;max-width:560px'
const fbar = (label, justify, inner) => `<div style="font-size:12px;color:var(--neutral-light,#6a7fa0);margin-bottom:2px">${label}</div><div style="${FBAR};justify-content:${justify}">${inner}</div>`
// large multi-pane body — a PIXEL-FAITHFUL reproduction of the APM Application Registration drawer (2 : 6 : 4),
// mirroring the exact ds-primitives.less values (scoped .lgb styles) + REAL product nav icons (vm/docker/kubernetes).
const FRAMEWORKS = [['Spring Boot', '2.0+'], ['Hibernate', '5.0+'], ['Apache Camel', '2.20+'], ['gRPC', '1.6+'], ['Vert.x', '3.5+']]
// all classes are uniquely prefixed (apm-*) so they can't collide with the site's own .nav/.panel/etc.
const LGB_CSS = `
.apmreg, .apmreg * { box-sizing: border-box; }
.apmreg { display: flex; height: 100%; color: var(--page-text-color,#1d2a3e); font-family: var(--font-family,'Poppins',sans-serif); font-size: 14px; }
.apmreg .apm-navcol { flex: 0 0 20%; background: var(--drawer-sidebar-background,#fff); padding: 16px 12px; }
.apmreg .apm-nav { display: flex; flex-direction: row; align-items: center; padding: 12px; margin-bottom: 8px; border-radius: 8px; cursor: pointer; color: var(--left-menu-text-color,#6a7fa0); }
.apmreg .apm-nav obs-icon { margin-right: 8px; flex: 0 0 auto; }
.apmreg .apm-nav.sel, .apmreg .apm-nav:hover { color: var(--page-text-color,#1d2a3e); background: var(--code-tag-background-color,#ecf1f9); }
.apmreg .apm-form { flex: 0 0 50%; overflow-y: auto; background: var(--dashboard-background,#f9fafb); border-left: 1px solid var(--border-color,#e3e8f2); border-right: 1px solid var(--border-color,#e3e8f2); padding: 16px; }
.apmreg .apm-info { flex: 0 0 30%; overflow-y: auto; background: var(--dashboard-background,#f9fafb); padding: 16px 8px; }
.apmreg .apm-main { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
.apmreg .apm-cap { font-size: 12px; color: var(--neutral-light,#6a7fa0); margin: 0 0 24px; }
.apmreg .apm-sec { font-size: 14px; font-weight: 600; margin: 0 0 8px; }
.apmreg .apm-help { font-size: 12px; color: var(--text-color-common-primery,#1d2a3e); margin: 0 0 12px; }
.apmreg .apm-div { width: 100%; padding-bottom: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color,#e3e8f2); border-radius: 4px; }
.apmreg .apm-apply { margin-top: 24px; padding-bottom: 16px; }
.apmreg .apm-fw { display: flex; align-items: center; margin-bottom: 12px; }
.apmreg .apm-acc { display: inline-block; width: 3px; height: 24px; margin-right: 6px; background: var(--primary,#111c2c); border-radius: 10px; }
.apmreg .apm-panelh { font-size: 16px; font-weight: 600; color: var(--primary,#111c2c); margin: 0; }
/* the product's data table: rounded bordered container, HORIZONTAL row separators only (no vertical borders) */
.apmreg .apm-tablewrap { border: 1px solid var(--border-color,#e3e8f2); border-radius: 6px; overflow: hidden; margin-bottom: 24px; }
.apmreg table.apm-spec { width: 100%; border-collapse: collapse; }
.apmreg .apm-spec th { text-align: left; padding: 10px 16px; font-size: 12px; font-weight: 600; color: var(--neutral-regular,#7186a8); text-transform: uppercase; border-bottom: 1px solid var(--border-color,#e3e8f2); }
.apmreg .apm-spec td { text-align: left; padding: 12px 16px; font-size: 13px; color: var(--text-color-common-primery,#1d2a3e); border-bottom: 1px solid var(--border-color,#e3e8f2); }
.apmreg .apm-spec tr:last-child td { border-bottom: none; }
.apmreg .apm-panel { padding: 16px 12px; background: var(--help-card-bg-color,#f4f7fb); border: 1px solid var(--border-color,#e3e8f2); border-radius: 6px; }
.apmreg .apm-panel h4 { font-size: 14px; font-weight: 600; margin: 0 0 8px; }
.apmreg .apm-once { font-size: 12px; color: var(--neutral-light,#6a7fa0); margin: 0 0 4px; }
.apmreg .apm-panel ul { margin: 0; padding-left: 24px; font-size: 12px; line-height: 1.6; color: var(--text-color-common-primery,#1d2a3e); }
`
// nav item icon uses the reusable <obs-icon> element (dogfooding), not inlined SVG
const nav = (icon, label, sel) => `<div class="apm-nav${sel ? ' sel' : ''}"><obs-icon name="${icon}" size="18"></obs-icon><span>${label}</span></div>`
const largeBody = `<style>${LGB_CSS}</style><div class="apmreg">
  <div class="apm-navcol">
    ${nav('vm', 'Host/VM', true)}${nav('docker', 'Docker')}${nav('kubernetes', 'Kubernetes')}
  </div>
  <div class="apm-form">
    <h5 class="apm-main">Instrumenting Host/VM Based Application</h5>
    <div class="apm-cap">Follow the steps below to register your application and start collecting traces using the APM agent.</div>
    <h6 class="apm-sec">Instrumentation Method</h6>
    <p class="apm-help">Choose how to instrument your application.</p>
    <obs-radio options="Manual,Auto Detect" value="Manual" as-button></obs-radio>
    <div class="apm-div"></div>
    <h6 class="apm-sec">Select Language</h6>
    <p class="apm-help">Select your application's language.</p>
    <obs-radio options="Java,.NET,Node.js,Python" value="Java" as-button></obs-radio>
    <div class="apm-div"></div>
    <h6 class="apm-sec">Service Name <span style="color:var(--secondary-red,#ec5b5b)">*</span></h6>
    <p class="apm-help">The service name is displayed in APM Explorer. Provide a unique and meaningful name (e.g., ERP).</p>
    <obs-input material placeholder="Enter your service name" block></obs-input>
    <div class="apm-apply"><obs-button variant="primary">Apply Configuration</obs-button></div>
  </div>
  <div class="apm-info">
    <div class="apm-fw"><span class="apm-acc"></span><h4 class="apm-panelh">Supported Frameworks</h4></div>
    <div class="apm-tablewrap"><table class="apm-spec"><thead><tr><th>FRAMEWORK</th><th>VERSION(S)</th></tr></thead>
      <tbody>${FRAMEWORKS.map((f) => `<tr><td>${f[0]}</td><td>${f[1]}</td></tr>`).join('')}</tbody></table></div>
    <div class="apm-panel">
      <h4>Verification</h4>
      <p class="apm-once">Once the Application is Running:</p>
      <ul>
        <li>Confirm that the service has been registered successfully.</li>
        <li>On the service registration screen, the trace collection Status should display "Running."</li>
        <li>The traces will start appearing in the APM Explorer screen.</li>
      </ul>
    </div>
  </div>
</div>`
// body presets for the "Type" control (the footer is a PROP, so it survives a body swap)
const detailBody = P('<strong>web-server-01</strong> — 10.0.0.12') + P('Status: Up · Last poll: 12s ago · Interval: 30s.') + P('Body scrolls within the panel; the title and footer stay put.')
const formBody = '<obs-input label="Monitor name" placeholder="web-server-01" required block></obs-input><div style="height:14px"></div><obs-input label="Polling interval" type="number" value="30" help="In seconds." block></obs-input>'
export default {
  el: 'obs-drawer',
  display: 'Drawer',
  registry: 'drawer',
  events: ['open', 'close', 'after-close', 'footer-action'],
  controls: [
    { prop: 'title', type: 'text' },
    { prop: 'width', type: 'text' },
    { prop: 'placement', type: 'select', options: ['right', 'left'] },
    // pick the built-in footer action pattern (used when no `actions` slot is provided)
    { prop: 'footer', type: 'select', options: ['none', 'close', 'cancel-save', 'reset-cancel-save', 'delete-split', 'note-split'] },
    { prop: 'mask-closable', type: 'toggle', label: 'Backdrop closes' },
    { prop: 'scrolled-content', type: 'toggle' },
    { prop: 'use-padding', type: 'toggle', attr: 'use-padding' },
    // pick the drawer TYPE — swaps the body AND applies the type's width/scrolled-content/footer.
    // Large is 96% + scrolled-content=false (edge-to-edge multi-pane, no surrounding body padding) + no footer.
    { label: 'Type', slotPresets: [
      { label: 'Detail panel', html: detailBody, attrs: { width: '480', 'scrolled-content': '', footer: 'close' } },
      { label: 'Form', html: formBody, attrs: { width: '480', 'scrolled-content': '', footer: 'cancel-save' } },
      { label: 'Large multi-pane', html: largeBody, attrs: { width: '96%', 'scrolled-content': 'false', footer: 'none' } },
    ] },
  ],
  // A drawer is a modal overlay — auto-opening it would make the whole docs page inert (a "hang").
  // The controls panel drives wrap.firstElementChild, so the <obs-drawer> MUST be first. The trigger comes
  // AFTER and opens it by id. The footer is the `footer` PROP (a built-in preset) so the Footer control drives
  // it and the Type control (slotPresets) can swap the body without wiping it. Flow: change controls → Open.
  playground: {
    attrs: { title: 'Monitor details', width: '480', footer: 'cancel-save' },
    live: '<obs-drawer id="pg-drawer" title="Monitor details" width="480" footer="cancel-save">'
      + detailBody + '</obs-drawer>'
      + '<obs-button variant="default" onclick="document.getElementById(\'pg-drawer\').open=true">Open drawer</obs-button>',
  },
  gallery: [
    { group: 'Basic — a detail side panel: title + scrollable body + an actions footer (Close)', items: [
      demo('slide-in from the right over a blurred backdrop; ✕ / Esc close (backdrop is inert)', {
        title: 'Monitor details',
        body: P('<strong>web-server-01</strong> — 10.0.0.12') + P('Status: Up · Last poll: 12s ago · Interval: 30s.') + P('Body content scrolls within the panel; the title and the actions footer stay put.'),
        actions: closeBtn,
      }),
    ] },
    { group: 'Form drawer — the Add/Edit pattern (labelled obs-inputs + Cancel / Save)', items: [
      demo('real obs-inputs with labels (required *) + help text; Cancel [data-close] + Save in the footer', {
        title: 'Edit monitor',
        body: '<obs-input label="Monitor name" placeholder="web-server-01" required block></obs-input>'
          + '<div style="height:14px"></div>'
          + '<obs-input label="Polling interval" type="number" value="30" help="In seconds." block></obs-input>',
        actions: cancelSave,
      }),
    ] },
    { group: 'Widths — px (360) or % (60%); default is 40%', items: [
      demo('narrow — width="360"', { title: 'Narrow', width: '360', body: P('A 360px panel.'), actions: closeBtn }),
      demo('wide — width="60%"', { title: 'Wide', width: '60%', body: P('A 60%-wide panel for richer content.'), actions: closeBtn }),
    ] },
    { group: 'Footer actions (2 / 3 / 4 buttons) — the actions-bar layout patterns', items: [
      { html: `<div style="width:100%">${lbl('right-aligned; primary far-right, Cancel just left of it; a destructive/tertiary action (or a note) splits LEFT via justify-between')}` +
        '<div style="display:flex;flex-direction:column;gap:16px">' +
        fbar('2 — Cancel + Save (right)', 'flex-end', fbtn('Cancel') + saveBtn) +
        fbar('3 — Reset + Cancel + Save (right)', 'flex-end', fbtn('Reset') + fbtn('Cancel') + saveBtn) +
        fbar('3 split — Delete (LEFT) · Cancel + Save (right)', 'space-between', '<obs-button variant="error" outline>Delete</obs-button><span>' + fbtn('Cancel') + saveBtn + '</span>') +
        fbar('4 split — note (LEFT) · Back + Cancel + Save (right)', 'space-between', '<span style="font-size:12px;color:var(--secondary-red,#ec5b5b)">* fields are mandatory</span><span>' + fbtn('Back') + fbtn('Cancel') + saveBtn + '</span>') +
        '</div></div>' },
    ] },
    { group: 'Large / full-screen (90–96%, multi-pane) — width 85–96% (~30×), :scrolled-content="false", a 2:6:4 body', items: [
      demo('Open registration (96%) — a tinted deployment nav · sectioned form (obs-radio / obs-input) · info column; each pane scrolls independently', {
        title: 'Application Registration', width: '96%', attrs: 'scrolled-content="false"', trigger: 'Open registration (96%)', body: largeBody, actions: '',
      }),
    ] },
    { group: 'Left placement — slides in from the left', items: [
      demo('placement="left"', { title: 'Filters', width: '360', attrs: 'placement="left"', body: P('A left-anchored panel — useful for filter/nav side sheets.'), actions: closeBtn }),
    ] },
  ],
}
