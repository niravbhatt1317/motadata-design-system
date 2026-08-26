// Atoms / Button — the real <MButton> from @motadata/ui.
// Globally registered via Vue.use(UiKit) in .storybook/preview.js.

// Variants that render DISTINCTLY in the product (verified by capturing computed colors).
// These are the values allow-listed to escape the navy primary background in buttons.less,
// plus the native Ant types (default/danger/dashed/ghost).
const VARIANTS = [
  'primary',
  'primary-alt',
  'default',
  'danger',
  'success',
  'error',
  'neutral-lighter',
  'neutral-lightest',
  'transparent',
  'dashed',
  'ghost',
]

// Accepted as `variant` values but currently render as the navy primary in the product
// (they are NOT in the buttons.less color allow-list). Surfaced as a known inconsistency.
const NAVY_FALLBACK_VARIANTS = ['info', 'neutral', 'neutral-light', 'warning']

export default {
  title: 'Atoms/Button/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Atom — the primary action control. Live examples below; see the **Usage**, **Accessibility**, and **Changelog** pages for full guidance.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: [...VARIANTS, ...NAVY_FALLBACK_VARIANTS] },
    size: { control: 'select', options: ['small', 'default', 'large'] },
    shape: { control: 'select', options: ['', 'circle'], description: 'Ant shape — "circle" for an icon button' },
    squared: { control: 'boolean', description: 'Apply .squared-button (35×35 icon button)' },
    icon: { control: 'text', description: 'MIcon name to render (leave label empty for icon-only)' },
    rounded: { control: 'boolean' },
    outline: { control: 'boolean' },
    block: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    variant: 'primary',
    size: 'default',
    shape: '',
    squared: false,
    icon: '',
    rounded: true,
    outline: false,
    block: false,
    loading: false,
    disabled: false,
    label: 'Button',
  },
}

export const Playground = (args) => ({
  props: Object.keys(args),
  template: `
    <MButton
      :variant="variant"
      :size="size"
      :shape="shape || undefined"
      :class="{ 'squared-button': squared }"
      :rounded="rounded"
      :outline="outline"
      :block="block"
      :loading="loading"
      :disabled="disabled"
      :aria-label="icon && !label ? icon : undefined"
    >
      <MIcon v-if="icon" :name="icon" />
      <template v-if="label">{{ label }}</template>
    </MButton>`,
})
Playground.parameters = {
  docs: { description: { story: 'All Button controls — including icon-button options: set `shape` to **circle**, toggle **squared** (`.squared-button`), and an **icon** name (clear the label for an icon-only button).' } },
}

export const Types = () => ({
  data: () => ({ variants: VARIANTS }),
  template: `
    <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
      <MButton v-for="v in variants" :key="v" :variant="v">{{ v }}</MButton>
    </div>`,
})
Types.parameters = {
  docs: { description: { story: 'Every supported `variant`. Pass the name via the `variant` prop.' } },
}

export const Sizes = () => ({
  template: `
    <div style="display:flex;gap:12px;align-items:center">
      <MButton size="small">Small</MButton>
      <MButton size="default">Default</MButton>
      <MButton size="large">Large</MButton>
    </div>`,
})
Sizes.parameters = {
  docs: { description: { story: 'Three sizes via the `size` prop: `small` · `default` · `large`.' } },
}

export const States = () => ({
  template: `
    <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
      <MButton>Default</MButton>
      <MButton :loading="true">Loading</MButton>
      <MButton :disabled="true">Disabled</MButton>
      <MButton :outline="true">Outline</MButton>
      <MButton :rounded="false">Square</MButton>
    </div>`,
})
States.parameters = {
  docs: { description: { story: 'Interactive states: `loading`, `disabled`, `outline`, and `rounded` (default true).' } },
}

export const InteractionStates = () => ({
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">Hover, press, and <strong>Tab</strong> to these real buttons to see each state. Note the <strong>focus</strong> state: the product <strong>removes the focus-visible ring system-wide (SF-001)</strong> — keyboard focus is not visibly indicated, an open accessibility gap.</div>
      <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center">
        <div class="flex flex-col items-center" style="gap:6px"><MButton>Hover me</MButton><span class="text-neutral-light" style="font-size:11px">default → hover (bg darkens)</span></div>
        <div class="flex flex-col items-center" style="gap:6px"><MButton variant="default">Press me</MButton><span class="text-neutral-light" style="font-size:11px">active (pressed)</span></div>
        <div class="flex flex-col items-center" style="gap:6px"><MButton variant="primary-alt">Tab to me</MButton><span class="text-neutral-light" style="font-size:11px">focus → <strong>no ring</strong> (SF-001)</span></div>
        <div class="flex flex-col items-center" style="gap:6px"><MButton :disabled="true">Disabled</MButton><span class="text-neutral-light" style="font-size:11px">disabled (no pointer)</span></div>
      </div>
    </div>`,
})
InteractionStates.storyName = 'Interaction states (hover / focus / active)'
InteractionStates.parameters = {
  controls: { disable: true },
  docs: { description: { story: 'The **interaction states** of a real `MButton`: **hover** (the kit darkens the background), **active** (pressed), **disabled** (reduced emphasis, no pointer), and **focus**. **SF-001:** the product strips the `:focus-visible` outline globally, so keyboard **focus is not visibly indicated** on buttons (or any control) — surfaced here as the open, system-wide a11y finding. Interact with the buttons to observe; a static screenshot only shows the resting state.' } },
}

export const Block = () => ({
  template: `<MButton :block="true">Full-width (block)</MButton>`,
})

// Outline / ghost buttons — the `outline` prop maps to Ant ghost; it renders distinctly per
// variant (primary, error, success have dedicated ghost styles in buttons.less).
export const OutlineGhost = () => ({
  template: `
    <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
      <MButton :outline="true" variant="primary">Primary outline</MButton>
      <MButton :outline="true" variant="error">Error outline</MButton>
      <MButton :outline="true" variant="success">Success outline</MButton>
      <MButton :outline="true" variant="default">Default outline</MButton>
    </div>`,
})
OutlineGhost.storyName = 'Outline / ghost'
OutlineGhost.parameters = {
  docs: { description: { story: 'The `outline` prop (→ Ant ghost): transparent fill with a colored border. `primary`, `error`, and `success` have dedicated ghost styles in `buttons.less`.' } },
}

// Icon-only buttons — the product has multiple forms (heavily used, previously undocumented):
//   • shape="circle" (218×) — but renders as a 4px ROUNDED SQUARE, not a circle (F7), because
//     MButton's default rounded class (4px) overrides Ant's .ant-btn-circle (50%). This is the
//     real product behaviour. A TRUE circle needs shape="circle" :rounded="false".
//   • class="squared-button" (365×) — a 35×35 square icon button (buttons.less).
// All wrap an <MIcon> with no text, so they REQUIRE an aria-label for accessibility.
export const IconButtons = () => ({
  template: `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;gap:8px;align-items:center">
        <MButton shape="circle" aria-label="Add"><MIcon name="plus" /></MButton>
        <MButton shape="circle" variant="transparent" aria-label="Edit"><MIcon name="pen" /></MButton>
        <MButton shape="circle" variant="error" aria-label="Delete"><MIcon name="trash" /></MButton>
        <span style="font-size:12px;color:var(--neutral-light)">⚠️ <code>shape="circle"</code> (218×) — renders as a <strong>4px rounded square</strong> in the product, NOT a circle (finding F7)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <MButton shape="circle" :rounded="false" aria-label="Add"><MIcon name="plus" /></MButton>
        <MButton shape="circle" :rounded="false" variant="error" aria-label="Delete"><MIcon name="trash" /></MButton>
        <span style="font-size:12px;color:var(--neutral-light)">a <strong>true circle</strong> needs <code>shape="circle" :rounded="false"</code></span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <MButton class="squared-button" aria-label="Settings"><MIcon name="cog" /></MButton>
        <MButton class="squared-button" variant="neutral-lightest" aria-label="Filter"><MIcon name="filter" /></MButton>
        <span style="font-size:12px;color:var(--neutral-light)"><code>class="squared-button"</code> (365×, fixed 35×35)</span>
      </div>
    </div>`,
})
IconButtons.storyName = 'Icon buttons (circle + squared)'
IconButtons.parameters = {
  docs: { description: { story: 'Icon-only button forms in the product. **`shape="circle"`** (218×) actually renders as a **4px rounded square**, not a circle — MButton\'s default `rounded` (4px) overrides Ant\'s circle (50%); this is real product behaviour (**finding F7**). A true circle needs `:rounded="false"`. **`class="squared-button"`** (365×) is a fixed 35×35 square. ⚠️ All icon-only buttons **require an `aria-label`** (no automatic name).' } },
}

// Known inconsistency: these variants are accepted but render as the navy primary,
// because buttons.less only allow-lists certain variants to escape navy.
export const NavyFallbackVariants = () => ({
  data: () => ({ variants: NAVY_FALLBACK_VARIANTS }),
  template: `
    <div>
      <p style="margin:0 0 12px;font-size:12px;color:var(--neutral-regular)">
        ⚠️ These render as the navy <strong>primary</strong> in the product (not in the
        buttons.less color allow-list) — shown here as a flagged inconsistency, not a recommendation.
      </p>
      <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
        <MButton v-for="v in variants" :key="v" :variant="v">{{ v }}</MButton>
      </div>
    </div>`,
})
NavyFallbackVariants.storyName = 'Variants — navy fallback (known issue)'

// Hide the Controls panel on static showcase stories (only Playground uses args).
Types.parameters = { ...(Types.parameters || {}), controls: { disable: true } }
Sizes.parameters = { ...(Sizes.parameters || {}), controls: { disable: true } }
States.parameters = { ...(States.parameters || {}), controls: { disable: true } }
Block.parameters = { ...(Block.parameters || {}), controls: { disable: true } }
OutlineGhost.parameters = { ...(OutlineGhost.parameters || {}), controls: { disable: true } }
IconButtons.parameters = { ...(IconButtons.parameters || {}), controls: { disable: true } }
NavyFallbackVariants.parameters = { ...(NavyFallbackVariants.parameters || {}), controls: { disable: true } }
