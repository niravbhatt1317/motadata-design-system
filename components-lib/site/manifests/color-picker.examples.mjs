// Showcase manifest for <obs-color-picker> — the DS colour picker (color-picker.vue). A 20×20 swatch + chevron
// trigger opening a top-layer popover with the 16-colour preset palette + a custom-colour canvas + a hex readout.
// Supports `transparent` (a swatch with a red diagonal line). Branding / widget / threshold / severity colours.
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
const block = (label, inner, minH = '48px') => ({ html: `<div style="width:100%">${lbl(label)}<div style="min-height:${minH}">${inner}</div></div>` })
export default {
  el: 'obs-color-picker',
  display: 'Color Picker',
  registry: 'color-picker',
  events: ['change', 'show', 'hide'],
  controls: [
    { prop: 'value', type: 'text' },
    { prop: 'allow-transparent', type: 'toggle' },
    { prop: 'hide-arrow', type: 'toggle' },
    { prop: 'disabled', type: 'toggle' },
  ],
  playground: {
    attrs: { value: '#0D9488', 'allow-transparent': true },
    live: `<obs-color-picker id="pg-color" value="#0D9488" allow-transparent></obs-color-picker>`,
  },
  gallery: [
    { group: 'Colour picker — a swatch trigger opens the 16-colour preset palette + custom canvas + hex', items: [
      block('click the swatch; pick a preset (shows a --primary outline) or Custom; el.value reflects the hex', `<obs-color-picker value="#0D9488" allow-transparent></obs-color-picker>`, '56px'),
    ] },
    { group: 'Preset values — the same picker seeded with different colours', items: [
      block('branding / widget-series colours', `<span style="display:inline-flex;gap:16px"><obs-color-picker value="#F97316"></obs-color-picker><obs-color-picker value="#9333EA"></obs-color-picker><obs-color-picker value="#0891B2"></obs-color-picker></span>`),
    ] },
    { group: 'Transparent — a no-fill value renders a swatch with a red diagonal line', items: [
      block('value="transparent" with allow-transparent', `<obs-color-picker value="transparent" allow-transparent></obs-color-picker>`),
    ] },
  ],
}
