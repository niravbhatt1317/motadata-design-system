// Showcase manifest for <obs-modal> — the DS modal dialog (MModal 39× + FlotoConfirmModal 71×). A centered dialog
// over a blurred backdrop, built on the native <dialog> (showModal). Composes obs-button (footer) + obs-icon (✕).
// A modal takes over the top layer, so EVERY example (and the playground) opens on a TRIGGER click — NEVER
// auto-open (that would block the page) and NEVER more than one at a time (the component enforces the invariant).
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
const openBtn = (id, label) => `<obs-button variant="default" onclick="document.getElementById('${id}').show()">${label}</obs-button>`
const block = (label, inner) => ({ html: `<div style="width:100%">${lbl(label)}${inner}</div>`, wide: true })
// a custom footer that MATCHES the built-in .foot: a full-bleed top divider + the standard 12px 16px padding
// (negative margins cancel the body's 24px padding so it spans edge-to-edge and sits flush at the bottom).
const FOOT = 'display:flex;align-items:center;justify-content:flex-end;gap:10px;margin:20px -24px -24px;padding:12px 16px;border-top:1px solid var(--border-color,#e3e8f2)'
// playground Scenario bodies — swapped by the Scenario preset (each also sets the defining attrs)
const S_DETAIL = `<div style="color:var(--page-text-color)"><p style="margin:0 0 14px">Monitor name — <strong>web-server-01</strong></p><p style="margin:0">Polling interval — <em>30s</em>. In seconds.</p></div>`
const S_CONFIRM = `Are you sure you want to delete <strong>web-server-01</strong>? This can't be undone.`
const S_SCROLL = `<div style="color:var(--page-text-color)">${Array.from({ length: 20 }, (_, n) => `<p style="margin:0 0 10px">Row ${n + 1} — the body scrolls within a fixed height while the header/footer stay put.</p>`).join('')}</div>`
const S_COMPARE = `<div style="display:flex;gap:24px;color:var(--page-text-color)"><div style="flex:1"><div style="font-weight:600;margin-bottom:10px">web-server-01</div><obs-key-value items='[["CPU","94%","--severity-critical"],["Memory","61%","--severity-warning"],["Disk","45%","--severity-clear"],["Status","running","","running"]]'></obs-key-value></div><div style="flex:1"><div style="font-weight:600;margin-bottom:10px">db-primary</div><obs-key-value items='[["CPU","38%","--severity-clear"],["Memory","72%","--severity-major"],["Disk","80%","--severity-critical"],["Status","down","","down"]]'></obs-key-value></div></div>`
export default {
  el: 'obs-modal',
  display: 'Modal',
  registry: 'modal',
  events: ['confirm', 'cancel', 'close', 'show', 'hide'],
  // Scenario preset swaps the body + the defining attrs (variant/scrollable/restrict-width/icon…); the individual
  // controls fine-tune. Everything is toggleable on the one live modal — click "Open modal" to see it.
  controls: [
    { label: 'Scenario', slotPresets: [
      { label: 'Detail', html: S_DETAIL, attrs: { variant: 'default', title: 'Edit monitor', 'confirm-text': 'Save', 'cancel-text': 'Cancel', icon: false, 'confirm-variant': false, scrollable: false, 'restrict-width': false, 'hide-footer': false, 'no-padding': false } },
      { label: 'Confirm (destructive)', html: S_CONFIRM, attrs: { variant: 'confirm', icon: 'trash', 'confirm-variant': 'error', 'confirm-text': 'Delete', 'cancel-text': 'Cancel', scrollable: false, 'restrict-width': false, 'hide-footer': false, 'no-padding': false } },
      { label: 'Scrollable (long)', html: S_SCROLL, attrs: { variant: 'default', title: 'Long content', scrollable: true, 'confirm-text': 'Close', 'restrict-width': false, icon: false, 'hide-footer': false } },
      { label: 'Compare (wide)', html: S_COMPARE, attrs: { variant: 'default', title: 'Compare metrics', 'restrict-width': true, 'hide-footer': true, scrollable: false, icon: false } },
    ] },
    { prop: 'title', type: 'text' },
    { prop: 'variant', type: 'select', options: ['default', 'confirm'] },
    { prop: 'confirm-variant', type: 'select', options: ['primary', 'error'], attr: 'confirm-variant', label: 'Confirm color' },
    { prop: 'confirm-text', type: 'text', attr: 'confirm-text' },
    { prop: 'cancel-text', type: 'text', attr: 'cancel-text' },
    { prop: 'width', type: 'text' },
    { prop: 'hide-footer', type: 'toggle' },
    { prop: 'no-padding', type: 'toggle' },
    { prop: 'scrollable', type: 'toggle' },
    { prop: 'restrict-width', type: 'toggle' },
    { prop: 'mask-closable', type: 'toggle', attr: 'mask-closable', label: 'Backdrop closes' },
  ],
  // A modal takes the top layer — auto-opening on load would block the whole docs page. So the modal renders
  // CLOSED (controls still drive it, it's firstElementChild) and a trigger button opens it.
  playground: {
    attrs: { title: 'Edit monitor' },
    live: `<obs-modal id="pg-modal" title="Edit monitor">${S_DETAIL}</obs-modal><obs-button variant="primary" onclick="document.getElementById('pg-modal').show()">Open modal</obs-button>`,
  },
  gallery: [
    { group: 'Default — a --primary title + close ✕, body, footer (Cancel + Save)', items: [
      block('click to open the dialog (centered, blurred backdrop, Esc / ✕ closes)',
        `${openBtn('m-basic', 'Open dialog')}<obs-modal id="m-basic" title="Edit monitor"><div style="color:var(--page-text-color)"><p style="margin:0 0 12px">Monitor name — web-server-01</p><p style="margin:0">Polling interval — 30 (In seconds).</p></div></obs-modal>`),
    ] },
    { group: 'Confirm — centered icon + message + Cancel / action (FlotoConfirmModal, error variant)', items: [
      block('a destructive confirm dialog',
        `<obs-button variant="error" onclick="document.getElementById('m-cf').show()">Delete monitor…</obs-button><obs-modal id="m-cf" variant="confirm" icon="trash" confirm-text="Delete" cancel-text="Cancel" confirm-variant="error">Are you sure you want to delete <strong>web-server-01</strong>? This can't be undone.</obs-modal>`),
    ] },
    { group: 'Hide-footer — read-only / detail content; the ✕ is the way out', items: [
      block('hide-footer', `${openBtn('m-hf', 'Open detail (no footer)')}<obs-modal id="m-hf" title="Monitor details" hide-footer><p style="margin:0;color:var(--page-text-color)">A read-only detail modal — no Save/Cancel; the header ✕ dismisses.</p></obs-modal>`),
    ] },
    { group: 'No-padding — full-bleed body (a list / grid manages its own padding)', items: [
      block('no-padding + hide-footer', `${openBtn('m-np', 'Open no-padding')}<obs-modal id="m-np" title="Select monitor" no-padding hide-footer><div style="color:var(--page-text-color)"><div style="padding:12px 16px;cursor:pointer">web-server-01</div><div style="padding:12px 16px;cursor:pointer;border-top:1px solid var(--border-color)">db-primary</div><div style="padding:12px 16px;cursor:pointer;border-top:1px solid var(--border-color)">cache-02</div></div></obs-modal>`),
    ] },
    { group: 'Scrollable — fixed-height body with its own scroll (header/footer pinned)', items: [
      block('scrollable', `${openBtn('m-sc', 'Open scrollable')}<obs-modal id="m-sc" title="Long content" scrollable confirm-text="Close"><div style="color:var(--page-text-color)">${Array.from({ length: 20 }, (_, n) => `<p style="margin:0 0 10px">Row ${n + 1} — the body scrolls within a fixed height while the header/footer stay put.</p>`).join('')}</div></obs-modal>`),
    ] },
    { group: 'Sizes & wide — width prop; restrict-width forces a fixed 1020px (compare/wide content)', items: [
      block('width="400"', `${openBtn('m-sm', 'Small (400)')}<obs-modal id="m-sm" title="Small" width="400" confirm-text="Close"><p style="margin:0;color:var(--page-text-color)">A narrow dialog.</p></obs-modal>`),
      block('restrict-width (1020px) — real SIDE-BY-SIDE comparison content', `${openBtn('m-lg', 'Compare metrics')}<obs-modal id="m-lg" title="Compare metrics" restrict-width hide-footer><div style="display:flex;gap:24px;color:var(--page-text-color)"><div style="flex:1"><div style="font-weight:600;margin-bottom:10px">web-server-01</div><obs-key-value items='[["CPU","94%","--severity-critical"],["Memory","61%","--severity-warning"],["Disk","45%","--severity-clear"],["Uptime","42 days"],["Status","running","","running"]]'></obs-key-value></div><div style="flex:1"><div style="font-weight:600;margin-bottom:10px">db-primary</div><obs-key-value items='[["CPU","38%","--severity-clear"],["Memory","72%","--severity-major"],["Disk","80%","--severity-critical"],["Uptime","120 days"],["Status","down","","down"]]'></obs-key-value></div></div></obs-modal>`),
    ] },
    { group: 'Edit record (view ↔ edit) — a detail modal that toggles between a read-only view and an edit form', items: [
      block('click Edit monitor → view (obs-key-value); click Edit → the form (obs-input); Cancel/Save return to view', `<obs-button variant="default" onclick="document.getElementById('ve-view').style.display='block';document.getElementById('ve-edit').style.display='none';document.getElementById('m-ve').show()">Edit monitor</obs-button><obs-modal id="m-ve" title="Monitor" hide-footer><div style="color:var(--page-text-color)"><div id="ve-view"><obs-key-value items='[["Monitor","web-server-01"],["IP Address","10.0.0.12"],["Type","Linux Server"],["Polling interval","30 seconds"]]'></obs-key-value><div style="${FOOT}"><obs-button variant="primary" onclick="document.getElementById('ve-view').style.display='none';document.getElementById('ve-edit').style.display='block'">Edit</obs-button></div></div><div id="ve-edit" style="display:none"><div style="display:flex;flex-direction:column;gap:12px"><obs-input block label="Monitor name" value="web-server-01"></obs-input><obs-input block label="IP Address" value="10.0.0.12"></obs-input><obs-input block label="Polling interval (seconds)" type="number" value="30"></obs-input></div><div style="${FOOT}"><obs-button variant="default" onclick="document.getElementById('ve-edit').style.display='none';document.getElementById('ve-view').style.display='block'">Cancel</obs-button><obs-button variant="primary" onclick="document.getElementById('ve-edit').style.display='none';document.getElementById('ve-view').style.display='block'">Save</obs-button></div></div></div></obs-modal>`),
    ] },
  ],
}
