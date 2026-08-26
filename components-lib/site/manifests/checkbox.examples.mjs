// Showcase manifest for <obs-checkbox>.
export default {
  el: 'obs-checkbox',
  controls: [
    { prop: 'checked', type: 'toggle' },
    { prop: 'indeterminate', type: 'toggle' },
    { prop: 'disabled', type: 'toggle' },
    { prop: 'text', type: 'text', slot: true, label: 'Label', default: 'Send me updates' },
  ],
  playground: { attrs: { checked: true }, text: 'Send me updates' },
  events: [{ name: 'change', detail: 'boolean' }],
  gallery: [
    { group: 'States', items: [
      { attrs: {}, text: 'Unchecked' },
      { attrs: { checked: true }, text: 'Checked' },
      { attrs: { indeterminate: true }, text: 'Indeterminate' },
      { attrs: { disabled: true }, text: 'Disabled' },
      { attrs: { disabled: true, checked: true }, text: 'Disabled checked' },
    ] },
  ],
}
