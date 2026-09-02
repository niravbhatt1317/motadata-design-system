# Widget & Chart Elements — Design Spec

**Status:** Draft for review — not approved, no implementation started
**Date:** 2026-08-26
**Scope:** Bring the product's widget/chart family into the design system as framework-agnostic elements

---

## 1. Problem

The design system ships 49 catalogued components and 51 `obs-*` elements, but **no data
visualization element**. `components/registry/data-viz.json` is currently a *decision guide* that
explicitly directs consumers away from the DS for anything chart-shaped:

> "the DS ships NO chart/graph web component: STOP and ASK."

That was a deliberate call (licensed engines, app-coupling). This spec reverses it: charts become
real elements, so a consumer can render an on-brand visualization without the product runtime.

## 2. Goal

A consumer — in the product or standalone — renders any of the product's chart types from a
framework-agnostic element, and the result is **visually identical to the product**.

"Identical" is a measured number here, not a judgement call. See §7.

## 3. Non-goals

- **No data fetching.** Elements never open a socket, call an API, or know a server contract.
- **No product coupling.** The element API contains nothing derived from the product's internal
  data model, category routing, or server payload shape.
- **No engine replacement.** Charts stay on the same charting engine and major version as the
  product; swapping engines would forfeit visual parity.

## 4. Decisions

| # | Decision |
|---|---|
| D1 | Scope is the **card shell plus the render targets**. Data orchestration stays in the host app. |
| D2 | **Neutral data contract** — elements accept `type`, `series`, `categories`, `unit`, `stacked`, `thresholds`. Nothing product-shaped. The host supplies a thin adapter, which stays in the host's own repo. |
| D3 | **Local interactions are owned; data-coupled actions are emitted.** The element owns tooltip, legend toggle, crosshair, threshold bands, stacking, empty/loading/error, theme, palette, resize. Drilldown, zoom-beyond-loaded-window, refresh and export are emitted as events (`obs-drilldown`, `obs-zoom`, …). |
| D4 | Success metric is **pixel-identical rendering** against a captured reference. |
| D5 | The charting engine is a **`peerDependency` pinned to the product's major version** — never vendored, bundled, or committed. |
| D6 | `components/registry/data-viz.json` and `components/specs/data-viz.md` are **rewritten** in the same change, so the DS's own machine guidance stops contradicting the new elements. |

## 5. Architecture

Three layers.

### 5.1 Fixtures
One JSON per chart type, committed to this repo, providing the dummy data every story, demo and
verification run uses. Fixtures are **captured from a real rendering and then sanitised** — derived
from truth rather than hand-invented, which is what makes parity achievable. Sanitisation strips all
host/entity/metric identifiers and runtime ids, replacing them with generic names, while preserving
array shape and point counts.

> The sanitisation field list is host-specific and is maintained in the internal design record, not
> in this public repo.

### 5.2 Elements
Structure mirrors the host app's own component boundaries, so the two stay easy to reason about
together:

`ObsWidgetCard` (shell) wrapping — `ObsChart` (multi-variant), `ObsGauge`, `ObsTopN`, `ObsPie`,
`ObsGrid`, `ObsNumericGrid`, `ObsQueryValue`, `ObsSankey`, `ObsHeatmap`, `ObsStream`, `ObsTreeMap`,
`ObsMap`, `ObsEventHistory`, `ObsActiveAlert`.

Each is a Vue 3 `.ce.vue` compiled via `defineCustomElement`, themed through CSS custom properties,
with series colours resolved from `tokens/chart-palette.json`.

`ObsMap` uses a different engine from the charts and therefore gets its own verification path.

### 5.3 Verification
The existing `scripts/verify-component.js` diffs `getComputedStyle`, which is **meaningless for SVG
output** — it would report success on a chart that is visibly wrong. A chart-specific harness is
required:

- **Config diff** — the element's resolved chart configuration versus the captured reference
  configuration, deep-diffed with data arrays and sanitised fields excluded. Produces a numeric
  divergence count.
- **Pixel diff** — both rendered at identical dimensions from the identical fixture, screenshotted,
  compared.

A component is done when both gates are clean and its coverage ledger has zero open rows, per
`COMPONENT-CONVERSION-RUNBOOK.md`.

## 6. Public API sketch

```html
<obs-chart
  type="stacked-area"
  unit="%"
  series='[{"name":"web-01","data":[[1787702400000,46.5]]}]'
  categories='[]'>
</obs-chart>
```

Events: `obs-drilldown`, `obs-zoom`, `obs-legend-toggle`, `obs-export`.

## 7. Definition of "no visual diff"

1. Config diff returns zero unexplained divergences (each intentional divergence documented in the
   component's ledger).
2. Pixel diff below an agreed threshold at a fixed viewport.
3. Both light and dark themes pass.

## 8. Repo and CI impact

`.github/workflows/ds-validation.yml` gates every PR. Each new element therefore requires:

- `components/registry/<id>.json` — valid JSON, schema-complete
- `components/specs/<id>.md` — prose spec
- `components/index.json` — component entry **and** updated `counts.components`,
  `counts.families`, and every `counts.coverage.*` bucket the entry sets to `true`
- `node scripts/build-spec-package.js` re-run and `package/` committed, or the
  *Spec package in sync* job fails
- `node scripts/validate-spec.js` passing
- A `site/manifests/<id>.examples.mjs` and an entry in `site/generate.mjs` for the Elements site

Current baseline: `counts.components` 49, `counts.families` 23.

## 9. Phasing

| Phase | Content |
|---|---|
| 0 | Fixture format, capture tooling, chart verification harness, `ObsWidgetCard` |
| 1 | `ObsChart` variants |
| 2 | `ObsGauge`, `ObsTopN`, `ObsPie`, `ObsQueryValue` |
| 3 | `ObsGrid`, `ObsNumericGrid`, `ObsEventHistory`, `ObsActiveAlert`, `ObsStream` |
| 4 | `ObsHeatmap`, `ObsSankey`, `ObsTreeMap` |
| 5 | `ObsMap` (separate engine, separate verify path) |

Phase 0 is the gate: without the verification harness, later phases cannot prove parity and the
project degrades into eyeballing — the exact failure mode the conversion runbook exists to prevent.

## 10. Open questions — require a human decision

1. **Charting engine licence.** The engine is commercially licensed. A public repository and a
   public demo site are a different use than an internal application. Confirm coverage with the
   licence owner before publishing anything that renders it.
2. **Data policy.** Confirm that fixtures derived from sanitised production telemetry may be
   published at all.
3. **Pre-existing disclosure.** `components/specs/data-viz.md` already names host application file
   paths and architecture in this public repo. Out of scope here, but worth a separate audit if
   that is not intended.

## 11. Risks

- **Parity drift** — an engine minor upgrade on either side can change rendering. Mitigated by
  pinning and by the config diff running in CI.
- **Scope** — this is a multi-phase programme, not a single change. Phase boundaries are the
  review points.
- **Ledger debt** — skipping the zero-open-row gate to move faster reproduces the "shipped "done"
  with variants missing" failure the runbook was written after.
