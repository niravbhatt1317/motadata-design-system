# Metric List (`obs-metric-list`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule |
| **Maturity** | 🟢 Stable |
| **Source** | `src/components/widgets/views/grid/vertical-value-grid.vue` (**VerticalValueGrid**) — a dashboard/widget metric layout. |
| **Element** | `obs-metric-list` |
| **Registry** | [`registry/metric-list.json`](../registry/metric-list.json) |
| **Family** | [Data Display](../family-map.md) |

## Overview

The DS **metric / KPI list**. Each row is a **prominent value** — a large number + a unit (right-aligned)
— followed by its **label**. No column header. Used by dashboard metric / KPI widgets (availability,
throughput, latency, utilization). It is **not a data table** — it only shared the `.ds-grid` chrome in the
Storybook, which is why it was split into its own element. For rows-of-records use `obs-table`; for a single
record's label→value detail use `obs-key-value`.

## Anatomy

- **Value** — the figure, right-aligned, 18px/600 (`.num`). Optionally **colour-coded** by a `--severity`
  token (the product `ColorCodedCell` threshold colouring).
- **Unit** — a small muted suffix beside the value (`%`, `GB`, `ms`, `k/s`, …).
- **Label** — the metric name, muted, to the right of the value.
- **Row** — `--border-color` bottom divider; **hover** highlight (`--neutral-lighter`).

## Options (props)

| Prop | Default | Notes |
| --- | --- | --- |
| `items` | `[]` | `[[value, unit, label], …]` or `[[value, unit, label, color], …]` or `[{value, unit, label, color?}]` (JSON string or JS array). |

`color` is a `--severity` token (e.g. `--severity-critical`) — it colours the value. Never a raw hex.

## Variants & when to use

| Variant | Turn it on with | Use when |
| --- | --- | --- |
| **default** | `items` of `[value, unit, label]` | a small set of headline KPIs |
| **color-coded** | a 4th item field / `color` key (`--severity-*`) | a value should signal severity/threshold state |

## Behaviors

- Purely presentational — pass `items`, it renders the rows. No paging/sorting (it's a short headline list).

## Content & writing

- Keep labels short; put the number in `value` and the suffix in `unit` so the figure reads as one.

## Accessibility

- A borderless table of value/label rows; ensure the value + unit reads as one figure. Consider a `<dl>` if
  it is semantically key/value. Colour is not the only signal — pair a colour-coded value with a clear label.

## Design tokens used

`--border-color` · `--neutral-light` · `--neutral-lighter` (hover) · `--page-text-color` · `--severity-*`
(colour-coded values).

## Do / Don't

- **Do** use for dashboard KPI / metric widgets; give each item a value + unit + label; colour a threshold
  value with a `--severity` token (the 4th field / `color` key).
- **Don't** use for tabular records (→ `obs-table`) or a record's key/value detail (→ `obs-key-value`);
  don't hardcode a hex for the value colour.

## Related components

`obs-key-value` (single-record detail) · `obs-table` (rows of records) · `obs-tag` (status chips).

## Changelog

- **2026-07-13** — Color-coded values (a `--severity` token colours the value, the product `ColorCodedCell`
  colouring) + the Details-tab dataset playground + gallery examples. Added this prose spec.
- **2026-07-13** — Shipped `obs-metric-list`, split out of the Storybook Table "vertical-value" variant
  (it's a metric layout, not a data table). Row-hover + width fixes.
