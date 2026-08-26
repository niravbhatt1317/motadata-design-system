// Molecules / Tabs — MTab (ui/components/Tabs/Tab.vue, wraps Ant `a-tabs`) + MTabPane. 86× / 70 files.
// FIDELITY NOTE: although Ant a-tabs supports type=card/editable-card, vertical position, size, and a
// tabBarExtraContent slot, the PRODUCT uses NONE of them — every real <MTab> is a top-positioned
// `line` tab at default size. The genuine variants are class-based: `no-border` (21×, dominant),
// `sticky-tab` (8×), plus label patterns (counts, icons) and the renderless `MPersistedTab` wrapper.
// Active tab = `--primary` text + `--primary` underline; inactive = `--tabs-text-color`; bar bottom
// border = `--border-color` (src/design/tabs.less). These use the REAL MTab/MTabPane components.

// MTab/MTabPane/MIcon come from the kit (globally registered). MPersistedTab is a Floto `_base-`
// component (app-registered via _globals.js, which Storybook doesn't run) — import it locally.
import MPersistedTab from '@components/_base-persisted-tab.vue'

export default {
  title: 'Molecules/Tabs/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Molecule — the product\'s **tabbed navigation** (`MTab` + `MTabPane`, wrapping Ant `a-tabs`, **86×** across 70 files). Active tab is **`--primary`** (text + underline), inactive is **`--tabs-text-color`**, the bar has a **`--border-color`** bottom rule. **The product only ever uses `line` tabs, top-positioned, default size** — Ant\'s `card` / `editable-card` / vertical / `size` / `tabBarExtraContent` features exist but are **unused in-product**. Real variants are **class-based**: **`no-border`** (21×), **`sticky-tab`** (8×), plus **count** / **icon** labels and the renderless **`MPersistedTab`** (localStorage) state wrapper.',
      },
    },
  },
}

// 1. Basic — line tabs, top, default. Active = navy text + navy underline.
export const Basic = () => ({
  data: () => ({ tab: 'overview' }),
  template: `
    <div style="color:var(--page-text-color)">
      <MTab v-model="tab">
        <MTabPane key="overview" tab="Overview"><div style="padding:16px 4px">Overview content for the selected monitor.</div></MTabPane>
        <MTabPane key="performance" tab="Performance"><div style="padding:16px 4px">Performance metrics and charts.</div></MTabPane>
        <MTabPane key="logs" tab="Logs"><div style="padding:16px 4px">Recent log lines.</div></MTabPane>
        <MTabPane key="config" tab="Configuration"><div style="padding:16px 4px">Configuration details.</div></MTabPane>
      </MTab>
    </div>`,
})
Basic.parameters = { docs: { description: { story: 'The base tab strip — `<MTab v-model="tab">` with `<MTabPane key tab="…">` children. **Line** style, **top** position, default size (the only configuration used in the product). The **active** tab is **`--primary`** (navy) with a **`--primary` underline**; inactive tabs are **`--tabs-text-color`**; the bar has a **`--border-color`** bottom border. `v-model` (the `value` prop + `@change`) drives the active key.' } } }

// 2. No border — the dominant real variant (21×): the `no-border` CLASS drops the bar's bottom rule.
// (The product applies it as `class="no-border"`, not the `variant` prop — both work, since Tab.vue
// maps the variant prop to a class via :class="[variant]".)
export const NoBorder = () => ({
  data: () => ({ tab: 'overview' }),
  template: `
    <div style="color:var(--page-text-color)">
      <MTab v-model="tab" class="no-border">
        <MTabPane key="overview" tab="Overview"><div style="padding:16px 4px">No bottom border under the tab bar — used when the tabs sit on a card or panel that already has its own edges.</div></MTabPane>
        <MTabPane key="alerts" tab="Alerts"><div style="padding:16px 4px">Alerts content.</div></MTabPane>
        <MTabPane key="events" tab="Events"><div style="padding:16px 4px">Events content.</div></MTabPane>
      </MTab>
    </div>`,
})
NoBorder.parameters = { docs: { description: { story: 'The **most common** real variant (**21×**): the **`no-border`** class removes the tab bar\'s bottom border (`.no-border .ant-tabs-bar { border-color: transparent }`). The product applies it as **`class="no-border"`** (not the `variant` prop — though both work, since `Tab.vue` maps `variant`→class). Used when the tabs sit inside a card/panel that already provides edges; otherwise identical to **Basic**.' } } }

// 3. Sticky — `sticky-tab` (8×): the tab bar pins to the top of a scroll container.
export const Sticky = () => ({
  data: () => ({ tab: 'overview' }),
  template: `
    <div style="height:220px;overflow:auto;border:1px solid var(--border-color);border-radius:6px;color:var(--page-text-color)">
      <MTab v-model="tab" class="sticky-tab">
        <MTabPane key="overview" tab="Overview"><div style="padding:12px 8px">
          <p v-for="n in 12" :key="n" style="margin:0 0 12px">Scrollable row {{ n }} — the tab bar stays pinned to the top as this panel scrolls.</p>
        </div></MTabPane>
        <MTabPane key="metrics" tab="Metrics"><div style="padding:12px 8px">Metrics content.</div></MTabPane>
      </MTab>
    </div>`,
})
Sticky.parameters = { docs: { description: { story: 'The **`sticky-tab`** class (**8×**): `position:sticky; top:0; z-index:2; background:var(--page-background-color)` keeps the tab bar pinned at the top while the content scrolls. **Scroll the panel** — the tabs stay put. Used in long detail/settings panes.' } } }

// 4. With counts — tab labels carry a trailing `(N)`. Real pattern: `:tab="\`Alerts (${count})\`"`.
export const WithCounts = () => ({
  data: () => ({ tab: 'alerts', counts: { alerts: 12, logs: 5, metrics: 0 } }),
  template: `
    <div style="color:var(--page-text-color)">
      <MTab v-model="tab">
        <MTabPane key="alerts" :tab="\`Alerts (\${counts.alerts})\`"><div style="padding:16px 4px">12 correlated alerts.</div></MTabPane>
        <MTabPane key="logs" :tab="\`Logs (\${counts.logs})\`"><div style="padding:16px 4px">5 correlated logs.</div></MTabPane>
        <MTabPane key="metrics" :tab="\`Metrics (\${counts.metrics})\`"><div style="padding:16px 4px">No correlated metrics.</div></MTabPane>
      </MTab>
    </div>`,
})
WithCounts.parameters = { docs: { description: { story: 'A frequent real pattern (e.g. correlated **Alerts / Logs / Metrics**, system notifications): the count is **appended to the label string** — `:tab="\`Alerts (${count})\`"` — not a separate badge component. Counts update reactively with the data.' } } }

// 5. Dynamic — v-for over a tabs array (the common real pattern for data-driven tab sets).
export const Dynamic = () => ({
  data: () => ({
    tab: 'attributes',
    tabs: [
      { key: 'attributes', text: 'Attributes' },
      { key: 'metric', text: 'Metric' },
      { key: 'style', text: 'Style' },
      { key: 'sorting', text: 'Sorting' },
      { key: 'column', text: 'Column Setting' },
    ],
  }),
  template: `
    <div style="color:var(--page-text-color)">
      <MTab v-model="tab">
        <MTabPane v-for="t in tabs" :key="t.key" :tab="t.text">
          <div style="padding:16px 4px">Editing <strong>{{ t.text }}</strong>.</div>
        </MTabPane>
      </MTab>
    </div>`,
})
Dynamic.parameters = { docs: { description: { story: 'The data-driven form: **`<MTabPane v-for="t in tabs" :key :tab>`**. Most product tab sets are built this way from a config array (e.g. widget editor *Attributes / Metric / Style / Sorting / Column Setting*). Add/remove a tab by changing the array.' } } }

// 6. With icons — leading icons in the tab label via the `tab` slot.
export const WithIcons = () => ({
  data: () => ({ tab: 'list' }),
  template: `
    <div style="color:var(--page-text-color)">
      <MTab v-model="tab">
        <MTabPane key="list"><span slot="tab"><MIcon name="list" class="mr-1" />List</span><div style="padding:16px 4px">List view.</div></MTabPane>
        <MTabPane key="grid"><span slot="tab"><MIcon name="th-large" class="mr-1" />Grid</span><div style="padding:16px 4px">Grid view.</div></MTabPane>
        <MTabPane key="map"><span slot="tab"><MIcon name="sitemap" class="mr-1" />Topology</span><div style="padding:16px 4px">Topology view.</div></MTabPane>
      </MTab>
    </div>`,
})
WithIcons.parameters = { docs: { description: { story: 'Tab labels can carry a **leading icon** via the pane\'s **`tab` slot** (`<span slot="tab"><MIcon …/> Label</span>`). For **icon-only** tabs the product uses the `topology-hierarchy-tab` class to zero the icon margin. (Icons must be in the curated 543-icon set, else `MIcon` renders nothing.)' } } }

// 7. Persisted — MPersistedTab: renderless localStorage state, used WITH MTab via a scoped slot.
export const Persisted = () => ({
  components: { MPersistedTab },
  template: `
    <div style="color:var(--page-text-color)">
      <MPersistedTab module-key="ds-demo" default-value="overview">
        <template v-slot:default="{ tab, setTab }">
          <MTab :value="tab" @change="setTab">
            <MTabPane key="overview" tab="Overview"><div style="padding:16px 4px">Switch tabs, then reload the story — the last tab is remembered (localStorage key <code>ds-demo-tab</code>).</div></MTabPane>
            <MTabPane key="history" tab="History"><div style="padding:16px 4px">History content.</div></MTabPane>
            <MTabPane key="settings" tab="Settings"><div style="padding:16px 4px">Settings content.</div></MTabPane>
          </MTab>
        </template>
      </MPersistedTab>
    </div>`,
})
Persisted.parameters = { docs: { description: { story: 'The **`MPersistedTab`** wrapper (`_base-persisted-tab.vue`) is **renderless** — it manages the active tab in **localStorage** (`${moduleKey}-tab`) and hands `{ tab, setTab }` to a scoped slot, which you wire to `<MTab :value="tab" @change="setTab">`. The selected tab **survives reloads / navigation**. Use it for module-level tab sets the user returns to. (`MPersistedColumns` is the sibling that does the same for grid columns.)' } } }
