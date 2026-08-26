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
  variant of the time-range control (square handles, navy track, time-mark ticks).
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
`allow-clear` (× to reset) · `empty` · `placeholder`.

| `kind` | Use when | Product source |
| --- | --- | --- |
| **range** (hero) | pick a time WINDOW for a chart/dashboard/log view — a pill trigger → relative presets → an absolute **Custom** dual-month calendar | `TimeRangePicker` (42×) |
| **range-presets** | the same window picker but **presets only**, no Custom calendar | `hide-custom-time-range` (24×) |
| **field-datetime** | a form field for a **date + time** value | `MDatePicker :show-time` (10×) |
| **field-date** | a form field for a **date-only** value | `MDatePicker` |
| **field-time** | a form field for a **time of day** (12h hh:mm A + clock) | `MTimePicker` (12×) |
| **slider** | a draggable **timeline scrubber** for a range | `TimeRangeSlider` (2×) |

**Decision:** a time WINDOW for charts/logs → `range` (or `range-presets` if no custom calendar needed); a
date/time VALUE in a form → `field-datetime` / `field-date`; a time of day → `field-time`; scrub a timeline → `slider`.

**Functional** (as of 2026-07-14): it reflects the selection to `el.value` (JSON) and emits a **`change`** event
on every pick. Value shape by kind — `range`/`range-presets`: `{type:'relative',key,label,span}` or
`{type:'absolute',start,end,fromTime,toTime}`; `field-date`/`field-datetime`: `{date:<ms>,display}`;
`field-time`: `{time}`; `slider`: `{startPct,endPct,start,end}`. (Per Vue custom-element convention the
`CustomEvent.detail` is array-wrapped — read `detail[0]`.)

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

## Options (props)

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

## Accessibility

- **Provided by Ant:** `a-date-picker` / `a-time-picker` give a focusable text input + a
  keyboard-navigable calendar/time panel; Escape closes.
- **Verify:** focus-visible ring (**SF-001**) on the inputs and on the TimeRangePicker **preset rows**
  (clickable `<a>`/divs — ensure they're keyboard-reachable and labelled).

## Design tokens used

`--timerange-background-color` · `--timerange-text-color` (pill) · `--dropdown-background` ·
`--dropdown-hover-background` · `--left-menu-text-color-hover` (active preset) · `--border-color` ·
`--primary` · `--calendar-selected-day-background-color` · `--tag-bg` (calendar range) ·
`--secondary-red` (error) · `--neutral-light` / `--neutral-lightest` / `--page-text-color`.

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
  `max-selectable-range-days` / `min-date`.
- **Don't** hand-roll a relative-range dropdown; don't use a bare date picker for chart windows;
  don't pass `''` as a value (Invalid date); don't assume inline/card calendar variants (popup only).

## Related components

`FlotoDropdownPicker` (select) · `FlotoFormItem` (wraps date/time fields in forms) · `MPopover`
(DateTimePopover is built on it).

## Changelog

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
