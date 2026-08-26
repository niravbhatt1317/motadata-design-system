// Showcase manifest for <obs-notification-menu> — the interactive header NOTIFICATION panel (App Chrome). Click the
// bell to open the dropdown: title + Alerts/System tabs + a scrollable list (severity dot + text + time) + View all /
// Clear all. Self-contained; drops into obs-app-header to make the bell interactive.
const J = (v) => JSON.stringify(v)
const ITEMS = [
  { tab: 'Alerts', severity: 'warning', text: 'trap alert', detail: '172.16.9.243', time: 'Tue, Jul 21, 2026 06:17:26 PM', tag: 'Trap' },
  { tab: 'Alerts', severity: 'critical', text: 'trap include Trap in message', detail: '172.16.9.243', time: 'Tue, Jul 21, 2026 06:17:26 PM', tag: 'Trap' },
  { tab: 'Alerts', severity: 'clear', text: 'Availability', detail: '172.16.15.196 ( 172.16.15.196 )', time: 'Tue, Jul 21, 2026 06:17:18 PM', tag: 'Availability' },
  { tab: 'Alerts', severity: 'critical', text: 'CPU utilization on web-01 crossed 95%', time: 'Tue, Jul 21, 2026 04:52:53 PM' },
  { tab: 'System Notification', severity: 'critical', text: 'Failed to execute query for widget Preview Widget', detail: 'Possible reason: no valid data found', time: 'Tue, Jul 21, 2026 04:52:53 PM' },
  { tab: 'System Notification', severity: 'clear', text: 'MB_Location_5 Monitor modified successfully', time: 'Tue, Jul 21, 2026 04:52:50 PM' },
  { tab: 'System Notification', severity: 'clear', text: 'Ramansh User modified successfully', time: 'Tue, Jul 21, 2026 04:50:22 PM' },
]
const ACTIONS = J([{ icon: 'search', label: 'Search' }])
const box = (label, inner, w = '') => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:10px">${label}</div><div style="${w}">${inner}</div></div>` })

export default {
  el: 'obs-notification-menu',
  display: 'Notification Menu',
  registry: 'notification-menu',
  summary: 'The interactive header notification panel — a bell + unread-count badge that opens a dropdown of alerts/system notifications with tabs, a scrollable list, and View all / Clear all. Drops into obs-app-header. Part of the App Chrome family; the turnkey form of the notification-dropdown recipe.',
  controls: [
    { prop: 'count', type: 'text', default: '3' },
    { prop: 'title', type: 'text', default: 'Alerts & Notifications' },
    { prop: 'placement', type: 'select', options: ['bottom-end', 'bottom-start'] },
    { prop: 'clear-label', type: 'text', default: 'Clear all' },
    { prop: 'viewall-label', type: 'text', default: 'View all' },
  ],
  playground: {
    attrs: { count: '3', title: 'Alerts & Notifications' },
    text: '',
    live: `<obs-notification-menu count="3" title="Alerts \u0026 Notifications" tabs='[{"label":"Alerts","count":191},{"label":"System Notification","count":1822}]' items='${J(ITEMS)}'></obs-notification-menu>`,
  },
  gallery: [
    { group: 'Interactive — click the bell to open the panel. Each row is a coloured LEFT severity bar (critical/warning/clear) + a title / detail / timestamp body + an optional right TAG chip (Trap, Availability); the tabs show per-stream counts — Alerts (191) / System Notification (1822); footer is View all / Clear all. The unread count shows in the badge', items: [
      box('severity bars + tags + tab counts — click the bell', `<div style="display:flex;justify-content:flex-end;padding:8px 12px;border:1px solid var(--border-color,#e3e8f2);border-radius:8px"><obs-notification-menu count="3" tabs='[{"label":"Alerts","count":191},{"label":"System Notification","count":1822}]' items='${J(ITEMS)}'></obs-notification-menu></div>`, 'max-width:420px'),
    ] },
    { group: 'In the app header (App Chrome) — the bell sits in the header action area; click it to open the notification panel. Pair it with obs-user-menu for the full interactive chrome', items: [
      box('obs-app-header + obs-notification-menu + obs-user-menu',
        `<obs-app-header brand="ObserveOps" build="8.0.0" actions='${ACTIONS}'>`
        + `<obs-notification-menu count="3" tabs='[{"label":"Alerts","count":191},{"label":"System Notification","count":1822}]' items='${J(ITEMS)}'></obs-notification-menu>`
        + `<obs-user-menu slot="user" name="Nirav Bhatt" subtitle="nirav.bhatt@motadata.com" items='${J([{ key: 'p', label: 'My Profile', icon: 'userCircle' }, { key: 'd', label: 'Documentation', icon: 'bookOpen', href: '#' }])}'></obs-user-menu>`
        + `</obs-app-header>`, ''),
    ] },
    { group: 'Empty state — a tab with no notifications shows a friendly “all caught up” placeholder', items: [
      box('no items', `<div style="display:flex;justify-content:flex-end;padding:8px 12px;border:1px solid var(--border-color,#e3e8f2);border-radius:8px"><obs-notification-menu count="0" tabs="Alerts,System Notification" items='${J([])}'></obs-notification-menu></div>`, 'max-width:420px'),
    ] },
    { group: 'Single list (no tabs) — pass one tab (or none) for a flat notification list without the tab strip', items: [
      box('tabs="Notifications"', `<div style="display:flex;justify-content:flex-end;padding:8px 12px;border:1px solid var(--border-color,#e3e8f2);border-radius:8px"><obs-notification-menu count="4" tabs="Notifications" items='${J(ITEMS.map((i) => ({ ...i, tab: 'Notifications' })))}'></obs-notification-menu></div>`, 'max-width:420px'),
    ] },
    { group: 'Placement — placement="bottom-start" anchors the panel to the LEFT of the bell (default is bottom-end / right), for when the bell sits away from the right edge', items: [
      box('placement="bottom-start"', `<div style="display:flex;justify-content:flex-start;padding:8px 12px;border:1px solid var(--border-color,#e3e8f2);border-radius:8px"><obs-notification-menu placement="bottom-start" count="3" tabs='[{"label":"Alerts","count":191},{"label":"System Notification","count":1822}]' items='${J(ITEMS)}'></obs-notification-menu></div>`, 'max-width:420px'),
    ] },
  ],
}
