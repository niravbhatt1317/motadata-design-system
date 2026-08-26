// Showcase manifest for <obs-radio>. options is a comma-separated string (or JSON for {value,label,disabled}).
export default {
  el: 'obs-radio',
  controls: [
    { prop: 'value', type: 'select', options: ['Low', 'Medium', 'High'] },
    { prop: 'asButton', type: 'toggle', attr: 'as-button', label: 'Segmented (as-button)' },
    { prop: 'size', type: 'select', options: ['small', 'default', 'large'] },
    { prop: 'vertical', type: 'toggle' },
    { prop: 'disabled', type: 'toggle' },
  ],
  playground: { attrs: { options: 'Low,Medium,High', value: 'Medium' }, text: '' },
  events: [{ name: 'change', detail: 'string (selected value)' }],
  gallery: [
    { group: 'List', items: [
      { attrs: { options: 'Low,Medium,High', value: 'Medium' }, usage: '225×' },
      { attrs: { options: 'Email,SMS,Push', value: 'Email', vertical: true } },
    ] },
    { group: 'Segmented (as-button)', items: [
      { attrs: { options: 'Day,Week,Month', value: 'Week', 'as-button': true }, usage: '255×' },
    ] },
    { group: 'Segmented with icons (14×)', items: [
      { attrs: { options: '[{"value":"grid","label":"Grid","icon":"grid"},{"value":"list","label":"List","icon":"list"},{"value":"map","label":"Map","icon":"map"}]', value: 'grid', 'as-button': true }, usage: '14×' },
    ] },
    { group: 'Severity switch (2×)', items: [
      { attrs: { options: 'Critical,Major,Warning', value: 'Critical', severity: true }, usage: '2×' },
    ] },
    { group: 'Sizes', items: [
      { attrs: { options: 'S,M,L', value: 'M', 'as-button': true, size: 'small' } },
      { attrs: { options: 'S,M,L', value: 'M', 'as-button': true } },
      { attrs: { options: 'S,M,L', value: 'M', 'as-button': true, size: 'large' } },
    ] },
    { group: 'Disabled', items: [
      { attrs: { options: 'Low,Medium,High', value: 'Medium', disabled: true } },
      { attrs: { options: 'Day,Week,Month', value: 'Week', 'as-button': true, disabled: true } },
      { attrs: { options: '[{"value":"a","label":"Available"},{"value":"b","label":"Disabled","disabled":true}]', value: 'a' } },
    ] },
  ],
}
