// Showcase manifest for <obs-button>. controls = live playground; gallery = static variant/state grid.
// icon glyphs come from the reusable <obs-icon> element (the DS icon library) — no inlined SVG.
const ICN = { plus: 'plus', filter: 'filter', save: 'save', pen: 'pencil', trash: 'trash', cog: 'cog' }
const ibtn = (attrs, ic, label) => `<obs-button ${attrs}><obs-icon name="${ICN[ic]}" size="14"></obs-icon>${label}</obs-button>`
const iconOnly = (attrs, ic) => `<obs-button ${attrs} aria-label="${ic}"><obs-icon name="${ICN[ic]}" size="14"></obs-icon></obs-button>`
const row = (inner) => `<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">${inner}</div>`
export default {
  el: 'obs-button',
  controls: [
    { prop: 'variant', type: 'select', options: ['primary', 'primary-alt', 'default', 'danger', 'success', 'error', 'neutral-lighter', 'neutral-lightest', 'transparent', 'dashed', 'ghost'] },
    { prop: 'size', type: 'select', options: ['small', 'default', 'large'] },
    { prop: 'shape', type: 'select', options: ['', 'circle'], label: 'Shape' },
    { prop: 'outline', type: 'toggle' },
    { prop: 'squared', type: 'toggle' },
    { prop: 'block', type: 'toggle' },
    { prop: 'loading', type: 'toggle' },
    { prop: 'disabled', type: 'toggle' },
    { prop: 'text', type: 'text', slot: true, label: 'Label', default: 'Button' },
  ],
  playground: { attrs: { variant: 'primary' }, text: 'Button' },
  events: [],
  gallery: [
    { group: 'Variants', items: [
      { attrs: { variant: 'primary' }, text: 'primary' },
      { attrs: { variant: 'primary-alt' }, text: 'primary-alt' },
      { attrs: { variant: 'default' }, text: 'default' },
      { attrs: { variant: 'danger' }, text: 'danger' },
      { attrs: { variant: 'success' }, text: 'success' },
      { attrs: { variant: 'error' }, text: 'error' },
      { attrs: { variant: 'neutral-lighter' }, text: 'neutral-lighter' },
      { attrs: { variant: 'neutral-lightest' }, text: 'neutral-lightest' },
      { attrs: { variant: 'transparent' }, text: 'transparent' },
      { attrs: { variant: 'dashed' }, text: 'dashed' },
      { attrs: { variant: 'ghost' }, text: 'ghost' },
    ] },
    { group: 'Sizes', items: [
      { attrs: { variant: 'primary', size: 'small' }, text: 'Small' },
      { attrs: { variant: 'primary' }, text: 'Default' },
      { attrs: { variant: 'primary', size: 'large' }, text: 'Large' },
    ] },
    { group: 'States', items: [
      { attrs: { variant: 'primary' }, text: 'Default' },
      { attrs: { variant: 'primary', loading: true }, text: 'Loading' },
      { attrs: { variant: 'primary', disabled: true }, text: 'Disabled' },
      { attrs: { variant: 'primary', outline: true }, text: 'Outline' },
      { attrs: { variant: 'primary', square: true }, text: 'Square' },
    ] },
    { group: 'Outline / ghost', items: [
      { attrs: { variant: 'primary', outline: true }, text: 'Primary' },
      { attrs: { variant: 'error', outline: true }, text: 'Error' },
      { attrs: { variant: 'success', outline: true }, text: 'Success' },
      { attrs: { variant: 'default', outline: true }, text: 'Default' },
    ] },
    { group: 'Icon + text — leading icon (the 83× product pattern: MIcon + label in the slot)', items: [
      { html: row(
        ibtn('variant="primary"', 'plus', 'Add Monitor') +
        ibtn('variant="default"', 'filter', 'Filter') +
        ibtn('variant="primary-alt"', 'save', 'Save') +
        ibtn('variant="default"', 'pen', 'Edit') +
        ibtn('variant="error"', 'trash', 'Delete')
      ) },
    ] },
    { group: 'Icon-only (circle 218× · squared 365×) — require an aria-label', items: [
      { html: row(
        iconOnly('shape="circle"', 'plus') +
        iconOnly('shape="circle" variant="transparent"', 'pen') +
        iconOnly('shape="circle" variant="error"', 'trash') +
        iconOnly('squared', 'cog') +
        iconOnly('squared variant="neutral-lightest"', 'filter')
      ) + '<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);margin-top:10px">⚠️ <code>shape="circle"</code> renders as a <b>4px rounded square</b> in the product (finding F7), not a circle; a true circle needs <code>square</code> off. <code>squared</code> = fixed 35×35.</div>' },
    ] },
  ],
}
