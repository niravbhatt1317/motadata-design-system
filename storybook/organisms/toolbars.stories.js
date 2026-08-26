// Organisms / Toolbars — the product's toolbar compositions, as VARIANTS of one family. A toolbar is
// an organism that arranges molecules/atoms (title, search, filters, actions). The distinct toolbars:
//   • Page header (FlotoPageHeader, 54×) — back + title + right-side actions, atop list/detail pages.
//   • Widget header (widget-title.vue, 58×) — widget title + time-range pill + a kebab of widget actions.
//   • Bulk action bar (_base-bulk-action-bar.vue) — a floating selection toolbar (N selected + actions).
//   • Grid toolbar — search + filter + column-chooser + Add, above a grid (composes Molecules/Filters).
//   • Column chooser (column-selector.vue, 174×) — the eye-button column show/hide dropdown.
// Faithful reproductions with real tokens; built from real MButton/MIcon/MStatusTag/MCheckbox.
import MStatusTag from '@components/_base-status-tag.vue'

const ICON_BTN = 'width:32px;height:32px;border:1px solid var(--border-color);border-radius:4px'
const PILL = 'display:inline-flex;align-items:center;height:18px;padding:0 4px;border-radius:4px;font-size:0.7rem;background:var(--timerange-background-color);color:var(--timerange-text-color)'

export default {
  title: 'Organisms/Toolbars/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Organism — the product\'s **toolbars**, as variants of one family. A toolbar arranges molecules/atoms (title · search · filters · actions). **App header** (`layout/header.vue`) — the **global top bar** (logo · search · health/approval · notifications · user). **Page header** (`FlotoPageHeader`, **54×**) — back + title + right-side actions. **Widget header** (`widget-title`, **58×**) — title + time-range pill + a **kebab** of widget actions. **Bulk action bar** (`_base-bulk-action-bar`) — a floating **N-selected** toolbar with primary + danger actions. **Grid toolbar** — search + filter + column-chooser + Add over a grid (composes **Molecules/Filters**). **Column chooser** (`column-selector.vue`, 174×) — the eye-button column show/hide dropdown. (The left **`FlotoNavBar`** module nav is a separate *navigation* archetype.)',
      },
    },
  },
}

// 0. App header — the GLOBAL top bar (layout/header.vue, `Header`): logo + global search + health /
//    approval + notifications + build tag + user menu. The product's app-shell toolbar.
export const AppHeader = () => ({
  template: `
    <div style="color:var(--page-text-color)">
      <div class="flex items-center justify-between" style="height:50px;padding:0 16px;background:var(--page-background-color);border-bottom:1px solid var(--border-color)">
        <div class="flex items-center font-700" style="font-size:18px;color:var(--primary-alt);letter-spacing:.5px">motadata</div>
        <div class="flex items-center" style="gap:4px">
          <a class="text-neutral-light cursor-pointer inline-flex items-center justify-center" style="width:36px;height:36px;border-radius:50%" title="Search"><MIcon name="search" size="lg" /></a>
          <a class="text-neutral-light cursor-pointer inline-flex items-center justify-center" style="width:36px;height:36px;border-radius:50%" title="Health Monitoring"><MIcon name="health-monitoring" size="lg" /></a>
          <a class="text-neutral-light cursor-pointer inline-flex items-center justify-center" style="width:36px;height:36px;border-radius:50%" title="Approval"><MIcon name="ncm-approval" size="lg" /></a>
          <a class="text-neutral-light cursor-pointer inline-flex items-center justify-center" style="width:36px;height:36px;border-radius:50%;position:relative" title="Notifications"><MIcon name="bell" size="lg" /><span style="position:absolute;top:6px;right:6px;width:14px;height:14px;border-radius:50%;background:var(--secondary-red);color:var(--white-regular);font-size:9px;display:flex;align-items:center;justify-content:center">3</span></a>
          <span class="mx-2" style="display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:4px;font-size:11px;background:var(--timerange-background-color);color:var(--primary)">BUILD : 8.0.0</span>
          <a class="cursor-pointer inline-flex items-center justify-center" style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:var(--white-regular);font-size:12px;font-weight:600" title="Account">NB</a>
        </div>
      </div>
    </div>`,
})
AppHeader.parameters = { controls: { disable: true }, docs: { description: { story: 'The **app header** (`layout/header.vue`, `Header`) — the product\'s **global top bar** (in every authenticated layout). **Left:** the brand **logo** (→ home). **Right:** circle icon-buttons — **global search** (⌘-search), **Health Monitoring**, **Approval** (NCM), the **Notifications** dropdown (bell + count), a **BUILD : version** tag, and the **User** dropdown (avatar → account/logout). Active-route buttons highlight `primary`. The left **`FlotoNavBar`** (vertical module nav) is a separate *navigation* archetype, not a toolbar.' } } }

// 1. Page header — back + title + right-side actions (the 54× list/detail header).
export const PageHeader = () => ({
  template: `
    <div style="color:var(--page-text-color)">
      <div class="flex items-center justify-between" style="padding:8px 0;border-bottom:1px solid var(--border-color)">
        <div class="flex items-center" style="gap:10px;min-width:0">
          <MIcon name="chevron-left" class="text-neutral-light cursor-pointer" />
          <h4 class="mb-0 font-500 text-ellipsis" style="font-size:16px;color:var(--primary-alt)">Monitors</h4>
          <span :style="'${PILL}'" style="height:20px">128</span>
        </div>
        <div class="flex items-center" style="gap:8px">
          <div style="width:220px"><MInput placeholder="Search" :allow-clear="false"><template v-slot:prefix><MIcon name="search" class="text-neutral-light" /></template></MInput></div>
          <a class="text-neutral-light cursor-pointer inline-flex items-center justify-center" style="${ICON_BTN}" title="Export"><MIcon name="download" /></a>
          <MButton variant="primary"><MIcon name="plus" class="mr-1" />Add Monitor</MButton>
        </div>
      </div>
    </div>`,
})
PageHeader.parameters = { controls: { disable: true }, docs: { description: { story: 'The **`FlotoPageHeader`** (**54×**) — the standard list/detail page header: an optional **back button** + the **title** (`--primary-alt`, font-500, with an optional count) on the left, and **actions** (search, export, primary **Add**) on the right via the default slot. Slots: `back-button` · `before/after-title` · `title` · default (actions) · `additional-rows`. Props: `title` · `back-link` · `main-header` · `use-divider`.' } } }

// 2. Widget header — title + time-range pill + kebab of widget actions (the 58× widget chrome).
export const WidgetHeader = () => ({
  data: () => ({ open: false, actions: [
    { k: 'edit', n: 'Edit Widget', i: 'pencil' }, { k: 'clone', n: 'Clone Widget', i: 'clone' },
    { k: 'full', n: 'Full Screen', i: 'expand' }, { k: 'share', n: 'Share', i: 'share-alt' },
    { k: 'csv', n: 'Export as CSV', i: 'download' },
  ] }),
  template: `
    <div style="max-width:420px;color:var(--page-text-color)" @click="open=false">
      <div class="flex justify-between items-center px-2" style="border:1px solid var(--border-color);border-radius:6px 6px 0 0;border-bottom:none;background:var(--common-widget-bg)">
        <div class="font-500 text-ellipsis py-2" style="font-size:14px">CPU Utilization</div>
        <div class="flex items-center" style="gap:8px" @click.stop>
          <span :style="'${PILL}'">24h</span>
          <div style="position:relative">
            <MIcon name="ellipsis-v" class="text-neutral-light cursor-pointer" @click.native="open=!open" />
            <div v-if="open" style="position:absolute;right:0;top:22px;z-index:20;min-width:170px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:6px;box-shadow:0 6px 20px var(--neutral-shadow-light);overflow:hidden">
              <div v-for="a in actions" :key="a.k" class="flex items-center cursor-pointer" style="padding:8px 12px;font-size:13px"><MIcon :name="a.i" class="mr-2 text-neutral-light" />{{ a.n }}</div>
            </div>
          </div>
        </div>
      </div>
      <div style="border:1px solid var(--border-color);border-top:none;border-radius:0 0 6px 6px;height:90px;display:flex;align-items:center;justify-content:center" class="text-neutral-light">— chart —</div>
    </div>`,
})
WidgetHeader.parameters = { controls: { disable: true }, docs: { description: { story: 'The **`widget-title`** header (**58×**) — a widget\'s chrome: the **title** (ellipsis, font-500) on the left, and on the right a **time-range pill** (a `disabled` TimeRangePicker showing the widget\'s window) + a **kebab** (`ellipsis-v` → `FlotoGridActions`) of widget actions: **Edit · Clone · Full Screen · Share · Export as CSV**. Click the ⋮ to open.' } } }

// 3. Bulk action bar — floating selection toolbar (N selected + primary + danger actions).
export const BulkActionBar = () => ({
  template: `
    <div style="color:var(--page-text-color);padding:20px 0;display:flex;justify-content:center">
      <div role="toolbar" aria-label="Bulk actions" class="flex items-center" style="gap:4px;padding:6px 10px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 6px 24px var(--neutral-shadow-light)">
        <MCheckbox :checked="true" class="mr-1" />
        <span class="font-500" style="font-size:13px">3 items selected</span>
        <span style="width:1px;height:20px;margin:0 8px;background:var(--border-color)"></span>
        <button type="button" class="flex items-center" style="background:none;border:0;padding:6px 10px;border-radius:4px;cursor:pointer;color:var(--page-text-color);font-size:13px"><MIcon name="check-circle" class="mr-2 text-neutral-light" />Acknowledge</button>
        <button type="button" class="flex items-center" style="background:none;border:0;padding:6px 10px;border-radius:4px;cursor:pointer;color:var(--page-text-color);font-size:13px"><MIcon name="user" class="mr-2 text-neutral-light" />Assign</button>
        <button type="button" class="flex items-center" style="background:none;border:0;padding:6px 10px;border-radius:4px;cursor:pointer;color:var(--secondary-red);font-size:13px"><MIcon name="trash-alt" class="mr-2" />Delete</button>
        <MIcon name="ellipsis-v" class="text-neutral-light cursor-pointer ml-1" title="More" />
      </div>
    </div>`,
})
BulkActionBar.parameters = { controls: { disable: true }, docs: { description: { story: 'The **`_base-bulk-action-bar`** — a **floating selection toolbar** (`role="toolbar"`) that appears once `selectedCount >= minSelection`. A **clear checkbox** + **"N items selected"**, then inline **primary actions** (Acknowledge, Assign) and **danger actions** (Delete, in `--secondary-red`), with a **"More"** (`ellipsis-v`) overflow. Acts on the *selection*; emits `clear` / `selected`.' } } }

// 4. Grid toolbar — search + filter + column chooser + Add, over a grid (composes Molecules/Filters).
export const GridToolbar = () => ({
  components: { MStatusTag },
  data: () => ({ rows: [
    { id: 1, name: 'web-server-01', status: 'up', ip: '10.0.0.12' },
    { id: 2, name: 'db-primary', status: 'down', ip: '10.0.0.20' },
    { id: 3, name: 'cache-02', status: 'paused', ip: '10.0.0.31' },
  ] }),
  template: `
    <div style="color:var(--page-text-color)">
      <div class="flex items-center justify-between" style="margin-bottom:10px">
        <div style="width:240px"><MInput placeholder="Search" :allow-clear="false"><template v-slot:prefix><MIcon name="search" class="text-neutral-light" /></template></MInput></div>
        <div class="flex items-center" style="gap:8px">
          <a class="text-neutral-light cursor-pointer inline-flex items-center justify-center" style="${ICON_BTN}" title="Filter"><MIcon name="filter" /></a>
          <a class="text-neutral-light cursor-pointer inline-flex items-center justify-center" style="${ICON_BTN}" title="Columns"><MIcon name="eye" /></a>
          <MButton variant="primary"><MIcon name="plus" class="mr-1" />Add Monitor</MButton>
        </div>
      </div>
      <table class="ds-grid">
        <thead><tr><th>Name</th><th>Status</th><th>IP Address</th></tr></thead>
        <tbody><tr v-for="r in rows" :key="r.id"><td class="font-500">{{ r.name }}</td><td><MStatusTag :status="r.status" /></td><td>{{ r.ip }}</td></tr></tbody>
      </table>
    </div>`,
})
GridToolbar.parameters = { controls: { disable: true }, docs: { description: { story: 'The **grid toolbar** in context — a **search** box (left), then **filter** + **column chooser** icon buttons and a primary **Add** action (right), above the grid. A *composition* — the filter button opens the **Filter bar / Filters** (Molecules/Filters); the eye opens the **Column chooser** (below).' } } }

// 5. Column chooser — eye-button dropdown of column checkboxes (174×). Grip drag = a DS enhancement.
export const ColumnChooser = () => ({
  data: () => ({
    cols: [{ n: 'Name', on: true, lock: true }, { n: 'Status', on: true }, { n: 'IP Address', on: true }, { n: 'Last Poll', on: false }, { n: 'Vendor', on: false }, { n: 'Uptime', on: false }],
    dragIdx: null, overIdx: null,
  }),
  methods: {
    onDragStart(i, e) { this.dragIdx = i; if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)) } },
    onDragOver(i) { if (this.dragIdx === null || this.cols[i].lock) return; this.overIdx = i },
    onDrop(i) {
      if (this.dragIdx === null || this.cols[i].lock) return
      const cols = [...this.cols]
      const [moved] = cols.splice(this.dragIdx, 1)
      cols.splice(i, 0, moved)
      this.cols = cols
      this.dragIdx = this.overIdx = null
    },
    onDragEnd() { this.dragIdx = this.overIdx = null },
  },
  template: `
    <div style="display:flex;justify-content:flex-end;padding-bottom:160px">
      <div style="position:relative">
        <a class="text-neutral-light cursor-pointer inline-flex items-center justify-center" style="${ICON_BTN}" title="Show / hide columns"><MIcon name="eye" /></a>
        <div style="position:absolute;right:0;top:38px;min-width:220px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:6px;box-shadow:0 6px 20px var(--neutral-shadow-light);overflow:hidden;color:var(--page-text-color)">
          <div class="text-neutral-light" style="padding:8px 12px;font-size:11px;border-bottom:1px solid var(--border-color)">COLUMNS</div>
          <div v-for="(c, i) in cols" :key="c.n" class="flex items-center"
            :draggable="!c.lock"
            :style="{ padding:'7px 12px', fontSize:'13px', cursor: c.lock ? 'default' : 'pointer', opacity: dragIdx===i ? 0.4 : 1, borderTop: overIdx===i && dragIdx!==i ? '2px solid var(--primary)' : '2px solid transparent', background: overIdx===i && dragIdx!==i ? 'var(--neutral-lighter)' : 'transparent' }"
            @click="!c.lock && (c.on = !c.on)"
            @dragstart="onDragStart(i, $event)"
            @dragover.prevent="onDragOver(i)"
            @drop.prevent="onDrop(i)"
            @dragend="onDragEnd">
            <svg width="10" height="14" viewBox="0 0 10 14" class="mr-2" :style="{ opacity: c.lock ? 0.15 : 0.4, cursor: c.lock ? 'default' : 'grab' }" @click.stop><circle cx="3" cy="3" r="1"/><circle cx="7" cy="3" r="1"/><circle cx="3" cy="7" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="3" cy="11" r="1"/><circle cx="7" cy="11" r="1"/></svg>
            <MCheckbox :checked="c.on" :disabled="c.lock" class="mr-2" />
            <span>{{ c.n }}</span>
          </div>
          <div class="flex items-center text-neutral-light cursor-pointer" style="padding:8px 12px;font-size:12px;border-top:1px solid var(--border-color)" @click="cols = cols.map(c => ({ ...c, on: !c.lock ? true : c.on }))"><MIcon name="unlock-alt" class="mr-2" />Reset Column Preference</div>
        </div>
      </div>
    </div>`,
})
ColumnChooser.parameters = { controls: { disable: true }, docs: { description: { story: 'The **column chooser** (`column-selector.vue`, **174×** `@column-change`) — an **eye** button opening a dropdown of **column checkboxes** (show/hide; a locked column can\'t be hidden) + **Reset Column Preference**. **⚠️ Fidelity:** the *product* chooser is **show/hide only** — column **reordering** is by **dragging the grid headers** (Table → Basic); the grip-drag here is a **DS enhancement** (functional; locked column pinned).' } } }
