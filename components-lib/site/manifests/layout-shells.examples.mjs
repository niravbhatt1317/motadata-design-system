// Showcase manifest for <obs-layout-shells> — Foundations/Layout/Layout shells.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:9px">${t}</div>`
const demo = (label, inner) => ({ html: `<div style="width:100%;margin-bottom:6px">${lbl(label)}${inner}</div>` })
const SHELLS = [
  ['layout', 'Layout — nav + header + content (the default route shell)'],
  ['login', 'LoginLayout — bare, centered sign-in card (also the unauth fallback)'],
  ['empty', 'EmptyLayout — no chrome, padded (print-safe report export)'],
  ['public', 'PublicLayout — no chrome, padded (upgrade / restore)'],
  ['monitor-hierarchy', 'MonitorHierarchyLayout — left hierarchy tree + content (content layout)'],
  ['settings', 'Settings two-pane — left menu + content (content layout)'],
]
export default {
  el: 'obs-layout-shells',
  display: 'Layout shells',
  controls: [
    { prop: 'shell', type: 'select', options: ['layout', 'login', 'empty', 'public', 'monitor-hierarchy', 'settings'] },
  ],
  playground: { attrs: { shell: 'layout' }, text: '' },
  gallery: [
    { group: 'Route shells — chosen by route.meta.layout (decreasing chrome)', items:
      SHELLS.slice(0, 4).map(([s, label]) => demo(label, `<obs-layout-shells shell="${s}"></obs-layout-shells>`)) },
    { group: 'Content layouts — render inside Layout (not route shells)', items:
      SHELLS.slice(4).map(([s, label]) => demo(label, `<obs-layout-shells shell="${s}"></obs-layout-shells>`)) },
  ],
}
