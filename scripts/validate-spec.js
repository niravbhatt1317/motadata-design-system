#!/usr/bin/env node
/**
 * Validate the assembled spec package (./package/) before publishing.
 * Fails (exit 1) on: unparseable JSON, an index component with no registry file, a registry
 * tokensUsed entry that doesn't resolve, a recipe component id that is neither catalogued nor
 * flagged as a $gap, or a missing/!=manifest file set. Token wildcards/prose are skipped.
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const OUT = path.join(__dirname, '..', 'package')
const errors = []
const warns = []
const J = (rel) => JSON.parse(fs.readFileSync(path.join(OUT, rel), 'utf8'))

// --- 1. every JSON parses --------------------------------------------------
function allJson(dir, acc = []) {
  for (const n of fs.readdirSync(dir)) {
    if (n === 'node_modules') continue
    const abs = path.join(dir, n)
    if (fs.statSync(abs).isDirectory()) allJson(abs, acc)
    else if (n.endsWith('.json')) acc.push(abs)
  }
  return acc
}
for (const abs of allJson(OUT)) {
  try { JSON.parse(fs.readFileSync(abs, 'utf8')) }
  catch (e) { errors.push(`JSON parse failed: ${path.relative(OUT, abs)} — ${e.message}`) }
}

// --- token resolver --------------------------------------------------------
const variables = J('tokens/variables.json')
const structural = J('tokens/structural.json')
const kit = J('tokens/kit-accents.json')
function lessKeys(obj, acc = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('@')) acc.add(k)
    if (v && typeof v === 'object') lessKeys(v, acc)
  }
  return acc
}
const LESS = lessKeys(structural)
for (const k of Object.keys(kit)) if (k.startsWith('@')) LESS.add(k)
function resolves(tok) {
  if (/^--[a-z0-9-]+$/i.test(tok)) return tok in variables
  if (/^@[a-z0-9-]+$/i.test(tok)) return LESS.has(tok)
  return null // wildcard / prose / annotated — not a strict token, skip
}

// --- 2/3. index <-> registry, tokensUsed ----------------------------------
const index = J('components/index.json')
let tokenRefs = 0
for (const c of index.components || []) {
  const regPath = path.join(OUT, 'components/registry', `${c.id}.json`)
  if (!fs.existsSync(regPath)) { errors.push(`index component "${c.id}" has no registry file`); continue }
  const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'))
  for (const tok of reg.tokensUsed || []) {
    const r = resolves(tok)
    if (r === false) errors.push(`${c.id}.json tokensUsed: "${tok}" does not resolve`)
    else if (r === true) tokenRefs++
    else warns.push(`${c.id}.json tokensUsed: "${tok}" skipped (wildcard/prose)`)
  }
}

// --- 4. recipes: every used id is catalogued OR the region is a $gap -------
const recipes = J('components/recipes/recipes.json')
const known = new Set((index.components || []).map((c) => c.id))
for (const rec of recipes.recipes || []) {
  for (const reg of rec.regions || []) {
    const gap = !!reg.$gap
    const ids = []
    for (const u of [...(reg.use || []), ...(reg.alt || []), ...(reg.cells || []), ...(reg.fields || [])]) {
      if (u && typeof u === 'object' && u.id) ids.push(u.id)
    }
    for (const id of ids) {
      if (!known.has(id) && !gap) {
        errors.push(`recipe "${rec.id}" region "${reg.region}" uses uncatalogued id "${id}" without a $gap marker`)
      }
    }
  }
}

// --- 5. manifest matches shipped files ------------------------------------
if (fs.existsSync(path.join(OUT, 'spec.manifest.json'))) {
  const man = J('spec.manifest.json')
  for (const f of man.files || []) {
    const abs = path.join(OUT, f.path)
    if (!fs.existsSync(abs)) { errors.push(`manifest lists missing file: ${f.path}`); continue }
    const sha = crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex')
    if (sha !== f.sha256) errors.push(`manifest checksum mismatch: ${f.path}`)
  }
} else {
  errors.push('spec.manifest.json missing — run build first')
}

// --- report ----------------------------------------------------------------
console.log(`validate-spec: ${tokenRefs} strict tokens resolved, ${warns.length} skipped, ${errors.length} errors`)
if (errors.length) { console.error('\nFAILED:'); for (const e of errors) console.error('  ✗ ' + e); process.exit(1) }
console.log('OK — spec package is valid.')
