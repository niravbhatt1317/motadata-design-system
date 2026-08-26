// Showcase manifest for <obs-breadcrumbs> — the location trail (+ optional back chevron). Composes obs-icon.
// Pairs with obs-page-header (drop it in the `breadcrumb` slot). Values from the Navigation/Breadcrumb story.
const J = (v) => JSON.stringify(v)
const TRAIL = ['Reports', 'Compliance', 'PCI-DSS Audit']
const DETAIL = ['Inventory', 'Monitors', 'web-server-01']
const block = (label, inner) => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${label}</div>${inner}</div>` })

export default {
  el: 'obs-breadcrumbs',
  display: 'Breadcrumbs',
  registry: 'breadcrumbs',
  controls: [
    { prop: 'items', type: 'text' },
    { prop: 'separator', type: 'select', options: ['/', 'chevron'] },
    { prop: 'back', type: 'toggle' },
    { prop: 'divider', type: 'toggle' },
  ],
  playground: {
    attrs: { items: J(TRAIL) },
    text: '',
    live: `<obs-breadcrumbs items='${J(TRAIL)}'></obs-breadcrumbs>`,
  },
  gallery: [
    { group: 'Trail (default) — a path of crumbs; ancestors are muted links, the current (last) crumb is weight 500. Separator is `/`', items: [
      block('Reports / Compliance / PCI-DSS Audit', `<obs-breadcrumbs items='${J(TRAIL)}'></obs-breadcrumbs>`),
    ] },
    { group: 'With a back chevron — a leading back control (emits `back`) before the trail, for a detail page', items: [
      block('back + Inventory / Monitors / web-server-01', `<obs-breadcrumbs back items='${J(DETAIL)}'></obs-breadcrumbs>`),
    ] },
    { group: 'Chevron separator — separator="chevron" renders a › icon between crumbs instead of `/`', items: [
      block('Home › Monitors › web-server-01', `<obs-breadcrumbs separator="chevron" items='${J(['Home', 'Monitors', 'web-server-01'])}'></obs-breadcrumbs>`),
    ] },
    { group: 'With a divider — a bottom rule under the trail (the compliance-breadcrumb location header)', items: [
      block('divider (border-bottom)', `<obs-breadcrumbs divider back items='${J(TRAIL)}'></obs-breadcrumbs>`),
    ] },
    { group: 'Back-button atom — the smallest form: a lone back chevron + a single (current) crumb / title (FlotoBackButton, 3×)', items: [
      block('back + one crumb', `<obs-breadcrumbs back items='${J(['Monitor Details'])}'></obs-breadcrumbs>`),
    ] },
    { group: 'In obs-page-header — drop the trail into the page header’s `breadcrumb` slot (the intended composition)', items: [
      block('page header + breadcrumb slot', `<obs-page-header heading="web-server-01" subtitle="Linux Server · 10.0.0.12"><obs-breadcrumbs slot="breadcrumb" items='${J(DETAIL)}'></obs-breadcrumbs><obs-button variant="primary">Edit</obs-button></obs-page-header>`),
    ] },
  ],
}
