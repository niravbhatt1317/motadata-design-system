# Component Onboarding Process

The repeatable method for bringing **one component at a time** into the design system —
researched deeply, verified against reality, and documented with findings + solutions.
This is a **living document**: update it whenever a new component reveals a step, a
pitfall, or a better technique.

> **Rule: one component at a time.** Research and analyse thoroughly *before* adding.
> The full product source is available — use it. Never assume; verify.

> **This process is now executable via the `storybook-component` skill**
> (`.claude/skills/storybook-component/`): it orchestrates these phases, enforces the decision-grade
> Usage rule + the "four pages move together" rule, and gates "done" with `gate.mjs` (render +
> completeness + coverage-count integrity). Use it to catalogue/update a component; this doc remains
> the reference for the *why* behind each step.

## Principles

1. **The codebase is the source of truth.** Read the component, its styles, and its real
   usage — don't trust names, docs, or assumptions.
2. **Verify what actually renders.** A variant/size/state only "exists" if it renders
   distinctly; measure it (headless computed styles), don't eyeball it.
3. **Expect inconsistencies.** Real products drift. When intent ≠ reality, that's a
   *finding* to document and solve, not something to hide. (See Button F1.)
4. **Separate reality from intent.** If some variants work and others fall back, split
   them (e.g. Button "distinct" vs "navy fallback") so the catalog is honest.
5. **Light + dark are both first-class.** Verify the component in both themes.
6. **Document findings AND solutions.** Each issue gets a severity, a status, and a
   concrete fix proposal — actionable, not just observed.
7. **The API is props + slots + events + consumer-applied CSS classes.** Don't equate a
   component's API with its props — styling/state classes applied via `class=` are often
   the real, dominant API (Tag's `tag-red`/`tag-green` were used far more than its
   `variant` prop). Always look for both.
8. **A concept is a family, not one component.** Enumerate every component/treatment that
   renders the concept (and styling that lives in other files) before scoping — e.g. "Tag"
   = `MTag` + `MStatusTag` + picker `SelectedItemPills` (+N overflow) + `LooseTags` +
   `TagsList` + `main-tags` styling. Family-first, then decide scope.
9. **Classify each family member by what it IS — don't mirror the code 1:1.** Once the
   family is enumerated, sort each member into one of three buckets (decision D12):

   | Bucket | Test | Catalog home |
   | --- | --- | --- |
   | **Own entry** | distinct *usage decision* AND distinct API | new atom/molecule page (filed by what it is — a tag *input* goes under Forms, not under Tag) |
   | **Variant of the base** | same component, just restyled by prop/class — no new mental model | a story + spec section *under* the base |
   | **Internal part** | only ever exists *inside* a bigger component | documented in that parent's spec |

   **Tie-breaker:** a member earns its own page *only* if it has a distinct usage decision
   **and** a distinct API; otherwise it's a variant of the base. This prevents both catalog
   bloat (a page per near-duplicate) and hiding (real components buried as footnotes).
   *(Tag family applied: `MTag` = base; `tag-*` colours + `MStatusTag` = variants of Tag;
   `SelectedItemPills`/triggers = internal parts of DropdownPicker; `LooseTags` = its own
   entry under Forms; `TagsList` = a usage pattern.)*

## The phases

### Phase 0 — Pick & scope (incl. the FAMILY) → record in the [Family Map](./family-map.md)

- Choose the next component (see [`inventory.md`](./inventory.md)); confirm its tier via
  [`tier-rules.md`](./tier-rules.md).
- **Enumerate the family — a concept is rarely one component.** Before diving, grep the
  WHOLE repo for everything that renders the concept, not just the named component:
  related components, sibling treatments, and styling that lives in *other* files. Decide
  what's in scope vs gets its own spec, and record the family.

  ```bash
  # components/classes/tokens for the concept (e.g. "tag")
  ls src/components | grep -i tag;  grep -rln "name: '.*Tag'" src/components
  grep -rohiE "name: '[A-Za-z]*tag[A-Za-z]*'" src/ ui/          # kit + app members
  grep -rohE "class=\"[^\"]*tag[^\"]*\"" src/ | grep -oE "[a-z-]*tag[a-z-]*" | sort -u
  grep -rn "main-tags\|ant-tag-has-color" src/design   # styling can live outside <concept>.less!
  # USAGE per member drives order — get counts now, not later
  for c in MTag MStatusTag LooseTags TagsList; do echo "$c $(grep -rohE "<$c" src/|wc -l)"; done
  ```

  *(Tag was first specced as only `MTag` — missing `MStatusTag`, the teal picker
  `SelectedItemPills` + `+N` overflow, `LooseTags`, `TagsList`, and the `main-tags`
  styling in `input.less`. Family-first prevents that. The Button back-check later found a
  missed **icon/`shape="circle"` variant used 218×** for the same reason.)*

- **Plan the whole family ONCE in the [Family Map](./family-map.md)** — every member with its
  tier, **usage count**, classification (D12: base/variant/internal/own-entry/dead), and
  status. This is the anti-re-audit guarantee: once a family is mapped, picking up any member
  later means reading its row, not re-sweeping the repo.
- **Add order within a family (so we add the family without re-checking each time):**
  - **Batch `variant` + `internal` members WITH the base, same pass** — warm context, cheap,
    and this is where almost all "misses" hide (Tag colours/status, Button icon/shape, picker
    pills). Don't ship the base without sweeping its variants/internal parts.
  - **`own-entry` members are their own scheduled items**, ordered by **usage × tier ×
    priority** — added soon, but *not* blindly forced immediately (don't jam an organism right
    after a tiny atom just because they're related; e.g. Tag → DropdownPicker).
  - **`dead`/unused members** are documented (badged unused), never built.

### Phase 1 — Deep-dive research (don't skip)

- **Read the component source** — props, `model` (v-model prop/event), events, slots,
  and *how* variants/sizes are applied (e.g. Button routes `variant` to either Ant `type`
  or a `.button-*` class). This routing is often where bugs hide.
- **Read its styles** — the kit override (`ui/style/override/*.less`) **and** the app
  design layer (`src/design/*.less`). Find the real variant/size classes and any
  high-specificity rules / allow-lists.
- **⚠️ A component's API ≠ just its props.** Capture ALL the ways it varies:
  **props/variants · slots · events · AND consumer-applied CSS classes.** Many components
  are coloured/sized/state-d by **standalone classes** the consumer puts on `class=`
  (e.g. Tag's `tag-red`/`tag-green`/`.new`, `.button-shadow`) — *not* a prop. Scan the
  component's LESS for standalone class selectors (`.foo`, `.tag-*`, `.x-state`) that
  aren't generated from a prop; these are a **parallel styling API** and are easy to miss.
  *(This is exactly how the Tag colour classes were missed once.)*
- **⚙️ Run the component sweep first.** Either the **`/component-sweep <Tag>`** skill
  (`.claude/skills/component-sweep/`) or the script directly:
  [`../scripts/component-sweep.sh <Tag> [--source <file>]`](../scripts/component-sweep.sh). It does
  §1–9 mechanically (usage, by-module, **prop-value distributions**, boolean props, consumer classes,
  slots, events, family files, declared API). For concepts with multiple render mechanisms (tooltips,
  charts, menus, overlays), follow with the **agent fan-out**. Full method + worked example:
  [`component-sweep.md`](./component-sweep.md). The bullets below are what that sweep covers.
- **⚠️ Sweep the VALUE DISTRIBUTION of every prop — discover values, don't assume a list.**
  This is where **config-variants** hide (`width="96%"`, `overlay-class-name="hide-footer"`,
  `mode="tags"`, `shape="circle"`). Don't iterate a *known* list of values — **extract the
  distinct values actually passed and their counts**, then treat every distinct value (and
  every consumer class / wrapper context) as a candidate variant:

  ```bash
  # DISCOVER the values passed to each interesting prop (width, size, mode, placement,
  # overlay-class-name, variant, shape, type, …) — sort | uniq -c reveals the variants:
  grep -rohE "<MComponent\b[^>]*\bwidth=\"[^\"]+\"" src/ | grep -oE "width=\"[^\"]+\"" | sort | uniq -c | sort -rn
  grep -rohE "overlay-class-name=\"[^\"]+\"" src/ | sort | uniq -c | sort -rn   # hidden style variants
  # component total + file spread + consumer styling classes
  grep -rohE "<MComponent" src/ | wc -l;  grep -rlE "<MComponent" src/ | wc -l
  for c in tag-red tag-green ...; do echo "$c $(grep -rohE "[\"' ]$c[\"' ]" src/ | wc -l)"; done
  ```

  Record the distribution in the spec + registry. **Every distinct prop value is a variant
  until proven otherwise.** *(This is exactly how the full-screen Drawer (`width="96%"`, 90% ×24),
  the Modal overlay classes (`hide-footer`/`scrollable-modal`), Button `shape="circle"`, and
  MSelect `mode="tags"` were each missed once — counts were gathered, value-distributions were not.)*
- **READ 3–5 REAL product instances end-to-end** (the actual `<Component …>…</Component>` blocks
  in product files — `grep -rln "<Component" src | head`, then open them). The kit **source** tells
  you what's *possible*; **real instances** tell you what's *normal* — the header/footer structure,
  spacing (`mr-2`), realistic content density, multi-pane layouts, the common width/config. **Build
  the Basic story to mirror a real instance, not a placeholder.** *(The Modal header pattern, the
  drawer footer `mr-2`, and the 96% multi-pane drawer all live in real instances I didn't read.)*
- **Map the full surface:** variants, sizes, states, **prop-value distributions**, props, slots,
  events, **consumer-applied styling classes**, AND **wrapper/context classes** (`overlay-class-name`,
  parent `.material-input`/`.has-error` contexts).

### Phase 2 — Verify what actually renders

- Write the Storybook stories (Playground + showcase: Variants/Types, Sizes, States) — **plus a
  story per config-variant found in the value-distribution sweep** (each notable `width`,
  `overlay-class-name`, `mode`, …) and a **realistic** Basic story mirroring a real instance.
- **Headless-capture computed styles** per variant/size with the harness
  (`tmp/variant-colors.js` style script): background/border/font/radius/height.
- Compare to product tokens. Note which render **distinctly** vs **fall back** vs
  **identical** (dup).
- **Fidelity is vs the REAL instance, not just the stylesheet.** "Matches `modal.less`" ≠ "looks
  like the product" if the demo's *config/content* isn't representative. Reproduce the common
  real configuration (realistic content, common width, the product header/footer pattern); where
  possible diff against a product screenshot. *(Verifying the box, not the picture, is how the
  bare-paragraph modal and the default-width drawer looked "off" despite matching the CSS.)*

### Phase 3 — Reconcile findings

- Cross-reference renders against **usage counts** (a broken variant used 77× = High).
- Split the surface: **works** vs **known-issue/fallback** vs **unused**.
- Determine *why* (specificity, allow-lists, load order, token resolution) — quote the
  offending rule.

### Phase 4 — Author outputs

- **Storybook structure (Option B — sidebar sub-pages):** each component is a group with
  - `Atoms/<Name>/Examples` — the CSF story file (Playground + variant/size/state stories,
    incl. a labelled "known issue" story for fallbacks); slim Docs description.
  - `Atoms/<Name>/Usage` — MDX (`<Meta title="Atoms/<Name>/Usage"/>`): overview, anatomy,
    **decision-grade usage** (a *decision flow* where the first match wins + **per-option
    use-case cards**: Use when / Don't / Example for EVERY variant/type/modifier), content,
    related. See [documentation-standard.md §6](./documentation-standard.md). Ground "use
    when"/examples in real product usage (mine where each option is actually used). Mirror the
    rules in the registry as `decisionFlow` + `usageRules` so AI picks the same option.
  - `Atoms/<Name>/Accessibility` — MDX: keyboard/SR/target-size/contrast + a11y gotchas.
  - `Atoms/<Name>/Changelog` — MDX: dated entries.
  Page order is enforced by the `storySort` comparator in `.storybook/preview.js`
  (Examples → Usage → Accessibility → Changelog). Surface only **a11y** known-issues in
  Storybook; styling inconsistencies stay in the spec sheet.
- **⚠️ The four pages move together — ALWAYS update Usage + Changelog when you touch a component.**
  Adding/changing **anything** inside an already-shipped component — a new variant, a new story, a
  fixed fidelity issue, a renamed class — is **not done** until you also update **both** Storybook
  MDX pages, not just the `.js`:
  1. **`<Name>/Usage`** — add the new variant/type as a **use-case card** (Use when / How / As seen
     in) and reference its story by name. Keep the decision flow in sync.
  2. **`<Name>/Changelog`** — add a **dated entry** describing what changed and why.
  3. Keep the **spec `.md` changelog** + **registry** in sync too (they mirror, but the Storybook
     **Changelog MDX is the page designers read** — don't update only the spec).
  A new Examples story with no Usage card and no Changelog line is an **incomplete change**.
- **Spec sheet** [`specs/<name>.md`](./specs/) — the full
  [documentation standard](./documentation-standard.md): header+maturity, usage analytics,
  overview, **anatomy**, options (measured), **behaviors**, **content & writing**,
  **accessibility** (keyboard/SR/ARIA/target-size/contrast — probe the rendered element,
  don't assume), API, **tokens used**, Findings (severity+status), **solutions**,
  Do/Don't, **related**, **changelog**.
- **Registry** [`registry/<name>.json`](./registry/) — machine mirror: props, enums,
  `usage`, `do`/`dont`, `knownIssues`.

### Phase 5 — Theme + render verification

- Headless-verify **all** stories render (no console errors) — `tmp/verify-batch.js`.
- **📸 Screenshot the rendered story and VISUALLY diff it vs the product** (Playwright
  `page.screenshot` → read the image) — *before* claiming a match. Token/computed-style checks
  pass while the thing still looks wrong (padding, spacing, proportion are what the eye reads).
  Iterate: fix → re-shoot → compare. Measuring is necessary but **never sufficient** for fidelity.
- Capture **light and dark** and confirm the component re-themes (e.g. Button primary
  flips white-on-navy in dark; Checkbox fill `#fff → #2b394f`). **Since the dark-mode
  addon replaced the URL theme global, verify dark by setting `data-theme="dark-theme"`
  directly in the page (Playwright `evaluate`), not `?globals=theme:…`.** **Measure CONTRAST in
  BOTH themes, don't just eyeball one.** ⚠️ **Fixed-surface overlays** (tooltips, graph/topology
  tooltips — `--tooltip-background-color` / `--topology-graph-tooltip-bg` are **dark in both
  themes**) must use **light-in-both text** (`--tooltip-text-color`), NOT `--page-text-color`
  (which flips dark in light theme → invisible on the dark overlay). Token that *flips* (e.g.
  `--chart-tooltip-background`) → `--page-text-color` is correct; token *fixed-dark* → light text.
- **Registration parity:** confirm Storybook renders the SAME implementation the product
  ships. Some `M*` are **overridden** — `main.js` excludes them from the kit and registers
  a Floto `_base-*.vue` instead (e.g. `MCheckbox`, `MTooltip`). The preview must replicate
  that (exclude + register the override) or it shows the wrong component with the wrong API.

### Phase 6 — Deploy + log

- Deploy (`scripts/deploy-gh-pages.sh …`); spot-check the live URL.
- Update [`PROGRESS.md`](../PROGRESS.md), the [`specs/README.md`](./specs/README.md)
  index, and the [`registry/README.md`](./registry/README.md) coverage table.

## Output checklist (per component)

- [ ] **Family enumerated + recorded in the [Family Map](./family-map.md)** (every member with
      tier, usage, classification, status); variants/internal parts batched with the base.
- [ ] Source + styles read; routing of variants/sizes understood.
- [ ] **Class-based styling API captured** (standalone colour/state/size classes from the
      LESS, not just props) — and showcased if real.
- [ ] Usage analytics captured (total, per-variant, per-size/modifier, **per styling
      class**; shared flagged).
- [ ] **Prop-value distribution swept** — for every prop, the *actual values* passed + counts
      (`grep -oE 'prop="[^"]+"' | sort | uniq -c`); every distinct value treated as a candidate
      variant (e.g. `width="96%"`, `overlay-class-name="hide-footer"`, `mode="tags"`).
- [ ] **3–5 real product instances read end-to-end**; the Basic story mirrors a real instance
      (realistic content + common config), not a placeholder.
- [ ] Stories: Playground + Variants/Sizes/States **+ a story per config-variant** (+ known-issue
      story if needed).
- [ ] Computed styles measured; distinct vs fallback vs unused classified. **Fidelity checked vs
      a real instance/screenshot, not just the stylesheet.**
- [ ] Findings written with severity + status + concrete solutions.
- [ ] Spec sheet + registry JSON authored and in sync.
- [ ] **Usage is decision-grade** — decision flow (first match wins) + per-option use-case
      cards (Use when / Don't / Example), mirrored in registry `decisionFlow` + `usageRules`.
- [ ] **Usage MDX + Changelog MDX updated** — every new variant/story has a use-case card in the
      `Usage` page AND a dated entry in the `Changelog` page (not just the spec `.md`). The four
      pages move together; a story with no Usage card / no Changelog line is incomplete.
- [ ] Light + dark verified; all stories render clean.
- [ ] Deployed; indexes + PROGRESS updated.

## Worked example — Button (the journey this process distills)

1. Added all variants as Controls → looked fine on the surface.
2. **Owner: "still missing types/sizes."** Added explicit Variants/Sizes/States stories.
3. **Owner: still off.** Dug into `Button.vue` → found `variant` routes to Ant `type` for
   5 values and to `.button-*` classes for the rest.
4. **Measured** every variant's computed colour → found `info`, `neutral`, `neutral-light`,
   `warning` render **navy**, not their own colour.
5. **Dug deeper** → `src/design/buttons.less` has a high-specificity `:not(...)` allow-list;
   those variants aren't on it. Cross-referenced usage → `neutral` is used **77×** yet
   renders navy = **High-severity product inconsistency**.
6. **Split** the catalog: distinct variants vs a flagged **"navy fallback (known issue)"**
   story; also found `primary-alt` (36×) was **missing**, and `success/error` colours
   depended on stylesheet load order.
7. **Theme:** verified light/dark (primary flips white-on-navy in dark).
8. **Documented** everything in `specs/button.md` (findings F1/F2 + 3 solution options) and
   `registry/button.json` (usage + knownIssues).

That loop — add → notice gaps → read source → measure → find the rule → reconcile with
usage → split → theme → document — is the process. Apply it to every component.

## Updating this process — and BACKFILLING when the standard changes

When a component teaches us something new (a new pitfall, a better measurement, a class of
inconsistency), add it here. The process should get sharper over time.

**Standard-evolution rule (required):** when we raise the bar — a new required section, a new
artifact, a better format (e.g. decision-grade Usage, the Family Map, Tailwind fidelity) —
it applies to **every component, not just the next one**. So:

- **Backfill existing components** to the new standard so the catalog stays consistent
  (don't leave a mix of old/new quality). Track the backfill in `PROGRESS.md`.
- **Add/refresh the requirement here and in [`documentation-standard.md`](./documentation-standard.md)**
  so the next component is authored to it by default.
- The output checklist below is the gate — a component isn't "done" until it meets the
  *current* standard, and a standard change re-opens the gate for already-done components.

Practically: when you finish a component, also confirm the earlier ones still pass the
current checklist; if a recent standard change left gaps, schedule/queue the backfill.
</content>
