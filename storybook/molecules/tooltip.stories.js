// Molecules / Tooltip — MTooltip (_base-tooltip.vue, 94×). The kit's MTooltip is EXCLUDED and
// this Floto override ships instead: it renders via <VTippy> (vue-tippy), not a-tooltip. A
// transient hover/focus label anchored to a trigger. Slots: `trigger` (the anchor) + default
// (the tooltip content). Props: placement (default top-start) · disabled · overlayClassName.
// Dominant product pattern: an info-circle icon trigger + a short text explanation.

export default {
  title: 'Molecules/Tooltip/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Molecule — a transient **hover/focus label** (`MTooltip`, 94×). The kit version is overridden by the Floto `_base-tooltip.vue`, which renders via **VTippy** (vue-tippy). Anchor an element in the **`trigger`** slot; the **default slot** is the floating content. `placement` defaults to **`top-start`**; no arrow. Use it for **brief, non-interactive hints** — for click-triggered interactive panels use **`MPopover`**.',
      },
    },
  },
  argTypes: {
    placement: { control: 'select', options: ['top', 'top-start', 'bottom', 'left', 'right'] },
    disabled: { control: 'boolean' },
  },
  args: { placement: 'top', disabled: false },
}

// The dominant product pattern: an info icon that reveals a short explanation on hover.
export const Basic = () => ({
  template: `
    <div style="padding:40px;color:var(--page-text-color)">
      <span>Polling interval
        <MTooltip>
          <template v-slot:trigger><MIcon name="info-circle" class="ml-1 text-primary-alt text-sm cursor-help" /></template>
          How often the monitor is polled, in seconds.
        </MTooltip>
      </span>
    </div>`,
})
Basic.parameters = { docs: { description: { story: 'The **info-tooltip** pattern (the 94× idiom): an `info-circle` icon in the `trigger` slot, a short text hint in the default slot. Appears on **hover/focus**, no arrow, `top-start`. Hover the **ⓘ**.' } } }

// placement controls where the bubble sits relative to the trigger.
export const Placements = () => ({
  data: () => ({ places: ['top', 'bottom', 'left', 'right'] }),
  template: `
    <div style="display:flex;gap:48px;padding:60px;color:var(--page-text-color)">
      <MTooltip v-for="p in places" :key="p" :placement="p">
        <template v-slot:trigger><MButton variant="default">{{ p }}</MButton></template>
        Tooltip on the {{ p }}.
      </MTooltip>
    </div>`,
})
Placements.parameters = { docs: { description: { story: 'The `placement` prop positions the bubble — `top` · `bottom` · `left` · `right` (plus `-start`/`-end` variants; default **`top-start`**). Hover each button.' } } }

// disabled renders the trigger inline with NO tooltip (the component short-circuits).
export const Disabled = () => ({
  template: `
    <div style="display:flex;gap:24px;padding:40px;color:var(--page-text-color)">
      <MTooltip><template v-slot:trigger><MButton variant="default">Enabled (hover me)</MButton></template>I show on hover.</MTooltip>
      <MTooltip :disabled="true"><template v-slot:trigger><MButton variant="default">Disabled (no tooltip)</MButton></template>You won't see me.</MTooltip>
    </div>`,
})
Disabled.parameters = { docs: { description: { story: '`:disabled="true"` short-circuits the tooltip — the `trigger` renders inline with **no** floating label. Useful when the hint is conditionally irrelevant (e.g. the value is already shown).' } } }

// Rich content — the tooltip body is a slot, so it can hold structured content (not just text).
export const RichContent = () => ({
  template: `
    <div style="padding:40px;color:var(--page-text-color)">
      <MTooltip placement="right">
        <template v-slot:trigger><MButton>web-server-01</MButton></template>
        <div style="min-width:180px;text-align:left">
          <div class="font-600 mb-1">web-server-01</div>
          <div style="font-size:12px">IP: 10.0.0.12</div>
          <div style="font-size:12px">Status: <span style="color:var(--secondary-green)">Up</span></div>
        </div>
      </MTooltip>
    </div>`,
})
RichContent.parameters = { docs: { description: { story: 'The content is a **slot**, so a tooltip can hold light structured content — a title + a few key/values (as in topology/host hover cards). Keep it brief and **non-interactive** (it dismisses on mouse-out); for interactive content use **`MPopover`**.' } } }

// Chart-like variant — overlay-class-name="chart-like-tooltip" swaps the default DARK bubble for
// a light chart-surface background (--chart-tooltip-background) with page text. Used for tooltips
// that should match a chart/graph surface (e.g. traceroute's info-tooltip). Shown next to the
// default so the dark-vs-light difference is visible.
export const ChartLike = () => ({
  template: `
    <div style="display:flex;gap:48px;padding:60px;color:var(--page-text-color)">
      <MTooltip placement="top">
        <template v-slot:trigger><MButton variant="default">Default (dark)</MButton></template>
        The default tooltip — dark bubble.
      </MTooltip>
      <MTooltip placement="top" overlay-class-name="chart-like-tooltip">
        <template v-slot:trigger><MButton variant="default">chart-like (light)</MButton></template>
        A chart-surface tooltip — light background, page text.
      </MTooltip>
    </div>`,
})
ChartLike.storyName = 'Variant: chart-like-tooltip'
ChartLike.parameters = { docs: { description: { story: '`overlay-class-name="chart-like-tooltip"` (2×) swaps the default **dark** bubble for a **light chart-surface** background (`--chart-tooltip-background`, near-white in light / translucent navy in dark) with page text — so a tooltip matches a chart/graph surface (e.g. the **traceroute** info-tooltip). Hover both buttons to compare.' } } }

export const Playground = (args) => ({
  props: Object.keys(args),
  template: `
    <div style="padding:60px;color:var(--page-text-color)">
      <MTooltip :placement="placement" :disabled="disabled">
        <template v-slot:trigger><MButton variant="default">Hover me</MButton></template>
        A tooltip — placement: {{ placement }}.
      </MTooltip>
    </div>`,
})

Basic.parameters = { ...(Basic.parameters || {}), controls: { disable: true } }
Placements.parameters = { ...(Placements.parameters || {}), controls: { disable: true } }
Disabled.parameters = { ...(Disabled.parameters || {}), controls: { disable: true } }
RichContent.parameters = { ...(RichContent.parameters || {}), controls: { disable: true } }
ChartLike.parameters = { ...(ChartLike.parameters || {}), controls: { disable: true } }
