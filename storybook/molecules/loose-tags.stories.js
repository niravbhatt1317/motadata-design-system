import LooseTags from '@components/loose-tags.vue'

// Molecules / Forms / LooseTags — a free-form TAG INPUT (type to create tags), not a tag.
// Classified as its own entry under Forms (D12): distinct usage decision (capture a list of
// freeform/known tags) + distinct API (v-model array, async suggestions). It is the home of
// the teal pills: default mode is <MSelect mode="tags" class="loose-tags-input">, and the
// .loose-tags-input context is what paints the selected pills teal (JetBrains Mono, orange ×).
//
// Three modes: default = editable tags input (shown here); `disabled` = read-only teal pills
// (SelectedItemPills); `asDropdown` = a searchable FlotoDropdownPicker (covered by the
// DropdownPicker spec). On `created()` it fetches suggestions via getAllTagsApi — in Storybook
// there's no backend, so the suggestion list is empty, but free-typing tags works fully.

export default {
  title: 'Molecules/LooseTags/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Molecule (form input) — a free-form **tag input**: type a value and press Enter to add a removable teal pill; existing tags are suggested (from the API in-product). Used **94× / 80 files**. v-model is an **array of strings** (lowercased, trimmed, de-duped). See **Usage** / **Accessibility**.',
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    singleSelection: { control: 'boolean' },
  },
  args: { disabled: false, singleSelection: false },
}

export const Default = () => ({
  components: { LooseTags },
  data: () => ({ tags: ['web-server', 'database', 'prod'] }),
  template: `
    <div style="max-width:360px">
      <LooseTags :value="tags" @change="tags = $event" />
      <div style="margin-top:8px;font-size:12px;color:var(--neutral-light)">value: {{ JSON.stringify(tags) }}</div>
    </div>`,
})
Default.parameters = {
  docs: { description: { story: 'The default **editable** mode (`MSelect mode="tags"` + `.loose-tags-input`). Type a tag and press Enter to add a teal pill; click the orange × to remove. Values are **lowercased / trimmed / de-duped** on change. (Suggestion dropdown is empty here — no backend in Storybook.) **Two known quirks:** **F1** — the editable mode **ignores the `placeholder` prop** (it hardcodes "Add Tags"; `placeholder` only applies in the `asDropdown` variant). **F2** — this mode **lowercases** input, but the `asDropdown` variant **preserves case** — so the same value can round-trip differently depending on which mode created it.' } },
}

export const ReadOnly = () => ({
  components: { LooseTags },
  template: `
    <div style="max-width:360px">
      <LooseTags disabled :value="['web-server','database','prod','region-us-east']" />
    </div>`,
})
ReadOnly.storyName = 'Read-only (disabled)'
ReadOnly.parameters = {
  docs: { description: { story: 'With `disabled`, LooseTags renders read-only teal pills via `SelectedItemPills` (no input, no API call). Used for display in view-mode forms.' } },
}

export const Playground = (args) => ({
  components: { LooseTags },
  props: Object.keys(args),
  data: () => ({ tags: ['alpha', 'beta'] }),
  template: `
    <div style="max-width:360px">
      <LooseTags :value="tags" :disabled="disabled" :single-selection="singleSelection" @change="tags = $event" />
    </div>`,
})

// Hide the Controls panel on static showcase stories (only Playground uses args).
Default.parameters = { ...(Default.parameters || {}), controls: { disable: true } }
ReadOnly.parameters = { ...(ReadOnly.parameters || {}), controls: { disable: true } }
