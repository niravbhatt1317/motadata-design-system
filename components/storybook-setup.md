# Storybook Setup & Decorator Harness

The plan to render the **real** product components, live and interactive, in Storybook.
This is the infrastructure the whole component library sits on.

## Environment realities (decided constraints)

- **Stack:** Vue **2.6.12**, `@vue/cli-service` 5 (Webpack 5), LESS, `aliases.config.js`
  (reusable — see below).
- **Node on this machine: v24** — *ahead* of what Storybook's Vue 2 builds target
  (Node 16–20). **Pin Node 18 LTS** for the Storybook workflow (add `.nvmrc` = `18`).
  Do not assume Node 24 will work; validate in the spike.
- **Branch:** currently `master`. **Do all Storybook work on a branch**
  (`design-system/storybook`), never install onto `master`.
- **Vue 2.6 vs 2.7:** some Storybook 7 Vue-2 builds assume Vue **2.7**. This is a real
  fork (see version decision). A 2.6→2.7 bump is low-risk and also helps the eventual
  Vue 3 migration, but it's a separate decision.

## ✅ RESOLVED stack (works, product untouched)

Storybook **6.5** + private **vue-loader 15** (`vueloader15@npm:vue-loader@15.11.1`,
aliased as the `vue-loader` loader name in `.storybook/main.js`) + **vue-template-compiler
2.6** + webpack-5 polyfills + LESS `modifyVars` + Node 18 with
`NODE_OPTIONS=--openssl-legacy-provider`. Product stays on Vue 2.6.12.

**Why not SB7 / why vue-loader 15:** SB7's Vue-2 renderer calls `resolveComponent` (absent
in all Vue 2.x). Separately, `node_modules` has a stray Vue-3 `vue-loader@16` + `@vue/
compiler-sfc@3` that miscompiled the Vue 2 `.vue` files (also emitting `resolveComponent`).
Forcing vue-loader 15 + the Vue 2 template compiler fixes both. Always **headless-verify
render** (Playwright) before deploying — a clean build does NOT mean it renders.

## Version decision (historical — see RESOLVED above)

| Option | Pros | Cons |
| --- | --- | --- |
| **Storybook 6.5** (`@storybook/vue` + builder-webpack5) | Best-trodden path for **Vue 2.6**; lots of references | Old (2022); shaky on Node ≥20/24; webpack4-era manager deps |
| **Storybook 7** (`@storybook/vue` + `@storybook/vue-webpack5`) | Better Node/Webpack-5 compat; modern addons | May expect **Vue 2.7**; Vue-2 support is sunset (dropped in SB 8) |

**Recommendation:** pin **Node 18**, run a **1-day spike** trying **SB 7 first**; fall
back to **6.5** if Vue 2.6 rendering misbehaves. Decide the Vue 2.6→2.7 bump only if the
spike forces it. (Storybook 8 is out — but it **dropped Vue 2**, so it's not an option
until the Vue 3 migration.)

## Why decorators are needed

The real components assume the app's runtime. To render in isolation each story must
provide:

| Dependency | Used by | Harness provides |
| --- | --- | --- |
| `@motadata/ui` plugin (`M*` + services `$toast`/`$confirm`) | almost everything | `Vue.use(UiKit)` once, globally |
| Global `_base-*` registration | Floto components | run `_globals.js` (require.context) |
| Vuex store (`auth`, `userPreference`, `config`, `branding`) | permission gates, theme, many | a **mock store factory** with seeded state |
| Vue Router | links, `FlotoPageHeader`, route-aware bits | a memory router with stub routes |
| `vee-validate` (`MValidationObserver/Provider`) | `FlotoForm`/`FlotoFormItem` | register globally in preview |
| `portal-vue`, virtual-scroller, vue-meta | overlays, grids, pages | register globally |
| Global `Bus` (`@utils/emitter`) | cross-component events | real Bus (it's standalone) |
| Font Awesome / `MIcon` | every icon | import the icon set in preview |
| API client (`@api`) | organisms that fetch (grids, pickers) | **mock** (MSW or an axios stub) |
| Socket / web workers | live grids, severity | **no-op stubs** |
| Token CSS (`--mds-*` / current vars) | all visual fidelity + theming | import token CSS + theme toolbar |

## Harness architecture

```text
.storybook/
├── main.js          framework, stories glob, addons, webpackFinal (merge aliases.config.js + LESS loaders)
├── preview.js       global decorators + parameters + theme toolbar
├── preview-head.html fonts + base CSS
└── harness/
    ├── install-plugins.js   Vue.use(UiKit), _globals, vee-validate, portal-vue, vue-meta, Bus
    ├── mock-store.js        store factory: seeded auth(perms+license), userPreference(theme), config, branding
    ├── mock-router.js       memory router + stub $modules.getModuleRoute
    ├── mock-api.js          MSW handlers / axios stub for @api (per-story overridable)
    └── with-theme.js        sets data-theme/data-scheme on root; loads token CSS
```

- **`main.js` → `webpackFinal`** merges the app's `aliases.config.js` (so `@src`,
  `@components`, `@motadata/ui`, etc. resolve) and adds the LESS loader chain. This is
  the key to importing real components without duplicating config.
- **`preview.js`** applies global decorators (install plugins → provide store → provide
  router → wrap with theme) and a **toolbar** to switch **brand × scheme** (ties directly
  to the token multi-theme work — `data-brand` + `data-scheme`).
- **`mock-api.js`** is per-story overridable so an organism's story can seed its own data.

## Story conventions

- **CSF3**, one `*.stories.js` per component, colocated or under `stories/<tier>/`.
- Sidebar title = tier path: `Atoms/Button`, `Molecules/Form Field`, etc. (matches the
  registry's `storybook` field).
- `argTypes` generated from the registry's props/variants → live **Controls**.
- Each component: **Default** + per-variant/state stories + a **Docs** page (anatomy,
  props, Do/Don't pulled from the registry).

## Tiered rollout (least → most mocking)

This is why we start at Atoms:

1. **Atoms** — need only the UI plugin + token CSS. Trivial. *(first)*
2. **Molecules** — add vee-validate (for `FlotoFormItem`), portal-vue. The generic
   `DataPicker` takes options via args (no API).
3. **Organisms** — add the mock store + mock API + router (grids/CRUD/filter bars).
4. **Templates / Pages** — full harness; pages are example stories with seeded data.

## Concrete next steps (when we scaffold, on a branch)

1. `git checkout -b design-system/storybook`; add `.nvmrc` (`18`); `nvm use 18`.
2. Spike: init Storybook (SB 7 first), wire `webpackFinal` to `aliases.config.js` + LESS.
3. Build `harness/install-plugins.js` + `with-theme.js`; render **one atom** (`MButton`)
   interactively — proves the pipeline.
4. Add `mock-store.js` + a permission-gated component to prove store mocking.
5. Add `mock-api.js` (MSW) + one organism (`MServerGrid`) to prove data mocking.
6. Then roll through tiers from the registry/specs.

## Risks / open

- Node 24 vs Storybook (pin 18). · SB6.5 vs 7 vs Vue 2.6/2.7 (spike decides). · LESS +
  theme CSS must load so `--mds-*`/current vars resolve. · Heavyweight install — branch
  only, expect a large `node_modules` delta.
</content>
