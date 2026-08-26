// Atoms / Input — MInput (@motadata/ui), 293×. A type-router: `type` switches the rendered
// control — text→a-input, password→a-input[type=password], number→MInputNumber,
// search→MInputSearch, textarea→a-textarea, datetime→date-picker. v-model is value/**update**
// (not 'input'). Slots: prefix · suffix · addonBefore · addonAfter · enterButton.
// In real forms it's wrapped by FlotoFormItem (1783×) for label + validation — see Usage.

export default {
  title: 'Atoms/Input/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Atom — the text input (`MInput`, 293×). One control, many `type`s (text · password · number · search · textarea). v-model binds `value` + **`update`**. In forms it lives inside **`FlotoFormItem`** (label + validation, 1783×). See **Usage** for when to use each type / style.',
      },
    },
  },
  argTypes: {
    type: { control: 'select', options: ['text', 'password', 'number', 'search', 'textarea'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    material: { control: 'boolean', description: 'Apply .material-input (bottom-border-only style, 62×)' },
  },
  args: { type: 'text', placeholder: 'Enter a value', disabled: false, material: false },
}

export const Types = () => ({
  data: () => ({ a: '', b: '', c: 0, d: '', e: '' }),
  template: `
    <div style="display:flex;flex-direction:column;gap:14px;max-width:320px">
      <MInput :value="a" @update="a = $event" placeholder="Text (default)" />
      <MInput type="password" :value="b" @update="b = $event" placeholder="Password" />
      <MInput type="number" :value="c" @update="c = $event" placeholder="Number" />
      <MInput type="search" :value="d" @update="d = $event" placeholder="Search" />
      <MInput type="textarea" :value="e" @update="e = $event" placeholder="Textarea" />
    </div>`,
})
Types.parameters = { docs: { description: { story: 'The `type` prop routes to the right control: **text** (default), **password**, **number** (`MInputNumber`), **search** (`MInputSearch` with an enter button), **textarea** (`a-textarea`).' } } }

export const Adornments = () => ({
  data: () => ({ a: '', b: '', c: '' }),
  template: `
    <div style="display:flex;flex-direction:column;gap:14px;max-width:320px">
      <MInput :value="a" @update="a = $event" placeholder="Search…"><template #prefix><MIcon name="search" /></template></MInput>
      <MInput :value="b" @update="b = $event" placeholder="Amount"><template #suffix><MIcon name="dollar-sign" /></template></MInput>
      <MInput :value="c" @update="c = $event" placeholder="domain"><template #addonBefore>https://</template><template #addonAfter>.com</template></MInput>
    </div>`,
})
Adornments.parameters = { docs: { description: { story: 'Adornments via slots: **prefix** / **suffix** icons (inside the field) and **addonBefore** / **addonAfter** (attached segments, e.g. `https://` … `.com`).' } } }

export const Material = () => ({
  data: () => ({ a: '', b: '' }),
  template: `
    <div style="display:flex;flex-direction:column;gap:18px;max-width:320px">
      <div class="material-input"><MInput :value="a" @update="a = $event" placeholder="Material (bottom border only)" /></div>
      <MInput :value="b" @update="b = $event" placeholder="Default (full box border)" />
    </div>`,
})
Material.storyName = 'Material style (.material-input, 62×)'
Material.parameters = { docs: { description: { story: 'The **`.material-input`** wrapper class (62×) strips the box border to a single **bottom border** (Material-style underline). Shown above the default boxed input for contrast.' } } }

export const States = () => ({
  data: () => ({ a: 'Read-only value', b: '' }),
  template: `
    <div style="display:flex;flex-direction:column;gap:14px;max-width:320px">
      <MInput :value="b" @update="b = $event" placeholder="Default" />
      <MInput :value="b" disabled placeholder="Disabled" />
      <MInput :value="a" read-only />
    </div>`,
})
States.parameters = { docs: { description: { story: 'States: default · `disabled` · `read-only`.' } } }

export const InteractionStates = () => ({
  data: () => ({ a: '', b: '', c: '' }),
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">Hover and <strong>focus</strong> (click / Tab) these real inputs. On <strong>focus</strong> the border shifts to <code>--primary</code>, but the product also <strong>removes the focus-visible ring system-wide (SF-001)</strong> — outside a form there is no extra focus outline.</div>
      <div style="display:flex;flex-direction:column;gap:14px;max-width:320px">
        <div><MInput :value="a" @update="a = $event" placeholder="Hover me (border lightens)" /><div class="text-neutral-light mt-1" style="font-size:11px">hover</div></div>
        <div><MInput :value="b" @update="b = $event" placeholder="Focus me (border → --primary)" /><div class="text-neutral-light mt-1" style="font-size:11px">focus</div></div>
        <div><MInput :value="c" disabled placeholder="Disabled (muted, no caret)" /><div class="text-neutral-light mt-1" style="font-size:11px">disabled</div></div>
      </div>
    </div>`,
})
InteractionStates.storyName = 'Interaction states (hover / focus)'
InteractionStates.parameters = {
  controls: { disable: true },
  docs: { description: { story: 'The **interaction states** of a real `MInput`: **hover** (border lightens), **focus** (border moves to `--primary`), and **disabled** (muted, no caret). **SF-001:** the product strips the global `:focus-visible` outline, so the only focus affordance is the border colour change — surfaced here as the open, system-wide a11y finding. Interact to observe; a static screenshot shows the resting state.' } },
}

export const Playground = (args) => ({
  props: Object.keys(args),
  data: () => ({ val: '' }),
  template: `
    <div :class="{ 'material-input': material }" style="max-width:320px">
      <MInput :type="type" :value="val" @update="val = $event" :placeholder="placeholder" :disabled="disabled" />
    </div>`,
})

export const Clearable = () => ({
  data: () => ({ a: 'Clear me' }),
  template: `<div style="max-width:320px"><MInput :value="a" @update="a = $event" allow-clear placeholder="Clearable" /></div>`,
})
Clearable.parameters = { docs: { description: { story: '`allow-clear` (218× incl. pickers) shows an **×** to clear the field when it has a value — for optional filters/search where "none" is valid.' } } }

export const Validation = () => ({
  template: `
    <div style="display:flex;flex-direction:column;gap:14px;max-width:320px">
      <div class="has-error"><MInput value="not-an-email" placeholder="Email" /></div>
      <span style="font-size:12px;color:var(--secondary-red)">Enter a valid email address.</span>
    </div>`,
})
Validation.storyName = 'Error / validation state'
Validation.parameters = { docs: { description: { story: 'The invalid state — a **red border** (`.has-error`) — comes from the `.has-error` wrapper that **`FlotoFormItem`** applies during validation. Pair it with an inline error message.' } } }

// Autocomplete — the `search` input as a search-AS-YOU-TYPE field: a suggestion list derived from what the user
// types (auto-complete-list.vue / omnibox), keyboard-navigable + hover. A variant of Input (search), NOT a
// Dropdown/Select — the options come from the QUERY, not a fixed list.
const SUGGEST = ['CPU Utilization', 'CPU Load Average', 'Memory Utilization', 'Disk IO', 'Disk Utilization', 'Network In', 'Network Out', 'Ping Latency']
export const Autocomplete = () => ({
  data: () => ({ q: 'cpu', active: 0, hover: -1, all: SUGGEST }),
  computed: { list() { return this.all.filter((s) => !this.q || s.toLowerCase().includes(this.q.toLowerCase())) } },
  watch: { q() { this.active = 0 } },
  template: `
    <div style="color:var(--page-text-color);max-width:420px">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <strong>search</strong> input as <strong>autocomplete</strong> — a <em>search-as-you-type</em> field whose suggestion list is driven by what you type (<code>auto-complete-list.vue</code> / omnibox), keyboard-navigable + hover. A variant of Input, <strong>not</strong> a Dropdown/Select (options come from the query, not a fixed list). Type to filter.</div>
      <div style="position:relative;width:300px">
        <div class="flex items-center" style="height:36px;padding:0 10px;gap:8px;border:1px solid var(--border-color);border-radius:4px;background:var(--page-background-color)">
          <MIcon name="search" style="font-size:13px;color:var(--neutral-light)" />
          <input v-model="q" placeholder="Search metrics…" style="flex:1;border:0;outline:none;background:transparent;font-size:0.8rem;color:var(--page-text-color)" />
        </div>
        <div v-if="list.length" style="position:absolute;top:40px;left:0;right:0;z-index:5;max-height:220px;overflow:auto;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:4px;box-shadow:0 6px 20px var(--neutral-shadow-light)">
          <div v-for="(s, i) in list" :key="s" @mouseenter="hover=i" @mouseleave="hover=-1" @click="q=s;active=i"
            style="padding:8px 12px;font-size:0.8rem;cursor:pointer"
            :style="{ background: (hover===i || (hover===-1 && active===i)) ? 'var(--neutral-lighter)' : 'transparent', color: (active===i && hover===-1) ? 'var(--primary)' : 'var(--page-text-color)' }">{{ s }}</div>
        </div>
      </div>
    </div>`,
})
Autocomplete.storyName = 'Autocomplete (search + suggestions)'
Autocomplete.parameters = { docs: { description: { story: 'The **search** input as **autocomplete / omnibox** (`auto-complete-list.vue`, `omnibox/searchbar.vue`) — a **search-as-you-type** field whose suggestion list is derived from **what the user types**, not a fixed option set. Rows are keyboard-navigable (`activeIndex`, ArrowUp/Down + Enter) and hoverable; **active** shows `--primary`, **hover** shows `--neutral-lighter`. This is a **variant of Input** — distinct from the **Dropdown picker / Select** (pick from a known list) and from a plain **search** input (which just filters a list shown elsewhere).' } } }

// Hide the Controls panel on static showcase stories (only Playground uses args).
Types.parameters = { ...(Types.parameters || {}), controls: { disable: true } }
Adornments.parameters = { ...(Adornments.parameters || {}), controls: { disable: true } }
Material.parameters = { ...(Material.parameters || {}), controls: { disable: true } }
States.parameters = { ...(States.parameters || {}), controls: { disable: true } }
Clearable.parameters = { ...(Clearable.parameters || {}), controls: { disable: true } }
Validation.parameters = { ...(Validation.parameters || {}), controls: { disable: true } }
Autocomplete.parameters = { ...(Autocomplete.parameters || {}), controls: { disable: true } }
