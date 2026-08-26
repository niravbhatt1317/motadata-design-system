// Showcase manifest for <obs-select> — the product's DropdownPicker (FlotoDropdownPicker). Full parity:
// single / multiple (Select-All + Clear + "First (+N)") / not-searchable / allow-clear / text-only /
// read-only pills / disabled-options / inline-add / two-pane / loading. No registry/<id>.json → carries
// summary + propsDoc. Options: comma string OR JSON [{value,label,disabled?,description?}].
const FRUITS = 'Apple,Banana,Cherry,Date,Elderberry,Fig,Grape'
// JSON options with descriptions for the two-pane demo
const DESC = JSON.stringify([
  { value: 'web', label: 'Web Server', description: 'Serves HTTP/HTTPS — monitors request rate, latency, 5xx errors.' },
  { value: 'db', label: 'Database', description: 'Relational/NoSQL store — connections, slow queries, replication lag.' },
  { value: 'cache', label: 'Cache', description: 'In-memory cache — hit ratio, evictions, memory.' },
  { value: 'queue', label: 'Message Queue', description: 'Async broker — depth, consumer lag, throughput.' },
])
// Group B option-content datasets
const SEV = JSON.stringify([
  { value: 'crit', label: 'Critical', severity: 'critical' }, { value: 'maj', label: 'Major', severity: 'major' },
  { value: 'warn', label: 'Warning', severity: 'warning' }, { value: 'clr', label: 'Clear', severity: 'clear' },
])
// icons must be real names from the DS icon library (_icons.js) — infra monitor types
const ICONS = JSON.stringify([
  { value: 'srv', label: 'Server', icon: 'server' }, { value: 'vm', label: 'Virtual Machine', icon: 'vm' },
  { value: 'ctr', label: 'Container', icon: 'docker' }, { value: 'k8s', label: 'Cluster', icon: 'kubernetes' },
  { value: 'net', label: 'Network', icon: 'sitemap' },
])
const PEOPLE = JSON.stringify([
  { value: 'u1', label: 'Alice Chen', email: 'alice@acme.io', avatar: true }, { value: 'u2', label: 'Bob Kumar', email: 'bob@acme.io', avatar: true },
  { value: 'u3', label: 'Carol Diaz', email: 'carol@acme.io', avatar: true },
])
const TREE = JSON.stringify([
  { value: 'dc1', label: 'Data Center 1', children: [
    { value: 'rA', label: 'Rack A', children: [{ value: 's1', label: 'web-01' }, { value: 's2', label: 'web-02' }] },
    { value: 'rB', label: 'Rack B', children: [{ value: 's3', label: 'db-01' }] }] },
  { value: 'dc2', label: 'Data Center 2', children: [{ value: 's4', label: 'cache-01' }, { value: 's5', label: 'cache-02' }] },
])

export default {
  el: 'obs-select',
  display: 'Dropdown',
  registry: 'dropdown-picker',
  summary: 'Dropdown picker — an input-like trigger that opens a popover menu. Single or multiple (Select-All header + Clear footer + “First (+N)” trigger), searchable, clearable (× on hover), text-only or read-only-pill triggers, disabled options, inline-add, and an optional two-pane description. Models the product’s FlotoDropdownPicker (510×/241 files).',
  propsDoc: {
    options: { type: 'string', note: 'Comma-separated labels, or JSON [{ value, label, disabled?, description? }].' },
    value: { type: 'string', note: 'Selected key; comma-separated for multiple. v-model via change.' },
    placeholder: { type: 'string', default: '"Select"' },
    multiple: { type: 'boolean', default: false, note: 'Checkboxes + “First (+N)” trigger.' },
    allowSelectAll: { type: 'boolean', default: false, note: 'Adds a “Select All” header (multiple).' },
    allowClear: { type: 'boolean', default: false, note: '× on hover when a value is set (218×).' },
    searchable: { type: 'boolean', default: true, note: 'Search box; :searchable=false for short lists (119×).' },
    asInput: { type: 'boolean', default: true, note: 'Trigger looks like a form input; false = chip trigger.' },
    textOnly: { type: 'boolean', default: false, note: 'Plain text + caret trigger (15×).' },
    disabled: { type: 'boolean', default: false, note: 'Single → greyed; multiple → read-only pills.' },
    loading: { type: 'boolean', default: false, note: 'Chevron → spinner (enhancement over the product).' },
    disabledOptions: { type: 'string', attr: 'disabled-options', note: 'Comma list of values to grey out + lock (ban icon).' },
    canUserAddOptions: { type: 'boolean', default: false, note: 'Inline “+ Add” row; emits add.' },
    addLabel: { type: 'string', note: 'Noun shown in the inline-add placeholder.' },
    useAfterMenuDescription: { type: 'boolean', default: false, note: 'Two-pane: list + hovered-option description.' },
    maxValues: { type: 'number', default: 0, note: 'Caps the number of selections (multiple).' },
    trigger: { type: 'string', note: 'Trigger style: input (default) | text | button | icon | chip.' },
    triggerIcon: { type: 'string', attr: 'trigger-icon', note: 'Glyph (obs-icon) for the icon trigger + button caret.' },
    triggerLabel: { type: 'string', attr: 'trigger-label', note: 'Fixed label for the button/icon trigger.' },
  },
  // OPTION CONTENT (icon/severity/avatar) is a data axis (set via `options`) — swap it with the Options preset;
  // TRIGGER is an orthogonal axis (the enum). Both combine with single/multiple/search/etc.
  controls: [
    { prop: 'trigger', type: 'select', options: ['input', 'text', 'button', 'icon', 'chip'] },
    { prop: 'multiple', type: 'toggle' },
    { prop: 'searchable', type: 'select', options: ['true', 'false'] },
    { prop: 'allowSelectAll', type: 'toggle', attr: 'allow-select-all', label: 'Select-all header' },
    { prop: 'allowClear', type: 'toggle', attr: 'allow-clear' },
    { label: 'Options', slotPresets: [
      { label: 'Plain', html: '', attrs: { options: FRUITS } },
      { label: 'Severity dots', html: '', attrs: { options: SEV } },
      { label: 'Icons', html: '', attrs: { options: ICONS } },
      { label: 'People (avatars)', html: '', attrs: { options: PEOPLE } },
      { label: 'Tree (hierarchy)', html: '', attrs: { options: TREE } },
    ] },
    { prop: 'canUserAddOptions', type: 'toggle', attr: 'can-user-add-options', label: 'Inline add' },
    { prop: 'useAfterMenuDescription', type: 'toggle', attr: 'use-after-menu-description', label: 'Two-pane' },
    { prop: 'disabled', type: 'toggle' },
    { prop: 'loading', type: 'toggle' },
    { prop: 'placeholder', type: 'text', default: 'Select a component' },
  ],
  playground: { attrs: { options: FRUITS, placeholder: 'Select a fruit', 'allow-clear': true }, text: '' },
  events: [
    { name: 'change', detail: 'value | value[]' },
    { name: 'show', detail: '(menu opened)' },
    { name: 'hide', detail: '(menu closed)' },
    { name: 'search', detail: 'string (query)' },
    { name: 'add', detail: 'string (new option)' },
  ],
  gallery: [
    { group: 'Single', items: [
      { attrs: { options: FRUITS, placeholder: 'Select a fruit' } },
      { attrs: { options: FRUITS, value: 'Cherry', 'allow-clear': true } },
    ] },
    { group: 'Multiple (Select-All + Clear + “First (+N)”)', items: [
      { attrs: { options: FRUITS, value: 'Apple,Cherry', multiple: true, 'allow-select-all': true, 'allow-clear': true } },
    ] },
    { group: 'Not searchable (119×)', items: [
      { attrs: { options: 'Low,Medium,High,Critical', value: 'Medium', searchable: 'false' }, usage: '119×' },
    ] },
    { group: 'Disabled options (greyed + locked) — click to open', items: [
      { attrs: { options: 'Web Server,Database,Cache,Message Queue,Reverse Proxy', value: 'Web Server', 'disabled-options': 'Cache,Message Queue' } },
    ] },
    { group: 'Inline add (“+” beside search) — click to open', items: [
      { attrs: { options: FRUITS, value: 'Apple', 'can-user-add-options': true } },
    ] },
    { group: 'Two-pane (hovered description) — click to open', items: [
      { attrs: { options: DESC, value: 'web', 'use-after-menu-description': true } },
    ] },
    { group: 'States', items: [
      { attrs: { options: FRUITS, value: 'Apple', disabled: true } },
      { attrs: { options: FRUITS, placeholder: 'Loading…', loading: true } },
      { attrs: { options: FRUITS, value: 'Apple', 'allow-clear': true } },
    ] },
    { group: 'Option content · severity dots — options carry `severity` → an obs-severity dot (icon/severity/avatar are option content, not separate components)', items: [
      { attrs: { options: SEV, value: 'crit', placeholder: 'Severity', searchable: 'false' } },
    ] },
    { group: 'Option content · icons — options carry `icon` → obs-icon (composes the DS icon, not v-html)', items: [
      { attrs: { options: ICONS, value: 'srv', placeholder: 'Monitor type', searchable: 'false' } },
    ] },
    { group: 'Option content · people picker — options carry `avatar` + `email` → an avatar row (name + sub-label)', items: [
      { attrs: { options: PEOPLE, value: 'u1', placeholder: 'Assignee', multiple: true } },
    ] },
    { group: 'Tree-select (hierarchy) — options carry nested `children[]` → an N-level tree (expand/collapse; branch = subtree select)', items: [
      { attrs: { options: TREE, placeholder: 'Select servers', multiple: true } },
    ] },
    { group: 'Column chooser (174×) — set `columns` and the dropdown becomes a table show/hide-columns picker: a COLUMNS heading + draggable checkbox rows (drag the 6-dot grip to reorder; a locked column is pinned) + a Reset footer. Opens from an eye icon button. Click it', items: [
      { attrs: { columns: '[{"key":"name","label":"Name","checked":true,"locked":true},{"key":"status","label":"Status","checked":true},{"key":"ip","label":"IP Address","checked":true},{"key":"poll","label":"Last Poll","checked":false},{"key":"vendor","label":"Vendor","checked":false},{"key":"uptime","label":"Uptime","checked":false}]', heading: 'COLUMNS', 'reset-label': 'Reset Column Preference' } },
    ] },
    { group: 'Triggers — the orthogonal `trigger` axis (how it opens): input (default) · text (15×) · button · icon (count badge) · chip · read-only pills (multiple + disabled, click +N)', items: [
      { attrs: { options: FRUITS, value: 'Banana', trigger: 'input' } },
      { attrs: { options: FRUITS, value: 'Banana', trigger: 'text' }, usage: '15×' },
      { attrs: { options: FRUITS, trigger: 'button', 'trigger-label': 'Columns' } },
      { attrs: { options: FRUITS, value: 'Apple,Cherry', multiple: true, trigger: 'icon', 'trigger-icon': 'filter' } },
      { attrs: { options: FRUITS, value: 'Fig', trigger: 'chip' } },
      { attrs: { options: FRUITS, value: 'Apple,Cherry,Date', multiple: true, disabled: true } },
    ] },
  ],
}
