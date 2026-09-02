/**
 * Builds the ObserveOps design-system MCP server: read tools + resources + one priming prompt.
 * Shared by both transports (stdio, HTTP). No state — safe to construct per request.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  specVersion,
  contract,
  llmsTxt,
  getComponent,
  resolveToken,
  readSpecFile,
  searchComponents,
  matchRecipe,
  getLayout,
  listGaps,
  resolvePurpose,
  resolveTokensUsed,
  buildTheme,
  validateUsage,
  validateRender,
  listLogos,
  resolveLogo,
  listIcons,
  resolveIcon,
  LAYOUT_KINDS,
} from './spec.js'

const json = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] })
const text = (s: string) => ({ content: [{ type: 'text' as const, text: s }] })

const ASK = (what: string) =>
  `No catalogued match for ${what}. Per the ObserveOps design-system contract, do NOT substitute, ` +
  `invent, or import from another library — STOP and ASK the user (state what you needed and why ` +
  `nothing fits). Check list_gaps for the known missing building blocks (charts/topology).`

export function buildServer(): McpServer {
  const server = new McpServer({ name: 'observeops-ds', version: specVersion })

  // ---- Tools -------------------------------------------------------------
  server.registerTool(
    'search_components',
    {
      title: 'Search components',
      description:
        'Find catalogued ObserveOps components by need/keyword. Returns ranked matches with selectHint. ' +
        'If nothing matches, you MUST stop and ask the user — never invent a component.',
      inputSchema: { query: z.string().describe('what you need, e.g. "slide-over edit panel"'), family: z.string().optional() },
    },
    async ({ query, family }) => {
      const hits = searchComponents(query, family)
      return hits.length ? json(hits) : text(ASK(`component query "${query}"`))
    }
  )

  server.registerTool(
    'get_component',
    {
      title: 'Get component spec',
      description:
        'Full registry for one component id: props/events/slots/apis, variants, states, do/dont, a11y, storybook. ' +
        'Includes `resolvedTokens` — each token used WITH its real light/dark value, so you never hardcode a colour.',
      inputSchema: { id: z.string().describe('component id from search_components / index') },
    },
    async ({ id }) => {
      const c = getComponent(id)
      if (!c) return text(`Unknown component id "${id}". Use search_components to find the right id.`)
      const resolvedTokens = resolveTokensUsed(c.registry?.tokensUsed || [])
      return json({ ...c, resolvedTokens })
    }
  )

  server.registerTool(
    'list_logos',
    {
      title: 'List obs-logo names',
      description:
        'Every logo name obs-logo can render (247 colour + 195 line marks — vendors, tech, monitor types, and the ' +
        'motadata brand). Call this BEFORE concluding a logo is missing — never hand-draw a brand/vendor mark.',
      inputSchema: {},
    },
    async () => json(listLogos())
  )

  server.registerTool(
    'resolve_logo',
    {
      title: 'Resolve one obs-logo name',
      description:
        'Check whether a logo exists (case/space-insensitive, aliases resolved) and how to use it. Returns the ' +
        'canonical name, available variants (color/line), whether it is built-in, the exact <obs-logo> tag, and ' +
        'near-match suggestions if not found. Use this instead of guessing or fabricating a mark.',
      inputSchema: { name: z.string().describe('a logo name, e.g. "motadata", "linux", "aws"') },
    },
    async ({ name }) => json(resolveLogo(name))
  )

  server.registerTool(
    'list_icons',
    {
      title: 'List obs-icon names',
      description:
        'Every glyph name obs-icon can render (~553 product icons — actions, objects, monitor types, status, plus DS ' +
        'additions like custom-report). ALL ship in the elements package (no opt-in import). Call this BEFORE ' +
        'concluding an icon is missing — never hand-draw/inline an SVG icon.',
      inputSchema: {},
    },
    async () => json(listIcons())
  )

  server.registerTool(
    'resolve_icon',
    {
      title: 'Resolve one obs-icon name',
      description:
        'Check whether an icon exists (case/space-insensitive, aliases + kebab/camelCase resolved) and how to use it. ' +
        'Returns the canonical name, the exact <obs-icon> tag, and near-match suggestions if not found. Use this ' +
        'instead of guessing a name or fabricating an icon.',
      inputSchema: { name: z.string().describe('an icon name, e.g. "custom-report", "search", "dashboard"') },
    },
    async ({ name }) => json(resolveIcon(name))
  )

  server.registerTool(
    'get_theme',
    {
      title: 'Get the resolved theme palette',
      description:
        'The full ObserveOps palette resolved to real values (light + dark) in one call — brand, surfaces, ' +
        'text, borders, status, severity + the structural scale. Use these EXACT values; never invent a palette. ' +
        'Brand = --primary (navy), NOT cyan/blue.',
      inputSchema: {},
    },
    async () => json(buildTheme())
  )

  server.registerTool(
    'validate_usage',
    {
      title: 'Validate usage against the DS',
      description:
        'Check your output before you finish: flags non-DS components, hardcoded colours (hex/rgb/hsl), and ' +
        'future mds-* tokens. Pass a component-id list, a colour list, and/or a code snippet. Returns violations to fix.',
      inputSchema: {
        components: z.array(z.string()).optional().describe('component ids you used'),
        colors: z.array(z.string()).optional().describe('colour values/token names you used'),
        snippet: z.string().optional().describe('the generated code to scan'),
      },
    },
    async ({ components, colors, snippet }) => json(validateUsage({ components, colors, snippet }))
  )

  server.registerTool(
    'validate_render',
    {
      title: 'Verify your RENDERED output against the DS',
      description:
        'Check the page you rendered, not just the rules. Static scan of the HTML (hardcoded colours, mds-* ' +
        'tokens, non-DS components) + a pointer to the shipped Playwright checker for the full 0–100 rendered ' +
        'conformance score (token/layout/philosophy/component). Run this before you finish.',
      inputSchema: {
        html: z.string().optional().describe('the rendered HTML of your page/component'),
        colors: z.array(z.string()).optional().describe('colour values you used'),
        components: z.array(z.string()).optional().describe('component ids you used'),
      },
    },
    async ({ html, colors, components }) => json(validateRender({ html, colors, components }))
  )

  server.registerTool(
    'resolve_token',
    {
      title: 'Resolve a token',
      description:
        'Resolve a design token by name (CSS "--var" or LESS "@var") to its value(s), or by styling PURPOSE ' +
        '(e.g. "card surface", "muted text") via the purpose-map. Never hardcode hex — use this.',
      inputSchema: { token: z.string().describe('a token name (--x / @x) OR a purpose phrase') },
    },
    async ({ token }) => {
      if (/^[-@]/.test(token)) {
        const val = resolveToken(token)
        return val
          ? json({ token, value: val })
          : text(
              `Token "${token}" is not in the DS. Do NOT hardcode a value — resolve by purpose ` +
                `(call resolve_token with a purpose phrase) or STOP and ASK.`
            )
      }
      const hits = resolvePurpose(token)
      return hits.length
        ? json({ purpose: token, matches: hits })
        : text(ASK(`token purpose "${token}"`))
    }
  )

  server.registerTool(
    'get_recipe',
    {
      title: 'Get a page/flow recipe',
      description: 'Match a screen/flow to a recipe (by id or description) → regions, components, gotchas, $gap markers.',
      inputSchema: { query: z.string().describe('recipe id or a screen description, e.g. "list of users"') },
    },
    async ({ query }) => {
      const hits = matchRecipe(query)
      return hits.length ? json(hits) : text(ASK(`recipe "${query}"`))
    }
  )

  server.registerTool(
    'get_layout',
    {
      title: 'Get layout structure',
      description: `Structural layer for a kind: ${LAYOUT_KINDS.join(' | ')}.`,
      inputSchema: { kind: z.enum(LAYOUT_KINDS) },
    },
    async ({ kind }) => {
      const data = getLayout(kind)
      return data ? json(data) : text(`Unknown layout kind. Valid: ${LAYOUT_KINDS.join(', ')}.`)
    }
  )

  server.registerTool(
    'list_gaps',
    {
      title: 'List known gaps',
      description: 'The building blocks NOT in the DS yet (charts/data-viz/topology). Hitting one of these = STOP and ASK.',
      inputSchema: {},
    },
    async () => json(listGaps())
  )

  server.registerTool(
    'get_contract',
    {
      title: 'Get the operating contract',
      description: 'The full AI operating contract (AGENTS.md): the rules you must follow when building ObserveOps UI.',
      inputSchema: {},
    },
    async () => text(contract())
  )

  server.registerTool(
    'get_setup',
    {
      title: 'How to install & render the real components',
      description: 'The install command + import snippet for the real ObserveOps components. Call this FIRST when building outside the product repo — the packages are PUBLIC on npm.',
      inputSchema: {},
    },
    async () =>
      text(
        'The ObserveOps design system ships as PUBLIC, installable npm packages (no auth):\n\n' +
          '```bash\n' +
          'npm install @mtdt/observeops-ds-elements @mtdt/observeops-ds-css @mtdt/observeops-ds-spec\n' +
          '```\n\n' +
          '```js\n' +
          "import '@mtdt/observeops-ds-elements'                 // registers the real <obs-*> web components\n" +
          "import '@mtdt/observeops-ds-css/observeops-ds.css'    // the DS tokens (light + dark)\n" +
          "import '@mtdt/observeops-ds-elements/logos'           // OPT-IN: the full 247-logo library for <obs-logo>\n" +
          '```\n\n' +
          '```html\n' +
          '<obs-button variant="primary">Save</obs-button>\n' +
          '<obs-input type="search" placeholder="Search…"></obs-input>\n' +
          '<obs-tag variant="tag-green">Active</obs-tag>\n' +
          '```\n\n' +
          'COVERAGE: the elements package ships ATOMS, MOLECULES, AND ORGANISMS as real, functional web components — ' +
          'including obs-table, obs-drawer, obs-modal, obs-menu, obs-toolbar, obs-page-header, obs-app-header, ' +
          'obs-sidebar, obs-side-menu, obs-tabs, obs-user-menu, obs-command-palette, obs-notification-menu. Discover ' +
          'the exact attributes/events/SLOTS/enums of any tag in elements-api.json (or via get_component). Some ' +
          'reference-only pieces (obs-filters, obs-layout-appshell) render but carry no data contract — compose those. ' +
          'For the FULL list of missing building blocks (charts/topology), call list_gaps. Logos: the brand mark + ' +
          "common set are built in; add `import '…/logos'` for all 247 (find names via list_logos / resolve_logo — " +
          'never hand-draw a mark). Icons: ~553 obs-icon glyphs ALL ship in the elements package (no opt-in import) — ' +
          'find the exact name via list_icons / resolve_icon (never hand-draw/inline an SVG icon). Charts: there is NO ' +
          'obs-chart element, but the DS ships 32 CAPTURED chart configs across 9 categories (time-series, top-n, ' +
          'distribution, anomaly, forecast, gauge, heat-map, map, sankey) — read charts/manifest.json + charts/fixtures/*.json ' +
          'in the spec package (or get_component("data-viz").chartLibrary), copy the fixture config and render with Highcharts ' +
          'v10; do NOT guess a chart. Configs are directly renderable (formatter/event fns stripped → engine defaults; attach ' +
          'charts/formatters.js to each fixture\'s $formatters for unit labels) and theme-adaptive (colours are DS tokens, same ' +
          'config in light+dark). Dark theme: set data-theme="dark-theme" on <html> (obs-user-menu can do this for ' +
          'you). A full page STARTS FROM THE APP SHELL, not a bare content area — call get_recipe("module-screen") ' +
          'for the rail → app-header → module-title → tabs → side-menu → content composition; a bare content page is a ' +
          'harness, not a screen. Events deliver the value in event.detail as an array — unwrap: ' +
          'Array.isArray(e.detail) ? e.detail[0] : e.detail. NOTE: a few events carry an OBJECT payload (e.g. ' +
          'obs-filters change = {conditions, match} since 0.1.150) — check get_component before assuming an array. ' +
          'UPDATING: after npm update, clear the bundler cache (rm -rf node_modules/.vite; restart with --force) — a ' +
          'stale pre-bundle serves the OLD version and makes fixed items look still-broken. Then verify with validate_render.'
      )
  )

  // ---- Resources ---------------------------------------------------------
  const res = (name: string, uri: string, rel: string, mimeType: string, getter?: () => string) =>
    server.registerResource(name, uri, { description: `ObserveOps DS: ${name}`, mimeType }, async (u: URL) => ({
      contents: [{ uri: u.href, mimeType, text: getter ? getter() : readSpecFile(rel) }],
    }))

  res('contract', 'spec://contract', 'AGENTS.md', 'text/markdown', contract)
  res('playbook', 'spec://playbook', 'authoring-playbook.md', 'text/markdown')
  res('llms', 'spec://llms.txt', 'llms.txt', 'text/markdown', llmsTxt)
  res('index', 'spec://index', 'components/index.json', 'application/json')
  res('recipes', 'spec://recipes', 'components/recipes/recipes.json', 'application/json')
  res('layouts', 'spec://layouts', 'layout/layouts.json', 'application/json')
  res('purpose-map', 'spec://tokens/purpose-map', 'tokens/purpose-map.json', 'application/json')
  res('variables', 'spec://tokens/variables', 'tokens/variables.json', 'application/json')

  // ---- Prompt ------------------------------------------------------------
  server.registerPrompt(
    'build-observeops-ui',
    {
      title: 'Build ObserveOps UI',
      description:
        'The full DS-native authoring loop: understand → plan screens → layout & surface (page/drawer/modal/panel) ' +
        '→ select component + variant WITH a reason → build with the real obs-* components → validate the render → ' +
        'fix to ≥90 → finalize. Enforces DS-only + STOP-and-ASK.',
    },
    () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text:
              'Build Motadata ObserveOps UI the way the product would — a whole page/flow, not just a snippet. ' +
              'Follow the ObserveOps design system via this MCP server. Read get_contract (AGENTS.md) and the ' +
              'authoring-playbook.md in @mtdt/observeops-ds-spec first, then run this loop and CITE your sources at ' +
              'each step:\n\n' +
              '1. UNDERSTAND — restate the request; enumerate the screens/steps in the flow (a flow is rarely one ' +
              'screen). For each: its job, whether it must keep a list in context, whether it is deep-linkable.\n' +
              '2. LAYOUT & PLACEMENT — pick the shell then screen regions then content layout with get_layout ' +
              '(shells/regions/content/grid). Everything mounts in the app shell; forms use the 12-col grid ' +
              '(6+6 half, 12 full, gutter 16).\n' +
              '3. SURFACE — for EACH screen choose page vs drawer vs modal vs panel vs popover. Load-bearing rules: ' +
              'edit-while-keeping-the-list → DRAWER; confirm/destructive → MODAL; complex deep-linkable record → ' +
              'FULL PAGE/route; progressive disclosure in place → inline panel; tiny anchored transient → popover. ' +
              'Cite the decisionFlow (get_component drawer/modal/popover, get_layout panels). Prefer the lighter, ' +
              'context-preserving surface unless viewport/deep-linkability forces a page.\n' +
              '4. SELECT + JUSTIFY — per element search_components → get_component; choose the VARIANT/STATE and ' +
              'write one line of rationale from decisionFlow/usageRules (why this, not the alternative). Choose by ' +
              'PURPOSE not appearance: LooseTags (add/remove) vs selected-pills (read-only display) vs severity ' +
              '(monitoring level) vs tag (status). One primary action per view; error/danger only for destructive.\n' +
              '5. COLOURS — resolve EVERY colour with resolve_token (by name or purpose) or get_theme; use the EXACT ' +
              'values. Brand is navy --primary (#111c2c light / #e3e8f2 dark), NOT cyan/blue. Structural tokens ' +
              '(spacing/radius/type) are LESS @vars — emit via <style lang="less"> or Tailwind, never raw px.\n' +
              '6. BUILD DS-ONLY — use the REAL components: @mtdt/observeops-ds-elements (<obs-button ' +
              'variant="primary">, works in React/Vue/HTML) + @mtdt/observeops-ds-css. Never reconstruct a ' +
              'look-alike. Events deliver the value in e.detail as an ARRAY — unwrap: ' +
              'Array.isArray(e.detail)?e.detail[0]:e.detail.\n' +
              '7. STOP-and-ASK — no matching recipe → still BUILD (compose from catalogued parts). A missing ' +
              'BUILDING BLOCK not in the DS (list_gaps: charts/topology/widget-tiles) → STOP and ASK, then record ' +
              'it in your declared-gaps manifest. Never substitute or import outside the DS.\n' +
              '8. VALIDATE THE RENDER — run validate_render (and the shipped conformance/ds-conformance.mjs on the ' +
              'rendered page): token + component + variant + philosophy + layout, 0–100. It catches a raw ' +
              '<button>/<input>/<a> or a fabricated chip (use obs-*), an invented variant, blue-instead-of-navy, ' +
              'mds-*, off-scale spacing.\n' +
              '9. FIX → FINALIZE — iterate 6↔8 until conformance ≥ 90 and every variant/surface choice is ' +
              'semantically right (no error-variant Save button, no long form in a modal). Finalize with: the ' +
              'page(s)/flow + a rationale summary (per screen: shell + surface + why; per element: component + ' +
              'variant + one-line reason) + the declared-gaps manifest (empty is best).',
          },
        },
      ],
    })
  )

  return server
}
