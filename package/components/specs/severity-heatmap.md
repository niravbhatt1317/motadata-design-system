# Severity Heatmap (`PlainHeatMap` / `obs-severity-heatmap`) — Spec, Findings & Solutions

**Tier:** molecule · **Source:** custom-engine (reproduces the product's Infrastructure-Heatmap honeycomb) ·
**Element:** `<obs-severity-heatmap>` (framework-agnostic) · **Status:** core · **Maturity:** stable ·
**Storybook:** `Data Visualization/Severity Heatmap` · **Registry:** `registry/severity-heatmap.json` ·
**Figma:** not started

## 1. Usage analytics

One canonical product use: the **Infrastructure Heatmap** widget on the Alert-Summary dashboard — hundreds of
monitors packed into a severity-coloured honeycomb. The underlying DS chart library flags `heat-map` as a
**custom-engine** type (it ships the data shape but no serializable renderer), so there is no `obs-chart`
variant to count against; this element **is** that renderer, ported 1:1 from the product's
`heatmap-single-group.vue` / `general.less`. In the DS starter it appears once —
`DashboardPage.vue` → `<obs-severity-heatmap :cells.prop="hexCells" size="22">` inside an
`obs-widget-card` titled "Infrastructure Heatmap". Treat the honeycomb as a **one-of** dashboard widget,
not a widely-sprinkled atom.

## 2. Overview

A severity heatmap is a **honeycomb density map**: one flat-to-point hexagon per monitor, each filled with its
severity colour, tessellated into an interlocking grid. It answers a single question at a glance — *what is the
shape of this fleet's health?* Worst severities (`down` / `critical`) band across the top, a
critical→major→warning transition follows, and a healthy `up` body fills the rest. The colour carries the
severity; **hovering** a hex raises the product tooltip (monitor IP + location + a severity pill) so an
individual monitor can be spot-checked. Use it when the **spread across many monitors** matters more than any
one row — not for a short list with per-row detail (that's a table), not for a single value against a total
(that's a gauge), and not for a trend over time (that's a line/area chart).

## 3. Anatomy

- **Container** (`.hm-container`) — a `position: relative`, centered, wrapping flexbox that packs the hexes and
  anchors the tooltip.
- **Hex box** (`.hm-box`) — one per cell: a `clip-path` hexagon filled with `var(--border-color)` (the box IS
  the thin outline), sized `size × (size × 1.1547)` with a negative bottom margin of `size × 0.2885` that pulls
  the next row up into the honeycomb interlock.
- **Severity cell** (`.hm-cell`) — a second hexagon `inset: 1px` inside the box, filled with
  `var(--severity-<level>)`. The 1px reveal of the box beneath is the hairline outline between hexes.
- **"+N more" pill** (`.hm-more`) — a pill-shaped chip (`--primary-alt` outline + text) appended after the last
  shown hex when `max` truncates the grid.
- **Hover tooltip** (`.hm-tip`) — a white name/location card (`--common-widget-bg`) with a left arrow and a
  severity pill (`var(--severity-<level>)` fill, `--active-text-color` text) grafted on the right edge; anchored
  by pixel offset to the hovered hex's right side.

## 4. Options

The heatmap has **no discrete variants** — every "variant" is a data/prop shape of the same engine. The
registry names four so the showcase and usage rules stay in lockstep:

| "Variant" | Driven by | What |
| --- | --- | --- |
| `infra-honeycomb` | object `cells` + `size="22"` | The full dashboard honeycomb: worst severities band the top, healthy `up` fills the body; each hex carries a name + location so the tooltip has identity. |
| `compact` | smaller `size` (14–20) | A handful of monitors shrunk to fit a tight widget or an inline health strip. |
| `truncated` | `max="N"` | Caps the grid to the first N hexes and appends a "+N more" pill for a bounded preview of a big fleet. |
| `bare-cells` | string `cells` | Plain severity strings (`['down','critical','up',…]`) → colour-only hexes with **no** hover tooltip (no identity to show). |

## 5. Behaviors

**Rest** — a static honeycomb; every hex is a non-focusable div filled by its severity behind a 1px inset
outline. Non-interactive to the keyboard.

**Hover** — the hovered hex scales `1.4×` and raises its `z-index` so it lifts above its neighbours; if the cell
has a `name`, the tooltip appears anchored to the hex's right edge (`left = box.offsetLeft + box.offsetWidth + 6`,
`top = box.offsetTop - 2`) showing name → location → a severity pill. Leaving the hex (`mouseleave`) dismisses it.
A bare-string cell has no name, so it hovers/scales but raises **no** tooltip.

**Truncation** — with `max > 0` and more cells than `max`, only the first `max` hexes render and the remainder
(`total − max`, clamped ≥ 0) collapse into the "+N more" pill.

**Scaling** — the whole grid scales from the single `size` number. Height (`size × 1.1547`), margin
(`floor(size/17)`), and the honeycomb pull-up (`size × 0.2885`) are all **derived** — never hand-tune per-hex
margins to force a size.

## 6. Content & writing

Feed the honeycomb **real severity data**, ordered/banded meaningfully (worst first) so the coloured shape tells
a story like the product. For identity, pass **object cells** with a `name`/`ip` (the tooltip title — an IP or
monitor name, e.g. `172.16.8.113`) and a `location`/`sublabel` (the subtitle, e.g. `MB_Location_5`). Keep the
name a stable identifier, not a sentence — the tooltip is `white-space: nowrap`. Severity strings must be a
**known level** (see §9); an unknown level resolves to no colour. Don't hardcode a fill to fake a status — the
colour must be information.

## 7. Accessibility

This is a **presentational density map**. Severity is conveyed purely by colour and identity only by a
**mouse-hover** tooltip, so several gaps apply (all recorded in the registry `a11y` block):

- **Colour-only encoding** — a hex's severity is its fill alone; there is no per-hex text or `aria-label`, so
  meaning is lost to screen readers and to colour-blind users without the tooltip. The **hover tooltip is the
  text alternative** (it names the severity, e.g. "Warning") — but it is mouse-only.
- **Mouse-only tooltip** — driven by `mouseenter`/`mouseleave` and `pointer-events: none`; it cannot be reached
  by keyboard or focus, so its name/location/severity are unavailable to assistive tech.
- **Not keyboard-navigable** — the hexes are plain `<div>`s with no `role`/`tabindex`; the honeycomb exposes no
  accessible name or population summary.
- **Low-contrast separation** — the 1px inset outline is the only divider between adjacent same-severity hexes;
  at small sizes low-contrast severities can be hard to tell apart.

**Guidance:** treat the honeycomb as a visual summary and **pair it with an accessible equivalent** (a table or
a severity-count list) for the same data. A future improvement: `role="img"` + an `aria-label` summarising the
population (e.g. "128 monitors: 6 down, 12 critical, 20 warning, 90 up") and a keyboard-reachable per-hex label.

## 8. Props / API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `cells` | array \| string | `[]` | One hex per entry. Accepts an array of plain severity **strings** (`['down','critical','up',…]`) OR an array of **objects** `{ severity \| sev, name \| label \| ip, location \| sublabel \| sub }`, normalised to `{ sev (lowercased), name, sub }`: `severity/sev` → the fill `var(--severity-<sev>)`, `name/label/ip` → tooltip title, `location/sublabel/sub` → tooltip subtitle. A string cell has no name → colour-only, no tooltip. Also accepts a **JSON string** of that array (it is `JSON.parse`d) — how the static showcase passes it as an attribute. Mirrors the DS `heat-map` fixture's `result.data`. |
| `size` | number \| string | `22` | Hexagon **width** in px. Height = `size × 1.1547`; margin = `floor(size/17)`; honeycomb pull-up (negative bottom margin) = `size × 0.2885`. Strings are coerced (`+size`); a falsy/invalid value falls back to `22`. Scale the whole grid by changing this one number (14–18 dense, 22 dashboard default, 26+ roomy). |
| `max` | number \| string | `0` | Truncation cap. `0` (default) shows **all** cells. When `> 0`, only the first N hexes render and a "+N more" pill is appended (`remaining = total − max`, clamped ≥ 0). Strings are coerced (`+max`). |

**Events:** none. **Slots:** none. **CSS custom properties consumed:** see §9 — the fill reads
`var(--severity-<level>)` so the honeycomb follows the active theme with no per-instance styling.

Attribute vs property: `cells` is declared as `[Array, String]`. As a **DOM property** (`:cells.prop` in the
starter) pass the real array; as a **static attribute** pass a JSON string (`cells='[…]'`) — the element
`JSON.parse`s a string input. `size` and `max` are plain string/number attributes.

## 9. Design tokens used

**Severity fills** (one per level, `var(--severity-<level>)`): `--severity-down`, `--severity-critical`,
`--severity-major`, `--severity-warning`, `--severity-up`, `--severity-maintenance`, `--severity-unreachable`
(and any other `--severity-*` level a cell names — e.g. `clear`, `unknown`, `disable`). **Chrome & tooltip:**
`--border-color` (the hex-box outline + tooltip border), `--common-widget-bg` (tooltip card + arrow),
`--page-text-color` (tooltip name), `--neutral-light` (tooltip subtitle), `--active-text-color` (severity-pill
text), `--neutral-shadow-light` (tooltip shadow), `--primary-alt` (the "+N more" pill outline + text). Every
colour is a token, so the honeycomb and tooltip re-read correctly on a light↔dark theme flip.

## 10. Findings & inconsistencies

### F1 — Colour + hover are the only channels · Medium · By design (a11y gap)

Severity is colour-only and identity is a mouse-only tooltip; there is no per-hex `aria-label` and no keyboard
path. This is faithful to the product PlainHeatMap but means the honeycomb alone is not accessible — see §7.
**Mitigation:** pair with a table/severity-count list; the tooltip is the (mouse-only) text alternative.

### F2 — Tooltip has no collision/flip handling · Low · Open

The tooltip is anchored by pixel offset to the **right** of the hovered hex. Near the right edge of a narrow
widget it can clip out of view — there is no flip-to-left or viewport collision logic. **Mitigation:** give the
widget enough width, or hover hexes away from the right edge.

### F3 — Severity is not enum-validated · Low · Open

An unknown level yields `var(--severity-<unknown-name>)`, which resolves to nothing, so that hex fills with **no
colour** (transparent over the border box) rather than erroring. **Mitigation:** pass only known severity levels
(§9).

### F4 — No virtualisation · Low · Open

Every cell is a real DOM node — a very large unbounded fleet is heavy to render. **Mitigation:** cap with `max`
or pre-slice the data before passing it.

## 11. Recommended solutions

- **F1:** ship the honeycomb *with* an accessible equivalent in the same widget (a hidden or adjacent
  severity-count table). Longer term, add `role="img"` + a population-summary `aria-label`, and make each hex a
  focusable, labelled element so the tooltip content is reachable by keyboard.
- **F2:** add right-edge collision detection that flips the tooltip to the hex's left when it would overflow the
  container.
- **F3:** normalise unknown severities to a defined `--severity-unknown` fill (or warn in dev) so a mistyped
  level is visible rather than transparent.
- **F4:** slice large fleets before render (or use `max`); a future virtualised grid would let the full
  population render cheaply.

## 12. Do / Don't

**Do:** use it for the severity spread of **many** monitors (one hex = one monitor, colour = severity); pass
object cells with a name/ip + location so the hover tooltip can identify each monitor; let the fill read from
`var(--severity-<level>)` so it follows the theme; cap large fleets with `max="N"`; scale with `size` and keep
the derived geometry; band the data (worst severities first) so the shape tells a story.

**Don't:** use a honeycomb for a small list that needs per-row detail (that's a table); use it for a single
value-against-total (that's a gauge); rely on colour alone to convey a *specific* monitor's status (identity is
in the mouse-only tooltip — see §7); hardcode hex fills (pass a real severity); dump thousands of hexes
unbounded into a small widget (cap or pre-slice).

## 13. Decision-grade usage

Decision flow (first match wins): severity spread across **many** monitors → obs-severity-heatmap honeycomb ·
only a handful with per-row columns/detail → a **table** · a single value against a group total → an
**obs-gauge** dial · a trend over time / multiple series → a **line/area** chart · too many to render
comfortably → cap with `max="N"` (or pre-slice) · each hex must identify its monitor on hover → pass **object**
cells with `name`/`ip` + `location` (bare strings render colour-only). Per-variant Use-when / Don't / Example /
As-seen-in cards are word-identical to `registry/severity-heatmap.json` `usageRules` and the
`Data Visualization/Severity Heatmap/Usage` page.

## 14. Related components

`Charts` / **data-viz** (the line/area/bar/pie family — the heat-map is the custom-engine member) · `Gauge`
(a single value-against-total dial — the honeycomb's sibling for one metric) · `Severity` (the `--severity-*`
token scale that fills each hex and the tooltip pill) · `Widget Card` (the dashboard chrome the honeycomb sits
inside) · `Table` (the accessible/per-row-detail alternative to pair with, or fall back to).

## 15. Changelog

- **2026-09-07** — Added `<obs-severity-heatmap>`: severity honeycomb (custom-engine reproduction of the product
  PlainHeatMap; the chart library ships `heat-map` data-only with no renderer — this element is the renderer,
  ported 1:1 from `heatmap-single-group.vue` / `general.less`). Hex geometry: `size × 1.1547` height,
  `size × 0.2885` honeycomb pull-up, 1px-inset severity cell over a `--border-color` box (the thin outline).
  `cells` accepts severity strings OR `{ severity, name, location }` objects (and a JSON-string attribute);
  `size` scales the whole grid; `max` truncates to N + a "+N more" pill. Hover tooltip = monitor IP + location +
  a severity pill. Used in the Alert-Summary dashboard "Infrastructure Heatmap" widget.
- **2026-09-07** — Authored the decision-grade Usage (four variant cards: infra-honeycomb · compact · truncated ·
  bare-cells) and mirrored it into the registry `usageRules`. Recorded the a11y gaps (colour-only encoding →
  the hover tooltip is the mouse-only text alternative; no keyboard path; pair with a table/severity-count list)
  and known issues (F1–F4). Prose spec written; showcase playground + gallery reach every variant.
