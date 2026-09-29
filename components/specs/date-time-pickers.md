# Date & Time Pickers — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule |
| **Maturity** | 🟢 Stable |
| **Source** | `src/components/widgets/time-range-picker.vue` (`TimeRangePicker`) · `ui/components/Datepicker/Datepicker.vue` (`MDatePicker`) · `ui/components/Datepicker/Timepicker.vue` (`MTimePicker`) · `src/components/common/date-time-popover.vue` (`DateTimePopover`). |
| **Storybook** | Molecules/Date & Time Pickers |
| **Registry** | [`registry/date-time-pickers.json`](../registry/date-time-pickers.json) |
| **Family** | [Date & Time Pickers](../family-map.md) |

## Usage analytics

- **`TimeRangePicker`** — **42× / 35 files**. The dominant control; the observability time-range
  selector. Real variants: **`hide-custom-time-range`** (24×, presets-only), `allow-clear` (7×),
  `max-selectable-range-days` (2×), plus `bordered`, `pill-style`, `hide-selected-time`, `only-label`.
- **`MDatePicker`** — **10× / 8 files**. **All 10 usages pass `:show-time`** → it is the **date-time**
  field, not date-only. Often with `:min-date` (7×), `:allow-clear` (9×), `:disabled` (5×).
- **`TimeRangeSlider`** — **2×** (dashboard view + alert correlation drawer); a timeline scrubber
  variant of the time-range control. In the DS element it is now **functional and linkable**: a
  draggable band + two round handles on a DATE axis, and it can be driven from outside via
  `range-start` / `range-end` (ms) to **track a range picker's selection** (see the element note below).
- **Standalone time pickers — `0×`.** Both the kit **`MTimePicker`** and the custom **`TimePicker`**
  (`time-picker.vue`, a `FlotoDropdownPicker` of time options) are **0× as standalone tags**. Time is
  entered via MDatePicker `show-time` or inside the TimeRangePicker custom view (which uses the custom
  dropdown-based `TimePicker`, not an Ant spinner).
- **`DateTimePopover`** — **1×** (SLO correction profile); a custom-range-only popover.
- **Checked & scoped out:** **Scheduler / Recurrence** (`schedule-input/`, 17 files — Once/Daily/
  Weekly/Monthly builder) is a **separate family** (future entry), not a picker; `date-remark-pairs`
  (holiday list) is a composite; kit `DateRangePicker`/`NotifyTimePicker` are 0×; **no** week / month /
  quarter / calendar pickers exist. `only-label` and `daily-rolling` props are **declared but 0×**.

## Overview

The family covers three jobs: **pick a time window** (relative or absolute) for charts/dashboards/
logs → **`TimeRangePicker`**; **pick a date(+time) value** in a form → **`MDatePicker`** (always with
`show-time`); **pick a time of day** → **`MTimePicker`**. `TimeRangePicker` is the hero and is unique
to this product; the others wrap Ant `a-date-picker` / `a-time-picker`.

## `obs-date-time-picker` (DS element) — kinds & when to use

One element, a **`kind`** prop selects the picker. Shared props: `disabled` · `bordered` (trigger border) ·
`allow-clear` (× to reset) · `empty` · `placeholder` · **`size`** (`''` default 28px | `'lg'` 35px, lines up
with toolbar/action buttons) · **`show-range`** (print the resolved absolute window beside the pill).
Slider-only: **`range-start`** / **`range-end`** (ms — link the scrubber to a range picker's selection).

| `kind` | Use when | Product source |
| --- | --- | --- |
| **range** (hero) | pick a time WINDOW for a chart/dashboard/log view — a pill trigger → relative presets → an absolute **Custom** dual-month calendar | `TimeRangePicker` (42×) |
| **range-presets** | the same window picker but **presets only**, no Custom calendar | `hide-custom-time-range` (24×) |
| **field-datetime** | a form field for a **date + time** value | `MDatePicker :show-time` (10×) |
| **field-date** | a form field for a **date-only** value | `MDatePicker` |
| **field-time** | a form field for a **time of day** (12h hh:mm A + clock) | `MTimePicker` (12×) |
| **slider** | a **functional, linkable** draggable timeline scrubber (band + two handles, DATE axis) | `TimeRangeSlider` (2×) |

**Decision:** a time WINDOW for charts/logs → `range` (or `range-presets` if no custom calendar needed); a
date/time VALUE in a form → `field-datetime` / `field-date`; a time of day → `field-time`; scrub a timeline
(optionally linked to a range picker) → `slider`.

**Functional** (as of 2026-07-14): it reflects the selection to `el.value` (JSON) and emits a **`change`** event
on every pick. Value shape by kind — `range`/`range-presets`:
`{type:'relative',key,label,span,fromMs,toMs,from,to}` or
`{type:'absolute',start,end,fromTime,toTime,fromMs,toMs,from,to}`; `field-date`/`field-datetime`:
`{date:<ms>,display}`; `field-time`: `{time}`; `slider`: `{startPct,endPct,start,end}`. The range/preset
payload now carries the **resolved absolute window** (`fromMs`/`toMs` epoch ms + `from`/`to` display), so a
consumer can feed those straight into a **linked slider** (`range-start`/`range-end`). (Per Vue custom-element
convention the `CustomEvent.detail` is array-wrapped — read `detail[0]`.)

**Linking a slider to a range picker (as of 2026-09-07):** set the slider's `range-start` / `range-end` to a
range picker's resolved window (its `change.fromMs` / `change.toMs`). The slider's axis window then fits
**around** that range (padding = `max(50% of the span, 6h)`) and the band **snaps** to `[range-start, range-end]`,
so the scrubber grows/shrinks with the selection. The axis format is **adaptive** — `DD/MM` for a multi-day
window, `HH:MM` for a short (≤3-day) window — and the handle **tooltip persists while dragging** to show the
resolved datetime. Both props are required (with `end > start`) or the slider stays in its default
today ± 5-day window.

## Anatomy

### TimeRangePicker — anatomy

- **Trigger (closed):** a `--timerange-background-color` **shortcut pill** (`24h`, `1h`, or a computed
  duration like `6d 23h`) + a separator + the **range label** (`Last 24 Hours`). Empty → a
  **calendar-alt** icon + "Select Time". `:bordered` adds a frame; `:allow-clear` a **times-circle** ×.
- **Panel — presets:** the 15 relative options (Last 5/15/30 Mins · Last 1/6/12/24/48 Hours · Today ·
  Last Day · Last/This Week · Last/This Month), each with its shortcut pill; active row uses
  `--dropdown-hover-background`. **Custom** sits at the bottom (hidden by `hide-custom-time-range`).
- **Panel — custom:** an `a-range-picker` calendar (start/end) with two `MTimePicker` (From/To,
  seconds) and **Apply / Cancel** buttons; validates end > start.

### MDatePicker / MTimePicker

- `MDatePicker` = `a-date-picker` + a **calendar** suffix icon, `show-time` (12-hour `hh:mm A`),
  `dateRender` slot for custom cells, `disabled-date` / `min-date` constraints.
- `MTimePicker` = `a-time-picker`, **12-hour**, **clock** suffix icon, `allow-clear` default true.

### TimeRangeSlider — anatomy

- **Rail:** 100 tick dots, inset horizontally by `--page-header-padding` (8px fallback) so the timeline
  aligns with a page header; the first/last axis labels are anchored (left / right) so they don't overflow.
- **Band:** a draggable `--slider-tracker` bar, **14px tall**, **4px border-radius**, spanning the selected
  window between the two handles.
- **Handles:** two round handles (`--page-background-color` fill, `--neutral-light` border). Hover (or drag)
  shows a **ring** (`--page-text-color`) and a **datetime tooltip** (`--tooltip-background-color` /
  `--active-text-color`) above the handle; the tooltip **persists while dragging** (a `.dragging` class).
- **Axis:** DATE labels every 10th tick, **adaptive** — `DD/MM` for a multi-day window, `HH:MM` for a
  short (≤3-day) window.
- **Window:** default today ± 5 days (10 days); with `range-start`/`range-end` it fits **around** that range
  (padding = `max(50% of the span, 6h)`) and the band snaps to it.

## Options (props)

### obs-date-time-picker (DS element)

| Prop (attr) | Type | Default | Notes |
| --- | --- | --- | --- |
| `kind` | string | `range` | `range` · `range-presets` · `field-datetime` · `field-date` · `field-time` · `slider` |
| `disabled` | boolean | `false` | inert trigger / greyed field |
| `bordered` | boolean | `false` | `--border-color` frame on the range trigger |
| `allowClear` (`allow-clear`) | boolean | `false` | times-circle × on the range pill / field |
| `empty` | boolean | `false` | start with no selection ("Select Time" placeholder) |
| `placeholder` | string | `''` | field placeholder (defaults per kind) |
| `size` | string | `''` | `''` (28px) \| `'lg'` (35px — lines up with 35px toolbar/action buttons) |
| `showRange` (`show-range`) | boolean | `false` | print the RESOLVED absolute window beside the pill (two lines from → to) |
| `rangeStart` (`range-start`) | number \| string | `0` | **slider-only** — epoch ms; with `range-end`, links the scrubber to a range picker (band snaps + window fits around `[range-start, range-end]`). `0` = unlinked. |
| `rangeEnd` (`range-end`) | number \| string | `0` | **slider-only** — epoch ms; must be `> range-start` to engage the link. `0` = unlinked. |

Emits **`change`** (array-wrapped `detail` — read `detail[0]`); see Behaviors for the per-kind payload.

### TimeRangePicker

| Prop | Default | Notes |
| --- | --- | --- |
| `value` | — | v-model; `{ selectedKey, startDate, endDate, startTime, endTime, dailyRollingData }` |
| `hideCustomTimeRange` | `false` | **24×** — drop "Custom" (presets-only) |
| `maxSelectableRangeDays` | `93` | disables dates beyond the span (365 for report export) |
| `allowClear` | `false` | times-circle × → emits `change=undefined` |
| `bordered` / `pillStyle` / `hideSelectedTime` / `onlyLabel` | — | trigger display variants |
| `excludedOptions` | — | array of preset keys to drop |
| `disabled` / `overlayClassName` / `getPopupContainer` | — | standard |

### MDatePicker

| Prop | Default | Notes |
| --- | --- | --- |
| `value` | — | moment/string/number; v-model |
| `showTime` | `{ use12Hours:true, format:'hh:mm A' }` | **always passed in real use** |
| `allowClear` | — | 9× |
| `minDate` | — | 7×; earliest selectable |
| `disabledDate` | — | function to grey out days |
| `format` / `placeholder` | — | display format / `Select...` |

### MTimePicker

| Prop | Default | Notes |
| --- | --- | --- |
| `value` | — | moment/string/number |
| `format` | `hh:mm A` | 12-hour |
| `use12Hours` | `true` | |
| `allowClear` | `true` | |

## Behaviors

- **TimeRangePicker emit:** relative → `{ selectedKey:'-24h', startDate, endDate, startTime, endTime }`;
  custom → `{ selectedKey:'custom', … }`; cleared → `undefined`. Custom blocks Apply if end ≤ start.
- **Start-time rounding:** relative ranges round the start to the nearest 5-minute boundary.
- **MTimePicker emit:** `change(formattedString, moment)`.
- **DS element `change` payload (by kind):**
  - `range` / `range-presets` (relative) → `{ type:'relative', key, label, span, fromMs, toMs, from, to }`
    — `fromMs`/`toMs`/`from`/`to` are the **resolved absolute window** (relative presets resolved against
    now; Today/This Week/This Month resolved from the period start).
  - `range` / `range-presets` (custom) → `{ type:'absolute', start, end, fromTime, toTime, fromMs, toMs, from, to }`.
  - `field-date` / `field-datetime` → `{ date:<ms>, display }`; `field-time` → `{ time }`.
  - `slider` → `{ startPct, endPct, start, end }` — `start`/`end` are the resolved datetimes at the two
    handle positions.
- **Slider linking:** feed a range picker's `change.fromMs` / `change.toMs` into a slider's
  `range-start` / `range-end`; the slider's window fits around the range and the band snaps to it, so the
  scrubber stays in sync with the picker. Requires **both** props with `end > start`.

## Accessibility

- **Provided by Ant:** `a-date-picker` / `a-time-picker` give a focusable text input + a
  keyboard-navigable calendar/time panel; Escape closes.
- **Verify:** focus-visible ring (**SF-001**) on the inputs and on the TimeRangePicker **preset rows**
  (clickable `<a>`/divs — ensure they're keyboard-reachable and labelled).

## Design tokens used

`--timerange-background-color` · `--timerange-text-color` (pill) · `--dropdown-background` ·
`--dropdown-hover-background` · `--left-menu-text-color-hover` (active preset) · `--border-color` ·
`--primary` · `--primary-alt` · `--calendar-selected-day-background-color` · `--page-background-color` ·
`--neutral-regular` / `--neutral-light` / `--neutral-lightest` / `--page-text-color`.
**Slider:** `--slider-tracker` (band) · `--tooltip-background-color` / `--active-text-color` (handle
tooltip) · `--page-header-padding` (horizontal inset that aligns the timeline with the page header — an
8px inline fallback if the host app doesn't define it).

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low | Noted | `TimeRangePicker` depends on the user-preference store + `datetime` filter + moment → **reference reproduction** in Storybook (live render not feasible, like the Kendo grid). |
| F2 | Low (a11y) | Open | Catalog-wide focus-ring removal (**SF-001**) may affect picker inputs / preset rows. |
| N1 | Info | — | Passing an **empty string** to MTimePicker/MDatePicker `value` renders **"Invalid date"** (it parses `''` via moment) — pass `null`/`undefined` or a moment. |

## Recommended solutions

- **F1:** keep the reproduction; if a headless TimeRangePicker is ever extracted (Vue 3), it could
  render live with an injected format/timezone instead of the store.
- **F2:** adopt the shared `:focus-visible` ring (SF-001).
- **N1:** initialize empty values to `null`, never `''`.

## Do / Don't

- **Do** use TimeRangePicker for chart/dashboard/log windows; `hide-custom-time-range` for
  presets-only; `MDatePicker` **with** `show-time` for date-time form fields; constrain with
  `max-selectable-range-days` / `min-date`. Use `size="lg"` to line the trigger up with 35px toolbar
  buttons and `show-range` to print the resolved window. **Link** a slider to a range picker by feeding
  the picker's `change.fromMs`/`toMs` into the slider's `range-start`/`range-end`.
- **Don't** hand-roll a relative-range dropdown; don't use a bare date picker for chart windows;
  don't pass `''` as a value (Invalid date); don't assume inline/card calendar variants (popup only).
  Don't set only one of `range-start`/`range-end` (the link needs both, `end > start`); don't read
  `CustomEvent.detail` directly — it's array-wrapped (`detail[0]`).

## Related components

`FlotoDropdownPicker` (select) · `FlotoFormItem` (wraps date/time fields in forms) · `MPopover`
(DateTimePopover is built on it).

## Changelog

- **2026-09-07 — TimeRangeSlider is functional + linkable; range trigger `size`/`show-range`.** Made the
  `slider` kind a real, draggable scrubber (band + two handles, DATE axis) and **linkable**: new
  `range-start` / `range-end` props drive its window/band so it tracks a range picker's selection. The
  window fits **around** the linked range (padding = `max(50% span, 6h)`) with an **adaptive** axis
  (`DD/MM` ↔ `HH:MM`), a **4px** band radius, a handle **tooltip that persists while dragging**, and a
  horizontal inset that matches the page header (`--page-header-padding`) with anchored end labels. The
  `range`/`preset` `change` events now carry the **resolved** window (`fromMs` / `toMs` / `from` / `to`),
  so consumers can feed them straight into a linked slider. Also added `size='lg'` (35px trigger) and
  `show-range` (print the resolved absolute range beside the pill). Registry props, tokens
  (`--slider-tracker`, `--tooltip-background-color`, `--active-text-color`), events, and the manifest
  (size/show-range controls + a linked-slider gallery) updated to match.
- **2026-06-15 (sweep recheck — added the missed variant + corrections)** — Owner: the UI doesn't
  match the product and a variant was missed. Full census of every `<MDatePicker>` / `<MTimePicker>` /
  `<TimeRangePicker>` tag found: **(1)** added the **`TimeRangeSlider`** — a draggable **timeline
  scrubber** (dashboard + alert correlation drawer, 2×) — as its own story; **(2)** corrected the
  time-picker story: **no standalone time picker is used** (kit `MTimePicker` *and* custom `TimePicker`
  are 0×; time comes via `show-time` or the range custom view, which uses a **dropdown-based**
  `TimePicker`, not an Ant spinner); **(3)** `excluded-options` is a real variant (**7×**) and
  `hide-icon` (3×), while `only-label`/`daily-rolling` are **0×** (overstated before); **(4)**
  `MDatePicker` has **no** size/format/mode in use; **(5)** flagged **Scheduler/Recurrence**
  (`schedule-input/`, 17 files) as a **separate family**. ⚠️ The TimeRangePicker stories are
  reproductions — pixel-matching the product needs a reference screenshot (requested).
- **2026-06-15** — Added (decision-grade) — the **Date & Time Pickers family** in one entry.
  Established **`TimeRangePicker` (42×)** as the hero (the others are 10×/rare), the **presets list**
  (15 options + Custom), the **emit shape**, and the **`hide-custom-time-range`** presets-only variant
  (24×). Documented that **`MDatePicker` is always a date-*time* field** (all 10 usages pass
  `show-time`). Stories: real `MDatePicker`/`MTimePicker`; **reference reproductions** of the
  TimeRangePicker trigger, presets panel, and custom range (it depends on the store/moment). Verified
  by render+screenshot (every shot opened): MDatePicker calendar themed correctly; caught + fixed
  MTimePicker showing **"Invalid date"** from an empty-string value (→ `null`) and an `<a>` underline
  on preset rows. Findings F1 (reproduction), F2 (SF-001), N1 (empty-string → Invalid date).
