# @mtdt/observeops-ds-mcp

An **MCP server** for the Motadata ObserveOps design system. It serves the published spec
(`@mtdt/observeops-ds-spec`) to AI agents as live **tools + resources**, so the agent fetches exactly
what it needs and gets a hard **STOP-and-ASK** signal when something isn't in the DS — instead of
loading the whole spec into context or guessing.

This is the *active* interface over the DS; the npm spec package is the source of truth it reads, and
the Storybook is the visual reference.

## Tools

| Tool | What it does |
| --- | --- |
| `search_components(query, family?)` | rank catalogued components; **no match → returns the STOP-and-ASK instruction** |
| `get_component(id)` | full registry: props/events/slots/apis, variants, states, do/dont, a11y + **`resolvedTokens`** (each token with its real light/dark value) |
| `resolve_token(token)` | resolve a token by name (`--var`/`@var`) or by purpose (`"card surface"`); never hardcode |
| `get_theme()` | the **whole resolved palette** (brand/surfaces/text/status/severity + structural), light + dark — brand is navy `--primary`, not blue |
| `get_recipe(query)` | match a screen/flow to a recipe → regions, components, gotchas, `$gap` markers |
| `get_layout(kind)` | shells / screenRegions / contentLayouts / panels / pageTemplates / grid / appShell |
| `list_gaps()` | the building blocks NOT in the DS (charts/topology) — hitting one = STOP and ASK |
| `validate_usage({components?, colors?, snippet?})` | check output before finishing — flags non-DS components, hardcoded colours, `mds-*` tokens |
| `get_contract()` | the full AI operating contract (`AGENTS.md`) |

Also exposes **resources** (`spec://contract`, `spec://index`, `spec://recipes`, `spec://tokens/*`, …)
and a **prompt** (`build-observeops-ui`) that primes the workflow.

## Connect an agent (stdio)

**Claude Code:**

```bash
claude mcp add observeops-ds -- npx -y @mtdt/observeops-ds-mcp
```

**Cursor / Windsurf / Cline / VS Code** — add to the MCP config (`.cursor/mcp.json` etc.):

```json
{
  "mcpServers": {
    "observeops-ds": {
      "command": "npx",
      "args": ["-y", "@mtdt/observeops-ds-mcp"]
    }
  }
}
```

## HTTP transport (remote / team)

```bash
npx @mtdt/observeops-ds-mcp-http   # or: node dist/http.js   (PORT=3333 default)
# POST JSON-RPC to http://<host>:3333/mcp ; GET /health for a liveness check
```

The HTTP server is stateless and unauthenticated by default — put it behind a host + auth before
exposing it beyond localhost.

## Develop

```bash
npm install
npm run build          # tsc -> dist/
npm run smoke          # stdio: spins up the server, drives every tool with an MCP client
node test/http-smoke.mjs   # HTTP: spawns the server, connects over streamable HTTP
```

The server depends on `@mtdt/observeops-ds-spec` and reuses its loader — bump that dependency to pick
up spec changes; no data is duplicated here.
