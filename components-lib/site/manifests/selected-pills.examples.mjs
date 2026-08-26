// Showcase manifest for <obs-selected-pills> — teal key:value picker pills with +N overflow popover.
// No registry/<id>.json (part of the Tag family) → carries summary + propsDoc for the generator fallback.
export default {
  el: 'obs-selected-pills',
  summary: 'Teal key:value pills for selections inside a picker/multi-select. Truncates to max-items, then a "+N" pill opens a popover listing the rest.',
  propsDoc: {
    value: { type: 'string', default: '""', note: 'CSV ("a:1,b:2") or JSON array; or an Array set as a property.' },
    'max-items': { type: 'number', default: 1, note: 'How many pills to show before collapsing the rest into +N.' },
  },
  controls: [
    { prop: 'value', type: 'text', label: 'Value (CSV)', default: 'monitor:web-server-01,os_name:Ubuntu 22.04,test2:teal-value,region:us-east' },
    { prop: 'max-items', type: 'text', label: 'Max items', default: '1' },
  ],
  playground: { attrs: { value: 'monitor:web-server-01,os_name:Ubuntu 22.04,test2:teal-value,region:us-east', 'max-items': '1' }, text: '' },
  events: [],
  gallery: [
    { group: '+N overflow (click +N for the popover)', items: [
      { attrs: { value: 'monitor:web-server-01,os_name:Ubuntu 22.04,test2:teal-value,region:us-east', 'max-items': '1' } },
      { attrs: { value: 'monitor:web-server-01,os_name:Ubuntu 22.04,region:us-east', 'max-items': '2' } },
      { attrs: { value: 'env:prod,team:noc' } },
    ] },
  ],
}
