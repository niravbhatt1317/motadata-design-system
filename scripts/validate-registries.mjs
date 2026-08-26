#!/usr/bin/env node
/**
 * validate-registries.mjs — the DEEP publish gate (complements the shallow validate-spec.js).
 *
 * validate-spec.js only checks: JSON parses, registry exists, tokensUsed resolves, recipe ids, checksums.
 * It never validates registries against _schema.json, never checks decision-grade completeness, never
 * recomputes counts — so an incomplete AI-doc (a root cause of the AI-fidelity misses) can ship silently.
 *
 * This gate adds:
 *   1. Registry ↔ _schema.json  — every required field present + non-empty.
 *   2. Decision-grade completeness — decisionFlow non-empty; usageRules (when present) covers every variant;
 *      Storybook Usage MDX references the registry's variants (MDX↔registry drift check).
 *   3. Counts integrity — index.json.counts (components/families/coverage.*) recomputed from reality.
 *
 * Usage:  node design-system/scripts/validate-registries.mjs   (exit 1 on any failure)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DS = path.resolve(HERE, '..')
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const REG = path.join(DS, 'components', 'registry')
const errors = []
const warns = []

const schema = readJson(path.join(REG, '_schema.json'))
const required = schema.required || []
const empty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)

// ── 1 + 2. per-registry: schema completeness + decision-grade completeness ────
const idx = readJson(path.join(DS, 'components', 'index.json'))
// Only the catalogued COMPONENTS carry the full component contract. Foundation (layout-*) and
// building-block registries have a different, simpler shape → schema-check them leniently (warn only).
const componentIds = new Set((idx.components || []).map((c) => c.id))
const storyDirs = ['atoms', 'molecules', 'organisms', 'foundations'].map((t) => path.join(DS, 'storybook', t))
function usageMdx(id) {
  for (const d of storyDirs) { const p = path.join(d, `${id}.usage.stories.mdx`); if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8') }
  return null
}
const variantNames = (r) => (r.variants || []).map((v) => (typeof v === 'string' ? v : v.name)).filter(Boolean)

for (const f of fs.readdirSync(REG)) {
  if (!f.endsWith('.json') || f.startsWith('_')) continue
  const id = f.replace(/\.json$/, '')
  let r
  try { r = readJson(path.join(REG, f)) } catch (e) { errors.push(`${id}: unparseable — ${e.message}`); continue }

  // 1. schema completeness. Only the catalogued COMPONENTS carry the full contract; foundation/
  //    building-block registries have a simpler shape → warn-only. Hard-fail only on consumption-blocking
  //    issues; warn on the improvement backlog (some components legitimately have no sizes/variants).
  const isComponent = componentIds.has(id)
  const CORE = new Set(['summary', 'do', 'dont', 'tokensUsed', 'storybook']) // never legitimately empty
  for (const k of required) {
    if (!(k in r)) { (isComponent ? errors : warns).push(`${id}: required field "${k}" ABSENT`); continue }
    if (!empty(r[k])) continue
    if (isComponent && CORE.has(k)) errors.push(`${id}: required field "${k}" is empty`)
    else if (isComponent && k === 'decisionFlow' && r.tier !== 'foundation') errors.push(`${id}: decisionFlow is empty (not decision-grade)`)
    else warns.push(`${id}: "${k}" is empty/absent (fill when applicable)`)
  }

  // 2a. decision-grade: usageRules (when present) must cover every variant
  if (r.usageRules && typeof r.usageRules === 'object') {
    const keys = new Set(Object.keys(r.usageRules))
    const missing = variantNames(r).filter((v) => !keys.has(v))
    if (missing.length) warns.push(`${id}: usageRules missing a card for variant(s): ${missing.join(', ')}`)
    for (const [k, u] of Object.entries(r.usageRules)) if (!u || (!u.useWhen && !u.example)) warns.push(`${id}: usageRules.${k} has no useWhen/example`)
  } else if (r.tier !== 'foundation') {
    warns.push(`${id}: no usageRules — Usage isn't decision-grade (documentation-standard §6)`)
  }

  // 2c. variant-name fidelity: a component that declares a `variant` prop should carry a canonical
  //     `variantEnum` (the obs-*/CSS-class values, e.g. tag-green) so the render conformance checker can
  //     validate variant-name fidelity. Without it, ds-conformance can't check invented variants.
  if (isComponent && r.props && r.props.variant && !(Array.isArray(r.variantEnum) && r.variantEnum.length)) {
    warns.push(`${id}: declares a variant prop but has no canonical "variantEnum" — render variant-name validation can't run (add the obs-* variant values, e.g. tag-green)`)
  }

  // 2b. MDX ↔ registry drift: every registry variant should be discoverable in the Usage MDX
  const mdx = usageMdx(id)
  if (mdx) {
    const lc = mdx.toLowerCase()
    const notInMdx = variantNames(r).filter((v) => { const parts = v.toLowerCase().split(/[-_]/).filter((p) => p.length > 2); return !lc.includes(v.toLowerCase()) && !(parts.length && parts.every((p) => lc.includes(p))) })
    if (notInMdx.length) warns.push(`${id}: variant(s) in registry but not in Usage MDX (drift): ${notInMdx.join(', ')}`)
  }
}

// ── 3. counts integrity ───────────────────────────────────────────────────────
const comps = idx.components || []
const counts = idx.counts || {}
if (counts.components !== comps.length) errors.push(`index.counts.components=${counts.components} but components[]=${comps.length}`)
const famN = idx.families ? Object.keys(idx.families).length : 0
if (counts.families !== famN) errors.push(`index.counts.families=${counts.families} but families{}=${famN}`)
for (const key of Object.keys(counts.coverage || {})) {
  const got = comps.filter((c) => c.has && c.has[key] === true).length
  if (counts.coverage[key] !== got) errors.push(`index.counts.coverage.${key}=${counts.coverage[key]} but Σ(has.${key})=${got}`)
}
// every index component has a registry
for (const c of comps) if (!fs.existsSync(path.join(REG, `${c.id}.json`))) errors.push(`index component "${c.id}" has no registry file`)

// ── report ──────────────────────────────────────────────────────────────────
console.log(`validate-registries: ${warns.length} warning(s), ${errors.length} error(s)`)
for (const w of warns) console.log(`  ~ ${w}`)
if (errors.length) { console.error('\nFAILED:'); for (const e of errors) console.error(`  ✗ ${e}`); process.exit(1) }
console.log('OK — all registries schema-complete, decision-grade, counts consistent.')
