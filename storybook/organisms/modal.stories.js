// Organisms / Modal — MModal (@motadata/ui, 39×) wraps Ant a-modal; FlotoConfirmModal (71×)
// is the confirm-dialog variant. Open via a `trigger` slot (MModal) or the `open` prop (confirm).
// PRODUCT PATTERN: MModal's built-in × is off (closable:false), so real modals add their OWN
// header row — a text-primary title + a close × (wired to the modal's hide()). The backdrop
// blurs (blur 3px). Overlay variants via overlay-class-name: hide-footer · scrollable-modal
// (+ restrict-width / smaller-modal) · no-padding-modal / no-padding-confrim-modal.

export default {
  title: 'Organisms/Modal/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Organism — a centered **dialog** over a blurred backdrop. `MModal` (39×) is the base; **`FlotoConfirmModal`** (71×) is the confirm variant. Open via the **`trigger`** slot or the **`open`** prop. Real modals add their own header (title + close ×) since the built-in × is off. Variants via `overlay-class-name` (`hide-footer`, `scrollable-modal`, `no-padding-modal`). For a side panel use **`FlotoDrawer`** (158×).',
      },
    },
  },
  argTypes: {
    width: { control: { type: 'number' } },
    centered: { control: 'boolean' },
  },
  args: { width: 560, centered: true },
}

// The product modal header: a flex row with a text-primary title + a close × on the right.
export const Basic = () => ({
  data: () => ({ name: '', interval: 30 }),
  template: `
    <MModal ref="m" centered :width="560">
      <template v-slot:trigger="{ open }"><MButton @click="open">Open dialog</MButton></template>
      <template v-slot:title>
        <div class="flex items-center">
          <h4 class="flex-1 m-0 text-primary">Edit monitor</h4>
          <MIcon name="times" class="cursor-pointer text-neutral-light" @click="$refs.m.hide()" />
        </div>
      </template>
      <FlotoFormItem label="Monitor name" rules="required" v-model="name" placeholder="web-server-01" />
      <FlotoFormItem label="Polling interval" type="number" help="In seconds." v-model="interval" />
      <template v-slot:footer="{ cancel, success }">
        <MButton variant="default" @click="cancel">Cancel</MButton>
        <MButton @click="success">Save</MButton>
      </template>
    </MModal>`,
})
Basic.parameters = { docs: { description: { story: 'The **product modal pattern** with a realistic form body: a header row (`text-primary` title + **close ×** wired to `hide()`), a `FlotoForm` body, and a footer with `cancel`/`success`. Dimensions match the product: **16px** corners (regular modals; confirm modals are 20px), header padding `5px 16px`, body padding `24px`. Click **Open dialog**.' } } }

export const Confirm = () => ({
  data: () => ({ open: false }),
  template: `
    <div>
      <MButton variant="error" @click="open = true">Delete monitor…</MButton>
      <FlotoConfirmModal :open="open" variant="error" success-text="Delete" cancel-text="Cancel" @confirm="open = false" @hide="open = false">
        <template v-slot:icon><MIcon name="exclamation-triangle" class="text-secondary-red" size="2x" /></template>
        <template v-slot:message><div style="color:var(--page-text-color)">Delete <strong>web-server-01</strong>? This can't be undone.</div></template>
      </FlotoConfirmModal>
    </div>`,
})
Confirm.parameters = { docs: { description: { story: 'The **`FlotoConfirmModal`** confirm dialog (71×) — driven by `open`. Icon + message + **Cancel / Delete** (Cancel left, action right; `error` variant). As used by delete confirms across the app. Click **Delete monitor…**.' } } }

export const HideFooter = () => ({
  template: `
    <MModal ref="hf" centered :width="560" overlay-class-name="hide-footer">
      <template v-slot:trigger="{ open }"><MButton variant="default" @click="open">Open detail (no footer)</MButton></template>
      <template v-slot:title>
        <div class="flex items-center"><h4 class="flex-1 m-0 text-primary">Monitor details</h4><MIcon name="times" class="cursor-pointer text-neutral-light" @click="$refs.hf.hide()" /></div>
      </template>
      <p style="color:var(--page-text-color)">A read-only / detail modal — <code>overlay-class-name="hide-footer"</code> removes the footer; the header × is the way out.</p>
    </MModal>`,
})
HideFooter.storyName = 'Variant: hide-footer'
HideFooter.parameters = { docs: { description: { story: '`overlay-class-name="hide-footer"` (4×) hides the footer — for read-only / detail content where there\'s no Save/Cancel. The header **close ×** is then the dismiss.' } } }

export const NoPadding = () => ({
  data: () => ({ rows: ['web-server-01', 'db-primary', 'cache-02', 'lb-edge-1'] }),
  template: `
    <MModal ref="np" centered :width="480" overlay-class-name="no-padding-modal hide-footer">
      <template v-slot:trigger="{ open }"><MButton variant="default" @click="open">Open no-padding</MButton></template>
      <template v-slot:title><div class="flex items-center"><h4 class="flex-1 m-0 text-primary">Select monitor</h4><MIcon name="times" class="cursor-pointer text-neutral-light" @click="$refs.np.hide()" /></div></template>
      <div style="color:var(--page-text-color)">
        <div v-for="(r, i) in rows" :key="r" class="px-4 py-3 cursor-pointer" :style="{ borderTop: i ? '1px solid var(--border-color)' : 'none' }">{{ r }}</div>
      </div>
    </MModal>`,
})
NoPadding.storyName = 'Variant: no-padding'
NoPadding.parameters = { docs: { description: { story: '`overlay-class-name="no-padding-modal"` (13×) strips the body padding (body → 8px; the `no-padding-confrim-modal` form → 0) so **full-bleed content** — a list, grid, or picker that manages its own padding — sits flush to the modal edges. Here each row spans edge-to-edge with its own dividers.' } } }

export const Scrollable = () => ({
  template: `
    <MModal ref="sc" :width="640" overlay-class-name="scrollable-modal smaller-modal">
      <template v-slot:trigger="{ open }"><MButton variant="default" @click="open">Open scrollable</MButton></template>
      <template v-slot:title><div class="flex items-center"><h4 class="flex-1 m-0 text-primary">Long content</h4><MIcon name="times" class="cursor-pointer text-neutral-light" @click="$refs.sc.hide()" /></div></template>
      <div style="flex:1;min-height:0;overflow-y:auto;color:var(--page-text-color)">
        <p v-for="n in 20" :key="n">Row {{ n }} — the body scrolls within a fixed height while the header/footer stay put.</p>
      </div>
      <template v-slot:footer="{ cancel }"><MButton variant="default" @click="cancel">Close</MButton></template>
    </MModal>`,
})
Scrollable.storyName = 'Variant: scrollable-modal'
Scrollable.parameters = { docs: { description: { story: '`overlay-class-name="scrollable-modal"` gives the body a fixed height with its own scroll (header/footer pinned). Modifiers: `restrict-width` (1020px) · `smaller-modal` (50vh body). For long forms/lists.' } } }

export const Sizes = () => ({
  template: `
    <div style="display:flex;gap:12px">
      <MModal ref="s1" :width="400"><template v-slot:trigger="{ open }"><MButton variant="default" @click="open">Small (400)</MButton></template><template v-slot:title><div class="flex items-center"><h4 class="flex-1 m-0 text-primary">Small</h4><MIcon name="times" class="cursor-pointer text-neutral-light" @click="$refs.s1.hide()" /></div></template><p>Narrow dialog.</p><template v-slot:footer="{ cancel }"><MButton variant="default" @click="cancel">Close</MButton></template></MModal>
      <MModal ref="s2" :width="760"><template v-slot:trigger="{ open }"><MButton variant="default" @click="open">Large (760)</MButton></template><template v-slot:title><div class="flex items-center"><h4 class="flex-1 m-0 text-primary">Large</h4><MIcon name="times" class="cursor-pointer text-neutral-light" @click="$refs.s2.hide()" /></div></template><p>Wide dialog for richer content.</p><template v-slot:footer="{ cancel }"><MButton variant="default" @click="cancel">Close</MButton></template></MModal>
    </div>`,
})
Sizes.parameters = { docs: { description: { story: 'Width via the `width` prop (px) — 400 (narrow) vs 760 (wide). The dialog is `centered`. For a **fixed wide** modal regardless of the prop, see **Large (restrict-width)**; for a full-screen flow use a **Drawer**.' } } }

export const LargeModal = () => ({
  template: `
    <MModal ref="lg" overlay-class-name="scrollable-modal restrict-width hide-footer">
      <template v-slot:trigger="{ open }"><MButton variant="default" @click="open">Open large (1020px)</MButton></template>
      <template v-slot:title><div class="flex items-center"><h4 class="flex-1 m-0 text-primary">Compare metrics</h4><MIcon name="times" class="cursor-pointer text-neutral-light" @click="$refs.lg.hide()" /></div></template>
      <div style="flex:1;min-height:0;overflow-y:auto;color:var(--page-text-color)">
        <div style="display:flex;gap:16px">
          <div style="flex:1"><h5 class="text-primary">Host A</h5><p v-for="n in 8" :key="'a'+n">Metric row {{ n }} — value, threshold, trend.</p></div>
          <div style="flex:1;border-left:1px solid var(--border-color);padding-left:16px"><h5 class="text-primary">Host B</h5><p v-for="n in 8" :key="'b'+n">Metric row {{ n }} — value, threshold, trend.</p></div>
        </div>
      </div>
    </MModal>`,
})
LargeModal.storyName = 'Variant: large (restrict-width 1020px)'
LargeModal.parameters = { docs: { description: { story: '`overlay-class-name="restrict-width"` forces the content to a **fixed 1020px** (min = max), independent of the `width` prop — the product\'s **wide modal** for side-by-side / comparison / wide-table content (often paired with `scrollable-modal`). Beyond this width, prefer a **Drawer** (the 85–96% full-screen pattern).' } } }

export const Playground = (args) => ({
  props: Object.keys(args),
  template: `
    <MModal ref="pg" :centered="centered" :width="width">
      <template v-slot:trigger="{ open }"><MButton @click="open">Open dialog</MButton></template>
      <template v-slot:title><div class="flex items-center"><h4 class="flex-1 m-0 text-primary">Dialog</h4><MIcon name="times" class="cursor-pointer text-neutral-light" @click="$refs.pg.hide()" /></div></template>
      <p style="color:var(--page-text-color)">Adjust width / centered via the controls, then reopen.</p>
      <template v-slot:footer="{ cancel, success }"><MButton variant="default" @click="cancel">Cancel</MButton><MButton @click="success">Ok</MButton></template>
    </MModal>`,
})

// Hide the Controls panel on static showcase stories (only Playground uses args).
Basic.parameters = { ...(Basic.parameters || {}), controls: { disable: true } }
Confirm.parameters = { ...(Confirm.parameters || {}), controls: { disable: true } }
HideFooter.parameters = { ...(HideFooter.parameters || {}), controls: { disable: true } }
NoPadding.parameters = { ...(NoPadding.parameters || {}), controls: { disable: true } }
Scrollable.parameters = { ...(Scrollable.parameters || {}), controls: { disable: true } }
Sizes.parameters = { ...(Sizes.parameters || {}), controls: { disable: true } }
LargeModal.parameters = { ...(LargeModal.parameters || {}), controls: { disable: true } }
