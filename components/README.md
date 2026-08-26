# Component Library — Approach & Plan

How we go from "audited components" to **a full component library in Storybook**
(atoms → molecules → organisms → templates → pages → patterns) and then **a matching
Figma component library** — with Do/Don'ts and usage rules on every component.

Read alongside [`../audit/05-component-atomic-design.md`](../audit/05-component-atomic-design.md)
(the atomic-design audit) and [`inventory.md`](./inventory.md) (the full list).

## Scope — what's IN the library vs what's an example

The product has **~1,345 components** total. Most are app screens/features, not library
parts. The library is the **reusable** set; app screens are **examples**.

| Bucket | Count (approx) | In the library? |
| --- | --- | --- |
| M-kit (`M*`) atoms & molecules | ~69 | ✅ Yes — core |
| `_base-*` / Floto globals | ~44 | ✅ Yes — core |
| Data-pickers | 46 | ✅ As **one** `DataPicker` molecule + a registry (collapse the 46) |
| Data-providers (render-prop logic) | 44 | ⚙️ Documented as a **pattern**, not visual entries |
| Shared subfolder components (filters, crud, hierarchy, item-selection, widgets, common…) | ~part of 424 | ✅ The reusable ones; rest = examples |
| Standalone shared (`color-picker`, `severity-picker`…) | ~39 | ✅ Visual ones; ❌ infra ones (socket/db/screen-blocker) |
| Layouts | 5 | ✅ Templates |
| Module pages (`modules/*/views`) | 238 | 🔶 **Examples** — representative stories only |
| Module components | 575 | 🔶 **Examples** — a few exemplar organisms only |

**Net library size: ~150–250 catalog entries.** Everything else is referenced as an
example or a pattern, never genericized.

## The classification model (recap)

Two axes (from audit 05): **atomic tier** (atom/molecule/organism/template/page/pattern)
× **source layer** (M-kit / Floto+base / Ant 1.x / module). The catalog is **organized
by tier**, and every entry is **tagged with its source layer** and a **status**:

- `core` — formalize and document fully.
- `collapse` — consolidate duplicates into one generic (the 46 pickers).
- `example` — show as a story/pattern, not a standalone library member.
- `infra` — non-visual (sockets, DB, providers) — documented, not in the visual catalog.

## Single source of truth: a component registry

Mirroring the tokens approach (one structured source → many outputs), the catalog is a
**component registry** that feeds Storybook, the AI spec, and the Figma build checklist.

Each entry's schema:

```yaml
- name: FlotoFormItem            # code/API name
  display: Form Field            # human/catalog name
  tier: molecule                 # atom | molecule | organism | template | page | pattern
  source: floto                  # mkit | floto | ant | module
  status: core                   # core | collapse | example | infra
  summary: Labeled field with validation, error, and view-mode.
  anatomy: [label, control, error, info-tooltip]
  composes: [MValidationProvider, MInput, MTooltip]
  props: [value, rules, label, type, is-view, ...]
  variants: [text, textarea, select, ...]
  states: [default, focus, error, disabled, view]
  do: ["Always use for form fields", "Put rules in src/validations.js"]
  dont: ["Don't use a raw <textarea>", "Don't hardcode error text"]
  whenToUse: Any form input that needs a label + validation.
  insteadOf: [raw a-input, MInput alone]
  a11y: [label association, error announced]
  tokensUsed: [color.border.subtle, color.text.severity.critical, space.*]
  storybook: Molecules/Form Field
  figma: { status: todo, component: "Form Field" }
```

The registry is the analog of `tokens/*.json`. From it we generate the AI spec and a
Figma build checklist; Storybook stories link back to it.

## How we add a component (the process)

Every component is onboarded **one at a time** via a deep-dive method — read the source,
gather real usage analytics, measure what actually renders, find inconsistencies, split
reality from intent, theme it, and document findings + solutions. The full repeatable
playbook (with the Button journey as the worked example) is in
[`PROCESS.md`](./PROCESS.md). It's a **living document** — updated as new findings emerge.

## Documentation standard (benchmarked vs leading systems)

How our per-component docs compare to Atlassian, Uber Base, IBM Carbon, Adobe Spectrum,
and Polaris — plus the gaps and the proposed enhanced standard — is in
[`documentation-standard.md`](./documentation-standard.md). It adds sections like
Anatomy, Accessibility, Content, Related, and Changelog while keeping our differentiators
(real usage analytics, findings + solutions, AI registry).

## Per-component spec sheets

Each component gets a detailed **spec sheet** at [`specs/<name>.md`](./specs/) — variants/
sizes/states, **findings & product inconsistencies** (with severity), and **recommended
solutions** per issue. This is the human source of truth per component; the
[`registry/<name>.json`](./registry/) is the compact machine/AI mirror. See
[`specs/README.md`](./specs/README.md). First one: [`specs/button.md`](./specs/button.md).

## Do/Don'ts and usage rules — where they live

- **Per-component Do/Don't + When-to-use** → fields on each registry entry, surfaced in
  that component's Storybook docs page.
- **Cross-cutting usage rules** ("which component when", the layer priority, the
  `MTooltip`/`MCheckbox` overrides, "forms always use `FlotoFormItem`") →
  [`usage-rules.md`](./usage-rules.md) (a decision-guide), built from the existing
  `.claude/rules/component-rules.md` + new decisions. These also become a Storybook
  "Guidelines" section and feed the AI spec.

## Storybook structure (the target)

Sidebar mirrors the tiers exactly:

```text
Foundations/      → tokens (color, type, space, severity, icons) — from the token work
Atoms/            → MButton, MIcon, MTag, Status Tag, …
Molecules/        → Form Field, DataPicker, Pagination, Tabs, Date Picker, …
Organisms/        → Paginated CRUD, Form, Filter Bar, Page Header, Data Grid, …
Templates/        → App Layout, Settings Split-pane, Scroll/Module wrappers, Guards
Patterns/         → List-CRUD page, Form-in-drawer, Master-detail, Dashboard, Empty/Loading
Pages/            → a few representative module screens (examples)
Guidelines/       → usage rules, do/don't, accessibility, contribution
```

Storybook 6.5 (Vue 2 + Webpack 5). Stories import the **real** components, themed
light/dark via the token CSS. Each component gets: a Default story, variant/state
stories, a Docs page (anatomy + props + Do/Don't from the registry).

## Figma library (phase 2)

Mirror the **same tier structure** as Figma pages/sections so code and Figma libraries
are structurally identical. Build each component bound to **Figma variables = our
semantic tokens** (from the token work), with variants matching the registry's
`variants`/`states`. Figma status tracked per entry (`figma.status`).

## Sequence (proposed)

1. **Inventory & classify** — [`inventory.md`](./inventory.md) — the full tiered list. *(this step)*
2. **Sign off scope + tier-boundary rule** — confirm what's `core` vs `example`.
3. **Author the registry + per-component specs** — tier by tier (atoms → patterns),
   each with Do/Don't, when-to-use, anatomy, variants/states. This is the bulk of the
   content and the Storybook docs source.
4. **Write `usage-rules.md`** — the which-component-when decision guide.
5. **Stand up Storybook** — scaffold by tier; Foundations + Atoms first, then up.
6. **Fill stories** tier by tier from the registry/specs.
7. **Figma library** — mirror tiers; build components on token variables.

Tokens (the other workstream) are a dependency for Foundations + theming + Figma
variables — but component inventory/specs can proceed in parallel.

## Open decisions (this step)

See the questions at the end of [`inventory.md`](./inventory.md): scope of "every
component", tier-boundary rule, do/don't depth (per-component vs per-tier to start),
and whether Storybook imports real components or rebuilt ones.
</content>
