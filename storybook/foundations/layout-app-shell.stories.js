// Foundations / Layout / App shell — anatomy of the authenticated app frame (views/layouts/main.vue).
// MLayout(root) > NavBar (left rail) + contentContainer > Header (top) + scroll content (the page slot) + overlay layer.
// Machine spec: design-system/layout/layouts.json (appShell).

const LABEL = 'font-size:11px;color:var(--neutral-light);font-family:jetBrainsMono,monospace'
const REGION = 'position:relative;display:flex;align-items:center;justify-content:center;box-sizing:border-box;font-size:12px'

export default {
  title: 'Foundations/Layout/App shell/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 Anatomy of the **authenticated app frame** — `src/views/layouts/main.vue` (component **`Layout`**), the default shell for every in-app page. Nesting: **`MLayout`** (root, flex) → **`NavBar`** (left rail, `@nav-icon-width` 50px) + **`MLayout.contentContainer`** → **`Header`** (top, `@header-height` 55px — brand logo · global search · notifications · user menu; the breadcrumb/back lives in the *page* header, not here) + **`MLayout.main-content-panel`** → `FlotoScrollView` → **`MLayoutContent`** (the routed page `<slot/>` — the only scrolling region). A global **overlay layer** (OmniBox, notifications, portal targets) sits above. Machine spec: `layout/layouts.json` → `appShell`.',
      },
    },
  },
}

export const Anatomy = () => ({
  data: () => ({
    nav: [
      { i: 'dashboard' }, { i: 'navbar-monitor', active: true }, { i: 'alert' },
      { i: 'report' }, { i: 'topology' }, { i: 'log' }, { i: 'settings' },
    ],
    rows: [
      { n: 'core-sw-01', t: 'Switch', s: 'critical', solid: false, st: 'Down', stc: '--severity-critical' },
      { n: 'db-primary-12', t: 'Server', s: 'clear', solid: false, st: 'Up', stc: '--severity-clear' },
      { n: 'web-frontend-03', t: 'Server', s: 'warning', solid: false, st: 'Up', stc: '--severity-clear' },
      { n: 'lb-edge-gw-1', t: 'Load Balancer', s: 'major', solid: false, st: 'Up', stc: '--severity-clear' },
      { n: 'redis-cache-02', t: 'Cache', s: 'clear', solid: false, st: 'Up', stc: '--severity-clear' },
    ],
  }),
  methods: {
    dot(r) {
      const base = 'display:inline-block;width:9px;height:9px;border-radius:50%;flex-shrink:0;box-sizing:border-box'
      return r.solid ? `${base};background:var(--severity-${r.s})` : `${base};border:2px solid var(--severity-${r.s});background:var(--severity-${r.s}-dot-box)`
    },
    // leader-line callout helpers (absolute, in stage px coords)
    dotAt(x, y) {
      return `position:absolute;left:${x - 4}px;top:${y - 4}px;width:8px;height:8px;border-radius:50%;background:var(--page-text-color);z-index:3`
    },
    lineV(x, y1, y2) {
      return `position:absolute;left:${x - 1}px;top:${Math.min(y1, y2)}px;width:2px;height:${Math.abs(y2 - y1)}px;background:var(--page-text-color);z-index:2`
    },
    chipAt(x, y, align) {
      const pos = align === 'left' ? `left:${x - 12}px` : align === 'right' ? `right:${820 - x - 12}px` : `left:${x}px;transform:translateX(-50%)`
      return `position:absolute;${pos};top:${y}px;background:var(--code-tag-background-color);color:var(--page-text-color);padding:5px 11px;border-radius:6px;font-size:12px;white-space:nowrap;z-index:3`
    },
  },
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">The main app shell — each region is called out in its real position. A full-height left rail, a top header on the right, one scrolling content panel, and a global overlay layer above it.</div>

      <!-- fixed-size stage so the leader lines align to the regions -->
      <div style="position:relative;width:820px;height:470px;font-family:jetBrainsMono,monospace">

        <!-- ===== the shell frame (left:30 top:70 w:760 h:330) ===== -->
        <div style="position:absolute;left:30px;top:70px;width:760px;height:330px;border:1px solid var(--border-color);border-radius:8px;overflow:hidden;display:flex;background:var(--page-background-color)">

          <!-- Left rail (NavBar) — 60px, full height (skeleton) -->
          <div style="width:60px;flex-shrink:0;background:var(--nav-panel-bg);border-right:1px solid var(--border-color);display:flex;flex-direction:column;align-items:center;padding:11px 0;gap:9px">
            <span style="width:26px;height:26px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color);margin-bottom:4px"></span>
            <span v-for="i in 6" :key="i" :style="{width:'30px',height:'28px',borderRadius:'7px',background: i===2 ? 'var(--primary)' : 'var(--code-tag-background-color)',border: i===2 ? 'none' : '1px solid var(--border-color)'}"></span>
          </div>

          <!-- content container -->
          <div style="flex:1;display:flex;flex-direction:column;min-width:0">
            <!-- header — 46px -->
            <div class="flex items-center justify-between" style="height:46px;border-bottom:1px solid var(--border-color);padding:0 16px;flex-shrink:0">
              <span style="width:88px;height:14px;border-radius:4px;background:var(--code-tag-background-color)"></span>
              <span class="flex items-center" style="gap:8px">
                <span style="width:24px;height:24px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></span>
                <span style="width:24px;height:24px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></span>
                <span style="width:24px;height:24px;border-radius:50%;background:var(--code-tag-background-color)"></span>
              </span>
            </div>
            <!-- content panel: a faint real routed page -->
            <div style="flex:1;min-height:0;background:var(--page-background-color);overflow:hidden;display:flex;flex-direction:column;padding:11px 14px;position:relative">
              <div class="font-600" style="font-size:18px;flex-shrink:0;margin-bottom:9px">Page title</div>
              <div style="height:1px;background:var(--border-color);margin-bottom:14px;flex-shrink:0"></div>
              <div v-for="n in 6" :key="n" :style="{height:'16px',borderRadius:'4px',background:'var(--code-tag-background-color)',marginBottom:'13px',flexShrink:0,width: n===6 ? '55%':'100%'}"></div>
              <!-- overlay element (a toast) floating above content -->
              <div style="position:absolute;right:18px;bottom:18px;width:150px;border:1px solid var(--border-color);border-left:3px solid var(--secondary-green);border-radius:6px;background:var(--page-background-color);box-shadow:0 6px 18px var(--neutral-shadow-light);padding:8px 10px">
                <div style="height:6px;width:70%;background:var(--code-tag-background-color);border-radius:3px;margin-bottom:5px"></div>
                <div style="height:6px;width:90%;background:var(--code-tag-background-color);border-radius:3px"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== leader-line callouts ===== -->
        <!-- Header (top) : dot at (440,70), line up to chip -->
        <span :style="dotAt(440,68)"></span>
        <span :style="lineV(440,44,68)"></span>
        <span :style="chipAt(440,16,'center')">Header</span>

        <!-- NavBar (bottom-left) : dot in rail at (60,372) -->
        <span :style="dotAt(60,372)"></span>
        <span :style="lineV(60,372,404)"></span>
        <span :style="chipAt(60,410,'left')">NavBar</span>

        <!-- Content (bottom-center) : dot at (400,378) -->
        <span :style="dotAt(400,378)"></span>
        <span :style="lineV(400,378,404)"></span>
        <span :style="chipAt(400,410,'center')">Content panel</span>

        <!-- Overlay (bottom-right) : dot on the toast at (700,372) -->
        <span :style="dotAt(700,372)"></span>
        <span :style="lineV(700,372,404)"></span>
        <span :style="chipAt(700,410,'right')">Overlay layer (floats above)</span>
      </div>
    </div>`,
})
Anatomy.parameters = { controls: { disable: true }, docs: { description: { story: 'The **`Layout`** shell, with each region called out in its real position:\n\n- **Header** (top, `@header-height` 55px) — brand logo · global search · notifications · user menu. *The breadcrumb/back lives in the page header, not here.*\n- **NavBar** (left, `@nav-icon-width` 50px, `--nav-panel-bg`) — the 16 module icons; active = `--primary` pill. Collapsed to icons by default, expands on hover.\n- **Content panel** — `MLayoutContent` inside `FlotoScrollView`; the routed page `<slot/>` and the **only scrolling region**.\n- **Overlay** — OmniBox, the notification/toast components, and `PortalTarget`s, mounted at the shell level **above** the content.\n\nOther shells (EmptyLayout, LoginLayout, …) drop some of this chrome — see **Layout shells**.' } } }

// Interactive playground — toggle chrome on/off (Elastic-EUI style, in-canvas switches).
export const Playground = () => ({
  data: () => ({
    sidebar: true, header: true, overlay: true, empty: false,
    toggles: [
      { k: 'sidebar', label: 'Sidebar' },
      { k: 'header', label: 'Header' },
      { k: 'overlay', label: 'Overlay' },
      { k: 'empty', label: 'Empty content' },
    ],
    nav: ['dashboard', 'navbar-monitor', 'alert', 'report', 'topology', 'log', 'settings'],
  }),
  methods: {
    on(k) { return this[k] },
    flip(k) { this[k] = !this[k] },
    track(v) { return `display:inline-flex;align-items:center;justify-content:${v ? 'flex-end' : 'flex-start'};width:42px;height:24px;border-radius:12px;background:${v ? 'var(--primary)' : 'var(--neutral-light)'};padding:3px;box-sizing:border-box;transition:background .15s` },
    knob(v) { return `width:18px;height:18px;border-radius:50%;background:var(--page-background-color);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${v ? 'var(--primary)' : 'var(--neutral-light)'}` },
  },
  template: `
    <div style="color:var(--page-text-color);max-width:820px">
      <!-- toggle bar -->
      <div class="flex items-center" style="gap:22px;flex-wrap:wrap;margin-bottom:14px">
        <span v-for="t in toggles" :key="t.k" class="flex items-center" style="gap:8px;cursor:pointer;user-select:none" @click="flip(t.k)">
          <span :style="track(on(t.k))"><span :style="knob(on(t.k))">{{ on(t.k) ? '✓' : '✕' }}</span></span>
          <span style="font-size:13px">{{ t.label }}</span>
        </span>
      </div>

      <!-- the shell, driven by the toggles -->
      <div style="border:1px solid var(--border-color);border-radius:8px;overflow:hidden;height:400px;display:flex;background:var(--page-background-color)">
        <!-- NavBar -->
        <div v-if="sidebar" style="width:60px;flex-shrink:0;background:var(--nav-panel-bg);border-right:1px solid var(--border-color);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:9px">
          <span style="width:26px;height:26px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color);margin-bottom:4px"></span>
          <span v-for="i in 6" :key="i" :style="{width:'30px',height:'28px',borderRadius:'7px',background: i===2 ? 'var(--primary)':'var(--code-tag-background-color)',border: i===2 ? 'none':'1px solid var(--border-color)'}"></span>
        </div>

        <div style="flex:1;display:flex;flex-direction:column;min-width:0;position:relative">
          <!-- Header -->
          <div v-if="header" class="flex items-center justify-between" style="height:46px;border-bottom:1px solid var(--border-color);padding:0 16px;flex-shrink:0">
            <span style="width:88px;height:14px;border-radius:4px;background:var(--code-tag-background-color)"></span>
            <span class="flex items-center" style="gap:8px"><span style="width:24px;height:24px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></span><span style="width:24px;height:24px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></span><span style="width:24px;height:24px;border-radius:50%;background:var(--code-tag-background-color)"></span></span>
          </div>

          <!-- Content -->
          <div style="flex:1;min-height:0;overflow:hidden;background:var(--page-background-color)">
            <div v-if="empty" class="flex flex-col items-center justify-center" style="height:100%;gap:12px;padding:20px">
              <span style="width:54px;height:54px;border-radius:50%;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></span>
              <div class="font-600" style="font-size:15px">No items yet</div>
              <div class="text-neutral-light" style="font-size:12px">Create your first item to get started.</div>
              <span style="height:30px;width:120px;border-radius:4px;background:var(--code-tag-background-color);border:1px solid var(--border-color)"></span>
            </div>
            <div v-else style="height:100%;padding:16px 18px;display:flex;flex-direction:column">
              <div class="font-600" style="font-size:20px;margin-bottom:10px">Page title</div>
              <div style="height:1px;background:var(--border-color);margin-bottom:16px"></div>
              <div v-for="n in 6" :key="n" :style="{height:'18px',borderRadius:'4px',background:'var(--code-tag-background-color)',marginBottom:'14px',width: n===6 ? '55%':'100%'}"></div>
            </div>
          </div>

          <!-- Overlay (a toast, shell-level) -->
          <div v-if="overlay" style="position:absolute;right:16px;bottom:16px;width:170px;border:1px solid var(--border-color);border-left:3px solid var(--secondary-green);border-radius:6px;background:var(--page-background-color);box-shadow:0 6px 18px var(--neutral-shadow-light);padding:9px 11px">
            <div style="height:7px;width:70%;background:var(--code-tag-background-color);border-radius:3px;margin-bottom:6px"></div>
            <div style="height:7px;width:92%;background:var(--code-tag-background-color);border-radius:3px"></div>
          </div>
        </div>
      </div>
      <div class="text-neutral-light" style="font-size:11px;margin-top:10px">Toggle the chrome on/off. Turning <strong>Sidebar</strong> + <strong>Header</strong> off ≈ <code>EmptyLayout</code>; <strong>Empty content</strong> swaps the page body for an empty-state prompt; <strong>Overlay</strong> is the shell-level toast/portal layer.</div>
    </div>`,
})
Playground.parameters = { controls: { disable: true }, docs: { description: { story: 'An **interactive** version of the shell (Elastic-EUI style) — flip the in-canvas switches to add/remove **Sidebar**, **Header**, **Overlay**, and to swap the body for an **Empty content** prompt. Sidebar + Header off ≈ the `EmptyLayout` shell. The catalogued anatomy (with region callouts) is the **Anatomy** story above.' } } }
