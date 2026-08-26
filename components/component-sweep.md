# Exhaustive component sweep — "never miss a variant"

A repeatable two-part method to find **every** variant, size, state, prop-value, consumer-class,
slot, render-mechanism, and sibling of a component, across **all** pages/modules — before we
catalogue it. Born from the Tooltip hunt, where reactive guessing kept missing types; this makes
the discovery systematic.

Run it for **any** component: tell me the component (e.g. "sweep `MSelect`") and I run both halves
and report the complete variant/state map, then turn each distinct finding into a story or a
documented note.

**Two ways to invoke** (same method, your choice):

- **Skill / command:** **`/component-sweep <Tag> [--source <file>]`** — `.claude/skills/component-sweep/`.
- **Prose rules:** this doc + the Phase 1 step in [`PROCESS.md`](./PROCESS.md).

Both drive the script [`../scripts/component-sweep.sh`](../scripts/component-sweep.sh) (Part A) and
the agent fan-out (Part B) below.

## Part A — deterministic script (the mechanical sweep)

[`../scripts/component-sweep.sh`](../scripts/component-sweep.sh) mines real usage with grep/perl:

```bash
design-system/scripts/component-sweep.sh <TagName> [--source <file.vue>] [--out report.md]
# e.g.
design-system/scripts/component-sweep.sh MButton
design-system/scripts/component-sweep.sh FlotoDrawer --source src/components/_base-drawer.vue
```

It prints a Markdown report with:

| § | Section | What it catches |
| --- | --- | --- |
| 1 | **Usage** total + file count | scale |
| 2 | **Where used (by module)** | which areas to deep-dive |
| 3 | **Prop-value distributions** | **the variant discovery** — every distinct value of every prop, ranked (e.g. `width="96%"`, `scrolled-content="false"` 45×, `mode="tags"`) |
| 4 | **Boolean / flag props** | states & modifiers (`disabled`, `rounded`, `block`) |
| 5 | **Consumer-applied classes** | the class-based variant API (e.g. Tag's `tag-*`, overlay classes) |
| 6 | **Slots used** | composition surface |
| 7 | **Events bound** | the real event API |
| 8 | **Family / related files** | siblings + app composites around the concept |
| 9 | **Declared API** (with `--source`) | props/slots/emits from the source |

**How to read it:** every distinct **§3 value** and **§5 class** is a *candidate variant until
proven otherwise*; every **§8 file** is either a variant-of or distinct-from the base — open and
classify each.

The script is deterministic but blind to: (a) **alternate render mechanisms** (the same concept
rendered a different way — e.g. a tooltip via Highcharts `formatter`, native `title=`, or a graph
canvas, not `<MTooltip>`); (b) **app-specific semantics** (what a variant *means* / where it's used).
That's Part B.

## Part B — agent fan-out (the deep semantic hunt, per page)

When the concept can be rendered **more than one way** (tooltips, charts, menus, overlays) or spans
many modules, the script alone misses things. Fan out **parallel Explore agents**, each owning a
slice of the codebase, each told to exhaustively find every form of the concept and **dedupe
against what's already catalogued**.

Split by domain so coverage is total and non-overlapping, e.g.:

- charts/widgets (`src/components/chart`, `src/components/widgets`)
- graph/canvas modules (`src/modules/topology`, `netroute`)
- APM / RUM (`src/modules/apm`, `rum`)
- everything else (`alert`, `slo`, `log`, `flow`, `ncm`, `inventory`, `dashboard`, …)

**Prompt template (per agent):**

> In `/…/UI`, exhaustively enumerate EVERY distinct **`<CONCEPT>`** in **`<DOMAIN PATHS>`**. For each
> distinct one report: the **file / mechanism** (component, Highcharts `formatter`, native `title=`,
> directive, canvas), **where it's used** (which chart / view / page / place), its **content /
> variant / state**, and the **CSS class / surface / token**. Cover every rendering path — not just
> `<MComponent>`: grep `type:\s*'…'`, `formatter`, `tooltip:`, `title=`, `class=`, overlay classes,
> directives, and any `*-<concept>*.vue` files. I have ALREADY catalogued: `<KNOWN LIST>` — report
> only the DISTINCT ones I'm MISSING, each with file + where-used + content. Read-only; write nothing.

Then synthesise: union the agents' findings, drop duplicates, and you have the complete set.

## Part C — turn findings into the catalogue

Apply the **standard gates** to the union of §3/§5/§8 + agent findings:

1. **A story per distinct config-variant / state / kind** (the "story per config-variant" gate) —
   each notable prop-value, class, and render-mechanism gets a story (or, for chart/graph/native
   tooltips that the chart layer owns, a **reference reproduction** + a row in the lookup table).
2. **A "which X → where used" lookup table** in the Usage page (type → charts/places → renderer →
   surface → story) — so a human or AI can map *place → variant*.
3. **Usage + Changelog** updated for every new variant (the four pages move together).
4. **Anything deliberately not storied** (browser-native, app-only, infra) is **named in the table**
   so nothing is silently dropped.

## Pitfalls (learned the hard way)

Fidelity failures keep tracing back to **three** mistakes — avoid them:

1. **Reproducing from the BASE component instead of a REAL INSTANCE.** A base component is a blank
   template; what's actually on screen is shaped by the props the **consuming module** passes
   (`default-chips`, `field-schema`, `quick-filters`, `columns`, slots…). Example: the filter bar's
   leading `Groups / Types / Severity` chips are **`default-chips` declared by the module**, not in
   the base bar — invisible to any amount of base-component reading. **→ Always read 3–5 real
   consuming instances** (Phase 1), and reproduce a representative one — not the bare component.

2. **Reading grep SNIPPETS, not the WHOLE file (and not the whole cluster).** Snippets give
   structure but drop the details — a label map (`operators.js`), a `font-weight: 500`, a
   `flex-wrap: nowrap` overflow, a "Match" word, an inline `<svg>` icon. Example: missed the match
   toggle's "Match" prefix + ↻ icon by reading a grep hit instead of the file. **→ Read every file
   in the component cluster end-to-end** (the chip + the match-toggle + the quick-menu + the bar +
   its `operators.js`/registry), not just the file grep pointed at.

3. **Asserting "it matches now" from source-reading alone.** A screenshot / the live render is
   ground truth and resolves in one pass what many code-reads can't. **→ Don't claim visual fidelity
   from code; verify against the real artifact** (screenshot or a measured render), and say "matches
   the source" — not "matches the product" — until you've seen the product.

4. **Measuring computed styles instead of LOOKING at the render.** Token checks ("bg = `#ecf1f9` ✓,
   radius = 4px ✓") can all pass while the component still looks wrong — because **padding,
   spacing, and proportion** are what the eye reads, and a passing token says nothing about them.
   Example: the filter-bar chips matched every token but were cramped because the chip-button's
   `padding: 0 12px` was missing (only the inner segments were padded). **→ Screenshot your rendered
   story (Playwright `page.screenshot`) and VISUALLY diff it against the product screenshot** — then
   iterate fix → re-shoot → compare. Measuring is necessary but never sufficient.

5. **Capturing every screenshot but only LOOKING at a sample.** Shooting all N stories then opening
   3 of them is not verification — the unviewed ones can be blank and you'd never know. Example: the
   Tabs **Persisted** story rendered **empty** because `MPersistedTab` is a Floto **`_base-`**
   component (app-registered via `_globals.js`, which **Storybook does not run**) — only the kit's
   `M*` (MTab/MButton/MIcon…) and a few hand-registered components exist in the preview, so
   `<MPersistedTab>` was an **unknown component → silently rendered nothing**. Two rules: **(a) OPEN
   every screenshot you capture**, especially the unusual/renderless one; **(b) any Floto `_base-*`
   component used in a story must be imported + registered locally** (`import X from '@components/_base-x.vue'`
   → `components: { X }`, like the Table story does for `MStatusTag`) — an unknown tag fails silently,
   exactly like a missing MIcon name.

6. **Organizing by MODULE/SCREEN instead of by component ARCHETYPE.** A design system catalogues
   components by **what they ARE** (Button, Input, Select, Filter, Toolbar) — never by **where they're
   used** (a module/feature/screen). Example: "Monitoring Config" was a *module bucket* — its members
   were really a **Number Input** (poll time), a **multi-select** (monitoring hours), and a **Filter
   row**; they belonged in Input / DropdownPicker / Filters, not a new feature family. **→ For each
   thing you find, ask "what reusable component is this?" and catalogue THAT** — feature-specific
   things are *usages* of a primitive, documented on the primitive's page, **not** new entries. **Hard
   rule: every catalogue entry names a component archetype; if a family name is a module/screen, it's
   wrong.** Layer it: **atoms/molecules** are the reusable pieces (filters, inputs, selects);
   **organisms** are *compositions* (toolbars) that reference those pieces — the molecule is catalogued
   once, the organism composes it (no duplication). Reorganizing by archetype also *surfaces* missing
   components (the 32× Filters expression builder and the 54×/58× Page/Widget toolbars were found this
   way).

## Worked example — the Tooltip family

- **Script** on `MTooltip` → 94×, placement distribution, `chart-like-tooltip` overlay class,
  `_base-tooltip.vue` (VTippy override), the sibling `*-tooltip.vue` files.
- **Agent fan-out** (4 domains) → revealed the non-`MTooltip` mechanisms: native `title=` (~59×),
  Highcharts `TooltipBuilder` (10+ chart types), heatmap/sparkline widget tooltips, **15** graph
  node/edge components (topology/netroute/APM, incl. SDN, Cisco ACI), the d3 flame graph, RUM geo /
  waterfall, log pattern grid, availability bar.
- **Catalogue** → **28** Data-Viz Tooltip stories + the Tooltip/Popover components, all in a single
  **which-tooltip-where** lookup table. Nothing left unaccounted for.
