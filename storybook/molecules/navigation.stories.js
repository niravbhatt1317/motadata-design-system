// Molecules / Navigation — the product's wayfinding components, by archetype:
//   • Primary nav (layout/navbar.vue, FlotoNavBar) — the left vertical MODULE nav (icon + label).
//   • Side menu (settings/left-menu.vue, MMenu/MCollapse) — a searchable collapsible SECTION menu.
//   • Steps (MSteps) — a numbered wizard/stepper (active · completed · remaining).
//   • Breadcrumb (compliance-breadcrumb.vue pattern) — back + context trail.
//   • Back button (_base-back-button.vue, FlotoBackButton) — a chevron-left link.
//   • Tabs — its own family (Molecules/Tabs); cross-referenced here.
// Reference reproductions (the live nav is router/store-bound). Built with real tokens + MIcon.

export default {
  title: 'Molecules/Navigation/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Molecule — the product\'s **navigation / wayfinding** components, by archetype. **Primary nav** (`FlotoNavBar`) — the left vertical **module** nav (icon + label, active highlighted). **Side menu** (`settings/left-menu.vue`, 20×) — a **searchable collapsible** section menu. **Steps** (`MSteps`) — a numbered **wizard/stepper**. **Breadcrumb** — back + context. **Back button** (`FlotoBackButton`). **Tabs** are their own family (**Molecules/Tabs**). Reference reproductions (the live nav is router/store-bound).',
      },
    },
  },
}

// 1. Primary nav — the REAL FlotoNavBar: a collapsible left sidebar (65px collapsed → 170px on hover),
//    ObserveOps logo, the actual 16 product modules with their real icons. Theme-aware (--nav-panel-bg).
export const PrimaryNav = () => ({
  data: () => ({
    active: 'inventory',
    expanded: false,
    hover: '',
    items: [
      { k: 'dashboard', n: 'Dashboards', i: 'dashboard' },
      { k: 'inventory', n: 'Monitors', i: 'navbar-monitor' },
      { k: 'alert', n: 'Alerts', i: 'alert' },
      { k: 'slo', n: 'SLO', i: 'slo', beta: true },
      { k: 'reports', n: 'Reports', i: 'report' },
      { k: 'topology', n: 'Topology', i: 'topology' },
      { k: 'nccm', n: 'NCCM', i: 'ncm' },
      { k: 'netroute', n: 'NetRoute', i: 'netroute' },
      { k: 'metric-explorer', n: 'Metric Explorer', i: 'metric-explorer' },
      { k: 'log', n: 'Log Explorer', i: 'log' },
      { k: 'apm', n: 'APM Explorer', i: 'apm' },
      { k: 'rum', n: 'RUM Explorer', i: 'rum' },
      { k: 'flow', n: 'Flow Explorer', i: 'flow' },
      { k: 'trap-viewer', n: 'Trap Explorer', i: 'trap-viewer' },
      { k: 'audit', n: 'Audits', i: 'audit' },
      { k: 'settings', n: 'Settings', i: 'settings' },
    ],
  }),
  template: `
    <div style="display:flex">
      <div @mouseenter="expanded=true" @mouseleave="expanded=false"
        style="position:relative;background:var(--nav-panel-bg);color:var(--nav-text-color);padding:6px 0;display:flex;flex-direction:column;min-height:560px;transition:width .15s;overflow:hidden"
        :style="{ width: expanded ? '170px' : '65px' }">
        <div class="flex items-center" style="height:48px;padding:0 18px;gap:12px;margin-bottom:8px;white-space:nowrap">
          <span style="position:relative;width:28px;height:28px;flex-shrink:0;border-radius:50%;background:conic-gradient(from 0deg, var(--secondary-red) 0deg 95deg, var(--nav-text-color) 95deg 360deg)">
            <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:13px;height:13px;border-radius:50%;background:var(--nav-panel-bg)"></span>
          </span>
          <span v-show="expanded" class="font-600" style="font-size:15px">ObserveOps</span>
        </div>
        <a v-for="m in items" :key="m.k" @click="active=m.k" @mouseenter="hover=m.k" @mouseleave="hover=''" class="flex items-center cursor-pointer" style="height:40px;margin:1px 8px;padding:0 13px;gap:14px;border-radius:8px;text-decoration:none;white-space:nowrap;color:inherit;flex-shrink:0;transition:background .12s"
          :style="{ color: active===m.k ? 'var(--nav-panel-bg)' : 'var(--nav-text-color)', background: active===m.k ? 'var(--primary)' : (hover===m.k ? 'var(--nav-hover-bg)' : 'transparent') }">
          <MIcon :name="m.i" size="lg" style="flex-shrink:0" />
          <span v-show="expanded" class="flex items-center" style="font-size:13px;gap:8px">{{ m.n }}<span v-if="m.beta" style="font-size:9px;padding:2px 7px;border-radius:5px;background:var(--code-tag-background-color);color:var(--nav-text-color);letter-spacing:.5px">BETA</span></span>
        </a>
        <div style="position:absolute;bottom:-22px;right:-12px;width:92px;height:92px;border-radius:50%;background:var(--secondary-green);opacity:.32;pointer-events:none"></div>
        <div style="position:absolute;bottom:-32px;right:20px;width:82px;height:82px;border-radius:50%;background:var(--secondary-yellow);opacity:.28;pointer-events:none"></div>
      </div>
      <div class="flex items-center justify-center text-neutral-light" style="flex:1;min-height:560px;font-size:12px">— hover the sidebar to expand —</div>
    </div>`,
})
PrimaryNav.parameters = { controls: { disable: true }, docs: { description: { story: 'The **primary nav** (`FlotoNavBar`, `layout/navbar.vue`) — a **collapsible left sidebar** (`MLayoutSider`): **collapsed to 65px (icon-only) by default**, **expands to 170px on hover** (`pinned`). Top is the **ObserveOps** logo (wordmark shown when expanded). The list is the **real 16 modules** — Dashboards · Monitors · Alerts · **SLO (BETA)** · Reports · Topology · NCCM · NetRoute · Metric/Log/APM/RUM/Flow/Trap Explorers · Audits · Settings — each a custom module icon + label, from `visibleMenuItems` (permission/role-gated). Active module highlights **`--primary`** on `--code-tag-background-color`; **hovering a non-active item** shows a subtle `--nav-hover-bg` pill (theme-aware — a darker tint on the light panel, a lighter tint on the dark panel). Theme-aware (`--nav-panel-bg` / `--nav-text-color`). **Hover the sidebar** to expand; click to switch active.' } } }

// 2. Side menu — searchable collapsible section menu (settings sub-nav).
export const SideMenu = () => ({
  data: () => ({
    active: 'monitoring',
    sections: [
      { k: 'general', n: 'General', i: 'cog', items: ['Branding', 'Date & Time', 'Localization'] },
      { k: 'monitoring', n: 'Monitoring', i: 'desktop', items: ['Monitor Templates', 'Metric Collection', 'Schedules'] },
      { k: 'users', n: 'Users & Roles', i: 'user', items: ['Users', 'Roles', 'LDAP'] },
      { k: 'integrations', n: 'Integrations', i: 'plug', items: ['Notification', 'Webhooks'] },
    ],
    open: 'monitoring',
  }),
  template: `
    <div style="width:280px;color:var(--page-text-color);border:1px solid var(--border-color);border-radius:6px;overflow:hidden">
      <div style="padding:8px"><MInput placeholder="Search" :allow-clear="false"><template v-slot:prefix><MIcon name="search" class="text-neutral-light" /></template></MInput></div>
      <div v-for="s in sections" :key="s.k">
        <div class="flex items-center cursor-pointer" style="padding:9px 12px;font-size:13px;font-weight:500" @click="open = open===s.k ? '' : s.k">
          <MIcon :name="'chevron-' + (open===s.k ? 'down' : 'right')" class="text-neutral-light mr-2" style="font-size:11px" />
          <MIcon :name="s.i" class="text-neutral-light mr-2" />{{ s.n }}
        </div>
        <div v-if="open===s.k" style="padding-bottom:4px">
          <a v-for="it in s.items" :key="it" @click="active=it" class="flex items-center cursor-pointer" style="padding:6px 12px 6px 40px;font-size:13px;text-decoration:none" :style="{ color: active===it ? 'var(--primary)' : 'var(--page-text-color)', background: active===it ? 'var(--code-tag-background-color)' : 'transparent', boxShadow: active===it ? 'inset 2px 0 0 var(--primary)' : 'none' }">{{ it }}</a>
        </div>
      </div>
    </div>`,
})
SideMenu.parameters = { controls: { disable: true }, docs: { description: { story: 'The **side menu** (`settings/left-menu.vue`, **20×**) — a **searchable, collapsible** section nav: a search box atop an **`MCollapse`** accordion of sections (icon + name, optional beta tag), each expanding to its sub-items. The active item highlights `--primary` with a `--primary` left rule. Used for the Settings sub-navigation and similar section trees. **This is one of several left-panel "side menu" forms** — see also **Side menu — tree**, **Side menu — categories**, and **Side menu — list / saved views** below. (The faceted checkbox sidebar is a *Filter* — see **Molecules/Filters → Vertical filter**.)' } } }

const NAV_BADGE = 'display:inline-flex;align-items:center;padding:1px 7px;border-radius:9px;background:var(--code-tag-background-color);color:var(--page-text-color);font-size:11px;margin-left:6px'

// 2a. Side menu — TREE (Log Explorer / Topology hierarchy: chevron + type icon + count badge, nested).
export const SideMenuTree = () => ({
  data: () => ({
    tab: 'Type', tabs: ['Type', 'Group', 'Saved Query'], active: 'syslog event',
    open: { syslog: true, linux: true, windows: true, other: false },
    tree: [
      { k: 'syslog', n: 'Syslog', i: 'question-circle', c: '57.25 M', kids: [{ n: 'syslog event', c: '57.25 M' }] },
      { k: 'other', n: 'Other', i: 'question-circle', c: '21.41 M', kids: [] },
      { k: 'linux', n: 'Linux', i: 'server', c: '9.86 M', kids: [{ n: 'Linux Syslog', c: '9.61 M' }, { n: 'Linux Login Audit', c: '242.89 K' }, { n: 'Linux Logout Audit', c: '10.46 K' }, { n: 'kt log', c: '140' }] },
      { k: 'windows', n: 'Windows', i: 'desktop', c: '1.28 M', kids: [{ n: 'Windows Event New', c: '339.16 K' }, { n: 'Windows Event', c: '339.16 K' }, { n: 'Windows Login Audit', c: '25.15 K' }] },
    ],
    saved: ['Errors last 24h', 'Failed logins', 'Windows audit'],
  }),
  methods: { badge: () => NAV_BADGE },
  template: `
    <div style="width:290px;color:var(--page-text-color);border:1px solid var(--border-color);border-radius:6px;overflow:hidden">
      <div class="flex" style="border-bottom:1px solid var(--border-color);gap:18px;padding:0 12px">
        <div v-for="t in tabs" :key="t" @click="tab=t" class="cursor-pointer" style="padding:8px 2px;font-size:13px" :style="{ color: tab===t?'var(--primary)':'var(--neutral-light)', borderBottom: tab===t?'2px solid var(--primary)':'2px solid transparent', fontWeight: tab===t?600:400 }">{{ t }}</div>
      </div>
      <div style="padding:8px"><div class="flex items-center" style="height:34px;padding:0 10px;gap:8px;border:1px solid var(--border-color);border-radius:4px;color:var(--neutral-light)"><MIcon name="search" style="font-size:12px" /><span style="font-size:13px">Search</span></div></div>
      <div v-if="tab!=='Saved Query'" style="padding-bottom:6px;max-height:340px;overflow:auto">
        <template v-for="g in tree">
          <a :key="g.k" @click="open={...open,[g.k]:!open[g.k]}" class="flex items-center cursor-pointer" style="padding:6px 12px;font-size:13px;text-decoration:none;color:inherit">
            <MIcon :name="'chevron-' + (open[g.k]?'down':'right')" class="text-neutral-light" style="font-size:10px;width:14px" />
            <MIcon :name="g.i" class="text-primary-alt" style="margin:0 8px" /><span>{{ g.n }}</span><span :style="badge()">{{ g.c }}</span>
          </a>
          <template v-if="open[g.k]">
            <a v-for="c in g.kids" :key="g.k+c.n" @click="active=c.n" class="flex items-center cursor-pointer" style="padding:5px 12px 5px 34px;font-size:13px;text-decoration:none" :style="{ color: active===c.n?'var(--primary)':'var(--page-text-color)', background: active===c.n?'var(--code-tag-background-color)':'transparent' }">
              <MIcon name="chevron-right" class="text-neutral-light" style="font-size:10px;width:14px" /><span style="flex:1">{{ c.n }}</span><span :style="badge()">{{ c.c }}</span>
            </a>
          </template>
        </template>
      </div>
      <div v-else style="padding:4px 0 8px">
        <a class="flex items-center text-primary cursor-pointer" style="padding:6px 12px;font-size:13px;text-decoration:none"><MIcon name="plus" class="mr-2" style="font-size:11px" />Create New</a>
        <a v-for="q in saved" :key="q" class="flex items-center justify-between cursor-pointer" style="padding:7px 12px;font-size:13px;text-decoration:none;color:inherit"><span>{{ q }}</span><MIcon name="trash-alt" class="text-neutral-light" style="font-size:12px" /></a>
      </div>
    </div>`,
})
SideMenuTree.storyName = 'Side menu — tree (Log / Topology hierarchy)'
SideMenuTree.parameters = { controls: { disable: true }, docs: { description: { story: 'The **tree** side-menu — the **Log Explorer** "Type / Group / Saved Query" panel (`log/components/hierarchy/*`) and **Topology** hierarchy (`topology-hierarchy.vue`), both built on the shared **`components/hierarchy/infinite-tree.vue`**. Top **tabs**, a **search**, then a **virtualised hierarchy**: each node has an **expand chevron**, a **type icon** (Syslog/Linux/Windows; Topology uses severity badges), the **name**, and a **count badge** (e.g. `57.25 M`); selecting a leaf filters the grid/graph. The **Saved Query** tab is a flat `MMenu` list with **Create New** + hover-delete. (Reference reproduction — the live tree is store/worker-bound.)' } } }

// 2b. Side menu — CATEGORY LIST (Dashboard: MRadioGroup as-button tabs + MCollapse categories → dashboards).
export const SideMenuCategories = () => ({
  data: () => ({
    tab: 'dashboard',
    tabOptions: [{ text: 'Dashboard', value: 'dashboard' }, { text: 'NOC View', value: 'noc' }],
    active: 'Linux Servers',
    open: { Server: true },
    cats: [
      { n: 'My Favorite', c: 7, kids: ['Server Overview', 'Network Health', 'Top Talkers'] },
      { n: 'Recently Viewed', c: 10, kids: ['CPU & Memory', 'Disk Usage'] },
      { n: 'Overview', c: 4, kids: ['Infra Summary', 'SLA Overview'] },
      { n: 'Server', c: 6, kids: ['Linux Servers', 'Windows Servers', 'VMware Hosts'] },
      { n: 'Network', c: 10, kids: ['Switches', 'Routers', 'Interfaces', 'WAN Links'] },
      { n: 'SDN', c: 2, kids: ['SD-WAN', 'Fabric'] },
      { n: 'Cloud', c: 2, kids: ['AWS', 'Azure'] },
      { n: 'Virtualization', c: 6, kids: ['Clusters', 'VMs'] },
      { n: 'HCI', c: 1, kids: ['Nutanix'] },
      { n: 'Applications', c: 5, kids: ['APM Services', 'Web Apps'] },
      { n: 'Database', c: 4, kids: ['MySQL', 'Postgres'] },
      { n: 'Log', c: 15, kids: ['Syslog', 'Windows Events'] },
      { n: 'Flow', c: 2, kids: ['Top Flows', 'Conversations'] },
    ],
  }),
  methods: { toggle(n) { this.open = { ...this.open, [n]: !this.open[n] } } },
  template: `
    <div style="width:340px;color:var(--page-text-color)">
      <div class="flex items-center justify-between mb-3" style="gap:8px">
        <MRadioGroup v-model="tab" :options="tabOptions" as-button />
        <MButton shape="circle" :rounded="false" class="flex items-center justify-center" style="width:35px;height:35px;flex-shrink:0"><MIcon name="plus" size="lg" /></MButton>
      </div>
      <div class="flex items-center mb-2" style="gap:8px">
        <div class="flex items-center" style="flex:1;height:34px;padding:0 10px;gap:8px;border:1px solid var(--border-color);border-radius:4px;color:var(--neutral-light)"><MIcon name="search" style="font-size:12px" /><span style="font-size:13px">Search</span></div>
        <MButton shape="circle" class="squared-button" variant="neutral-lightest" style="flex-shrink:0"><MIcon name="custom-dashboard" size="lg" /></MButton>
      </div>
      <div v-if="tab==='dashboard'" style="max-height:330px;overflow:auto">
        <div v-for="c in cats" :key="c.n">
          <a @click="toggle(c.n)" class="flex items-center cursor-pointer" style="padding:9px 6px;font-size:14px;text-decoration:none;color:inherit">
            <MIcon :name="'chevron-' + (open[c.n] ? 'down' : 'right')" class="text-neutral-light" style="font-size:11px;width:16px" />
            <span style="flex:1">{{ c.n }}</span>
            <span :style="'${NAV_BADGE}'">{{ c.c }}</span>
          </a>
          <div v-if="open[c.n]" style="padding-bottom:2px">
            <a v-for="d in c.kids" :key="d" @click="active=d" class="flex items-center cursor-pointer" style="padding:7px 6px 7px 28px;font-size:13px;text-decoration:none;border-radius:4px" :style="{ color: active===d ? 'var(--primary)' : 'var(--page-text-color)', background: active===d ? 'var(--code-tag-background-color)' : 'transparent' }">
              <MIcon name="th-large" class="text-neutral-light" style="font-size:12px;margin-right:8px" /><span style="flex:1">{{ d }}</span>
            </a>
          </div>
        </div>
      </div>
      <div v-else class="text-neutral-light" style="padding:16px 6px;font-size:13px">NOC View list — full-screen wallboards.</div>
    </div>`,
})
SideMenuCategories.storyName = 'Side menu — categories (Dashboard)'
SideMenuCategories.parameters = { controls: { disable: true }, docs: { description: { story: 'The **category-list** side-menu — the **Dashboard** picker (`dashboard/components/dashboard-dropdown.vue`). Tabs are the real **`MRadioGroup as-button`** segmented control (**Dashboard / NOC View**) + a round **＋** create button; a **search** + the `custom-dashboard` layout toggle; then an **`MCollapse`** accordion of **categories with count tags** (My Favorite 7, Server 6 …). **Click a category to expand it** to its child dashboards (chevron rotates); selecting a dashboard highlights it. (Reference reproduction; collapse + tabs are interactive.)' } } }

// 2c. Side menu — LIST with inline edit (Report sidebar / saved views).
export const SideMenuList = () => ({
  data: () => ({
    tab: 'Metric', tabs: ['Metric', 'Log', 'Flow', 'Trap', 'Audit'], active: 'All Reports', hover: '',
    items: [{ n: 'Favorites', star: true }, { n: 'All Reports' }, { n: 'Config' }, { n: 'Inventory', edit: true }, { n: 'Performance', edit: true }, { n: 'Flow Reports' }, { n: 'WAN Link' }, { n: 'Alert' }, { n: 'Virtualization' }, { n: 'Availability' }, { n: 'Wireless' }, { n: 'Network' }, { n: 'Server' }, { n: 'SDN', edit: true }, { n: 'Service Check' }, { n: 'Process' }],
  }),
  template: `
    <div style="width:300px;color:var(--page-text-color);border:1px solid var(--border-color);border-radius:6px;overflow:hidden">
      <div class="flex" style="border-bottom:1px solid var(--border-color);gap:16px;padding:0 12px">
        <div v-for="t in tabs" :key="t" @click="tab=t" class="cursor-pointer" style="padding:8px 2px;font-size:13px" :style="{ color: tab===t?'var(--primary)':'var(--neutral-light)', borderBottom: tab===t?'2px solid var(--primary)':'2px solid transparent', fontWeight: tab===t?600:400 }">{{ t }}</div>
      </div>
      <div style="padding:8px"><div class="flex items-center" style="height:34px;padding:0 10px;gap:8px;border:1px solid var(--border-color);border-radius:4px;color:var(--neutral-light)"><MIcon name="search" style="font-size:12px" /><span style="font-size:13px">Search</span></div></div>
      <div style="max-height:330px;overflow:auto;padding-bottom:6px">
        <a v-for="it in items" :key="it.n" @click="active=it.n" @mouseenter="hover=it.n" @mouseleave="hover=''" class="flex items-center cursor-pointer" style="padding:9px 12px;font-size:14px;text-decoration:none;border-bottom:1px solid var(--border-color)" :style="{ color: active===it.n?'var(--primary)':'var(--page-text-color)', background: active===it.n?'var(--code-tag-background-color)':'transparent', fontWeight: active===it.n?600:400 }">
          <MIcon v-if="it.star" name="star" style="color:var(--secondary-yellow);margin-right:8px" />
          <span style="flex:1">{{ it.n }}</span>
          <MIcon v-if="it.edit && (hover===it.n || active===it.n)" name="pencil" class="text-neutral-light" style="font-size:12px" />
        </a>
      </div>
    </div>`,
})
SideMenuList.storyName = 'Side menu — list / saved views (Report)'
SideMenuList.parameters = { controls: { disable: true }, docs: { description: { story: 'The **list** side-menu — the **Report** sidebar (`report/components/report-sidebar.vue`) and the **saved-views** sidebars (`ExplorerSavedViewList`, reused by **APM / RUM / Metric Explorer**, and the Log **Saved Query** tab). Top **tabs** (Metric / Log / Flow / Trap / Audit), a **search**, then a flat `MMenu` **list** with a **Favorites** (★) row, an **active** highlight (All Reports), and a per-row **pencil** to inline-rename user categories. (Reference reproduction.)' } } }

// 2d. Metric picker — a transfer-style PICKER (Metric Explorer). Cross-referenced (not pure nav).
export const MetricPicker = () => ({
  data: () => ({
    tab: 'Metric', monitor: 'zimbra-server',
    metrics: ['system.memory.free.percent', 'system.memory.free.bytes', 'system.load.avg1.min', 'system.cpu.percent', 'system.load.avg5.min', 'system.memory.used.percent', 'system.load.avg15.min', 'system.memory.available.bytes', 'system.memory.used.bytes', 'system.blocked.processes', 'system.swap.memory.free.bytes', 'system.running.processes'],
  }),
  template: `
    <div style="width:360px;color:var(--page-text-color)">
      <div class="flex items-center justify-between mb-3"><div class="font-600" style="border-bottom:2px solid var(--primary);padding-bottom:4px;font-size:14px">{{ monitor }}</div><span class="flex items-center justify-center cursor-pointer" style="width:30px;height:30px;border-radius:6px;background:var(--code-tag-background-color);color:var(--primary)"><MIcon name="plus" /></span></div>
      <div class="text-neutral-light mb-1" style="font-size:12px">Select Monitor</div>
      <div class="flex items-center justify-between mb-3" style="height:36px;padding:0 12px;border:1px solid var(--border-color);border-radius:4px;font-size:13px">{{ monitor }}<MIcon name="chevron-down" class="text-neutral-light" style="font-size:11px" /></div>
      <div class="flex" style="border-bottom:1px solid var(--border-color);gap:18px;margin-bottom:8px">
        <div v-for="t in ['Metric','Instance']" :key="t" @click="tab=t" class="cursor-pointer" style="padding:6px 2px;font-size:13px" :style="{ color: tab===t?'var(--primary)':'var(--neutral-light)', borderBottom: tab===t?'2px solid var(--primary)':'2px solid transparent', fontWeight: tab===t?600:400 }">{{ t }}</div>
      </div>
      <div class="flex items-center mb-2" style="height:34px;padding:0 10px;gap:8px;border:1px solid var(--border-color);border-radius:4px;color:var(--neutral-light)"><MIcon name="search" style="font-size:12px" /><span style="font-size:13px">Search</span></div>
      <div style="max-height:300px;overflow:auto">
        <div v-for="m in metrics" :key="m" class="flex items-center justify-between" style="padding:9px 4px;font-size:13px">
          <span class="flex items-center" style="gap:10px;min-width:0"><MIcon name="plus-circle" class="text-primary-alt cursor-pointer" /><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ m }}</span></span>
          <MIcon name="drag-arrows" class="text-neutral-light cursor-pointer" style="flex-shrink:0;margin-left:8px" />
        </div>
      </div>
    </div>`,
})
MetricPicker.storyName = 'Metric picker (Metric Explorer — a picker)'
MetricPicker.parameters = { controls: { disable: true }, docs: { description: { story: '**Not navigation — a *picker*** (catalogued here because it is a left-panel of the explorer family; cross-referenced). The **Metric Explorer** metric picker (`metric-explorer/components/metric-picker.vue` → `counter-selector.vue` → `counter-list.vue`): a monitor tab + **＋**, a **Select Monitor** dropdown, **Metric / Instance** tabs, a **search**, then a virtualised list (`RecycleScroller`, 40px rows) where each metric has a **⊕ add** icon (add to the chart) and a **drag handle** (`drag-arrows`) to reorder. The `Instance` tab swaps in an instance-type selector + table. A *transfer/picker* pattern — see also **DropdownPicker**. (Reference reproduction.)' } } }

// 3. Steps — a numbered wizard/stepper (active · completed · remaining).
export const Steps = () => ({
  data: () => ({ current: 2, steps: [{ k: 1, t: 'Report Properties' }, { k: 2, t: 'Visualizations & Preview' }, { k: 3, t: 'Schedule' }] }),
  methods: {
    circle(k) {
      const base = { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, flexShrink: 0 }
      if (k < this.current) return { ...base, background: 'var(--primary)', color: 'var(--page-background-color)' }
      if (k === this.current) return { ...base, background: 'var(--primary)', color: 'var(--page-background-color)', boxShadow: '0 0 0 4px var(--code-tag-background-color)' }
      return { ...base, background: 'var(--neutral-lightest)', color: 'var(--neutral-light)' }
    },
  },
  template: `
    <div style="color:var(--page-text-color);max-width:600px">
      <div class="text-neutral-light mb-4" style="font-size:12px">Horizontal wizard — the <code>report-steps.vue</code> (<code>ReportSteps</code>) pattern from the report builder. Click a step. Completed = filled ✓, current = ringed, remaining = grey.</div>
      <div class="flex items-center">
        <template v-for="(s, i) in steps">
          <div :key="s.k" class="flex items-center cursor-pointer" @click="current=s.k">
            <div :style="circle(s.k)"><MIcon v-if="s.k < current" name="check" style="font-size:11px" /><span v-else>{{ s.k }}</span></div>
            <span class="ml-2" style="font-size:13px" :style="{ color: s.k===current ? 'var(--primary)' : s.k<current ? 'var(--page-text-color)' : 'var(--neutral-light)', fontWeight: s.k===current ? 600 : 400 }">{{ s.t }}</span>
          </div>
          <div v-if="i < steps.length-1" :key="'l'+s.k" style="flex:1;height:1px;margin:0 12px" :style="{ background: s.k < current ? 'var(--primary)' : 'var(--border-color)' }"></div>
        </template>
      </div>
    </div>`,
})
Steps.parameters = { controls: { disable: true }, docs: { description: { story: 'The **stepper** — a numbered **wizard** nav (all steppers are **bespoke**; the product has no `MSteps`). This is the **report builder** pattern (`report-steps.vue`): *Report Properties → Visualizations & Preview → Schedule*. Each step is a **count circle + label** in one of three states — **completed** (filled, ✓), **current** (filled + ring), **remaining** (grey); connectors fill `--primary` up to the current step. See **Setup guide steps** for the vertical variant. Click a step.' } } }

export const SetupGuideSteps = () => ({
  data: () => ({
    steps: [
      { i: 1, title: 'Install & configure the agent', desc: 'Deploy the Motadata agent on the host you want to collect logs from.', done: true },
      { i: 2, title: 'Add a log source', desc: 'Point a file, syslog, or application source at the agent.', done: true },
      { i: 3, title: 'Ingest logs', desc: 'Start streaming — verify events are arriving in the pipeline.', done: false },
      { i: 4, title: 'Search & visualize', desc: 'Build a search and pin it to a Log Explorer dashboard.', done: false },
    ],
  }),
  methods: {
    box(done) {
      const base = { width: '50px', height: '50px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, flexShrink: 0, background: 'var(--widget-background-color)', border: '2px solid var(--border-color)' }
      return done ? { ...base, borderColor: 'var(--secondary-green)' } : base
    },
  },
  template: `
    <div style="color:var(--page-text-color);max-width:520px">
      <div class="text-neutral-light mb-4" style="font-size:12px">Vertical guide steps — the <code>product-setup</code> onboarding pattern (<code>guide-section-step.vue</code>): a 50×50 rounded index box (number → green ✓ when done), title + description. Used for the Log / Metric / Flow setup guides.</div>
      <div v-for="(s, idx) in steps" :key="s.i" class="flex" :style="{ marginBottom: idx < steps.length-1 ? '24px' : '0' }">
        <div class="mr-6" :style="box(s.done)">
          <MIcon v-if="s.done" name="check" class="text-secondary-green" size="lg" />
          <span v-else>{{ s.i }}</span>
        </div>
        <div>
          <h3 class="mb-0 font-600" style="font-size:15px;color:var(--page-text-color)">{{ s.title }}</h3>
          <div class="text-neutral-light" style="font-size:13px">{{ s.desc }}</div>
        </div>
      </div>
    </div>`,
})
SetupGuideSteps.parameters = { controls: { disable: true }, docs: { description: { story: 'The **vertical** stepper — the **product setup / onboarding guide** pattern (`product-setup/components/guide-section-step.vue`). Each step is a **50×50 rounded index box** (`border-radius:20px`, `--border-color` border) showing the **number**, switching to a **green ✓ on a `--secondary-green` border** when the step is **completed**, beside a **title + description**. Unlike the horizontal report wizard there is **no connector line** — steps are stacked with spacing. Also used (with section dots) in `guide-sections.vue` for the Log / Metric / Flow data-setup guides.' } } }

// 4. Breadcrumb — back + context trail.
export const Breadcrumb = () => ({
  template: `
    <div style="color:var(--page-text-color)">
      <div class="flex items-center" style="padding:8px 0;border-bottom:1px solid var(--border-color);gap:6px;font-size:13px">
        <MIcon name="chevron-left" class="cursor-pointer text-neutral-light" />
        <a class="text-neutral-light cursor-pointer" style="text-decoration:none">Reports</a>
        <span class="text-neutral-light">/</span>
        <a class="text-neutral-light cursor-pointer" style="text-decoration:none">Compliance</a>
        <span class="text-neutral-light">/</span>
        <span class="font-500">PCI-DSS Audit</span>
      </div>
    </div>`,
})
Breadcrumb.parameters = { controls: { disable: true }, docs: { description: { story: 'A **breadcrumb / back-context** trail (e.g. `compliance-breadcrumb.vue`) — a **back chevron** + the path (`Reports / Compliance / PCI-DSS Audit`), the current crumb in **font-500**. Gives location + a one-click way up. (Some product breadcrumbs are a back + title/subtitle context header rather than a full trail.)' } } }

// 5. Back button — a chevron-left link (FlotoBackButton).
export const BackButton = () => ({
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-2" style="font-size:12px"><code>FlotoBackButton</code> — a chevron-left router link (3×), usually before a page title.</div>
      <div class="flex items-center" style="gap:10px"><MIcon name="chevron-left" size="lg" class="text-neutral-light cursor-pointer" /><span class="font-500" style="font-size:16px;color:var(--primary-alt)">Monitor Details</span></div>
    </div>`,
})
BackButton.parameters = { controls: { disable: true }, docs: { description: { story: 'The **`FlotoBackButton`** (`_base-back-button.vue`, 3×) — a `chevron-left` `MIcon` in a `FlotoLink` (router `:to`). The smallest nav atom; sits before a page/detail title (it\'s the `back-button` slot of the **Page header** toolbar).' } } }

// ---- App-chrome & specialised navigators (from the 2026-06-16 per-module Navigation sweep) ----

// Real theme-toggle glyphs from user-dropdown.vue (moon / sun / auto-half).
const SVG = 'width:16px;height:16px;display:block'
const MOON_SVG = '<svg viewBox="0 0 48 48" style="' + SVG + '"><path fill="currentColor" d="M18.7215 6.58584C19.3318 7.19608 19.4818 8.12893 19.0936 8.8997C18.0814 10.9094 17.5104 13.1807 17.5104 15.5912C17.5104 23.8194 24.1807 30.4896 32.4088 30.4896C34.8192 30.4896 37.0907 29.9187 39.1003 28.9064C39.8712 28.5184 40.804 28.6683 41.4141 29.2784C42.0245 29.8888 42.1744 30.8216 41.7861 31.5923C38.6792 37.7613 32.2856 42 24.8985 42C14.4611 42 6 33.5389 6 23.1016C6 15.7144 10.2388 9.32082 16.4077 6.21381C17.1785 5.82562 18.1113 5.9756 18.7215 6.58584ZM13.6434 13.3392C11.3727 15.9549 10 19.3687 10 23.1016C10 31.3299 16.6703 38 24.8985 38C28.6315 38 32.0453 36.6272 34.6608 34.3565C33.9221 34.4445 33.1707 34.4896 32.4088 34.4896C21.9715 34.4896 13.5104 26.0285 13.5104 15.5912C13.5104 14.8295 13.5556 14.0779 13.6434 13.3392Z"/></svg>'
const SUN_SVG = '<svg viewBox="0 0 48 48" style="' + SVG + '"><path fill="currentColor" d="M24 4C25.1046 4 26 4.89544 26 6V8C26 9.10456 25.1046 10 24 10C22.8954 10 22 9.10456 22 8V6C22 4.89544 22.8954 4 24 4ZM38.1421 9.85784C38.9232 10.6389 38.9232 11.9052 38.1421 12.6863L36.728 14.1005C35.9469 14.8815 34.6805 14.8815 33.8997 14.1005C33.1187 13.3194 33.1187 12.0531 33.8997 11.2721L35.3139 9.85784C36.0949 9.0768 37.3611 9.0768 38.1421 9.85784ZM9.85784 9.85784C10.6389 9.0768 11.9052 9.0768 12.6863 9.85784L14.1005 11.2721C14.8815 12.0531 14.8815 13.3194 14.1005 14.1005C13.3194 14.8815 12.0531 14.8815 11.2721 14.1005L9.85784 12.6863C9.0768 11.9052 9.0768 10.6389 9.85784 9.85784ZM24 16C19.5817 16 16 19.5817 16 24C16 28.4184 19.5817 32 24 32C28.4184 32 32 28.4184 32 24C32 19.5817 28.4184 16 24 16ZM12 24C12 17.3726 17.3726 12 24 12C30.6275 12 36 17.3726 36 24C36 30.6275 30.6275 36 24 36C17.3726 36 12 30.6275 12 24ZM4 24C4 22.8954 4.89544 22 6 22H8C9.10456 22 10 22.8954 10 24C10 25.1046 9.10456 26 8 26H6C4.89544 26 4 25.1046 4 24ZM38 24C38 22.8954 38.8955 22 40 22H42C43.1045 22 44 22.8954 44 24C44 25.1046 43.1045 26 42 26H40C38.8955 26 38 25.1046 38 24ZM11.2721 33.8995C12.0531 33.1184 13.3194 33.1184 14.1005 33.8995C14.8815 34.6805 14.8815 35.9469 14.1005 36.728L12.6863 38.1421C11.9052 38.9232 10.6389 38.9232 9.85784 38.1421C9.0768 37.3611 9.0768 36.0947 9.85784 35.3136L11.2721 33.8995ZM33.8997 36.728C33.1187 35.9469 33.1187 34.6805 33.8997 33.8995C34.6805 33.1184 35.9469 33.1184 36.728 33.8995L38.1421 35.3136C38.9232 36.0947 38.9232 37.3611 38.1421 38.1421C37.3611 38.9232 36.0949 38.9232 35.3139 38.1421L33.8997 36.728ZM24 38C25.1046 38 26 38.8955 26 40V42C26 43.1045 25.1046 44 24 44C22.8954 44 22 43.1045 22 42V40C22 38.8955 22.8954 38 24 38Z"/></svg>'
const AUTO_SVG = '<svg viewBox="0 0 48 48" style="' + SVG + '"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M24 4.7998L24.4951 4.80566C34.8702 5.06837 43.2002 13.5617 43.2002 24C43.2001 34.4383 34.8701 42.9306 24.4951 43.1934L24 43.2002L23.5234 43.1943C18.8412 43.0347 14.7347 41.336 11.5361 38.6035C10.8999 38.0552 10.3703 37.5414 9.87109 36.999C9.47574 36.5571 9.31932 36.3756 9.16699 36.1904C6.58781 33.0019 5.03397 29.166 4.82422 24.9756C4.80577 24.5038 4.79981 24.2525 4.7998 24C4.7998 23.738 4.80699 23.4772 4.81738 23.2178C5.14832 18.5444 6.68782 14.8606 9.08887 11.9043C9.33852 11.5992 9.51531 11.3953 9.69531 11.1943C10.3834 10.4564 10.7329 10.1106 11.0967 9.78027C11.3964 9.51317 11.6001 9.3378 11.8076 9.16699C15.0251 6.57743 18.8485 5.03317 23.0244 4.82422C23.167 4.81826 23.2383 4.81543 23.2383 4.81543C23.4909 4.80558 23.745 4.7998 24 4.7998ZM24 39.2002C32.3945 39.2001 39.2001 32.3945 39.2002 24C39.2002 15.7366 32.6057 9.01301 24.3926 8.80469L24 8.7998V39.2002Z"/></svg>'

// 6. User account menu — header avatar -> dropdown (profile / 3-way theme / logout).
export const UserMenu = () => ({
  data: () => ({ theme: 'light', themes: [{ value: 'dark', text: 'Dark', svg: MOON_SVG }, { value: 'light', text: 'Light', svg: SUN_SVG }, { value: 'auto', text: 'Auto', svg: AUTO_SVG }] }),
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <strong>user account menu</strong> (<code>layout/user-dropdown.vue</code>) — an <code>MPopover</code> (placement bottomRight) off the header avatar.</div>
      <div style="width:330px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 8px 26px var(--neutral-shadow-light);overflow:hidden">
        <div class="flex items-center bg-neutral-lightest" style="padding:18px;gap:14px">
          <span class="flex items-center justify-center" style="width:60px;height:60px;border-radius:50%;background:var(--primary-alt);color:var(--white-regular);flex-shrink:0"><MIcon name="user" size="2x" /></span>
          <div style="min-width:0"><div class="font-700" style="font-size:18px">motadata admin</div><div class="text-neutral-light" style="font-size:13px">admin</div></div>
        </div>
        <div style="padding:8px 0">
          <a class="flex items-center cursor-pointer" style="padding:13px 20px;font-size:15px;text-decoration:none;color:inherit"><MIcon name="my-profile" size="lg" class="mr-3" />My Profile</a>
          <a class="flex items-center cursor-pointer" style="padding:13px 20px;font-size:15px;text-decoration:none;color:inherit"><MIcon name="tour" size="lg" class="mr-3" />Product Setup Guide</a>
          <a class="flex items-center cursor-pointer" style="padding:13px 20px;font-size:15px;text-decoration:none;color:inherit"><MIcon name="help" size="lg" class="mr-3" />Documentation</a>
        </div>
        <div style="height:1px;margin:0 18px;background:var(--border-color)"></div>
        <div style="padding:12px 18px"><div class="flex" style="background:var(--neutral-lightest);border-radius:8px;padding:4px;gap:3px">
          <div v-for="th in themes" :key="th.value" @click="theme=th.value" class="flex items-center justify-center cursor-pointer flex-1" style="gap:7px;padding:10px 4px;border-radius:6px;font-size:14px" :style="{ background: theme===th.value ? 'var(--primary)' : 'transparent', color: theme===th.value ? 'var(--page-background-color)' : 'var(--neutral-regular)' }"><span v-html="th.svg" style="display:inline-flex;align-items:center"></span>{{ th.text }}</div>
        </div></div>
        <div style="height:1px;margin:0 18px;background:var(--border-color)"></div>
        <div style="padding:12px 18px"><a class="flex items-center cursor-pointer bg-neutral-lightest" style="padding:14px 18px;font-size:15px;text-decoration:none;border-radius:8px;color:var(--secondary-red)">Logout</a></div>
      </div>
    </div>`,
})
UserMenu.storyName = 'App chrome — user account menu'
UserMenu.parameters = { controls: { disable: true }, docs: { description: { story: 'The **user account menu** (`components/layout/user-dropdown.vue`) — an `MPopover` (placement `bottomRight`) opened from the header **avatar** (a name-seeded gradient `FlotoUserAvatar`): a user-info header (name + role), links to **My Profile / Product Setup Guide / Documentation**, a **3-way theme** segmented toggle — **Dark (moon) / Light (sun) / Auto (half)** with the product’s real glyphs (the product hand-rolls this control — a light container + a filled selected segment — *not* the DS Radio, so the reproduction matches it) — and a **Logout** row in `--secondary-red`. Global app chrome. (Reference reproduction; click the theme segments.)' } } }

// 7. Notification dropdown — bell + badge -> tabbed alerts / system list.
export const NotificationMenu = () => ({
  data: () => ({ tab: 'alerts', alerts: [{ s: 'critical', t: 'CPU > 95% on db-primary', a: '2m ago' }, { s: 'major', t: 'Interface Gi0/1 down — core-switch-01', a: '11m ago' }, { s: 'warning', t: 'Disk 82% on web-server-03', a: '1h ago' }] }),
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <strong>notification dropdown</strong> (<code>layout/notification-dropdown.vue</code>) — the header <strong>bell</strong> + count badge.</div>
      <div style="width:340px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 8px 26px var(--neutral-shadow-light);overflow:hidden">
        <div class="font-600" style="padding:12px 14px;font-size:14px;border-bottom:1px solid var(--border-color)">Alerts &amp; Notifications</div>
        <div class="flex" style="border-bottom:1px solid var(--border-color);gap:16px;padding:0 14px">
          <div @click="tab='alerts'" class="cursor-pointer" style="padding:8px 2px;font-size:13px" :style="{ color: tab==='alerts'?'var(--primary)':'var(--neutral-light)', borderBottom: tab==='alerts'?'2px solid var(--primary)':'2px solid transparent', fontWeight: tab==='alerts'?600:400 }">Alerts (3)</div>
          <div @click="tab='system'" class="cursor-pointer" style="padding:8px 2px;font-size:13px" :style="{ color: tab==='system'?'var(--primary)':'var(--neutral-light)', borderBottom: tab==='system'?'2px solid var(--primary)':'2px solid transparent', fontWeight: tab==='system'?600:400 }">System Notification (1)</div>
        </div>
        <div style="max-height:240px;overflow:auto">
          <div v-for="(n,i) in alerts" :key="i" class="flex items-start" style="padding:10px 14px;gap:10px;border-bottom:1px solid var(--border-color)">
            <span :style="{ width:'8px', height:'8px', borderRadius:'50%', marginTop:'5px', flexShrink:0, background:'var(--severity-'+n.s+')' }"></span>
            <div style="flex:1;min-width:0"><div style="font-size:13px">{{ n.t }}</div><div class="text-neutral-light" style="font-size:11px">{{ n.a }}</div></div>
          </div>
        </div>
        <div class="flex justify-between" style="padding:8px 14px;border-top:1px solid var(--border-color)"><a class="text-primary cursor-pointer" style="font-size:12px;text-decoration:none">View All</a><a class="text-neutral-light cursor-pointer" style="font-size:12px;text-decoration:none">Clear All</a></div>
      </div>
    </div>`,
})
NotificationMenu.storyName = 'App chrome — notification dropdown'
NotificationMenu.parameters = { controls: { disable: true }, docs: { description: { story: 'The **notification dropdown** (`components/layout/notification-dropdown.vue`) — the header **bell** (with an `MBadge` count) opens an `MPopover` with **Alerts / System Notification** tabs (`MTab`), a virtualised list (`RecycleScroller`) of items (severity dot + text + time), and **View All / Clear All**. Global app chrome. (Reference reproduction.)' } } }

// 8. Global search / Omnibox — command/search palette.
export const Omnibox = () => ({
  data: () => ({
    q: '', category: 'Metric', catOpen: false, timeOpen: false, lastRun: '',
    categories: ['Metric', 'Log', 'Flow', 'Trap', 'Audit'],
    range: { s: '1h', t: 'Last 1 Hour' },
    ranges: [
      { s: '5m', t: 'Last 5 Mins' }, { s: '15m', t: 'Last 15 Mins' }, { s: '30m', t: 'Last 30 Mins' },
      { s: '1h', t: 'Last 1 Hour' }, { s: '6h', t: 'Last 6 Hours' }, { s: '24h', t: 'Last 24 Hours' },
      { s: 'today', t: 'Today' }, { s: '1w', t: 'Last Week' },
    ],
  }),
  methods: {
    run() { if (this.q.trim()) this.lastRun = this.category + ' · ' + this.q + ' · ' + this.range.t },
    closeAll() { this.catOpen = false; this.timeOpen = false },
  },
  template: `
    <div style="color:var(--page-text-color);max-width:860px">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <strong>global search / omnibox</strong> (<code>components/omnibox/searchbar.vue</code>) — pick a category, type a query, press <strong>Enter</strong>, set the time window. Fully functional.</div>
      <div class="flex items-center" style="position:relative;height:52px;border:1px solid var(--border-color);border-radius:8px;background:var(--page-background-color)">
        <div style="position:relative;height:100%">
          <div @click="catOpen=!catOpen;timeOpen=false" class="flex items-center cursor-pointer bg-neutral-lightest" style="height:100%;padding:0 16px;gap:10px;border-right:1px solid var(--border-color);border-radius:8px 0 0 8px"><MIcon name="search" class="text-neutral-light" /><span style="font-size:15px;min-width:42px">{{ category }}</span><MIcon name="chevron-down" class="text-neutral-light" style="font-size:11px" /></div>
          <div v-if="catOpen" style="position:absolute;top:54px;left:0;z-index:30;min-width:150px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:6px;box-shadow:0 6px 20px var(--neutral-shadow-light);padding:5px">
            <a v-for="c in categories" :key="c" @click="category=c;catOpen=false" class="flex items-center cursor-pointer" style="padding:8px 12px;font-size:14px;text-decoration:none;border-radius:5px" :style="{ background: category===c ? 'var(--code-tag-background-color)' : 'transparent', color: category===c ? 'var(--primary)' : 'var(--page-text-color)' }">{{ c }}</a>
          </div>
        </div>
        <input v-model="q" @keyup.enter="run()" placeholder="Start Typing..." style="flex:1;height:100%;border:none;outline:none;background:transparent;color:var(--page-text-color);font-size:18px;padding:0 18px;min-width:0" />
        <a v-if="q" @click="run()" class="flex items-center cursor-pointer text-neutral-light" style="padding:0 10px" title="Execute"><MIcon name="enter" size="lg" /></a>
        <a v-if="q" @click="q=''" class="flex items-center cursor-pointer text-neutral-light" style="padding:0 10px" title="Clear"><MIcon name="backspace" /></a>
        <div style="position:relative;height:100%">
          <div @click="timeOpen=!timeOpen;catOpen=false" class="flex items-center cursor-pointer bg-neutral-lightest" style="height:100%;padding:0 16px;gap:12px;border-left:1px solid var(--border-color);border-radius:0 8px 8px 0">
            <span style="display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:5px;background:var(--code-tag-background-color);font-size:13px;font-family:jetBrainsMono,monospace">{{ range.s }}</span>
            <span style="font-size:15px;white-space:nowrap">{{ range.t }}</span>
          </div>
          <div v-if="timeOpen" style="position:absolute;top:54px;right:0;z-index:30;min-width:210px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:6px;box-shadow:0 6px 20px var(--neutral-shadow-light);padding:5px">
            <a v-for="r in ranges" :key="r.s" @click="range=r;timeOpen=false" class="flex items-center justify-between cursor-pointer" style="padding:7px 10px;font-size:13px;text-decoration:none;border-radius:5px" :style="{ background: range.s===r.s ? 'var(--code-tag-background-color)' : 'transparent', color: range.s===r.s ? 'var(--primary)' : 'var(--page-text-color)' }"><span>{{ r.t }}</span><span style="font-family:jetBrainsMono,monospace;font-size:11px" class="text-neutral-light">{{ r.s }}</span></a>
          </div>
        </div>
      </div>
      <div v-if="lastRun" class="mt-3 text-neutral-light" style="font-size:12px">▶ ran: <code>{{ lastRun }}</code></div>
      <div v-if="catOpen || timeOpen" @click="closeAll()" style="position:fixed;inset:0;z-index:20"></div>
    </div>`,
})
Omnibox.storyName = 'App chrome — global search / omnibox'
Omnibox.parameters = { controls: { disable: true }, docs: { description: { story: 'The **global search / omnibox** (`components/omnibox/searchbar.vue`) — the full-width command/search palette. **Fully functional here:** a **category** picker (Metric / Log / Flow / Trap / Audit — click to change the search domain), the query field (empty shows **"Start Typing…"**; in-product it is a **CodeMirror** editor with a search DSL + suggestions), **Execute** (`enter`, also press ↵) + **clear** (shown once you type), and a **time-range** picker on the right (default **1h · Last 1 Hour**; click to pick a window). Running prints the resolved `category · query · range`. (Reproduction — the live query field is CodeMirror.)' } } }

// 9. NOC Player — dashboard wallboard rotator (prev/next/play/pause/countdown).
export const NocPlayer = () => ({
  data: () => ({ paused: false }),
  template: `
    <div style="color:var(--page-text-color);max-width:720px">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <strong>NOC Player</strong> (<code>dashboard/components/noc-player.vue</code>) — a wallboard rotator that cycles dashboards on a timer.</div>
      <div class="flex items-center justify-between" style="height:54px;padding:0 14px;border:1px solid var(--border-color);border-radius:6px;background:var(--page-background-color)">
        <div class="flex items-center"><span class="font-700" style="font-size:15px">m<span class="text-secondary-red">o</span>tadata</span></div>
        <div class="flex items-center" style="gap:12px">
          <MButton variant="neutral-lightest" class="squared-button" title="Previous"><MIcon name="chevron-left" /></MButton>
          <span class="text-primary font-600" style="font-size:14px">Server Overview</span>
          <MButton variant="neutral-lightest" class="squared-button" title="Next"><MIcon name="chevron-right" /></MButton>
        </div>
        <div class="flex items-center" style="gap:10px">
          <span class="text-primary font-600" style="font-size:14px" title="seconds to next">12</span>
          <MButton variant="neutral-lightest" class="squared-button" :title="paused ? 'Play' : 'Pause'" @click="paused=!paused"><MIcon :name="paused ? 'play' : 'pause'" /></MButton>
        </div>
      </div>
    </div>`,
})
NocPlayer.storyName = 'NOC Player (wallboard rotator)'
NocPlayer.parameters = { controls: { disable: true }, docs: { description: { story: 'The **NOC Player** (`dashboard/components/noc-player.vue`) — the full-screen **wallboard rotator**: a logo, **‹ prev / next ›** controls around the **current dashboard** title, a **countdown** to the next, and **play/pause**. Cycles the selected dashboards on a timer for NOC displays. (Reference reproduction; the play/pause toggles.)' } } }

// 10. Timeline scrollbar — temporal (time-bucket) navigator.
export const TimelineScrollbar = () => ({
  template: `
    <div style="color:var(--page-text-color);max-width:560px">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <strong>timeline scrollbar</strong> (<code>netroute/components/timeline-scrollbar.vue</code>) — steps through time-bucketed snapshots.</div>
      <div class="flex items-center justify-between" style="padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--page-background-color)">
        <div class="flex items-center" style="gap:8px">
          <MButton variant="neutral-lightest" class="squared-button" title="Jump back"><MIcon name="chevron-left" /><MIcon name="chevron-left" style="margin-left:-4px" /></MButton>
          <MButton variant="neutral-lightest" class="squared-button" title="Back"><MIcon name="chevron-left" /></MButton>
          <span style="font-size:13px;font-family:jetBrainsMono,monospace">12:00</span>
        </div>
        <div class="flex items-center" style="gap:8px">
          <span style="font-size:13px;font-family:jetBrainsMono,monospace">12:05</span>
          <MButton variant="neutral-lightest" class="squared-button" title="Forward"><MIcon name="chevron-right" /></MButton>
          <MButton variant="neutral-lightest" class="squared-button" title="Jump forward"><MIcon name="chevron-right" /><MIcon name="chevron-right" style="margin-left:-4px" /></MButton>
        </div>
      </div>
    </div>`,
})
TimelineScrollbar.storyName = 'Timeline scrollbar (temporal navigator)'
TimelineScrollbar.parameters = { controls: { disable: true }, docs: { description: { story: 'The **timeline scrollbar** (`netroute/components/timeline-scrollbar.vue`) — a **temporal navigator** for the NetRoute history view: **single** (‹ ›) and **batch** (‹‹ ››) step controls around the current **time window** (`12:00 — 12:05`), moving through time-bucketed network snapshots. A sequence/time navigator (distinct from Steps or Breadcrumb). (Reference reproduction.)' } } }

// 11. Graph expansion breadcrumb — a Breadcrumb variant for graph traversal.
export const GraphBreadcrumb = () => ({
  data: () => ({ nodes: [{ id: 1, label: 'core-switch-01' }, { id: 2, label: 'router-edge-2' }, { id: 3, label: 'fw-sophos-01' }] }),
  methods: { close(n) { this.nodes = this.nodes.filter((x) => x.id !== n.id) } },
  template: `
    <div style="color:var(--page-text-color);max-width:620px">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <strong>graph expansion breadcrumb</strong> (<code>netroute/graph-view.vue</code>) — the trail of expanded nodes below a topology/graph canvas; click × to collapse one.</div>
      <div class="flex items-center" style="gap:8px;flex-wrap:wrap;padding:10px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--page-background-color)">
        <MTag v-for="n in nodes" :key="n.id" rounded :closable="true" @close="close(n)">{{ n.label }}</MTag>
        <span v-if="!nodes.length" class="text-neutral-light" style="font-size:13px">No nodes expanded.</span>
      </div>
    </div>`,
})
GraphBreadcrumb.storyName = 'Graph expansion breadcrumb (Breadcrumb variant)'
GraphBreadcrumb.parameters = { controls: { disable: true }, docs: { description: { story: 'A **Breadcrumb variant** — the **graph expansion trail** (`netroute/components/graph-view.vue`): as you expand nodes in a topology/graph, each becomes a **closable rounded `MTag`** below the canvas, showing the traversal path; clicking **×** collapses that node. A graph-specific breadcrumb (cross-referenced with the standard **Breadcrumb**). Click a tag’s × to remove it.' } } }

UserMenu.parameters = { ...(UserMenu.parameters || {}), controls: { disable: true } }
NotificationMenu.parameters = { ...(NotificationMenu.parameters || {}), controls: { disable: true } }
Omnibox.parameters = { ...(Omnibox.parameters || {}), controls: { disable: true } }
NocPlayer.parameters = { ...(NocPlayer.parameters || {}), controls: { disable: true } }
TimelineScrollbar.parameters = { ...(TimelineScrollbar.parameters || {}), controls: { disable: true } }
GraphBreadcrumb.parameters = { ...(GraphBreadcrumb.parameters || {}), controls: { disable: true } }
