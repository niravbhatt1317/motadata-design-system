// Atoms / Radio — MRadioGroup (@motadata/ui), used 225×. Radios are always rendered via the
// GROUP with an :options array (standalone MRadio is 0× in the product). v-model is the
// selected value. `as-button` switches from a radio list to a segmented control (255× usage).

const OPTIONS = [
  { value: 'low', text: 'Low' },
  { value: 'medium', text: 'Medium' },
  { value: 'high', text: 'High' },
]

const RANGE = [
  { value: '1h', text: '1h' },
  { value: '24h', text: '24h' },
  { value: '7d', text: '7d' },
  { value: '30d', text: '30d' },
]

export default {
  title: 'Atoms/Radio/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Atom — a **one-of-many** selection control. Use `MRadioGroup` with an `:options` array (standalone `MRadio` is unused). `as-button` renders a **segmented control**. v-model is the selected value. Used **225×**.',
      },
    },
  },
  argTypes: {
    asButton: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'default', 'large'] },
    disabled: { control: 'boolean' },
  },
  args: { asButton: false, size: 'default', disabled: false },
}

export const RadioList = () => ({
  data: () => ({ value: 'medium', options: OPTIONS }),
  template: `
    <div>
      <MRadioGroup :value="value" :options="options" @change="value = $event" />
      <div style="margin-top:8px;font-size:12px;color:var(--neutral-light)">value: {{ value }}</div>
    </div>`,
})
RadioList.parameters = { docs: { description: { story: 'The default: a list of radios for picking one option. Bind `:options` (`{ value, text }`) and v-model the selected value.' } } }

export const Segmented = () => ({
  data: () => ({ value: '24h', options: RANGE }),
  template: `
    <div>
      <MRadioGroup as-button :value="value" :options="options" @change="value = $event" />
      <div style="margin-top:8px;font-size:12px;color:var(--neutral-light)">value: {{ value }}</div>
    </div>`,
})
Segmented.storyName = 'Segmented control (as-button, 255×)'
Segmented.parameters = { docs: { description: { story: 'With `as-button`, the group becomes a **segmented control** — joined buttons where one is selected. Great for a small set of mutually-exclusive, always-visible choices (time ranges, view modes).' } } }

export const Disabled = () => ({
  data: () => ({ value: 'medium', options: OPTIONS, mixed: [{ value: 'a', text: 'Available' }, { value: 'b', text: 'Disabled', disabled: true }] }),
  template: `
    <div style="display:flex;flex-direction:column;gap:16px">
      <MRadioGroup :value="value" :options="options" disabled />
      <MRadioGroup :value="'a'" :options="mixed" />
    </div>`,
})
Disabled.parameters = { docs: { description: { story: 'Disable the whole group (`disabled`) or a single option (`option.disabled`).' } } }

// Segmented with ICONS — common in the product (the `without-icon-margin` context, 14×).
// Icons go in the `option` slot. The product also tightens icon spacing via that class.
export const SegmentedWithIcons = () => ({
  data: () => ({ value: 'grid', options: [
    { value: 'grid', text: 'Grid', icon: 'th' },
    { value: 'list', text: 'List', icon: 'list' },
    { value: 'map', text: 'Map', icon: 'map-marker-alt' },
  ] }),
  // Match the product: icon stays INLINE with the label (no flex wrapper), spaced via mr-1.
  // A flex wrapper here breaks the segment baseline and offsets the selected one.
  template: `
    <MRadioGroup as-button class="without-icon-margin" :value="value" :options="options" @change="value = $event">
      <template v-slot:option="{ option }"><MIcon :name="option.icon" class="mr-1" />{{ option.text }}</template>
    </MRadioGroup>`,
})
SegmentedWithIcons.storyName = 'Segmented with icons (14×)'
SegmentedWithIcons.parameters = { docs: { description: { story: 'Segmented control with an icon per option (via the `option` slot) — a common product pattern (the `without-icon-margin` context). Use for view/mode toggles.' } } }

// Severity switch — the REAL product combo: severity-switch.vue uses
// class="radio-toggle-shadow alert-severity-buttons" with as-button (borderless segments,
// separated by thin rules, selected = a tinted rounded chip). Shown as the product uses it.
export const SeveritySwitch = () => ({
  data: () => ({ value: 'critical', options: [
    { value: 'critical', text: 'Critical' }, { value: 'major', text: 'Major' }, { value: 'warning', text: 'Warning' },
  ] }),
  template: `<MRadioGroup as-button class="radio-toggle-shadow alert-severity-buttons" :value="value" :options="options" @change="value = $event" />`,
})
SeveritySwitch.storyName = 'Severity switch (toggle-shadow + separators)'
SeveritySwitch.parameters = { docs: { description: { story: 'The real product combo from `severity-switch.vue`: `.radio-toggle-shadow` (borderless, selected = tinted rounded chip) **+** `.alert-severity-buttons` (thin separators) on an `as-button` group. Storybook loads the same stylesheets, so this renders as the product does.' } } }

export const Sizes = () => ({
  data: () => ({ options: RANGE }),
  template: `
    <div style="display:flex;flex-direction:column;gap:12px">
      <MRadioGroup as-button size="small" :value="'24h'" :options="options" />
      <MRadioGroup as-button size="default" :value="'24h'" :options="options" />
    </div>`,
})
Sizes.parameters = { docs: { description: { story: 'Segmented controls in `small` (dense toolbars) and `default` sizes.' } } }
