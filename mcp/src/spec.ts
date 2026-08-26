/**
 * Spec access layer — wraps @mtdt/observeops-ds-spec (the published package's loader) and adds the
 * search / match / gap helpers the MCP tools need. The spec package is the single source of truth;
 * this file never invents data, only reads + ranks it.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
// The spec package is CommonJS with no types — load via require and treat as the known shape.
const ds: any = require('@mtdt/observeops-ds-spec')

export const specVersion: string = ds.version
export const index = ds.index
export const recipesDoc = ds.recipes
export const layoutDoc = ds.layout // { grid, layouts }
export const tokens = ds.tokens // { variables, structural, kitAccents, purposeMap }
export const elementsApi = ds.elementsApi || { elements: {} } // ACTUAL shipped obs-* API (attrs/events/slots/enums)
// Every SHIPPED obs-* tag id (with `obs-` stripped) — some ship without a catalogue registry entry (icon, tags,
// layout-*, …). validate_* must treat these as KNOWN, not "unknown-component" (G8).
export const shippedTags: Set<string> = new Set(
  Object.keys(elementsApi.elements || {}).map((t: string) => t.replace(/^obs-/, ''))
)

// ---- logo name index (G14) — the DS ships 247 colour + 195 line logos; expose the names so an AI never
// concludes a real logo is "missing" (which led a consumer to hand-draw a brand mark). Data from logo.json.
function logoNames(): { colour: string[]; line: string[]; aliases: Record<string, string>; builtIn: string[] } {
  const reg = ds.getComponent('logo')
  return (reg && reg.registry && reg.registry.names) || { colour: [], line: [], aliases: {}, builtIn: [] }
}
export function listLogos(): any {
  const n = logoNames()
  return {
    total: n.colour.length + n.line.length,
    builtInCount: (n.builtIn || []).length,
    colour: n.colour,
    line: n.line,
    aliases: n.aliases,
    $note: 'obs-logo names. The built-in set ships in @mtdt/observeops-ds-elements; for the FULL set add ' +
      "`import '@mtdt/observeops-ds-elements/logos'`. Names are case/space-insensitive; aliases resolve too.",
  }
}
export function resolveLogo(name: string): any {
  const n = logoNames()
  const k = String(name || '').trim().toLowerCase().replace(/\s+/g, '-')
  const canonical = n.aliases[k] || k
  const inColour = n.colour.includes(canonical)
  const inLine = n.line.includes(canonical)
  if (!inColour && !inLine) {
    // suggest near matches so an unknown name routes to the right one instead of a hand-drawn asset
    const near = [...n.colour, ...n.line].filter((x) => x.includes(canonical) || canonical.includes(x)).slice(0, 8)
    return { found: false, name, canonical, suggestions: near, $note: 'No such logo. Try a suggestion, or list_logos. Do NOT hand-draw a brand mark.' }
  }
  return {
    found: true, name, canonical,
    variants: [inColour ? 'color' : null, inLine ? 'line' : null].filter(Boolean),
    builtIn: (n.builtIn || []).includes(canonical),
    usage: `<obs-logo name="${canonical}"${inLine && !inColour ? ' variant="line"' : ''}></obs-logo>`,
    $note: (n.builtIn || []).includes(canonical) ? 'In the built-in set — renders with just the elements package.'
      : "Not built-in — add `import '@mtdt/observeops-ds-elements/logos'` to render this one.",
  }
}

// ---- icon name index — parallels logos: the DS ships ~553 obs-icon glyphs; expose the names so an AI never
// concludes a real icon is "missing" (which leads to hand-drawn SVG — the exact anti-pattern obs-icon exists to end).
// Data from icon.json `names` (written by build-icons.mjs). `list` = kebab names; obs-icon also accepts camelCase.
function iconNames(): { total: number; list: string[]; aliases: Record<string, string>; evenodd: string[] } {
  // read the registry file directly — obs-icon is not in index.components, so getComponent('icon') is null.
  try {
    const reg = JSON.parse(readFileSync(ds.specPath('components/registry/icon.json'), 'utf8'))
    return reg.names || { total: 0, list: [], aliases: {}, evenodd: [] }
  } catch (e) {
    return { total: 0, list: [], aliases: {}, evenodd: [] }
  }
}
export function listIcons(): any {
  const n = iconNames()
  return {
    total: n.total || n.list.length,
    list: n.list,
    aliases: n.aliases,
    $note: 'obs-icon glyph names (kebab; camelCase also works). ALL ship in @mtdt/observeops-ds-elements — no opt-in ' +
      'import needed (unlike logos). Use `<obs-icon name="…">`. Call this BEFORE concluding an icon is missing; never hand-draw one.',
  }
}
export function resolveIcon(name: string): any {
  const n = iconNames()
  const k = String(name || '').trim().toLowerCase().replace(/\s+/g, '-')
  const canonical = n.aliases[k] || k
  if (!n.list.includes(canonical)) {
    const near = n.list.filter((x) => x.includes(canonical) || canonical.includes(x)).slice(0, 8)
    return { found: false, name, canonical, suggestions: near, $note: 'No such icon. Try a suggestion, or list_icons. Do NOT hand-draw an icon.' }
  }
  return {
    found: true, name, canonical,
    usage: `<obs-icon name="${canonical}"></obs-icon>`,
    $note: 'Ships in the elements package (no extra import). Inherits currentColor; set `size` in px or any CSS length.',
  }
}

export function contract(): string {
  return ds.contract()
}
export function llmsTxt(): string {
  return ds.llmsTxt()
}
export function getComponent(id: string): any {
  return ds.getComponent(id)
}
export function resolveToken(name: string): any {
  return ds.resolveToken(name)
}
export function readSpecFile(rel: string): string {
  return readFileSync(ds.specPath(rel), 'utf8')
}

export interface ComponentHit {
  id: string
  display: string
  family: string
  summary: string
  selectHint: string
}

/** Rank catalogued components against a free-text query. Empty array = no match (the caller asks). */
export function searchComponents(query: string, family?: string): ComponentHit[] {
  const q = (query || '').trim().toLowerCase()
  const terms = q.split(/\s+/).filter(Boolean)
  const comps: any[] = (index.components || []).filter(
    (c: any) => !family || (c.family || '').toLowerCase() === family.toLowerCase()
  )
  const scored = comps
    .map((c: any) => {
      const hay = [c.id, c.display, c.summary, c.selectHint, c.family, (c.variants || []).join(' '), (c.keywords || []).join(' ')]
        .join(' ')
        .toLowerCase()
      let score = 0
      for (const t of terms) if (hay.includes(t)) score++
      if ((c.id || '').toLowerCase() === q || (c.display || '').toLowerCase() === q) score += 5
      return { c, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, 8).map((x) => ({
    id: x.c.id,
    display: x.c.display,
    family: x.c.family,
    summary: x.c.summary,
    selectHint: x.c.selectHint,
  }))
}

/** Find a recipe by exact id, else rank by name / whenToUse / examples. */
export function matchRecipe(idOrDesc: string): any[] {
  const recipes: any[] = recipesDoc.recipes || []
  const exact = recipes.find((r) => r.id === idOrDesc)
  if (exact) return [exact]
  const terms = (idOrDesc || '').toLowerCase().split(/\s+/).filter(Boolean)
  return recipes
    .map((r) => {
      const hay = [r.id, r.name, r.whenToUse, (r.examples || []).join(' ')].join(' ').toLowerCase()
      let score = 0
      for (const t of terms) if (hay.includes(t)) score++
      return { r, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.r)
}

export const LAYOUT_KINDS = [
  'grid',
  'appShell',
  'shells',
  'screenRegions',
  'contentLayouts',
  'panels',
  'pageTemplates',
] as const

export function getLayout(kind: string): any {
  const L = layoutDoc.layouts
  switch (kind) {
    case 'grid':
      return layoutDoc.grid
    case 'appShell':
      return L.appShell
    case 'shells':
      return L.shells
    case 'screenRegions':
      return L.screenRegions
    case 'contentLayouts':
      return L.contentLayouts
    case 'panels':
      return L.panels
    case 'pageTemplates':
      return L.pageTemplates
    default:
      return null
  }
}

/** The known missing building blocks — what the agent must STOP-and-ASK about. */
export function listGaps(): any {
  const recipes: any[] = recipesDoc.recipes || []
  const recipeGapMarkers: any[] = []
  for (const r of recipes)
    for (const reg of r.regions || [])
      if (reg.$gap) recipeGapMarkers.push({ recipe: r.id, region: reg.region, gap: reg.$gap })
  return { knownGaps: recipesDoc.$knownGaps || null, recipeGapMarkers }
}

/** Resolve a styling PURPOSE (e.g. "card surface", "muted text") to token(s) via purpose-map. */
export function resolvePurpose(purpose: string): any[] {
  const pm = tokens.purposeMap || {}
  const q = (purpose || '').toLowerCase()
  const hits: any[] = []
  const walk = (obj: any, path: string[]) => {
    if (!obj || typeof obj !== 'object') return
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$')) continue
      if (v && typeof v === 'object' && !('token' in (v as any)) && !Array.isArray(v)) {
        walk(v, [...path, k])
      } else {
        hits.push({ purpose: [...path, k].join(' / '), ...(typeof v === 'object' ? (v as any) : { value: v }) })
      }
    }
  }
  walk(pm.color || {}, ['color'])
  const terms = q.split(/\s+/).filter(Boolean)
  return hits.filter((h) => terms.every((t) => h.purpose.toLowerCase().includes(t))).slice(0, 12)
}

const TOKEN_RE = /(--[a-z0-9-]+|@[a-z0-9-]+)/i

/** Resolve each tokensUsed name to its value(s) — so an agent can't use a name without seeing the value. */
export function resolveTokensUsed(tokensUsed: string[]): any[] {
  return (tokensUsed || []).map((name) => {
    const m = String(name).match(TOKEN_RE)
    const tok = m ? m[1] : String(name)
    const value = resolveToken(tok)
    return value
      ? { token: tok, value }
      : { token: String(name), value: null, note: 'not a resolvable token (prose/wildcard) — do NOT hardcode' }
  })
}

/** The full resolved palette (light + dark) in one call — for themed builds; emit these EXACT values. */
export function buildTheme(): any {
  const pm = tokens.purposeMap || {}
  const primary = resolveToken('--primary') || {}
  return {
    $note:
      'The resolved ObserveOps palette. Use these EXACT values — never invent or approximate. ' +
      'Colours are CSS --vars (theme-aware). Structural tokens are LESS @vars (emit via <style lang="less"> or Tailwind).',
    brand: { token: '--primary', light: primary.light, dark: primary.dark, warning: 'navy — NOT cyan, NOT blue' },
    formControlAccent: { token: '@primary-color', value: '#099dd9', note: 'cyan — Ant form controls only (radio/checkbox/select)' },
    color: pm.color || {},
    structural: pm.structural || {},
    rules: pm.$rules || [],
  }
}

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g
const FUNC_RE = /\b(?:rgba?|hsla?)\([^)]*\)/gi
const MDS_RE = /--mds-[a-z0-9-]+/g

function checkColor(raw: string, out: any[]) {
  const c = String(raw).trim()
  if (/^#[0-9a-fA-F]{3,8}$/.test(c) || /^(?:rgba?|hsla?)\(/i.test(c)) {
    out.push({ type: 'hardcoded-colour', value: c, fix: 'Resolve via resolve_token (name or purpose) / get_theme — never hardcode.' })
  } else if (/^--mds-/.test(c)) {
    out.push({ type: 'future-token', value: c, fix: 'mds-* is the future/unwired layer — emit runtime --vars instead.' })
  } else if (/^(?:--|@)/.test(c)) {
    const m = c.match(TOKEN_RE)
    if (m && !resolveToken(m[1])) out.push({ type: 'unknown-token', value: c, fix: 'Not a DS token — resolve by purpose or STOP and ASK.' })
  }
}

/** Flag non-DS components, hardcoded colours, unknown/future tokens in a component list / colour list / snippet. */
export function validateUsage(input: { components?: string[]; colors?: string[]; snippet?: string }): any {
  const violations: any[] = []
  // A component is KNOWN if it's a catalogued registry entry OR a SHIPPED obs-* tag (G8 — icon/tags/layout-* ship
  // without a catalogue entry but are real, usable elements). Accept both the bare id and the `obs-` tag form.
  const knownIds = new Set<string>([...(index.components || []).map((c: any) => c.id), ...shippedTags])

  for (const id of input.components || []) {
    const bare = String(id).replace(/^obs-/, '')
    if (!knownIds.has(bare)) {
      violations.push({ type: 'unknown-component', value: id, fix: 'Not in the DS — use search_components, or STOP and ASK.' })
    }
  }
  for (const col of input.colors || []) checkColor(col, violations)

  if (input.snippet) {
    const s = input.snippet
    const lits = [...new Set([...(s.match(HEX_RE) || []), ...(s.match(FUNC_RE) || [])])]
    for (const lit of lits) {
      violations.push({ type: 'hardcoded-colour', value: lit, fix: 'Resolve via resolve_token / get_theme — never hardcode a colour.' })
    }
    for (const m of [...new Set(s.match(MDS_RE) || [])]) {
      violations.push({ type: 'future-token', value: m, fix: 'Do not emit mds-* (future/unwired) — use runtime --vars.' })
    }
  }

  return {
    ok: violations.length === 0,
    count: violations.length,
    violations,
    $note: violations.length
      ? 'Contract violations — fix every one before producing output. Colours must be DS tokens, components must be catalogued.'
      : 'No violations found in the colour/component/token checks.',
  }
}

// validate_render — verify the RENDERED output, not just the rules. Runs the static scan on the page's
// HTML (hardcoded colours / mds-* / non-DS components), then points to the shipped Playwright checker for
// the full 0–100 rendered conformance score (token/layout/philosophy/component + nearest-token suggestions).
export function validateRender(input: { html?: string; colors?: string[]; components?: string[] }): any {
  const base = validateUsage({ components: input.components, colors: input.colors, snippet: input.html })
  return {
    ...base,
    $renderCheck:
      'This is a STATIC scan. For a full RENDERED conformance score (0–100 on token / layout / philosophy / ' +
      'component adherence, with the nearest DS token for every off-token colour), run the shipped Playwright ' +
      'checker: `node node_modules/@mtdt/observeops-ds-spec/conformance/ds-conformance.mjs <your-page.html>` ' +
      '(see conformance/README.md). Aim for ≥ 90. Brand must be navy --primary, never blue/cyan.',
  }
}
