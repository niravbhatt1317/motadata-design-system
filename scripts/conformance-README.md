# DS conformance checker

Verify that a page you built with the ObserveOps design system actually **renders** like the DS — not just that
you cited the right rules. It renders the page and scores it 0–100 across these dimensions, with a violations list:

- **Token adherence** — every rendered colour maps to a DS token (`tokens/variables.json`). Off-token colours are
  reported with the nearest DS token, so `#4F6EF5`-instead-of-navy is caught.
- **Layout adherence** — paddings / radii land on the DS structural scale (`tokens/structural.json`).
- **Philosophy** — brand = `--primary` navy (not blue/cyan), no future `mds-*` tokens, theme-aware (surfaces flip
  light↔dark).
- **Component fidelity** — every interactive control is a real DS component (`obs-*`), not a raw
  `<button>/<input>/<a>` or a fabricated `<span>` chip. Each instance's **variant name** is validated against the
  registry (`variantEnum`/`severityEnum`), and — when a `variant-refs.json` reference library is present — the
  instance's **rendered style** is compared to its variant's reference, so a valid-named-but-CSS-overridden
  variant (a "primary" button rendered grey) is caught.

## STOP-and-ASK enforcement (declared gaps)

Any non-DS / fabricated element, or a **gap-archetype** the DS lacks (a chart / topology / widget-tile `<canvas>`
or `<svg>`), is a **hard contract breach** unless the build *declared* it — i.e. it STOP-and-ASK'd and got
approval. Pass the declared-gaps manifest so approved deviations don't fail the build:

```bash
node conformance/ds-conformance.mjs ./page.html --declared gaps.json   # gaps.json: ["chart","topology"]
node conformance/ds-conformance.mjs ./page.html --declare chart,topology
```

An undeclared non-DS element prints `⛔ CONTRACT BREACH` and fails (exit 1) regardless of the numeric score. A
declared one is downgraded to an allowed advisory. This turns the honour-system "ask before you substitute" rule
into a deterministic gate.

## Run it

```bash
# from a tool that has Playwright installed (npm i -D playwright-core, or use `playwright`)
node conformance/ds-conformance.mjs ./your-page.html                     # or a URL
node conformance/ds-conformance.mjs ./your-page.html --declared gaps.json
node conformance/ds-conformance.mjs ./your-page.html --json out.json --quiet
```

Exit code `0` when the overall score ≥ 80 **and** there is no contract breach, else `1`. Reads the token/scale
sets + the variant reference library from the sibling `conformance/` and `tokens/` directories shipped in this
package. This is the render-time counterpart to the MCP `validate_usage` / `validate_render` static checks — run
it as the last step of the AI build workflow (`AGENTS.md` self-check).

## The variant reference library (`variant-refs.json`)

Ships alongside the checker. It holds the real rendered style signature of every `obs-*` component × variant
(captured from the actual components). The variant style-match uses it; if it's absent, the checker still runs
(name-validation only). Maintainers regenerate it with `node scripts/build-variant-refs.mjs` whenever the
components' look changes.
