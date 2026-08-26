// Showcase manifest for <obs-user-menu> — the interactive header ACCOUNT menu (App Chrome). Click the avatar to
// open the dropdown (account links + theme toggle + danger Logout). Self-contained; drops into obs-app-header's
// `user` slot to make the header interactive.
const J = (v) => JSON.stringify(v)
const ITEMS = [
  { key: 'profile', label: 'My Profile', icon: 'userCircle' },
  { key: 'setup', label: 'Product Setup Guide', icon: 'questionCircle' },
  { key: 'docs', label: 'Documentation', icon: 'bookOpen', href: '#' },
]
const box = (label, inner, w = '') => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:10px">${label}</div><div style="${w}">${inner}</div></div>` })
const ACTIONS = J([{ icon: 'search', label: 'Search' }, { icon: 'bell', label: 'Notifications', badge: 3 }])

export default {
  el: 'obs-user-menu',
  display: 'User Menu',
  registry: 'user-menu',
  summary: 'The interactive header account menu — an avatar trigger that opens account links + a theme toggle + a danger Logout. Drops into obs-app-header’s `user` slot. Part of the App Chrome family; the turnkey form of the user-menu recipe.',
  controls: [
    { prop: 'name', type: 'text', default: 'Nirav Bhatt' },
    { prop: 'subtitle', type: 'text', default: 'nirav.bhatt@motadata.com' },
    { prop: 'initials', type: 'text' },
    { prop: 'avatar', type: 'text', label: 'Avatar image URL' },
    { prop: 'placement', type: 'select', options: ['bottom-end', 'bottom-start'] },
    { prop: 'theme', type: 'select', options: ['auto', 'dark', 'light'], label: 'Theme (selected)' },
    { prop: 'theme-toggle', type: 'toggle' },
    { prop: 'logout', type: 'toggle' },
    { prop: 'logout-label', type: 'text', default: 'Logout' },
  ],
  playground: {
    attrs: { name: 'Nirav Bhatt', subtitle: 'nirav.bhatt@motadata.com' },
    text: '',
    live: `<obs-user-menu name="Nirav Bhatt" subtitle="nirav.bhatt@motadata.com" items='${J(ITEMS)}'></obs-user-menu>`,
  },
  gallery: [
    { group: 'Interactive — click the avatar to open the account dropdown (account links + a theme toggle + a danger Logout). This is the turnkey element; the popover renders in the top layer so it escapes any clipping ancestor', items: [
      box('standalone — click the avatar', `<div style="display:flex;justify-content:flex-end;padding:8px 12px;border:1px solid var(--border-color,#e3e8f2);border-radius:8px"><obs-user-menu name="Nirav Bhatt" subtitle="nirav.bhatt@motadata.com" items='${J(ITEMS)}'></obs-user-menu></div>`, 'max-width:420px'),
    ] },
    { group: 'In the app header (App Chrome) — drop obs-user-menu into obs-app-header’s `user` slot. Click the avatar on the right to open the menu — the whole header is now interactive', items: [
      box('obs-app-header + obs-user-menu (user slot)',
        `<obs-app-header brand="ObserveOps" build="8.0.0" actions='${ACTIONS}'>`
        + `<obs-user-menu slot="user" name="Nirav Bhatt" subtitle="nirav.bhatt@motadata.com" items='${J(ITEMS)}'></obs-user-menu>`
        + `</obs-app-header>`, ''),
    ] },
    { group: 'Placement start — open the dropdown aligned to the LEFT of the avatar (placement="bottom-start"), e.g. when the avatar sits on the left', items: [
      box('placement="bottom-start"', `<div style="padding:8px 12px"><obs-user-menu placement="bottom-start" name="Ada Lovelace" subtitle="Admin" items='${J(ITEMS)}'></obs-user-menu></div>`, 'max-width:420px'),
    ] },
    { group: 'No theme toggle / no logout — a minimal account menu (theme-toggle="false" logout="false"): just the account links', items: [
      box('theme-toggle="false" logout="false"', `<div style="display:flex;justify-content:flex-end;padding:8px 12px;border:1px solid var(--border-color,#e3e8f2);border-radius:8px"><obs-user-menu theme-toggle="false" logout="false" name="Nirav Bhatt" subtitle="Viewer" items='${J(ITEMS)}'></obs-user-menu></div>`, 'max-width:420px'),
    ] },
    { group: 'Grouped links (divider + danger) — an item with `divider:true` inserts a separator; `danger:true` renders a red destructive row (e.g. Sign out of all sessions). An `href` makes the row a link', items: [
      box('items with divider + danger', `<div style="display:flex;justify-content:flex-end;padding:8px 12px;border:1px solid var(--border-color,#e3e8f2);border-radius:8px"><obs-user-menu name="Nirav Bhatt" subtitle="nirav.bhatt@motadata.com" items='${J([
        { key: 'profile', label: 'My Profile', icon: 'userCircle' },
        { key: 'setup', label: 'Product Setup Guide', icon: 'questionCircle' },
        { key: 'docs', label: 'Documentation', icon: 'bookOpen', href: '#' },
        { key: 'sep', divider: true },
        { key: 'signout-all', label: 'Sign out of all sessions', icon: 'signOut', danger: true },
      ])}'></obs-user-menu></div>`, 'max-width:420px'),
    ] },
  ],
}
