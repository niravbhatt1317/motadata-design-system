// Showcase manifest for <obs-command-palette> — the interactive header GLOBAL SEARCH / omnibox (App Chrome). One bar:
// category picker + query field (with a live suggestions dropdown) + Execute (red error icon on a parse error) +
// clear + a time-range picker. Composes obs-select · obs-input · obs-date-time-picker (kind=range) · obs-icon.
const J = (v) => JSON.stringify(v)
const CATS = J(['Metric', 'Log', 'Flow'])
const SUGGEST = J(['top', 'last', 'system.disk.free.percent', 'system.disk.capacity.bytes', 'system.root.directory.used.percent', 'system.disk.used.percent', 'system.disk.used.bytes', 'system.current.directory.used.percent', 'system.disk.free.bytes'])
const box = (label, inner, w = '') => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:10px">${label}</div><div style="overflow-x:auto;${w}">${inner}</div></div>` })

export default {
  el: 'obs-command-palette',
  display: 'Command Palette',
  registry: 'command-palette',
  summary: 'The interactive header global-search omnibox — a search bar with a category picker (Metric/Log/Flow), a query field with a live suggestions dropdown, an Execute action (a red error icon on a parse error), a clear, and a time-range picker. For cross-app search / a command surface, NOT a list filter. Part of the App Chrome family; the turnkey form of the command-palette recipe.',
  controls: [
    { prop: 'value', type: 'text', label: 'Query' },
    { prop: 'placeholder', type: 'text', default: 'Start Typing...' },
    { prop: 'categories', type: 'select', options: ['Metric,Log,Flow', ''], default: 'Metric,Log,Flow', label: 'Category picker' },
    { prop: 'error', type: 'text', label: 'Parse error (empty = none)' },
    { prop: 'time-range', type: 'toggle' },
    { prop: 'block', type: 'toggle', label: 'Block (wider, 1100 cap)' },
    { prop: 'align', type: 'select', options: ['center', 'left'], default: 'center', label: 'Align' },
    { prop: 'overlay', type: 'toggle', label: 'Overlay (Cmd+K modal)' },
    { prop: 'clearable', type: 'toggle' },
  ],
  playground: {
    attrs: { placeholder: 'Start Typing...' },
    text: '',
    live: `<obs-command-palette align="center" style="display:block;padding:24px 0" categories="Metric,Log,Flow" category="Metric" suggestions='${SUGGEST}' time-range value="top 10 system.disk.free.percent"></obs-command-palette>`,
  },
  gallery: [
    { group: 'Full omnibox — category (Metric/Log/Flow) + query + Execute (⏎) + clear (⌫) + a time-range picker. Type a query and press Enter (or click Execute)', items: [
      box('categories + query + Execute + time range', `<obs-command-palette categories='${CATS}' category="Metric" suggestions='${SUGGEST}' time-range value="top 10 system.disk.free.percent"></obs-command-palette>`, 'max-width:820px'),
    ] },
    { group: 'Suggestions — while the query is focused, a live autocomplete dropdown appears (metric names, top/last …); click one (or ↑/↓ + Enter) to fill the query. Click the field below and start typing', items: [
      box('suggestions dropdown (focus the field)', `<obs-command-palette categories='${CATS}' category="Metric" suggestions='${SUGGEST}' time-range placeholder="Start Typing..."></obs-command-palette>`, 'max-width:820px'),
    ] },
    { group: 'Parse error — set the `error` prop and the Execute action becomes a red exclamation icon (mirrors the product’s invalid-query state); Execute is disabled until the query parses', items: [
      box('error="Unexpected token"', `<obs-command-palette categories='${CATS}' category="Metric" suggestions='${SUGGEST}' time-range value="top" error="Unexpected token — keep typing a metric name"></obs-command-palette>`, 'max-width:820px'),
    ] },
    { group: 'In the app header (App Chrome) — overlay mode: the header shows a search ICON; click it and the palette opens as a CENTERED, near-top MODAL over a blurred, dimmed backdrop (Cmd+K style). Alongside the notification bell + user menu — the full interactive chrome. Click the 🔍 in the header below', items: [
      box('obs-command-palette overlay (click the search icon)',
        `<obs-app-header brand="ObserveOps" build="8.0.0">`
        + `<obs-command-palette overlay categories='${CATS}' category="Metric" suggestions='${SUGGEST}' time-range placeholder="Start Typing..."></obs-command-palette>`
        + `<obs-notification-menu count="3" tabs='[{"label":"Alerts","count":191},{"label":"System Notification","count":1822}]' items='${J([{ tab: 'Alerts', severity: 'critical', text: 'trap alert', detail: '172.16.9.243', time: 'Tue, Jul 21 06:17 PM', tag: 'Trap' }])}'></obs-notification-menu>`
        + `<obs-user-menu slot="user" name="Nirav Bhatt" subtitle="nirav.bhatt@motadata.com" items='${J([{ key: 'p', label: 'My Profile', icon: 'userCircle' }, { key: 'd', label: 'Documentation', icon: 'bookOpen', href: '#' }])}'></obs-user-menu>`
        + `</obs-app-header>`, ''),
    ] },
    { group: 'Overlay (Cmd+K) — standalone: a search-icon trigger that opens the palette centered near the top over a blurred backdrop; Esc or a backdrop click closes it. This is how the header search opens', items: [
      box('overlay trigger', `<div style="display:flex;justify-content:flex-end;padding:8px 12px;border:1px solid var(--border-color,#e3e8f2);border-radius:8px"><obs-command-palette overlay categories='${CATS}' category="Metric" suggestions='${SUGGEST}' time-range placeholder="Start Typing..."></obs-command-palette></div>`, 'max-width:420px'),
    ] },
    { group: 'No category / no time range — omit `categories` and `time-range` for a plain global search bar (just search + query + Execute)', items: [
      box('plain search bar', `<obs-command-palette suggestions='${SUGGEST}' placeholder="Search everything…"></obs-command-palette>`, 'max-width:720px'),
    ] },
  ],
}
