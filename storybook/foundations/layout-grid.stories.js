// Foundations / Layout / Grid — the product's 12-column grid (MRow / MCol, wrapping Ant a-row/a-col).
// Machine spec: design-system/layout/grid.json. Uses the real MRow/MCol from the kit.

const CELL = 'background:var(--code-tag-background-color);color:var(--page-text-color);border:1px solid var(--border-color);border-radius:4px;padding:10px 0;text-align:center;font-size:12px;font-family:jetBrainsMono,monospace'
const FIELD = 'border:1px solid var(--border-color);border-radius:4px;height:32px;background:var(--page-background-color)'

export default {
  title: 'Foundations/Layout/Grid/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 The product\'s **layout grid** — **`MRow` / `MCol`** (wrappers over Ant Design Vue 1.x `a-row`/`a-col`), a **12-column** system used in **~540 / ~522 files**. `MCol :size` is on a 12-col basis: **6 = half** (the default form field), **12 = full**, **3 = quarter**, **4 = third**, **2 = sixth**. **`:gutter="16"`** for form rows; **`:gutter="0"`** only for structural wrappers; **`auto-size`** shrinks a column to its content. Machine spec: `layout/grid.json`.',
      },
    },
  },
}

// 1. The column splits.
export const Columns = () => ({
  data: () => ({ cell: CELL }),
  template: `
    <div style="color:var(--page-text-color);max-width:720px">
      <div class="text-neutral-light mb-3" style="font-size:12px">A 12-column grid. <code>MCol :size</code> = columns to span. Common splits (with in-product usage):</div>

      <div class="text-neutral-light" style="font-size:11px;margin:10px 0 4px">size 12 — full (716×)</div>
      <MRow :gutter="8"><MCol :size="12"><div :style="cell">12</div></MCol></MRow>

      <div class="text-neutral-light" style="font-size:11px;margin:12px 0 4px">6 + 6 — halves (729×, the default form layout)</div>
      <MRow :gutter="8"><MCol :size="6"><div :style="cell">6</div></MCol><MCol :size="6"><div :style="cell">6</div></MCol></MRow>

      <div class="text-neutral-light" style="font-size:11px;margin:12px 0 4px">4 + 4 + 4 — thirds (256×)</div>
      <MRow :gutter="8"><MCol :size="4"><div :style="cell">4</div></MCol><MCol :size="4"><div :style="cell">4</div></MCol><MCol :size="4"><div :style="cell">4</div></MCol></MRow>

      <div class="text-neutral-light" style="font-size:11px;margin:12px 0 4px">3 × 4 — quarters (466×)</div>
      <MRow :gutter="8"><MCol :size="3"><div :style="cell">3</div></MCol><MCol :size="3"><div :style="cell">3</div></MCol><MCol :size="3"><div :style="cell">3</div></MCol><MCol :size="3"><div :style="cell">3</div></MCol></MRow>

      <div class="text-neutral-light" style="font-size:11px;margin:12px 0 4px">2 × 6 — sixths (217×, dense rows)</div>
      <MRow :gutter="8"><MCol v-for="n in 6" :key="n" :size="2"><div :style="cell">2</div></MCol></MRow>

      <div class="text-neutral-light" style="font-size:11px;margin:12px 0 4px">5 + 7 — asymmetric split (125×)</div>
      <MRow :gutter="8"><MCol :size="5"><div :style="cell">5</div></MCol><MCol :size="7"><div :style="cell">7</div></MCol></MRow>
    </div>`,
})
Columns.parameters = { controls: { disable: true }, docs: { description: { story: 'The 12-column splits, ordered by in-product frequency: **full (12)**, **halves (6+6)** — the default two-up form layout — **thirds (4)**, **quarters (3)**, **sixths (2)**, and the occasional **asymmetric (5+7)**. `MCol :size` is the column span out of 12.' } } }

// 2. A real form row — gutter 16, two 50% fields with labels.
export const FormLayout = () => ({
  data: () => ({ field: FIELD }),
  template: `
    <div style="color:var(--page-text-color);max-width:640px">
      <div class="text-neutral-light mb-3" style="font-size:12px">The standard form layout: <code>&lt;MRow :gutter="16"&gt;</code> of <code>&lt;MCol :size="6"&gt;</code> fields (each a FlotoFormItem). Full-width fields use size 12.</div>
      <MRow :gutter="16">
        <MCol :size="6"><div class="text-neutral-light" style="font-size:12px;margin-bottom:4px">Name</div><div :style="field"></div></MCol>
        <MCol :size="6"><div class="text-neutral-light" style="font-size:12px;margin-bottom:4px">Type</div><div :style="field"></div></MCol>
      </MRow>
      <MRow :gutter="16" style="margin-top:14px">
        <MCol :size="3"><div class="text-neutral-light" style="font-size:12px;margin-bottom:4px">Poll (s)</div><div :style="field"></div></MCol>
        <MCol :size="3"><div class="text-neutral-light" style="font-size:12px;margin-bottom:4px">Severity</div><div :style="field"></div></MCol>
        <MCol :size="6"><div class="text-neutral-light" style="font-size:12px;margin-bottom:4px">Tags</div><div :style="field"></div></MCol>
      </MRow>
      <MRow :gutter="16" style="margin-top:14px">
        <MCol :size="12"><div class="text-neutral-light" style="font-size:12px;margin-bottom:4px">Description</div><div :style="field" style="height:64px;border:1px solid var(--border-color);border-radius:4px"></div></MCol>
      </MRow>
    </div>`,
})
FormLayout.storyName = 'Form layout (gutter 16)'
FormLayout.parameters = { controls: { disable: true }, docs: { description: { story: 'A realistic form: **`:gutter="16"`** rows of **size-6** (half) fields, mixing **size-3** (quarter) for compact fields and **size-12** (full) for the textarea. This 6/6 two-up pattern is the product\'s default form layout (729× size-6 usage).' } } }

// 3. Auto-size — content-width columns for actions.
export const AutoSize = () => ({
  data: () => ({ field: FIELD }),
  template: `
    <div style="color:var(--page-text-color);max-width:640px">
      <div class="text-neutral-light mb-3" style="font-size:12px"><code>&lt;MCol auto-size&gt;</code> shrinks to its content — use it for action buttons beside a filling field.</div>
      <MRow :gutter="16" type="flex" align="middle">
        <MCol :size="6"><div :style="field"></div></MCol>
        <MCol auto-size><span style="display:inline-flex;align-items:center;height:32px;padding:0 16px;border:1px solid var(--border-color);border-radius:4px;font-size:13px">Reset</span></MCol>
        <MCol auto-size><span style="display:inline-flex;align-items:center;height:32px;padding:0 18px;border-radius:4px;background:var(--primary);color:var(--page-background-color);font-size:13px;font-weight:600">Apply</span></MCol>
      </MRow>
    </div>`,
})
AutoSize.storyName = 'Auto-size (content-width columns)'
AutoSize.parameters = { controls: { disable: true }, docs: { description: { story: 'A filling **size-6** field + two **`auto-size`** columns that hug their button content — the common "field + actions" row. Align within the row using flex utilities.' } } }

// 4. Interactive playground — pick a column size + toggle gutter / auto-size (EUI style). Uses real MRow/MCol.
export const Playground = () => ({
  data: () => ({ gutter: true, autoSize: false, size: 6, sizes: [12, 6, 4, 3, 2] }),
  computed: { count() { return Math.floor(12 / this.size) }, pct() { return Math.round((this.size / 12) * 100) } },
  methods: {
    flip(k) { this[k] = !this[k] },
    track(v) { return `display:inline-flex;align-items:center;justify-content:${v ? 'flex-end' : 'flex-start'};width:42px;height:24px;border-radius:12px;background:${v ? 'var(--primary)' : 'var(--neutral-light)'};padding:3px;box-sizing:border-box;transition:background .15s` },
    knob(v) { return `width:18px;height:18px;border-radius:50%;background:var(--page-background-color);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${v ? 'var(--primary)' : 'var(--neutral-light)'}` },
    seg(active) { return `cursor:pointer;font-size:12px;padding:5px 14px;border:1px solid var(--border-color);border-radius:6px;font-family:jetBrainsMono,monospace;background:${active ? 'var(--primary)' : 'transparent'};color:${active ? 'var(--page-background-color)' : 'var(--neutral-regular)'}` },
  },
  template: `
    <div style="color:var(--page-text-color);max-width:720px">
      <div class="flex items-center" style="gap:22px;flex-wrap:wrap;margin-bottom:10px">
        <span class="flex items-center" style="gap:8px;cursor:pointer;user-select:none" @click="flip('gutter')"><span :style="track(gutter)"><span :style="knob(gutter)">{{ gutter ? '✓':'✕' }}</span></span><span style="font-size:13px">Gutter (16)</span></span>
        <span class="flex items-center" style="gap:8px;cursor:pointer;user-select:none" @click="flip('autoSize')"><span :style="track(autoSize)"><span :style="knob(autoSize)">{{ autoSize ? '✓':'✕' }}</span></span><span style="font-size:13px">Auto-size action</span></span>
      </div>
      <div class="flex items-center" style="gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <span class="text-neutral-light" style="font-size:12px">Column size:</span>
        <span v-for="s in sizes" :key="s" :style="seg(size===s)" @click="size=s">{{ s }}</span>
        <span class="text-neutral-light" style="font-size:11px;margin-left:6px">→ {{ count }} × {{ pct }}%</span>
      </div>

      <div class="text-neutral-light" style="font-size:11px;margin-bottom:5px">{{ count }} equal columns of <code>:size="{{ size }}"</code></div>
      <MRow :gutter="gutter ? 16 : 0">
        <MCol v-for="n in count" :key="n" :size="size">
          <div style="background:var(--code-tag-background-color);color:var(--page-text-color);border:1px solid var(--border-color);border-radius:4px;padding:14px 0;text-align:center;font-size:13px;font-family:jetBrainsMono,monospace">{{ size }}</div>
        </MCol>
      </MRow>

      <!-- auto-size demonstrates the canonical "filling field + content-width actions" row -->
      <div v-if="autoSize">
        <div class="text-neutral-light" style="font-size:11px;margin:16px 0 5px">A filling field + two <code>auto-size</code> action columns (they hug their button content):</div>
        <MRow :gutter="gutter ? 16 : 0" type="flex" align="middle">
          <MCol :size="6"><div style="height:46px;border:1px solid var(--border-color);border-radius:4px;background:var(--page-background-color)"></div></MCol>
          <MCol auto-size><span style="display:inline-flex;align-items:center;height:46px;padding:0 18px;border:1px solid var(--border-color);border-radius:4px;font-size:13px">Reset</span></MCol>
          <MCol auto-size><span style="display:inline-flex;align-items:center;height:46px;padding:0 20px;border-radius:4px;background:var(--primary);color:var(--page-background-color);font-size:13px;font-weight:600">Apply</span></MCol>
        </MRow>
      </div>

      <div class="text-neutral-light" style="font-size:11px;margin-top:14px">Pick a <code>:size</code> (the row fills with {{ count }} equal columns), toggle the 16px <strong>gutter</strong>, and switch on <strong>Auto-size action</strong> to see the "field + actions" row where the buttons hug their content. Real <code>MRow</code>/<code>MCol</code>.</div>
    </div>`,
})
Playground.parameters = { controls: { disable: true }, docs: { description: { story: 'An **interactive** grid (Elastic-EUI style) using the real `MRow`/`MCol` — pick a **column size** (the row fills with `12 / size` equal columns) and toggle the **16px gutter**. **Auto-size action** shows the canonical "filling field + content-width buttons" row — that\'s where `auto-size` is meant to be used (beside a filling field), not appended to a row that already fills 100%. The static reference splits are the **Columns** story above.' } } }
