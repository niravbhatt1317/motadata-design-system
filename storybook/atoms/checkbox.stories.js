// Atoms / Checkbox — the REAL product <MCheckbox>.
// NOTE: the product excludes the kit's MCheckbox (main.js) and ships the Floto override
// `src/components/_base-checkbox.vue` — a functional, fully-controlled checkbox with a
// leaner API (checked / disabled / indeterminate / value; model checked/change).
// No `variant`, no `defaultChecked`. preview.js registers this version to match.

export default {
  title: 'Atoms/Checkbox/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Atom — a single boolean toggle (the product\'s functional, controlled override). Live examples below; see the **Usage**, **Accessibility**, and **Changelog** pages for full guidance.',
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { disabled: false, indeterminate: false, label: 'Send me updates' },
}

export const Playground = (args) => ({
  props: Object.keys(args),
  data: () => ({ checked: false }),
  template: `<MCheckbox v-model="checked" :disabled="disabled" :indeterminate="indeterminate">{{ label }}</MCheckbox>`,
})

export const States = () => ({
  // Controlled: pass :checked explicitly (the override has no defaultChecked).
  template: `
    <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
      <MCheckbox :checked="false">Unchecked</MCheckbox>
      <MCheckbox :checked="true">Checked</MCheckbox>
      <MCheckbox :indeterminate="true">Indeterminate</MCheckbox>
      <MCheckbox :disabled="true">Disabled</MCheckbox>
      <MCheckbox :disabled="true" :checked="true">Disabled checked</MCheckbox>
    </div>`,
})

export const WithoutLabel = () => ({
  template: `<MCheckbox :checked="true" />`,
})
WithoutLabel.parameters = {
  docs: { description: { story: 'No default slot → renders just the box (used in grid headers / row selectors).' } },
}

// Hide the Controls panel on static showcase stories (only Playground uses args).
States.parameters = { ...(States.parameters || {}), controls: { disable: true } }
WithoutLabel.parameters = { ...(WithoutLabel.parameters || {}), controls: { disable: true } }
