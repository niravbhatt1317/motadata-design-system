// Foundations / Layout / Panel behaviours — how panels/overlays open / move / resize.
// Machine spec: design-system/layout/layouts.json (panels). Leader-line callouts (Atlassian-style), 2-col grid.

const BEHAVIOURS = [
  { type: 'drawer', name: 'Drawer', meta: 'FlotoDrawer · 146' },
  { type: 'modal', name: 'Modal', meta: 'a-modal · 37' },
  { type: 'collapse', name: 'Collapsible', meta: 'MCollapse · 19' },
  { type: 'expand', name: 'Expandable rows', meta: 'grid expand · 9' },
  { type: 'split', name: 'Resizable / split', meta: 'splitpanes · ~3' },
  { type: 'affix', name: 'Affix / sticky', meta: 'CSS/JS sticky' },
  { type: 'dash', name: 'Dashboard tiles', meta: 'vue-grid-layout · 5' },
  { type: 'bulkbar', name: 'Bulk-action bar', meta: 'fixed bottom · 2' },
  { type: 'popover', name: 'Popover', meta: 'floating · 20+' },
  { type: 'fullscreen', name: 'Full-screen / OmniBox', meta: 'portal overlay' },
]

const CALLOUT = {
  dotAt: (x, y) => `position:absolute;left:${x - 4}px;top:${y - 4}px;width:8px;height:8px;border-radius:50%;background:var(--page-text-color);z-index:3`,
  lineV: (x, y1, y2) => `position:absolute;left:${x - 1}px;top:${Math.min(y1, y2)}px;width:2px;height:${Math.abs(y2 - y1)}px;background:var(--page-text-color);z-index:2`,
  chip: (left, top) => `position:absolute;left:${left}px;top:${top}px;transform:translateX(-50%);background:var(--code-tag-background-color);color:var(--page-text-color);padding:6px 13px;border-radius:6px;font-size:13px;font-family:jetBrainsMono,monospace;white-space:nowrap;z-index:3`,
  meta: (left, top) => `position:absolute;left:${left}px;top:${top}px;transform:translateX(-50%);font-size:11px;color:var(--neutral-light);font-family:jetBrainsMono,monospace;white-space:nowrap`,
}

export default {
  title: 'Foundations/Layout/Panel behaviours/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 How panels & overlays **open, move and resize**. The core surfaces: **Drawer** (slide-over, `FlotoDrawer` — 146 files), **Modal** (`a-modal`/`FlotoConfirmModal` — 37, incl. form-in-modal), **Collapsible** (`MCollapse` — 19), **Expandable rows** (inline row→detail — 9), **Resizable / split** (`splitpanes` library — ~3 true splits), **Affix / sticky** (CSS/JS, no `<a-affix>` widget), **Dashboard tiles** (`vue-grid-layout` — 5, + masonry), **Bulk-action bar** (fixed bottom, on selection — 2), **Popover** (floating, contextual — 20+), and the full-screen **OmniBox** overlay. (Table **resizable columns** are a grid feature, not a panel.) When to use each → the **Usage** page. Machine spec: `layout/layouts.json` → `panels`.',
      },
    },
  },
}

export const Behaviours = () => ({
  data: () => ({ items: BEHAVIOURS }),
  methods: CALLOUT,
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">The product's panel & overlay behaviours, each a variant frame.</div>
      <div style="display:grid;grid-template-columns:450px 450px;gap:21px 27px;font-family:jetBrainsMono,monospace">
        <div v-for="b in items" :key="b.type" style="position:relative;width:450px;height:432px">
          <!-- frame -->
          <div style="position:absolute;left:15px;top:0;width:420px;height:300px;border:1px solid var(--border-color);border-radius:10px;overflow:hidden;background:var(--page-background-color);padding:18px">

            <div v-if="b.type==='drawer'" style="position:relative;width:100%;height:100%">
              <div style="height:100%;border:1px dashed var(--border-color);border-radius:9px"></div>
              <div style="position:absolute;inset:0;background:var(--overlay-bg)"></div>
              <div style="position:absolute;top:0;right:0;bottom:0;width:58%;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:9px 0 0 9px;box-shadow:-12px 0 24px var(--neutral-shadow-light);padding:17px;display:flex;flex-direction:column;gap:12px">
                <div style="height:15px;width:55%;background:var(--code-tag-background-color);border-radius:4px"></div>
                <div v-for="n in 4" :key="n" style="height:14px;background:var(--code-tag-background-color);border-radius:4px"></div>
              </div>
            </div>

            <div v-else-if="b.type==='modal'" style="position:relative;width:100%;height:100%">
              <div style="height:100%;border:1px dashed var(--border-color);border-radius:9px"></div>
              <div style="position:absolute;inset:0;background:var(--overlay-bg)"></div>
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64%;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:9px;box-shadow:0 14px 30px var(--neutral-shadow-light);padding:16px;display:flex;flex-direction:column;gap:11px">
                <div style="height:14px;width:50%;background:var(--code-tag-background-color);border-radius:4px"></div>
                <div style="height:11px;background:var(--code-tag-background-color);border-radius:4px"></div>
                <div style="height:11px;width:80%;background:var(--code-tag-background-color);border-radius:4px"></div>
                <div class="flex" style="gap:8px;justify-content:flex-end;margin-top:4px"><div style="height:24px;width:56px;border:1px solid var(--border-color);border-radius:5px"></div><div style="height:24px;width:56px;background:var(--primary);border-radius:5px"></div></div>
              </div>
            </div>

            <div v-else-if="b.type==='collapse'" style="display:flex;flex-direction:column;gap:12px;height:100%">
              <div style="border:1px solid var(--border-color);border-radius:8px;padding:11px 16px;font-size:16px;color:var(--neutral-regular)">▸ Section A</div>
              <div style="border:1px solid var(--border-color);border-radius:8px;flex:1;display:flex;flex-direction:column;min-height:0">
                <div style="padding:11px 16px;font-size:16px;border-bottom:1px solid var(--border-color)">▾ Section B</div>
                <div style="flex:1;padding:14px 16px;display:flex;flex-direction:column;gap:11px;min-height:0"><div v-for="n in 2" :key="n" style="height:14px;background:var(--code-tag-background-color);border-radius:4px"></div></div>
              </div>
              <div style="border:1px solid var(--border-color);border-radius:8px;padding:11px 16px;font-size:16px;color:var(--neutral-regular)">▸ Section C</div>
            </div>

            <div v-else-if="b.type==='expand'" style="height:100%;display:flex;flex-direction:column;gap:10px">
              <div style="height:28px;border:1px solid var(--border-color);border-radius:7px;display:flex;align-items:center;padding:0 14px;font-size:14px;color:var(--neutral-regular)">▸ row</div>
              <div style="border:1px solid var(--primary);border-radius:7px;flex:1;display:flex;flex-direction:column;min-height:0">
                <div style="height:28px;display:flex;align-items:center;padding:0 14px;font-size:14px;border-bottom:1px solid var(--border-color)">▾ row (expanded)</div>
                <div style="flex:1;padding:13px 14px;display:flex;flex-direction:column;gap:10px;min-height:0"><div v-for="n in 2" :key="n" style="height:13px;background:var(--code-tag-background-color);border-radius:4px"></div></div>
              </div>
              <div style="height:28px;border:1px solid var(--border-color);border-radius:7px;display:flex;align-items:center;padding:0 14px;font-size:14px;color:var(--neutral-regular)">▸ row</div>
            </div>

            <div v-else-if="b.type==='split'" style="display:flex;align-items:stretch;height:100%">
              <div style="width:40%;border:1px dashed var(--border-color);border-radius:9px 0 0 9px"></div>
              <div style="width:21px;display:flex;align-items:center;justify-content:center"><span style="width:6px;height:78px;background:var(--primary);border-radius:3px"></span></div>
              <div style="flex:1;border:1px dashed var(--border-color);border-radius:0 9px 9px 0"></div>
            </div>

            <div v-else-if="b.type==='affix'" style="height:100%;display:flex;flex-direction:column;gap:12px">
              <div style="height:42px;background:var(--code-tag-background-color);border:1px solid var(--primary);border-radius:8px;display:flex;align-items:center;padding:0 16px;font-size:16px;color:var(--neutral-regular)">📌 pinned</div>
              <div v-for="n in 4" :key="n" style="height:14px;background:var(--code-tag-background-color);border-radius:4px;opacity:.6"></div>
            </div>

            <div v-else-if="b.type==='dash'" style="height:100%;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:14px">
              <div v-for="n in 4" :key="n" style="border:1px solid var(--border-color);border-radius:8px;position:relative"><span style="position:absolute;bottom:6px;right:6px;width:10px;height:10px;border-right:3px solid var(--neutral-light);border-bottom:3px solid var(--neutral-light)"></span></div>
            </div>

            <div v-else-if="b.type==='bulkbar'" style="position:relative;height:100%;display:flex;flex-direction:column;gap:12px">
              <div v-for="n in 4" :key="n" class="flex items-center" style="gap:12px;height:26px">
                <span :style="{width:'18px',height:'18px',borderRadius:'4px',border:'1px solid var(--primary)',background: n<=2 ? 'var(--primary)':'transparent'}"></span>
                <span style="flex:1;height:13px;background:var(--code-tag-background-color);border-radius:4px"></span>
              </div>
              <div style="position:absolute;left:0;right:0;bottom:0;height:46px;border-radius:8px;background:var(--primary);color:var(--page-background-color);display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-size:14px">
                <span>2 selected</span>
                <span class="flex" style="gap:9px"><span style="width:64px;height:24px;border:1px solid var(--page-background-color);border-radius:5px;opacity:.85"></span><span style="width:64px;height:24px;border:1px solid var(--page-background-color);border-radius:5px;opacity:.85"></span></span>
              </div>
            </div>

            <div v-else-if="b.type==='popover'" class="flex items-center justify-center" style="height:100%">
              <div style="position:relative">
                <div style="width:130px;height:36px;border:1px solid var(--border-color);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--neutral-regular)">anchor ▾</div>
                <div style="position:absolute;top:38px;left:50%;transform:translateX(-50%) rotate(45deg);width:12px;height:12px;background:var(--page-background-color);border-left:1px solid var(--border-color);border-top:1px solid var(--border-color)"></div>
                <div style="position:absolute;top:46px;left:50%;transform:translateX(-50%);width:180px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 10px 24px var(--neutral-shadow-light);padding:12px;display:flex;flex-direction:column;gap:9px">
                  <div v-for="n in 3" :key="n" style="height:12px;background:var(--code-tag-background-color);border-radius:4px"></div>
                </div>
              </div>
            </div>

            <div v-else style="position:relative;width:100%;height:100%">
              <div style="height:100%;border:1px dashed var(--border-color);border-radius:9px"></div>
              <div style="position:absolute;inset:0;background:var(--overlay-bg);border-radius:9px"></div>
              <div style="position:absolute;top:24px;left:50%;transform:translateX(-50%);width:76%;display:flex;flex-direction:column;gap:10px">
                <div style="height:40px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;display:flex;align-items:center;gap:9px;padding:0 14px;box-shadow:0 10px 24px var(--neutral-shadow-light)"><span style="font-size:15px">🔍</span><span style="flex:1;height:11px;background:var(--code-tag-background-color);border-radius:4px"></span></div>
                <div style="background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:9px"><div v-for="n in 3" :key="n" style="height:11px;background:var(--code-tag-background-color);border-radius:4px"></div></div>
              </div>
            </div>
          </div>

          <!-- leader-line callout -->
          <span :style="dotAt(225,300)"></span>
          <span :style="lineV(225,300,346)"></span>
          <span :style="chip(225,350)">{{ b.name }}</span>
          <span :style="meta(225,398)">{{ b.meta }}</span>
        </div>
      </div>
    </div>`,
})
Behaviours.parameters = { controls: { disable: true }, docs: { description: { story: 'Ten panel & overlay behaviours. The catalogued five — **Drawer**, **Collapsible**, **Resizable/split**, **Affix**, **Dashboard tiles** — plus the ones the product sweep surfaced: **Modal** (incl. form-in-modal), **Expandable rows**, **Bulk-action bar**, **Popover**, and the full-screen **OmniBox** overlay. Counts and "when to use each" are on the **Usage** page. (Table column-resize is a grid feature, documented there too.)' } } }
