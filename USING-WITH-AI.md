# Using the ObserveOps Design System with AI tools

This design system is built to be **consumed by AI coding tools** (Cursor, Claude Code, Windsurf,
Cline, Copilot, …) so they build ObserveOps UI from the real components, tokens, recipes and rules —
instead of guessing. There are several ways to give a tool the DS; pick what fits.

| Artifact | What it is | Best for |
| --- | --- | --- |
| **MCP server** `@mtdt/observeops-ds-mcp` | live tools the agent calls (search/get/resolve/validate) | the strongest path — agents that support MCP |
| **npm spec package** `@mtdt/observeops-ds-spec` | the machine-readable spec as files (+ a JS loader) | tools that read files / offline / CI |
| **look package** `@mtdt/observeops-ds-css` | the exact tokens as one CSS file | pixel-exact styling in standalone prototypes (any framework) |
| **Storybook** | the visual catalogue | humans + visual reference (don't scrape it) |

## Option A — the MCP server (recommended)

The server makes the spec *active*: the agent calls tools and gets a hard **STOP-and-ASK** signal when
something isn't in the DS.

**Claude Code:**

```bash
claude mcp add observeops-ds -s user -- npx -y @mtdt/observeops-ds-mcp
claude mcp list        # observeops-ds — ✓ Connected
```

**Cursor / Windsurf / Cline / VS Code** — add to the MCP config (`.cursor/mcp.json`, etc.):

```json
{
  "mcpServers": {
    "observeops-ds": { "command": "npx", "args": ["-y", "@mtdt/observeops-ds-mcp"] }
  }
}
```

### The tools

| Tool | What it does |
| --- | --- |
| `search_components(query, family?)` | rank components; no match → returns the STOP-and-ASK instruction |
| `get_component(id)` | full registry + `resolvedTokens` (each token with its real light/dark value) |
| `resolve_token(token)` | a token by name (`--var`/`@var`) or by purpose (`"card surface"`) |
| `get_theme()` | the whole resolved palette (light + dark) — brand is navy `--primary`, not blue |
| `get_recipe(query)` | match a screen/flow to a recipe → regions, components, gotchas, `$gap` |
| `get_layout(kind)` | shells / regions / content-layouts / panels / grid / templates |
| `list_gaps()` | the building blocks NOT in the DS (charts/topology) → STOP and ASK |
| `validate_usage({components?, colors?, snippet?})` | flags non-DS components, hardcoded colours, `mds-*` |
| `validate_render({html?, colors?, components?})` | verify the RENDERED page: static scan + pointer to the Playwright conformance checker (0–100) |
| `get_contract()` | the full AI operating contract (`AGENTS.md`) |

## Option B — the npm spec package

```bash
npm install @mtdt/observeops-ds-spec
```

Point your tool's rules file at the contract — in `.cursor/rules`, project `AGENTS.md`, or `CLAUDE.md`:

```text
Follow node_modules/@mtdt/observeops-ds-spec/AGENTS.md when building any ObserveOps UI.
```

Read order: `AGENTS.md` → `llms.txt` → `components/index.json` → registries → `recipes` / `layout` /
`tokens`. Or use the loader: `const ds = require('@mtdt/observeops-ds-spec')` →
`ds.getComponent('button')`, `ds.resolveToken('--primary')`, `ds.listRecipes()`.

## Option C — fetch over the web (no install)

```text
https://cdn.jsdelivr.net/npm/@mtdt/observeops-ds-spec/llms.txt
https://cdn.jsdelivr.net/npm/@mtdt/observeops-ds-spec/AGENTS.md
https://cdn.jsdelivr.net/npm/@mtdt/observeops-ds-spec/components/index.json
```

## Option D — pixel-exact styling (the look package)

For a standalone prototype, import the exact ObserveOps tokens so the output *looks* pixel-identical
(not an approximation), in any framework:

```bash
npm install @mtdt/observeops-ds-css
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mtdt/observeops-ds-css/dist/observeops-ds.css" />
```

Then use `var(--primary)` (navy), `var(--padding-md)`, `.tag-green`, etc. Browse them in the **Design
tokens** Storybook page. This is the *look* only — for the real components, prefer **Option F**.

## Option F — the real components (recommended for new UI)

Build with the **actual DS components** as framework-agnostic Web Components — usable in React, Vue, Svelte, or
plain HTML. The output *is* the DS component, not a reconstruction, so it looks and behaves like the product.
This is the preferred build target: **use these, don't reconstruct.**

```bash
npm install @mtdt/observeops-ds-elements @mtdt/observeops-ds-css
```

```js
import '@mtdt/observeops-ds-elements'                       // registers obs-button, obs-tag, … on import
import '@mtdt/observeops-ds-css/dist/observeops-ds.css'     // the DS tokens (light + dark)
```

```html
<obs-button variant="primary">Save</obs-button>
<obs-input type="search" placeholder="Search…"></obs-input>
<obs-tag variant="tag-green">Active</obs-tag>
<obs-severity severity="critical" display-text></obs-severity>
```

Every component's props/variants/states + **decision-grade usage** (which variant when) live in the spec
(`@mtdt/observeops-ds-spec`) and the MCP (`get_component`). Events deliver the value in `e.detail` as an array
— unwrap: `Array.isArray(e.detail) ? e.detail[0] : e.detail`. Then verify with **Option E**.

## Option E — verify your render (the conformance checker)

Don't just cite the right rules — check that what you *rendered* actually matches the DS. The spec package
ships a Playwright checker that scores any page 0–100 on **token / layout / philosophy / component** adherence
and lists violations (off-token colours with the nearest DS token, hardcoded spacing, blue-instead-of-navy,
`mds-*`, non-DS controls):

```bash
node node_modules/@mtdt/observeops-ds-spec/conformance/ds-conformance.mjs ./your-page.html
```

Run it as the **last step** of the build workflow (the `AGENTS.md` self-check). It's the render-time
counterpart to the MCP `validate_usage` static check — together they catch "chose right but rendered
approximately." See `conformance/README.md` in the package.

## The workflow an AI follows (the authoring loop)

The full method — for a whole page/flow, not just a snippet — is **`authoring-playbook.md`** (shipped in the
spec package; MCP resource `spec://playbook`; run it locally via the **`build-with-ds`** skill). In short:

1. **Read the rules + method** — `get_contract` / `AGENTS.md`, then `authoring-playbook.md`.
2. **Understand & plan** — restate the request; enumerate the screens/steps in the flow.
3. **Layout & placement** — `get_layout` (shell → screen regions → content layout / 12-col grid).
4. **Surface** — per screen choose page vs drawer vs modal vs panel vs popover (playbook §3):
   *edit-while-keeping-list* → drawer, *confirm/destructive* → modal, *complex deep-linkable* → full page.
5. **Select + justify** — `search_components` → `get_component`; choose the **variant/state** and state *why*
   (from `decisionFlow`/`usageRules`). Never invent or import outside the DS.
6. **Resolve every colour** — `resolve_token` / `get_theme`; exact values. Brand = navy `--primary` (not
   cyan/blue). Structural tokens are LESS `@vars` → `<style lang="less">` or Tailwind, never raw px.
7. **Build DS-only** — the real `obs-*` components (Option F). **STOP and ASK** on a `list_gaps` item
   (charts/topology); never substitute; record it in the declared-gaps manifest.
8. **Validate the render** — `validate_render` + the shipped `ds-conformance.mjs` (token/component/variant/
   philosophy/layout). Iterate to **≥ 90**; then finalize with a rationale summary + declared-gaps manifest.

## Honest scope

- **In the product repo**, "use the DS" yields **real components** (`FlotoPaginatedCrud`, `MStatusTag`,
  …) — genuine reuse.
- **Standalone prototypes** (HTML/React, outside the repo) are **pixel-exact on styling** when they
  import the look package (Option D), but are still **reconstructions** of components — the AI uses the
  real *values*, not the real *components* (those are welded to the app). Real component reuse anywhere
  is **Goal #4b** (Vue 3 Web Components) — in progress.
- **Known gaps:** charts / data-viz / widget tiles / topology graph are not catalogued yet — the AI
  asks rather than improvising.

## Pin a version for reproducibility

```bash
npm install @mtdt/observeops-ds-spec@<version>
claude mcp add observeops-ds -s user -- npx -y @mtdt/observeops-ds-mcp@<version>
```

## Links

- npm: <https://www.npmjs.com/package/@mtdt/observeops-ds-spec> · <https://www.npmjs.com/package/@mtdt/observeops-ds-mcp>
- Storybook (visual): <https://niravbhatt1317.github.io/motadata-design-system/>
