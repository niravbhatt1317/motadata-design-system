// Molecules / Filters — the product's filtering components, grouped by ARCHETYPE (not by the screen
// they sit in). Four distinct kinds:
//   • Expression builder (FiltersContainer/FilterGroup/FilterCondition, 32×) — a nested AND/OR query
//     builder: "Group(s) matching All/Any" → groups of field·operator·value conditions.
//   • Filter bar (FlotoFilterBar, ~50×) — an inline chip bar (field·operator·value chips + Match All/Any).
//   • Quick filters (filter-quick-menu) — a preset one-click menu.
//   • Filter row — a few multi-selects + Reset/Apply (e.g. the metric-collection filter).
// These are MOLECULES; the Toolbars (organisms) compose them. Reference reproductions (real tokens).

const CHIP = 'display:inline-flex;align-items:center;height:32px;padding:0 12px;background:var(--code-tag-background-color);border-radius:4px;font-size:13px;color:var(--neutral-button-text)'
const OPS = {
  enum: [{ k: 'is', l: '=', multi: true }, { k: 'is_not', l: '!=', multi: true }, { k: 'is_empty', l: 'Is Empty', noValue: true }, { k: 'is_not_empty', l: 'Is Not Empty', noValue: true }],
  string: [{ k: 'contains', l: 'Contains' }, { k: 'does_not_contain', l: 'Does Not Contain' }, { k: 'starts_with', l: 'Starts With' }, { k: 'ends_with', l: 'Ends With' }, { k: 'eq', l: 'Equals' }],
}

export default {
  title: 'Molecules/Filters/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Molecule — the product\'s **filtering components**, by archetype (not by screen). **Expression builder** (`FiltersContainer`, **32×**) — a nested **AND/OR** query builder (Group(s) matching All/Any → field·operator·value conditions). **Filter bar** (`FlotoFilterBar`, ~50×) — an inline **chip** bar + Match All/Any. **Quick filters** (`filter-quick-menu`) — a **preset** one-click menu. **Filter row** — a few multi-selects + Reset/Apply. **Vertical filter** (`vertical-filter/filters.vue`) — the **faceted left-panel sidebar** (checkbox + count groups; APM/RUM/NCM). These are **molecules**; the **Toolbars** organisms compose them. Reference reproductions with real tokens.',
      },
    },
  },
}

// 1. Expression builder — the 32× FiltersContainer. In the PRODUCT it lives inside an MPopover
// (placement bottomLeft, has-arrow) opened from a FilterTrigger input, with Pre/Post Filters tabs,
// a close ×, the nested AND/OR builder, and a Reset / Clear / Apply footer. Fully functional below.
const SEL = 'appearance:none;-webkit-appearance:none;width:100%;height:32px;border:1px solid var(--border-color);border-radius:4px;background:var(--page-background-color);color:var(--page-text-color);font-size:13px;padding:0 24px 0 10px;cursor:pointer'
const INP = 'width:100%;height:32px;border:1px solid var(--border-color);border-radius:4px;background:var(--page-background-color);color:var(--page-text-color);font-size:13px;padding:0 10px'
const COUNTERS = ['Monitor', 'Host Name', 'IP Address', 'Vendor', 'Object Type', 'Severity', 'Status', 'Source', 'Group', 'Interface']
const OPERATORS = [
  { k: '=', l: 'Equals' }, { k: '!=', l: 'Not Equals' }, { k: '<', l: 'Less Than' }, { k: '>', l: 'Greater Than' },
  { k: '<=', l: 'Less than or Equal' }, { k: '>=', l: 'Greater than or Equal' }, { k: 'contain', l: 'Contains' },
  { k: 'not contain', l: 'Not Contain' }, { k: 'in', l: 'In' }, { k: 'not in', l: 'Not In' },
  { k: 'start with', l: 'Start With' }, { k: 'end with', l: 'End With' }, { k: 'between', l: 'Between' },
]

export const ExpressionBuilder = () => ({
  data: () => ({ open: false, currentTab: 'pre', counters: COUNTERS, operators: OPERATORS, applied: null, draft: null }),
  computed: {
    tabs: () => [{ k: 'pre', text: 'Pre Filters' }, { k: 'post', text: 'Post Filters' }],
    maxGroups() { return this.currentTab === 'pre' ? 3 : 1 },
    cur() { return this.draft ? this.draft[this.currentTab] : null },
    appliedText() {
      if (!this.applied) return ''
      return ['pre', 'post'].map((t) => this.setText(this.applied[t])).filter(Boolean).join(' <strong class="text-primary" style="margin:0 6px">|</strong> ')
    },
  },
  created() {
    this.applied = {
      pre: { condition: 'or', groups: [
        { inclusion: 'include', condition: 'and', conditions: [{ operand: 'Severity', operator: '=', value: 'Critical', toValue: '' }, { operand: 'Source', operator: 'contain', value: 'aws', toValue: '' }] },
        { inclusion: 'include', condition: 'and', conditions: [{ operand: 'Status', operator: '=', value: 'Down', toValue: '' }] },
      ] },
      post: { condition: 'and', groups: [this.freshGroup()] },
    }
    this.draft = this.clone(this.applied)
  },
  methods: {
    clone(x) { return JSON.parse(JSON.stringify(x)) },
    freshCond() { return { operand: '', operator: '', value: '', toValue: '' } },
    freshGroup() { return { inclusion: 'include', condition: 'and', conditions: [this.freshCond()] } },
    freshTab() { return { condition: 'and', groups: [this.freshGroup()] } },
    fresh() { return { pre: this.freshTab(), post: this.freshTab() } },
    opLabel(k) { const o = OPERATORS.find((x) => x.k === k); return o ? o.l : k },
    toggle() { if (!this.open) { this.draft = this.clone(this.applied || this.fresh()); } this.open = !this.open },
    addCondition(gi) { this.cur.groups[gi].conditions.push(this.freshCond()) },
    removeCondition(gi, ci) { this.cur.groups[gi].conditions.splice(ci, 1) },
    addGroup() { this.cur.groups.push(this.freshGroup()) },
    removeGroup(gi) { this.cur.groups.splice(gi, 1) },
    apply() { this.applied = this.clone(this.draft); this.open = false },
    clear() { this.draft = this.fresh(); this.applied = null; this.open = false },
    reset() { this.draft = { ...this.draft, [this.currentTab]: this.applied ? this.clone(this.applied[this.currentTab]) : this.freshTab() } },
    setText(t) {
      if (!t || !t.groups) return ''
      const between = t.condition === 'or' ? 'OR' : 'AND'
      const gtexts = t.groups.map((g) => {
        const conds = g.conditions.filter((c) => c.operand && c.operator)
        if (!conds.length) return ''
        const join = g.condition === 'or' ? 'OR' : 'AND'
        const inner = conds.map((c) => c.operand + ' <b>' + this.opLabel(c.operator) + '</b> ' + (c.operator === 'between' ? (c.value || '?') + '–' + (c.toValue || '?') : (c.value || 'Any'))).join(' ' + join + ' ')
        return '<strong>' + (g.inclusion === 'exclude' ? 'EXCLUDE' : 'INCLUDE') + '</strong> ' + inner
      }).filter(Boolean)
      if (!gtexts.length) return ''
      return gtexts.length > 1 ? gtexts.map((x) => '(' + x + ')').join(' ' + between + ' ') : gtexts[0]
    },
  },
  template: `
    <div style="max-width:760px;color:var(--page-text-color);font-size:13px">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <code>FiltersContainer</code> expression builder (32×) — in the product it lives inside an <code>MPopover</code> opened from a filter trigger. <strong>Click the trigger</strong> to open, build nested AND/OR groups across the <strong>Pre / Post</strong> tabs, then <strong>Apply</strong>.</div>
      <div style="position:relative;width:440px">
        <div class="flex items-center cursor-pointer" @click="toggle" style="height:34px;border:1px solid var(--border-color);border-radius:6px;background:var(--page-background-color);overflow:hidden">
          <span class="inline-flex items-center justify-center text-neutral-light" style="height:100%;padding:0 10px;border-right:1px solid var(--border-color)"><MIcon name="filter" /></span>
          <div v-if="appliedText" class="text-ellipsis" style="flex:1;padding:0 10px;white-space:nowrap;overflow:hidden" v-html="appliedText"></div>
          <div v-else class="text-neutral-light" style="flex:1;padding:0 10px">Search</div>
        </div>

        <div v-if="open" style="position:absolute;top:44px;left:0;z-index:20;width:700px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 10px 34px var(--neutral-shadow-light);padding:14px">
          <a class="flex items-center justify-center cursor-pointer text-neutral-light" @click="open=false" style="position:absolute;top:10px;right:10px;width:24px;height:24px;border-radius:50%;background:var(--neutral-lighter)"><MIcon name="times" style="font-size:11px" /></a>

          <div class="flex" style="border-bottom:1px solid var(--border-color);margin-bottom:14px;gap:20px">
            <div v-for="t in tabs" :key="t.k" @click="currentTab=t.k" class="cursor-pointer" style="padding:6px 2px" :style="{ color: currentTab===t.k ? 'var(--primary)' : 'var(--neutral-light)', borderBottom: currentTab===t.k ? '2px solid var(--primary)' : '2px solid transparent', fontWeight: currentTab===t.k ? 600 : 400 }">{{ t.text }}</div>
          </div>

          <div v-if="maxGroups>1" class="flex items-center mb-3" style="gap:8px">
            <span style="position:relative;display:inline-block;width:100px"><select v-model="cur.condition" style="${SEL}"><option value="and">All</option><option value="or">Any</option></select><MIcon name="chevron-down" class="text-neutral-light" style="position:absolute;right:9px;top:50%;transform:translateY(-50%);font-size:9px;pointer-events:none" /></span>
            <span>Group(s) matching</span>
          </div>

          <div v-for="(g, gi) in cur.groups" :key="gi" style="position:relative;border:1px solid var(--border-color);border-radius:6px;padding:12px;margin-bottom:10px">
            <div class="flex items-center mb-3" style="gap:8px">
              <span style="position:relative;display:inline-block;width:110px"><select v-model="g.inclusion" style="${SEL}"><option value="include">Include</option><option value="exclude">Exclude</option></select><MIcon name="chevron-down" class="text-neutral-light" style="position:absolute;right:9px;top:50%;transform:translateY(-50%);font-size:9px;pointer-events:none" /></span>
              <span>Group matching</span>
              <span style="position:relative;display:inline-block;width:90px"><select v-model="g.condition" style="${SEL}"><option value="and">All</option><option value="or">Any</option></select><MIcon name="chevron-down" class="text-neutral-light" style="position:absolute;right:9px;top:50%;transform:translateY(-50%);font-size:9px;pointer-events:none" /></span>
              <span>Criteria</span>
            </div>

            <div v-for="(c, ci) in g.conditions" :key="ci" class="flex items-center mb-2" style="gap:8px">
              <span style="position:relative;display:block;flex:1"><select v-model="c.operand" style="${SEL}"><option value="" disabled>Select Counter</option><option v-for="o in counters" :key="o" :value="o">{{ o }}</option></select><MIcon name="chevron-down" class="text-neutral-light" style="position:absolute;right:9px;top:50%;transform:translateY(-50%);font-size:9px;pointer-events:none" /></span>
              <span style="position:relative;display:block;width:180px"><select v-model="c.operator" style="${SEL}"><option value="" disabled>Select Operator</option><option v-for="o in operators" :key="o.k" :value="o.k">{{ o.l }}</option></select><MIcon name="chevron-down" class="text-neutral-light" style="position:absolute;right:9px;top:50%;transform:translateY(-50%);font-size:9px;pointer-events:none" /></span>
              <span style="flex:1;display:block">
                <span v-if="c.operator==='between'" class="flex items-center" style="gap:6px"><input v-model="c.value" placeholder="From" style="${INP}" /><input v-model="c.toValue" placeholder="To" style="${INP}" /></span>
                <input v-else v-model="c.value" placeholder="Value" style="${INP}" />
              </span>
              <MIcon name="times" v-if="g.conditions.length>1" @click.native="removeCondition(gi, ci)" class="text-neutral-light cursor-pointer" style="font-size:12px;flex-shrink:0" />
            </div>

            <div class="flex items-center" style="gap:18px;margin-top:8px">
              <a v-if="g.conditions.length<3" @click="addCondition(gi)" class="text-primary cursor-pointer inline-flex items-center" style="font-size:12px"><MIcon name="plus" class="mr-1" style="font-size:10px" />Add Condition</a>
              <a v-if="gi===cur.groups.length-1 && cur.groups.length<maxGroups" @click="addGroup()" class="text-primary cursor-pointer inline-flex items-center" style="font-size:12px"><MIcon name="plus" class="mr-1" style="font-size:10px" />Add New Group</a>
            </div>

            <a v-if="cur.groups.length>1" @click="removeGroup(gi)" class="flex items-center justify-center cursor-pointer text-neutral-light" style="position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;background:var(--neutral-lighter)"><MIcon name="times" style="font-size:10px" /></a>
          </div>

          <div class="flex items-center justify-end" style="gap:8px;margin-top:10px">
            <button @click="reset" style="height:32px;padding:0 16px;border:1px solid var(--border-color);border-radius:6px;background:var(--page-background-color);color:var(--page-text-color);font-size:13px;cursor:pointer">Reset</button>
            <button @click="clear" style="height:32px;padding:0 16px;border:1px solid var(--secondary-red);border-radius:6px;background:transparent;color:var(--secondary-red);font-size:13px;cursor:pointer">Clear</button>
            <button @click="apply" style="height:32px;padding:0 18px;border:none;border-radius:6px;background:var(--primary);color:var(--page-background-color);font-size:13px;font-weight:600;cursor:pointer">Apply</button>
          </div>
        </div>
      </div>
      <div v-if="open" @click="open=false" style="position:fixed;inset:0;z-index:10"></div>
    </div>`,
})
ExpressionBuilder.parameters = { controls: { disable: true }, docs: { description: { story: 'The **`FiltersContainer`** expression builder (**32×** — the most-used filter). In the product it is an **`MPopover`** (placement `bottomLeft`, `has-arrow`) opened from a **`FilterTrigger`** input — **not** an inline panel. **Fully functional** here: click the trigger to open; switch **Pre Filters / Post Filters** tabs; a top **"All/Any → Group(s) matching"** wraps one or more **groups**; each group is **"Include/Exclude → Group matching All/Any → Criteria"** + **conditions** (`Counter · Operator · Value`, with **Between** → From/To). **Add Condition** (max 3) / **Add New Group** (max 3 pre, 1 post) extend it; **×** removes; **Reset / Clear / Apply** in the footer — **Apply** renders the query back into the trigger and closes. Reproduction of `FiltersContainer` → `Filters` → `FilterGroup` → `FilterCondition` (the live tree is store-bound).' } } }

// 2. Filter bar — inline chip bar (field·operator·value chips + Match All/Any). MOVED from Grid Toolbar.
export const FilterBar = () => ({
  data: () => ({
    match: 'All Filters', hover: null,
    fields: [
      { key: 'group', label: 'Groups', type: 'enum', values: ['Cloud', 'AWS Cloud', 'Production', 'Staging'] },
      { key: 'type', label: 'Types', type: 'enum', values: ['AWS Auto Scaling', 'EC2', 'S3', 'RDS', 'Lambda'] },
      { key: 'severity', label: 'Severity', type: 'enum', values: ['Critical', 'Major', 'Warning', 'Clear', 'Up', 'Down'] },
      { key: 'vendor', label: 'Vendor', type: 'string', values: ['Cisco', 'Juniper', 'Arista', 'HPE'] },
    ],
    chips: [
      { field: 'group', operator: '', value: '', dflt: true },
      { field: 'type', operator: '', value: '', dflt: true },
      { field: 'severity', operator: '', value: '', dflt: true },
      { field: 'type', operator: 'is', value: ['AWS Auto Scaling', 'EC2', 'S3', 'RDS'] },
      { field: '', operator: '', value: '' },
    ],
    editing: null,
    menu: null,
  }),
  computed: {
    options() {
      if (!this.editing) return []
      const c = this.chips[this.editing.i]
      if (this.editing.step === 'field') return this.fields.map(f => ({ k: f.key, l: f.label }))
      const fd = this.fd(c.field)
      if (this.editing.step === 'operator') return (OPS[fd ? fd.type : 'enum'] || []).map(o => ({ k: o.k, l: o.l }))
      return (fd ? fd.values : []).map(v => ({ k: v, l: v }))
    },
    hasComplete() {
      return this.chips.some(c => {
        if (!c.field || !c.operator) return false
        if (!this.takesValue(c)) return true
        const v = c.value
        return Array.isArray(v) ? v.length > 0 : v !== '' && v != null
      })
    },
  },
  methods: {
    fd(key) { return this.fields.find(f => f.key === key) },
    opDef(key) { for (const t in OPS) { const o = OPS[t].find(x => x.k === key); if (o) return o } return null },
    fieldLabel(c) { const f = this.fd(c.field); return f ? f.label : 'Select Filter' },
    opLabel(c) { const o = this.opDef(c.operator); return o ? o.l : '' },
    takesValue(c) { const o = this.opDef(c.operator); return o && !o.noValue },
    isMulti(c) { const o = this.opDef(c.operator); return o && o.multi },
    valSummary(c) { const v = c.value; if (Array.isArray(v)) { if (!v.length) return '…'; return v.length === 1 ? v[0] : v[0] + ' (+' + (v.length - 1) + ')' } return (v === '' || v == null) ? '…' : v },
    isStub(c) { return !c.operator },
    showClose(c) { return !this.isStub(c) || !c.field },
    active(i, step) { return this.editing && this.editing.i === i && this.editing.step === step },
    positionFromChip(i) {
      this.$nextTick(() => {
        const wrap = this.$el.querySelectorAll('.chip-wrap')[i]
        if (!wrap) { this.menu = null; return }
        const r = wrap.getBoundingClientRect()
        this.menu = { left: Math.round(r.left), top: Math.round(r.bottom + 6) }
      })
    },
    edit(i, step) {
      const c = this.chips[i]
      if (step === 'field' && c.dflt && c.field) step = 'operator'
      const toggleOff = this.active(i, step)
      this.editing = toggleOff ? null : { i, step }
      if (toggleOff) this.menu = null
      else this.positionFromChip(i)
    },
    pick(o) {
      const { i, step } = this.editing; const c = this.chips[i]
      if (step === 'field') { c.field = o.k; c.operator = ''; c.value = ''; this.editing = { i, step: 'operator' } }
      else if (step === 'operator') { c.operator = o.k; c.value = this.isMulti(c) ? [] : ''; this.editing = this.takesValue(c) ? { i, step: 'value' } : null }
      else { if (this.isMulti(c)) { const v = Array.isArray(c.value) ? c.value : []; c.value = v.includes(o.k) ? v.filter(x => x !== o.k) : [...v, o.k] } else { c.value = o.k; this.editing = null } }
      this.chips = [...this.chips]
      if (this.editing) this.positionFromChip(this.editing.i); else this.menu = null
    },
    isSel(i, o) { const v = this.chips[i].value; return Array.isArray(v) ? v.includes(o.k) : v === o.k },
    remove(i) { this.chips.splice(i, 1); this.editing = null; this.menu = null },
    add() { this.chips.push({ field: '', operator: '', value: '' }); const i = this.chips.length - 1; this.editing = { i, step: 'field' }; this.positionFromChip(i) },
    clearAll() { this.chips = []; this.editing = null; this.menu = null },
  },
  template: `
    <div class="flex items-center justify-between" style="padding:8px 0;gap:12px;color:var(--page-text-color)" @click="editing = null">
      <div class="flex items-center" style="flex:1 1 auto;min-width:0;gap:6px;overflow-x:auto;white-space:nowrap" @click.stop>
        <span v-for="(c, i) in chips" :key="i" class="chip-wrap" style="flex-shrink:0">
          <span :style="'${CHIP}'">
            <span :style="{ padding:'0 4px', cursor:'pointer', color: active(i,'field') ? 'var(--primary)' : 'var(--neutral-light)' }" @click.stop="edit(i,'field')">{{ fieldLabel(c) }}</span>
            <span v-if="c.operator" :style="{ padding:'0 4px', cursor:'pointer', borderLeft:'1px solid var(--border-color)', color: active(i,'operator') ? 'var(--primary)' : 'var(--neutral-regular)' }" @click.stop="edit(i,'operator')">{{ opLabel(c) }}</span>
            <span v-if="c.operator && takesValue(c)" :style="{ padding:'0 4px', cursor:'pointer', fontWeight:500, borderLeft:'1px solid var(--border-color)', color: active(i,'value') ? 'var(--primary)' : 'var(--neutral-button-text)' }" @click.stop="edit(i,'value')">{{ valSummary(c) }}</span>
            <span v-if="showClose(c)" class="ml-2 text-neutral-light cursor-pointer flex items-center" @click.stop="remove(i)"><MIcon name="times" style="font-size:11px" /></span>
          </span>
        </span>
        <MButton variant="neutral-lightest" :rounded="false" :shadow="false" style="height:32px;min-height:32px;padding:0 12px;line-height:1" @click.native.stop="add"><MIcon name="plus" class="text-primary" /><span class="text-primary" style="margin-left:6px">Filter</span></MButton>
      </div>
      <div v-if="editing && menu" :style="{ position:'fixed', left: menu.left + 'px', top: menu.top + 'px', zIndex: 1000, minWidth:'190px', maxHeight:'260px', overflowY:'auto', background:'var(--page-background-color)', border:'1px solid var(--border-color)', borderRadius:'6px', boxShadow:'0 8px 24px var(--neutral-shadow-light)' }" @click.stop>
        <div class="text-neutral-light" style="padding:6px 12px;font-size:10px;letter-spacing:.4px;text-transform:uppercase;border-bottom:1px solid var(--border-color);position:sticky;top:0;background:var(--page-background-color)">{{ editing.step }}</div>
        <div v-for="o in options" :key="o.k" class="flex items-center justify-between cursor-pointer" style="padding:7px 12px;font-size:13px" :style="{ background: hover===o.k ? 'var(--neutral-lighter)' : 'transparent', color: isSel(editing.i,o) ? 'var(--primary)' : 'inherit' }" @mouseenter="hover=o.k" @mouseleave="hover=null" @click.stop="pick(o)"><span>{{ o.l }}</span><MIcon v-if="isSel(editing.i,o)" name="check" style="font-size:11px" /></div>
        <div v-if="!options.length" class="text-neutral-light" style="padding:8px 12px;font-size:12px">No options</div>
      </div>
      <div v-if="hasComplete" class="flex items-center" style="flex:0 0 auto;gap:6px;font-size:13px" @click.stop>
        <MButton variant="neutral-lightest" :rounded="false" :shadow="false" style="height:32px;min-height:32px;padding:0 10px;line-height:1" title="Click to toggle AND / OR" @click.native="match = match==='All Filters' ? 'Any Filter' : 'All Filters'">
          <span class="text-neutral-light mr-1">Match</span><span class="text-primary font-500">{{ match }}</span>
          <svg class="ml-1 text-primary" width="14" height="14" viewBox="0 0 16 16" fill="none" style="vertical-align:middle"><path d="M2 8C2 6.4087 2.63214 4.88258 3.75736 3.75736C4.88258 2.63214 6.4087 2 8 2C9.67737 2.00631 11.2874 2.66082 12.4933 3.82667L14 5.33333M10.6667 5.33333H14V2M14 8C14 9.5913 13.3679 11.1174 12.2426 12.2426C11.1174 13.3679 9.5913 14 8 14C6.32264 13.9937 4.71265 13.3392 3.50667 12.1733L2 10.6667M2 14V10.6667H5.33333" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </MButton>
        <MButton variant="transparent" :rounded="false" :shadow="false" style="height:32px;min-height:32px;padding:0 8px;line-height:1" @click.native="clearAll"><span class="text-primary">Clear All</span></MButton>
      </div>
    </div>`,
})
FilterBar.parameters = { docs: { description: { story: 'The **filter bar** (`_base-filter-bar.vue` + `filter-chip.vue`, ~50×). **Default chips** (`Groups · Types · Severity`, no ×) + **completed chips** (`Types = AWS Auto Scaling (+3) ×`) + a **stub**. Filled chips (`--code-tag-background-color`, 4px, 32px) — muted field · operator · **bold value** — divider-split. **Interactive**: click a segment → its picker (field → operator → value); **+ Filter** adds · **×** removes; the right side is the **Match** toggle + **Clear All** (only once a filter is applied). Picker floats `position:fixed` so the scrolling row never clips it.' } } }

// 3. Quick filters — a preset one-click menu. MOVED from Grid Toolbar.
export const QuickFilters = () => ({
  data: () => ({ presets: ['Down monitors', 'Critical alerts', 'Unacknowledged', 'My favorites'] }),
  template: `
    <div style="display:flex;padding-bottom:170px;color:var(--page-text-color)">
      <div style="position:relative">
        <a class="text-neutral-light cursor-pointer inline-flex items-center justify-center" style="width:32px;height:32px;border:1px solid var(--border-color);border-radius:4px" title="Quick filters"><MIcon name="thumbs-up" /></a>
        <div style="position:absolute;left:0;top:38px;min-width:220px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:6px;box-shadow:0 6px 20px var(--neutral-shadow-light);overflow:hidden">
          <div v-for="q in presets" :key="q" class="flex items-center justify-between cursor-pointer" style="padding:9px 12px;font-size:13px">
            <span>{{ q }}</span><MIcon name="chevron-right" class="text-neutral-light" />
          </div>
        </div>
      </div>
    </div>`,
})
QuickFilters.parameters = { docs: { description: { story: 'The **quick-filters** menu (`filter-quick-menu.vue`) — a **thumbs-up** button opening a panel of **preset filters** (`{ key, label, condition }`). Picking one **applies that condition**. Used for common one-click filters (Down monitors, Critical alerts…).' } } }

// 4. Filter row — a few multi-selects + Reset/Apply (the metric-collection filter pattern).
export const FilterRow = () => ({
  template: `
    <div style="color:var(--page-text-color);padding-bottom:40px">
      <div class="text-neutral-light mb-3" style="font-size:12px">A simple <strong>filter row</strong> — a few multi-selects + Reset/Apply (e.g. the metric-collection filter).</div>
      <div style="position:relative;display:flex;align-items:flex-end;gap:16px;padding:14px 16px;background:var(--dropdown-background);border:1px solid var(--border-color);border-radius:6px;max-width:760px">
        <div v-for="f in ['Groups','Severity','Tags']" :key="f" style="flex:1"><div class="text-neutral-light mb-1" style="font-size:12px">{{ f }}</div>
          <div class="flex items-center justify-between" style="height:32px;padding:0 10px;border:1px solid var(--border-color);border-radius:4px;font-size:13px"><span class="text-neutral-light">Select</span><MIcon name="chevron-down" class="text-neutral-light" style="font-size:11px" /></div></div>
        <div class="flex" style="gap:8px">
          <MButton variant="default" :rounded="false" :shadow="false">Reset</MButton>
          <MButton variant="primary" :rounded="false" :shadow="false">Apply</MButton>
        </div>
        <MIcon name="times" class="text-neutral-light cursor-pointer" style="position:absolute;top:8px;right:8px;font-size:12px" />
      </div>
    </div>`,
})
FilterRow.parameters = { controls: { disable: true }, docs: { description: { story: 'A **filter row** — a small set of multi-selects (here **Groups · Severity · Tags**) + **Reset / Apply** + close **×**. The simplest filter archetype; used as a slide-in over a list (e.g. metric-collection-time). Each field is a `FlotoDropdownPicker` / entity picker with `allow-clear`.' } } }

// 5. Vertical filter — the faceted left-panel sidebar (checkbox + icon + count, collapsible groups).
export const VerticalFilter = () => ({
  data: () => ({
    checked: {},
    groups: [
      { n: 'Backup Status', open: true, rows: [{ n: 'Successful', c: 5, i: 'check-circle', col: 'var(--secondary-green)' }, { n: 'Failed', c: 3, i: 'times-circle', col: 'var(--secondary-red)' }] },
      { n: 'Config Conflict', open: true, rows: [{ n: 'In Sync', c: 1 }, { n: 'Conflict Detected', c: 6 }, { n: 'Not Applicable', c: 1 }] },
      { n: 'Device Type', open: true, rows: [{ n: 'Switch', c: 2, i: 'sitemap', col: 'var(--primary-alt)' }, { n: 'Router', c: 6, i: 'server', col: 'var(--primary-alt)' }] },
      { n: 'Vendor', open: false, rows: [{ n: 'Huawei', c: 1 }, { n: 'Cisco Systems', c: 6 }] },
      { n: 'Template', open: false, rows: [{ n: 'Cisco', c: 3 }, { n: 'sophos firewall', c: 1 }] },
    ],
  }),
  methods: {
    toggleG(g) { g.open = !g.open },
    toggle(key) { this.checked = { ...this.checked, [key]: !this.checked[key] } },
  },
  template: `
    <div style="width:300px;color:var(--page-text-color);border:1px solid var(--border-color);border-radius:6px;overflow:hidden">
      <div style="padding:8px"><div class="flex items-center" style="height:34px;padding:0 10px;gap:8px;border:1px solid var(--border-color);border-radius:4px;color:var(--neutral-light)"><MIcon name="search" style="font-size:12px" /><span style="font-size:13px">Search</span></div></div>
      <div style="max-height:380px;overflow:auto">
        <div v-for="g in groups" :key="g.n" style="border-top:1px solid var(--border-color)">
          <a @click="toggleG(g)" class="flex items-center cursor-pointer text-neutral-light" style="padding:9px 12px;font-size:12px;font-weight:500;text-decoration:none;text-transform:none">
            <MIcon :name="'chevron-' + (g.open?'down':'right')" class="mr-2" style="font-size:10px" />{{ g.n }}
          </a>
          <div v-if="g.open" style="padding-bottom:6px">
            <label v-for="r in g.rows" :key="g.n+r.n" class="flex items-center cursor-pointer" style="padding:5px 12px;font-size:13px">
              <MCheckbox :checked="!!checked[g.n+r.n]" @change="toggle(g.n+r.n)" />
              <MIcon v-if="r.i" :name="r.i" :style="{ color: r.col, margin: '0 8px' }" />
              <span :style="{ marginLeft: r.i ? '0' : '8px', flex: 1 }">{{ r.n }}</span>
              <span class="text-neutral-light">{{ r.c }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>`,
})
VerticalFilter.storyName = 'Vertical filter (faceted sidebar)'
VerticalFilter.parameters = { controls: { disable: true }, docs: { description: { story: 'The **vertical filter** — the faceted **left-panel** sidebar (`components/filters/vertical-filter/filters.vue`, shared by **APM Explorer / APM Error Tracker / RUM Sessions**, with **NCM**’s `explorer-grid-virtical-filter.vue` as a richer variant). A **search** atop **collapsible groups** (`MCollapse`) — *Backup Status, Config Conflict, Device Type, Vendor, Template…* — each row a **checkbox + optional status/type icon + label + count**; checking rows **filters the grid**. This is the **faceted-filter** archetype (it looks like a side menu but it *filters*, it doesn’t *navigate*) — distinct from **Navigation → Side menu**. (Reference reproduction.)' } } }
