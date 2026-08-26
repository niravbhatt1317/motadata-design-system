# Project Context & Charter

> Read this first. It is written so that **any** new contributor — a designer, an
> engineer, or a fresh Claude session on a different account — can pick up the work
> with full context.

## Who & what

- **Product:** Motadata ObserveOps — a large Vue 2 enterprise NMS / AIOps
  observability platform (network, server, app, log, flow, traffic monitoring).
  The UI app lives in this repo (`/UI`).
- **Initiative owner (human):** VP of Design / Product Designer (the user).
- **AI counterpart:** acting as "VP of Design" collaborator — drives audits,
  proposes architecture, produces docs and machine-readable specs, and executes
  build work when directed.
- **Started:** 2026-06-02.

## Why we are doing this

The product has a real, mature design layer (≈322 themed design tokens across
light/dark, a 42-component internal `@motadata/ui` kit, a `Floto*` wrapper layer,
and strong written conventions). But it is **not a design system yet**:

- There is **no published documentation / Storybook** for designers.
- The design knowledge is scattered across LESS files, `.claude/rules/`, and a
  `figma-to-code` skill — not a single source of truth.
- There is **no Figma component library** synced to code.
- Tokens live in **three parallel systems** (CSS custom properties, LESS `@vars`,
  Tailwind config) that have already **drifted** (e.g. `--primary` is `#111c2c`
  in code but documented as `#099dd9`).
- Nothing is **headless / portable** — the kit is welded to Vue 2 + Ant Design
  Vue 1.x (both effectively end-of-life).

## The 4 goals (success definition)

1. **Documented DS** — a living, published catalog (Storybook or equivalent) that
   designers and engineers both use.
2. **AI-readable DS** — machine-readable token + component + pattern specs so any
   LLM can generate product-faithful designs/code.
3. **Figma component library** — components + Figma variables, kept in sync with
   the token source of truth.
4. **Headless DS** — a portable core (at minimum, framework-agnostic tokens; at
   most, framework-agnostic primitives) that other apps/teams can adopt.

## Hard constraints & realities (do not ignore)

- **Stack lock:** Vue 2.6.12, Vuex 3, Vue Router 3, Ant Design Vue **1.4** (no Vue 3
  path), LESS, restricted Tailwind 1.x, Webpack 5 via Vue CLI 5.
- **Vue 3 migration is planned** (not started). All new code must be Vue-3-safe
  (no `Vue.set`/`$set`). The DS work should *accelerate*, not block, that migration.
- **The kit is not headless** — every M component re-exports an Ant 1.x component +
  LESS overrides. True "headless" cannot be retrofitted onto these; it must be a
  new layer (likely tied to the Vue 3 migration).
- **Tokens are the most portable asset we have** — they are the natural foundation
  for goals 2, 3, and 4 simultaneously.
- **Conventions are already written down** in `/.claude/rules/` and
  `/.claude/skills/figma-to-code/references/` — reuse them, don't reinvent. But
  verify before trusting: some are already out of date (see the `--primary` drift).

## Guardrails for execution

- This is a **long-running, multi-session** initiative. Persist everything here;
  update [`PROGRESS.md`](./PROGRESS.md) at the end of each working session.
- **Audit claims are "reported, verify before acting."** The as-is audit in
  `audit/` was assembled partly via automated exploration; treat specific hex
  values, counts, and prop lists as leads to confirm against source, not gospel.
- **Do not refactor product code** as part of documentation work unless explicitly
  asked. Documenting the as-is comes first; consolidation is a later, approved phase.
- Follow the repo's own rules (`/.claude/rules/`, `CLAUDE.md`) for any code or
  markdown produced — markdownlint, no hardcoded colors, etc.

## Source-of-truth pointers (the real artifacts)

| Concern | Where it lives today |
| --- | --- |
| Design tokens (themes) | `src/design/variable.less` (`:root` + `[data-theme='dark-theme']`) |
| Structural LESS vars | `src/design/index.less` |
| Tailwind utilities/colors | `tailwind.config.js` |
| Internal UI kit (`@motadata/ui`) | `ui/` (symlinked; `ui/components`, `ui/style`, `ui/services`) |
| Project component layer | `src/components/` (`_base-*.vue` globals + `Floto*` + `crud/`, `data-picker/`) |
| Layouts / app chrome | `src/views/layouts/` |
| Written conventions | `.claude/rules/*.md`, `CLAUDE.md` |
| Existing AI/Figma spec | `.claude/skills/figma-to-code/references/*.md` |
| Scaffolding templates | `_templates/new/` (hygen) |
| Dependency graph | `graphify-out/` |
</content>
