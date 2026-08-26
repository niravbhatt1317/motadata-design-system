# Page templates — product coverage

The canonical page types. All six catalogued templates are confirmed across the product, plus a handful
of archetypes/variants the sweep surfaced (Graph canvas, Utility tool, System/status, and two wizard shapes).

## The variants (catalogued)

| Template | What | Storybook |
| --- | --- | --- |
| **List view** | paginated collection (`FlotoPaginatedCrud` + table + toolbar) | Page templates → List view |
| **Form view** | create/edit a record on an `MRow`/`MCol` grid; often in a drawer | Form view |
| **Detail view** | one record: header + status/severity + tabs + panels/charts | Detail view |
| **Dashboard view** | widget grid + global time range | Dashboard view |
| **Explorer view** | left panel + query/filter + results | Explorer view |
| **Wizard flow** | stepper + step body + Back/Next | Wizard flow |

## Where each is used in the product

| Template | Pages / flows (modules · files) |
| --- | --- |
| **List view** (dominant) | Inventory grid; **settings** CRUD across ~15 submodules (monitoring, users, roles, compliance/benchmarks, ncm device templates, snmp-trap, policy lists, plugin-library, group-settings, …); alert **stream** + correlated alerts; ncm **explorer** + ncm-approval; **audit** log; apm **services**; rum list; **trap-viewer** list; dashboard **column-mappers**; reports list. |
| **Form view** | settings create/edit (business-hour, discovery profile, user, role, benchmark, log-parser, …); **policy** create/edit (left type-menu + form); inventory drawer forms (wan-link, container-runtime, credential-selection — `FlotoDrawerForm` 40%); **my-account** profile/preferences; **system settings** forms (mail, proxy, DNS — horizontal layout). |
| **Detail view** | monitor/**device-template** (tabbed *template-swapper*); **alert detail** (severity + time-range + dynamic overview tabs + collaboration); apm service/database/api-endpoint/transaction details; **rum** drill-downs; **slo** details + history; netroute drilldown; trap-viewer details; log surrounding-events. |
| **Dashboard view** | **dashboard** editor + **NOC player** (full-screen variant); alert **dashboard**; log-dashboard; flow dashboard; apm overview; ncm overview + compliance; inventory **heatmap** dashboard; netroute dashboard mode. |
| **Explorer view** | **log search** (query builder + hierarchy tree); **metric-explorer** (three-pane: saved-views + metric-picker + chart); apm **explorer** (saved-views + filters); flow **explorer**; rum; netroute; **topology** graph. |
| **Wizard flow** | **report builder** (5 steps, `MMenu` stepper: Type→General→Template→Schedule→Review); **network discovery** (multi-route: profile → configure → progress → result); **integration setup** (slack/teams/jira/service-now — single-view numbered steps); 2FA / setup-guide onboarding. |

## Coverage verdict

All six templates are present and well-used. The sweep also found these the catalogue should acknowledge:

- **Graph / Canvas view (new archetype)** — see findings. Strong candidate for a 7th template.
- **Utility-tool form** — settings/utility (`ping`, `dns-resolver`, `snmp-walk`, `telnet`, `cli-command`):
  a stateless input-form + results, no CRUD/persistence. A Form sub-type worth naming.
- **System / status message page** — `_disk-space-full`, upgrade/restore progress, `_404`, `_unauthorized`,
  report-renderer. Message/print pages under Login/Public/Empty shells.

## Notable / different findings

- **Topology graph canvas is a distinct archetype** (`modules/topology/views/topology-map.vue`): a Cytoscape
  interactive graph with pan/zoom, **minimap** (cytoscape-navigator), node-drag with saved positions,
  Full-View vs Tree-View re-layout (D3 force in a web worker), and rich keyboard shortcuts. It is neither a
  Dashboard nor an Explorer → document as **Graph / Canvas view**.
- **Detail-as-template-swapper** (`inventory/views/device-template.vue`): the tab bar swaps **entire
  templates** (dashboard / metric-explorer / policy-list), not just content sections — a detail variant.
- **List ⇄ Dashboard view toggle**: apm services, rum, netroute toggle one page between an `MGrid` table and
  a `vue-grid-layout` widget board — a list/dashboard hybrid.
- **Two wizard shapes**: (a) **multi-route stateful** (report builder, discovery — real routes + polling +
  polymorphic step components); (b) **single-view stepped** (integration setup — numbered steps inside one
  view). The Storybook wizard example matches (a); (b) is a lighter variant.
- **Live-tail / streaming** pages (`log/live-tail.vue`, `trap-viewer/live-trap-viewer.vue`) — a streaming
  variant of List/Explorer.
- **Full-screen Dashboard** (NOC player) — a Dashboard variant that drops the shell for an immersive,
  auto-rotating board with its own control bar.

## Best practices

- Pick the template by **what the page is for** (browse → List; one record → Form/Detail; metrics →
  Dashboard; query a dataset → Explorer; guided task → Wizard), then assemble from the catalogued components.
- **List views**: title + live count in the header, primary **Add** top-right, filters in the toolbar, a
  **bulk-action bar** only on selection, severity/status via Severity/Tag, always paginate.
- **Forms**: 6/6 `MRow`/`MCol`, full-width for textareas; complex forms prefer **`MTab` sub-sections** over
  multi-route; destructive saves confirm via Modal; settings forms full-screen via `hideSettingsMenu`.
- **Drawers over routes** for create/edit/detail off a list — the product's default record surface
  (`FlotoDrawerForm`, 40–90% width).
- **Detail headers**: use the **Severity dot** for severity *levels* and **Tag** for status *strings* —
  they are not interchangeable.
- For a graph/canvas page, reuse the topology pattern (tree + canvas + minimap + saved positions + keyboard
  nav) rather than rebuilding it.
