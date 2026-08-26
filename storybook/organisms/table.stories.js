// Organisms / Table (Grid) — MGrid (src/components/crud/_base-grid.vue, 75×) wraps the Kendo Vue
// Grid (@progress/kendo-vue-grid) + web workers for data processing. The product's primary data
// table: resizable/reorderable/sortable columns, client + server paging, grouping, selection,
// expandable detail rows, per-column cell slots. Usually driven by FlotoPaginatedCrud (76×).
// FAITHFUL REPRODUCTIONS using the shared `.ds-grid` DS classes (storybook/ds-primitives.less) which
// mirror the real table.less chrome: --grid-header-bg header, --border-color rows, hover, and the
// selected row (--neutral-lightest + --primary left accent). The live grid is Kendo + workers.
import MStatusTag from '@components/_base-status-tag.vue'

const ROWS = [
  { id: 1, name: 'web-server-01', status: 'up', ip: '10.0.0.12', poll: '12s ago' },
  { id: 2, name: 'db-primary', status: 'down', ip: '10.0.0.20', poll: '34s ago' },
  { id: 3, name: 'cache-02', status: 'paused', ip: '10.0.0.31', poll: '1m ago' },
  { id: 4, name: 'lb-edge-1', status: 'maintenance', ip: '10.0.0.40', poll: '8s ago' },
]

export default {
  title: 'Organisms/Table/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Organism — the product\'s primary **data table** (`MGrid`, 75×; usually via **`FlotoPaginatedCrud`**, 76×). Wraps the **Kendo Vue Grid** + web workers: **resizable / reorderable / sortable** columns, **client + server paging**, **grouping**, **selection** (with a bulk-action bar), **expandable detail rows**, and **per-column cell slots**. Shown here as **reference reproductions** (the shared `.ds-grid` classes mirror the real `table.less` chrome + tokens); the live grid is the Kendo component.',
      },
    },
  },
}

export const Basic = () => ({
  components: { MStatusTag },
  data: () => ({
    rows: ROWS,
    // Column-driven so headers can be dragged to reorder — the real Kendo grid behavior
    // (`_base-grid.vue` :reorderable + @columnreorder). Click a header to sort.
    columns: [
      { key: 'name', label: 'Name', sort: 'asc', cls: 'font-500' },
      { key: 'status', label: 'Status', tag: true },
      { key: 'ip', label: 'IP Address' },
      { key: 'poll', label: 'Last Poll', cls: 'text-neutral-light' },
    ],
    dragIdx: null, overIdx: null, didDrag: false,
  }),
  methods: {
    sortBy(col) {
      if (this.didDrag) { this.didDrag = false; return }
      const dir = col.sort === 'asc' ? 'desc' : 'asc'
      this.columns = this.columns.map((c) => ({ ...c, sort: c.key === col.key ? dir : undefined }))
    },
    onDragStart(i, e) { this.dragIdx = i; this.didDrag = true; if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)) } },
    onDragOver(i) { if (this.dragIdx === null) return; this.overIdx = i },
    onDrop(i) {
      if (this.dragIdx === null) return
      const cols = [...this.columns]
      const [moved] = cols.splice(this.dragIdx, 1)
      cols.splice(i, 0, moved)
      this.columns = cols
      this.dragIdx = this.overIdx = null
    },
    onDragEnd() { this.dragIdx = this.overIdx = null },
  },
  template: `
    <table class="ds-grid">
      <thead><tr>
        <th v-for="(col, i) in columns" :key="col.key"
          draggable="true"
          :style="{ cursor:'grab', userSelect:'none', opacity: dragIdx===i ? 0.4 : 1, borderLeft: overIdx===i && dragIdx!==i ? '2px solid var(--primary)' : '2px solid transparent' }"
          @click="sortBy(col)"
          @dragstart="onDragStart(i, $event)"
          @dragover.prevent="onDragOver(i)"
          @drop.prevent="onDrop(i)"
          @dragend="onDragEnd">
          <span class="inline-flex items-center">{{ col.label }}<span v-if="col.sort" style="font-size:10px;margin-left:5px;opacity:.7">{{ col.sort === 'asc' ? '↑' : '↓' }}</span></span>
        </th>
      </tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td v-for="col in columns" :key="col.key" :class="col.cls">
            <MStatusTag v-if="col.tag" :status="r[col.key]" />
            <template v-else>{{ r[col.key] }}</template>
          </td>
        </tr>
      </tbody>
    </table>`,
})
Basic.parameters = { docs: { description: { story: 'The base grid — a `columns` config + a `data` array. The **main `.k-grid` header** is **transparent + UPPERCASE + letter-spacing** (600 weight, top & bottom rule) — *not* a tinted bar (that\'s the `item-list-table` variant, see **Header styles**). Columns are **sortable** — **click a header** to toggle its **↑ / ↓ arrow**. Columns are also **reorderable** — **drag a column header** onto another to move it (the real Kendo behavior: `_base-grid.vue` `:reorderable` + `@columnreorder`; a `--primary` insertion line marks the drop target). Rows have a **`--border-color`** bottom divider + a **hover** highlight (a translucent neutral tint). Cells render via **per-column slots**. Hover a row.' } } }

export const Selectable = () => ({
  components: { MStatusTag },
  data: () => ({ rows: ROWS, selected: [2] }),
  computed: { allSel() { return this.selected.length === this.rows.length } },
  methods: {
    toggle(id) { this.selected = this.selected.includes(id) ? this.selected.filter(x => x !== id) : [...this.selected, id] },
    toggleAll() { this.selected = this.allSel ? [] : this.rows.map(r => r.id) },
  },
  template: `
    <div>
      <div v-if="selected.length" class="mt-1 mb-3">
        <MTag variant="default" rounded :closable="true" @close="selected = []"><span class="font-500">{{ selected.length }} items selected</span></MTag>
      </div>
      <table class="ds-grid">
        <thead><tr><th style="width:40px"><MCheckbox :checked="allSel" @change="toggleAll" /></th><th>Name</th><th>Status</th><th>IP Address</th></tr></thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" :class="{ 'ds-grid-row-selected': selected.includes(r.id) }">
            <td><MCheckbox :checked="selected.includes(r.id)" @change="toggle(r.id)" /></td>
            <td class="font-500">{{ r.name }}</td>
            <td><MStatusTag :status="r.status" /></td>
            <td>{{ r.ip }}</td>
          </tr>
        </tbody>
      </table>
    </div>`,
})
Selectable.parameters = { docs: { description: { story: 'With **`selectable`** — a checkbox column (header = select-all); a **selected row** gets `--neutral-lightest` background + a **`--primary` left-border accent**. The **"N items selected"** tag (an `MTag`, rounded) shows above (unless `hide-selection-info`). Drives the **bulk-action bar** (see Popover → Kebab). Emits `selection-change`. Toggle the checkboxes.' } } }

export const Expandable = () => ({
  components: { MStatusTag },
  data: () => ({ rows: ROWS, open: 1 }),
  methods: { toggle(id) { this.open = this.open === id ? -1 : id } },
  template: `
    <table class="ds-grid">
      <thead><tr><th style="width:36px"></th><th>Name</th><th>Status</th><th>IP Address</th></tr></thead>
      <tbody>
        <template v-for="r in rows">
          <tr :key="r.id">
            <td><MIcon :name="open===r.id ? 'chevron-down' : 'chevron-right'" class="cursor-pointer text-neutral-light" @click="toggle(r.id)" /></td>
            <td class="font-500">{{ r.name }}</td>
            <td><MStatusTag :status="r.status" /></td>
            <td>{{ r.ip }}</td>
          </tr>
          <tr v-if="open===r.id" :key="r.id+'d'" class="ds-grid-detail">
            <td></td>
            <td colspan="3">
              <div class="py-1" style="font-size:12px">
                <div><strong>Interface:</strong> GigabitEthernet0/1 · <strong>Vendor:</strong> Cisco · <strong>Uptime:</strong> 42d</div>
                <div class="text-neutral-light mt-1">The detail row (the <code>detailRow</code> slot) renders custom content under the expanded row.</div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>`,
})
Expandable.parameters = { docs: { description: { story: 'With **`expandable`** — a chevron column toggles an inline **detail row** below the record (the **`detailRow`** slot). `hide-expand-column` hides the chevron when a row click drives expansion. Used for drill-downs (discovered services, interface details, trace spans). Click a chevron.' } } }

export const CellTypes = () => ({
  components: { MStatusTag },
  template: `
    <table class="ds-grid">
      <thead><tr><th>Monitor</th><th>Status</th><th>Severity</th><th>Tags</th><th>Trend</th><th style="width:48px"></th></tr></thead>
      <tbody>
        <tr>
          <td class="font-500">web-server-01</td>
          <td><MStatusTag status="up" /></td>
          <td><span class="flex items-center"><span :style="{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--severity-major)', marginRight:'6px', display:'inline-block' }"></span>Major</span></td>
          <td><MTag class="tag-green" :closable="false">prod</MTag> <MTag class="tag-primary" :closable="false">web</MTag></td>
          <td><svg width="80" height="20" viewBox="0 0 80 20"><polyline points="0,15 16,8 32,12 48,4 64,9 80,3" fill="none" stroke="var(--primary-alt)" stroke-width="1.5"/></svg></td>
          <td><a class="text-neutral-light cursor-pointer"><MIcon name="ellipsis-v" /></a></td>
        </tr>
      </tbody>
    </table>`,
})
CellTypes.storyName = 'Cell types (status / severity / tags / sparkline / actions)'
CellTypes.parameters = { docs: { description: { story: 'A cell is a **slot**, so columns render rich content: a **status tag** (`MStatusTag`), a **severity dot**, **tags** (`MTag`), an inline **sparkline**, and a **row-actions** kebab (`FlotoGridActions`). Per-column slots seen in the wild: `status`, `name`, `tags`, `severity`, `value`, `duration`, `action`, `monitorType`, …' } } }

export const Grouping = () => ({
  components: { MStatusTag },
  data: () => ({ groups: [ { name: 'Production', rows: ROWS.slice(0, 2) }, { name: 'Staging', rows: ROWS.slice(2) } ] }),
  template: `
    <table class="ds-grid">
      <thead><tr><th>Name</th><th>Status</th><th>IP Address</th></tr></thead>
      <tbody>
        <template v-for="g in groups">
          <tr :key="g.name" class="ds-grid-group">
            <td colspan="3"><MIcon name="chevron-down" class="mr-2 text-neutral-light" />{{ g.name }} <span class="text-neutral-light font-400">({{ g.rows.length }})</span></td>
          </tr>
          <tr v-for="r in g.rows" :key="g.name+r.id">
            <td class="font-500" style="padding-left:36px">{{ r.name }}</td>
            <td><MStatusTag :status="r.status" /></td>
            <td>{{ r.ip }}</td>
          </tr>
        </template>
      </tbody>
    </table>`,
})
Grouping.parameters = { docs: { description: { story: 'With **`default-group`** — rows are grouped under collapsible **group header rows** (count in the header). `hide-grouping` turns it off. Used for grouping monitors by type, alerts by policy, etc.' } } }

export const EmptyState = () => ({
  template: `
    <table class="ds-grid">
      <thead><tr><th>Name</th><th>Status</th><th>IP Address</th></tr></thead>
      <tbody><tr><td colspan="3" style="border-bottom:none">
        <div class="flex flex-col items-center justify-center text-neutral-light" style="padding:48px 0">
          <MIcon name="inbox" size="2x" class="mb-2" /><span>No records found</span>
        </div>
      </td></tr></tbody>
    </table>`,
})
EmptyState.parameters = { docs: { description: { story: 'The **empty state** — when `data` is empty (or a search/filter returns nothing): a centered icon + **"No records found"**. Keep the header so column context stays visible.' } } }

export const Loading = () => ({
  template: `
    <table class="ds-grid">
      <thead><tr><th>Name</th><th>Status</th><th>IP Address</th></tr></thead>
      <tbody><tr><td colspan="3" style="border-bottom:none">
        <div class="flex items-center justify-center text-neutral-light" style="padding:48px 0">
          <MIcon name="spinner-third" class="fa-spin mr-2 text-primary" size="lg" /><span>Loading…</span>
        </div>
      </td></tr></tbody>
    </table>`,
})
Loading.parameters = { docs: { description: { story: 'The **loading state** — `MGrid` shows a `FlotoContentLoader` (spinner) while `processingData` (initial fetch, or the worker processing a sort/filter/page). `use-search-term-loading` shows it during search debounce.' } } }

export const Pagination = () => ({
  components: { MStatusTag },
  data: () => ({ rows: ROWS, pages: [1, 2, 3, 4, 5] }),
  // The real Kendo .k-grid-pager: first/prev arrows + numbered page links (selected = subtle
  // --pagination-active-bg, NOT a solid button) + ellipsis + next/last arrows, then a page-size
  // <select> + "items per page" on the left, and "1 - 50 of N items" on the far right.
  template: `
    <div>
      <table class="ds-grid" style="border-radius:6px 6px 0 0">
        <thead><tr><th>Name</th><th>Status</th><th>IP Address</th></tr></thead>
        <tbody><tr v-for="r in rows" :key="r.id"><td class="font-500">{{ r.name }}</td><td><MStatusTag :status="r.status" /></td><td>{{ r.ip }}</td></tr></tbody>
      </table>
      <div class="ds-pager" style="border-radius:0 0 6px 6px">
        <div class="flex items-center" style="gap:2px">
          <span class="ds-pager-page text-neutral-light" title="First"><svg width="14" height="14" viewBox="0 0 16 16" style="vertical-align:middle"><line x1="4" y1="4" x2="4" y2="12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><polyline points="11,4 7,8 11,12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span class="ds-pager-page text-neutral-light" title="Previous"><svg width="14" height="14" viewBox="0 0 16 16" style="vertical-align:middle"><polyline points="10,4 6,8 10,12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span v-for="n in pages" :key="n" class="ds-pager-page" :class="{ 'ds-pager-page-selected': n===1 }">{{ n }}</span>
          <span class="text-neutral-light" style="padding:0 2px">…</span>
          <span class="ds-pager-page text-neutral-light" title="Next"><svg width="14" height="14" viewBox="0 0 16 16" style="vertical-align:middle"><polyline points="6,4 10,8 6,12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span class="ds-pager-page text-neutral-light" title="Last"><svg width="14" height="14" viewBox="0 0 16 16" style="vertical-align:middle"><polyline points="5,4 9,8 5,12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="4" x2="12" y2="12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></span>
          <select style="margin-left:12px"><option>50</option><option>100</option><option>200</option></select>
          <span class="text-neutral-light" style="margin-left:8px">items per page</span>
        </div>
        <span class="text-neutral-light">1 - 50 of 357 items</span>
      </div>
    </div>`,
})
Pagination.parameters = { docs: { description: { story: 'The real **Kendo `.k-grid-pager`** (`paging`) — `|◀ ◀` first/prev, **numbered text page links** (selected page = a subtle **`--pagination-active-bg`** pill, *not* a solid button) `1 2 3 4 5 …`, `▶ ▶|` next/last, then a **page-size `<select>` + "items per page"**, with **"1 - 50 of N items"** on the far right. Default page size **50** (`default-page-size`). Large/server data server-pages via `external-take`/`external-skip` + `total-count` + `@data-state-change`.' } } }

// Header styles — the TWO distinct grid header UIs in the product.
export const HeaderStyles = () => ({
  components: { MStatusTag },
  data: () => ({ rows: ROWS.slice(0, 3) }),
  template: `
    <div style="display:flex;flex-direction:column;gap:24px">
      <div>
        <div class="text-neutral-light mb-2" style="font-size:12px">Default — main <code>.k-grid</code> header: <b>transparent · UPPERCASE · letter-spacing</b> (data grids)</div>
        <table class="ds-grid">
          <thead><tr><th>Name</th><th>Status</th><th>IP Address</th></tr></thead>
          <tbody><tr v-for="r in rows" :key="r.id"><td class="font-500">{{ r.name }}</td><td><MStatusTag :status="r.status" /></td><td>{{ r.ip }}</td></tr></tbody>
        </table>
      </div>
      <div>
        <div class="text-neutral-light mb-2" style="font-size:12px">Tinted — <code>.item-list-table</code> header: <b>--grid-header-bg fill · normal-case · 500</b> (selection / list tables)</div>
        <table class="ds-grid ds-grid-tinted">
          <thead><tr><th>Name</th><th>Status</th><th>IP Address</th></tr></thead>
          <tbody><tr v-for="r in rows" :key="r.id"><td class="font-500">{{ r.name }}</td><td><MStatusTag :status="r.status" /></td><td>{{ r.ip }}</td></tr></tbody>
        </table>
      </div>
    </div>`,
})
HeaderStyles.storyName = 'Variants: header styles (k-grid vs item-list)'
HeaderStyles.parameters = { docs: { description: { story: 'The product has **two grid header UIs**: (1) the **main `.k-grid`** header — **transparent**, **UPPERCASE**, `letter-spacing:0.25px`, 600, with a top + bottom rule (the data grids); (2) the **`.item-list-table`** header — a **tinted `--grid-header-bg` fill**, normal-case, 500 (selection / picker list tables). Same data, different chrome — pick by context.' } } }

// Border / density style variants.
export const StyleVariants = () => ({
  components: { MStatusTag },
  data: () => ({ rows: ROWS.slice(0, 3) }),
  template: `
    <div style="display:flex;flex-direction:column;gap:24px">
      <div><div class="text-neutral-light mb-2" style="font-size:12px"><code>.ds-grid-bordered</code> — full cell borders (compact data)</div>
        <table class="ds-grid ds-grid-bordered"><thead><tr><th>Name</th><th>Status</th><th>IP</th></tr></thead><tbody><tr v-for="r in rows" :key="r.id"><td>{{ r.name }}</td><td><MStatusTag :status="r.status" /></td><td>{{ r.ip }}</td></tr></tbody></table>
      </div>
      <div><div class="text-neutral-light mb-2" style="font-size:12px"><code>.with-out-border</code> — borderless rows</div>
        <table class="ds-grid ds-grid-borderless"><thead><tr><th>Name</th><th>Status</th><th>IP</th></tr></thead><tbody><tr v-for="r in rows" :key="r.id"><td>{{ r.name }}</td><td><MStatusTag :status="r.status" /></td><td>{{ r.ip }}</td></tr></tbody></table>
      </div>
      <div><div class="text-neutral-light mb-2" style="font-size:12px"><code>.hide-header</code> — no header row (compact widget grids)</div>
        <table class="ds-grid ds-grid-hide-header"><thead><tr><th>Name</th><th>Status</th><th>IP</th></tr></thead><tbody><tr v-for="r in rows" :key="r.id"><td>{{ r.name }}</td><td><MStatusTag :status="r.status" /></td><td>{{ r.ip }}</td></tr></tbody></table>
      </div>
    </div>`,
})
StyleVariants.storyName = 'Variants: borders & header visibility'
StyleVariants.parameters = { docs: { description: { story: 'Style variants beyond the default: **`.bordered`** (full cell cage, for dense data) · **`.with-out-border`** (borderless rows) · **`.hide-header`** (no header — common in dashboard widget grids) · `.horizontal-list` (vertical column dividers). Also: **`.sticky-headers`** pins the header on scroll.' } } }

// Vertical-value grid — a fundamentally different LAYOUT (value-left, label-right), used by metric widgets.
export const VerticalValue = () => ({
  data: () => ({ rows: [['74', '%', 'CPU Utilization'], ['12.4', 'GB', 'Memory Used'], ['1.2', 'k req/m', 'Throughput'], ['148', 'ms', 'Avg Latency']] }),
  template: `
    <table class="ds-grid ds-grid-hide-header" style="max-width:320px">
      <tbody>
        <tr v-for="(r, i) in rows" :key="i">
          <td style="text-align:right;width:55%"><span class="font-600" style="font-size:18px">{{ r[0] }}</span> <span class="text-neutral-light" style="font-size:11px">{{ r[1] }}</span></td>
          <td class="text-neutral-light">{{ r[2] }}</td>
        </tr>
      </tbody>
    </table>`,
})
VerticalValue.storyName = 'Layout: vertical-value grid (metric widgets)'
VerticalValue.parameters = { docs: { description: { story: 'A fundamentally different **layout** (`vertical-value-grid.vue`) — each row is a **prominent value (left, right-aligned, number + unit)** + its **label (right)**, no column header. Used by **metric / KPI widgets** on dashboards. Same grid plumbing, transposed presentation.' } } }

// Key-value (transposed) grid — columns become row labels; a single record's detail view.
export const KeyValue = () => ({
  components: { MStatusTag },
  data: () => ({ pairs: [['Monitor', 'web-server-01'], ['IP Address', '10.0.0.12'], ['Type', 'Linux Server'], ['Vendor', 'Cisco'], ['Uptime', '42 days']] }),
  template: `
    <table class="ds-grid" style="max-width:380px">
      <tbody>
        <tr v-for="(p, i) in pairs" :key="i">
          <td class="ds-grid-tinted font-500" style="width:40%;background:var(--grid-header-bg)">{{ p[0] }}</td>
          <td>{{ p[1] }}</td>
        </tr>
      </tbody>
    </table>`,
})
KeyValue.storyName = 'Layout: key-value (transposed) grid'
KeyValue.parameters = { docs: { description: { story: 'A **transposed** grid (`column-grid-view.vue` / `overview-layout.vue`) — **columns become row labels** (tinted left cell) with the record\'s value on the right. A single-record **detail view** rendered through the same grid, common in widget overviews and detail panels.' } } }

// Color-coded cells — threshold-driven cell backgrounds (color-coded-cell.vue) + relative-percent bars.
export const ColorCodedCells = () => ({
  data: () => ({ rows: [
    { name: 'web-server-01', cpu: '94%', cpuC: 'var(--severity-critical)', mem: '72%', memC: 'var(--severity-warning)', disk: 45 },
    { name: 'db-primary', cpu: '38%', cpuC: 'var(--severity-clear)', mem: '61%', memC: 'var(--severity-major)', disk: 80 },
    { name: 'cache-02', cpu: '12%', cpuC: 'var(--severity-clear)', mem: '20%', memC: 'var(--severity-clear)', disk: 22 },
  ] }),
  template: `
    <table class="ds-grid">
      <thead><tr><th>Monitor</th><th>CPU</th><th>Memory</th><th>Disk usage</th></tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.name">
          <td class="font-500">{{ r.name }}</td>
          <td :style="{ background: r.cpuC, color:'var(--white-regular)', fontWeight:600, textAlign:'center' }">{{ r.cpu }}</td>
          <td :style="{ background: r.memC, color:'var(--white-regular)', fontWeight:600, textAlign:'center' }">{{ r.mem }}</td>
          <td>
            <div class="flex items-center"><div style="flex:1;height:6px;border-radius:3px;background:var(--neutral-lighter);overflow:hidden;margin-right:8px"><div :style="{ width: r.disk+'%', height:'100%', background: r.disk>70 ? 'var(--severity-major)' : 'var(--primary-alt)' }"></div></div><span style="font-size:11px">{{ r.disk }}%</span></div>
          </td>
        </tr>
      </tbody>
    </table>`,
})
ColorCodedCells.storyName = 'Cells: color-coded + relative-percent'
ColorCodedCells.parameters = { docs: { description: { story: 'Threshold-driven cell rendering (`color-coded-cell.vue`, `relative-percent.vue`) — a cell\'s **background** (or text) is set from a `__color_<key>` flag (a heatmap-style severity fill), and `relative-percent` cells show an **inline progress bar**. Common in dashboard widget grids (CPU/memory/disk by severity).' } } }

// Inline editing — FlotoPaginatedCrud :inline-editing — cells become inputs with save/cancel.
export const InlineEditing = () => ({
  components: { MStatusTag },
  data: () => ({ rows: ROWS.slice(0, 3), editing: 2, draftName: 'db-primary', draftInt: '60' }),
  template: `
    <table class="ds-grid">
      <thead><tr><th>Name</th><th>Interval</th><th style="width:90px"></th></tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <template v-if="editing===r.id">
            <td><MInput :value="draftName" @update="draftName=$event" /></td>
            <td><MInput :value="draftInt" @update="draftInt=$event" type="number" /></td>
            <td><a class="text-primary cursor-pointer mr-2" @click="editing=-1">Save</a><a class="text-neutral-light cursor-pointer" @click="editing=-1">Cancel</a></td>
          </template>
          <template v-else>
            <td class="font-500">{{ r.name }}</td>
            <td>30s</td>
            <td><a class="text-neutral-light cursor-pointer" @click="editing=r.id"><MIcon name="pencil" /></a></td>
          </template>
        </tr>
      </tbody>
    </table>`,
})
InlineEditing.storyName = 'Mode: inline editing (FlotoPaginatedCrud)'
InlineEditing.parameters = { docs: { description: { story: '`FlotoPaginatedCrud :inline-editing` (13×) — instead of a drawer form, the row\'s cells become **inputs edited in place**, with **Save / Cancel** and `MValidationObserver` validation. Click the **pencil** to edit a row.' } } }

// Tree / hierarchical grid — expandable MGrid where the detail row is nested child rows
// (tabular-oid-selector.vue, .tabular-content-grid). Chevron + indentation per level.
export const TreeGrid = () => ({
  data: () => ({ open: { 1: true, 11: true }, tree: [
    { id: 1, name: 'interfaces', type: 'group', access: '—', lvl: 0, kids: [
      { id: 11, name: 'ifTable', type: 'table', access: 'not-accessible', lvl: 1, kids: [
        { id: 111, name: 'ifIndex', type: 'Integer32', access: 'read-only', lvl: 2 },
        { id: 112, name: 'ifDescr', type: 'OCTET STRING', access: 'read-only', lvl: 2 },
      ] },
      { id: 12, name: 'ifNumber', type: 'Integer32', access: 'read-only', lvl: 1 },
    ] },
  ] }),
  methods: {
    toggle(id) { this.open = { ...this.open, [id]: !this.open[id] } },
    flat(nodes, out) { (nodes || []).forEach(n => { out.push(n); if (n.kids && this.open[n.id]) this.flat(n.kids, out) }); return out },
  },
  computed: { rows() { return this.flat(this.tree, []) } },
  template: `
    <table class="ds-grid">
      <thead><tr><th>OID / object</th><th>Syntax</th><th>Access</th></tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td>
            <span :style="{ paddingLeft: (r.lvl * 20) + 'px' }" class="inline-flex items-center">
              <MIcon v-if="r.kids" :name="open[r.id] ? 'chevron-down' : 'chevron-right'" class="mr-2 text-neutral-light cursor-pointer" @click="toggle(r.id)" />
              <span v-else style="width:22px;display:inline-block"></span>
              <span class="font-500">{{ r.name }}</span>
            </span>
          </td>
          <td class="text-neutral-light">{{ r.type }}</td>
          <td class="text-neutral-light">{{ r.access }}</td>
        </tr>
      </tbody>
    </table>`,
})
TreeGrid.storyName = 'Variant: tree / hierarchical grid'
TreeGrid.parameters = { docs: { description: { story: 'A **tree / hierarchical** grid (`tabular-oid-selector.vue`, `.tabular-content-grid`) — an `expandable` MGrid whose **`detailRow` slot renders nested child rows**. Each node with children shows a **chevron**; expanding **indents** the children (per level). Used for **SNMP OID / MIB trees**, grouped hierarchies. Click a chevron.' } } }

// Pivot / report grid — grouped report with a merged group-header row (report-pivot-group-header,
// larger 1rem font) spanning the columns, then the grouped metric rows.
export const PivotGrid = () => ({
  data: () => ({ groups: [
    { name: 'Production', rows: [['Availability', '99.92%', '99.88%', '99.95%'], ['Avg response', '142 ms', '156 ms', '138 ms']] },
    { name: 'Staging', rows: [['Availability', '98.40%', '97.10%', '99.02%'], ['Avg response', '210 ms', '198 ms', '205 ms']] },
  ] }),
  template: `
    <table class="ds-grid">
      <thead><tr><th>Metric</th><th>Jan</th><th>Feb</th><th>Mar</th></tr></thead>
      <tbody>
        <template v-for="g in groups">
          <tr :key="g.name" class="ds-grid-group">
            <td colspan="4" style="font-size:1rem">{{ g.name }}</td>
          </tr>
          <tr v-for="(r, i) in g.rows" :key="g.name+i">
            <td class="font-500" style="padding-left:28px">{{ r[0] }}</td>
            <td>{{ r[1] }}</td><td>{{ r[2] }}</td><td>{{ r[3] }}</td>
          </tr>
        </template>
      </tbody>
    </table>`,
})
PivotGrid.storyName = 'Variant: pivot / report grid'
PivotGrid.parameters = { docs: { description: { story: 'A **pivot / report** grid (`pivot-table.vue`, `.report-pivot-group-header`) — metrics **grouped** by a dimension, with a **merged group-header row** (spanning the columns, larger **1rem** font) above each group\'s rows. Used for **report widgets** (availability/response by group × time). Same chrome, a transposed/grouped report shape.' } } }

export const DisabledSelection = () => ({
  components: { MStatusTag },
  data: () => ({ rows: ROWS, selected: [1], locked: [3, 4] }),
  methods: {
    toggle(id) { if (this.locked.includes(id)) return; this.selected = this.selected.includes(id) ? this.selected.filter((x) => x !== id) : [...this.selected, id] },
  },
  template: `
    <div>
      <div class="text-neutral-light mb-3" style="font-size:12px"><code>selection-disabled-items</code> locks specific rows from selection (e.g. system/in-use objects) while keeping them visible — their checkbox is disabled.</div>
      <table class="ds-grid">
        <thead><tr><th style="width:40px"></th><th>Name</th><th>Status</th><th>IP Address</th></tr></thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" :class="{ 'ds-grid-row-selected': selected.includes(r.id) }" :style="{ opacity: locked.includes(r.id) ? 0.55 : 1 }">
            <td><MCheckbox :checked="selected.includes(r.id)" :disabled="locked.includes(r.id)" @change="toggle(r.id)" /></td>
            <td class="font-500">{{ r.name }}</td>
            <td><MStatusTag :status="r.status" /></td>
            <td>{{ r.ip }}</td>
          </tr>
        </tbody>
      </table>
    </div>`,
})
DisabledSelection.storyName = 'Selection: disabled (locked) rows'
DisabledSelection.parameters = { docs: { description: { story: 'The **`selection-disabled-items`** behaviour — specific rows are **locked from selection** (checkbox disabled, row dimmed) while still shown. Used for system-owned or in-use objects that cannot be bulk-acted on.' } } }

export const SortedColumn = () => ({
  components: { MStatusTag },
  data: () => ({ rows: [...ROWS].sort((a, b) => a.name.localeCompare(b.name)) }),
  template: `
    <div>
      <div class="text-neutral-light mb-3" style="font-size:12px"><code>default-sort</code> sets the initial sort — the sorted column header shows the active <strong>↑/↓</strong> indicator and the rows are ordered by it on load. Click headers to re-sort in the product.</div>
      <table class="ds-grid">
        <thead><tr>
          <th><span class="flex items-center" style="gap:6px;color:var(--primary)">Name <MIcon name="long-arrow-up" style="font-size:11px" /></span></th>
          <th>Status</th><th>IP Address</th><th>Last Poll</th>
        </tr></thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td class="font-500">{{ r.name }}</td>
            <td><MStatusTag :status="r.status" /></td>
            <td>{{ r.ip }}</td>
            <td class="text-neutral-light">{{ r.poll }}</td>
          </tr>
        </tbody>
      </table>
    </div>`,
})
SortedColumn.storyName = 'Sort: default-sorted column'
SortedColumn.parameters = { docs: { description: { story: 'A column with an **initial `default-sort`** — the active column header shows the **↑ (ascending)** indicator in `--primary` and the rows load ordered by it. Clicking a header re-sorts (and toggles ↑/↓) in the live grid.' } } }

Basic.parameters = { ...(Basic.parameters || {}), controls: { disable: true } }
DisabledSelection.parameters = { ...(DisabledSelection.parameters || {}), controls: { disable: true } }
SortedColumn.parameters = { ...(SortedColumn.parameters || {}), controls: { disable: true } }
TreeGrid.parameters = { ...(TreeGrid.parameters || {}), controls: { disable: true } }
PivotGrid.parameters = { ...(PivotGrid.parameters || {}), controls: { disable: true } }
ColorCodedCells.parameters = { ...(ColorCodedCells.parameters || {}), controls: { disable: true } }
InlineEditing.parameters = { ...(InlineEditing.parameters || {}), controls: { disable: true } }
HeaderStyles.parameters = { ...(HeaderStyles.parameters || {}), controls: { disable: true } }
StyleVariants.parameters = { ...(StyleVariants.parameters || {}), controls: { disable: true } }
VerticalValue.parameters = { ...(VerticalValue.parameters || {}), controls: { disable: true } }
KeyValue.parameters = { ...(KeyValue.parameters || {}), controls: { disable: true } }
Selectable.parameters = { ...(Selectable.parameters || {}), controls: { disable: true } }
Expandable.parameters = { ...(Expandable.parameters || {}), controls: { disable: true } }
CellTypes.parameters = { ...(CellTypes.parameters || {}), controls: { disable: true } }
Grouping.parameters = { ...(Grouping.parameters || {}), controls: { disable: true } }
EmptyState.parameters = { ...(EmptyState.parameters || {}), controls: { disable: true } }
Loading.parameters = { ...(Loading.parameters || {}), controls: { disable: true } }
Pagination.parameters = { ...(Pagination.parameters || {}), controls: { disable: true } }
