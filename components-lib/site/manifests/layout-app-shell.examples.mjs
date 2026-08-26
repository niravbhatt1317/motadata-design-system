// Showcase manifest for <obs-layout-appshell> — Foundations/Layout/App shell.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:9px">${t}</div>`
const demo = (label, inner) => ({ html: `<div style="width:100%;overflow:auto;margin-bottom:6px">${lbl(label)}${inner}</div>` })
export default {
  el: 'obs-layout-appshell',
  display: 'App shell',
  controls: [
    { prop: 'sidebar', type: 'toggle' },
    { prop: 'header', type: 'toggle' },
    { prop: 'overlay', type: 'toggle' },
    { prop: 'empty', type: 'toggle' },
  ],
  playground: { attrs: { sidebar: true, header: true, overlay: true } , text: '' },
  gallery: [
    { group: 'Anatomy — the four regions in their real positions', items: [
      demo('the Layout shell — NavBar · Header · Content panel · Overlay layer', '<obs-layout-appshell anatomy></obs-layout-appshell>'),
    ] },
    { group: 'Chrome variants — toggling regions morphs the shell', items: [
      demo('Full shell — Sidebar + Header + Overlay', '<obs-layout-appshell sidebar header overlay></obs-layout-appshell>'),
      demo('Sidebar + Header off ≈ EmptyLayout', '<obs-layout-appshell overlay></obs-layout-appshell>'),
      demo('Empty content state', '<obs-layout-appshell sidebar header empty></obs-layout-appshell>'),
    ] },
  ],
}
