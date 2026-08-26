// Foundations / Layout / Layout shells — 4 route shells (src/views/layouts/) + 2 content layouts.
// Machine spec: design-system/layout/layouts.json (shells). Corrected per foundation/layout-shells.md:
// MonitorHierarchyLayout has 0 route overrides — it's a CONTENT layout, not a route shell.

const SHELLS = [
  { name: 'Layout', kind: 'route shell', sub: 'main.vue · default', nav: true, header: true, use: 'Every authenticated app page (the default — no override).', usage: 'default · ~all routes' },
  { name: 'LoginLayout', kind: 'route shell', sub: 'login-layout.vue', nav: false, header: false, bare: true, use: 'Auth screens (login, reset, forgot) + the disk-full error. Also the not-logged-in fallback.', usage: "meta + unauth fallback" },
  { name: 'EmptyLayout', kind: 'route shell', sub: 'empty-layout.vue', nav: false, header: false, padded: true, use: 'Full-bleed, no nav/header, still live (socket + DB). Used for the print-safe report export.', usage: '1 override · /reports/export' },
  { name: 'PublicLayout', kind: 'route shell', sub: 'public-layout.vue', nav: false, header: false, padded: true, use: 'Public / system page — upgrade or restore in progress.', usage: '2 overrides · /upgrade /restore' },
  { name: 'MonitorHierarchyLayout', kind: 'content layout', sub: 'monitor-hierarchy-layout.vue', nav: true, header: true, twoPane: true, use: 'Left hierarchy tree + content. Renders INSIDE Layout (not a route shell).', usage: '0 route overrides · 4 files' },
  { name: 'Settings two-pane', kind: 'content layout', sub: 'settings/views/main.vue', nav: true, header: true, twoPane: true, use: 'splitpanes: left menu + content. Hidden via hideSettingsMenu. Inside Layout.', usage: 'all settings submodules' },
]

export default {
  title: 'Foundations/Layout/Layout shells/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **4 route shells** in `src/views/layouts/`, chosen by the switcher in `src/app.vue` (not logged in → **`LoginLayout`**; else **`Layout`**; then a `route.meta.layout` override wins). They differ by **chrome** — nav rail, header, live socket/DB. **Plus 2 content layouts** (`MonitorHierarchyLayout`, the Settings `splitpanes` two-pane) that render *inside* `Layout` — these are **not** route shells (0 `meta.layout` overrides). Corrected per `foundation/layout-shells.md`. Machine spec: `layout/layouts.json` → `shells`.',
      },
    },
  },
}

export const Shells = () => ({
  data: () => ({ shells: SHELLS }),
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">Grey = nav rail · top bar = header · solid = left pane/menu · dashed = content. <strong>Route shells</strong> are picked via the route's <code>layout</code> meta; <strong>content layouts</strong> render inside <code>Layout</code>.</div>
      <div style="display:grid;grid-template-columns:450px 450px;gap:22px 27px">
        <div v-for="s in shells" :key="s.name" style="width:450px;border:1px solid var(--border-color);border-radius:10px;overflow:hidden">
          <!-- thumbnail (same box size as Panel behaviours: ~420×300) -->
          <div style="height:300px;display:flex;background:var(--page-background-color)">
            <div v-if="s.nav" style="width:38px;background:var(--nav-panel-bg);flex-shrink:0"></div>
            <div style="flex:1;display:flex;flex-direction:column;min-width:0;padding:14px;gap:14px">
              <div v-if="s.header" style="height:30px;border:1px solid var(--border-color);border-radius:6px;flex-shrink:0"></div>
              <div style="flex:1;display:flex;gap:14px;min-height:0" :style="{padding: s.padded ? '10px' : '0', margin: s.bare ? '0 44px':'0'}">
                <div v-if="s.twoPane" style="width:34%;border:1px solid var(--border-color);border-radius:6px"></div>
                <div style="flex:1;border:1px dashed var(--border-color);border-radius:6px"></div>
              </div>
            </div>
          </div>
          <!-- label -->
          <div style="padding:10px 12px;border-top:1px solid var(--border-color)">
            <div class="flex items-center justify-between">
              <span style="font-size:13px;font-weight:600">{{ s.name }}</span>
              <span :style="{fontSize:'9px',padding:'2px 7px',borderRadius:'5px',fontFamily:'jetBrainsMono,monospace',background: s.kind==='route shell' ? 'var(--primary)' : 'var(--code-tag-background-color)', color: s.kind==='route shell' ? 'var(--page-background-color)' : 'var(--neutral-light)'}">{{ s.kind }}</span>
            </div>
            <div style="font-size:10px;color:var(--neutral-light);font-family:jetBrainsMono,monospace;margin:2px 0 6px">{{ s.sub }} · {{ s.usage }}</div>
            <div style="font-size:11px;color:var(--neutral-regular);line-height:1.45">{{ s.use }}</div>
          </div>
        </div>
      </div>
    </div>`,
})
Shells.parameters = { controls: { disable: true }, docs: { description: { story: 'Top row — the **4 route shells** by decreasing chrome: **`Layout`** (nav + header + content, default) → **`LoginLayout`** (bare, also the unauth fallback) → **`EmptyLayout`** / **`PublicLayout`** (no chrome, padded). Bottom — the **2 content layouts** that render inside `Layout`: **`MonitorHierarchyLayout`** (tree + content) and the **Settings `splitpanes` two-pane** (menu + content). The blue tag marks a true route shell; **`MonitorHierarchyLayout` has 0 `meta.layout` overrides** — it is a content layout, corrected per the product sweep.' } } }

// Interactive playground — pick a shell, a recognizable preview morphs (EUI style).
export const Playground = () => ({
  data: () => ({ shells: SHELLS, sel: 'Layout', nav: ['dashboard', 'navbar-monitor', 'alert', 'report', 'topology', 'settings'] }),
  computed: {
    s() { return this.shells.find((x) => x.name === this.sel) || this.shells[0] },
    routeShells() { return this.shells.filter((x) => x.kind === 'route shell') },
    contentShells() { return this.shells.filter((x) => x.kind !== 'route shell') },
  },
  methods: {
    seg(active) { return `cursor:pointer;font-size:12px;padding:5px 12px;border:1px solid var(--border-color);border-radius:6px;font-family:jetBrainsMono,monospace;white-space:nowrap;background:${active ? 'var(--primary)' : 'transparent'};color:${active ? 'var(--page-background-color)' : 'var(--neutral-regular)'}` },
  },
  template: `
    <div style="color:var(--page-text-color);max-width:780px">
      <!-- grouped selector: route shells | content layouts -->
      <div class="flex items-center" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <span class="text-neutral-light" style="font-size:11px;width:96px">Route shell:</span>
        <span v-for="x in routeShells" :key="x.name" :style="seg(sel===x.name)" @click="sel=x.name">{{ x.name }}</span>
      </div>
      <div class="flex items-center" style="gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <span class="text-neutral-light" style="font-size:11px;width:96px">Content layout:</span>
        <span v-for="x in contentShells" :key="x.name" :style="seg(sel===x.name)" @click="sel=x.name">{{ x.name }}</span>
      </div>

      <div style="height:340px;display:flex;border:1px solid var(--border-color);border-radius:8px;overflow:hidden;background:var(--page-background-color)">

        <!-- LoginLayout (bare): a centered sign-in card -->
        <div v-if="s.bare" class="flex items-center justify-center" style="flex:1;background:var(--page-background-color)">
          <div style="width:240px;border:1px solid var(--border-color);border-radius:10px;background:var(--page-background-color);box-shadow:0 8px 24px var(--neutral-shadow-light);padding:22px;display:flex;flex-direction:column;align-items:center;gap:12px">
            <span style="width:30px;height:30px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></span>
            <div class="font-600" style="font-size:14px">Sign in</div>
            <div style="width:100%;height:30px;border-radius:5px;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></div>
            <div style="width:100%;height:30px;border-radius:5px;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></div>
            <div style="width:100%;height:32px;border-radius:5px;background:var(--primary)"></div>
          </div>
        </div>

        <!-- everything else -->
        <template v-else>
          <!-- nav rail -->
          <div v-if="s.nav" style="width:54px;flex-shrink:0;background:var(--nav-panel-bg);border-right:1px solid var(--border-color);display:flex;flex-direction:column;align-items:center;padding:11px 0;gap:8px">
            <span style="width:24px;height:24px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color);margin-bottom:3px"></span>
            <span v-for="i in 6" :key="i" :style="{width:'28px',height:'26px',borderRadius:'7px',background: i===2 ? 'var(--primary)':'var(--code-tag-background-color)',border: i===2 ? 'none':'1px solid var(--border-color)'}"></span>
          </div>

          <div style="flex:1;display:flex;flex-direction:column;min-width:0">
            <!-- header -->
            <div v-if="s.header" class="flex items-center justify-between" style="height:42px;border-bottom:1px solid var(--border-color);padding:0 14px;flex-shrink:0">
              <span style="width:80px;height:13px;border-radius:4px;background:var(--code-tag-background-color)"></span>
              <span class="flex items-center" style="gap:7px"><span style="width:22px;height:22px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></span><span style="width:22px;height:22px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></span><span style="width:22px;height:22px;border-radius:50%;background:var(--code-tag-background-color)"></span></span>
            </div>

            <!-- body -->
            <div style="flex:1;min-height:0;display:flex;background:var(--page-background-color)" :style="{padding: s.padded ? '14px':'0'}">
              <!-- left pane: tree (hierarchy) or menu (settings) -->
              <div v-if="s.twoPane" style="width:32%;border-right:1px solid var(--border-color);padding:12px 10px;display:flex;flex-direction:column;gap:8px;overflow:hidden">
                <template v-if="s.name==='MonitorHierarchyLayout'">
                  <div v-for="(row, idx) in [{i:0,o:1},{i:1,o:0},{i:1,o:0},{i:0,o:1},{i:1,o:0},{i:0,o:1}]" :key="idx" class="flex items-center" :style="{gap:'6px',marginLeft:(row.i*14)+'px'}"><span style="font-size:9px;color:var(--neutral-light)">{{ row.o ? '▾':'▸' }}</span><span style="flex:1;height:8px;background:var(--code-tag-background-color);border-radius:3px"></span></div>
                </template>
                <template v-else>
                  <div class="text-neutral-light" style="font-size:9px;font-weight:700;letter-spacing:.5px">SETTINGS</div>
                  <div v-for="n in 6" :key="n" :style="{height:'9px',borderRadius:'3px',background: n===2 ? 'var(--nav-hover-bg)':'var(--code-tag-background-color)',marginBottom:'1px'}"></div>
                </template>
              </div>
              <!-- content -->
              <div style="flex:1;min-width:0;padding:14px 16px;display:flex;flex-direction:column">
                <div class="font-600" style="font-size:17px;margin-bottom:9px">Page title</div>
                <div style="height:1px;background:var(--border-color);margin-bottom:14px"></div>
                <div v-for="n in 5" :key="n" :style="{height:'15px',borderRadius:'4px',background:'var(--code-tag-background-color)',marginBottom:'12px',width: n===5 ? '55%':'100%'}"></div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div style="margin-top:12px">
        <div class="flex items-center" style="gap:8px"><span class="font-600" style="font-size:14px">{{ s.name }}</span><span :style="{fontSize:'9px',padding:'2px 7px',borderRadius:'5px',fontFamily:'jetBrainsMono,monospace',background: s.kind==='route shell' ? 'var(--primary)':'var(--code-tag-background-color)', color: s.kind==='route shell' ? 'var(--page-background-color)':'var(--neutral-light)'}">{{ s.kind }}</span></div>
        <div style="font-size:10px;color:var(--neutral-light);font-family:jetBrainsMono,monospace;margin:3px 0 5px">{{ s.sub }} · {{ s.usage }}</div>
        <div style="font-size:12px;color:var(--neutral-regular)">{{ s.use }}</div>
      </div>
    </div>`,
})
Playground.parameters = { controls: { disable: true }, docs: { description: { story: 'An **interactive** shell picker (Elastic-EUI style) — choose a shell and the preview morphs into a **recognizable** rendering of it: real nav rail + brand header for `Layout`, a centered **sign-in card** for `LoginLayout`, padded chrome-less content for `EmptyLayout`/`PublicLayout`, a **hierarchy tree** for `MonitorHierarchyLayout`, and a **settings menu** for the Settings two-pane. Route shells and content layouts are grouped in the selector. The full side-by-side catalogue is the **Shells** story above.' } } }
