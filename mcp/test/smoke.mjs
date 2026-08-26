/**
 * Smoke test — drives the built server over stdio with a real MCP client and asserts each tool.
 * Run: npm run build && npm run smoke
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import assert from 'node:assert'

const text = (r) => (r.content || []).map((c) => c.text).join('\n')

const transport = new StdioClientTransport({ command: 'node', args: ['dist/stdio.js'] })
const client = new Client({ name: 'smoke', version: '1.0.0' })
await client.connect(transport)

// tools / resources / prompts are advertised
const tools = (await client.listTools()).tools.map((t) => t.name)
const resources = (await client.listResources()).resources.map((r) => r.uri)
const prompts = (await client.listPrompts()).prompts.map((p) => p.name)
for (const t of ['search_components', 'get_component', 'resolve_token', 'get_recipe', 'get_layout', 'list_gaps', 'get_contract', 'get_theme', 'validate_usage'])
  assert(tools.includes(t), `missing tool ${t}`)
assert(resources.includes('spec://contract'), 'missing contract resource')
assert(prompts.includes('build-observeops-ui'), 'missing prompt')

// search hits
const s = text(await client.callTool({ name: 'search_components', arguments: { query: 'slide-over edit panel' } }))
assert(/drawer/i.test(s), 'search should find drawer')

// search no-match -> ASK signal
const noMatch = text(await client.callTool({ name: 'search_components', arguments: { query: 'qwerty-zxcv-nope' } }))
assert(/STOP and ASK/i.test(noMatch), 'no-match should return the ASK signal')

// get_component now includes resolvedTokens with real values
const comp = JSON.parse(text(await client.callTool({ name: 'get_component', arguments: { id: 'button' } })))
assert(comp.registry && comp.registry.variants, 'get_component should return registry')
assert(Array.isArray(comp.resolvedTokens) && comp.resolvedTokens.length, 'get_component should include resolvedTokens')
assert(comp.resolvedTokens.some((t) => t.value), 'resolvedTokens should carry real values')

// get_theme — resolved palette, brand is navy
const theme = JSON.parse(text(await client.callTool({ name: 'get_theme', arguments: {} })))
assert(theme.brand && theme.brand.light === '#111c2c', 'get_theme brand = navy #111c2c')
assert(theme.color && theme.structural, 'get_theme has color + structural')

// validate_usage — flags an invented blue + a non-DS component, passes clean input
const bad = JSON.parse(text(await client.callTool({ name: 'validate_usage', arguments: { components: ['nope'], colors: ['#4F6EF5'], snippet: 'color:#4F6EF5; background: var(--mds-x);' } })))
assert(bad.ok === false && bad.count >= 3, 'validate_usage flags violations')
assert(bad.violations.some((v) => v.type === 'hardcoded-colour'), 'flags hardcoded colour')
assert(bad.violations.some((v) => v.type === 'unknown-component'), 'flags non-DS component')
assert(bad.violations.some((v) => v.type === 'future-token'), 'flags mds-* token')
const good = JSON.parse(text(await client.callTool({ name: 'validate_usage', arguments: { components: ['drawer'], colors: ['--primary'], snippet: 'color: var(--page-text-color);' } })))
assert(good.ok === true, 'validate_usage passes clean DS usage')

// resolve_token by name + by purpose
const tok = JSON.parse(text(await client.callTool({ name: 'resolve_token', arguments: { token: '--primary' } })))
assert(tok.value && tok.value.light === '#111c2c', 'resolve_token --primary -> navy')
const purpose = text(await client.callTool({ name: 'resolve_token', arguments: { token: 'card surface' } }))
assert(/--common-widget-bg/.test(purpose), 'resolve_token purpose -> token')

// recipe + layout + gaps + contract
const recipe = text(await client.callTool({ name: 'get_recipe', arguments: { query: 'list of users' } }))
assert(/list-view/.test(recipe), 'get_recipe should match list-view')
const layout = text(await client.callTool({ name: 'get_layout', arguments: { kind: 'grid' } }))
assert(layout.length > 10, 'get_layout grid')
const gaps = text(await client.callTool({ name: 'list_gaps', arguments: {} }))
assert(/chart/i.test(gaps), 'list_gaps mentions charts')
const contract = text(await client.callTool({ name: 'get_contract', arguments: {} }))
assert(/Compose by default/i.test(contract), 'get_contract returns AGENTS.md')

await client.close()
console.log(`SMOKE PASSED — ${tools.length} tools, ${resources.length} resources, ${prompts.length} prompt`)
console.log('  tools:', tools.join(', '))
