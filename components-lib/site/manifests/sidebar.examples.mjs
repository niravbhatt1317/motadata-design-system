// Showcase manifest for <obs-sidebar> — the product's PRIMARY module rail (FlotoNavBar / layout/navbar.vue).
// Module glyphs reuse obs-icon (the real product icon names). The logo slot uses the real Motadata donut mark
// (brand-logo.png / brand-logo-dark.png, theme-toggled). Pairs with obs-app-header.
const J = (v) => JSON.stringify(v)
// the real 16 product modules (navbar.vue visibleMenuItems), with their real icon names
const MODULES = [
  { key: 'dashboard', label: 'Dashboards', icon: 'dashboard' },
  { key: 'inventory', label: 'Monitors', icon: 'navbar-monitor' },
  { key: 'alert', label: 'Alerts', icon: 'alert' },
  { key: 'slo', label: 'SLO', icon: 'slo', beta: true },
  { key: 'reports', label: 'Reports', icon: 'report' },
  { key: 'topology', label: 'Topology', icon: 'topology' },
  { key: 'nccm', label: 'NCCM', icon: 'ncm' },
  { key: 'netroute', label: 'NetRoute', icon: 'netroute' },
  { key: 'metric-explorer', label: 'Metric Explorer', icon: 'metric-explorer' },
  { key: 'log', label: 'Log Explorer', icon: 'log' },
  { key: 'apm', label: 'APM Explorer', icon: 'apm' },
  { key: 'rum', label: 'RUM Explorer', icon: 'rum' },
  { key: 'flow', label: 'Flow Explorer', icon: 'flow' },
  { key: 'trap-viewer', label: 'Trap Explorer', icon: 'trap-viewer' },
  { key: 'audit', label: 'Audits', icon: 'audit' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]
// the real Motadata donut logo (light + dark), theme-toggled by the site's .brand-logo-light/-dark classes
const LOGO = '<img slot="logo" class="brand-logo-light" src="./brand-logo.png" alt="ObserveOps"><img slot="logo" class="brand-logo-dark" src="./brand-logo-dark.png" alt="ObserveOps">'
const box = (label, inner, h = 840) => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div><div style="height:${h}px;display:flex">${inner}</div></div>` })

export default {
  el: 'obs-sidebar',
  display: 'Sidebar',
  registry: 'sidebar',
  controls: [
    { label: 'Active module', prop: 'active', type: 'select', options: MODULES.map((m) => m.key) },
    { prop: 'expanded', type: 'toggle', label: 'Expanded (pin open)' },
    { prop: 'brand', type: 'text' },
  ],
  playground: {
    attrs: { active: 'dashboard' },
    text: '',
    live: `<obs-sidebar active="dashboard" items='${J(MODULES)}'>${LOGO}</obs-sidebar>`,
  },
  gallery: [
    { group: 'Primary nav — collapsed (default) — the 65px icon rail (Motadata mark + module icons). HOVER it to expand to 170px. The active module (Dashboards) is a --primary-alt pill. All 16 product modules, data-driven via `items`', items: [
      box('collapsed rail — hover to expand', `<obs-sidebar active="dashboard" items='${J(MODULES)}'>${LOGO}</obs-sidebar>`),
    ] },
    { group: 'Expanded (pinned) — `expanded` keeps the rail open at 170px (logo wordmark + labels always visible). SLO carries a BETA tag; the decorative blobs sit bottom-right (as in the product)', items: [
      box('expanded (pinned open)', `<obs-sidebar expanded active="dashboard" items='${J(MODULES)}'>${LOGO}</obs-sidebar>`),
    ] },
    { group: 'Active module — set `active` to the current route’s module key (highlighted --primary-alt, aria-current). Here: Alerts', items: [
      box('active="alert"', `<obs-sidebar expanded active="alert" items='${J(MODULES)}'>${LOGO}</obs-sidebar>`),
    ] },
    { group: 'With obs-app-header — the full app chrome: the sidebar rail (left) + the app header (top). The two navigation archetypes pair up', items: [
      box('sidebar + app header', `<obs-sidebar active="dashboard" items='${J(MODULES)}'>${LOGO}</obs-sidebar><div style="flex:1;display:flex;flex-direction:column;min-width:0"><obs-app-header build="8.0.0" user="NB" brand="" actions='${J([{ icon: 'search', label: 'Search' }, { icon: 'healthMonitoring', label: 'Health' }, { icon: 'bell', label: 'Notifications', badge: 3 }])}'></obs-app-header><div style="flex:1;background:var(--common-main-bg,#f6f9fc)"></div></div>`),
    ] },
  ],
}
