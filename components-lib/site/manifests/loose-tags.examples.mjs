// Showcase manifest for <obs-tags> — the "Tags Input": one field, two types (loose / select).
const SUGG = 'web-server,database,prod,staging,cache,load-balancer'
const OPTS = 'web:Web Server,db:Database,cache:Cache,lb:Load Balancer,queue:Queue,cdn:CDN'
export default {
  el: 'obs-tags',
  display: 'Tags Input',
  summary: 'A multi-value pill input in two types. type="loose" — free-create teal pills (LooseTags / MSelect mode=tags; type + Enter, optional suggestions). type="select" — pick only from a fixed options list → neutral chips (MSelect mode=multiple). Both: removable pills + dropdown + chevron.',
  controls: [
    { prop: 'type', type: 'select', options: ['loose', 'select'] },
    { prop: 'value', type: 'text', label: 'Selected (comma-separated)' },
    { prop: 'options', type: 'text', label: 'Options (select type: value:Label,…)' },
    { prop: 'suggestions', type: 'text', label: 'Suggestions (loose type)' },
    { prop: 'placeholder', type: 'text' },
    { prop: 'disabled', type: 'toggle' },
    { prop: 'loading', type: 'toggle', label: 'Loading (select)' },
  ],
  playground: { attrs: { type: 'loose', value: 'web-server,database,prod', suggestions: SUGG } },
  events: [
    { name: 'change', when: 'a tag/option is added or removed', detail: 'string[] — selected values' },
  ],
  gallery: [
    { group: 'Loose — free-create: type a value, Enter to add a teal pill; ✕ removes', items: [
      { attrs: { type: 'loose', value: 'web-server,database,prod', suggestions: SUGG } },
    ] },
    { group: 'Select — pick only from a fixed list → neutral chips (navy ✕)', items: [
      { attrs: { type: 'select', value: 'web,db', options: OPTS } },
    ] },
    { group: 'Empty', items: [
      { attrs: { type: 'loose' } },
      { attrs: { type: 'select', options: OPTS, placeholder: 'Select components' } },
    ] },
    { group: 'Read-only (disabled)', items: [
      { attrs: { type: 'loose', value: 'web-server,database,prod,region-us-east', disabled: true } },
      { attrs: { type: 'select', value: 'web,db,cache', options: OPTS, disabled: true } },
    ] },
    { group: 'Select states — disabled (greyed + chevron) · loading (chevron → spinner)', items: [
      { attrs: { type: 'select', value: 'web', options: OPTS, disabled: true } },
      { attrs: { type: 'select', options: OPTS, loading: true, placeholder: 'Loading' } },
    ] },
  ],
}
