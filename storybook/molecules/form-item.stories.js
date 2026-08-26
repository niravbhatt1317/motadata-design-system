// Molecules / Forms / FormItem — FlotoFormItem (_base-form-item.vue), 1783× — the dominant
// form-field wrapper: MValidationProvider (vee-validate) → MFormItem → label + control + error.
// `required` is DERIVED from `rules` (if rules contain "required"). Renders its own MInput when
// no default slot is given (type/inputType route it); otherwise the slot is the control.

export default {
  title: 'Molecules/FormItem/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Molecule — the **Form Field** (`FlotoFormItem`, 1783×): a label + validation + control + error message. Every field in the product is built from it. The required asterisk and error state come from the vee-validate `rules` — you don\'t pass `required` directly.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    rules: { control: 'text', description: 'vee-validate rules, e.g. required|email|max:255' },
    help: { control: 'text', description: 'short hint under the field' },
    infoTooltip: { control: 'text', description: 'longer help behind an (i) icon' },
    type: { control: 'select', options: ['text', 'number', 'textarea', 'password'], description: 'built-in MInput type (when no slot)' },
  },
  args: { label: 'Monitor name', rules: 'required', help: '', infoTooltip: '', type: 'text' },
}

export const Playground = (args) => ({
  props: Object.keys(args),
  data: () => ({ v: '' }),
  template: `
    <div style="max-width:380px">
      <FlotoFormItem :label="label" :rules="rules" :help="help || undefined" :info-tooltip="infoTooltip || undefined" :type="type" v-model="v" placeholder="Type a value" />
    </div>`,
})
Playground.parameters = { docs: { description: { story: 'All the field controls in one place — set `label`, `rules` (e.g. `required|email`), `help`, `info-tooltip`, and the built-in input `type`.' } } }

export const Basic = () => ({
  data: () => ({ v: '' }),
  template: `<div style="max-width:380px"><FlotoFormItem label="Monitor name" v-model="v" placeholder="e.g. web-server-01" /></div>`,
})
Basic.parameters = { docs: { description: { story: 'The basic field: a `label` over a control. With no default slot it renders its own `MInput`; bind `v-model`. (Default layout stacks label above the control here.)' } } }

export const Required = () => ({
  data: () => ({ v: '' }),
  template: `<div style="max-width:380px"><FlotoFormItem label="Name" rules="required" v-model="v" placeholder="Required field" /></div>`,
})
Required.parameters = { docs: { description: { story: 'Pass `rules="required"` — the **required asterisk** is *derived* from the rules (there is no separate `required` prop). The field validates against vee-validate.' } } }

export const WithHelpText = () => ({
  data: () => ({ v: '' }),
  template: `<div style="max-width:380px"><FlotoFormItem label="Polling interval" help="In seconds. Lower values increase load." v-model="v" type="number" /></div>`,
})
WithHelpText.storyName = 'With help text'
WithHelpText.parameters = { docs: { description: { story: '`help` shows hint text under the field (here with a `type="number"` control).' } } }

export const WithInfoTooltip = () => ({
  data: () => ({ v: '' }),
  template: `<div style="max-width:380px"><FlotoFormItem label="Community string" info-tooltip="The SNMP v2c community string used to authenticate polls." v-model="v" /></div>`,
})
WithInfoTooltip.storyName = 'With info tooltip'
WithInfoTooltip.parameters = { docs: { description: { story: '`info-tooltip` adds an **(i)** icon next to the label that reveals help on hover — for explanations too long for `help`.' } } }

export const CustomControl = () => ({
  data: () => ({ opts: [{ value: 'low', text: 'Low' }, { value: 'high', text: 'High' }], v: 'low' }),
  template: `
    <div style="max-width:380px">
      <FlotoFormItem label="Severity" rules="required">
        <MRadioGroup as-button :value="v" :options="opts" @change="v = $event" />
      </FlotoFormItem>
    </div>`,
})
CustomControl.storyName = 'Custom control (any input in the slot)'
CustomControl.parameters = { docs: { description: { story: 'The default slot can hold **any** control — a `MRadioGroup`, `FlotoDropdownPicker`, `MCheckbox`, etc. FlotoFormItem provides the label + validation around it.' } } }

export const ValidationError = () => ({
  data: () => ({ v: 'not-an-email' }),
  template: `<div style="max-width:380px"><FlotoFormItem label="Email" rules="required|email" immediate v-model="v" placeholder="name@company.com" /></div>`,
})
ValidationError.storyName = 'Validation error (live)'
ValidationError.parameters = { docs: { description: { story: 'When a `rules` check fails, the field turns its border **red** and (after the user interacts — type then blur) shows the **inline error message** from vee-validate, e.g. *"The Email field must be a valid email"*. Try editing the value above and clicking away.' } } }

export const Layout = () => ({
  data: () => ({ a: '', b: '' }),
  template: `
    <div style="display:flex;flex-direction:column;gap:24px;max-width:480px">
      <div>
        <div style="font-size:12px;color:var(--neutral-light);margin-bottom:6px">layout="vertical" (label on top)</div>
        <MForm layout="vertical"><FlotoFormItem label="Monitor name" rules="required" v-model="a" placeholder="web-server-01" /><template v-slot:submit><span /></template></MForm>
      </div>
      <div>
        <div style="font-size:12px;color:var(--neutral-light);margin-bottom:6px">layout="horizontal" (label beside)</div>
        <MForm layout="horizontal"><FlotoFormItem label="Monitor name" rules="required" v-model="b" placeholder="web-server-01" /><template v-slot:submit><span /></template></MForm>
      </div>
    </div>`,
})
Layout.parameters = { docs: { description: { story: 'Field layout is set by the parent **`FlotoForm`/`MForm`** `layout`: **vertical** (label above the control, 13×) or **horizontal** (label beside, via `labelCol`/`wrapperCol`, 14×). Both are common — pick per form density.' } } }

// Hide the Controls panel on static showcase stories (only Playground uses args).
Basic.parameters = { ...(Basic.parameters || {}), controls: { disable: true } }
Required.parameters = { ...(Required.parameters || {}), controls: { disable: true } }
WithHelpText.parameters = { ...(WithHelpText.parameters || {}), controls: { disable: true } }
WithInfoTooltip.parameters = { ...(WithInfoTooltip.parameters || {}), controls: { disable: true } }
CustomControl.parameters = { ...(CustomControl.parameters || {}), controls: { disable: true } }
ValidationError.parameters = { ...(ValidationError.parameters || {}), controls: { disable: true } }
Layout.parameters = { ...(Layout.parameters || {}), controls: { disable: true } }
