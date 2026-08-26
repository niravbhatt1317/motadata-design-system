# @mtdt/observeops-ds-css

The ObserveOps design-system **"look" package** — a single standalone CSS file with the **exact** design
tokens (light + dark), the structural scale, and the status-tag chips. Import it in **any** project
(HTML, React, Vue, Svelte, plain CSS) and get **pixel-exact ObserveOps styling** — brand is navy, not
blue. No framework, no build step required.

This is the styling foundation for Goal #4. It ships the *look*; the real *components* come later
(`@mtdt/observeops-ds-elements`, Web Components).

## Install

```bash
npm install @mtdt/observeops-ds-css
```

…or with no build step at all, over the CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mtdt/observeops-ds-css/dist/observeops-ds.css" />
```

## Use

Import it once, then use `var(--token)` anywhere:

```css
@import '@mtdt/observeops-ds-css';   /* or the <link> above */

.my-button {
  background: var(--primary-button-bg);   /* navy */
  color: var(--primary-button-text);
  height: var(--input-height-base);       /* 32px */
  border-radius: var(--btn-radius);       /* 4px */
  font-family: var(--font-family);        /* Poppins */
  padding: 0 var(--padding-md);           /* 16px */
}
```

**Dark theme:** set `data-theme="dark-theme"` on a root element — every colour token swaps automatically.

```html
<html data-theme="dark-theme"> … </html>
```

**Status tag chips** are included as ready classes:

```html
<span class="tag-green">Active</span>
<span class="tag-red">Inactive</span>
<span class="tag-yellow">Pending</span>
```

## What's inside

- **Colour tokens** — 331 light + 311 dark CSS custom properties (`--primary`, `--page-text-color`,
  `--secondary-*`, `--severity-*`, `--neutral-*`, surfaces, borders, …). Brand `--primary` = navy
  `#111c2c` / `#e3e8f2`. The cyan `--primary-color` / `--ant-primary` (`#099dd9`) is the form-control
  accent only.
- **Structural scale** — spacing/sizing/radius/type as CSS vars (`--padding-md`, `--btn-radius`,
  `--text-sm`, `--font-family`, …).
- **Status-tag chips** — `.tag-green` / `.tag-red` / `.tag-yellow` / `.tag-orange` / `.tag-primary`.
- The **Poppins** font (`@import` at the top).

Open in any browser: **`dist/tokens.html`** — the complete token gallery (every colour + structural
token, searchable, light/dark toggle), and `example.html` — a small component demo.

## Scope (honest)

This package is the **look only** — tokens + chips. It does NOT include component behaviour or the full
component styling (those are welded to the app and ship with the real components later). For *real
components anywhere*, that's `@mtdt/observeops-ds-elements` (Goal #4, Web Components).

## Maintaining

Generated from the design-system token spec — don't hand-edit `dist/`. Rebuild with
`node design-system/scripts/build-css-package.js` (it reads `tokens/variables.json`,
`structural.json`, and `kit-accents.json`). Bump `version`, then `npm publish`.
