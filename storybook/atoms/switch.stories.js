// Atoms / Switch — the real kit <MSwitch> (wraps Ant a-switch).
// NOTE: MSwitch is controlled — it always passes :checked (default false), which overrides
// :defaultChecked. So use v-model / :checked to show the ON state; :defaultChecked is a no-op.

export default {
  title: 'Atoms/Switch/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Atom — an instant on/off toggle for a setting. Live examples below; see the **Usage**, **Accessibility**, and **Changelog** pages for full guidance.',
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'default'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: { checked: false, size: 'default', disabled: false, loading: false },
}

export const Playground = (args) => ({
  props: Object.keys(args),
  data: () => ({ on: args.checked }),
  template: `<MSwitch v-model="on" :size="size" :disabled="disabled" :loading="loading" />`,
})

export const States = () => ({
  // Controlled: pass :checked (not :default-checked, which is a no-op — see Usage notes).
  template: `
    <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
      <MSwitch :checked="false" />
      <MSwitch :checked="true" />
      <MSwitch :disabled="true" />
      <MSwitch :disabled="true" :checked="true" />
      <MSwitch :checked="true" :loading="true" />
    </div>`,
})

export const Sizes = () => ({
  template: `
    <div style="display:flex;gap:20px;align-items:center">
      <MSwitch size="small" :checked="true" />
      <MSwitch size="default" :checked="true" />
    </div>`,
})

// Inner on/off labels — Ant `checkedChildren` / `unCheckedChildren` (the #checked / #unchecked slots).
// The track widens to fit the text; the label sits opposite the knob (ON left + green knob right when on).
export const WithLabels = () => ({
  template: `
    <div style="display:flex;gap:20px;align-items:center">
      <MSwitch :checked="true"><template #checked>ON</template><template #unchecked>OFF</template></MSwitch>
      <MSwitch :checked="false"><template #checked>ON</template><template #unchecked>OFF</template></MSwitch>
      <MSwitch :checked="true"><template #checked>YES</template><template #unchecked>NO</template></MSwitch>
    </div>`,
})
WithLabels.storyName = 'With on/off labels'
WithLabels.parameters = {
  docs: { description: { story: 'Inner on/off text via the `#checked` / `#unchecked` slots (Ant `checkedChildren` / `unCheckedChildren`). The track widens to fit the label, which sits opposite the knob. Seen in the product (e.g. dark widget panels).' } },
}

// Hide the Controls panel on static showcase stories (only Playground uses args).
States.parameters = { ...(States.parameters || {}), controls: { disable: true } }
Sizes.parameters = { ...(Sizes.parameters || {}), controls: { disable: true } }
WithLabels.parameters = { ...(WithLabels.parameters || {}), controls: { disable: true } }
