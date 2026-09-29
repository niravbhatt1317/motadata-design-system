# CLAUDE.md — you are working on the ObserveOps Design System

You are in the **ObserveOps Design System** (the DS), not the product app. This folder is a
self-contained, published design system extracted from Motadata ObserveOps: framework-agnostic
`obs-*` web components, design tokens, a machine-readable spec, an MCP server, and a showcase site.

**If you only read one thing, read this file, then [`CONTRIBUTING.md`](./CONTRIBUTING.md).**

## What this is (current state — verify against the repo, don't trust a number)

- **55 components across 24 families**, catalogued in [`components/index.json`](./components/index.json).
- **Published, public npm packages** (no auth to install):
  - `@mtdt/observeops-ds-elements` — the real `obs-*` web components (atoms + molecules shipped; most
    organisms are compose-from-atoms reproductions — coverage is honest in `AGENTS.md`).
  - `@mtdt/observeops-ds-spec` — the machine-readable spec (`components/`, `tokens/`, `llms.txt`).
  - `@mtdt/observeops-ds-css` — the exact tokens as one CSS file.
  - `@mtdt/observeops-ds-mcp` — a live MCP server (search/get/resolve/validate + STOP-and-ASK).
- A **showcase site** (`components-lib/site/`) built to `site/dist` and deployed to GitHub Pages.

## Read order (do this before editing anything)

1. **[`AGENTS.md`](./AGENTS.md)** — the AI operating contract (the hard rules; also how the spec loads).
2. **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** — how to contribute: golden paths, the guardrails, the checks.
3. **[`AI-DS-PLAYBOOK.md`](./AI-DS-PLAYBOOK.md)** — the add/update runbooks + the map of where everything lives.
4. The **`components/registry/<name>.json`** of whatever component you're touching — it is the source of truth
   for that component's props/variants/usage/a11y/tokens/changelog.

## Golden paths (task → what to do)

- **Update or add a component's docs/spec** → edit `components/registry/<name>.json` (+ `components/index.json`
  if variants/counts change) and its showcase manifest `components-lib/site/manifests/<name>.examples.mjs`.
  Keep them in sync. Then run the checks below.
- **Change a component's look/behavior** → edit `components-lib/src/elements/Obs<Name>.ce.vue`, rebuild
  (`cd components-lib && npm run build`), regenerate the site (`node site/generate.mjs`), verify.
- **Make a NEW component match the product exactly** → this needs the **monorepo + the `match-component`
  skill + the live product render** (render-first, diff-gated). It **cannot** be done from the standalone
  GitHub repo alone (no product source there). See `COMPONENT-CONVERSION-RUNBOOK.md`.
- **Page-level work (contracts/recipes)** → `components/page-contracts.json`, `components/recipes/recipes.json`;
  read `PRODUCT-PAGE-INVENTORY.md` first.
- **Tokens** → `tokens/` (DTCG JSON). Never hardcode a colour anywhere else.

## The checks — must be green before you publish or open a PR

```bash
node scripts/validate-registries.mjs   # registries schema-complete + decision-grade + counts consistent (0 errors)
node scripts/validate-spec.js          # spec package valid, every token resolves (0 errors)
```

Plus, before a deploy, `scripts/icon-reuse-preflight.mjs` runs (no hardcoded colours except as `var(--token,
fallback)`; icons reused from the library). The skills add their own gates (`diff.mjs`/`audit.mjs` for
`match-component`, `gate.mjs` for `storybook-component`).

## Hard guardrails — NON-NEGOTIABLE (these have each bitten us)

1. **Never run `npm version` in `design-system/`.** There is no `package.json` here, so it walks up and bumps
   the parent **product** repo. Bump `components-lib/package.json` and `package/package.json` by **editing** the
   version string, nothing else.
2. **Publish elements from a pre-built tarball** (`npm pack` then `npm publish <tgz>`) **from the `components-lib`
   dir** — the normal `npm publish` triggers a prepublish rebuild that hangs.
3. **Publish the spec only via `scripts/publish-spec.sh`** — it gates on both validators (0 errors) and builds
   from canonical sources. Never hand-edit `package/` (it is generated).
4. **Deploy only via `scripts/with-deploy-lock.sh <github-repo>`** — it gates on the icon-reuse preflight and
   serializes deploys. **GitHub Pages allows ~10 builds/hour** — batch changes and deploy once, or you wedge the
   Pages build (404s).
5. **Never hardcode a colour** (hex/rgb/hsl) in a component — use a DS token; a raw value is allowed **only** as
   a `var(--token, <fallback>)` fallback.
6. **Dark-theme token traps:** `--primary` is an INK token that FLIPS light↔dark (great for text, **never** a
   background). `--neutral-dark/darker/darkest` are near-black in BOTH themes (fine for bg/border, **never**
   text). Test both themes.
7. **Ship canonical product DATA, not just schema** — data-driven elements (menus, sidebars) carry the REAL
   product dataset, extracted + verified from source, not a placeholder.
8. **`defineCustomElement` emit footgun:** an emitted event's `detail` is the **args ARRAY**
   (`e.detail = [val]`). Consumers must unwrap: `Array.isArray(e.detail) ? e.detail[0] : e.detail`.
9. **A consuming host must not re-add chrome a component already owns** (e.g. `obs-side-menu` draws its own
   right border + padding + scroll fade — a host that adds a border/padding double-divides).
10. **Clear the bundler cache when verifying** (`rm -rf node_modules/.vite --force`) or a shipped fix can look
    still-broken.

## Where things live (the map)

| Path | What |
| --- | --- |
| `components/index.json` | entry point — every component, counts, pointers |
| `components/registry/<name>.json` | per-component machine spec (source of truth) |
| `components/page-contracts.json` | page-level structure contracts (dashboard/list/settings/form) |
| `components-lib/src/elements/Obs*.ce.vue` | the real `obs-*` web components (Vue 3.5 `defineCustomElement`) |
| `components-lib/site/manifests/*.examples.mjs` | the showcase playground/gallery per component |
| `components-lib/site/generate.mjs` | builds the showcase → `site/dist` |
| `tokens/` | the DTCG token source |
| `mcp/` | the MCP server |
| `scripts/` | the validators, publish, deploy |

When in doubt: read the registry + the runbook, run the validators, and **STOP-and-ASK** rather than guess —
the whole point of this DS is that output is built from it, never invented.
