// Showcase manifest for <obs-link>. Text link / external / subtle (k-link) / as-button CTA.
export default {
  el: 'obs-link',
  controls: [
    { prop: 'text', type: 'text', slot: true, label: 'Label', default: 'View details' },
    { prop: 'href', type: 'text', default: '#' },
    { prop: 'external', type: 'toggle' },
    { prop: 'kLink', type: 'toggle', attr: 'k-link', label: 'Subtle (k-link)' },
    { prop: 'asButton', type: 'toggle', attr: 'as-button', label: 'As button (CTA)' },
    { prop: 'variant', type: 'select', options: ['primary', 'primary-alt', 'default', 'transparent'], label: 'Variant (as-button)' },
    { prop: 'disabled', type: 'toggle' },
  ],
  playground: { attrs: {}, text: 'View details' },
  events: [],
  gallery: [
    { group: 'Variants', items: [
      { attrs: {}, text: 'Text link' },
      { attrs: { external: true }, text: 'External link' },
      { attrs: { 'k-link': true }, text: 'Subtle grid link' },
    ] },
    { group: 'As button (navigation CTA) — variants', items: [
      { attrs: { 'as-button': true, variant: 'primary' }, text: 'Go to settings' },
      { attrs: { 'as-button': true, variant: 'default' }, text: 'Open dashboard' },
      { attrs: { 'as-button': true, variant: 'primary-alt' }, text: 'Primary-alt' },
      { attrs: { 'as-button': true, variant: 'transparent' }, text: 'Transparent' },
    ] },
    { group: 'States', items: [
      { attrs: {}, text: 'Default' },
      { attrs: { disabled: true }, text: 'Disabled' },
    ] },
  ],
}
