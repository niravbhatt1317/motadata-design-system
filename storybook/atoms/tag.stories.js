import SelectedItemPills from '@components/dropdown-trigger/selected-item-pills.vue'
import MStatusTag from '@components/_base-status-tag.vue'

// Atoms / Tag — the real kit <MTag> (wraps Ant a-tag).
// Real-world usage is a plain/removable label; the color `variant` feature is effectively
// broken (illegible in light theme) and barely used — see the spec sheet. So the examples
// here show the working usage; `closable` defaults to true (pass :closable="false" to display).

export default {
  title: 'Atoms/Tag/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Atom — a compact label for categorization or removable selections. Live examples below; see the **Usage**, **Accessibility**, and **Changelog** pages.',
      },
    },
  },
  argTypes: {
    closable: { control: 'boolean' },
    rounded: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { closable: false, rounded: false, label: 'Tag' },
}

export const Playground = (args) => ({
  props: Object.keys(args),
  template: `<MTag :closable="closable" :rounded="rounded">{{ label }}</MTag>`,
})

export const Styles = () => ({
  template: `
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <MTag :closable="false">Display</MTag>
      <MTag :closable="true">Removable</MTag>
      <MTag :rounded="true" :closable="false">Rounded</MTag>
    </div>`,
})
Styles.parameters = {
  docs: { description: { story: 'The real usage: display vs removable (`closable`, default true) and `rounded`.' } },
}

// The actual colored/status tags in the product are done with CSS CLASSES (not `variant`):
// colored text on a tinted background — legible, unlike the broken variant prop.
const COLOR_CLASSES = ['tag-primary', 'tag-green', 'tag-red', 'tag-yellow', 'tag-orange', 'tag-purple', 'tag-unknown']

export const ColoredTags = () => ({
  data: () => ({ classes: COLOR_CLASSES }),
  template: `
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <MTag v-for="c in classes" :key="c" :class="c" :closable="false">{{ c.replace('tag-','') }}</MTag>
    </div>`,
})
ColoredTags.parameters = {
  docs: { description: { story: 'Colored/status tags use CSS classes — `tag-green` / `tag-red` / `tag-yellow` / `tag-orange` / `tag-purple` / `tag-unknown` / `tag-primary` (colored text on a tinted bg). This is the **working** colored-tag pattern; the `variant` prop is broken (see Usage).' } },
}

// Status / severity variant: MStatusTag (_base-status-tag.vue, 30x) maps a status string to
// a tag-* colour class + a capitalized label. It's a semantic layer over the same working
// colour-class mechanism as ColoredTags — so it's a VARIANT of Tag, not a separate component.
// Always rounded + non-closable. It also carries `inline-flex items-center` for clean
// alignment (now rendering, since the Tailwind pipeline was enabled — SF-002).
export const StatusTags = () => ({
  components: { MStatusTag },
  data: () => ({
    statuses: ['up', 'down', 'paused', 'suspended', 'unreachable', 'maintenance', 'unknown'],
  }),
  template: `
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <MStatusTag v-for="s in statuses" :key="s" :status="s" />
    </div>`,
})
StatusTags.storyName = 'Status / severity'
StatusTags.parameters = {
  docs: { description: { story: 'Status tags (`MStatusTag`, 30×) map a status string → a `tag-*` colour + capitalized label (e.g. `up`→green, `down`→red, `paused`→yellow, `suspended`→orange, `unreachable`→purple, `maintenance`→neutral). A **semantic variant of Tag** over the same colour-class mechanism. Unmapped statuses fall back to a plain rounded tag; `forcePrimary` forces the neutral chip. Quirk: `poweredoff`→label "Up" / `poweredon`→label "Down" (intentional inversion in `_base-status-tag.vue`).' } },
}

// State classes (src/design/tags.less): tinted-background state chips applied via class —
// distinct from the tag-* colour classes. `used-count-pill` (48×, rounded) is a primary-text
// count chip; `new` / `provision` / `unprovision` are green / blue / orange state badges.
export const StateClasses = () => ({
  template: `
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <MTag :rounded="true" :closable="false" class="used-count-pill">3 used</MTag>
      <MTag :closable="false" class="new">New</MTag>
      <MTag :closable="false" class="provision">Provisioned</MTag>
      <MTag :closable="false" class="unprovision">Unprovisioned</MTag>
    </div>`,
})
StateClasses.storyName = 'State classes (count / provision)'
StateClasses.parameters = {
  docs: { description: { story: 'Tinted state chips applied via CSS class (`src/design/tags.less`) — distinct from the `tag-*` colour classes. **`used-count-pill`** (48×, always `rounded`) is a primary-text count chip (e.g. "3 used"); **`new`** (green), **`provision`** (blue), **`unprovision`** (orange) are provisioning/state badges. Apply via `class`, with `:closable="false"`.' } },
}

// Tag family: the teal "selected item" pills used inside pickers/multi-selects.
// SelectedItemPills (dropdown-trigger/) shows up to `maxItems` truncated teal pills, then a
// "+N" pill that opens a popover with the rest. `:tags` adds the .loose-tags-input ancestor
// that makes the pills teal (via --main-tags-* in input.less). usePopover → MPopover.
export const SelectedPills = () => ({
  components: { SelectedItemPills },
  template: `
    <div style="max-width:260px">
      <SelectedItemPills
        :tags="true"
        :max-items="1"
        :use-popover="true"
        :value="['monitor:web-server-01','os_name:Ubuntu 22.04','test2:teal-value','region:us-east']"
      />
    </div>`,
})
SelectedPills.storyName = 'Selected pills (picker, +N overflow)'
SelectedPills.parameters = {
  docs: { description: { story: 'The teal `key:value` pills shown for selections inside a picker/multi-select (`SelectedItemPills`). Truncated to `maxItems` (default 1), with a **`+N`** pill that opens a popover listing the rest. Teal comes from `--main-tags-*` (applied in the picker/`.loose-tags-input` context). Part of the Tag family — fully covered with the DropdownPicker spec.' } },
}

// Hide the Controls panel on static showcase stories (only Playground uses args).
Styles.parameters = { ...(Styles.parameters || {}), controls: { disable: true } }
ColoredTags.parameters = { ...(ColoredTags.parameters || {}), controls: { disable: true } }
StatusTags.parameters = { ...(StatusTags.parameters || {}), controls: { disable: true } }
StateClasses.parameters = { ...(StateClasses.parameters || {}), controls: { disable: true } }
SelectedPills.parameters = { ...(SelectedPills.parameters || {}), controls: { disable: true } }
