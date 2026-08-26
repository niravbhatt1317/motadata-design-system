// Molecules / Popover — MPopover (@motadata/ui, 35×) wraps Ant `a-popover`: a click-triggered
// floating PANEL anchored to a trigger, with interactive content (unlike a tooltip). Slots:
// `trigger` · `title` (optional) · default (content) — each gets `{ hide, show, toggle }`.
// Props: trigger (default 'click') · placement (default 'bottom') · overlayClassName · overlayStyle
// · destroyTooltipOnHide (default true). MPopper (_base-popper.vue) is the lower-level v-popover
// positioning primitive that powers FlotoDropdownPicker — documented here, rarely used directly.

export default {
  title: 'Molecules/Popover/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Molecule — a **click-triggered floating panel** (`MPopover`, 35×) wrapping Ant `a-popover`. Unlike a **Tooltip** (hover, non-interactive), a Popover holds **interactive content** — action menus, pickers, mini-forms. Slots: **`trigger`** · optional **`title`** · default (content), each receiving **`{ hide, show, toggle }`**. `trigger` defaults to **`click`**, `placement` to **`bottom`**. The low-level **`MPopper`** (the picker positioning engine) is the same family.',
      },
    },
  },
  argTypes: {
    // MPopover uses ANT placement names (bottomLeft/bottomRight/leftTop…), unlike MTooltip's
    // VTippy names (top-start…). Real product distribution: bottomLeft 11× · bottomRight 9× ·
    // bottom 7× · leftTop 4× · top/right 1× each.
    placement: { control: 'select', options: ['bottom', 'bottomLeft', 'bottomRight', 'leftTop', 'top', 'left', 'right'] },
    trigger: { control: 'select', options: ['click', 'hover'] },
  },
  args: { placement: 'bottomLeft', trigger: 'click' },
}

// Basic: a click panel with a title + content. The default slot gets { hide } to dismiss.
export const Basic = () => ({
  template: `
    <div style="padding:40px">
      <MPopover placement="bottom">
        <template v-slot:trigger><MButton>Details</MButton></template>
        <template v-slot:title>web-server-01</template>
        <template v-slot:default="{ hide }">
          <div style="min-width:220px;color:var(--page-text-color)">
            <div style="font-size:12px;margin-bottom:8px">IP 10.0.0.12 · Up · 30s interval</div>
            <MButton variant="default" size="small" @click="hide">Close</MButton>
          </div>
        </template>
      </MPopover>
    </div>`,
})
Basic.parameters = { docs: { description: { story: 'A **click** popover with an optional **`title`** and interactive content. The slots receive **`{ hide, show, toggle }`** — here the Close button calls `hide()`. Click **Details**.' } } }

// Widget-header kebab — FlotoGridActions in widget-title.vue. KEY layout detail: picker-action-dropdown
// positions the panel to OVERLAP its own trigger (.ant-popover-inner { top:-40px } + ul.action-dropdown
// { padding-top:30px }), so the ⋮ trigger ends up at the TOP-RIGHT of the opened panel and the items
// list BELOW it (see the product screenshot). Reproduced here: ⋮ at the panel top, items under it.
export const ActionMenu = () => ({
  data: () => ({ open: true, hover: -1, items: [
    { icon: 'pencil', label: 'Edit Widget' },
    { icon: 'clone', label: 'Clone Widget' },
    { icon: 'fullscreen', label: 'Full Screen' },
    { icon: 'share-alt', label: 'Share' },
    { icon: 'times-circle', label: 'Remove Widget', danger: true },
  ] }),
  template: `
    <div style="padding:40px;display:flex;justify-content:flex-end">
      <div style="min-width:230px;background:var(--action-dropdown-backgroud);border:1px solid var(--border-color);border-radius:6px;box-shadow:0 6px 20px var(--neutral-shadow-light);overflow:hidden">
        <div style="display:flex;justify-content:flex-end;padding:8px 14px 2px">
          <a class="text-neutral-light cursor-pointer" @click="open=!open"><MIcon name="ellipsis-v" /></a>
        </div>
        <div v-if="open" style="padding-bottom:6px">
          <div v-for="(a, i) in items" :key="i" class="flex items-center cursor-pointer" style="padding:9px 18px;line-height:22px"
            :style="{ color: a.danger ? 'var(--secondary-red)' : 'var(--action-dropdown-text)', background: hover===i ? 'var(--action-dropdown-hover-bg)' : 'transparent' }"
            @mouseenter="hover=i" @mouseleave="hover=-1">
            <MIcon :name="a.icon" class="mr-2" /><span>{{ a.label }}</span>
          </div>
        </div>
      </div>
    </div>`,
})
ActionMenu.storyName = 'Kebab — widget header (Edit / Clone / Full Screen / Share / Remove)'
ActionMenu.parameters = { docs: { description: { story: 'The **widget-header kebab** (`widget-title.vue` → `FlotoGridActions`). **Not a different kind of kebab** — it\'s the same `picker-action-dropdown` menu, but its CSS positions the panel to **overlap its own `⋮` trigger** (`.ant-popover-inner { top:-40px }` + `ul.action-dropdown { padding-top:30px }`), so the **`⋮` sits at the top-right of the opened panel and the items list below it**. Real items: **Edit Widget · Clone Widget · Full Screen · Share · Remove Widget** (red, `isDanger`); data widgets also get **Export as CSV**. Surface = `--action-dropdown-*` tokens.' } } }

// Grid-row actions kebab — the 89x canonical FlotoGridActions: edit/clone + a DIVIDER + a red Delete
// (isDanger -> text-secondary-red). Same picker-action-dropdown surface + ⋮-overlaps-panel-top layout;
// different item set + divider. (Layout note: same as the widget kebab — ⋮ at the top of the panel.)
export const GridRowActions = () => ({
  data: () => ({ open: true, hover: -1, items: [{ icon: 'pencil', label: 'Edit' }, { icon: 'clone', label: 'Clone' }, { icon: 'file-times', label: 'Disable' }, { divider: true }, { icon: 'trash-alt', label: 'Delete', danger: true }] }),
  template: `
    <div style="padding:40px;display:flex;justify-content:flex-end">
      <div style="min-width:180px;background:var(--action-dropdown-backgroud);border:1px solid var(--border-color);border-radius:6px;box-shadow:0 6px 20px var(--neutral-shadow-light);overflow:hidden">
        <div style="display:flex;justify-content:flex-end;padding:8px 14px 2px"><a class="text-neutral-light cursor-pointer" @click="open=!open"><MIcon name="ellipsis-v" /></a></div>
        <div v-if="open" style="padding-bottom:6px">
          <template v-for="(a, i) in items">
            <div v-if="a.divider" :key="'d'+i" style="height:1px;margin:4px 0;background:var(--border-color)"></div>
            <div v-else :key="i" class="flex items-center cursor-pointer" style="padding:9px 18px;line-height:22px"
              :style="{ color: a.danger ? 'var(--secondary-red)' : 'var(--action-dropdown-text)', background: hover===i ? 'var(--action-dropdown-hover-bg)' : 'transparent' }"
              @mouseenter="hover=i" @mouseleave="hover=-1">
              <MIcon :name="a.icon" class="mr-2" /><span>{{ a.label }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>`,
})
GridRowActions.storyName = 'Kebab — grid row (edit / clone / delete)'
GridRowActions.parameters = { docs: { description: { story: 'The **canonical grid-row kebab** (`FlotoGridActions`, **89×** — the most common). **Same** `picker-action-dropdown` mechanism + the **⋮-at-top-of-panel** layout as the widget kebab, but the real CRUD item set: **Edit** (`pencil`) · **Clone** (`clone`) · **Disable** (`file-times`) · a **divider** · **Delete** in **red** (`isDanger` → `text-secondary-red`). The divider + danger item is what distinguishes it from the widget kebab — *not* the trigger position (that\'s shared).' } } }

// Bulk action bar — _base-bulk-action-bar.vue: a floating selection toolbar (checkbox + "N selected"
// + inline primary/danger buttons + a "More" overflow kebab using overlay-class bulk-action-bar-more).
export const BulkActionBar = () => ({
  data: () => ({ hover: -1, more: [{ icon: 'schedule', label: 'Schedule' }, { icon: 'export-csv', label: 'Export' }] }),
  template: `
    <div style="padding:40px;display:flex;justify-content:center">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 8px 24px var(--neutral-shadow-light);color:var(--page-text-color)">
        <MCheckbox :checked="true" /><span class="font-500" style="margin-right:4px">3 items selected</span>
        <button type="button" class="flex items-center" style="padding:6px 10px;border:none;background:transparent;color:var(--page-text-color);cursor:pointer"><MIcon name="monitor-enable" class="mr-2" />Enable</button>
        <button type="button" class="flex items-center" style="padding:6px 10px;border:none;background:transparent;color:var(--page-text-color);cursor:pointer"><MIcon name="monitor-disable" class="mr-2" />Disable</button>
        <button type="button" class="flex items-center" style="padding:6px 10px;border:none;background:transparent;color:var(--secondary-red);cursor:pointer"><MIcon name="trash-alt" class="mr-2" />Delete</button>
        <span style="width:1px;height:20px;background:var(--border-color)"></span>
        <MPopover placement="topRight" transition-name="slide-up" overlay-class-name="picker-action-dropdown bulk-action-bar-more">
          <template v-slot:trigger="{ toggle }"><a class="text-neutral-light px-2 cursor-pointer" @click="toggle">More <MIcon name="ellipsis-v" /></a></template>
          <template v-slot:default="{ hide }">
            <div style="min-width:160px;padding:5px 0;background:var(--action-dropdown-backgroud);border:1px solid var(--border-color);border-radius:6px;box-shadow:0 6px 20px var(--neutral-shadow-light);overflow:hidden">
              <div v-for="(a,i) in more" :key="i" class="flex items-center cursor-pointer" style="padding:9px 18px" :style="{ color:'var(--action-dropdown-text)', background: hover===i ? 'var(--action-dropdown-hover-bg)' : 'transparent' }" @mouseenter="hover=i" @mouseleave="hover=-1" @click="hide"><MIcon :name="a.icon" class="mr-2" />{{ a.label }}</div>
            </div>
          </template>
        </MPopover>
      </div>
    </div>`,
})
BulkActionBar.storyName = 'Kebab — bulk action bar (selection toolbar)'
BulkActionBar.parameters = { docs: { description: { story: 'The **bulk-action bar** (`_base-bulk-action-bar.vue`) — a **floating selection toolbar** that appears when rows are selected: a checkbox + **"N items selected"**, inline **primary** action buttons + a **danger** Delete, then a **divider** and a **"More" overflow kebab** (`FlotoGridActions` with `overlay-class-name="picker-action-dropdown bulk-action-bar-more"`, placement `topRight` since the bar floats at the bottom). A different *trigger context* than the row kebab — actions apply to the **selection**, not one row.' } } }

// Rich panel — color-picker.vue pattern: a swatch trigger opening a picker panel.
export const RichPanel = () => ({
  data: () => ({ color: 'var(--primary-alt)', swatches: ['#099dd9', '#36d576', '#fa9950', '#ec5b5b', '#7186a8'] }),
  template: `
    <div style="padding:40px">
      <MPopover trigger="click" placement="bottom" overlay-class-name="color-picker-popover">
        <template v-slot:trigger>
          <div class="inline-flex items-center cursor-pointer" style="gap:8px">
            <span :style="{ background: color, width:'20px', height:'20px', borderRadius:'4px', display:'inline-block', border:'1px solid var(--border-color)' }"></span>
            <span style="color:var(--page-text-color)">Pick color</span>
          </div>
        </template>
        <template v-slot:default="{ hide }">
          <div style="display:flex;gap:8px">
            <span v-for="s in swatches" :key="s" :style="{ background:s, width:'24px', height:'24px', borderRadius:'4px', cursor:'pointer', border:'1px solid var(--border-color)' }" @click="color = s; hide()"></span>
          </div>
        </template>
      </MPopover>
    </div>`,
})
RichPanel.storyName = 'Pattern: rich panel (color picker)'
RichPanel.parameters = { docs: { description: { story: 'A **rich interactive panel** — the `color-picker.vue` pattern (`overlay-class-name="color-picker-popover"`): a swatch trigger opening a picker. Popovers host pickers, mini-forms, and date/time pickers — content the user interacts with before dismissing.' } } }

// Hover trigger — 13× in the product (e.g. the tags-list "+N overflow" reveal). Opens on hover,
// not click; often paired with transition-name="slide-up".
export const HoverTrigger = () => ({
  data: () => ({ extra: ['os_name: Ubuntu 22.04', 'region: us-east', 'env: prod'] }),
  template: `
    <div style="padding:40px">
      <MPopover trigger="hover" placement="bottom" transition-name="slide-up">
        <template v-slot:trigger>
          <MTag :rounded="true" :closable="false" class="used-count-pill" style="cursor:default">+3</MTag>
        </template>
        <div style="min-width:200px;color:var(--page-text-color)">
          <div v-for="t in extra" :key="t" style="font-size:12px;padding:2px 0">{{ t }}</div>
        </div>
      </MPopover>
    </div>`,
})
HoverTrigger.storyName = 'Behavior: hover trigger (+N overflow)'
HoverTrigger.parameters = { docs: { description: { story: '`trigger="hover"` (13× in the product) opens the panel on **hover**, not click — the **"+N overflow"** reveal (e.g. `tags-list.vue`: a `+3` pill that reveals the hidden items). Commonly paired with **`transition-name="slide-up"`**. Hover the **+3** pill.' } } }

// Placement — MPopover uses Ant placement names. Real distribution favors bottomLeft / bottomRight.
export const Placements = () => ({
  data: () => ({ places: ['bottomLeft', 'bottomRight', 'leftTop', 'top'] }),
  template: `
    <div style="display:flex;gap:40px;padding:80px">
      <MPopover v-for="p in places" :key="p" :placement="p">
        <template v-slot:trigger><MButton variant="default">{{ p }}</MButton></template>
        <div style="min-width:140px;color:var(--page-text-color);font-size:12px">Anchored {{ p }}.</div>
      </MPopover>
    </div>`,
})
Placements.parameters = { docs: { description: { story: 'MPopover uses **Ant** placement names (note: different from the Tooltip\'s VTippy names). The product\'s real distribution: **`bottomLeft`** (11×, most common) · **`bottomRight`** (9×) · `bottom` (7×) · **`leftTop`** (4×) · `top`/`right` (1× each). Default is `bottom`. Click each.' } } }

export const Playground = (args) => ({
  props: Object.keys(args),
  template: `
    <div style="padding:60px">
      <MPopover :placement="placement" :trigger="trigger">
        <template v-slot:trigger><MButton>Open popover</MButton></template>
        <template v-slot:title>Popover</template>
        <div style="min-width:200px;color:var(--page-text-color);font-size:12px">trigger: {{ trigger }} · placement: {{ placement }}</div>
      </MPopover>
    </div>`,
})

Basic.parameters = { ...(Basic.parameters || {}), controls: { disable: true } }
ActionMenu.parameters = { ...(ActionMenu.parameters || {}), controls: { disable: true } }
GridRowActions.parameters = { ...(GridRowActions.parameters || {}), controls: { disable: true } }
BulkActionBar.parameters = { ...(BulkActionBar.parameters || {}), controls: { disable: true } }
RichPanel.parameters = { ...(RichPanel.parameters || {}), controls: { disable: true } }
HoverTrigger.parameters = { ...(HoverTrigger.parameters || {}), controls: { disable: true } }
Placements.parameters = { ...(Placements.parameters || {}), controls: { disable: true } }
