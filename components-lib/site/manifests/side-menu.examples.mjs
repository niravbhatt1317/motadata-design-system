// Showcase manifest for <obs-side-menu> — the in-module section panel (ONE element, mode axis). Each variant is
// transcribed from its product source. Reuses obs-input (search) · obs-button (＋ / toggle) · obs-icon (glyphs)
// · obs-logo (tree type LOGOS: Router/Linux/Windows) · obs-tag (counts).
const J = (v) => JSON.stringify(v)
// sections (settings): icon + name groups → plain sub-items
const SECTIONS = [
  { label: 'General', icon: 'cog', children: [{ label: 'Branding' }, { label: 'Date & Time' }, { label: 'Localization' }] },
  { label: 'Monitoring', icon: 'desktop', children: [{ label: 'Monitor Templates' }, { label: 'Metric Collection' }, { label: 'Schedules' }] },
  { label: 'Users & Roles', icon: 'user', children: [{ label: 'Users' }, { label: 'Roles' }, { label: 'LDAP' }] },
  { label: 'Integrations', icon: 'plug', children: [{ label: 'Notification' }, { label: 'Webhooks' }] },
]
// categories (dashboard): count-tag groups → child dashboards each with a th-large icon
const dash = (labels) => labels.map((l) => ({ label: l, icon: 'th-large' }))
const CATEGORIES = [
  { label: 'My Favorite', count: 7, children: dash(['Server Overview', 'Network Health', 'Top Talkers']) },
  { label: 'Recently Viewed', count: 10, children: dash(['CPU & Memory', 'Disk Usage']) },
  { label: 'Server', count: 6, children: dash(['Linux Servers', 'Windows Servers', 'VMware Hosts']) },
  { label: 'Network', count: 10, children: dash(['Switches', 'Routers', 'Interfaces', 'WAN Links']) },
  { label: 'Cloud', count: 2, children: dash(['AWS', 'Azure']) },
]
// tree (log hierarchy) — the real product log-item.vue: a monitor-type LOGO + name + a numeric (JetBrains Mono)
// count. Type nodes carry a `logo` (Router/Linux/Windows from the logos library); leaves show a count only.
const TREE = [
  { label: 'Router', logo: 'router', count: '6.77 M', children: [{ label: 'Cisco Device Configuration', count: '1.2 M' }, { label: 'Cisco Router Config Change', count: '412.05 K' }, { label: 'Cisco Router', count: '653.32 K' }, { label: 'Cisco Device OSPF Audit', count: '88.1 K' }] },
  { label: 'Linux', logo: 'linux', count: '4.58 M', children: [{ label: 'Linux Syslog', count: '3.61 M' }, { label: 'Linux API Service Audit', count: '512.4 K' }, { label: 'Linux Login Audit', count: '7.41 K' }, { label: 'Linux Logout Audit', count: '2.45 K' }] },
  { label: 'Windows', logo: 'windows', count: '3.97 M', children: [{ label: 'Windows Event Collector', count: '1.1 M' }, { label: 'Windows Firewall', count: '973.8 K' }, { label: 'Windows Update', count: '967.4 K' }, { label: 'Windows Login Audit', count: '412 K' }] },
]
// list (saved views): flat, favourite + editable flags
const LIST = [
  { label: 'Favorites', favorite: true }, { label: 'All Reports' }, { label: 'Config' },
  { label: 'Inventory', edit: true }, { label: 'Performance', edit: true }, { label: 'Flow Reports' },
  { label: 'Alert' }, { label: 'Availability' }, { label: 'Network' }, { label: 'Server' }, { label: 'SDN', edit: true },
]
const PLUS = '<obs-button slot="tabs-action" variant="primary" shape="circle" aria-label="Create"><obs-icon name="plus" size="14"></obs-icon></obs-button>'
const TOGGLE = '<obs-button slot="search-action" variant="neutral-lightest" squared aria-label="Layout"><obs-icon name="custom-dashboard" size="14"></obs-icon></obs-button>'
const box = (label, inner, w = 320) => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div><div style="width:${w}px;height:400px">${inner}</div></div>` })

export default {
  el: 'obs-side-menu',
  display: 'Side Menu',
  registry: 'side-menu',
  controls: [
    { label: 'Preset', slotPresets: [
      { label: 'Sections (settings)', attrs: { style: 'width:260px', mode: 'sections', items: J(SECTIONS), active: 'Metric Collection', tabs: '', 'tab-style': 'underline' }, html: '' },
      { label: 'Categories (dashboards)', attrs: { style: 'width:340px', mode: 'categories', items: J(CATEGORIES), active: 'Linux Servers', tabs: J(['Dashboard', 'NOC View']), 'tab-style': 'segmented' }, html: PLUS + TOGGLE },
      { label: 'Tree (log hierarchy)', attrs: { style: 'width:300px', mode: 'tree', items: J(TREE), active: 'Linux Syslog', tabs: J(['Type', 'Group', 'Saved Query']), 'tab-style': 'underline' }, html: '' },
      { label: 'List (saved views)', attrs: { style: 'width:300px', mode: 'list', items: J(LIST), active: 'All Reports', tabs: J(['Metric', 'Log', 'Flow', 'Audit']), 'tab-style': 'underline' }, html: '' },
    ] },
    { prop: 'active', type: 'text' },
    { prop: 'search', type: 'toggle' },
    { prop: 'placeholder', type: 'text' },
  ],
  playground: {
    attrs: { mode: 'sections' },
    text: '',
    live: `<obs-side-menu style="width:260px" mode="sections" active="Metric Collection" items='${J(SECTIONS)}'></obs-side-menu>`,
  },
  gallery: [
    { group: 'Sections (default, 20×) — a searchable accordion of icon + name sections (settings sub-nav); the active leaf gets a --primary left rule. Crisp 9px/6px rows', items: [
      box('mode="sections"', `<obs-side-menu mode="sections" active="Metric Collection" items='${J(SECTIONS)}'></obs-side-menu>`, 260),
    ] },
    { group: 'Categories (dashboard picker) — a SEGMENTED Dashboard/NOC switcher + a round ＋ (tabs-action slot) · search + a layout toggle (search-action slot) · category groups with count tags → child dashboards (each with an icon)', items: [
      box('mode="categories" + segmented + ＋ + toggle', `<obs-side-menu mode="categories" tab-style="segmented" active="Linux Servers" tabs='${J(['Dashboard', 'NOC View'])}' items='${J(CATEGORIES)}'>${PLUS}${TOGGLE}</obs-side-menu>`, 340),
    ] },
    { group: 'Tree (Log / Topology hierarchy) — UNDERLINE tabs + search; nodes = chevron + type icon (--primary-alt) + name + count badge; leaves show a leading chevron + count', items: [
      box('mode="tree" + underline tabs', `<obs-side-menu mode="tree" active="Linux Syslog" tabs='${J(['Type', 'Group', 'Saved Query'])}' items='${J(TREE)}'></obs-side-menu>`, 300),
    ] },
    { group: 'List (report / saved views) — UNDERLINE tabs + search; a flat border-split list with a ★ favourite row, the active item in weight 500 (product .selection-menu), and a pencil on hover for editable rows', items: [
      box('mode="list" + underline tabs', `<obs-side-menu mode="list" active="All Reports" tabs='${J(['Metric', 'Log', 'Flow', 'Audit'])}' items='${J(LIST)}'></obs-side-menu>`, 300),
    ] },
    { group: 'Search off — set search=false for a short fixed menu', items: [
      box('search="false"', `<obs-side-menu mode="sections" search="false" active="Users" items='${J(SECTIONS)}'></obs-side-menu>`, 260),
    ] },
  ],
}
