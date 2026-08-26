# Motadata ObserveOps — Design System Initiative

This folder is the **single home** for the Design System (DS) initiative for the
Motadata ObserveOps product. Anyone — a designer, an engineer, or a new Claude
session on any account — should be able to open this folder and understand
**what we are building, why, where we are, and what to do next.**

> If you are a new session / new person: read [`00-CONTEXT.md`](./00-CONTEXT.md)
> first, then [`PROGRESS.md`](./PROGRESS.md) to see current status.

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

**Phase: 0 — Discovery & alignment.** As-is audit complete; aligning on approach.
See [`PROGRESS.md`](./PROGRESS.md).
</content>
</invoke>
