# Component Specs (one file per component)

The detailed, human-readable home for **each component** — everything we learn about it
in one place, so we don't drown in scattered notes.

Each `specs/<name>.md` follows the [enhanced standard](../documentation-standard.md)
(benchmarked vs Atlassian / Uber Base / Carbon / Spectrum / Polaris):

1. **Header** — tier, **maturity** badge (🟢 stable / 🟡 evolving / 🔴 deprecated), source,
   Storybook + registry + Figma links.
2. **Usage analytics** *(our differentiator)* — real counts (total, per variant/size).
3. **Overview** — what it is, how it works, when to use.
4. **Anatomy** — labeled parts.
5. **Options** — variants / sizes / states (with measured rendering).
6. **Behaviors** — overflow, loading, responsive, interaction nuances.
7. **Content & writing** — label conventions, tone.
8. **Accessibility** — keyboard, screen-reader/ARIA, target size, contrast (both themes).
9. **Props / API** — table (mirrors the registry).
10. **Design tokens used**.
11. **Findings & Inconsistencies** *(our differentiator)* — severity + status.
12. **Recommended solutions** — concrete fix per finding (with code).
13. **Do / Don't**.
14. **Related components** — cross-links.
15. **Changelog** — dated entries.

Relationship to other files:

- `specs/<name>.md` (here) = the **human source of truth** per component.
- `../registry/<name>.json` = the compact **machine/AI-readable** mirror (props, do/don't,
  knownIssues). Kept in sync with the spec.
- The Storybook story renders it live; this doc explains it.

## Index

| Component | Tier | Spec | Findings | Status |
| --- | --- | --- | --- | --- |
| [Button](./button.md) | atom | ✅ full standard | navy allow-list (F1); no focus ring (F3); target sizes (F4) | documented |
| [Checkbox](./checkbox.md) | atom | ✅ full standard | Floto override (F1); **SR state not bound (F3, a11y)**; indeterminate not exposed (F4) | documented |
| [Switch](./switch.md) | atom | ✅ full standard | `defaultChecked` no-op (F1); knob-only state (F2); no focus ring (F3); off-state `aria-checked` (F4) | documented |
| [Radio](./radio.md) | atom | ✅ full standard | standalone `MRadio`/variants dead (F1); `buttonStyle` outline unused (F2); no focus ring (F3); **segmented style context-dependent (F4)** | documented |
| [Link](./link.md) | atom | ✅ full standard | `as-button` not a real link (F1, a11y); no default affordance (F2); **external links lack `rel` — SF-004 (F3)** | documented |
| [Input](./input.md) | atom | ✅ full standard | v-model event is `update` not `input` (F1); `type=password` no show/hide (F2); no focus ring (F3) | documented |
| [Select](./select.md) | atom | ✅ full standard (⚠️ low-use) | superseded by DropdownPicker 2× vs 510× (F1); **accessible combobox while DropdownPicker isn't (F2)**; no focus ring (F3); clear × blank (F4) + overlaps chevron (F5) | documented |
| [Tag](./tag.md) | atom | ✅ full standard | **colored variants illegible (F2)**; **remove × not keyboard-accessible (F4, a11y)**; `closable` default true (F5); class typo (F3); status label inversion (F7) | documented |
| [Form Field](./form-item.md) | molecule | ✅ full standard | `required` derived from rules not a prop (F1); error message pristine-gated (F2); no focus ring (F3) | documented |
| [LooseTags](./loose-tags.md) | molecule | ✅ full standard | placeholder ignored in editable mode (F1); case differs by mode (F2); dead `sm`/`size` (F3); fetch has no `.catch` (F4) | documented |
| [TagsList](./tags-list.md) | molecule | ✅ full standard | ⚠️ **dead code, 0 usages (F1)**; count-only overflow vs live idiom (F2) | documented (badged unused) |
| [DropdownPicker](./dropdown-picker.md) | organism | ✅ full standard | **not an accessible combobox (F1, a11y, High)**; `maxAllowedSelection` dead (F2); boolean defaults true (F3); loose option schema (F4) | documented |
| [Modal](./modal.md) | organism | ✅ full standard | no × / no backdrop-close — footer/Escape only (F1, UX/a11y); no focus ring (F2); `scrollable-modal` body has no overflow (F3) | documented |
| [Drawer](./drawer.md) | organism | ✅ full standard | `@hide` delayed ~500ms (F1); no focus ring (F2) | documented |
| [Tooltip](./tooltip.md) | molecule | ✅ full standard | dead `trigger` prop (F1); no focus ring (F2); **no `aria-describedby` / icon trigger unnamed (F3, a11y)** | documented |
| [Popover](./popover.md) | molecule | ✅ full standard | one-way `visible` (F1); **no disclosure ARIA / focus trap (F2, a11y)**; no focus ring (F3) | documented |
| [Table / Grid](./table.md) | organism | ✅ full standard | heavy (Kendo + workers → reproductions) (F1); **a11y: verify roles/`aria-sort`/`aria-selected`/focus (F2)** | documented |
| [Filters](./filters.md) | molecule | ✅ full standard | reproductions (FilterCondition 500+ ln) (F1); taxonomy note (N1) | documented |
| [Toolbars](./toolbars.md) | organism | ✅ full standard | reproductions (F1); a11y: focus ring + icon-button labels (F2) | documented |
| [Date & Time Pickers](./date-time-pickers.md) | molecule | ✅ full standard | reproductions (store/moment) (F1); a11y focus ring (F2); empty-string→Invalid date (N1) | documented |
| [Scheduler](./scheduler.md) | molecule | ✅ full standard | sub-forms mis-named OnceForm (F1); lokijs → reproduction (F2) | documented |
| [Tabs](./tabs.md) | molecule | ✅ full standard | line/top/default only; focus ring (F1) | documented |

(Rows added as each component is specced. Tracking list: [`../inventory.md`](../inventory.md).)

## Severity labels (for findings)

- **High** — visibly wrong / breaks the design intent (e.g. a used variant renders wrong).
- **Medium** — inconsistency or ambiguity that should be resolved.
- **Low** — cosmetic / nice-to-have / cleanup.

## Finding status

`Open` (found, no decision) · `Proposed` (fix suggested, needs approval) ·
`Approved` (decided, not yet applied) · `Fixed` (applied) · `Won't fix` (accepted as-is).
</content>
