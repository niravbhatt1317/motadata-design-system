import { ICONS } from '../../src/elements/_icons.js'
// Showcase manifest for <obs-icon> — the reusable icon element. Change `name` → the glyph swaps (reactive).
const NAMES = Object.keys(ICONS)
const lbl = (t) => `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:8px">${t}</div>`
// a labelled swatch: the icon + its name (so consumers know what to pass to `name`)
const swatch = (n) => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:96px;padding:14px 6px;border:1px solid var(--border-color,#e3e8f2);border-radius:8px;color:var(--page-text-color,#1d2a3e)">`
  + `<obs-icon name="${n}" size="24"></obs-icon>`
  + `<code style="font-size:10px;color:var(--neutral-regular,#7186a8);font-family:'JetBrains Mono',monospace;word-break:break-all;text-align:center">${n}</code></div>`
export default {
  el: 'obs-icon',
  display: 'Icon',
  registry: 'icon',
  controls: [
    { prop: 'name', type: 'select', options: NAMES },
    { prop: 'size', type: 'text' },
    { prop: 'label', type: 'text', label: 'Label (a11y)' },
  ],
  playground: { attrs: { name: 'kubernetes', size: '48' } },
  gallery: [
    { group: 'Sizes — size is px (number) or any CSS length; color = currentColor (inherits text color)', items: [
      { html: `<div style="width:100%">${lbl('name="search" at 16 / 24 / 32 / 48; the last inherits --primary')}<div style="display:flex;align-items:center;gap:24px">`
        + `<obs-icon name="search" size="16"></obs-icon><obs-icon name="search" size="24"></obs-icon><obs-icon name="search" size="32"></obs-icon>`
        + `<span style="color:var(--primary,#111c2c)"><obs-icon name="search" size="48"></obs-icon></span></div></div>` },
    ] },
    { group: `The library — ${NAMES.length} icons (pass the name to \`name\`); all are real product glyphs from icons.js`, items: [
      { html: `<div style="width:100%">${lbl('every ICONS key')}<div style="display:flex;flex-wrap:wrap;gap:10px">${NAMES.map(swatch).join('')}</div></div>` },
    ] },
  ],
}
