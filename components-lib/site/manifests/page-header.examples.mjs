// Showcase manifest for <obs-page-header> — the product's list/detail + entity-detail page header.
// EVERY action/badge reuses a DS element: obs-input (search) · obs-button (primary Add / bordered secondary /
// [squared] icon buttons) · obs-icon (back, breadcrumb, action glyphs) · obs-tag (status badge) · obs-severity
// (meta status dots). No hand-built controls.
const J = (v) => JSON.stringify(v)
const EXPORT = '<obs-button variant="default" squared aria-label="Export"><obs-icon name="download" size="14"></obs-icon></obs-button>'
const ACTIONS = `<obs-input type="search" placeholder="Search"></obs-input>${EXPORT}<obs-button variant="primary">Add Monitor</obs-button>`
// detail-header metadata strip (RUM Session drill-down) — icons + key:value fields (reuses obs-icon)
const META_SESSION = [
  { icon: 'globe', value: '172.20.22.2' }, { icon: 'calendar', value: 'Wed, Jul 15, 2026 11:00:04 AM' },
  { label: 'Frustration', value: 'Detected' }, { label: 'Environment', value: 'prod' },
  { label: 'Service', value: 'vue-ragnet-22.2@1.0.6:prod' }, { label: 'Version', value: '1.0.6' },
  { label: 'OS Name', value: 'Linux' }, { label: 'Browser', value: 'Safari' }, { label: 'Country', value: 'unknown' },
]
// status-dot fields (RUM resource header) — reuses obs-severity shape=dot
const META_STATUS = [{ icon: 'globe', status: 'critical', value: 'Integration' }, { status: 'critical', value: 'javaDistributed' }]
// monitor-detail header (inventory) — type meta + a status badge + breadcrumb + right icon actions
const META_MONITOR = [{ label: 'Type', value: 'Azure Cloud' }, { label: 'Environment', value: 'test' }, { label: 'Group', value: 'Cloud' }]
const MON_CRUMB = '<span slot="breadcrumb" style="display:inline-flex;align-items:center;gap:6px;color:var(--neutral-light,#6a7fa0)"><obs-icon name="home" size="13"></obs-icon><obs-icon name="chevronRight" size="9"></obs-icon><obs-icon name="server" size="14"></obs-icon></span>'
const MON_BADGE = '<obs-tag slot="title" status="up"></obs-tag>'
const MON_ACTIONS = '<obs-button variant="default" squared aria-label="Refresh"><obs-icon name="sync" size="14"></obs-icon></obs-button><obs-button variant="default" squared aria-label="Topology"><obs-icon name="sitemap" size="14"></obs-icon></obs-button><obs-button variant="default" squared aria-label="Full screen"><obs-icon name="expand" size="14"></obs-icon></obs-button>'
const MONITOR = `<obs-page-header heading="ubuntu-linux2 (motadata-freetier)" meta='${J(META_MONITOR)}'>${MON_CRUMB}${MON_BADGE}${MON_ACTIONS}</obs-page-header>`

const block = (label, inner) => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div>${inner}</div>` })

export default {
  el: 'obs-page-header',
  display: 'Page Header',
  registry: 'page-header',
  // Playground: edit title/subtitle/count, pick an accent severity, toggle back + divider, or jump to a full
  // preset (list header · detail-with-subtitle · RUM meta strip · status dots · monitor detail).
  controls: [
    { label: 'Preset', slotPresets: [
      { label: 'List header', attrs: { heading: 'Monitors', count: '128', subtitle: '', accent: '', meta: '', back: '' }, html: ACTIONS },
      { label: 'Detail + subtitle + back', attrs: { heading: 'AlmaLinux 9 (CIS)', subtitle: 'Compliance benchmark · 214 rules · last run 2h ago', count: '', accent: '', meta: '', back: 'true' }, html: '<obs-button variant="default">Re-run</obs-button><obs-button variant="primary">Export</obs-button>' },
      { label: 'Detail header (meta strip)', attrs: { heading: 'Session', accent: 'up', count: '', subtitle: '', meta: J(META_SESSION), back: '' }, html: '' },
      { label: 'Detail (status dots)', attrs: { heading: 'POST /api/db-operation', accent: 'critical', count: '', subtitle: '', meta: J(META_STATUS), back: '' }, html: '' },
      { label: 'Monitor detail', attrs: { heading: 'ubuntu-linux2 (motadata-freetier)', accent: '', count: '', subtitle: '', meta: J(META_MONITOR), back: '' }, html: `${MON_CRUMB}${MON_BADGE}${MON_ACTIONS}` },
    ] },
    { prop: 'heading', type: 'text' },
    { prop: 'subtitle', type: 'text' },
    { prop: 'back', type: 'toggle' },
    { prop: 'count', type: 'text' },
    { prop: 'accent', type: 'select', label: 'Accent (severity)', options: ['', 'up', 'clear', 'warning', 'major', 'critical', 'down', 'maintenance'] },
    { prop: 'no-divider', type: 'toggle', attr: 'no-divider', label: 'No divider' },
  ],
  playground: {
    attrs: { heading: 'Monitors', count: '128' },
    text: '',
    live: `<obs-page-header heading="Monitors" count="128">${ACTIONS}</obs-page-header>`,
  },
  gallery: [
    { group: 'Page header (default) — title (--primary-alt, weight 500) + count pill on the left; on the right the full action set: search (obs-input) + export (obs-button[squared] icon) + primary Add (obs-button)', items: [
      block('title + count + search + export + Add', `<obs-page-header heading="Monitors" count="128">${ACTIONS}</obs-page-header>`),
    ] },
    { group: 'With a back button — a leading chevron (left gutter, centred on the title line; emits `back`) for a detail/nested page', items: [
      block('back + title + export + primary', `<obs-page-header heading="web-server-01" back>${EXPORT}<obs-button variant="primary">Edit</obs-button></obs-page-header>`),
    ] },
    { group: 'With a subtitle — a secondary muted line under the title (detail / drill-down / drawer headers, e.g. the compliance drill-down)', items: [
      block('back + title + subtitle + actions', `<obs-page-header heading="AlmaLinux 9 (CIS)" subtitle="Compliance benchmark · 214 rules · last run 2h ago" back><obs-button variant="default">Re-run</obs-button><obs-button variant="primary">Export</obs-button></obs-page-header>`),
    ] },
    { group: 'With a breadcrumb slot — drop a trail above the header row (obs-breadcrumbs); the slot is invisible when empty', items: [
      block('breadcrumb slot + title + actions', `<obs-page-header heading="web-server-01" subtitle="Linux Server · 10.0.0.12"><span slot="breadcrumb" style="font-size:0.75rem;color:var(--neutral-light,#6a7fa0)">Inventory / Monitors / <span style="color:var(--page-text-color)">web-server-01</span></span><obs-button variant="primary">Edit</obs-button></obs-page-header>`),
    ] },
    { group: 'Detail header (meta strip) — the RUM/APM span-detail header (Session / Action / Resource): an accent stripe (type/severity colour) + title + a wrapping " | "-separated metadata row of icon / Label: value fields (reuses obs-icon)', items: [
      block('accent="up" + title + meta=[{icon|label,value}]', `<obs-page-header heading="Session" accent="up" no-divider meta='${J(META_SESSION)}'></obs-page-header>`),
    ] },
    { group: 'Detail header with status dots — meta fields can carry a status (reuses obs-severity shape=dot), e.g. the resource header', items: [
      block('accent="critical" + meta with status dots', `<obs-page-header heading="POST /api/db-operation" accent="critical" no-divider meta='${J(META_STATUS)}'></obs-page-header>`),
    ] },
    { group: 'Monitor detail header — breadcrumb (home › type icon) + title + a status badge (obs-tag status="up") + a type/meta strip on the left, and icon actions (refresh / topology / full-screen) on the right (the inventory detail header)', items: [
      block('breadcrumb + title + status badge + meta + icon actions', MONITOR),
    ] },
    { group: 'Title only — the minimal header (no count, single primary action)', items: [
      block('heading + one action', `<obs-page-header heading="Alert Policies"><obs-button variant="primary">Create Policy</obs-button></obs-page-header>`),
    ] },
    { group: 'no-divider — drops the bottom rule for a header sitting on a card/panel that already has edges', items: [
      block('no-divider', `<obs-page-header heading="Overview" no-divider>${EXPORT}</obs-page-header>`),
    ] },
  ],
}
