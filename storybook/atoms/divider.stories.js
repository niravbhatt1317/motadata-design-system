// Atoms / Divider — the real <MDivider> from @motadata/ui (wraps Ant `a-divider`).
// Globally registered via Vue.use(UiKit) in .storybook/preview.js — no import needed.
//
// Product reality (swept): 133 uses / 93 files. 126 plain HORIZONTAL rules (default) + 7 VERTICAL
// (type="vertical") inline separators. Dashed and with-text/orientation are supported by the kit but
// NOT currently used in the product — shown here as available options, flagged in Usage.
// Base line renders `background: var(--border-color)` (general.less / form.less).

export default {
  title: 'Atoms/Divider/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Atom — a thin rule that separates content. **Horizontal** (default, 126×) ' +
          'splits stacked sections; **vertical** (`type="vertical"`, 7×) splits inline items. Live examples ' +
          'below; see **Usage**, **Accessibility**, and **Changelog** for guidance.',
      },
    },
  },
  argTypes: {
    type: { control: 'select', options: ['horizontal', 'vertical'], description: 'Ant orientation of the rule' },
    dashed: { control: 'boolean', description: 'Dashed instead of solid (supported; unused in product)' },
    orientation: { control: 'select', options: ['', 'start', 'end'], description: 'Text position when a label is present (default center)' },
    darkVariant: { control: 'boolean', description: 'Tuned for a dark background' },
    text: { control: 'text', description: 'Optional label (renders a with-text divider)' },
  },
  args: { type: 'horizontal', dashed: false, orientation: '', darkVariant: false, text: '' },
}

export const Playground = (args) => ({
  props: Object.keys(args),
  template: `
    <div style="color:var(--page-text-color)">
      <template v-if="type === 'vertical'">
        <span>Item A</span>
        <MDivider :type="type" :dashed="dashed" :dark-variant="darkVariant" />
        <span>Item B</span>
        <MDivider :type="type" :dashed="dashed" :dark-variant="darkVariant" />
        <span>Item C</span>
      </template>
      <template v-else>
        <p style="margin:0">Section above the rule.</p>
        <MDivider :type="type" :dashed="dashed" :orientation="orientation || undefined" :dark-variant="darkVariant">
          <template v-if="text">{{ text }}</template>
        </MDivider>
        <p style="margin:0">Section below the rule.</p>
      </template>
    </div>`,
})
Playground.parameters = {
  docs: { description: { story: 'All Divider controls. Switch **type** to `vertical` for an inline separator; add **text** for a labelled section rule and set **orientation** to move the label.' } },
}

// The 126× default — a full-width rule between stacked blocks (settings forms, cards).
export const Horizontal = () => ({
  template: `
    <div style="color:var(--page-text-color)">
      <p style="margin:0 0 4px">Connection details</p>
      <MDivider />
      <p style="margin:4px 0 0">Advanced options</p>
    </div>`,
})
Horizontal.parameters = { docs: { description: { story: 'The default horizontal rule — separates stacked sections. The most common form (126× in the product, e.g. between settings-form sections).' } } }

// The 7× vertical form — an inline separator between items in a row.
export const Vertical = () => ({
  template: `
    <div style="display:flex;align-items:center;color:var(--page-text-color)">
      <span>Running</span>
      <MDivider type="vertical" />
      <span>v2.4.1</span>
      <MDivider type="vertical" />
      <span>Updated 2h ago</span>
    </div>`,
})
Vertical.parameters = { docs: { description: { story: 'Vertical separator (`type="vertical"`) between inline items — used in compare views, analytics cards, and inline metadata rows (7× in the product).' } } }

// Supported by the kit but not used in the product — shown as available options, flagged in Usage.
export const DashedAndText = () => ({
  template: `
    <div style="color:var(--page-text-color)">
      <p style="margin:0 0 12px;font-size:12px;color:var(--neutral-regular)">
        ⚠️ <strong>Finding F1 — <code>dashed</code> renders SOLID.</strong> The DS override
        <code>.ant-divider { background: var(--border-color) }</code> paints a solid 1px line over Ant's
        dashed border, so <code>:dashed="true"</code> currently has <strong>no visible effect</strong>.
        With-text / <code>orientation</code> are kit-supported but unused in the product.
      </p>
      <p style="margin:0">Above</p>
      <MDivider :dashed="true" />
      <p style="margin:0">Below — <code>:dashed="true"</code> (still renders solid, F1)</p>
      <MDivider>Labelled section</MDivider>
      <MDivider orientation="start">Left-aligned label</MDivider>
      <MDivider orientation="end">Right-aligned label</MDivider>
    </div>`,
})
DashedAndText.storyName = 'Dashed (renders solid, F1) & with-text'

Horizontal.parameters = { ...(Horizontal.parameters || {}), controls: { disable: true } }
Vertical.parameters = { ...(Vertical.parameters || {}), controls: { disable: true } }
DashedAndText.parameters = { ...(DashedAndText.parameters || {}), controls: { disable: true } }
