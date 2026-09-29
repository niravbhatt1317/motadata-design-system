# Contributing to the ObserveOps Design System

Welcome. This is the **one door** for a new contributor (and the Claude they'll use). In ~15 minutes you'll
understand what the DS is, how it's organized, how to make a change, and how to prove it's correct.

> **New here? Read in this order:** this file → [`CLAUDE.md`](./CLAUDE.md) (orients your AI) →
> [`AGENTS.md`](./AGENTS.md) (the rules) → [`AI-DS-PLAYBOOK.md`](./AI-DS-PLAYBOOK.md) (add/update runbooks).
> Then open the `components/registry/<name>.json` of whatever you're changing.

## What the DS is (today)

A **published, framework-agnostic design system** extracted from Motadata ObserveOps:
**55 components / 24 families**, real `obs-*` web components, design tokens, a machine-readable spec, a live
MCP server, and a showcase site. It is **not** a plan or an audit — it ships:

| Package (public npm) | What |
| --- | --- |
| `@mtdt/observeops-ds-elements` | the real `obs-*` web components |
| `@mtdt/observeops-ds-spec` | the machine-readable spec (files + `llms.txt`) |
| `@mtdt/observeops-ds-css` | the tokens as one CSS file |
| `@mtdt/observeops-ds-mcp` | a live MCP server for AI tools |

## The doc map — consume vs contribute

**If you're CONSUMING the DS (building product UI with it):**
`AGENTS.md` (contract) · `USING-WITH-AI.md` (wire up MCP/spec/css) · `authoring-playbook.md` (build a page/flow) ·
the showcase site + `component-catalog.html`.

**If you're CONTRIBUTING to the DS (this repo):**
this file · `CLAUDE.md` · `AI-DS-PLAYBOOK.md` (add/update) · `COMPONENT-CONVERSION-RUNBOOK.md` (port a product
component) · `PUBLISHING.md` (release) · the per-component `components/registry/<name>.json`.

## Two working contexts — know which you're in

| | **This GitHub repo** (standalone) | **The source monorepo** (maintainers) |
| --- | --- | --- |
| You can | edit registries · manifests · docs · `components-lib` source · run validators · regenerate + deploy the showcase | everything, **plus** re-derive a component from the live product render via the `match-component` / `storybook-component` skills |
| You can't | re-derive from the real product (no product source or skills here) | — |

So from **this repo** you can improve docs, fix/adjust an existing component's look/behavior, tune a registry or
manifest, and ship the showcase. Making a **brand-new** component pixel-match the product is a maintainer task
in the monorepo (it's render-first + diff-gated against the real Storybook).

## Get set up

```bash
git clone https://github.com/niravbhatt1317/motadata-design-system   # branch: main
cd motadata-design-system/components-lib
npm install
npm run build                 # builds the obs-* elements
node site/generate.mjs        # builds the showcase → site/dist
# serve site/dist on any static server to view it locally
```

## Golden paths (task → steps → checks)

### A. Update a component's docs / usage / props / accessibility / changelog

1. Edit `components/registry/<name>.json` — the **source of truth** (props, variants, `decisionFlow`,
   `usageRules`, `a11y`, `knownIssues`, `tokensUsed`, and **append a dated `changelog` entry**).
2. Mirror any variant/prop change into the showcase manifest `components-lib/site/manifests/<name>.examples.mjs`
   (playground controls + gallery), and into `components/index.json` if variants/counts changed.
3. Run the checks (below) → regenerate the site → verify → publish the spec.

### B. Change a component's look or behavior

1. Edit `components-lib/src/elements/Obs<Name>.ce.vue`.
2. `cd components-lib && npm run build && node site/generate.mjs`.
3. **Verify in a browser** (both light and dark themes) — clear the cache first (`rm -rf node_modules/.vite`).
4. Append a `changelog` entry to the registry. Run the checks. Bump + publish elements (see `PUBLISHING.md`).

### C. Page-level structure (contracts / recipes)

Read `PRODUCT-PAGE-INVENTORY.md` first, then edit `components/page-contracts.json` /
`components/recipes/recipes.json`. These encode how whole pages are built so AI tools match the product.

### D. Tokens

Edit `tokens/` (DTCG JSON). Every token needs a light **and** dark value. Never hardcode a colour elsewhere.

### E. Match / adjust a component to a reference (screenshot-driven)

The product code is **not** on this repo, so you match against a **reference image** (a screenshot a maintainer
gives you, or the deployed product) — not the live product render. This is the practical loop for polishing an
existing component here; a brand-new pixel-exact port is a maintainer task in the monorepo (the diff-gated
`match-component` skill needs the product source + Storybook).

The loop:

1. **Get the reference** — a product screenshot at a known width. Note the concrete facts you can see (row
   height, font size, spacing, which element is emphasised, the active/hover treatment).
2. **Match to DS tokens, never hardcode** — read the component's existing CSS + `tokens/` and reuse the right
   token (`--border-color`, `--left-menu-hover-bg`, …). A raw value is allowed only as a `var(--token, fallback)`.
3. **Edit → build → regenerate:** `Obs<Name>.ce.vue` → `cd components-lib && npm run build && node site/generate.mjs`.
4. **Verify with Playwright, don't eyeball:** screenshot your `obs-*` render at the reference width **and** read
   real numbers with `getComputedStyle` / `getBoundingClientRect` (sizes, padding, colours, alignment). Compare
   side-by-side to the reference and iterate until the numbers line up. Check **light and dark**.
5. Append a `changelog` entry describing what you matched and how you verified it (attach the comparison shots in
   the PR). If you can only approximate because a value isn't derivable from the image, say so — don't invent it.

> Why this discipline: measuring beats eyeballing. In practice an eyeballed pass over-sized a menu 2×; reading the
> product's real values (in the monorepo) or a maintainer's exact numbers is what fixed it. On this repo, measure
> your render against the reference and match to tokens.

## The checks — all green before you open a PR

```bash
node scripts/validate-registries.mjs   # 0 errors — schema-complete, decision-grade, counts consistent
node scripts/validate-spec.js          # 0 errors — spec valid, every token resolves
cd components-lib && npm run build      # elements build clean
node site/generate.mjs                 # showcase regenerates clean
```

- [ ] Registry updated **and** a dated `changelog` entry appended.
- [ ] Showcase manifest + `index.json` in sync with the registry (variants/counts).
- [ ] Both validators are 0-errors.
- [ ] Verified in a browser, **light and dark**.
- [ ] No hardcoded colours (tokens only; raw only as a `var(--token, fallback)`).
- [ ] Followed every **Non-negotiable** below.

## Non-negotiables (each of these has bitten us — do not relearn them)

1. **Never `npm version` in `design-system/`** — no `package.json` here, so it bumps the parent product repo.
   Edit `components-lib/package.json` / `package/package.json` version strings by hand.
2. **Publish elements from a pre-built tarball**, from the `components-lib` dir (plain `npm publish` hangs on a
   prepublish rebuild). **Publish the spec only via `scripts/publish-spec.sh`.** Never hand-edit `package/`.
3. **Deploy only via `scripts/with-deploy-lock.sh <repo>`** — it gates on the icon-reuse preflight and
   serializes. **GitHub Pages ~10 builds/hour** — batch and deploy once, or you wedge the build (404s).
4. **Colours are tokens** — never a hardcoded hex/rgb/hsl; raw allowed only as a `var(--token, fallback)`.
5. **Dark theme:** `--primary` FLIPS (ink — text yes, background no); `--neutral-dark/darker/darkest` are
   near-black in both themes (bg/border yes, text no). Always test both themes.
6. **Ship canonical product DATA, not schema** — real datasets, extracted + verified from the product source.
7. **`defineCustomElement` events carry an args ARRAY in `.detail`** — consumers unwrap
   `Array.isArray(e.detail) ? e.detail[0] : e.detail`.
8. **Don't re-add chrome a component owns** (borders/padding/fades) from the host — you'll double it.
9. **Prefer the real shipped component over reconstructing from CSS.** STOP-and-ASK when the DS has no answer,
   rather than inventing one.

## Proposing a change

Open a PR against `main`. Keep the changelog honest. If your change is a component match/fidelity claim, say how
you verified it (screenshots, or the diff/gate output if you ran the skills in the monorepo). When something the
DS should cover is missing, file it as a declared gap rather than guessing a look-alike.
