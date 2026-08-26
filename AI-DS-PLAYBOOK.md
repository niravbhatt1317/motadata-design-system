# AI-DS Playbook — the AI-Readable Design System

**The operating manual for the *machine-readable* half of the ObserveOps design system** — the layer
that lets AI tools (Cursor, Claude Code, Windsurf, …) read, understand, and follow the DS. The
Storybook is the *visual* half you can see; this doc is the part you can't see, made visible.

> **New session? Start here** if the task is about: the AI-readable / machine-readable / AI-consumable
> design system, the spec package, the MCP server, the operating contract, or adding/updating anything
> so AI tools pick it up. Then read [`PROGRESS.md`](./PROGRESS.md) for live status.

---

## 1. What this is & why it exists

A normal design system documents itself for **humans** (Storybook). But an AI tool building UI needs a
**machine-readable contract** — which components exist, their exact props/tokens, how to compose pages,
and rules it must follow — or it just guesses (wrong components, invented colours). The AI-DS is that
contract: a versioned, installable, queryable spec + a live server that serves it, so any AI tool
produces **product-faithful** ObserveOps UI instead of a generic lookalike.

---

## 2. The artifacts (what exists, where)

| Artifact | Where | What |
| --- | --- | --- |
| **Spec package** | npm `@mtdt/observeops-ds-spec` ← built from `design-system/` | the machine-readable spec as files + a JS loader |
| **MCP server** | npm `@mtdt/observeops-ds-mcp` ← `design-system/mcp/` | 9 live tools agents call |
| **Storybook** | `design-system/storybook/` → GitHub Pages | the visual catalogue (humans; AI does NOT scrape it) |
| **Operating contract** | `design-system/AGENTS.md` | the rules an AI must follow |
| **Discovery entry** | `design-system/llms.txt` | the llms.txt entry point |
| **This playbook** | `design-system/AI-DS-PLAYBOOK.md` | the process + decisions + backlog |
| **How-to-consume** | `design-system/USING-WITH-AI.md` | for *users* of the DS (install/connect) |
| **How-to-publish** | `design-system/PUBLISHING.md` | release runbook |
| **Status log** | `design-system/PROGRESS.md` | session-by-session history |

### Canonical sources (edit THESE; the package is generated from them)

```text
design-system/
├── components/
│   ├── index.json            ← the machine index (load FIRST); families, per-component has{}/counts
│   ├── registry/<id>.json     ← per-component spec: props/events/slots/apis/variants/states/do/dont/tokensUsed/a11y
│   ├── recipes/recipes.json   ← page templates + flows (region → component)
│   └── specs/<id>.md          ← prose spec
├── tokens/
│   ├── variables.json         ← LIVE runtime CSS --vars (light/dark) — the AI colour source of truth
│   ├── structural.json        ← LESS @vars (spacing/sizing/radius/type)
│   ├── kit-accents.json       ← @primary-color (cyan form-control accent)
│   ├── purpose-map.json       ← purpose → token (for styling NEW elements + tag tints)
│   └── primitive/semantic.*/component.json ← FUTURE DTCG (mds-*) — NOT wired, don't emit
├── layout/{grid,layouts}.json ← the 12-col grid + shells/regions/content-layouts/panels/templates
├── foundation/*.md            ← product coverage (which pages use each layout element)
├── AGENTS.md · llms.txt        ← contract + entry point
├── scripts/                    ← build-spec-package.js · validate-spec.js · publish-spec.sh
├── package/                    ← GENERATED npm package (don't hand-edit the copied spec files)
└── mcp/                        ← the MCP server (TypeScript)
```

---

## 3. The phases — what each was, and WHY it was needed

| Phase | What | Why it was needed | Status |
| --- | --- | --- | --- |
| **0 — AI access layer** | the operating contract (`AGENTS.md`), `llms.txt`, the test protocol | a spec is useless if the AI can't *discover* it or doesn't know the *rules*; without the contract an AI ignores the DS | ✅ done |
| **1 — npm spec package** | publish the spec as `@mtdt/observeops-ds-spec` | distribution + versioning — any tool, any machine, can `npm i` or fetch over the web, pinned to a version | ✅ done (0.1.2) |
| **2 — MCP server** | `@mtdt/observeops-ds-mcp`, 10 tools | makes the spec *active*: the agent fetches exactly what it needs, gets a hard **STOP-and-ASK** signal, and can **validate** its own output (incl. `validate_render` → the shipped conformance checker) — turns the rules from advisory into enforced | ✅ done (0.3.0) |
| **3 — distribution / docs** | `USING-WITH-AI.md` + Storybook guide | so anyone can onboard a tool in minutes | ✅ done |
| **4 — headless component library** *(future)* | an installable package of the real components | the only thing that turns "token-faithful *reconstruction* anywhere" into "real *component reuse* anywhere"; needs the Vue-3 rebuild | ⏳ to scope |

---

## 4. Repeatable runbooks — how to update the AI-DS

Every change to the DS follows the same shape: **edit the canonical source → validate → rebuild the
package → bump version → publish → (refresh the MCP)**. The specifics per task:

### A. Add a NEW component

> **Shortcut: run the `storybook-component` skill** (`.claude/skills/storybook-component/`) — it executes
> these steps end-to-end (sweep → harvest → decision-grade docs → all lockstep artifacts) and gates them with
> `gate.mjs`. The manual steps below are the reference it follows.

1. **Sweep it** — find every variant/state/usage (use the `component-sweep` skill, or grep the product).
2. **Write `components/registry/<id>.json`** following `registry/_schema.json`: `props` / `events` /
   `slots` / `apis`, `variants`, `sizes`, `states`, `decisionFlow`, `do` / `dont`, **`tokensUsed`**
   (clean `--`/`@` token names only — see Decision D2), `a11y`, `knownIssues`, `selectHint`.
3. **Write `components/specs/<id>.md`** (prose) if you want a human spec.
4. **Update `components/index.json`:** add the id to its **family**, add the component entry
   (`id`/`display`/`tier`/`family`/`summary`/`selectHint`/`variants`/`registry`/`spec`/`storybook`/
   `related`/`has{}`), and **bump `counts.components` + the relevant `counts.coverage.*`**.
5. **Add Storybook stories** under `storybook/atoms|molecules|organisms/` (+ usage/changelog MDX).
6. **Wire it into composition** if it belongs in a page: add to `recipes/recipes.json` and/or
   `layout/layouts.json`. If it's a *missing building block* the recipes reference (like charts), mark
   the region with a **`$gap`** instead.
7. **Validate + ship** (see §G).

### B. Update an EXISTING component

Edit its `registry/<id>.json` (+ `index.json` `has{}`/counts if capabilities changed) + Storybook
stories + its changelog MDX. Then validate + ship.

### C. Add / change TOKENS

Edit `tokens/variables.json` (CSS `--vars`, both light+dark) / `structural.json` (LESS `@vars`) /
`kit-accents.json`. For a styling *purpose* (incl. tag tints, surfaces, etc.) also add to
`purpose-map.json` so `resolve_token`/`get_theme` surface it. **Never** add to the `mds-*` DTCG files
for live use (Decision D1). Validate + ship.

### D. Add a recipe / flow / layout / foundation finding

Edit `components/recipes/recipes.json`, `layout/layouts.json`/`grid.json`, or `foundation/*.md`. Keep
recipe `use[].id`s pointing at catalogued components — or add a `$gap` if not yet catalogued. Ship.

### E. Change the CONTRACT / rules

Edit `AGENTS.md` (and `llms.txt` if the discovery summary changes). Consider also updating the MCP
priming prompt in `mcp/src/server.ts`. Ship the spec; if you touched the MCP, ship the MCP too (§F).

### F. Change the MCP SERVER (tools)

```bash
cd design-system/mcp
# edit src/spec.ts (data/logic) and/or src/server.ts (tools/prompt)
npm run build && npm run smoke && node test/http-smoke.mjs   # both transports must pass
# bump version in package.json, then:
npm publish
```

### G. Validate + ship the SPEC (the standard release)

```bash
cd design-system
# bump "version" in package/package.json (semver: patch=fix, minor=added, major=breaking)
bash scripts/publish-spec.sh        # build → validate (gate) → publish → prints npm + CDN URLs
```

`validate-spec.js` is the gate: every JSON parses, each index component has a registry, every
`tokensUsed` resolves, every recipe id is catalogued-or-`$gap`, manifest checksums match. **A broken
spec can't publish.**

### H. Make the MCP serve the new spec

The MCP depends on `@mtdt/observeops-ds-spec ^0.1.x`, so a new `npx` run picks up the latest. To force
it now: `npx clear-npx-cache`, then reconnect / new chat.

### I. Verify with a real agent (optional but recommended)

Connect a fresh tool (or follow `AI-TEST-PROTOCOL.md`) and have it build a screen. Check: real
components, navy brand (not blue), resolved token values, and that it **asks** on a gap.

### Deploy the Storybook (visual half)

```bash
bash design-system/scripts/deploy-gh-pages.sh niravbhatt1317/motadata-design-system   # Node 18
```

---

## 5. Decision log (so we don't re-litigate or forget)

- **D1 — two token layers.** `variables.json` + `structural.json` + `kit-accents.json` are the **live**
  runtime tokens — the AI's source of truth. `primitive/semantic.*/component.json` (`mds-*`) are a
  **future** portable DTCG layer, **not wired** — never emit `mds-*` for live output.
- **D2 — brand is NAVY.** `--primary` = `#111c2c` (light) / `#e3e8f2` (dark). The cyan `@primary-color`
  `#099dd9` is the **Ant form-control accent only** (radio/checkbox/select). Never use cyan/blue as the
  brand. (An early test invented blue `#4F6EF5` — exactly what we must prevent.)
- **D3 — compose vs ASK.** Recipes are **examples, not an allow-list**. An undocumented screen (signup,
  etc.) → **compose** it from catalogued parts, don't ask. ASK only when a **building block** is missing
  (a component/token/primitive not in the DS, e.g. charts). Over-asking and under-asking both fail.
- **D4 — resolve, don't invent.** `get_component` returns `resolvedTokens` (names + real values) and
  `get_theme` returns the whole palette, so an agent can't use a token name without seeing its value.
- **D5 — two artifacts.** Storybook = visual truth (gated, password `motadata`, AI must NOT scrape it);
  the spec package = machine truth. The MCP sits on top of the spec.
- **D6 — distribution.** Public npm under the **`@mtdt`** scope (since `@motadata` was taken). The MCP
  **depends on** the spec package (one source of truth). Built/published from the public
  `motadata-design-system` repo so product source stays private.
- **D7 — MCP shape.** TypeScript; **both** transports (stdio + streamable HTTP); read tools first, then
  `validate_usage`. The no-match result *is* the STOP-and-ASK signal.
- **D8 — real reuse only in-product.** Inside the product repo, "use the DS" → real components
  (`FlotoPaginatedCrud`, `MStatusTag`). Standalone prototypes (HTML/React) are **token-faithful
  reconstructions** — real values, not real components (they're welded to the app). Render-anywhere
  reuse needs Goal #4.

---

## 6. Backlog — deferred ideas & improvements (implement later)

- **Data-Viz / Charts family** *(gap #1, the recurring ASK)* — charts / widget tiles / topology graph
  aren't catalogued (only `data-viz-tooltips`). Recipes flag them with `$gap`. Add the family so agents
  stop having to ask. The `--chart-*` palette already exists in `variables.json`.
- **Per-component Storybook deep-links** — turn each component's `storybook` path into a full
  deep-link (needs the verified story ID, not a naive kebab). Low value for text agents; **high value
  for vision-capable / browser-MCP agents** that screenshot-and-compare, and for human review.
- **CI lint from `validate_usage`** — wire the same checks into CI to gate non-DS usage automatically.
- **Host the HTTP transport (2c) + auth** — only when a team needs a remote shared endpoint.
- **OIDC "Trusted Publisher"** — release the packages from CI on a tag, no local token/2FA.
- **Figma kit (Goal #3)** — a Figma component library bound to the semantic tokens (separate track).
- **Goal #4 — installable component library** — the big one (render-anywhere reuse). **Scoped** →
  [`strategy/goal-4-headless.md`](./strategy/goal-4-headless.md) (see §7).

---

## 7. Next phase plan

- **Phase 2 plan (done):** [`strategy/phase-2-mcp.md`](./strategy/phase-2-mcp.md).
- **Distribution model:** [`strategy/distribution.md`](./strategy/distribution.md).
- **Goal #4 — installable component library (SCOPED, approved 2026-06-20):**
  [`strategy/goal-4-headless.md`](./strategy/goal-4-headless.md). Rebuild only the ~26 components fresh
  on **Vue 3** as framework-agnostic **Web Components** (product stays Vue 2; one-by-one, AI-assisted) +
  a "look" CSS package now. The render-anywhere unlock. Phases A→D; not started — awaiting go-ahead to
  build Phase A.

---

## 8. The map (where everything lives)

- **Read to resume:** `PROGRESS.md` (status) · this playbook (process/decisions).
- **For AI consumers:** `USING-WITH-AI.md` · `AGENTS.md` · `llms.txt`.
- **To release:** `PUBLISHING.md` · `scripts/publish-spec.sh` · `mcp/` (`npm publish`).
- **Strategy/decisions:** `strategy/` · `decisions/` · `00-CONTEXT.md`.
- **Published:** `@mtdt/observeops-ds-spec` · `@mtdt/observeops-ds-mcp` (npm) · Storybook (GitHub Pages).
