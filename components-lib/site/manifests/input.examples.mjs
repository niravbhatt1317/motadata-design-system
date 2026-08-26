// Showcase manifest for <obs-input>. Type router + states; emits `input`.
export default {
  el: 'obs-input',
  controls: [
    { prop: 'type', type: 'select', options: ['text', 'password', 'number', 'search', 'textarea'] },
    { prop: 'label', type: 'text', label: 'Label' },
    { prop: 'help', type: 'text', label: 'Help text' },
    { prop: 'placeholder', type: 'text', default: 'Enter your name' },
    { prop: 'value', type: 'text', label: 'Value' },
    { prop: 'allowClear', type: 'toggle', attr: 'allow-clear' },
    { prop: 'material', type: 'toggle' },
    { prop: 'noBorder', type: 'toggle', attr: 'no-border' },
    { prop: 'disabled', type: 'toggle' },
    { prop: 'readonly', type: 'toggle' },
    { prop: 'error', type: 'toggle' },
    { prop: 'errorMessage', type: 'text', attr: 'error-message', label: 'Error message' },
  ],
  playground: { attrs: { type: 'text', placeholder: 'Enter your name' }, text: '' },
  events: [{ name: 'input', detail: 'string (value)' }],
  gallery: [
    { group: 'Label + supporting text (FlotoFormItem-style form field)', items: [
      { attrs: { label: 'Monitor name', placeholder: 'web-server-01', required: true, block: true }, usage: 'required *' },
      { attrs: { label: 'Polling interval', type: 'number', value: '30', help: 'In seconds.', block: true } },
    ] },
    { group: 'Types', items: [
      { attrs: { type: 'text', placeholder: 'Text' } },
      { attrs: { type: 'password', value: 'secret123', placeholder: 'Password' } },
      { attrs: { type: 'number', value: '0' }, usage: '70×' },
      { attrs: { type: 'search', placeholder: 'Search…' } },
      { attrs: { type: 'textarea', placeholder: 'Multi-line…' } },
    ] },
    { group: 'Adornments (prefix / suffix / addons)', items: [
      { attrs: { 'prefix-icon': 'search', placeholder: 'Search…' } },
      { attrs: { 'suffix-icon': 'dollar', placeholder: 'Amount' } },
      { attrs: { 'addon-before': 'https://', 'addon-after': '.com', placeholder: 'domain' } },
    ] },
    { group: 'Material (bottom border, 62×) · No border', items: [
      { attrs: { material: true, placeholder: 'Material (bottom border only)' }, usage: '62×' },
      { attrs: { 'no-border': true, value: 'Borderless inline edit' }, usage: '3×' },
    ] },
    { group: 'States', items: [
      { attrs: { placeholder: 'Default' } },
      { attrs: { value: 'Read-only value', readonly: true } },
      { attrs: { value: 'Disabled', disabled: true } },
      { attrs: { value: 'not-an-email', error: true, 'error-message': 'Enter a valid email address.' } },
      { attrs: { value: 'Clearable', 'allow-clear': true } },
    ] },
  ],
}
