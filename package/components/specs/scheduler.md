# Scheduler / Recurrence (`ScheduleInput`) — Spec, Findings & Solutions

| | |
| --- | --- |
| **Tier** | Molecule |
| **Maturity** | 🟢 Stable |
| **Source** | `src/components/schedule-input/index.vue` (`ScheduleInput`) + `once-input.vue` · `weekly-input.vue` · `monthly-input.vue` (sub-forms). |
| **Storybook** | Molecules/Scheduler |
| **Registry** | [`registry/scheduler.json`](../registry/scheduler.json) |
| **Family** | [Scheduler / Recurrence](../family-map.md) |

## Usage analytics

- **16×** across settings & reports: **backups** (`backup-profile-form`,
  `device-inventory-schedule-backup`), **network discovery** (`discovery-schedules`), **compliance
  audits** (`compliance-audit-schedules`), **monitor (re)discovery** (`monitor-schedule-form`,
  `rediscover/custom-schedule-form`, `topology-scanner/schedule-form`), **runbooks**
  (`runbook-schedules`), **reports** (`report-form`), **policies** (`policy-form/basic-info`).
- Built entirely from already-catalogued primitives — it's a **composition**, not a new control.

## Overview

A **recurrence builder**: pick *how often* a job runs and *when*. A **"Scheduler Type"** segmented
control (`MRadioGroup as-button`) — **Once · Daily · Weekly · Monthly** — swaps in a sub-form. This is
distinct from the **Date & Time Pickers** family (which picks a *value* or a *window*); the Scheduler
produces a **recurrence rule**.

## Anatomy

- **Scheduler Type** — segmented `MRadioGroup as-button` (Once/Daily/Weekly/Monthly).
- **Sub-form** (swaps on type):
  - **Once / Daily** → **Start Date** (`MDatePicker`, date-only, `min-date` = today) + **Hours** (the
    custom dropdown `TimePicker` — a `FlotoDropdownPicker` of times, multi-select).
  - **Weekly** → **Days** (`FlotoDropdownPicker`, Mon–Sun multi) + Start Date + Hours.
  - **Monthly** → **Months** (Jan–Dec multi) + **Dates** (1–31 multi) + Start Date + Hours.
- Each field is a **`FlotoFormItem`** with `rules="required"`.

## Options (props)

### ScheduleInput

| Prop | Default | Notes |
| --- | --- | --- |
| `value` | — | v-model; `{ scheduleType, scheduleInfo }` |
| `excludedScheduleOptions` | `[]` | drop types from the control (e.g. `['Weekly','Monthly']`) (1×) |
| `showOnlyOnce` | `false` | collapse to **Once** only (no recurrence) (1×) |
| `disabled` (passthrough) | — | via `$attrs` — disables the fields (2×) |
| `$attrs` → sub-form | — | `disabled` (2×), `time-options` (2×), `use-single-selection` (1×), `hide-date-time` (1×), `multiple` |

### Sub-forms (once / weekly / monthly)

| Prop | Default | Notes |
| --- | --- | --- |
| `value` | — | the `scheduleInfo` object |
| `hideDateTime` | `false` | hide Start Date + Hours |
| `timeOptions` | — | override the Hours options |
| `multiple` | `false` | allow multiple Hours (`use-single-selection` caps to 1) |

## Behaviors

- **Emit:** `{ scheduleType, scheduleInfo: { startDate:<ms>, times:[…], days:[…] (weekly),
  months:[…] + dates:[…] (monthly) } }`. Changing the **type resets** `scheduleInfo` to
  `{ startDate: now }`. Start Date defaults to **today** if unset.
- **`Daily` reuses the `Once` sub-form** (Start Date + Hours) — the difference is the `scheduleType`
  value, not the fields.

## Content & writing

- Field labels are fixed (Scheduler Type, Start Date, Hours, Days, Months, Dates) — keep them.

## Accessibility

- **Provided by** the composed primitives: `MRadioGroup` (radio semantics + arrow-key type selection),
  `MDatePicker` / `FlotoDropdownPicker` (their own a11y), `FlotoFormItem` (labels + required state).
- **Verify:** focus-visible ring (**SF-001**) on the segmented buttons and the selects.

## Design tokens used

Inherits from its primitives — segmented control `--primary` (selected), `--neutral-lightest`
(unselected); fields use `--border-color`, `--page-text-color`, `--neutral-light`. No new tokens.

## Findings & Inconsistencies

| # | Severity | Status | Finding |
| --- | --- | --- | --- |
| F1 | Low | Open | All three sub-forms declare `name: 'OnceForm'` (copy-paste leftover) — should be `WeeklyForm` / `MonthlyForm`. Harmless but confusing. |
| F2 | Low | Noted | `ScheduleInput` pulls the local DB (**lokijs → Node `fs`**) transitively, so it can't render live in Storybook — **reference reproduction** built from the real primitives. |

## Recommended solutions

- **F1:** rename each sub-form's `name` to match its file (`WeeklyForm`, `MonthlyForm`).
- **F2:** if a headless schedule builder is extracted (Vue 3), drop the DB import so it can render
  standalone.

## Do / Don't

- **Do** use for recurring jobs; drop unsupported recurrences with `excluded-schedule-options`; use
  `show-only-once` for a single run.
- **Don't** use it for a plain date/time value (→ `MDatePicker`) or a chart time window
  (→ `TimeRangePicker`); don't hand-roll the Once/Daily/Weekly/Monthly switcher.

## Related components

`MRadioGroup` (segmented type control) · **Date & Time Pickers** (`MDatePicker` / the custom
`TimePicker` it embeds) · `FlotoDropdownPicker` (Days/Months/Dates) · `FlotoFormItem`.

## Checked & scoped out (sweep recheck)

A census of every `<ScheduleInput>` (16×) confirmed the **types are Once/Daily/Weekly/Monthly only**
and accounted for every prop. Deliberately *separate* (not ScheduleInput variants):

- **`MetricPollTime` / `metric-collection-time/*`** — metric **polling-frequency** config (a distinct
  monitoring sub-system) → candidate for a future *Monitoring-config* entry, not job recurrence.
- **`MonitoringHourPicker`** — a monitoring-hours selector.
- **`monitor-schedules.vue`** (`MonitorSchedule`) — a CRUD **list** of schedules (on/off windows) that
  edits via `monitor-schedule-form` → which *uses* `ScheduleInput`; a consumer, not a new component.
- **`'Hourly'`** — a **granularity** option in policy anomaly/forecast conditions (aggregation period),
  **not** a recurrence type.

## Changelog

- **2026-06-16 (sweep recheck)** — Full census of `<ScheduleInput>` (16×): types are **Once/Daily/
  Weekly/Monthly only** (the `'Hourly'` elsewhere is a policy-condition *granularity* dropdown, not a
  recurrence type). Added the missed **`:disabled`** passthrough (2×). Confirmed `MetricPollTime` /
  `MonitoringHourPicker` / `monitor-schedules` (CRUD list) are **separate**, not variants — documented
  in **Checked & scoped out**. No new types/variants missed.
- **2026-06-16** — Added (decision-grade) — the **Scheduler / Recurrence** family (`ScheduleInput`,
  16×). Documented the **Once/Daily/Weekly/Monthly** segmented switcher and each sub-form's fields,
  the **emit shape**, and the `excluded-schedule-options` / `show-only-once` props. Stories built as a
  **reference reproduction** from the real primitives (`MRadioGroup as-button` + `MDatePicker` +
  `FlotoDropdownPicker`) because the live `ScheduleInput` pulls the local DB (lokijs). Verified the
  type-switch swaps the sub-form (Monthly → Months + Dates) and the `scheduleInfo` shape, no console
  errors. Findings F1 (sub-forms all named `OnceForm`), F2 (lokijs → reproduction).
