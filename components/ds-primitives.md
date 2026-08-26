# DS Primitives (shared composite classes)

Small, reusable **CSS classes** that sit between raw tokens and full components — the
repeated typographic/layout bits that product config screens hand-roll in `<style scoped>`.
Extracted so stories (and eventually the product) reference **one** definition instead of
inline copies. Source: [`../storybook/ds-primitives.less`](../storybook/ds-primitives.less),
loaded in `.storybook/preview.js`. Every value comes from a design token (`var(--…)`); once
the token build is wired they bind to the generated `--mds-*` variables with no visual change.

## Classes

| DS class | Style | Token(s) | Extracted from |
| --- | --- | --- | --- |
| `.ds-main-heading` | 18px / 600 | — | `main-heading` |
| `.ds-section-heading` | 14px / 600 | — | `section-heading` |
| `.ds-section-text` | 14px | — | `section-text` |
| `.ds-helper-text` | 12px, body text | `--text-color-common-primery` | `helper-text` |
| `.ds-caption` | 12px | — | neutral-light 12px subtitle |
| `.ds-body-text` | body text color | `--text-color-common-primery` | `white-var-text` |
| `.ds-divider` | full-width bottom rule + 1rem spacing | `--border-color` | `divider` |
| `.ds-accent-bar` | 3×24px rounded accent bar | `--primary` | `vertical-line` |
| `.ds-panel-heading` | 16px / 600, brand color | `--primary` | `right-column-heading` |
| `.ds-panel` | tinted bordered card | `--help-card-bg-color`, `--border-color` | `bordered-section` |
| `.ds-nav-item` / `.ds-nav-item-selected` | sidebar nav item (color/selection) | `--left-menu-text-color`, `--page-text-color`, `--code-tag-background-color` | `deployment-menu-item` |
| `.ds-spec-table` | key→value reference table | `--border-color`, `--text-color-common-primery` | `param-table` |

## Notes

- **Color/weight only where the product does** — e.g. `.ds-section-heading` sets size+weight;
  brand color stays on the `text-primary` utility (mirrors the product `<h6 class="text-primary
  section-heading">`). Layout (flex/padding) stays as utilities; these classes own the
  *primitive* style, not the composition.
- **Verified parity** — each class resolves to the same computed value as the inline original
  (see the Drawer changelog). Used in the **Organisms / Drawer → Large / full-screen** story.
- **Product adoption (later)** — these are 1:1 with existing product scoped classes, so the
  product could drop its per-screen copies and consume these once they ship as shared CSS. Until
  then the product is unchanged; this is a DS-side layer.
