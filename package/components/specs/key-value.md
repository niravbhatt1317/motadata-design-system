# Key-Value / Description List (`obs-key-value`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule |
| **Maturity** | 🟢 Stable |
| **Source** | `src/components/widgets/views/grid/column-grid-view.vue` (**ColumnGridView**) + `overview-layout.vue` (**OverviewLayout**) — single-record detail layouts. |
| **Element** | `obs-key-value` |
| **Registry** | [`registry/key-value.json`](../registry/key-value.json) |
| **Family** | [Data Display](../family-map.md) |

## Overview

The DS **key-value / description list** — a **transposed** grid where the columns become row **labels**
(a label cell) + the record's **value**. A single-record **detail / overview** view, common in widget
overviews and detail panels. It is **not a data table** — it only shared the `.ds-grid` chrome in the
Storybook, so it was split into its own element. For rows-of-many-records use `obs-table`; for headline
KPI numbers use `obs-metric-list`.

## Anatomy

- **Label cell** (`.k`) — the field name. In `card` it is tinted (`--grid-header-bg`) with a right divider;
  in `plain` it is muted (`--neutral-light`) with no fill.
- **Value cell** (`.val`) — the record's value. Optionally **colour-coded** by a `--severity` token, or
  rendered as an **obs-tag** when a `status` is given. **Hover** highlights the value cell.
- **Card** (card variant) — a bordered, rounded container around the pairs.

## Options (props)

| Prop | Default | Notes |
| --- | --- | --- |
| `items` | `[]` | `[[label, value], …]` or `[[label, value, color, status], …]` or `[{label, value, color?, status?}]`. |
| `variant` | `card` | `card` (bordered, tinted label — column-grid-view) · `plain` (borderless, muted — overview-layout). |
| `columns` | `1` | `1` · `2` (pairs laid out two-across — overview-layout 2-columns). |

`color` is a `--severity` token (colours the value); `status` (e.g. `running`) renders the value as an obs-tag.

## Variants & when to use

| Variant | Turn it on with | Use when | Not this — use instead |
| --- | --- | --- | --- |
| **card** | default | a self-contained detail panel/widget (bordered, tinted labels) | inline inside another card → `plain` |
| **plain** | `variant="plain"` | an inline, borderless detail with muted labels | needs its own boundary → `card` |
| **two-column** | `columns="2"` | a record with MANY fields — compact two-across | few pairs / long values → 1 column |
| **color-coded** | item `color` (`--severity-*`) | a value signals severity/threshold state | plain value → omit color |
| **status** | item `status` | the value IS a status → renders an obs-tag | plain text value → omit status |

## Behaviors

- Presentational — pass `items` (+ `variant`/`columns`). It composes `obs-tag` for status values.

## Content & writing

- Keep labels short. Put a status word in `status` (→ tag) and a threshold colour in `color` (→ `--severity`).

## Accessibility

- Semantically a description list — prefer `<dl>` semantics where possible; the label should be associated
  with its value. Ensure sufficient contrast on the tinted label cell. Colour is not the only signal — a
  colour-coded value should still be legible by its text.

## Design tokens used

`--border-color` · `--grid-header-bg` (tinted label) · `--neutral-dark` · `--neutral-light` (plain label) ·
`--neutral-lighter` (hover) · `--page-text-color` · `--severity-*` (colour-coded values).

## Do / Don't

- **Do** use for a record's detail/overview (label | value); keep labels short; use `columns="2"` for many
  fields; colour a threshold value with a `--severity` token; render a status value as a tag via `status`.
- **Don't** use for tabular records (→ `obs-table`) or KPI metrics (→ `obs-metric-list`); don't hardcode a
  value colour; don't use 2 columns for long-wrapping values.

## Related components

`obs-metric-list` (KPI numbers) · `obs-table` (rows of records) · `obs-tag` (status values) · `obs-drawer` /
`obs-modal` (where a detail panel often lives).

## Changelog

- **2026-07-13** — Added `variant` (card | plain), `columns` (1 | 2), colour-coded values (`--severity`
  token) and status values (obs-tag); Details-tab playground + gallery. Added this prose spec.
- **2026-07-13** — Shipped `obs-key-value`, split out of the Storybook Table "key-value (transposed)"
  variant (it's a detail layout, not a data table). Row-hover + width fixes.
