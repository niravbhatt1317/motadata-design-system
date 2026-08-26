// Foundations / Layout / Page templates — annotated wireframes for the canonical page types.
// Built from design-system/components/recipes/recipes.json (region -> component). Each template names the
// component used per region. Flows (confirm-delete, etc.) live in recipes.json.

const DASH = '1px dashed var(--border-color)'
const SOLID = '1px solid var(--border-color)'
const BAR = 'background:var(--code-tag-background-color);border-radius:4px'
const TAG = 'font-size:10px;color:var(--neutral-light);font-family:jetBrainsMono,monospace'

// Shared chrome: left nav rail + top header around a content body.
function frame(bodyHtml) {
  return `
    <div style="border:${SOLID};border-radius:8px;overflow:hidden;display:flex;height:300px;background:var(--page-background-color)">
      <div style="width:30px;flex-shrink:0;background:var(--nav-panel-bg);border-right:${SOLID}"></div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0">
        <div style="height:30px;flex-shrink:0;border-bottom:${SOLID}"></div>
        <div style="flex:1;min-height:0;padding:10px;display:flex;flex-direction:column;gap:8px">${bodyHtml}</div>
      </div>
    </div>`
}

function regionRow(label, comp) {
  return `<div class="flex items-center justify-between" style="padding:5px 0;border-top:${SOLID}">
    <span style="font-size:11px;color:var(--page-text-color)">${label}</span><span style="${TAG}">${comp}</span></div>`
}
function caption(rows) {
  return `<div style="margin-top:12px;max-width:560px">${rows.map(r => regionRow(r[0], r[1])).join('')}</div>`
}

export default {
  title: 'Foundations/Layout/Page templates/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 Canonical **page templates** — annotated wireframes for the page types ObserveOps repeats, built from the **composition recipes** (`recipes.json`). Each names the **component per region**, so an AI (or designer) can assemble a faithful page. Flows (confirm-delete, etc.) live in `recipes.json`. Pairs with **Screen regions** (the region grammar) and **App shell** (the frame).',
      },
    },
  },
}

// 1. List view
export const ListView = () => ({
  template: `<div style="color:var(--page-text-color);max-width:580px">
    <div class="text-neutral-light mb-3" style="font-size:12px"><strong>List view</strong> — the most common page: header + toolbar + table + pager.</div>
    ${frame(`
      <div class="flex items-center justify-between" style="flex-shrink:0">
        <div style="height:14px;width:30%;${BAR}"></div>
        <div class="flex items-center" style="gap:6px"><div style="height:18px;width:80px;border:${SOLID};border-radius:4px"></div><div style="height:18px;width:54px;background:var(--primary);border-radius:4px"></div></div>
      </div>
      <div class="flex items-center" style="gap:6px;flex-shrink:0"><div style="height:14px;width:64px;border:${SOLID};border-radius:4px"></div><div style="height:14px;width:64px;border:${SOLID};border-radius:4px"></div></div>
      <div style="flex:1;border:${SOLID};border-radius:4px;display:flex;flex-direction:column;overflow:hidden">
        <div style="height:20px;${BAR};border-radius:0"></div>
        <div v-for="n in 5" :key="n" style="height:16px;border-top:${SOLID};margin:0"></div>
      </div>
      <div class="flex justify-end" style="flex-shrink:0"><div style="height:14px;width:120px;${BAR}"></div></div>
    `)}
    ${caption([['Page header (title · search · export · add)','toolbars/page-header'],['Toolbar / filter bar','filters/filter-bar · toolbars/grid-toolbar'],['Body — table','table'],['Footer — pagination','FlotoPaginatedCrud']])}
  </div>`,
})
ListView.storyName = 'List view'
ListView.parameters = { controls: { disable: true } }

// 2. Form view
export const FormView = () => ({
  template: `<div style="color:var(--page-text-color);max-width:580px">
    <div class="text-neutral-light mb-3" style="font-size:12px"><strong>Form view</strong> — back + title + actions, then a MRow/MCol field grid.</div>
    ${frame(`
      <div class="flex items-center justify-between" style="flex-shrink:0">
        <div class="flex items-center" style="gap:8px"><div style="width:16px;height:16px;border:${SOLID};border-radius:4px"></div><div style="height:14px;width:120px;${BAR}"></div></div>
        <div class="flex items-center" style="gap:6px"><div style="height:18px;width:54px;background:var(--primary);border-radius:4px"></div><div style="height:18px;width:54px;border:${SOLID};border-radius:4px"></div></div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:10px;padding-top:4px">
        <div style="display:flex;gap:10px"><div style="flex:1"><div style="${TAG};margin-bottom:3px">Name</div><div style="height:20px;border:${SOLID};border-radius:4px"></div></div><div style="flex:1"><div style="${TAG};margin-bottom:3px">Type</div><div style="height:20px;border:${SOLID};border-radius:4px"></div></div></div>
        <div style="display:flex;gap:10px"><div style="flex:1"><div style="${TAG};margin-bottom:3px">Severity</div><div style="height:20px;border:${SOLID};border-radius:4px"></div></div><div style="flex:1"><div style="${TAG};margin-bottom:3px">Tags</div><div style="height:20px;border:${SOLID};border-radius:4px"></div></div></div>
        <div><div style="${TAG};margin-bottom:3px">Description</div><div style="height:38px;border:${SOLID};border-radius:4px"></div></div>
      </div>
    `)}
    ${caption([['Header — back · title · Save/Cancel','toolbars/page-header + navigation/back-button'],['Body — field grid','form-item (FlotoForm) on the MRow/MCol grid'],['Validation','MValidationObserver / Provider']])}
  </div>`,
})
FormView.storyName = 'Form view'
FormView.parameters = { controls: { disable: true } }

// 3. Detail view
export const DetailView = () => ({
  template: `<div style="color:var(--page-text-color);max-width:580px">
    <div class="text-neutral-light mb-3" style="font-size:12px"><strong>Detail view</strong> — header with a status/severity indicator, tabs, then panels.</div>
    ${frame(`
      <div class="flex items-center justify-between" style="flex-shrink:0">
        <div class="flex items-center" style="gap:8px"><div style="width:16px;height:16px;border:${SOLID};border-radius:4px"></div><div style="height:14px;width:110px;${BAR}"></div><span style="width:10px;height:10px;border-radius:50%;border:2px solid var(--severity-critical);background:var(--severity-critical-dot-box)"></span></div>
        <div style="height:18px;width:64px;border:${SOLID};border-radius:4px"></div>
      </div>
      <div class="flex items-center" style="gap:14px;flex-shrink:0;border-bottom:${SOLID};padding-bottom:5px"><div style="height:10px;width:50px;border-bottom:2px solid var(--primary)"></div><div style="height:10px;width:50px;${BAR}"></div><div style="height:10px;width:50px;${BAR}"></div></div>
      <div style="flex:1;display:flex;gap:8px;min-height:0"><div style="flex:1;border:${SOLID};border-radius:4px"></div><div style="flex:1;border:${SOLID};border-radius:4px"></div></div>
    `)}
    ${caption([['Header — back · title · indicator · actions','toolbars/page-header + severity OR tag'],['Tabs','tabs'],['Body — panels / charts','table · data-viz · detail panes']])}
  </div>`,
})
DetailView.storyName = 'Detail view'
DetailView.parameters = { controls: { disable: true } }

// 4. Dashboard view
export const DashboardView = () => ({
  template: `<div style="color:var(--page-text-color);max-width:580px">
    <div class="text-neutral-light mb-3" style="font-size:12px"><strong>Dashboard view</strong> — dashboard picker + global time range, then a widget grid.</div>
    ${frame(`
      <div class="flex items-center justify-between" style="flex-shrink:0">
        <div class="flex items-center" style="gap:8px"><div style="height:14px;width:90px;${BAR}"></div><div style="height:14px;width:60px;border:${SOLID};border-radius:4px"></div></div>
        <div style="height:18px;width:96px;border:${SOLID};border-radius:4px"></div>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;min-height:0">
        <div v-for="n in 4" :key="n" style="border:${SOLID};border-radius:4px;background:var(--common-widget-bg,transparent)"></div>
      </div>
    `)}
    ${caption([['Dashboard / NOC picker (tabs · categories)','navigation/side-menu-categories'],['Global time range','date-time-pickers/TimeRangePicker'],['Widgets','vue-grid-layout tiles + data-viz']])}
  </div>`,
})
DashboardView.storyName = 'Dashboard view'
DashboardView.parameters = { controls: { disable: true } }

// 5. Explorer view
export const ExplorerView = () => ({
  template: `<div style="color:var(--page-text-color);max-width:580px">
    <div class="text-neutral-light mb-3" style="font-size:12px"><strong>Explorer view</strong> — a left tree/filter panel + a main query bar over results.</div>
    ${frame(`
      <div style="flex:1;display:flex;gap:8px;min-height:0">
        <div style="width:32%;border:${SOLID};border-radius:4px;display:flex;flex-direction:column;padding:6px;gap:5px"><div v-for="n in 5" :key="n" :style="{height:'8px',background:'var(--code-tag-background-color)',borderRadius:'3px',marginLeft:(n%3===0?'10px':'0')}"></div></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px;min-height:0">
          <div style="height:20px;border:${SOLID};border-radius:4px;flex-shrink:0"></div>
          <div style="flex:1;border:${DASH};border-radius:4px"></div>
        </div>
      </div>
    `)}
    ${caption([['Left panel — hierarchy / metric picker / vertical filter','navigation/side-menu-tree · metric-picker · filters/vertical-filter'],['Query / search bar','filters · input/search'],['Results — table / charts','table · data-viz']])}
  </div>`,
})
ExplorerView.storyName = 'Explorer view'
ExplorerView.parameters = { controls: { disable: true } }

// 6. Wizard flow
export const WizardFlow = () => ({
  template: `<div style="color:var(--page-text-color);max-width:580px">
    <div class="text-neutral-light mb-3" style="font-size:12px"><strong>Wizard flow</strong> — a stepper, a step body (form), and a Back/Next footer.</div>
    ${frame(`
      <div class="flex items-center" style="gap:6px;flex-shrink:0;padding-bottom:4px">
        <span style="width:16px;height:16px;border-radius:50%;background:var(--primary)"></span><div style="height:2px;width:40px;background:var(--primary)"></div>
        <span style="width:16px;height:16px;border-radius:50%;border:2px solid var(--primary)"></span><div style="height:2px;width:40px;${BAR}"></div>
        <span style="width:16px;height:16px;border-radius:50%;border:${SOLID}"></span><div style="height:2px;width:40px;${BAR}"></div>
        <span style="width:16px;height:16px;border-radius:50%;border:${SOLID}"></span>
      </div>
      <div style="flex:1;border:${SOLID};border-radius:4px;padding:8px;display:flex;flex-direction:column;gap:8px;min-height:0"><div v-for="n in 3" :key="n" style="height:18px;border:${SOLID};border-radius:4px"></div></div>
      <div class="flex justify-between" style="flex-shrink:0"><div style="height:18px;width:54px;border:${SOLID};border-radius:4px"></div><div style="height:18px;width:54px;background:var(--primary);border-radius:4px"></div></div>
    `)}
    ${caption([['Stepper (horizontal report / vertical setup / 2FA)','navigation/steps'],['Step body','form-item (current-step fields)'],['Footer — Back / Next / Finish','button']])}
  </div>`,
})
WizardFlow.storyName = 'Wizard flow'
WizardFlow.parameters = { controls: { disable: true } }

// 7. Graph / Canvas view (Topology) — surfaced by the product sweep as a 7th archetype.
export const GraphCanvas = () => ({
  template: `<div style="color:var(--page-text-color);max-width:580px">
    <div class="text-neutral-light mb-3" style="font-size:12px"><strong>Graph / Canvas view</strong> — an interactive node graph (Topology): left tree + a pan/zoom canvas with a minimap and controls. Neither a Dashboard nor an Explorer.</div>
    ${frame(`
      <div style="flex:1;display:flex;gap:8px;min-height:0">
        <div style="width:30%;border:${SOLID};border-radius:4px;display:flex;flex-direction:column;padding:6px;gap:5px"><div v-for="n in 5" :key="n" :style="{height:'8px',background:'var(--code-tag-background-color)',borderRadius:'3px',marginLeft:(n%3===0?'10px':'0')}"></div></div>
        <div style="flex:1;border:${SOLID};border-radius:4px;position:relative;overflow:hidden;background:var(--common-main-bg,transparent)">
          <!-- edges -->
          <svg style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="none"><line x1="50%" y1="30%" x2="28%" y2="62%" stroke="var(--border-color)" stroke-width="2"/><line x1="50%" y1="30%" x2="72%" y2="60%" stroke="var(--border-color)" stroke-width="2"/><line x1="28%" y1="62%" x2="52%" y2="84%" stroke="var(--border-color)" stroke-width="2"/></svg>
          <!-- nodes -->
          <span style="position:absolute;left:50%;top:30%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:var(--primary)"></span>
          <span style="position:absolute;left:28%;top:62%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;border:2px solid var(--severity-clear);background:var(--severity-clear-dot-box)"></span>
          <span style="position:absolute;left:72%;top:60%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;border:2px solid var(--severity-critical);background:var(--severity-critical-dot-box)"></span>
          <span style="position:absolute;left:52%;top:84%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;border:2px solid var(--severity-warning);background:var(--severity-warning-dot-box)"></span>
          <!-- toolbar -->
          <div style="position:absolute;top:6px;right:6px;display:flex;flex-direction:column;gap:3px"><span v-for="t in ['+','−','⤢']" :key="t" style="width:16px;height:16px;border:${SOLID};border-radius:3px;background:var(--page-background-color);font-size:10px;display:flex;align-items:center;justify-content:center">{{ t }}</span></div>
          <!-- minimap -->
          <div style="position:absolute;bottom:6px;right:6px;width:46px;height:32px;border:${SOLID};border-radius:3px;background:var(--page-background-color);opacity:.9"><span style="position:absolute;left:30%;top:30%;width:5px;height:5px;border-radius:50%;background:var(--neutral-light)"></span><span style="position:absolute;left:60%;top:60%;width:5px;height:5px;border-radius:50%;background:var(--neutral-light)"></span></div>
        </div>
      </div>
    `)}
    ${caption([['Left panel — hierarchy tree','navigation/side-menu-tree'],['Canvas — interactive graph (pan/zoom/drag, keyboard)','data-viz (Cytoscape topology-graph)'],['Minimap + zoom controls','data-viz overlay (cytoscape-navigator)'],['Node state','severity (node colour) · MStatusTag']])}
  </div>`,
})
GraphCanvas.storyName = 'Graph / Canvas view'
GraphCanvas.parameters = { controls: { disable: true }, docs: { description: { story: 'Surfaced by the product sweep (`foundation/page-templates.md`): the **Topology graph canvas** — a left hierarchy tree + an interactive **Cytoscape** canvas (pan/zoom, node-drag with saved positions, minimap, Full-View vs Tree-View, keyboard nav). It is **neither a Dashboard nor an Explorer**, so it is catalogued as its own archetype. Related variants the sweep noted (documented on the **Usage** page): utility-tool forms, system/status pages, live-tail, list⇄dashboard view-toggle, and the two wizard shapes.' } } }
