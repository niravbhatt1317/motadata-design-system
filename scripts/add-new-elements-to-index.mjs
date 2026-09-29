// One-off: add the 4 new DS elements (gauge, severity-heatmap, widget-card, widget-grid) to components/index.json
// — component entries derived from their registries, family membership, and recomputed counts. Idempotent.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const IDX = path.join(DS, 'components/index.json')
const REG = path.join(DS, 'components/registry')
const NEW = ['gauge', 'severity-heatmap', 'widget-card', 'widget-grid']
const REFRESH = ['date-time-pickers'] // already in index — recompute its computed fields (has/counts/spec), preserve the rest

const idx = JSON.parse(fs.readFileSync(IDX, 'utf8'))

function entry(id) {
  const r = JSON.parse(fs.readFileSync(path.join(REG, `${id}.json`), 'utf8'))
  const has = {
    props: !!(r.props && Object.keys(r.props).length),
    states: !!(r.states && r.states.length),
    sizes: !!(r.sizes && r.sizes.length),
    variants: !!(r.variants && r.variants.length),
    decisionFlow: !!(r.decisionFlow && r.decisionFlow.length),
    do: !!(r.do && r.do.length),
    dont: !!(r.dont && r.dont.length),
    tokensUsed: !!(r.tokensUsed && r.tokensUsed.length),
    apis: !!(r.events && r.events.length),
    a11y: !!(r.a11y && Object.keys(r.a11y).length),
  }
  const specPath = path.join(DS, 'components/specs', `${id}.md`)
  return {
    id, display: r.display, tier: r.tier || 'molecule', family: r.family, category: null,
    status: r.status || 'core', summary: r.summary || '', selectHint: r.selectHint || '',
    variants: (r.variants || []).map((v) => v.name || v),
    registry: `components/registry/${id}.json`,
    ...(fs.existsSync(specPath) ? { spec: `components/specs/${id}.md` } : {}),
    storybook: r.storybook || '',
    related: r.related || [],
    knownIssueCount: (r.knownIssues || []).length,
    tokenCount: (r.tokensUsed || []).length,
    has,
  }
}

for (const id of NEW) {
  const r = JSON.parse(fs.readFileSync(path.join(REG, `${id}.json`), 'utf8'))
  // component entry (replace if it already exists → idempotent)
  idx.components = idx.components.filter((c) => c.id !== id)
  idx.components.push(entry(id))
  // family membership
  const fam = r.family
  idx.families[fam] = idx.families[fam] || []
  if (!idx.families[fam].includes(id)) idx.families[fam].push(id)
}

// refresh existing entries in place (merge: keep old fields, overwrite the computed ones)
for (const id of REFRESH) {
  const i = idx.components.findIndex((c) => c.id === id)
  if (i < 0) continue
  const fresh = entry(id)
  idx.components[i] = { ...idx.components[i], ...fresh }
}

// recompute counts from scratch (authoritative)
idx.counts.components = idx.components.length
idx.counts.families = Object.keys(idx.families).length
const cov = { props: 0, apis: 0, states: 0, sizes: 0, variants: 0, a11y: 0 }
for (const c of idx.components) for (const k of Object.keys(cov)) if (c.has && c.has[k]) cov[k]++
idx.counts.coverage = cov

fs.writeFileSync(IDX, JSON.stringify(idx, null, 2) + '\n')
console.log(`index.json → ${idx.counts.components} components, ${idx.counts.families} families`)
console.log('families touched:', [...new Set(NEW.map((id) => JSON.parse(fs.readFileSync(path.join(REG, `${id}.json`), 'utf8')).family))].join(', '))
console.log('coverage:', JSON.stringify(idx.counts.coverage))
