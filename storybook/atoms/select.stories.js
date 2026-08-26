// Atoms / Select — MSelect (@motadata/ui), wraps Ant a-select.
// ⚠️ LOW-USE: only 2× directly in the product (both mode="tags" tag inputs). The product's
// standard select is FlotoDropdownPicker (510×) — use that. MSelect is the low-level kit
// primitive; documented for completeness. v-model is value/change. Modes: default/multiple/tags.
// NOTE: MSelect's clear-all "×" is broken (blank icon + overlaps the chevron — F4/F5), so the
// showcase stories don't use allow-clear; removal is shown via the working chip "×".

const OPTIONS = [
  { value: 'web', text: 'Web Server' },
  { value: 'db', text: 'Database' },
  { value: 'cache', text: 'Cache' },
  { value: 'queue', text: 'Message Queue' },
  { value: 'proxy', text: 'Reverse Proxy' },
]

export default {
  title: 'Atoms/Select/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '⚠️ **Low-use** (2× — the product\'s select is **`FlotoDropdownPicker`**, 510×). `MSelect` is the kit\'s raw Ant `a-select` wrapper, documented for completeness. Modes: **default · multiple · tags**; `show-search`, `size`, `loading`. v-model is `value`/`change`. ⚠️ Its **clear-all × is broken** (F4/F5) — use chips to remove, or `FlotoDropdownPicker`. See **Usage**.',
      },
    },
  },
  argTypes: {
    mode: { control: 'select', options: ['default', 'multiple', 'tags'] },
    showSearch: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'default', 'large'] },
  },
  args: { mode: 'default', showSearch: true, disabled: false, loading: false, size: 'default' },
}

export const Single = () => ({
  data: () => ({ v: 'web', options: OPTIONS }),
  template: `<div style="max-width:280px"><MSelect :allow-clear="false" :value="v" :options="options" show-search placeholder="Select a component" @change="v = $event" /></div>`,
})
Single.parameters = { docs: { description: { story: 'Single select with search. Options are `{ value, text }`; v-model the value. (No `allow-clear` here — MSelect\'s clear × is broken, see F4/F5; for a clearable select use `FlotoDropdownPicker`.)' } } }

export const Multiple = () => ({
  data: () => ({ v: ['web', 'db'], options: OPTIONS }),
  template: `<div style="max-width:320px"><MSelect :allow-clear="false" mode="multiple" :value="v" :options="options" placeholder="Select components" @change="v = $event" /></div>`,
})
Multiple.parameters = { docs: { description: { story: '`mode="multiple"` — pick several; selections render as removable chips, each with a working **×** (the chip remove icon uses a registered `fal` icon, unlike the broken clear-all). Remove via the chip ×.' } } }

export const Tags = () => ({
  data: () => ({ v: ['prod', 'web'], options: OPTIONS }),
  template: `<div style="max-width:320px"><MSelect :allow-clear="false" mode="tags" :value="v" :options="options" placeholder="Type to add tags" @change="v = $event" /></div>`,
})
Tags.parameters = { docs: { description: { story: '`mode="tags"` — free-type values to create new tags (the only way MSelect is actually used in the product, via `LooseTags` / `object-tag-picker`). For a real tag input, prefer **`LooseTags`**.' } } }

export const States = () => ({
  data: () => ({ v: 'web', options: OPTIONS }),
  template: `
    <div style="display:flex;flex-direction:column;gap:14px;max-width:280px">
      <MSelect :allow-clear="false" :value="v" :options="options" disabled placeholder="Disabled" />
      <MSelect :allow-clear="false" :value="undefined" :options="options" loading placeholder="Loading" />
    </div>`,
})
States.parameters = { docs: { description: { story: 'States: `disabled` and `loading` (the chevron becomes a spinner).' } } }

export const Playground = (args) => ({
  props: Object.keys(args),
  data: () => ({ v: undefined, options: OPTIONS }),
  template: `<div style="max-width:300px"><MSelect :allow-clear="false" :mode="mode" :show-search="showSearch" :disabled="disabled" :loading="loading" :size="size" :value="v" :options="options" placeholder="Select…" @change="v = $event" /></div>`,
})

// Hide the Controls panel on static showcase stories (only Playground uses args).
Single.parameters = { ...(Single.parameters || {}), controls: { disable: true } }
Multiple.parameters = { ...(Multiple.parameters || {}), controls: { disable: true } }
Tags.parameters = { ...(Tags.parameters || {}), controls: { disable: true } }
States.parameters = { ...(States.parameters || {}), controls: { disable: true } }
