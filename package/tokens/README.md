# Tokens

Two layers live here:

1. **`variables.json` + `structural.json` + `kit-accents.json` — the complete as-is resolution
   crosswalk.** This is what an **AI / codegen tool uses today** to render product-faithful values.
   `variables.json` = themed CSS `--vars`; `structural.json` = LESS `@vars` (spacing/sizing/radii/type);
   `kit-accents.json` = the Ant 1.x LESS accents not in `variable.less` (e.g. the cyan `@primary-color`
   `#099dd9` that paints radio dots / checkbox checks). Generated verbatim from the product source.
   **`purpose-map.json`** sits alongside these — a **purpose → token** map (surface / text / border /
   brand / status / severity / shadow + the structural scale) so an AI styling a **net-new** element picks
   the right token by intent instead of hardcoding. Indexed from `components/index.json` → `tokens.purposeMap`.
2. **`primitive` / `semantic.{light,dark}` / `component.json` — the DTCG token *model*** (a curated
   slice) that the future Figma / Style-Dictionary pipeline is built on.

## variables.json — the AI crosswalk (use this for product-faithful values)

Every component registry's `tokensUsed` lists product **CSS custom-property names** (`--primary`,
`--nav-panel-bg`, `--code-tag-background-color`, …). **`variables.json` resolves each one to its actual
light + dark value**, with aliases (`var(--x)`) followed to a final value:

```json
"--primary":                   { "light": "#111c2c", "dark": "#e3e8f2", "lightRaw": "#111c2c", "darkRaw": "#e3e8f2" },
"--code-tag-background-color":  { "light": "#ecf1f9", "dark": "#172336", "lightRaw": "var(--neutral-lightest)", "darkRaw": "var(--left-menu-hover-bg)" }
```

**How an AI uses it:** registry says a component uses `--primary` → look it up in `variables.json` →
emit `var(--primary)` in code **and** know it renders `#111c2c` (light) / `#e3e8f2` (dark) for the
mockup/Figma. `structural.json` does the same for the LESS `@vars` (spacing `@padding-md: 16px`, sizing
`@input-height-base: 32px`, radius `@btn-radius: 4px`, type `@text-sm: 0.8rem`).

**Coverage:** **336** themed CSS vars (306 with both light + dark, 25 light-only), 313 resolve to a
colour value. Of the **57** distinct `--vars` referenced across all registries, **100% of the real ones
resolve** (the only non-resolving entries are prose wildcards like `--severity-*` and two LESS `@vars`
— `@btn-height` / `@btn-radius` — which live in `structural.json`).

> ### ⚠️ `--primary` drift — resolved
>
> Older docs (`/.claude/rules/design-rules.md`, the DTCG `link` role below) describe `--primary` /
> "brand" as **cyan `#099dd9`**. That is **wrong for the runtime CSS vars**: in `variable.less`,
> `--primary` = **navy `#111c2c`** (light) / `#e3e8f2` (dark), and **no CSS custom property resolves to
> `#099dd9` at all**. The cyan exists only as Ant Design's internal LESS `@primary-color` (affecting a
> few Ant component internals) and the not-yet-wired DTCG `link` role. **For product-faithful output,
> trust `variables.json` (navy).**

## The DTCG token model (the future Figma / Style-Dictionary slice)

> **Status: SLICE for sign-off.** These files contain a small, representative set
> (brand/accent split, neutrals, two severity families, surfaces/text/border, a few
> component tokens) to validate the *shape* before converting all ~322 tokens. Values
> are extracted verbatim from `src/design/variable.less`.

## Files (the 3 tiers)

| File | Tier | Role |
| --- | --- | --- |
| `primitive.json` | 1 · Primitive | Raw values (`color.navy.900`, `space.300`). Never themed, never used directly. |
| `semantic.light.json` | 2 · Semantic (light mode) | Roles referencing primitives. The **shared contract with Figma**. |
| `semantic.dark.json` | 2 · Semantic (dark mode) | **Same keys**, dark references. This is what "modes" means. |
| `component.json` | 3 · Component | Code-only; references semantic. Figma binds components to semantic, so this tier is **excluded** from the Figma export. |

Naming follows [`../strategy/token-taxonomy.md`](../strategy/token-taxonomy.md):
property-first (`color.background.brand.bold`), prominence ladder, severity as a role,
`mds` namespace on output.

## What gets generated (verified)

Resolving the references produces these CSS custom properties (output prefixed `mds`).
The values match `variable.less` exactly in both themes — i.e. **no visual change**
when the app eventually consumes the generated file:

```css
/* LIGHT — :root */
--mds-color-background-brand-bold: #07101f;   /* brand = primary action */
--mds-color-text-default: #1d2a3e;
--mds-color-text-subtle: #7186a8;
--mds-color-text-inverse: #ffffff;            /* on brand/bold surfaces */
--mds-color-link: #099dd9;                    /* interaction (cyan) */
--mds-color-border-focused: #099dd9;
--mds-color-text-accent-teal: #0d9488;        /* accent = decorative */
--mds-color-text-severity-critical: #ec5b5b;  /* status */
--mds-color-background-severity-critical-subtle: #fef5f5;
--mds-color-border-default: #e3e8f2;

/* DARK — [data-theme='dark-theme'] */
--mds-color-background-brand-bold: #ffffff;
--mds-color-text-default: #e3e8f2;
--mds-color-text-inverse: #07101f;
--mds-color-link: #099dd9;
--mds-color-background-severity-critical-subtle: #310c0c;
--mds-color-border-default: #1d2a3e;
```

Note the corrected color roles (decision D9, Atlassian-aligned): `brand` = primary
action navy, `link`/`border.focused` = interactive cyan, `accent.*` = decorative
hues (chart palette), `inverse` = text on bold surfaces, `severity.*` = status.

Note how `color.background.severity.critical.subtle` is `#fef5f5` in light and
`#310c0c` in dark — same token name, mode-swapped value. That single shared name is
what guarantees code ↔ Figma fidelity.

## Build pipeline (to wire next)

```text
tokens/*.json  ──►  Style Dictionary  ──►  ┌─ css/mds-tokens.css   (--mds-* vars, both themes)
                                           ├─ tailwind/preset.js   (theme-safe utilities)
                                           ├─ figma/tokens.json    (tiers 1–2 only → Tokens Studio)
                                           └─ ai/tokens.json       (flat, documented → AI spec)
```

- **Style Dictionary** resolves the `{alias}` references and emits each target.
- The two semantic files become **modes** (Figma) / themed blocks (CSS).
- `component.json` is filtered OUT of the Figma export.

## Conversion plan (rest of Phase 1)

1. Sign off on this slice's shape.
2. Expand `primitive.json` — full neutral ramp, all 13 severity families, chart hues,
   spacing/type/radius/z-index scales.
3. Expand `semantic.{light,dark}.json` — map every themed token in `variable.less` to a
   property-first role; resolve all hardcodes/typos at the source.
4. Expand `component.json` — buttons, inputs, grid, nav, tags, etc.
5. Wire Style Dictionary; diff generated CSS against current rendered values (both
   themes) to confirm zero visual regression.
</content>
