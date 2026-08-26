# Component Conversion Runbook — product component → Vue 3 Web Component

The single, repeatable process for turning a catalogued ObserveOps component into a framework-agnostic
Web Component (`@mtdt/observeops-ds-elements`). Output of each conversion = a Vue 3 SFC compiled via
`defineCustomElement` (so it is **both** Vue 3 source and a custom element usable in any framework), plus a
**Coverage Ledger** at zero open rows.

> Why this exists: components kept shipping "done" with whole variants, classes, behaviours, and style
> properties missing — caught only when the owner pointed at them. This runbook makes the *enumeration*
> complete by construction and the *verification* measured, not eyeballed. Background:
> [`strategy/goal-4-headless.md`](./strategy/goal-4-headless.md) (the gate) and the memory
> "render-is-truth-verify-every-state".

## The non-negotiables (learned the hard way)

1. **The rendered Storybook is the ONLY source of truth.** Source LESS is a hint — it contains dead /
   overridden / `!important` rules (e.g. a hover glow that doesn't render). When source and render disagree,
   the render wins.
2. **Never self-exclude. Surface, don't drop.** Module-specific, "covered by another spec", or "registry
   says 0× usage" are NOT reasons to omit — they are `🔲 propose-exclude` rows escalated to the owner. (A 0×
   count is not evidence of absence — the inner-label switch was used in the product despite a 0× count.)
3. **Measure Look; don't eyeball it.** Pull `getComputedStyle` from the rendered element and diff every
   property. (Teal pills shipped Poppins/10px when the real values were JetBrains-Mono/4px.)
4. **Cover three dimensions per row: Look · Feel (all states via real Playwright events) · Behaviour.**

## The pipeline

### 0. FIND — pick the next component

The worklist is `components/registry/*.json`, ordered by the tier list in `strategy/goal-4-headless.md`
(leaf → medium → heavy). Leaf set: page-header, form-item, form, drawer, confirm-modal, tooltip, popover,
back-button, button ✅, tag ✅, input, checkbox ✅, radio, switch ✅.

### 1. HARVEST — enumerate every source (script)

```bash
node design-system/scripts/harvest-component.js <id> [--extra "<regex>"] --write
```

Scans all 6 sources (story exports, `.mdx`, every class across *every* `src/design/*.less` incl.
`@{ant-prefix}` ones, the registry contract, candidate `src/components` sources) and writes
`strategy/coverage/<id>.generated.md` — a ledger skeleton with one `🔲` row per variant/class/state/
behaviour/prop. `--extra` adds class-name patterns for spread-out families (e.g.
`--extra "main-tags|loose-tags"` for tag). Review it; for any spread-out family, sanity-check the class
list isn't short (cross-check the `.mdx` and the real component for sub-components it composes — those
aren't auto-found).

### 2. LEDGER — turn the skeleton into the contract

Copy the generated skeleton to `strategy/coverage/<id>.md` (the live ledger; template is
`strategy/component-coverage-template.md`). Read the **real** styles/behaviours for each row from the
component's `*.less` + `_base-*.vue` + sub-components, noting the EXACT dedicated tokens (e.g. button uses
`--primary-button-bg`, not `--primary`). Mark obvious owner-questions as `🔲 propose-exclude`.

### 3. BUILD — the Vue 3 web component

- `design-system/components-lib/src/elements/Obs<Name>.ce.vue`, `<script setup>` + `defineCustomElement`,
  registered in `src/index.js`.
- Theme via CSS custom properties with sensible fallbacks (so it works standalone *and* picks up the look
  package). Use the exact dedicated tokens from the ledger.
- **Web-component prop pitfalls** (both cost real debugging):
  - Don't name a prop `on*` (e.g. `onText`) — Vue treats it as an event listener, not a prop. Use
    `checkedText` etc.
  - Don't give a String prop `default: ''` if it's set via attribute — Vue's `defineCustomElement` reflects
    the empty default back onto the attribute on upgrade and clobbers the authored value. Omit the default.
  - Booleans: presence = true; default true can't be expressed as an attribute — expose the inverse
    (e.g. `square` instead of `rounded`).
- **Web-component prop pitfalls** (both cost real debugging): don't name a prop `on*` (Vue treats it as an
  event listener); don't give a String prop `default: ''` when set via attribute (Vue reflects the empty
  default and clobbers the authored value — omit the default); booleans default-true can't be an attribute
  (expose the inverse, e.g. `square` not `rounded`).

### 3b. SHOWCASE — add the element to the "Elements" site (one manifest)

The library's site is generated from `registry/<id>.json` + a per-component examples manifest:
`design-system/components-lib/site/`. To add a component: write
`site/manifests/<id>.examples.mjs` (its `el`, interactive `controls` = subset of registry props with
widget hints, `playground` defaults, `events` to log, and a `gallery` of concrete attribute combos — see
`button`/`switch`/`tag`) and add the id to the `COMPONENTS` array in `site/generate.mjs`. Everything else
(3-column page, Details/Usage/Accessibility/Changelog/Known-issues tabs, props table, code snippet, dark
mode) is automatic from the registry. Build + preview:

```bash
cd design-system/components-lib && npm run site:dev   # generate + serve site/dist
```

The generator **validates** the manifest against `registry.props` and warns on drift — if it flags a
control/attr not in the registry, the registry contract is behind the element: update `registry/<id>.json`.
(The site deploys to the `/elements/` subpath via `deploy-gh-pages.sh`; it is SEPARATE from the product
Storybook — different audiences.)

### 4. VERIFY — measured Look·Feel·Behaviour (script)

Write `design-system/scripts/verify/<id>.config.js` (probes: `{label, storyId, sb, mine, states}` — see
`switch.config.js`). Then:

```bash
# serve the Elements site first (it is the verify target):
#   cd design-system/components-lib && npm run site:dev   # serves site/dist
node design-system/scripts/verify-component.js <id>       # config demoUrl → http://localhost:<port>/<id>.html
```

It diffs `getComputedStyle` (Storybook element vs the site page's shadow-DOM element) across base/hover/focus and
prints a pass/fail table. Drive it to **42/42 ✅** (or document each intentional divergence in the ledger).
For interactive **Behaviour** (toggle, close, +N popover, confirm, keyboard) drive a one-off Playwright
interaction and assert it matches the product.

### 5. GATE + SIGN-OFF

- Every ledger row `✅` or `⛔ owner-excluded` (with note). **Zero `🔲`.**
- Escalate the `propose-exclude` rows to the owner (one question round) — only the owner converts to `⛔`.
- Verify report green; demo cache-bust bumped; then the owner does the final visual pass.
- Deploy the Storybook if a story was added: `design-system/scripts/deploy-gh-pages.sh <owner/repo>`.

## Capabilities & limits (who runs what)

- **Assistant can**: harvest/verify/build locally (no network), drive Playwright + headless Chrome against
  the deployed Storybook, run the Storybook deploy.
- **Owner runs**: `npm publish` (2FA OTP), and the final scope/visual sign-off.

## Artifacts created per component

`elements/Obs<Name>.ce.vue` · `src/index.js` registration · `demo/` example · `strategy/coverage/<id>.md`
(zero `🔲`) · `verify/<id>.config.js` · (optional) a Storybook story.
