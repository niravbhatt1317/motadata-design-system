'use strict'
/**
 * @mtdt/observeops-ds-spec — thin loader.
 *
 * AI tools can simply READ the files (start at llms.txt → AGENTS.md → components/index.json).
 * This module is a convenience for code: it exposes the parsed spec plus a few helpers.
 * Heavy querying (search, validation) belongs to the MCP server, not here.
 */
const fs = require('fs')
const path = require('path')

const ROOT = __dirname
const readJSON = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'))
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8')

const index = readJSON('components/index.json')
const recipes = readJSON('components/recipes/recipes.json')
// the ACTUAL element API (attributes/events/slots/enums) for every SHIPPED obs-* tag — authoritative for validators
const elementsApi = (() => { try { return readJSON('elements-api.json') } catch (e) { return { elements: {} } } })()
const manifest = readJSON('spec.manifest.json')
const layout = { grid: readJSON('layout/grid.json'), layouts: readJSON('layout/layouts.json') }
const tokens = {
  variables: readJSON('tokens/variables.json'),
  structural: readJSON('tokens/structural.json'),
  kitAccents: readJSON('tokens/kit-accents.json'),
  purposeMap: readJSON('tokens/purpose-map.json'),
}

/** Full entry for one component: its index entry + its registry spec (or null if unknown). */
function getComponent(id) {
  const entry = (index.components || []).find((c) => c.id === id)
  if (!entry) return null
  return { ...entry, registry: readJSON(`components/registry/${id}.json`) }
}

/** Resolve a token to its value(s). CSS `--var` → {light,dark,...}; LESS `@var` → string. null if unknown. */
function resolveToken(name) {
  if (/^--/.test(name)) return tokens.variables[name] || null
  if (/^@/.test(name)) {
    if (tokens.kitAccents[name]) return tokens.kitAccents[name]
    let found = null
    const walk = (o) => {
      for (const [k, v] of Object.entries(o)) {
        if (k === name && typeof v !== 'object') found = v
        else if (v && typeof v === 'object') walk(v)
      }
    }
    walk(tokens.structural)
    return found
  }
  return null
}

/** Lightweight list of recipes (id + name + whenToUse) for selection. */
function listRecipes() {
  return (recipes.recipes || []).map((r) => ({ id: r.id, name: r.name, whenToUse: r.whenToUse }))
}

/** Absolute path to any shipped spec file — for tools that prefer to read raw. */
function specPath(rel) {
  return path.join(ROOT, rel)
}

module.exports = {
  index,
  recipes,
  layout,
  tokens,
  elementsApi,
  manifest,
  version: manifest.version,
  contract: () => readText('AGENTS.md'),
  llmsTxt: () => readText('llms.txt'),
  getComponent,
  resolveToken,
  listRecipes,
  specPath,
}
