// Showcase manifest for <obs-switch>. Includes the inner on/off label variant + the change event.
export default {
  el: 'obs-switch',
  controls: [
    { prop: 'checked', type: 'toggle' },
    { prop: 'size', type: 'select', options: ['small', 'default'] },
    { prop: 'disabled', type: 'toggle' },
    { prop: 'loading', type: 'toggle' },
    { prop: 'checkedText', type: 'text', attr: 'checked-text', label: 'On label' },
    { prop: 'uncheckedText', type: 'text', attr: 'unchecked-text', label: 'Off label' },
  ],
  playground: { attrs: { checked: true }, text: '' },
  events: [{ name: 'change', detail: 'boolean' }],
  gallery: [
    { group: 'States', items: [
      { attrs: {} },
      { attrs: { checked: true } },
      { attrs: { disabled: true } },
      { attrs: { disabled: true, checked: true } },
      { attrs: { checked: true, loading: true } },
    ] },
    { group: 'Sizes', items: [
      { attrs: { size: 'small', checked: true } },
      { attrs: { checked: true } },
    ] },
    { group: 'Inner on/off labels', items: [
      { attrs: { checked: true, 'checked-text': 'ON', 'unchecked-text': 'OFF' } },
      { attrs: { 'checked-text': 'ON', 'unchecked-text': 'OFF' } },
      { attrs: { checked: true, 'checked-text': 'YES', 'unchecked-text': 'NO' } },
    ] },
  ],
}
