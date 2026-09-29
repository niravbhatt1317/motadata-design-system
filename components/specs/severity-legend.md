# Severity Legend (`obs-severity-legend`)

## 1. Overview

A responsive **severity legend** — the row of coloured dots + labels (Down / Critical / Major / Warning / Clear / Unreachable …) shown under a table, map or chart to explain the severity colours. It **composes `obs-severity`** for every entry (never hand-rolled dots), and when its container is too narrow it **collapses** the trailing entries into a `+N` pile with a hover-reveal.

## 2. Anatomy

- **Entries** — each is an `obs-severity` `dot + label` (the DS severity ring/colour).
- **Pile** — when space is tight, the overflow folds into overlapping dots (avatar-style) + a `+N` count.
- **Popover** — hovering the pile reveals the hidden entries as dot + label rows.

## 3. Variants

- **full** — every entry shown (wide container).
- **collapsed** — trailing entries folded into the `+N` pile (narrow container). Automatic (ResizeObserver).

## 4. Sizes

None.

## 5. States

`full` · `collapsed` · `hover` (pile popover open).

## 6. Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `levels` | String CSV / Array | `down,critical,major,warning,clear,unreachable` | severity levels, in order |
| `labels` | String JSON / Object | — | optional `{ level: 'Label' }` overrides |
| `min-visible` | Number | 1 | never collapse below this many full entries |
| `gap` | Number | 18 | px gap between entries |

## 7. Events

None (presentational).

## 8. Slots

None — entries come from `levels`.

## 9. Behavior

A `ResizeObserver` measures the container. If every entry fits, all show; otherwise trailing entries fold into the `+N` pile (reserving space for it), keeping at least `min-visible` full entries. Item widths are measured once (re-measured after webfonts settle). The host fills its container width so the measurement is stable (measuring the content-sized element would shrink as it collapses — a feedback loop).

## 10. Accessibility

Every entry pairs the dot with a text label (colour is never the only signal). The pile carries a `title` listing the hidden entries; the hover popover repeats them as dot + label. **Known gap:** the reveal is hover-only (no keyboard focus / Escape yet).

## 11. Tokens

`--severity-{level}` (per entry), `--neutral-regular`, `--border-color`, `--page-background-color` (popover).

## 12. Do / Don't

**Do** use it for any severity legend and give it a flexible container so it can collapse. **Don't** hand-roll the dots (every entry must be an `obs-severity`); don't use it for a single object's status (that's `obs-severity`).

## 13. Related

`severity` (composed per entry) · `table` (legend goes in its `footer` slot) · `pagination` (hosts it in the centered slot, which provides ≥64px clearance).

## 14. Decision flow

Explaining severity colours under a view? → `obs-severity-legend`. One object's status? → `obs-severity`. In a table footer? → the table's `footer` slot.

## 15. Changelog

- **2026-09-16** — New element: composes `obs-severity` dots, collapses trailing entries into a `+N` pile with hover-reveal when narrow. Replaces hand-rolled legend dots; used in the `obs-table` footer (Monitors list).
