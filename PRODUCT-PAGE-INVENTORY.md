# Product Page Inventory & Page-Type Archetypes

**What this is.** A deep sweep of every page/screen in the ObserveOps product (Vue 2 SPA under
`src/modules/`), with each page classified into a **page-type archetype**. It exists so that DS work on
**page recipes** (`components/recipes/recipes.json`) and **page contracts**
(`components/page-contracts.json` + the MCP `get_page_contract` / `validate_page` tools) is grounded in the
*real* set of product screens — not guessed. When we build/extend a page contract or recipe, start here to
know which archetype it must serve and which real pages are the reference.

> **Related:** [`components/page-contracts.json`](./components/page-contracts.json) ·
> [`components/recipes/recipes.json`](./components/recipes/recipes.json) · the MCP tools
> `get_page_contract(pageType)` + `validate_page(html, pageType)` (`@mtdt/observeops-ds-mcp`).

## How to regenerate / maintain this file

The product adds screens over time — refresh this by re-sweeping the route files:

- Modules live under `src/modules/<module>/`; pages are defined in `src/modules/<module>/**/*-routes.js`.
- Settings sub-modules: `src/modules/settings/<sub>/` + the nav catalogue `src/modules/settings/helpers/menu-items.js`.
- Sweep = read every `*-routes.js`, list each route (path + view file), and classify by archetype.
- Update the **archetype counts**, the **contract-coverage** column, and the **Maintenance log** at the bottom.

Last full sweep: **2026-09-09** (22 top-level modules, 19 settings sub-modules, 41 route files, ~226 route entries).

## Totals

~**175 pages across 22 modules**, collapsing into **~11 page archetypes**.

| Area | Pages | Dominant types |
| --- | --- | --- |
| Settings (19 sub-modules) | ~110 | list · settings-form · form + 10 diagnostic tools |
| APM / Logs / Reports | 20 | explorer · dashboard · report · wizard |
| Monitoring core (inventory, dashboard, metric-explorer, health, slo, rum) | 17 | detail · dashboard · explorer |
| Network / Flow (topology, netroute, flow, ncm, ncm-approval) | 15 | graph · list · dashboard · detail |
| Alerting (alert, notifications, trap-viewer, task-manager, audit) | 10 | list · detail |

## Page archetypes (the DS lens) + contract coverage

175 pages, but only ~11 *kinds*. This table drives the recipe/contract roadmap.

| Archetype | ~Count | Examples | Contract today? |
| --- | --- | --- | --- |
| **list** (table/grid of records) | ~75 | Alert stream, Monitors, every policy/profile/mapping list | ✅ `list` |
| **settings-form** (single config pane) | ~25 | Mail/Proxy/SSO/ServiceNow/Slack, Data Retention | ✅ `settings` |
| **form** (create/edit editor) | ~20 | Create Policy, Edit Monitor Template, Create Benchmark | ✅ `form` |
| **detail** (one record, tabbed sections) | ~18 | Monitor detail, Alert detail, Service detail, SLO detail | ❌ **gap** |
| **explorer** (facets/tree/saved-views + content) | ~8 | Metric Explorer, Log Search, Trace Explorer, Flow Explorer | ❌ **gap** |
| **dashboard** (widget grid) | ~7 | Dashboard viewer, Flow/NCM/Error dashboards, Health | ✅ `dashboard` |
| **wizard** (multi-step) | ~6 | Product Setup ×4, Create Discovery Profile | ❌ **gap** |
| **report** (report view/builder) | ~4 | Report View, Create/Edit Report | ❌ **gap** |
| **graph** (topology canvas) | 3 | Topology map (network/cloud/virtualization) | ❌ **gap** |
| **tool** (diagnostic utility) | 10 | Ping, Traceroute, SNMP Walk, CLI Command | ❌ **gap** |
| **auth** (public) | 2 | Login, Reset Password | ❌ **gap** |

**Coverage:** the 4 contracts we shipped (`dashboard`, `list`, `settings`, `form`) already cover **~127 of
~175 pages (~73%)** — the long tail of settings/policy/profile CRUD is just list + form + settings-form
repeated. The remaining ~48 pages are ~7 archetypes with no contract yet.

## What to build next (recipe/contract roadmap, by payoff)

1. **detail** (~18) — tabbed record view; every module has one. Highest value.
2. **explorer** (~8) — facets/saved-views sidebar + content (Log Search, Metric Explorer, Trace Explorer, Flow Explorer).
3. **wizard** (~6) — the stepper flow (Product Setup, Discovery). Pairs with `obs-steps`.
4. **tool** (~10, near-identical) — one "diagnostic tool" contract covers all of `settings/utility`.
5. **report** (~4), **graph/topology** (3), **auth** (2) — more specialized; lower priority.

---

## Full inventory by module

### Monitoring core — inventory · dashboard · metric-explorer · health · slo · rum (17)

| Module | Page | Route | View | Type |
| --- | --- | --- | --- | --- |
| inventory | Group/category landing | `/inventory/:category/groups/:groupId?` | `views/group-template.vue` | explorer |
| inventory | Monitor detail | `/inventory/:category/monitors/:monitorId` | `views/device-template.vue` | detail |
| inventory | Application detail | `/inventory/:category/monitors/:monitorId/app/:application` | `views/device-template.vue` | detail |
| inventory | Application tab | `/inventory/:category/monitors/:monitorId/:applicationName` | `views/device-template.vue` | detail |
| inventory | VM detail | `/inventory/:category/monitors/:monitorId/vm/:vm` | `views/device-template.vue` | detail |
| inventory | Access-point detail | `/inventory/:category/monitors/:monitorId/ap/:ap` | `views/device-template.vue` | detail |
| inventory | Category container | `/inventory/:category` | `views/inventory-container.vue` | other (redirect shell) |
| dashboard | Dashboard viewer | `/dashboard/:id?` | `views/dashboard.vue` | dashboard |
| dashboard | Column mappers | `/dashboard/column-mappers` | `views/column-mappers.vue` | settings |
| dashboard | Socket playground | `/dashboard/socket-playground` | `views/socket-playground.vue` | other (dev tool) |
| metric-explorer | Metric Explorer | `/metric-explorer` | `views/metric-explorer.vue` | explorer |
| health | Health Monitoring | `/health` | `views/health.vue` | dashboard |
| slo | SLO list | `/slo` | `views/slo.vue` | list |
| slo | SLO detail | `/slo/detail/:id/:tab` | `views/details.vue` | detail |
| slo | SLO cycle history | `/slo/history-detail/:id/:cycleId` | `views/history-detail.vue` | detail |
| rum | RUM apps | `/rum` | `views/rum.vue` | list |
| rum | RUM app drill-down | `/rum/rum-app/:id/:name/:tab` | `views/rum-application-drill-down.vue` | detail |

### Alerting & events — alert · notifications · trap-viewer · task-manager · audit (10)

| Module | Page | Route | View | Type |
| --- | --- | --- | --- | --- |
| alert | Alert stream | `/alerts/:category/:tab` | `views/stream.vue` | list |
| alert | Alert dashboard (metric-explorer style) | `/alerts/dashboard/:type?` | `views/dashboard.vue` | explorer |
| alert | Alert detail | `/alerts/detail/:category/:tab/:uuid` | `views/detail.vue` | detail |
| alert | Correlated alerts | `/alerts/correlated-alerts/:type/:tab` | `views/correlated-alert-list.vue` | list |
| notifications | Notifications | `/notifications/:tab` | `views/notifications.vue` | list |
| trap-viewer | Trap viewer list | `/trap-explorer` | `views/trap-viewer-list.vue` | list |
| trap-viewer | Live trap viewer | `/trap-explorer/live-trap-viewer` | `views/live-trap-viewer.vue` | list (live) |
| trap-viewer | Trap detail | `/trap-explorer/:hash` | `views/trap-viewer-details.vue` | detail |
| task-manager | Tasks | `/task-manager` | `views/task-manager.vue` | list (live) |
| audit | Audit log | `/audit` | `views/audit-list.vue` | list |

### Network & flow — topology · netroute · flow · ncm · ncm-approval (15)

| Module | Page | Route | View | Type |
| --- | --- | --- | --- | --- |
| topology | Topology Map | `/topology/:tab?` | `views/topology-map.vue` | graph |
| topology | Monitor Topology | `/topology/:tab/monitors/:monitorId` | `views/topology-map.vue` | graph |
| topology | Group Topology | `/topology/:tab/groups/:groupId` | `views/topology-map.vue` | graph |
| netroute | NetRoute | `/netroute` | `views/netroute.vue` | list |
| netroute | NetRoute Graph | `/netroute/netroute-graph/:id` | `views/netroute-drilldown.vue` | detail |
| flow | Flow Dashboard | `/flow/dashboard` | `views/dashboard-tab.vue` | dashboard |
| flow | Flow Explorer | `/flow/explorer` | `views/explorer-tab.vue` | explorer |
| flow | Flow Analytics | `/flow/analytics` | `views/analytics-tab.vue` | list |
| flow | Flow Analytics Detail | `/flow/analytics/detail` | `views/flow-analytics-detail.vue` | detail |
| ncm | Overview | `/ncm/overview` | `views/overview.vue` | dashboard |
| ncm | Compliance | `/ncm/compliance` | `views/compliance.vue` | dashboard |
| ncm | Explorer | `/ncm/explorer` | `views/explorer.vue` | explorer |
| ncm | Audit Policy Device | `/ncm/compliance/:policyId` | `views/audit-policy-device.vue` | list |
| ncm | Device Policy Breakdown | `/ncm/compliance/:policyId/:objectId` | `views/device-policy-breakdown.vue` | detail |
| ncm-approval | Approval List | `/ncm-approval` | `views/list.vue` | list |

### APM / Logs / Reports — apm · log · report · product-setup · auth (20)

| Module | Page | Route | View | Type |
| --- | --- | --- | --- | --- |
| apm | Services | `/apm/services` | `views/services.vue` | list |
| apm | Service Detail | `/apm/service-detail/:id/:tab/:uuid` | `views/detail.vue` | detail (tabs: overview/transactions/db/jvm/api) |
| apm | Trace Explorer | `/apm/explorer` | `views/explorer.vue` | explorer |
| apm | Error Tracker | `/apm/error-tracker` | `views/error-tracker.vue` | dashboard |
| apm | Compare | `/apm/compare` | `views/compare.vue` | other (compare) |
| log | Log Dashboard | `/log` | `views/log-dashboard.vue` | dashboard |
| log | Log Search | `/log/search` | `views/log-search.vue` | explorer |
| log | Live Tail | `/log/live-tail` | `views/live-tail.vue` | explorer (live) |
| log | Pattern Matched Logs | `/log/pattern-matched-log` | `views/pattern-matched-log.vue` | list |
| log | Surrounding Events | `/log/surrounding/:id` | `views/surrounding-events.vue` | list |
| report | Report List | `/reports` | `views/list.vue` | list |
| report | Report View | `/reports/view/:id` | `views/view.vue` | report |
| report | Create Report | `/reports/create` | `views/create.vue` | report (builder) |
| report | Edit Report | `/reports/edit/:id` | `views/edit.vue` | report (builder) |
| product-setup | Setup Home | `/setup` | `views/setup.vue` | wizard |
| product-setup | Metric Setup | `/setup/metric` | `views/metric.vue` | wizard |
| product-setup | Log Setup | `/setup/log` | `views/log.vue` | wizard |
| product-setup | Flow Setup | `/setup/flow` | `views/flow.vue` | wizard |
| auth | Login | `/login` | `views/login.vue` | auth |
| auth | Reset Password | `/reset-password` | `views/reset-password.vue` | auth |

### Settings — 19 sub-modules (~110 pages)

Route base: `/settings/<routePrefix>/...`. Views under `src/modules/settings/<sub>/views/`.
Overwhelmingly **list** (record grids) + **settings-form** (single config panes) + **form** (create/edit),
plus a `wizard` (network-discovery) and 10 diagnostic `tool` panes (utility). Grouped by sub-module:

> **Settings is a SHELL, not a page type** (analysed 2026-09-25 against the product; encoded in the `settings` page
> contract as `isShell:true`). Every settings page shares a constant shell — **obs-app-header + a "Settings" section
> bar (obs-page-header heading='Settings' menu-toggle + gear — the circular toggle shows/hides the menu) +
> obs-side-menu mode='settings' (the product's multi-open collapse: right chevron, section dividers, rounded active
> child, top/bottom scroll fade)** — and only the CONTENT PANE varies. The content pane is one of **4 inner
> patterns**, so ~110 settings pages collapse to *4* structures:
>
> | Inner pattern | What | Sub-pages (examples) | Reuses |
> | --- | --- | --- | --- |
> | **config-form** (dominant) | title + desc + sectioned label:field form → bottom-right Reset/Test/Save | My Profile, UI Preference, Mail/Proxy/SMS Server, SSO, LDAP, RADIUS, Data Retention, 2FA, Rebranding, SSH, ServiceOps/ServiceNow/Jira/Teams | `form`/settings-form |
> | **records-table** | toolbar (search+create) → obs-table (status switch, groups tags, ⋮) → pager | User, User Profile, PAT, Role, **all** Policy types, MAC List, Backup/Storage/DNS Profile, Rule-Based Tags, Integration Profile | `list` (nested) |
> | **card-grid / tree** (new) | search+create → grid of expandable group cards + leaf cards w/ counts | Group (monitor groups tree — also in Monitors filter) | new pattern |
> | **wizard** | header → numbered steps 1…N, each with fields+actions | Slack (& OAuth integrations); Create Discovery Profile | `wizard` gap |
>
> Reference build: the starter `SettingsPage.vue` renders the shell once + swaps the content pane on nav (config-form
> = My Profile; records-table = User). Same shell fits ANY module's own left-sub-nav settings.
>
> **Layout gotcha (do NOT repeat):** obs-side-menu already draws its own RIGHT border/divider + internal padding
> (+ scroll fade). The menu column host must add **neither** a `border-right` **nor** `padding` — doing so
> double-divides (a 2px rule between menu and content) and double-pads. Size the column only (`flex: 0 0 264px;
> min-height: 0`); the single divider between menu and content is the side-menu's own right border. (Encoded in the
> `settings` contract's `layout` / `must` / `dont`; the starter hit this exact bug on 2026-09-28 and it was removed.)


- **my-account** — My Profile (settings-form) · UI Preference (settings-form) · License (detail, full-page).
- **users-settings** — User · Personal Access Token · Role · User Profile (all list) · Password Settings · LDAP · SSO · RADIUS (settings-form).
- **group-settings** — Group (list) · Data Security (list).
- **system-settings** — 2FA · Mail · Proxy · SMS · Rebranding · Data Retention · SSH Security (settings-form) · Deployment/Collectors · MAC Address List · Storage Profile · Backup Profile · Rule-Based Tags · DNS Server Profile (list).
- **policy-settings** — Metric/Log/Flow/Trap/NetRoute/APM/Network-Config/RUM policy lists (list) · Create Policy · Edit/View Policy (form, full-page).
- **network-discovery** — Credential Profile · Discovery Profile (list) · Create/Edit Discovery Profile (**wizard**) · Discovery Progress · Discovery Log/Result (detail, live run).
- **monitoring** — Monitoring Hour · Custom Field · Monitor Templates · Processes · Services · File/Directory · SNMP Device Catalog · Agent Monitor (list) · Create/Edit Monitoring Hour · Edit Monitor Template · Agent Configuration · Create/Edit SNMP Device (form) · Device/Cloud/Service-Check Monitor · Rediscover · NetRoute · Topology Scanner (settings-form).
- **ncm-settings** — Device Inventory · Device Template · Firmware Update Profile (list) · Create/Edit/View Device Template (form).
- **compliance-settings** — Compliance Policy · Benchmark · Rules · Weighted Calculation (list) · Create/Edit/View Benchmark · Create/Edit/View Rule (form).
- **snmp-trap** — Trap Profile · Trap Forwarder · Trap Listener (list) · Create/Edit/View Trap Profile (form).
- **log-settings** — Log Inventory · Log Parser Library · Log Collection Profile · Log Forwarder · Directory Path (list) · Create Log Parser (form) · View Log Parser (detail).
- **flow-settings** — Flow Settings (settings-form) · Sample Rate · Application/Protocol/AS/Domain/Geolocation/IP Mapping (list).
- **plugin-library** — Runbook · Metric · Topology · Log Parser plugin lists (list) · Create/Edit/View for each (form).
- **ai** — Parent-Child Dependency Mapper (list).
- **service-level-objective** (Beta) — SLO Profile · Correction Profile · Penalty Profile (list).
- **apm-settings** — Application Registration (list).
- **digital-experience-monitoring** (RUM) — Application registration (list).
- **integration** — Integration Profile · Motadata ServiceOps (list) · ServiceNow · Jira · Teams · Slack · LAMA (settings-form).
- **utility** — Ping · SNMP Ping · Traceroute · SNMP Walk · SNMP Community Check · MAC Resolver · CLI Command · PowerShell · DNS Resolver · Telnet (all **tool**).

## Maintenance log

- **2026-09-09** — First full sweep (5-agent parallel analysis of all route files). ~175 pages, 11 archetypes.
  4 page contracts (dashboard/list/settings/form) cover ~73%; identified detail/explorer/wizard/tool/report/graph/auth as the gaps.
- **2026-09-25** — Refactored the `list` contract into the documented DEFAULT base structure (reference-first override) and
  the `settings` contract into a **shell + 4 inner patterns** model (config-form · records-table · card-grid-tree · wizard).
  Reference builds landed in the starter: Monitors (`list`), Settings shell + My Profile (config-form) + User (records-table).
