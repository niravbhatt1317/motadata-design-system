export default { title: 'Molecules/Menu/Examples' }

// Shared action set (icon + label; danger renders red, positive renders green).
const ACTIONS = [
  { k: 'edit', n: 'Edit', i: 'pencil' },
  { k: 'duplicate', n: 'Duplicate', i: 'copy' },
  { k: 'export', n: 'Export', i: 'download' },
  { k: 'divider', divider: true },
  { k: 'delete', n: 'Delete', i: 'trash-alt', danger: true },
]

function itemColor(item, active) {
  if (item.danger) return 'var(--secondary-red)'
  if (item.green) return 'var(--secondary-green)'
  if (active) return 'var(--primary)'
  return 'var(--page-text-color)'
}

// 1. Menu (the MMenu primitive) — the bare list of selectable items.
export const Menu = () => ({
  data: () => ({ items: ACTIONS, active: 'edit', hover: '' }),
  methods: { itemColor },
  template: `
    <div style="color:var(--page-text-color);max-width:420px">
      <div class="text-neutral-light mb-4" style="font-size:12px">The <code>MMenu</code> primitive — a vertical list of <code>MMenuItem</code>s (icon + label), with <code>MMenuDivider</code> and danger/positive item colours. The building block under Primary nav, Side menu, the dropdown picker and the action menu.</div>
      <div style="width:208px;padding:6px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 6px 20px var(--neutral-shadow-light)">
        <template v-for="item in items">
          <div v-if="item.divider" :key="item.k" style="height:1px;margin:6px 4px;background:var(--border-color)"></div>
          <a v-else :key="item.k" class="flex items-center cursor-pointer"
            @click="active=item.k" @mouseenter="hover=item.k" @mouseleave="hover=''"
            style="height:34px;padding:0 10px;gap:10px;border-radius:6px;text-decoration:none;font-size:13px"
            :style="{ color: itemColor(item, active===item.k), background: active===item.k ? 'var(--code-tag-background-color)' : (hover===item.k ? 'var(--neutral-lighter)' : 'transparent') }">
            <MIcon :name="item.i" size="sm" style="flex-shrink:0" />
            <span>{{ item.n }}</span>
          </a>
        </template>
      </div>
    </div>`,
})
Menu.parameters = { controls: { disable: true }, docs: { description: { story: 'The **Menu** primitive (`MMenu` + `MMenuItem` + `MMenuDivider`) — a vertical list of selectable rows (icon + label), with **hover** (`--neutral-lighter`), **selected** (`--primary` on `--code-tag-background-color`), **divider** (`--border-color`) and **danger** (`--secondary-red`) / **positive** (`--secondary-green`) item colours. It is the shared building block beneath **Primary nav**, **Side menu**, the **Dropdown picker** and the **Context/Action menu** — catalogued here in its own right. Hover and click the rows.' } } }

// 2. Context / Action menu (FlotoGridActions) — a "⋯" trigger opening an MMenu of actions.
export const ContextMenu = () => ({
  data: () => ({ items: ACTIONS, open: false, hover: '' }),
  methods: {
    itemColor,
    pick() { this.open = false },
  },
  template: `
    <div style="color:var(--page-text-color);max-width:560px">
      <div class="text-neutral-light mb-4" style="font-size:12px">The <strong>context / action menu</strong> (<code>_base-grid-actions.vue</code>, <code>FlotoGridActions</code>) — an <code>MPopover</code> triggered by an <strong>ellipsis-v "⋯"</strong> icon, opening an <code>MMenu</code> of <em>actions</em> (not a value picker). Also the kit <code>MDropdown</code> options menu. Click the ⋯.</div>
      <div class="flex items-center justify-between" style="padding:10px 14px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px">
        <div class="flex items-center" style="gap:10px">
          <MIcon name="navbar-monitor" size="lg" class="text-neutral-light" />
          <span style="font-size:13px">core-switch-01.lab</span>
        </div>
        <div style="position:relative">
          <a class="flex items-center justify-center cursor-pointer text-neutral-light" @click="open=!open"
            style="width:28px;height:28px;border-radius:6px" :style="{ background: open ? 'var(--neutral-lighter)' : 'transparent' }">
            <MIcon name="ellipsis-v" />
          </a>
          <div v-if="open" style="position:absolute;top:34px;right:0;z-index:5;width:188px;padding:6px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 6px 20px var(--neutral-shadow-light)">
            <template v-for="item in items">
              <div v-if="item.divider" :key="item.k" style="height:1px;margin:6px 4px;background:var(--border-color)"></div>
              <a v-else :key="item.k" class="flex items-center cursor-pointer" @click="pick()" @mouseenter="hover=item.k" @mouseleave="hover=''"
                style="height:34px;padding:0 10px;gap:10px;border-radius:6px;text-decoration:none;font-size:13px"
                :style="{ color: itemColor(item, false), background: hover===item.k ? 'var(--neutral-lighter)' : 'transparent' }">
                <MIcon :name="item.i" size="sm" style="flex-shrink:0" />
                <span>{{ item.n }}</span>
              </a>
            </template>
          </div>
        </div>
      </div>
      <div v-if="open" @click="open=false" style="position:fixed;inset:0;z-index:4"></div>
    </div>`,
})
ContextMenu.parameters = { controls: { disable: true }, docs: { description: { story: 'The **context / action menu** — the `FlotoGridActions` (`_base-grid-actions.vue`) pattern: an `MPopover` (placement `bottomRight`) triggered by an **ellipsis-v "⋯"** icon, opening an `MMenu` of **action** items (icon + label; **danger** in `--secondary-red`, **positive** in `--secondary-green`; dividers; permission-gated). The single `MDropdown` usage (rich-text editor table options) is the same shape. This is an **action surface** ("do something"), distinct from the **Dropdown picker** / **Select** (pick a value) and from **Navigation** (go somewhere). Click the ⋯ to open.' } } }
