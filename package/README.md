# @mtdt/observeops-ds-spec

The **machine-readable spec + AI operating contract** for the Motadata ObserveOps design system.
Install it so any AI tool (Cursor, Claude Code, Windsurf, Copilot, Cline, …) can build ObserveOps UI
from the real components, tokens, recipes and layout — instead of guessing.

This package is the **machine-readable truth**. The companion **Storybook** is the **visual truth**
(see the catalogue link below) — use it to *match* the look; get all specs from the files here.

## Install

```bash
npm install @mtdt/observeops-ds-spec
```

## For an AI tool — read in this order

1. [`AGENTS.md`](./AGENTS.md) — the **operating contract** (read first): use only catalogued
   components, resolve every colour to a token, compose pages from recipes/layout, and STOP-and-ASK
   before using anything not in this DS.
2. [`llms.txt`](./llms.txt) — discovery entry point (links every part of the spec).
3. `components/index.json` — the machine index (all components, families, token pointers).
4. `components/registry/<id>.json` — per-component props/events/slots/apis, variants, tokens, a11y.
5. `components/recipes/recipes.json` — page templates + flows (how to compose whole screens).
6. `layout/` + `tokens/` + `foundation/` — structure, the token crosswalk, and product coverage.

Point your tool's rules file at the contract, e.g. in `.cursor/rules` or your project `AGENTS.md`:

```text
Follow node_modules/@mtdt/observeops-ds-spec/AGENTS.md when building any ObserveOps UI.
```

## For code — the thin loader

```js
const ds = require('@mtdt/observeops-ds-spec')

ds.version                       // spec version
ds.index                         // components/index.json (parsed)
ds.getComponent('button')        // index entry + full registry spec
ds.resolveToken('--primary')     // { light: '#111c2c', dark: '#e3e8f2', ... }
ds.resolveToken('@btn-radius')   // '4px'
ds.listRecipes()                 // [{ id, name, whenToUse }, ...]
ds.specPath('llms.txt')          // absolute path, for tools that read raw files
```

Deep imports work too: `require('@mtdt/observeops-ds-spec/components/registry/drawer.json')`.

## What's inside

- `components/` — `index.json`, `registry/` (26 components), `recipes/recipes.json`, `specs/` (prose).
- `tokens/` — the **live** layer (`variables.json` 336 themed CSS vars, `structural.json` LESS vars,
  `kit-accents.json`, `purpose-map.json`) **+** a **future/portable** DTCG layer
  (`primitive` / `semantic.*` / `component.json`, `mds-*`) flagged `$status: future` — **do not emit
  `mds-*` for live output**; use the runtime `--vars`.
- `layout/` — `grid.json` (12-col MRow/MCol) + `layouts.json` (shells, regions, content layouts, panels).
- `foundation/` — page-by-page product coverage per layout element.
- `spec.manifest.json` — file list + sizes + checksums.

## Known gaps (the AI will STOP-and-ASK here)

Charts / data-viz / widget tiles / topology graph are **not** catalogued yet (only the chart
*tooltips* are). Recipes flag these with a `$gap` marker.

## Live visual catalogue

Storybook: <https://niravbhatt1317.github.io/motadata-design-system/> — the pixel-accurate visual
reference. It is **not** a data source; do not scrape it. The specs in this package are authoritative.

## Versioning

Semver. Minor = added components/recipes/tokens · patch = fixes/clarifications · major = breaking
spec-shape change. Pin a version to keep AI output reproducible.

## Maintaining

This package is generated from the design-system sources — it is not hand-maintained file-by-file.
Maintainers: see `PUBLISHING.md` in the design-system workspace for the build → validate → publish
flow (bump version → `scripts/build-spec-package.js` → `scripts/validate-spec.js` → `npm publish`).
