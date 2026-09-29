# Gauge (`obs-gauge`) — Spec, Findings & Solutions

**Tier:** molecule · **Source:** custom-engine · **Element:** `<obs-gauge>` (framework-agnostic) ·
**Status:** core · **Maturity:** stable · **Storybook:** `Data Visualization/Gauge` · **Registry:**
`registry/gauge.json` · **Figma:** not started

## 1. Usage analytics

Not swept as a product component — `obs-gauge` is a **custom-engine** element, not a wrapper over an
existing product widget. The DS chart library flags `gauge` as a **data-only** type (no serializable
config), so there is no product `<Gauge>` to count; this element **is** the renderer for that data. Its
real footprint is the **Alert-Summary dashboard**, where two widget cards each lay a **4-up row** of
gauges: **Monitor Availability** (Up / Down / Unreachable / Maintenance against the monitor total) and
**Alert Count** (Down / Critical / Major / Warning against the alert total). Every documented use is a
member of one of those two group rows; the unsevered / full / empty forms are the edges that keep a row
complete. *(Counts are approximate — the registry marks `usage` as approximate for the same reason.)*

## 2. Overview

A gauge is a **single ring dial**: a track ring with a **severity-coloured arc** swept to `value / total`,
a **large mono number** in the centre (the raw `value`), and an optional **label** beneath. It answers one
question — *how much of a group is in this one state, and is that state good or bad?* The **arc length**
encodes the ratio; the **colour** encodes the status. It is not a general chart: one gauge shows one slice
of one group. To show a whole group you lay **one gauge per member** in a flex row, all sharing the **same
total**, so the arcs are directly comparable. Reach for a line/area chart for a trend, and a donut/pie for
a single part-to-whole breakdown across categories — a ring of separate gauges is neither.

## 3. Anatomy

A non-interactive `82×82` SVG plus an optional caption:

- **Track ring** — the full 360° base circle (`fill:none`, `stroke: var(--gauge-base-color)`, 6-unit stroke).
- **Arc** — the same ring, rotated to start at 12 o'clock, `stroke` = the severity colour, `stroke-linecap:
  round`, its `stroke-dasharray` set to `frac · C` (of circumference `C`) where `frac = clamp(value/total, 0, 1)`.
- **Centre number** — real SVG `<text>` at the ring centre, 28px / 600, mono (`--chart-font-family`), filled
  with the same severity colour; shows the raw `value` (not the fraction).
- **Label** (optional) — 12px `--neutral-light` text below the ring, the status name (Up, Critical, …).

## 4. Options

| Variant | What | Usage |
| --- | --- | --- |
| `availability-dial` | `value` = monitors in a state, `total` = monitor group total; severity is a monitor status (up / down / unreachable / maintenance) | dashboard 4-up row |
| `alert-count-dial` | `value` = alerts at a severity, `total` = alert group total; severity is an alert level (down / critical / major / warning) | dashboard 4-up row |
| `unsevered` | `severity=""` (omitted) — arc + number fall back to `--primary`; a neutral count-against-total dial | fallback |
| `empty` | `total=0` or `value=0` — no arc, only the track ring + a centre 0 | zero-state (common at rest) |
| `full` | `value >= total` — the fraction clamps to 1 and the arc sweeps the whole ring; the centre still shows the raw value | edge |

There is **one fixed size** (82×82, 6-unit stroke, 28px centre number, 12px label). Scale via the container /
zoom — there is no `size` prop.

## 5. Behaviors

Static and **non-interactive** — no hover, focus, keyboard, or pointer states; the gauge is a readout, not a
control. The only motion is on **update**: when `value`/`total` change, the arc animates over a `0.4s
stroke-dasharray` transition (the centre number swaps instantly). The fraction is **clamped to `0..1`**, so
`value > total` never overshoots the ring — the arc caps full while the centre number keeps showing the raw
value. `total=0` is treated as "no denominator" and draws **no arc** (just the track + centre number), so a
zero-data member renders cleanly rather than dividing by zero. `value`/`total` accept **numbers or numeric
strings** (attributes are strings on a web component); both are coerced with `+`.

## 6. Content & writing

The **label** is the status name — one word where possible (Up, Down, Critical, Major, Warning, Unreachable,
Maintenance), Title Case, no trailing punctuation. It is not optional in practice: colour alone is not
accessible, so the label is what carries the status in text (see §7). The **centre number** is the raw
count, never a percentage or a "160/172" string — the ratio is the arc's job, the number is the value's.
Keep a group's labels parallel (all statuses, same casing) and show **every** member including the zero ones,
so the row reads as a complete breakdown rather than a filtered highlight reel.

## 7. Accessibility

The gauge is presentational: the centre number is **real SVG `<text>`** (screen-reader legible) and the
label is real text beneath. But the SVG has **no text alternative** — no `role`, `title`, or `aria-label` —
so a screen reader reaches only the bare number, never *"160 of 172 Up"*: the **value/total ratio** (arc
length) and the **severity meaning** (colour) are visual-only. Two consequences:

1. **Always pass a `label`** — the status name must live in text so status is never colour-only.
2. **Give the ring an accessible name at the consumer.** Until the element ships a built-in alt, wrap it so
   its card reads *"Up: 160 of 172"*, or (recommended) add `role="img"` + `aria-label="Up: 160 of 172"` on
   the host element.

For an accessible group, make sure the surrounding widget card announces the **group total** and each
member's **name + value**, so the ratio each arc encodes is available in text. See `Data
Visualization/Gauge/Accessibility`.

## 8. Props / API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | number \| string | `0` | The measured count for this dial. Drawn as the centre number **and** the arc numerator (`arc = value/total`, clamped to `0..1`). Strings coerced (`+value`). |
| `total` | number \| string | `0` | The group total → the arc denominator. `total=0` renders no arc (just the track ring + centre number). Strings coerced (`+total`). |
| `severity` | string | `''` | Status level → the arc + number colour `var(--severity-<level>)`. `''` falls back to `var(--primary)`. Enum: `up`, `down`, `critical`, `major`, `warning`, `unreachable`, `maintenance`, `clear`, `disable`, `unknown`, `suspended` (and `''`). |
| `label` | string | `''` | Optional caption under the ring (e.g. `Up`, `Critical`). Omit to render just the dial. 12px, `--neutral-light`. |

Slots: none. Events: none. CSS hooks: `--gauge-base-color` (track ring), `--chart-font-family` (centre
number), plus the `--severity-*` / `--primary` tokens the arc + number read from. `severity` is **not**
enum-validated in the element — an unknown level resolves to an undefined `var(--severity-<x>)` and the arc
loses its colour; pass a known level or `''`.

## 9. Design tokens used

`--severity-up` / `--severity-down` / `--severity-critical` / `--severity-major` / `--severity-warning` /
`--severity-unreachable` / `--severity-maintenance` / `--severity-clear` / `--severity-disable` /
`--severity-unknown` / `--severity-suspended` (the arc + centre-number colour, chosen by `severity`) ·
`--primary` (the unsevered fallback) · `--gauge-base-color` (the track ring, `#dee5ed` light) ·
`--chart-font-family` (the mono centre number, `'JetBrains Mono'`) · `--neutral-light` (the label). All
colour reads through tokens, so the dial follows the light + dark theme automatically.

## 10. Findings & inconsistencies

### F1 — No text alternative on the SVG · Medium · Open in element

The arc's `value/total` ratio and the severity meaning are visual-only; a screen reader reads the bare
centre number, not *"160 of 172 Up"*. Mitigated today by requiring a `label` and consumer-supplied
`aria-label` (see §7), but the element itself carries no `role`/`title`.

### F2 — Fixed 82px ring, not size-configurable · Low · Open in element

The ring is a hard `82×82` with a 6-unit stroke, a 28px centre number, and a 12px label. There is no `size`
prop — scale only via the container / zoom. Fine for the dashboard's 4-up rows; a limitation if a bigger KPI
dial is ever needed (a stat tile is usually the better answer there anyway).

### F3 — `severity` not enum-validated · Low · Open in element

An unknown level yields `var(--severity-<unknown>)`, which resolves to nothing, so the arc falls back to no
colour rather than erroring. Pass a documented level (or `''` for `--primary`). Surfaced so the catalogue
matches the element's real, permissive behaviour.

## 11. Recommended solutions

**F1:** add `role="img"` + a computed `aria-label` (e.g. `` `${label}: ${value} of ${total}` ``) on the host,
so the ratio and status name reach assistive tech without a wrapper; keep requiring `label` as the
belt-and-braces text carrier. **F2:** if a larger dial is genuinely needed, add a `size` token (or expose the
ring dimension as a CSS custom property) rather than transform-scaling — scaling blurs the mono number.
**F3:** validate `severity` against the enum and fall back to `--primary` on an unknown value (matching the
`''` behaviour) so a typo degrades gracefully instead of silently losing colour. All three are element-level
enhancements; none blocks current use — guidance in §7 and §12 covers the gaps today.

## 12. Do / Don't

**Do:** lay one gauge per group member in a flex row with the **same total** so arcs compare; pass a
`severity` that matches the data's real status (colour is information); always pass `total` when you want an
arc; add a `label` under every dial; let colours read from `--severity-*` / `--primary` so the dial follows
the theme; show zero members (`value=0`) to keep the row complete.

**Don't:** use a gauge for a time trend or many series (that's a line/area chart); mix different totals
across dials in one row (the arcs stop being comparable); hardcode a fill colour or pick a severity that
misrepresents the status; rely on colour alone — pair every dial with its label; stretch or size-hack the
82px ring for a big-number KPI (use a stat tile if you only need the number).

## 13. Decision-grade usage

Decision flow (first match wins): value against a group total **with a status colour** → `obs-gauge` · a
**whole group** at once → one gauge per member in a flex row, all with the **same total** · **no meaningful
status** → omit `severity` (falls back to `--primary`), or reconsider a plain stat tile · a **trend over
time / many series** → NOT a gauge, use a line/area chart · a **part-to-whole breakdown as one figure** → a
donut/pie, not a ring of gauges · `value` can **exceed** `total` → fine, the arc clamps full while the
centre number shows the raw value. Per-variant Use-when / Don't / Example / As-seen-in cards are
word-identical to `registry/gauge.json` `usageRules` and the `Data Visualization/Gauge/Usage` page.

## 14. Related components

`Charts` (the data-viz family — line/area for trends, donut/pie for part-to-whole) · `Severity` (the token
scale the arc + number read from) · `Metric List` (a value-and-label readout when no ratio/status colour is
needed) · `Severity Heatmap` (the sibling severity-coloured dashboard widget) · `Widget Card` (the chrome the
gauge rows sit inside on the Alert-Summary dashboard).

## 15. Changelog

- **2026-09-07** — Added `obs-gauge` to the DS: ring dial, arc = `value/total`, severity-coloured, mono
  centre number (28px / 600). Custom-engine reproduction of the product gauge/dial (the chart library ships
  gauge as data-only). Used in the Alert-Summary dashboard for Monitor Availability + Alert Count.
- **2026-09-07** — Authored this prose spec (15 sections). Widened the showcase `severity` control to the
  full documented enum (incl. `""` → `--primary`) and added dedicated gallery groups for the **full** and
  **unsevered** variants plus every severity colour (clear / disable / unknown / suspended). Sharpened the
  accessibility guidance (**F1** — SVG has no text alternative → require a `label` and a consumer-supplied
  `role="img"` / `aria-label`) and completed `tokensUsed`. Logged **F2** (fixed 82px ring) and **F3**
  (`severity` not enum-validated) as open element-level enhancements.
