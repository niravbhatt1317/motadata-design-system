# Component Documentation — Benchmark, Gaps & Proposed Standard

Researched how leading design systems document a component, compared it to what we
currently produce, and proposed an enhanced per-component documentation standard.

## 1. How the leading systems structure a component page

| System | Section structure (per component) |
| --- | --- |
| **Atlassian** | **Examples** (live, interactive, per variant/state, with code) · **Code** (props/API reference) · **Usage** (when to use, do/don't with image pairs, content) · Accessibility woven in · **Releases/Changelog** (per package, versioned) · **Related** family pages (icon button, link button, split button, button group) |
| **Uber Base** | **Types** (emphasis/role) · **Variants** (intent) · **Sizes** (large/medium/small/xSmall) · **Shapes** (rect/rounded) · **Fill vs Hug** · **Accessibility** (explicit target sizes: 48×48 tap, 28×28 click) · **Content** (concise action labels: "Save"/"Edit") · per-component **tokens** + Figma + Code |
| **IBM Carbon** | 4 tabs: **Usage** (when, variants, states, do/don't) · **Style** (color, type, exact spacing/measurements) · **Code** (multi-framework, props, live Storybook) · **Accessibility** (keyboard, screen reader, WCAG, focus) |
| **Adobe Spectrum** | **Overview/Usage** · **Anatomy** (labeled parts) · **Options** (sizes/variants) · **States** · **Behaviors** (overflow, truncation, methods) · **Accessibility** (keyboard interactions, ARIA) · **Content standards** (writing) · **Internationalization** (RTL) · **Changelog** |
| **Shopify Polaris** | Live **Examples** (code toggle, framework) · **Props** (API) · **Best practices** (do/don't) · strong **Content guidelines** (voice/tone/grammar, error messages) · **Related components** · accessibility recommendations · Figma kit |

**The common vocabulary (union of the best):**

1. Examples (live, interactive, per variant/size/state)
2. Code (copyable, ideally per framework)
3. Usage / When-to-use (do's & don'ts, often visual pairs)
4. Anatomy (labeled parts diagram)
5. Options — variants / sizes / states (the full surface)
6. Behaviors (overflow, truncation, loading, responsive, interaction nuances)
7. Content / writing guidelines (labels, tone, capitalization)
8. Accessibility (keyboard, screen-reader/ARIA, target sizes, contrast, focus)
9. Props / API reference (table)
10. Design tokens used (per component)
11. Related components (cross-links / family)
12. Changelog / version history
13. Status / maturity (experimental · stable · deprecated)
14. Figma / design resources link
15. Internationalization / RTL (some systems)

## 2. What we produce today

| Artifact | Covers |
| --- | --- |
| **Storybook** (story file) | Examples (Playground + Variants/Sizes/States) · Code ("Show code") · live Controls · Docs page with do/don't + args table · light/dark |
| **Spec sheet** `specs/<name>.md` | Overview · **Usage analytics (real counts)** · Variants/Sizes/States tables (measured colors) · Props · **Findings & inconsistencies** · **Recommended solutions** · Do/Don't |
| **Registry** `registry/<name>.json` | Machine/AI spec — props/enums · do/don't · tokensUsed · usage · knownIssues · figma status |

## 3. Gap analysis

| Section | Us | Notes |
| --- | --- | --- |
| Examples (live) | ✅ | Storybook Playground + showcase stories |
| Code | ✅ | Storybook "Show code" (Vue) |
| Usage / do-don't | ✅ | In spec + Storybook docs |
| Options (variants/sizes/states) | ✅ | Spec tables + stories (with measured reality) |
| Props / API | ✅ | Registry + Storybook args table |
| Tokens used | ◑ | In registry; not surfaced visually in the doc |
| **Anatomy (labeled parts)** | ❌ | **Gap** — no parts diagram |
| **Accessibility** | ❌ | **Big gap** — no keyboard/SR/ARIA/target-size/contrast section |
| **Content / writing guidelines** | ❌ | **Gap** — no label/tone conventions |
| **Behaviors** (overflow, truncation, responsive) | ◑ | Partial; not systematic |
| **Changelog / version history** | ❌ | **Gap** (owner specifically called this out) |
| **Related components** | ◑ | Some inline mentions; not a standard cross-link block |
| **Status / maturity** | ◑ | `status: core` in registry; not surfaced as a maturity badge |
| **Figma link** | ◑ | `figma.status` tracked; library not built yet |
| Internationalization / RTL | ❌ | Lower priority for now |

### Where we are already AHEAD of public systems

- **Real usage analytics** — "used 1,373× across 424 files; per-variant counts." Almost no
  public DS shows this. It's a superpower of documenting a *living* product and drives
  prioritization + "which variant actually matters."
- **Findings + product inconsistencies + recommended solutions** — public systems document
  the *ideal*; we surface the *real* gaps (navy allow-list, kit-vs-Floto overrides) with
  fixes. This is the audit value.
- **Machine/AI-readable registry** — purpose-built so AI tools reproduce the product.

## 4. Proposed enhanced per-component standard

Keep our differentiators; add the missing sections. Each `specs/<name>.md` grows to:

1. **Header** — tier, source, status/maturity badge, Storybook + registry + Figma links.
2. **Usage analytics** *(ours)* — totals + per-variant/size counts.
3. **Overview** — what it is, when to use / when not.
4. **Anatomy** *(new)* — labeled parts (ASCII/diagram or list: container, label, icon, …).
5. **Options** — variants / sizes / states tables (with measured colors).
6. **Behaviors** *(new/expand)* — overflow/truncation, loading, full-width, responsive.
7. **Content & writing** *(new)* — label conventions, casing, length, voice.
8. **Accessibility** *(new)* — keyboard, screen-reader/ARIA, focus, **target size**,
   contrast (incl. dark theme).
9. **Props / API** — table (mirrors registry).
10. **Design tokens used** *(surface)* — the tokens the component consumes.
11. **Findings & inconsistencies** *(ours)* — severity + status.
12. **Recommended solutions** *(ours)* — per finding, with code.
13. **Do / Don't**.
14. **Related components** *(new)* — cross-links to siblings.
15. **Changelog** *(new)* — dated entries of what changed in the component's DS treatment
    (and, separately, notes on product-side changes).

Mapped to artifacts: live bits (Examples/Code/Controls) stay in **Storybook**; the
structured/narrative bits live in **`specs/<name>.md`**; the machine mirror stays in
**`registry/<name>.json`** (add `anatomy`, `accessibility`, `content`, `related`,
`changelog`, `maturity`). Storybook Docs pages can surface Accessibility + Anatomy via the
description blocks.

## 5. Prioritized adoption (recommended)

- **P1 (high value, low cost):** Accessibility, Anatomy, Related components, Changelog,
  Status/maturity badge, surface Tokens-used. These close the biggest credibility gaps and
  the owner explicitly wants Changelog.
- **P2:** Content/writing guidelines, Behaviors (systematic).
- **P3:** Internationalization/RTL; per-framework code (we're Vue-only).
- Backfill **Button** and **Checkbox** to the enhanced standard first (they're the
  exemplars), then apply to every new component via `PROCESS.md`.

## 6. Usage must be DECISION-GRADE, not guidance (required)

A Usage page that only *describes* options forces the reader (and any AI) to guess. Every
component's **Usage** must let anyone pick the right option deterministically. Two required
parts, mirrored machine-readably in the registry:

1. **Decision flow** — an *ordered* set of questions where the **first match wins**, routing
   to exactly one option. (Button: navigates? → link · destructive? → error · the one main
   action? → primary · secondary? → default · quiet utility? → neutral-lightest · inline? →
   transparent · icon-only? → icon button.)
2. **Per-option use-case cards** — for **every** variant / type / modifier (not just the
   common ones): **Use when** (concrete triggers) · **Don't use / use instead** · **Example**
   (real product usage). No option left to interpretation.

**Mirror in the registry:** add `decisionFlow` (ordered array) and `usageRules`
(per-option `{ useWhen, dontUse, example, must? }`) to `registry/<name>.json`, so AI tools
resolve to the same choice as a human — goal #2 (AI-reproducible). Keep wording identical
between the MDX and the registry.

Ground every "use when" / example in **real product usage** (mine where each option is
actually used and what action it performs) rather than inventing scenarios. Benchmark the
phrasing against Atlassian/Material/Carbon/Polaris/Spectrum, but the *rules* are ours.

**"As seen in the product" notes (required for relatability).** For each option/variant/
layout, cite a **real place it's used** so a reader instantly relates ("horizontal layout →
Mail Server / Proxy settings"; "info-tooltip → the Group form"). Mine these from the codebase
(grep which screens/forms use it). Concrete references beat abstract descriptions — they let
designers/PMs picture it and let AI match the product. Reference impl: **Form Field** Usage.

*Reference implementation:* **Button** (`Atoms/Button/Usage` + `registry/button.json`
`decisionFlow`/`usageRules`). Apply this to every component's Usage from now on.

## Sources

- [Atlassian — Button](https://atlassian.design/components/button) ·
  [Atlassian Components](https://atlassian.design/components)
- [Uber Base — Button](https://base.uber.com/6d2425e9f/p/756216-button) ·
  [Base — Button Content](https://base.uber.com/6d2425e9f/p/756216-button/b/49b497)
- [IBM Carbon — components](https://carbondesignsystem.com/components/tabs/code/)
- [Adobe Spectrum — Tabs](https://spectrum.adobe.com/page/tabs/) ·
  [React Spectrum — Keyboard](https://react-spectrum.adobe.com/v3/Keyboard.html)
- [Shopify Polaris — components](https://polaris-react.shopify.com/components)
</content>
