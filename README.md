# Motadata ObserveOps — Design System Initiative

This folder is the **single home** for the Design System (DS) initiative for the
Motadata ObserveOps product. Anyone — a designer, an engineer, or a new Claude
session on any account — should be able to open this folder and understand
**what we are building, why, where we are, and what to do next.**

> **New contributor?** Start at [`CONTRIBUTING.md`](./CONTRIBUTING.md) (the onboarding door) — it, with
> [`CLAUDE.md`](./CLAUDE.md), orients you and your AI in ~15 minutes. For the charter: [`00-CONTEXT.md`](./00-CONTEXT.md).

## Contributor quick-start — paste this into your Claude

Been added as a collaborator? The fastest way to get set up is to **paste the prompt below into Claude Code**
(run it from an empty folder). It clones the repo, builds it, serves the showcase, runs the checks that gate
every PR, wires up the DS's live tools, and explains the workflow — stopping if anything fails.

```text
You're helping me get set up as a new contributor to the ObserveOps Design System — a published set of
framework-agnostic obs-* web components + design tokens + a machine-readable spec. Work step by step, and
STOP and tell me if any step fails instead of guessing or working around it.

1. Prereqs — confirm these exist: `node -v` (need Node 18+), `git --version`, `claude --version`.
   If Node is missing or below 18, stop and tell me to install it.

2. Clone the repo into the current folder and cd in (it's PUBLIC, so cloning needs no login):
   git clone https://github.com/niravbhatt1317/motadata-design-system.git
   cd motadata-design-system
   (To PUSH later I must already be an added collaborator and run `gh auth login` with my OWN GitHub
   account — remind me to do that; never do it for me.)

3. Read CLAUDE.md, CONTRIBUTING.md, and AGENTS.md. Then summarize for me, in a few lines each:
   (a) what this design system is, (b) the golden path to make a change, (c) the hard rules I must never
   break, (d) how I propose a change (branch -> PR). Note this repo has NO product source, so matching a
   component here is screenshot-driven (see CONTRIBUTING "Match from a reference").

4. Build the elements the product-free way — the full `npm run build` needs a product checkout we don't
   have, but the committed icons make a plain vite build enough:
   cd components-lib && npm install && npx vite build

5. Build + serve the showcase locally: `npm run site:dev`. Give me the local URL. A missing logo gallery
   or Assets>Icons page is EXPECTED without the product — everything else should render.

6. Run the two checks that gate every PR — both must report 0 errors (run from the repo root):
   node scripts/validate-registries.mjs
   node scripts/validate-spec.js

7. Add the design system's live tools to my Claude, then confirm it connected:
   claude mcp add observeops-ds -s user -- npx -y @mtdt/observeops-ds-mcp
   claude mcp list

8. Report a pass/fail checklist for steps 4-7, the local showcase URL, and this workflow reminder:
   I push a BRANCH and open a PR to `main`; it needs the `validate` CI green + a maintainer review to
   merge — I cannot merge to main directly.
```

## The 4 goals

1. **A documented design system** — published (Storybook or equivalent) and usable
   by designers, not just engineers.
2. **An AI-readable design system** — so any model (or any user driving a model)
   can produce designs/code that look and feel like the real product.
3. **A Figma component library** — so designers reuse the same components everywhere
   and Figma stays in sync with code.
4. **A headless design system** — a portable core that anyone can adopt, not welded
   to this one app.

## How this folder is organized

| Path | What's in it |
| --- | --- |
| [`00-CONTEXT.md`](./00-CONTEXT.md) | Project charter — vision, scope, constraints, the "why". Read first. |
| [`PROGRESS.md`](./PROGRESS.md) | Running log of status, decisions taken, and next actions. Update every session. |
| [`audit/`](./audit/) | The full as-is audit of the product's design layer (tokens, components, patterns, gaps). |
| [`strategy/`](./strategy/) | Approaches, proposed architecture, and the phased roadmap. |
| [`tokens/`](./tokens/) | The design-token source (DTCG JSON) — primitive/semantic/component slice. |
| [`components/`](./components/) | The component-library plan + full tiered inventory (→ Storybook → Figma). |
| [`findings/`](./findings/) | System-wide findings register (cross-cutting issues, e.g. SF-001 focus visibility). |
| [`decisions/`](./decisions/) | Decision log (ADR-style) for the big forks. |

## Audit quick links

- [`audit/01-design-tokens.md`](./audit/01-design-tokens.md) — colors, themes, type, spacing, the 3 parallel token systems.
- [`audit/02-component-libraries.md`](./audit/02-component-libraries.md) — the M kit, Floto layer, base components, Ant 1.x.
- [`audit/03-patterns-and-tooling.md`](./audit/03-patterns-and-tooling.md) — page patterns, layouts, icons, hygen, existing AI specs.
- [`audit/04-findings-and-gaps.md`](./audit/04-findings-and-gaps.md) — consolidated findings, risks, and what to fix first.
- [`audit/05-component-atomic-design.md`](./audit/05-component-atomic-design.md) — components mapped to atoms/molecules/organisms/templates/pages; structure & management; library scope.

## Strategy quick links

- [`strategy/approaches.md`](./strategy/approaches.md) — the layered architecture and how each goal is met.

## Status

**Shipping.** The DS is live and published: **55 components across 24 families**, real `obs-*` web components,
design tokens, a machine-readable spec, an MCP server, and a deployed showcase — all on public npm
(`@mtdt/observeops-ds-elements` · `-spec` · `-css` · `-mcp`). Work now is deepening component coverage
(organisms), page contracts, and AI-readiness. See [`PROGRESS.md`](./PROGRESS.md) for the running log and
[`CONTRIBUTING.md`](./CONTRIBUTING.md) to start contributing.
</content>
</invoke>
