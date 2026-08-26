# @mtdt/observeops-ds-elements

The **real** ObserveOps design-system components as framework-agnostic **Web Components** (`obs-*` custom
elements). Use them in React, Vue, Svelte, Angular, or plain HTML — the output is the actual DS component, not a
reconstruction, so it looks and behaves like the product.

This is the build target the AI Operating Contract points at: **use these components, don't reconstruct them.**

## Install

```bash
npm install @mtdt/observeops-ds-elements @mtdt/observeops-ds-css
```

Import once to register every `obs-*` element (registration runs on import), and load the token CSS so colours
theme correctly:

```js
import '@mtdt/observeops-ds-elements'                       // registers obs-button, obs-tag, …
import '@mtdt/observeops-ds-css/dist/observeops-ds.css'     // the DS tokens (light + dark)
```

Then use them anywhere:

```html
<obs-button variant="primary">Save</obs-button>
<obs-input type="search" placeholder="Search…"></obs-input>
<obs-tag variant="tag-green">Active</obs-tag>
<obs-severity severity="critical" display-text></obs-severity>
<obs-radio as-button options="Low,Medium,High" value="Medium"></obs-radio>
<obs-switch checked></obs-switch>
```

Dark theme: set `data-theme="dark-theme"` on `<html>` (every token is theme-aware).

## The components (`obs-*`)

`obs-button` · `obs-input` · `obs-select` · `obs-switch` · `obs-checkbox` · `obs-radio` · `obs-link` · `obs-tag` ·
`obs-severity` · `obs-tags` · `obs-tooltip` · `obs-date-time-picker` · `obs-filters` · `obs-selected-pills` · plus
the `obs-layout-*` foundation elements.

**Props/variants:** every component's full API (props, variants, states, tokens, and the *decision-grade* usage
rules — which variant when) lives in the machine spec **`@mtdt/observeops-ds-spec`**, and via the MCP server
`@mtdt/observeops-ds-mcp` (`get_component`, `search_components`, …). Read the contract in
`@mtdt/observeops-ds-spec/AGENTS.md` before building.

## Events

Vue-emitted events deliver the value in `event.detail` as an **array** — unwrap it:

```js
el.addEventListener('change', e => { const value = Array.isArray(e.detail) ? e.detail[0] : e.detail })
```

## Breaking changes

- **`obs-filters` `change` payload — `0.1.150`.** The `bar` kind's `change` event now delivers
  **`{ conditions, match }`** (was a bare `conditions` array). This is a **silent** break: a handler doing
  `Array.isArray(e.detail[0])` / reading the detail as an array gets no conditions and **fails with no error**.
  Update your handler:

  ```js
  el.addEventListener('change', e => {
    const d = Array.isArray(e.detail) ? e.detail[0] : e.detail
    const conditions = Array.isArray(d) ? d : d.conditions   // accept both shapes
    const match = d && d.match                                // 'all' | 'any' (new)
  })
  ```

  `el.value` still reflects the conditions JSON, so value round-tripping is unchanged. (Fixes the vanishing-chip
  and inert-Match bugs in `0.1.143`–`0.1.146`.)

## Troubleshooting — a fix isn't showing up after `npm update`?

Bundlers cache pre-bundled deps, so an updated version can keep serving the **old** one and look "still broken."
If a published fix doesn't appear:

```bash
rm -rf node_modules/.vite      # Vite (also .parcel-cache / webpack cache for those bundlers)
npm run dev -- --force         # force a fresh pre-bundle
```

Confirm the loaded version with `import pkg from '@mtdt/observeops-ds-elements/package.json'` (or check
`node_modules/@mtdt/observeops-ds-elements/package.json`). Verify against the DS *after* clearing the cache — a
stale bundle will report fixed items as still broken.

## Verify your render

Check that what you built matches the DS (tokens · components · variants · layout) with the shipped conformance
checker: `node node_modules/@mtdt/observeops-ds-spec/conformance/ds-conformance.mjs <your-page.html>` (aim ≥ 90).
