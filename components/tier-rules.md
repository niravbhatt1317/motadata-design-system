# Tier Classification Rule

The rule for deciding a component's atomic tier. Defined from the actual use cases in
this product, so the boundaries are practical, not academic. **Living document — tweak
as we hit cases that don't fit.** Authoritative over provisional placements in
[`inventory.md`](./inventory.md).

## The rule (apply top-down, first match wins)

Ask these in order; the first "yes" sets the tier.

1. **Is it page-level structure with no business content?** — defines regions/slots,
   scrolling, error boundary, or an access guard. → **TEMPLATE**
   *(layouts, FlotoModule, FlotoScrollView, permission/license gates)*

2. **Does it own data/API, non-trivial state, or orchestration — OR compose two or
   more molecules into a recognizable section?** → **ORGANISM**
   *(FlotoPaginatedCrud, FlotoForm, MGrid, FlotoFilterBar, item-selection panels)*

3. **Does it compose atoms into ONE single-purpose control or display, with at most
   trivial UI state (open/hover/selected) and no domain data?** → **MOLECULE**
   *(FlotoFormItem, MSelect, FlotoStatusTag, MPagination, picker triggers)*

4. **Is it a single, indivisible element** that can't be split into smaller catalog
   parts and still mean anything? → **ATOM**
   *(MButton, MIcon, MTag, MCheckbox, spinner, status arrow, avatar)*

Above the component tiers:

- **PAGE** — a concrete screen: a template filled with real organisms + data (module
  views). Library = *examples only*.
- **PATTERN** — a documented *recipe* for composing the tiers for a recurring need
  (CRUD page, form-in-drawer). Not a component.

## The two discriminators that do the real work

Most disagreements come down to two tests:

- **Composition test** — how many *catalog* components does it assemble? 0 → atom;
  a few atoms, one job → molecule; ≥2 molecules into a section → organism.
- **Ownership test** — does it own **domain data / API / non-trivial state /
  orchestration**? If yes, it's at least an **organism**, regardless of size.

Two clarifications that matter here:

- **Size ≠ tier.** A 50 KB illustrated empty-state is still a molecule if it's one
  display with no state. (Corrects an earlier "template" guess for `FlotoNoData`.)
- **"Owns data" means the component itself fetches/holds domain data.** A component that
  *receives* data via props stays lower-tier. This is why the generic **DataPicker**
  (data passed in) is a molecule, while the 46 domain pickers that fetch their own
  options are organism-flavored — and exactly why we collapse them into one molecule
  fed by the provider layer.

## Boundary cases — decided by the rule

| Component | Test that decides | Tier | Was (provisional) |
| --- | --- | --- | --- |
| `FlotoFormItem` | composes atoms, one control, no data | **Molecule** | molecule ✓ |
| `FlotoDropdownPicker` | one control; owns only selection/open UI state; data passed in | **Molecule** (complex) | molecule ✓ |
| domain pickers (46) | each fetches its own options (owns data) | organism-flavored → **collapse** to one molecule `DataPicker` | molecule |
| `FlotoPageHeader` | composes atoms + slots; no state; one job (page title bar) | **Molecule** | organism → **moved** |
| `FlotoConfirmModal` | one job (confirm); trivial open state; composes atoms | **Molecule** | organism → **moved** |
| `FlotoContentLoader` | one job (loading veil); wraps a spinner atom | **Molecule** | organism → **moved** |
| `FlotoNoData` / `FlotoModuleNoData` | one display; no state (size irrelevant) | **Molecule** | organism → **moved** |
| `FlotoForm` | owns validation orchestration + submit state | **Organism** | organism ✓ |
| `MGrid` / `MServerGrid` | sorting/selection state; ServerGrid fetches | **Organism** | organism ✓ |
| `FlotoPaginatedCrud` | owns CRUD state + API; composes ≥2 organisms | **Organism** | organism ✓ |
| `FlotoBulkActionBar` | composes molecules; owns selection context | **Organism** | organism ✓ |

The four **moved** rows (PageHeader, ConfirmModal, ContentLoader, NoData) are the rule
doing its job — they'll be reconciled in `inventory.md` when we author the per-tier
specs.

## Edge guidance (to extend as we go)

- **Wrappers/HOCs & providers** (render-prop data-providers) — not visual tiers;
  documented as the **provider pattern** (infra), not atoms/molecules.
- **Overlays** (modal/drawer/tooltip/popover) — molecules by default (one job, trivial
  open state); become organisms only when they own data/orchestration.
- **Grids/tables** — organisms (they own sort/select/paginate state).
- **A form *field*** is a molecule; a **form** (orchestration) is an organism.

## How we use it

Each component's registry entry records its tier per this rule. When a case feels wrong,
we change the *rule* (and note why) rather than making one-off exceptions — that keeps
the taxonomy honest.
</content>
