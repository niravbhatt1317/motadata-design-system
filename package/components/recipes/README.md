# Composition recipes

Page & flow blueprints — the layer **above** per-component docs. Where the registries say *which*
component to use, these say **how to assemble a whole product-faithful screen**. Machine source:
[`recipes.json`](./recipes.json).

## Why

The AI-readiness assessment found an AI could pick the right components but had **no blueprint** to lay
out a faithful page. These recipes close that: each one is a real ObserveOps screen archetype with its
regions, the component `id` + `variant` for each region, the layout shell, the spacing/sizing tokens,
and the known traps.

## How an AI uses it

1. Match the user's screen to a recipe by `whenToUse` / `examples`.
2. Build the `regions` outer-to-inner; each names component `id`s + `variant`s → open those in
   `components/registry/` for props, resolve their `tokensUsed` via `tokens/variables.json`.
3. Apply `layout.shell` + `layout.tokens` (+ the global `layout.appShell` / `layout.tokens` for the app
   chrome) for spacing/sizing.
4. Honour each recipe's `gotchas` and `a11y`.
5. The **content** (which columns / fields / options) is domain data the DS doesn't own — fill it from
   the user's spec.

## The recipes

| Recipe | When |
| --- | --- |
| **list-view** | A paginated CRUD list with filter, row + bulk actions, create/edit drawer (Monitors, Alerts, Users). |
| **form-view** | A create/edit form for one record (Settings policy/profile forms, Add Monitor). |
| **detail-view** | One record's details across tabbed sections (monitor/alert/NCM detail). |
| **dashboard-view** | A widget grid with a dashboard picker + global time range. |
| **explorer-view** | A left panel (tree / facets / picker / saved-views) + results + time range (Log/Metric/APM/RUM/NCM). |
| **wizard-flow** | An ordered multi-step create/setup flow (report builder, product setup, 2FA). |
| **confirm-delete-flow** | A destructive-action confirmation from a row/detail/bulk bar. |

## The app shell (every page)

The **Primary nav** (`navigation/primary-nav`) and **App header** (`toolbars/app-header`) come from the
layout, not the page — a recipe's regions render inside the main content area (`--common-main-bg`). See
`recipes.json` → `layout.appShell`.
