import TagsList from '@components/tags-list.vue'

// Molecules / TagsList — a read-only "tag overflow" display: shows up to `maxLength` neutral
// chips inline; beyond that, collapses to a single COUNT chip with a hover popover listing all.
//
// ⚠️ UNUSED IN PRODUCT (dead code): src/components/tags-list.vue has 0 imports / 0 usages.
// The live equivalent of this pattern is SelectedItemPills (the picker "+N" pills). Documented
// here for completeness at the owner's request; see the spec's dead-code finding (F1).

export default {
  title: 'Molecules/TagsList/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '⚠️ **Unused in product (dead code)** — `src/components/tags-list.vue` has **0 usages**. Kept here for completeness; prefer **`SelectedItemPills`** (the live "+N" overflow). · Read-only molecule: shows up to `maxLength` neutral chips, then collapses to a **count chip + hover popover**.',
      },
    },
  },
  argTypes: {
    maxLength: { control: { type: 'number' } },
  },
  args: { maxLength: 2 },
}

export const FewTags = () => ({
  components: { TagsList },
  template: `
    <div style="max-width:320px">
      <TagsList :value="['web-server','database']" :max-length="2" />
    </div>`,
})
FewTags.storyName = 'Few tags (≤ maxLength)'
FewTags.parameters = {
  docs: { description: { story: 'When the list size is ≤ `maxLength` (default 2), every tag renders inline as a neutral `tag-primary` chip (rounded, non-closable).' } },
}

export const OverflowCount = () => ({
  components: { TagsList },
  template: `
    <div style="max-width:320px">
      <TagsList :value="['web-server','database','cache','queue','proxy']" :max-length="2" />
      <div style="margin-top:8px;font-size:12px;color:var(--neutral-light)">Hover the count chip to see the full list.</div>
    </div>`,
})
OverflowCount.storyName = 'Overflow (count + popover)'
OverflowCount.parameters = {
  docs: { description: { story: 'When the list exceeds `maxLength`, it collapses to a single chip showing the **count** (e.g. "5"); hovering opens a popover listing every item. (Note: it shows only the count, never the first N + "+rest" — unlike `SelectedItemPills`.)' } },
}

export const Playground = (args) => ({
  components: { TagsList },
  props: Object.keys(args),
  template: `
    <div style="max-width:320px">
      <TagsList :value="['alpha','beta','gamma','delta']" :max-length="maxLength" />
    </div>`,
})

// Hide the Controls panel on static showcase stories (only Playground uses args).
FewTags.parameters = { ...(FewTags.parameters || {}), controls: { disable: true } }
OverflowCount.parameters = { ...(OverflowCount.parameters || {}), controls: { disable: true } }
