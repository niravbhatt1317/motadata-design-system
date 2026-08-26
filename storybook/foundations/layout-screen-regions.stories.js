// Foundations / Layout / Screen regions — the page-level regions inside the content panel, + the 6 content layouts.
// Machine spec: design-system/layout/layouts.json (screenRegions, contentLayouts). Leader-line callouts (Atlassian-style).

const LAYOUTS = [
  { name: 'Single column', type: 'single' },
  { name: 'Two-pane', type: 'twoPane' },
  { name: 'Master-detail', type: 'master' },
  { name: 'Dashboard grid', type: 'dash' },
  { name: 'Three-pane', type: 'threePane' },
  { name: 'Chart-over-grid', type: 'chartGrid' },
]

// shared leader-line helpers (stage px coords)
const CALLOUT = {
  dotAt: (x, y) => `position:absolute;left:${x - 4}px;top:${y - 4}px;width:8px;height:8px;border-radius:50%;background:var(--page-text-color);z-index:3`,
  lineH: (x1, x2, y) => `position:absolute;top:${y - 1}px;left:${Math.min(x1, x2)}px;width:${Math.abs(x2 - x1)}px;height:2px;background:var(--page-text-color);z-index:2`,
  lineV: (x, y1, y2) => `position:absolute;left:${x - 1}px;top:${Math.min(y1, y2)}px;width:2px;height:${Math.abs(y2 - y1)}px;background:var(--page-text-color);z-index:2`,
  chip: (left, top, center) => `position:absolute;${center ? `left:${left}px;transform:translateX(-50%)` : `left:${left}px`};top:${top}px;background:var(--code-tag-background-color);color:var(--page-text-color);padding:5px 11px;border-radius:6px;font-size:12px;font-family:jetBrainsMono,monospace;white-space:nowrap;z-index:3`,
}

export default {
  title: 'Foundations/Layout/Screen regions/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 Inside the content panel, a standard page stacks these **regions** (top → bottom): **Page header** → **Toolbar / filter bar** → **Body** → **Footer / pagination**. The body itself takes one of **6 content layouts** — single column, two-pane (tree/menu + content), master-detail (list + drawer), dashboard grid, three-pane, or chart-over-grid. Map each region to its component on the **Usage** page. Machine spec: `layout/layouts.json` → `screenRegions` / `contentLayouts`.',
      },
    },
  },
}

// 1. Region stack — one page frame, leader-line callouts per region.
export const Regions = () => ({
  methods: CALLOUT,
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">A standard page stacks four regions top-to-bottom. Required regions carry a <span style="color:var(--primary);font-weight:700">▏</span><span style="color:var(--primary)">primary accent</span>; optional regions are tinted.</div>

      <div style="position:relative;width:720px;height:350px;font-family:jetBrainsMono,monospace">
        <!-- the page frame -->
        <div style="position:absolute;left:20px;top:20px;width:380px;height:310px;border:1px solid var(--border-color);border-radius:8px;overflow:hidden;display:flex;flex-direction:column;background:var(--page-background-color)">
          <!-- page header (required) -->
          <div style="height:48px;border-left:3px solid var(--primary);display:flex;align-items:center;justify-content:space-between;padding:0 12px;flex-shrink:0">
            <div style="height:12px;width:40%;background:var(--code-tag-background-color);border-radius:3px"></div>
            <div style="height:20px;width:46px;background:var(--primary);border-radius:4px"></div>
          </div>
          <!-- toolbar / filter bar (optional) -->
          <div style="height:34px;border-top:1px solid var(--border-color);background:var(--code-tag-background-color);display:flex;align-items:center;gap:6px;padding:0 12px;flex-shrink:0">
            <div style="height:14px;width:54px;border:1px solid var(--border-color);border-radius:4px;background:var(--page-background-color)"></div>
            <div style="height:14px;width:54px;border:1px solid var(--border-color);border-radius:4px;background:var(--page-background-color)"></div>
          </div>
          <!-- body (required) -->
          <div style="flex:1;border-top:1px solid var(--border-color);border-left:3px solid var(--primary);display:flex;flex-direction:column;min-height:0">
            <div style="height:22px;background:var(--code-tag-background-color);flex-shrink:0"></div>
            <div v-for="n in 4" :key="n" style="flex:1;border-top:1px solid var(--border-color);margin:0 12px"></div>
          </div>
          <!-- footer / pagination (optional) -->
          <div style="height:38px;border-top:1px solid var(--border-color);background:var(--code-tag-background-color);display:flex;align-items:center;justify-content:flex-end;padding:0 12px;flex-shrink:0">
            <div style="height:14px;width:92px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:4px"></div>
          </div>
        </div>

        <!-- leader-line callouts (right side) -->
        <span :style="dotAt(400,44)"></span><span :style="lineH(400,440,44)"></span><span :style="chip(448,31)">Page header</span>
        <span :style="dotAt(400,85)"></span><span :style="lineH(400,440,85)"></span><span :style="chip(448,72)">Toolbar / filter bar · optional</span>
        <span :style="dotAt(400,197)"></span><span :style="lineH(400,440,197)"></span><span :style="chip(448,184)">Body</span>
        <span :style="dotAt(400,311)"></span><span :style="lineH(400,440,311)"></span><span :style="chip(448,298)">Footer / pagination · optional</span>
      </div>
    </div>`,
})
Regions.parameters = { controls: { disable: true }, docs: { description: { story: 'A page composes top-down: **Page header** (required) → **Toolbar / filter bar** (optional) → **Body** (required) → **Footer / pagination** (optional). The primary left-accent marks required regions. See the **Usage** page for each region → component mapping (with links).' } } }

// 2. The content layouts (6) — variant frames, one leader-line label each.
export const ContentLayouts = () => ({
  data: () => ({ layouts: LAYOUTS }),
  methods: CALLOUT,
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">The shapes the <strong>body</strong> takes — the four common ones, plus <strong>three-pane</strong> and <strong>chart-over-grid</strong> surfaced by the product sweep.</div>
      <div style="display:grid;grid-template-columns:450px 450px;gap:21px 27px;font-family:jetBrainsMono,monospace">
        <div v-for="l in layouts" :key="l.name" style="position:relative;width:450px;height:392px">
          <!-- frame (same size as Panel behaviours) -->
          <div style="position:absolute;left:15px;top:0;width:420px;height:300px;border:1px solid var(--border-color);border-radius:10px;overflow:hidden;background:var(--page-background-color);padding:18px;display:flex;flex-direction:column;gap:14px">
            <div style="height:32px;border-radius:7px;background:var(--code-tag-background-color);flex-shrink:0"></div>
            <div style="flex:1;min-height:0;position:relative;display:flex;gap:14px" :style="{flexDirection: l.type==='chartGrid' ? 'column' : 'row'}">
              <div v-if="l.type==='single'" style="flex:1;border:1px dashed var(--border-color);border-radius:7px"></div>
              <template v-else-if="l.type==='twoPane'">
                <div style="width:32%;border:1px solid var(--border-color);border-radius:7px"></div>
                <div style="flex:1;border:1px dashed var(--border-color);border-radius:7px"></div>
              </template>
              <template v-else-if="l.type==='master'">
                <div style="flex:1;border:1px dashed var(--border-color);border-radius:7px"></div>
                <div style="position:absolute;top:0;right:0;bottom:0;width:46%;border:1px solid var(--primary);border-radius:7px;background:var(--page-background-color);box-shadow:-12px 0 24px var(--neutral-shadow-light)"></div>
              </template>
              <div v-else-if="l.type==='dash'" style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:12px">
                <div v-for="n in 4" :key="n" style="border:1px solid var(--border-color);border-radius:7px"></div>
              </div>
              <template v-else-if="l.type==='threePane'">
                <div style="width:18%;border:1px solid var(--border-color);border-radius:7px"></div>
                <div style="width:26%;border:1px solid var(--border-color);border-radius:7px"></div>
                <div style="flex:1;border:1px dashed var(--border-color);border-radius:7px"></div>
              </template>
              <template v-else>
                <div style="height:40%;border:1px solid var(--border-color);border-radius:7px;flex-shrink:0"></div>
                <div style="flex:1;border:1px dashed var(--border-color);border-radius:7px"></div>
              </template>
            </div>
          </div>
          <!-- leader-line callout -->
          <span :style="dotAt(225,300)"></span>
          <span :style="lineV(225,300,346)"></span>
          <span :style="chip(225,350,true)">{{ l.name }}</span>
        </div>
      </div>
    </div>`,
})
ContentLayouts.storyName = 'Content layouts'
ContentLayouts.parameters = { controls: { disable: true }, docs: { description: { story: 'The **body** takes one of these shapes: **single column** (list/form), **two-pane** (left tree/menu + content), **master-detail** (list + drawer slide-over), **dashboard grid** (tiles), and — surfaced by the product sweep — **three-pane** (saved-views rail + picker + content, e.g. Metric Explorer) and **chart-over-grid** (a fixed chart above a grid, e.g. Trap Viewer / log dashboards). When to use each — and the components — are on the **Usage** page.' } } }

// 3. Interactive playground — toggle optional regions + pick the body's content layout (EUI style).
const SOL = '1px solid var(--border-color)'
const DSH = '1px dashed var(--border-color)'
export const Playground = () => ({
  data: () => ({
    toolbar: true, footer: true, layout: 'twoPane',
    toggles: [{ k: 'toolbar', label: 'Toolbar / filter bar' }, { k: 'footer', label: 'Footer / pagination' }],
    shapes: [{ k: 'single', n: 'Single' }, { k: 'twoPane', n: 'Two-pane' }, { k: 'master', n: 'Master-detail' }, { k: 'dash', n: 'Dashboard' }, { k: 'threePane', n: 'Three-pane' }, { k: 'chartGrid', n: 'Chart-over-grid' }],
  }),
  methods: {
    on(k) { return this[k] },
    flip(k) { this[k] = !this[k] },
    track(v) { return `display:inline-flex;align-items:center;justify-content:${v ? 'flex-end' : 'flex-start'};width:42px;height:24px;border-radius:12px;background:${v ? 'var(--primary)' : 'var(--neutral-light)'};padding:3px;box-sizing:border-box;transition:background .15s` },
    knob(v) { return `width:18px;height:18px;border-radius:50%;background:var(--page-background-color);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${v ? 'var(--primary)' : 'var(--neutral-light)'}` },
    seg(active) { return `cursor:pointer;font-size:12px;padding:5px 12px;border:${SOL};border-radius:6px;font-family:jetBrainsMono,monospace;background:${active ? 'var(--primary)' : 'transparent'};color:${active ? 'var(--page-background-color)' : 'var(--neutral-regular)'}` },
  },
  template: `
    <div style="color:var(--page-text-color);max-width:760px">
      <!-- toggles -->
      <div class="flex items-center" style="gap:22px;flex-wrap:wrap;margin-bottom:10px">
        <span v-for="t in toggles" :key="t.k" class="flex items-center" style="gap:8px;cursor:pointer;user-select:none" @click="flip(t.k)">
          <span :style="track(on(t.k))"><span :style="knob(on(t.k))">{{ on(t.k) ? '✓' : '✕' }}</span></span>
          <span style="font-size:13px">{{ t.label }}</span>
        </span>
      </div>
      <!-- body shape selector -->
      <div class="flex items-center" style="gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <span class="text-neutral-light" style="font-size:12px">Body:</span>
        <span v-for="s in shapes" :key="s.k" :style="seg(layout===s.k)" @click="layout=s.k">{{ s.n }}</span>
      </div>

      <!-- the content panel, driven by the controls -->
      <div style="border:${SOL};border-radius:8px;overflow:hidden;height:360px;display:flex;flex-direction:column;background:var(--page-background-color)">
        <!-- page header -->
        <div class="flex items-center justify-between" style="flex-shrink:0;padding:12px 16px;border-left:3px solid var(--primary)">
          <div class="font-600" style="font-size:16px">Page title</div>
          <span style="height:26px;padding:0 12px;display:inline-flex;align-items:center;border-radius:4px;background:var(--primary);color:var(--nav-panel-bg);font-size:12px;font-weight:600">+ Add</span>
        </div>
        <!-- toolbar -->
        <div v-if="toolbar" class="flex items-center" style="flex-shrink:0;gap:8px;padding:8px 16px;background:var(--code-tag-background-color);border-top:${SOL};border-bottom:${SOL}">
          <span style="height:24px;width:120px;border:${SOL};border-radius:4px;background:var(--page-background-color)"></span>
          <span style="height:24px;width:70px;border:${SOL};border-radius:4px;background:var(--page-background-color)"></span>
          <span style="height:24px;width:70px;border:${SOL};border-radius:4px;background:var(--page-background-color)"></span>
        </div>
        <!-- body -->
        <div style="flex:1;min-height:0;position:relative;display:flex;gap:12px;padding:14px 16px" :style="{flexDirection: layout==='chartGrid' ? 'column' : 'row'}">
          <div v-if="layout==='single'" style="flex:1;border:${DSH};border-radius:6px"></div>
          <template v-else-if="layout==='twoPane'">
            <div style="width:30%;border:${SOL};border-radius:6px"></div>
            <div style="flex:1;border:${DSH};border-radius:6px"></div>
          </template>
          <template v-else-if="layout==='master'">
            <div style="flex:1;border:${DSH};border-radius:6px"></div>
            <div style="position:absolute;top:14px;right:16px;bottom:14px;width:44%;border:1px solid var(--primary);border-radius:6px;background:var(--page-background-color);box-shadow:-12px 0 24px var(--neutral-shadow-light)"></div>
          </template>
          <div v-else-if="layout==='dash'" style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px"><div v-for="n in 4" :key="n" style="border:${SOL};border-radius:6px"></div></div>
          <template v-else-if="layout==='threePane'">
            <div style="width:18%;border:${SOL};border-radius:6px"></div>
            <div style="width:26%;border:${SOL};border-radius:6px"></div>
            <div style="flex:1;border:${DSH};border-radius:6px"></div>
          </template>
          <template v-else>
            <div style="height:40%;border:${SOL};border-radius:6px;flex-shrink:0"></div>
            <div style="flex:1;border:${DSH};border-radius:6px"></div>
          </template>
        </div>
        <!-- footer -->
        <div v-if="footer" class="flex justify-end" style="flex-shrink:0;padding:8px 16px;border-top:${SOL}"><span style="height:18px;width:130px;background:var(--code-tag-background-color);border-radius:4px"></span></div>
      </div>
      <div class="text-neutral-light" style="font-size:11px;margin-top:10px">Toggle the optional regions and pick the body's content layout. The <strong>Page header</strong> + <strong>Body</strong> are always present; <strong>Toolbar</strong> + <strong>Footer</strong> are optional.</div>
    </div>`,
})
Playground.parameters = { controls: { disable: true }, docs: { description: { story: 'An **interactive** page (Elastic-EUI style) — toggle the optional **Toolbar** and **Footer** regions, and use the **Body** selector to morph the content panel through all **6 content layouts**. The catalogued region stack and content layouts are the **Regions** and **Content layouts** stories above.' } } }
