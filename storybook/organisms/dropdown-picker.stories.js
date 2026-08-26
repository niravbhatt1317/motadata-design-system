// Organisms / DropdownPicker — FlotoDropdownPicker (_base-dropdown-picker.vue), 510×/241 files.
// A custom select built on a popover + virtualized menu (RecycleScroller). Options are
// { key, text } objects; v-model is the selected key(s). model:{ event: 'change' }.
import MStatusTag from '@components/_base-status-tag.vue'

const OPTIONS = [
  { key: 'web', text: 'Web Server' },
  { key: 'db', text: 'Database' },
  { key: 'cache', text: 'Cache' },
  { key: 'queue', text: 'Message Queue' },
  { key: 'proxy', text: 'Reverse Proxy' },
  { key: 'lb', text: 'Load Balancer' },
  { key: 'dns', text: 'DNS Resolver' },
  { key: 'cdn', text: 'CDN Edge' },
]

export default {
  title: 'Organisms/DropdownPicker/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Organism — the product\'s custom select (`FlotoDropdownPicker`). Used **510× / 241 files**. Searchable, virtualized options, single/multi-select, keyboard nav, optional inline-add. Options are `{ key, text }`; v-model is the selected `key` (or array of keys when `multiple`).',
      },
    },
  },
}

export const Single = () => ({
  data: () => ({ value: 'web', options: OPTIONS }),
  template: `
    <div style="max-width:280px">
      <FlotoDropdownPicker :value="value" :options="options" allow-clear placeholder="Select a component" @change="value = $event" />
      <div style="margin-top:8px;font-size:12px;color:var(--neutral-light)">value: {{ JSON.stringify(value) }}</div>
    </div>`,
})
Single.parameters = { docs: { description: { story: 'Single-select. Click to open; type to search; click an item to pick. `allow-clear` shows a × on hover.' } } }

export const OpenMenu = () => ({
  data: () => ({ value: 'db', options: OPTIONS }),
  template: `
    <div style="max-width:280px;height:360px">
      <FlotoDropdownPicker :value="value" :options="options" default-open allow-clear placeholder="Select" @change="value = $event" />
    </div>`,
})
OpenMenu.storyName = 'Open (menu + search)'
OpenMenu.parameters = { docs: { description: { story: 'The open dropdown: a search box on top, the virtualized option list (RecycleScroller), and the selected/active item highlighted. Opened via `default-open`.' } } }

export const Multiple = () => ({
  data: () => ({ value: ['web', 'db'], options: OPTIONS }),
  template: `
    <div style="max-width:280px">
      <FlotoDropdownPicker :value="value" :options="options" multiple allow-clear allow-select-all placeholder="Select components" @change="value = $event" />
      <div style="margin-top:8px;font-size:12px;color:var(--neutral-light)">value: {{ JSON.stringify(value) }}</div>
    </div>`,
})
Multiple.parameters = { docs: { description: { story: 'Multi-select: checkboxes per item, a "Select All" header, and a "Clear" footer. The trigger shows the first selection + a "(+N)" count.' } } }

export const NotSearchable = () => ({
  data: () => ({ value: 'cache', options: OPTIONS }),
  template: `
    <div style="max-width:280px;height:320px">
      <FlotoDropdownPicker :value="value" :options="options" :searchable="false" default-open placeholder="Select" @change="value = $event" />
    </div>`,
})
NotSearchable.storyName = 'Not searchable (119×)'
NotSearchable.parameters = { docs: { description: { story: 'With `:searchable="false"` the search box is hidden — a plain option list. Common for short, fixed option sets.' } } }

const DESC = {
  web: 'Serves HTTP/HTTPS — monitors request rate, latency, 5xx errors.',
  db: 'Relational/NoSQL store — monitors connections, slow queries, replication lag.',
  cache: 'In-memory cache — monitors hit ratio, evictions, memory.',
  queue: 'Async message broker — monitors depth, consumer lag, throughput.',
  proxy: 'Reverse proxy — monitors upstream health, TLS, connection reuse.',
  lb: 'Load balancer — monitors backend pool, health checks, distribution.',
  dns: 'DNS resolver — monitors query latency, NXDOMAIN, cache hit rate.',
  cdn: 'CDN edge — monitors cache offload, origin shield, edge errors.',
}

export const AllowClear = () => ({
  data: () => ({ value: 'web', options: OPTIONS }),
  template: `
    <div style="max-width:280px">
      <div class="text-neutral-light mb-2" style="font-size:12px">With <code>allow-clear</code> (218×) a <strong>×</strong> appears on hover once a value is set — click it to clear back to the placeholder.</div>
      <FlotoDropdownPicker :value="value" :options="options" allow-clear placeholder="Select a component" @change="value = $event" />
      <div style="margin-top:8px;font-size:12px;color:var(--neutral-light)">value: {{ JSON.stringify(value) }}</div>
    </div>`,
})
AllowClear.storyName = 'Allow clear (218×)'
AllowClear.parameters = { docs: { description: { story: 'The **`allow-clear`** prop (218× usage) — once a value is selected a **×** shows on hover; clicking it clears the selection. The product\'s standard "reset this picker" affordance.' } } }

export const ReadOnlyPills = () => ({
  data: () => ({ value: ['web', 'db', 'cache'], options: OPTIONS }),
  template: `
    <div style="max-width:280px">
      <div class="text-neutral-light mb-2" style="font-size:12px">A <strong>multiple</strong> picker that is <code>disabled</code> renders its value as read-only <strong>pills</strong> (<code>SelectedItemPills</code>) — the view-only form of a multi-select.</div>
      <FlotoDropdownPicker :value="value" :options="options" multiple disabled placeholder="None" @change="value = $event" />
    </div>`,
})
ReadOnlyPills.storyName = 'Read-only pills (multi)'
ReadOnlyPills.parameters = { docs: { description: { story: 'A **multiple** picker in **`disabled`** (read-only) mode renders the selection as **pills** via `SelectedItemPills` (the `dropdown-trigger/` trigger) — no input, no menu. This is the view-only counterpart of the multi-select, used in detail/`is-view` screens.' } } }

export const TextOnly = () => ({
  data: () => ({ value: 'db', options: OPTIONS }),
  template: `
    <div style="max-width:280px">
      <div class="text-neutral-light mb-2" style="font-size:12px">With <code>text-only</code> (15×) the trigger is plain text (no input box) — for inline/embedded pickers (e.g. inside a sentence or a compact header).</div>
      <FlotoDropdownPicker :value="value" :options="options" text-only placeholder="Select" @change="value = $event" />
    </div>`,
})
TextOnly.storyName = 'Text-only trigger (15×)'
TextOnly.parameters = { docs: { description: { story: 'The **`text-only`** trigger (15×) renders the selection as **plain text with a caret** instead of a bordered input — for inline/embedded pickers (compact headers, "showing X" sentences). Click to open the same menu.' } } }

export const DisabledItems = () => ({
  data: () => ({ value: 'web', options: OPTIONS, disabled: ['cache', 'queue'], hover: '' }),
  template: `
    <div style="max-width:300px">
      <div class="text-neutral-light mb-2" style="font-size:12px">With <code>:disabled-options</code> specific rows are greyed and unselectable (e.g. options the current role/licence can't pick). Reference reproduction of the open menu.</div>
      <div style="width:280px;padding:6px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:6px;box-shadow:0 6px 20px var(--neutral-shadow-light)">
        <div class="flex items-center mb-1" style="height:32px;padding:0 8px;gap:8px;border:1px solid var(--border-color);border-radius:4px;color:var(--neutral-light)"><MIcon name="search" style="font-size:12px" /><span style="font-size:13px">Search</span></div>
        <a v-for="o in options" :key="o.key" class="flex items-center justify-between" :class="{ 'cursor-pointer': !disabled.includes(o.key) }"
          @mouseenter="hover=o.key" @mouseleave="hover=''"
          :style="{ height: '34px', padding: '0 10px', borderRadius: '6px', fontSize: '13px', textDecoration: 'none', cursor: disabled.includes(o.key) ? 'not-allowed' : 'pointer', color: disabled.includes(o.key) ? 'var(--neutral-light)' : (value===o.key ? 'var(--primary)' : 'var(--page-text-color)'), opacity: disabled.includes(o.key) ? 0.55 : 1, background: value===o.key ? 'var(--code-tag-background-color)' : (hover===o.key && !disabled.includes(o.key) ? 'var(--neutral-lighter)' : 'transparent') }">
          <span>{{ o.text }}</span>
          <MIcon v-if="value===o.key" name="check" style="font-size:11px" />
          <MIcon v-else-if="disabled.includes(o.key)" name="ban" style="font-size:11px" />
        </a>
      </div>
    </div>`,
})
DisabledItems.storyName = 'Disabled options'
DisabledItems.parameters = { docs: { description: { story: 'The **`:disabled-options`** array (keys) greys out and locks specific rows — used where a role/licence/state makes some choices unavailable while keeping them visible. (Reference reproduction: the live `:disabled-options` render path is store-bound — it reads the theme getter from Vuex, absent in Storybook.)' } } }

export const InlineAdd = () => ({
  data: () => ({ value: 'web', options: OPTIONS }),
  template: `
    <div style="max-width:280px;height:380px">
      <div class="text-neutral-light mb-2" style="font-size:12px">With <code>can-user-add-options</code> + <code>add-label</code> the menu gains a small <strong>"+ Add &lt;label&gt;"</strong> input so users can create a new option inline.</div>
      <FlotoDropdownPicker :value="value" :options="options" can-user-add-options add-label="Component" default-open placeholder="Select" @change="value = $event" />
    </div>`,
})
InlineAdd.storyName = 'Inline add option'
InlineAdd.parameters = { docs: { description: { story: 'With **`can-user-add-options`** (+ `add-label`) the open menu shows a small **"+ Add &lt;label&gt;"** input so a user can create and select a new option inline — used where the option set is user-extensible (tags, custom groups).' } } }

export const TwoPane = () => ({
  data: () => ({ value: 'web', options: OPTIONS, desc: DESC }),
  template: `
    <div style="max-width:560px;height:360px">
      <div class="text-neutral-light mb-2" style="font-size:12px">With <code>use-after-menu-description</code> the dropdown is <strong>two-pane</strong>: the option list on the left, a description of the hovered option on the right (<code>hovered-menu-description</code> slot).</div>
      <FlotoDropdownPicker :value="value" :options="options" use-after-menu-description default-open placeholder="Select" @change="value = $event">
        <template v-slot:hovered-menu-description="{ hoverItem }">
          <div style="width:260px;height:100%;padding:14px;border-left:1px solid var(--border-color);color:var(--page-text-color)">
            <div v-if="hoverItem" class="font-600 mb-2" style="font-size:13px">{{ hoverItem.text }}</div>
            <div v-if="hoverItem" class="text-neutral-light" style="font-size:12px;line-height:1.5">{{ desc[hoverItem.key] }}</div>
            <div v-else class="text-neutral-light" style="font-size:12px">Hover an option to see details.</div>
          </div>
        </template>
      </FlotoDropdownPicker>
    </div>`,
})
TwoPane.storyName = 'Two-pane (description)'
TwoPane.parameters = { docs: { description: { story: 'The **`use-after-menu-description`** mode makes the dropdown **two-pane** — the option list on the left, and a panel describing the **hovered** option on the right (via the `hovered-menu-description` slot). Used where each choice needs explanation (counter pickers, metric selectors).' } } }

// Grid / table dropdown — FlotoDropdownGridSelector (_base-dropdown-grid-selector.vue) + the MonitorPicker/
// AgentPicker stack: a FlotoDropdownPicker whose menu body is a searchable VirtualTable (Kendo grid) instead of
// an option list. The generic base takes a `columns` prop + rows; the "Select Agent" picker adds async server
// search + virtualization. Used ~70× (monitor/agent/device/interface/user/profile pickers). The live path is
// store + web-worker bound, so this is a render-faithful reproduction of the open picker (using the real
// MStatusTag + product icons + .ds-grid chrome). Columns: checkbox · MONITOR (status ring + name) · IP · TYPE
// (product type icon) · STATUS (status tag). Header is sortable; a search box sits on top.
const AGENTS = [
  { id: 'a1', name: 'motadata(172.16.9.243)', ip: '172.16.9.243', status: 'running', sel: false },
  { id: 'a2', name: 'motadata-VMware-Virtual-Platform', ip: '172.20.22.2', status: 'running', sel: true },
  { id: 'a3', name: 'APMSandboxAgent', ip: '172.16.14.100', status: 'running', sel: false },
]
export const GridDropdown = () => ({
  components: { MStatusTag },
  data: () => ({ open: true, rows: AGENTS, q: '', sortDir: 'desc', listMode: 'all' }),
  computed: {
    selectedCount() { return this.rows.filter((x) => x.sel).length },
    triggerLabel() {
      const sel = this.rows.filter((x) => x.sel)
      if (!sel.length) return 'Select Agent'
      return sel.length === 1 ? sel[0].name : `${sel[0].name} (+${sel.length - 1})`
    },
    view() {
      let r = this.rows.filter((x) => !this.q || (x.name + x.ip).toLowerCase().includes(this.q.toLowerCase()))
      if (this.listMode === 'selected') r = r.filter((x) => x.sel)
      r = r.slice().sort((a, b) => (this.sortDir === 'asc' ? 1 : -1) * a.name.localeCompare(b.name))
      return r
    },
  },
  methods: {
    clearSelected() { this.rows.forEach((x) => { x.sel = false }); this.listMode = 'all' },
  },
  template: `
    <div style="max-width:820px">
      <div class="text-neutral-light mb-2" style="font-size:12px">A <strong>grid / table dropdown</strong> (FlotoDropdownGridSelector) — the menu is a searchable table with checkboxes, a status ring, type icons and a status tag. The "Select Agent / Select Monitor" picker (~70×).</div>
      <!-- trigger (input-like, chevron) — reflects the current selection like the product -->
      <div class="flex items-center justify-between" @click="open = !open"
        :style="{ height:'36px', padding:'0 12px', border:'1px solid var(--border-color)', borderRadius:'4px', background:'var(--page-background-color)', cursor:'pointer', fontSize:'0.8rem', color: selectedCount ? 'var(--page-text-color)' : 'var(--neutral-light)' }">
        <span>{{ triggerLabel }}</span>
        <MIcon :name="open ? 'angle-up' : 'angle-down'" style="font-size:12px;color:var(--neutral-light)" />
      </div>
      <!-- open panel: search + table -->
      <div v-if="open" style="margin-top:6px;border:1px solid var(--border-color);border-radius:6px;background:var(--page-background-color);box-shadow:0 6px 20px var(--neutral-shadow-light);overflow:hidden">
        <div class="flex items-center" style="padding:12px 12px 8px;gap:16px">
          <!-- REUSED product search: MInput with a search-icon prefix (not a hand-rolled input). Natural width
               (no flex:1) so the actions sit right beside it, not pushed far right. -->
          <div style="width:300px;flex:0 0 auto">
            <MInput v-model="q" class="search-box" placeholder="Search">
              <template v-slot:prefix><MIcon name="search" /></template>
            </MInput>
          </div>
          <!-- selected-count badge + View Selected / Clear Selected — actions use the product LINK treatment
               (dotted underline, not solid — same as _base-app-link / the global a). Appear only when checked. -->
          <div v-if="selectedCount" class="flex items-center" style="gap:12px;font-size:0.8rem">
            <span style="display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:var(--primary);color:var(--white-regular,#fff);font-size:12px;font-weight:600">{{ selectedCount }}</span>
            <a style="color:var(--page-text-color);text-decoration:underline dotted;text-underline-offset:3px;cursor:pointer" @click="listMode = listMode === 'selected' ? 'all' : 'selected'">{{ listMode === 'selected' ? 'View All' : 'View Selected' }}</a>
            <span style="color:var(--neutral-lighter)">|</span>
            <a style="color:var(--page-text-color);text-decoration:underline dotted;text-underline-offset:3px;cursor:pointer" @click="clearSelected">Clear Selected</a>
          </div>
        </div>
        <table class="ds-grid" style="width:100%">
          <thead>
            <tr>
              <th style="width:44px"><input type="checkbox" /></th>
              <th style="cursor:pointer" @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'">MONITOR <span style="opacity:.6">{{ sortDir === 'asc' ? '↑' : '↓' }}</span></th>
              <th>IP</th><th>TYPE</th><th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in view" :key="r.id" :class="{ 'ds-grid-row-selected': r.sel }">
              <td><input type="checkbox" v-model="r.sel" /></td>
              <td>
                <span style="display:inline-flex;align-items:center;gap:8px">
                  <span style="width:12px;height:12px;border-radius:50%;border:2px solid var(--secondary-red);flex:0 0 auto" aria-hidden="true"></span>
                  <span>{{ r.name }}</span>
                </span>
              </td>
              <td>{{ r.ip }}</td>
              <td><span style="display:inline-flex;align-items:center;gap:6px"><MIcon name="server" style="font-size:15px;color:var(--neutral-regular)" /><MIcon name="cog" style="font-size:14px;color:var(--primary-alt)" /></span></td>
              <td><MStatusTag :status="r.status" /></td>
            </tr>
            <tr v-if="!view.length"><td colspan="5" style="text-align:center;padding:24px 0;color:var(--neutral-light);border-bottom:none">No records found</td></tr>
          </tbody>
        </table>
      </div>
    </div>`,
})
GridDropdown.storyName = 'Grid / table dropdown (Select Agent, ~70×)'
GridDropdown.parameters = { docs: { description: { story: 'The **grid / table dropdown** — `FlotoDropdownGridSelector` (+ the `MonitorPicker`/`AgentPicker` stack). The dropdown body is a **searchable `VirtualTable`** (Kendo grid) with a **checkbox column, sortable headers, a search box, a selected-count badge and View-All / View-Selected toggles** — instead of a plain option list. Cells render rich content: a **status ring**, **product type icons**, and a **status tag** ("Running"). Used ~70× for **agent / monitor / device / interface / user / profile** selection; the "Select Agent / Select Monitor" case adds async server-search + row virtualization. (Render-faithful reproduction — the live grid is store + web-worker bound.)' } } }

// ── Group-A variant 3: Icon / severity-dot / type dropdown (before-menu-text slot, 27 files) ──
// Each option (and the collapsed trigger) carries a leading coloured severity dot / monitor-type icon, via the
// `before-menu-text` slot. Real product usage: severity-picker.vue (<Severity> dot), monitor-type-picker.vue (icon).
const SEVERITIES = [
  { key: 'critical', text: 'Critical', tok: '--severity-critical' },
  { key: 'major', text: 'Major', tok: '--severity-major' },
  { key: 'warning', text: 'Warning', tok: '--severity-warning' },
  { key: 'clear', text: 'Clear', tok: '--severity-clear' },
  { key: 'maintenance', text: 'Maintenance', tok: '--severity-maintenance' },
]
const dot = (t) => `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:var(${t});margin-right:8px;flex:0 0 auto" aria-hidden="true"></span>`
export const IconDot = () => ({
  data: () => ({ value: 'critical', options: SEVERITIES }),
  computed: { cur() { return this.options.find((o) => o.key === this.value) } },
  template: `
    <div style="max-width:280px">
      <div class="text-neutral-light mb-2" style="font-size:12px">A <strong>severity-dot / icon dropdown</strong> — each option (and the trigger) has a leading coloured dot / type icon via the <code>before-menu-text</code> slot (27 files: severity, monitor-type, status pickers).</div>
      <FlotoDropdownPicker :value="value" :options="options" default-open placeholder="Select severity" @change="value = $event">
        <template v-slot:before-menu-text="{ item }"><span v-html="dot(item.tok)"></span></template>
      </FlotoDropdownPicker>
    </div>`,
  methods: { dot },
})
IconDot.storyName = 'Icon / severity-dot (before-menu-text, 27×)'
IconDot.parameters = { docs: { description: { story: 'The **icon / severity-dot dropdown** — a `FlotoDropdownPicker` whose options carry a **leading coloured severity dot or monitor-type icon** via the **`before-menu-text`** slot (also `after-menu-text` for a trailing glyph). The collapsed trigger shows the same glyph. Used **27×**: `severity-picker.vue` (a `<Severity>` dot), `monitor-type-picker.vue` (a type icon in both the trigger and each option), status pickers.' } } }

// ── Group-A variant 4: Avatar / people picker (user-picker.vue) ──
const USERS = [
  { key: 'u1', text: 'Alex Johnson', initials: 'AJ', col: '--primary-alt' },
  { key: 'u2', text: 'Sam Rivera', initials: 'SR', col: '--secondary-green' },
  { key: 'u3', text: 'Jordan Lee', initials: 'JL', col: '--secondary-orange' },
]
const avatar = (u) => `<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:var(${u.col});color:var(--white-regular,#fff);font-size:10px;font-weight:600;margin-right:10px;vertical-align:middle;flex:0 0 auto" aria-hidden="true">${u.initials}</span>`
export const AvatarPicker = () => ({
  data: () => ({ value: 'u1', options: USERS }),
  // The trigger is an Ant input whose prefix (the avatar) is position:absolute; the input's default left
  // padding (~30px) is too small for a 22px avatar, so the text overlaps it. Widen the input padding directly
  // (a <style> in a Vue template is stripped, so set it on the element after mount + on every value change).
  mounted() { [0, 100, 300, 600].forEach((t) => setTimeout(this.pad, t)) },
  updated() { setTimeout(this.pad, 0) },
  methods: {
    avatar,
    pad() { this.$el && this.$el.querySelectorAll('input').forEach((i) => i.style.setProperty('padding-left', '40px', 'important')) },
  },
  template: `
    <div style="max-width:280px" class="avatar-picker-demo">
      <div class="text-neutral-light mb-2" style="font-size:12px">An <strong>avatar / people picker</strong> — user options render an avatar (initials circle) + name (<code>user-picker.vue</code>; also has a grid-table mode for bulk assignment).</div>
      <FlotoDropdownPicker :value="value" :options="options" default-open placeholder="Assign to" @change="value = $event">
        <template v-slot:before-menu-text="{ item }"><span v-html="avatar(item)"></span></template>
      </FlotoDropdownPicker>
    </div>`,
})
AvatarPicker.storyName = 'Avatar / people picker'
AvatarPicker.parameters = { docs: { description: { story: 'An **avatar / people picker** — `user-picker.vue`. User options render an **avatar (initials circle) + name** via the `before-menu-text` slot. Dual-mode: a plain list for a single assignee, or the **grid-table** mode (see Grid dropdown) for bulk assignment. Used for owner / assignee / approver / notified-user selection.' } } }

// ── Group-A variant 2: Tree-select in a dropdown (monitor-hierarchy-picker.vue) — reproduction ──
// The hierarchical picker: a FlotoDropdownPicker whose body is an expand/collapse tree (infinite-tree.vue). The live
// tree is store + virtual-scroll bound, so this is a render-faithful reproduction of the open tree.
const TREE = [
  { id: 't1', label: 'Data Centers', depth: 0, open: true, count: 2 },
  { id: 't2', label: 'DC-East', depth: 1, open: true, count: 2 },
  { id: 't3', label: 'web-server-01', depth: 2, leaf: true },
  { id: 't4', label: 'db-primary', depth: 2, leaf: true },
  { id: 't5', label: 'DC-West', depth: 1, open: false, count: 3 },
]
export const TreeSelect = () => ({
  data: () => ({ open: true, tree: TREE, value: 't3' }),
  computed: { visible() { let hide = 99; return this.tree.filter((n) => { if (n.depth > hide) return false; hide = n.open === false ? n.depth : 99; return true }) } },
  template: `
    <div style="max-width:340px">
      <div class="text-neutral-light mb-2" style="font-size:12px">A <strong>tree-select dropdown</strong> — the menu is an expand/collapse <strong>hierarchy tree</strong> (<code>monitor-hierarchy-picker.vue</code>). The product's cascader/tree-select equivalent. (Reproduction: the live tree is store + virtual-scroll bound.)</div>
      <div class="flex items-center justify-between" @click="open = !open" style="height:36px;padding:0 12px;border:1px solid var(--border-color);border-radius:4px;background:var(--page-background-color);cursor:pointer;font-size:0.8rem;color:var(--page-text-color)">
        <span>web-server-01</span><MIcon :name="open ? 'angle-up' : 'angle-down'" style="font-size:12px;color:var(--neutral-light)" />
      </div>
      <div v-if="open" style="margin-top:6px;border:1px solid var(--border-color);border-radius:6px;background:var(--page-background-color);box-shadow:0 6px 20px var(--neutral-shadow-light);padding:6px">
        <div v-for="n in visible" :key="n.id" class="flex items-center" @click="n.leaf ? (value = n.id) : (n.open = !n.open)"
          :style="{ height:'32px', paddingLeft:(8 + n.depth*18)+'px', paddingRight:'10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.8rem', gap:'6px', color: value===n.id ? 'var(--primary)' : 'var(--page-text-color)', background: value===n.id ? 'var(--code-tag-background-color)' : 'transparent' }">
          <!-- every parent (non-leaf) shows a chevron that deep-dives; leaves get a spacer so labels align -->
          <svg v-if="!n.leaf" width="10" height="10" viewBox="0 0 48 48" fill="var(--neutral-light)" aria-hidden="true"
            :style="{ flex:'0 0 auto', transition:'transform .12s', transform: n.open ? 'rotate(90deg)' : 'none' }">
            <path d="M31.4,22.6l-12-12c-.8-.8-2-.8-2.8,0-.8,.8-.8,2,0,2.8l10.6,10.6-10.6,10.6c-.8,.8-.8,2,0,2.8s2,.8,2.8,0l12-12c.8-.8,.8-2,0-2.8Z"/>
          </svg>
          <span v-else style="width:10px;flex:0 0 auto"></span>
          <span>{{ n.label }}</span>
          <span v-if="!n.leaf" class="text-neutral-light" style="font-size:11px">({{ n.count }})</span>
        </div>
      </div>
    </div>`,
})
TreeSelect.storyName = 'Tree-select (hierarchy)'
TreeSelect.parameters = { docs: { description: { story: 'A **tree-select dropdown** — `monitor-hierarchy-picker.vue`, whose body is an **expand/collapse hierarchy tree** (`infinite-tree.vue`) instead of a flat list. This is the codebase\'s **cascader / tree-select equivalent** (Ant\'s cascader/tree-select are not used). Nodes expand to reveal children with indentation + a count; a leaf is selectable. (Render-faithful reproduction — the live tree is store + virtual-scroll bound.)' } } }

// ── Group-A variant 5: Virtualized rich-row list dropdown (notification/widget selectors) — reproduction ──
const CARDS = [
  { id: 'c1', title: 'CPU utilization high', meta: 'web-server-01 · 2 min ago', sev: '--severity-critical' },
  { id: 'c2', title: 'Disk space low', meta: 'db-primary · 8 min ago', sev: '--severity-warning' },
  { id: 'c3', title: 'Service recovered', meta: 'cache-02 · 15 min ago', sev: '--severity-clear' },
]
export const RichRowList = () => ({
  data: () => ({ open: true, cards: CARDS }),
  template: `
    <div style="max-width:360px">
      <div class="text-neutral-light mb-2" style="font-size:12px">A <strong>virtualized rich-row dropdown</strong> — the menu is a <code>RecycleScroller</code> of tall, multi-line rows (notification cards, widget thumbnails) rather than single-line options (16 files).</div>
      <div class="flex items-center justify-between" @click="open = !open" style="height:36px;padding:0 12px;border:1px solid var(--border-color);border-radius:4px;background:var(--page-background-color);cursor:pointer;font-size:0.8rem;color:var(--neutral-light)">
        <span>Notifications</span><MIcon :name="open ? 'angle-up' : 'angle-down'" style="font-size:12px" />
      </div>
      <div v-if="open" style="margin-top:6px;border:1px solid var(--border-color);border-radius:6px;background:var(--page-background-color);box-shadow:0 6px 20px var(--neutral-shadow-light);overflow:hidden">
        <div v-for="c in cards" :key="c.id" class="flex items-start" style="gap:10px;padding:12px 14px;border-bottom:1px solid var(--border-color);cursor:pointer">
          <span style="width:8px;height:8px;border-radius:50%;margin-top:5px;flex:0 0 auto" :style="{ background: 'var(' + c.sev + ')' }" aria-hidden="true"></span>
          <div style="min-width:0">
            <div class="font-600" style="font-size:0.8rem;color:var(--page-text-color)">{{ c.title }}</div>
            <div class="text-neutral-light" style="font-size:12px;margin-top:2px">{{ c.meta }}</div>
          </div>
        </div>
      </div>
    </div>`,
})
RichRowList.storyName = 'Virtualized rich-row list'
RichRowList.parameters = { docs: { description: { story: 'A **virtualized rich-row list dropdown** — the menu is a **`RecycleScroller` of tall, multi-line rows** (notification cards, widget thumbnails) rather than single-line options. Used **16×**: `notification-dropdown.vue`, `widget-selector.vue`, `counter-list.vue`. Each row has multiple lines + a leading glyph; the list virtualizes for large sets. (Render-faithful reproduction.)' } } }

// ── Group B: the TRIGGER axis — how a dropdown OPENS (cross-cutting, not a menu variant) ──
// FlotoDropdownPicker exposes a `trigger` slot with { toggle }: the SAME menu can be opened by an input box
// (default), plain text + caret (text-only), a button, an icon-only button, or a chip. Used 130× via v-slot:trigger.
export const Triggers = () => ({
  data: () => ({ value: 'web', options: OPTIONS }),
  computed: { label() { return (this.options.find((o) => o.key === this.value) || {}).text || 'Select' } },
  template: `
    <div style="max-width:560px">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <strong>trigger axis</strong> — the same dropdown can be opened by different trigger shapes via the <code>trigger</code> slot (<code>{ toggle }</code>). This is orthogonal to the menu content: any variant above can use any trigger (130× via <code>v-slot:trigger</code>).</div>
      <div style="display:grid;grid-template-columns:130px 1fr;gap:14px 16px;align-items:center">
        <div class="text-neutral-light" style="font-size:12px">Input (default)</div>
        <div><FlotoDropdownPicker :value="value" :options="options" placeholder="Select" style="max-width:240px" @change="value = $event" /></div>

        <div class="text-neutral-light" style="font-size:12px">Text-only</div>
        <div><FlotoDropdownPicker :value="value" :options="options" text-only @change="value = $event" /></div>

        <div class="text-neutral-light" style="font-size:12px">Button</div>
        <div>
          <FlotoDropdownPicker :value="value" :options="options" @change="value = $event">
            <template v-slot:trigger="{ toggle }"><MButton variant="default" @click="toggle">{{ label }} <MIcon name="angle-down" style="font-size:11px;margin-left:4px" /></MButton></template>
          </FlotoDropdownPicker>
        </div>

        <div class="text-neutral-light" style="font-size:12px">Icon-only</div>
        <div>
          <FlotoDropdownPicker :value="value" :options="options" @change="value = $event">
            <template v-slot:trigger="{ toggle }">
              <button @click="toggle" aria-label="Options" style="width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border-color);border-radius:4px;background:var(--page-background-color);color:var(--neutral-regular);cursor:pointer"><MIcon name="ellipsis-v" style="font-size:15px" /></button>
            </template>
          </FlotoDropdownPicker>
        </div>

        <div class="text-neutral-light" style="font-size:12px">Chip</div>
        <div>
          <FlotoDropdownPicker :value="value" :options="options" @change="value = $event">
            <template v-slot:trigger="{ toggle }">
              <span @click="toggle" style="display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:13px;background:var(--code-tag-background-color);color:var(--primary);font-size:0.8rem;cursor:pointer">{{ label }} <MIcon name="angle-down" style="font-size:10px" /></span>
            </template>
          </FlotoDropdownPicker>
        </div>
      </div>
    </div>`,
})
Triggers.storyName = 'Triggers (input · text · button · icon · chip)'
Triggers.parameters = { docs: { description: { story: 'The **trigger axis** — *how* a dropdown opens, independent of *what* the menu shows. `FlotoDropdownPicker` exposes a **`trigger` slot** with `{ toggle }`, so the same menu can be opened by: an **input** box (default — for form fields), **text-only** (inline/embedded, 15×), a **button** (a labelled action-like opener, e.g. "Columns", "Add filter"), an **icon-only** button (compact toolbars — ellipsis / gear / filter), or a **chip** (a compact removable-looking token). Any menu variant (grid, tree, icon-dot, …) can use any trigger. Used **130×** via `v-slot:trigger`.' } } }

// Hide the Controls panel on static showcase stories (only Playground uses args).
Single.parameters = { ...(Single.parameters || {}), controls: { disable: true } }
OpenMenu.parameters = { ...(OpenMenu.parameters || {}), controls: { disable: true } }
Multiple.parameters = { ...(Multiple.parameters || {}), controls: { disable: true } }
NotSearchable.parameters = { ...(NotSearchable.parameters || {}), controls: { disable: true } }
AllowClear.parameters = { ...(AllowClear.parameters || {}), controls: { disable: true } }
ReadOnlyPills.parameters = { ...(ReadOnlyPills.parameters || {}), controls: { disable: true } }
TextOnly.parameters = { ...(TextOnly.parameters || {}), controls: { disable: true } }
DisabledItems.parameters = { ...(DisabledItems.parameters || {}), controls: { disable: true } }
InlineAdd.parameters = { ...(InlineAdd.parameters || {}), controls: { disable: true } }
TwoPane.parameters = { ...(TwoPane.parameters || {}), controls: { disable: true } }
GridDropdown.parameters = { ...(GridDropdown.parameters || {}), controls: { disable: true } }
IconDot.parameters = { ...(IconDot.parameters || {}), controls: { disable: true } }
AvatarPicker.parameters = { ...(AvatarPicker.parameters || {}), controls: { disable: true } }
TreeSelect.parameters = { ...(TreeSelect.parameters || {}), controls: { disable: true } }
RichRowList.parameters = { ...(RichRowList.parameters || {}), controls: { disable: true } }
Triggers.parameters = { ...(Triggers.parameters || {}), controls: { disable: true } }
