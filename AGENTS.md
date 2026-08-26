# ObserveOps Design System — AI Operating Contract

**Read this first.** Any AI tool building UI for Motadata ObserveOps (pages, layouts, flows,
prototypes, components) MUST follow this contract. It points you at the machine-readable spec and sets
the rules. The goal: output that looks and behaves like ObserveOps, built **only** from this design
system — never guessed.

## Install first — these packages are PUBLIC on npm (no auth, just `npm install`)

The real components, tokens, and spec are **published, installable** packages. **Install them before building** —
do NOT reconstruct components from CSS classes when a real one is shipped (reconstruction is a fallback only):

```bash
npm install @mtdt/observeops-ds-elements @mtdt/observeops-ds-css @mtdt/observeops-ds-spec
```

```js
import '@mtdt/observeops-ds-elements'                    // registers the real <obs-button>, <obs-tag>, … web components
import '@mtdt/observeops-ds-css/dist/observeops-ds.css'  // the DS tokens (light + dark)
```

**Coverage is honest:** `@mtdt/observeops-ds-elements` ships the **atoms + molecules** as real `obs-*` web
components (button, input, select, switch, checkbox, radio, link, tag, severity, tags, tooltip, date-time-picker,
filters, selected-pills). **Organisms are not shipped yet** (table, drawer, modal, menu, toolbars/page-header,
pagination, bulk-action-bar) — for those, compose from atoms + tokens + layout and declare each as a reproduction
(see "Compose by default" + the declared-gaps manifest). The MCP `get_setup` tool returns this install + import
snippet on demand.

## How to load the spec (read order)

1. **`components/index.json`** — the entry point. Lists every component (family, `selectHint`,
   `summary`, `variants`), the token pointers, `recipes`, and `layout`. Start here.
2. **`components/registry/<name>.json`** — the machine spec for a component: `props` / `events` /
   `slots` / `apis`, `decisionFlow`, `variants`, `sizes`, `states`, `do` / `dont`, `tokensUsed`,
   `a11y`, `knownIssues`.
3. **Tokens** — `tokens/variables.json` (runtime `--vars`, light/dark) + `tokens/structural.json`
   (LESS `@vars`: spacing/sizing/radius/type) + `tokens/kit-accents.json` (`@primary-color`).
   For a NEW element, use **`tokens/purpose-map.json`** (purpose → token).
4. **Composition** — `components/recipes/recipes.json` (7 page templates + 5 flows, region →
   component) and `layout/layouts.json` (shells, screen regions, content layouts, panel behaviours) +
   `layout/grid.json` (the 12-col grid).
5. **Product coverage** — `foundation/*.md` (which product pages/flows use each layout element) when
   you need real-world grounding.
6. **How to build a whole page/flow** — **`authoring-playbook.md`** (this package). The end-to-end method:
   understand → plan screens → layout & placement → choose the **surface** (page vs drawer vs modal vs panel vs
   popover) → select each component + variant **with a written reason** → build with the real `obs-*` components
   → validate the render → fix to ≥ 90 → finalize. Read it before authoring anything larger than one component.

## Hard rules (MUST)

1. **Components:** use only catalogued components (`index.json`). Pick with `selectHint` /
   `decisionFlow`. Do not invent a component or pull one from another library. **Build with the REAL
   components** — the framework-agnostic Web Components `@mtdt/observeops-ds-elements` (`<obs-button
   variant="primary">`, works in React/Vue/HTML); reconstructing from CSS classes is a fallback only.
2. **Configuration:** configure only with the documented `props` / `events` / `slots` / `apis` in the
   registry. Do not invent prop names.
3. **Colour & spacing:** resolve every colour/space from tokens — `variables.json` /
   `purpose-map.json` / `structural.json`. **Never hardcode a hex, rgb, rgba, or hsl.** Brand / primary
   action = `--primary` (navy, NOT cyan). The cyan `@primary-color` (#099dd9) is the Ant form-control
   accent only (radio dot, checkbox check, select).
4. **Token system:** emit only runtime `--vars` (from `variables.json` / `structural.json` /
   `kit-accents.json`). **Do NOT emit `mds-*` tokens** — that layer is future/portable and not wired to
   the running product.
5. **Composition:** build pages from `recipes` (templates + flows) and `layout` (pick the right shell,
   screen regions, content layout, panel behaviour). Forms use the 12-col `MRow`/`MCol` grid (6 = half,
   12 = full, gutter 16). Recipes are **examples**, not an allow-list — if no recipe matches, compose
   the screen from catalogued components + tokens + layout (see "Compose by default" below).
   **Surface:** for each screen deliberately choose page vs drawer vs modal vs panel vs popover
   (`authoring-playbook.md` §3) — *edit-while-keeping-the-list* → drawer, *confirm/destructive* → modal,
   *complex deep-linkable record* → full page/route. Don't default everything to a modal.
6. **Variant with a reason:** pick the variant/state from the registry's `decisionFlow`/`usageRules` and state
   *why this, not the alternative* (one primary action per view; `error`/`danger` only for destructive).
7. **Theme:** never branch on light/dark — every token is already theme-aware.
8. **Accessibility:** honour each component's `a11y` field (keyboard, naming/aria, the known gaps).

## Compose by default — ASK only for a missing building block

The DS gives you **building blocks** (components in `index.json`, tokens, layout primitives) and
**example recipes** (common compositions). Recipes are EXAMPLES, not an allow-list of permitted
screens. Two very different situations — don't confuse them:

**1. A screen/flow with no matching recipe → just BUILD it (compose).**
Signup, change-password, a custom settings page, a new wizard, any page we never documented — build
it by composing catalogued components + tokens + layout. A missing recipe is **not** a reason to
stop; composing existing parts into new screens is exactly what the DS is for, and is always allowed.
You may briefly note your assumptions for transparency ("no documented recipe for signup; composed
from LoginLayout + input + form-item + button + checkbox + link"), then build. Do not ask permission
to compose.

**2. You'd need a building block that ISN'T in the DS → STOP and ASK.**
Only when building would force you to use something **not catalogued** — a component archetype absent
from `index.json` (e.g. a chart/graph/topology canvas), a colour/token outside the palette
(`variables.json` / `purpose-map.json`), or any primitive the DS lacks. Then **do not substitute,
invent, or import from another library.** Ask first, stating:

1. what you are building,
2. the missing building block you needed,
3. what you checked in the DS (which `index.json` families / `decisionFlow` / `purpose-map`),
4. why no catalogued block covers it,
5. the external thing you propose to use instead.

Then wait for approval. **The line:** never pick a component or colour from OUTSIDE the DS without
asking — but never ask permission to combine parts already INSIDE it. Silent use of a non-DS building
block is the contract violation; composing DS parts into an undocumented screen is not.

## Known gaps — engine-backed families (catalogued as a GUIDE, not an obs-*)

- **Charts / data-viz / stat tiles / topology graph / dashboard widget-grid** — these are now catalogued as
  the **`data-viz` GUIDE family** (`registry/data-viz.json`), because they are rendered by the product's
  engines (Highcharts v10 — *commercially licensed*; Cytoscape; vue-grid-layout), not by framework-agnostic
  components. There is intentionally **no `obs-*`** for them. When a task needs one:
  1. pick the **type** via the `data-viz` `decisionFlow` (line/bar/donut/gauge/heatmap/sparkline/topn/heat…,
     topology-graph, widget-grid),
  2. colour series from **`tokens/chart-palette.json`** (categorical — never `--primary`); status/threshold →
     severity tokens,
  3. **render it with the PRODUCT'S component** — Chart (`src/components/chart`), Graph
     (`src/components/monitor-graph`), Widgets (`src/components/widgets`) — reuse, don't re-engine.
  - **Standalone (outside the product repo)** → the DS ships no chart/graph component and Highcharts is
    licensed → **STOP and ASK**. Recipe regions still carry a **`$gap`** (and `recipes.json` → `$knownGaps`)
    to mark this app-coupled boundary — but the `$gap` now points you at `data-viz` for the type + palette.
- **Figma library** — not built. Figma-native generation isn't supported yet.

## Output rules

- Real component usage: `@motadata/ui` (`M*`), Floto wrappers (`Floto*`), Ant Design Vue 1.x (`a-*`),
  `_base-*` globals — Vue 2.6.
- Colours via `var(--token)` (CSS custom properties — they work in any CSS block). Layout via
  `MRow`/`MCol`; forms via `FlotoForm` / `FlotoFormItem`.
- **Structural tokens (spacing / sizing / radius / type) are LESS `@vars`, NOT CSS vars** — they only
  resolve in a `<style lang="less" scoped>` block (`@padding-md`, `@btn-radius`, `@text-sm`, …) or via
  Tailwind utilities (`p-4`, `gap-2`, `text-sm`). **Do NOT hardcode `px`/`rem` in a plain `<style>`
  block** (and don't just put the token in a comment) — use `lang="less"` + the `@var`, or a Tailwind
  class.
- **Cite your sources:** for each part, name the DS component / recipe / token you used (e.g.
  "list-view recipe · Organisms/Table · `--page-text-color`").
- **Storybook is the VISUAL reference, not a data source:** the live catalogue (URL in `llms.txt`)
  shows the pixel-accurate look to match and is for human/visual verification — but take ALL specs from
  these JSON/MD files. Do NOT scrape the Storybook site for props/tokens (it's a gated JS app; the
  structured spec here is the source of truth).

## Self-check before you finish

- [ ] Every component is from `index.json` (none invented / from another library).
- [ ] Every colour/space is a token — zero hardcoded hex/rgba.
- [ ] No `mds-*` tokens emitted.
- [ ] The page is composed from a recipe + the right layout shell/regions.
- [ ] a11y honoured (labels, keyboard, aria).
- [ ] Any deviation was **asked** and put on the **declared-gaps manifest** — undeclared non-DS elements are a
  hard contract breach (`ds-conformance` `⛔ CONTRACT BREACH`), not just a score deduction.
- [ ] **Verified the RENDER**, not just the rules — run the conformance checker
  (`conformance/ds-conformance.mjs <page> [--declared gaps.json]` in the spec package, or the MCP
  `validate_render`); fix every off-token colour (brand must be navy, not blue/cyan), off-scale spacing, `mds-*`,
  raw control / fabricated chip, invalid variant name, and any **off-reference variant** (a valid name rendered
  with the wrong look). Aim for ≥ 90 **and** zero breaches.
- [ ] For a whole page/flow: finalized per `authoring-playbook.md` — a **rationale summary** (shell + surface +
  why per screen; component + variant + reason per element) and the declared-gaps manifest; the
  which-variant-when judge passed (no semantically wrong variant/surface choice).
