// Showcase manifest for <obs-app-header> — the product's GLOBAL top bar (layout/header.vue).
// The header is the App Chrome COMPOSITION host: drop the real interactive elements (obs-command-palette overlay,
// obs-notification-menu, obs-user-menu) into its slots so each opens its own surface ON CLICK. The `actions` prop is
// a simpler PRESENTATIONAL alternative (declarative icon-buttons that don't open panels) — shown last.
const J = (v) => JSON.stringify(v)
const ACTIONS = [
  { icon: 'search', label: 'Search' },
  { icon: 'healthMonitoring', label: 'Health Monitoring' },
  { icon: 'ncmApproval', label: 'Approval' },
  { icon: 'bell', label: 'Notifications', badge: 3 },
]
// same set, but with the current-route action highlighted (--primary)
const ACTIONS_ACTIVE = ACTIONS.map((a) => (a.icon === 'healthMonitoring' ? { ...a, active: true } : a))
// the full Motadata wordmark logo (light + dark), theme-toggled by the site's .brand-logo-light/-dark classes
const LOGO = '<img slot="brand" class="brand-logo-light" src="./motadata-full.png" alt="Motadata" style="height:26px"><img slot="brand" class="brand-logo-dark" src="./motadata-full-dark.png" alt="Motadata" style="height:26px">'
const block = (label, inner) => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div>${inner}</div>` })

// ── The interactive App Chrome pieces (each self-contained: own trigger + own top-layer surface) ─────────────
const SUGGEST = J(['top', 'last', 'system.disk.free.percent', 'system.disk.capacity.bytes', 'system.disk.used.percent'])
const NTABS = J([{ label: 'Alerts', count: 191 }, { label: 'System Notification', count: 1822 }])
const NITEMS = J([
  { tab: 'Alerts', severity: 'critical', text: 'trap alert', detail: '172.16.9.243', time: 'Tue, Jul 21 06:17 PM', tag: 'Trap' },
  { tab: 'Alerts', severity: 'warning', text: 'CPU utilization high', detail: 'core-switch-01', time: 'Tue, Jul 21 05:52 PM', tag: 'Threshold' },
])
// the full account-menu item set (matches the standalone obs-user-menu showcase — profile · setup · docs)
const UITEMS = J([
  { key: 'profile', label: 'My Profile', icon: 'userCircle' },
  { key: 'setup', label: 'Product Setup Guide', icon: 'questionCircle' },
  { key: 'docs', label: 'Documentation', icon: 'bookOpen', href: '#' },
])
const CP = `<obs-command-palette overlay categories='["Metric","Log","Flow"]' category="Metric" suggestions='${SUGGEST}' time-range placeholder="Start Typing..."></obs-command-palette>`
const NM = (badge = 3) => `<obs-notification-menu count="${badge}" tabs='${NTABS}' items='${NITEMS}'></obs-notification-menu>`
const UM = `<obs-user-menu slot="user" name="Nirav Bhatt" subtitle="nirav.bhatt@motadata.com" items='${UITEMS}'></obs-user-menu>`
const OBSMENU = `<obs-menu slot="user" trigger="click" label="NB" items='${J([{ label: 'Account' }, { label: 'Preferences' }, { label: 'Log out' }])}'></obs-menu>`

// Build a fully-interactive header. brand='' → the element's DEFAULT ObserveOps logo (obs-logo motadata_full, no slot);
// a string → a text wordmark; pass the LOGO const in a preset to demo a custom slot override. Toggle each surface.
const chrome = ({ brand = '', build = '8.0.0', badge = 3, search = true, notif = true, user = true } = {}) =>
  `<obs-app-header ${brand ? `brand="${brand}" ` : ''}${build ? `build="${build}"` : ''}>`
  + (search ? CP : '')
  + (notif ? NM(badge) : '')
  + (user ? UM : '')
  + `</obs-app-header>`

export default {
  el: 'obs-app-header',
  display: 'App Header',
  registry: 'app-header',
  // The "Composition" picker rebuilds the whole header per variant — each preset carries the FULL interactive inner
  // markup (logo/wordmark + the real obs-command-palette / obs-notification-menu / obs-user-menu in the slots) plus a
  // complete attr set (empty values clear the attribute), so every variant stays fully clickable. `build` is a plain
  // attribute control that live-updates the BUILD tag.
  controls: [
    { label: 'Composition', slotPresets: [
      { label: 'Full chrome — default ObserveOps logo + search + notifications + user', html: CP + NM(3) + UM, attrs: { build: '8.0.0', brand: '', actions: '', user: '' } },
      { label: 'Text wordmark (brand prop)', html: CP + NM(3) + UM, attrs: { brand: 'ObserveOps', build: '8.0.0', actions: '', user: '' } },
      { label: 'Custom logo (brand slot override)', html: LOGO + CP + NM(3) + UM, attrs: { brand: '', build: '8.0.0', actions: '', user: '' } },
      { label: 'Minimal — search + notifications only', html: CP + NM(1), attrs: { brand: '', build: '', actions: '', user: '' } },
      { label: 'Account via obs-menu (granular)', html: CP + NM(2) + OBSMENU, attrs: { brand: '', build: '8.0.0', actions: '', user: '' } },
      { label: 'Declarative actions (static, presentational)', html: '', attrs: { brand: '', build: '8.0.0', actions: J(ACTIONS_ACTIVE), user: 'NB' } },
    ] },
    { prop: 'build', type: 'text' },
  ],
  playground: {
    attrs: { build: '8.0.0' },
    text: '',
    // the assembled interactive chrome (matches the first "Full chrome" preset) — click the 🔍 / 🔔 / NB avatar
    live: chrome(),
  },
  gallery: [
    { group: 'Full interactive chrome (the whole App Chrome family in one bar) — the real interactive elements sit in the slots, so each opens its own surface ON CLICK: the 🔍 search icon opens the obs-command-palette as a centered Cmd+K modal over a blurred backdrop; the 🔔 bell opens the obs-notification-menu panel (tabs + alert rows); the avatar opens the obs-user-menu account panel (profile · setup guide · docs · theme switch · log out). This is how the product’s top bar actually composes — click each below', items: [
      block('obs-app-header ▸ command-palette + notification-menu + user-menu (all live — click them)', chrome()),
    ] },
    { group: 'Text wordmark — no logo image: the brand prop renders a text brand instead. Still fully interactive — click search / bell / avatar', items: [
      block('brand="ObserveOps" (text) + interactive chrome', chrome({ brand: 'ObserveOps' })),
    ] },
    { group: 'Minimal — brand + just search & notifications (no build tag, no user avatar). Both still open on click', items: [
      block('brand + search + notifications', chrome({ build: '', user: false, badge: 1 })),
    ] },
    { group: 'Account menu via obs-menu (the granular path) — instead of the turnkey obs-user-menu, compose an obs-menu in the `user` slot. Search + notifications stay interactive; the NB menu opens on click', items: [
      block('user slot = obs-menu',
        `<obs-app-header build="8.0.0">${CP}${NM(2)}`
        + `<obs-menu slot="user" trigger="click" label="NB" items='${J([{ label: 'Account' }, { label: 'Preferences' }, { label: 'Log out' }])}'></obs-menu></obs-app-header>`),
    ] },
    { group: 'Declarative action icons (the `actions` prop) — for a simple PRESENTATIONAL header, pass an actions array of {icon,label,badge,active}: circular icon-buttons where the active route highlights --primary. These do NOT open panels — for the interactive surfaces, compose the App Chrome elements as in the first example', items: [
      block('actions=[…] (presentational; active route highlighted)', `<obs-app-header build="8.0.0" user="NB" actions='${J(ACTIONS_ACTIVE)}'></obs-app-header>`),
    ] },
  ],
}
