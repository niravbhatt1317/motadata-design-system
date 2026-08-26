# ObserveOps DS — Authoring Playbook (build a whole page / flow, the way we would)

**Read this after `AGENTS.md`.** `AGENTS.md` is the *contract* (the hard rules). This is the *method* — the
end-to-end loop any AI tool follows to turn a request ("build a Monitors page with an add-monitor form and a
delete flow") into product-faithful UI: understand → plan the screens → choose layout & placement → decide the
**surface** (page vs drawer vs modal vs panel vs popover) → select each **component + variant with a written
reason** → build with the real DS components → **validate the render** → fix → finalize.

The DS gives you the parts and the decisions; this playbook sequences them so the output looks and behaves like
ObserveOps, not like a generic admin theme. **Never skip a step. Never guess where the DS has an answer.**

---

## Step 1 — Understand

Restate the request in your own words, then **enumerate the screens/steps** in the flow. A "flow" is rarely one
screen — "manage monitors" is a *list* screen + an *add/edit* surface + a *delete confirm* + maybe a *detail*
view. Write the list before building anything. For each screen note: its job, whether it holds a list you must
keep in context, and whether it's linkable/shareable.

## Step 2 — Layout & placement (the shell + regions)

Pick the **shell** first (`get_layout('shells')` / `registry/layout-shells.json` `decisionFlow`), then the
**screen regions** (`layout-screen-regions`) and **content layout** (the 12-col grid, `layout-grid`, for forms:
`6+6` half, `12` full, gutter 16). Every authenticated screen mounts inside the **app shell**
(`layout-app-shell`) — don't recreate the top bar / icon rail. Cite what you chose and why.

## Step 3 — Surface decision (page vs drawer vs modal vs panel vs popover)

For **each screen** in your Step-1 list, choose the surface. This is a deliberate product split — get it right and
the app feels native; get it wrong and it feels bolted-on. Decide with this table, then cite the rule you used.

| Surface | Choose when | Don't use when | Spec |
| --- | --- | --- | --- |
| **Full page / route** | High-complexity record or multi-section editor; must be **deep-linkable** / in browser history; user needs the whole viewport; multi-pane. | A quick edit where losing the list context hurts; a simple confirm. | `layout-shells`, `layout-page-templates` |
| **Drawer** (side panel) | Create/edit a record **while keeping the list visible/behind**; a contextual detail peek; a medium form you return from to the same list. | The task needs the full viewport (→ page); a yes/no confirm (→ modal). | `drawer.json` |
| **Modal** | A **short, focused, blocking** task or a **confirm/destructive** action; a small form (≤ a few fields) that must interrupt. | A long/complex form (→ drawer or page); anything deep-linkable. | `modal.json` |
| **Inline panel / collapsible** | Progressive disclosure **within** the current screen (an expandable section, an inline settings block) that shouldn't overlay. | Content that must float above / interrupt (→ modal/popover). | `layout-panels.json` |
| **Popover** | A tiny transient bit of UI anchored to a control — a mini-form, a picker, a "+N" overflow, a menu. | More than a couple of fields; anything you'd deep-link. | `popover.json` |

**The load-bearing calls:** *edit-while-keeping-the-list* → **drawer**, *confirm/destructive* → **modal**,
*complex deep-linkable record* → **full page**. When two seem to fit, prefer the lighter surface that preserves
the user's context, unless deep-linkability or viewport need forces a page.

## Step 4 — Select each component + variant, WITH a reason

For every interactive/visual element, `search_components` → `get_component`, then choose the **variant/state** and
**write one line of rationale** citing the registry's `decisionFlow` / `usageRules` — *why this, not the
alternative*. This is not optional prose; the which-variant-when judge and the reviewer check it.

Examples of the rationale you must produce:

- Primary action button → `variant="primary"` (navy) because "one primary action per view; this is the commit"
  — **not** `variant="error"` (that's for destructive) and **not** two primaries.
- A destructive confirm's button → `variant="danger"`/`error` per `button.json` `usageRules`.
- Status pill → `obs-tag variant="tag-green"` for a healthy/active state (per `tag.json` `variantEnum` +
  `usageRules`) — **not** a hand-rolled `<span>` dot, and **not** `obs-severity` unless it's a monitoring
  severity level (`critical/major/warning/…`).
- Free-text add/remove tags → `LooseTags`; a read-only multi-select display → `selected-pills`; a monitoring
  severity → `severity`. These look similar and are chosen by *purpose*, not appearance.

If nothing in `index.json` covers a needed archetype (chart/graph/topology/widget-tile, or any primitive the DS
lacks) → **STOP and ASK** (see Step 6). Do not substitute or import from another library.

## Step 5 — Build with the real DS components (DS-only)

Build with **`@mtdt/observeops-ds-elements`** — the real `obs-*` web components (`<obs-button variant="primary">`,
works in React/Vue/plain HTML). The output *is* the DS component, so a fabricated look-alike is impossible.
Load `@mtdt/observeops-ds-css` for the tokens. Resolve **every** colour via `resolve_token`/`get_theme` (brand =
navy `--primary`, never cyan/blue); structural tokens (spacing/radius/type) are LESS `@vars` → emit via
`<style lang="less">` or Tailwind, never raw px. Events deliver the value in `e.detail` as an **array** — unwrap:
`Array.isArray(e.detail) ? e.detail[0] : e.detail`.

## Step 6 — STOP-and-ASK (the deviation rule)

Two very different situations — don't confuse them:

- **A screen with no matching recipe → just BUILD it** by composing catalogued components + tokens + layout.
  A missing *recipe* is never a reason to stop; composing existing parts into new screens is the whole point.
- **You'd need a building block NOT in the DS → STOP and ASK.** A component archetype absent from `index.json`
  (chart/graph/topology/widget-tile), a colour/token outside the palette, any primitive the DS lacks
  (`list_gaps` surfaces the known ones). State: what you're building, the missing block, what you checked, why
  no catalogued block covers it, and the external thing you propose. Then **record it in the declared-gaps
  manifest** (see Step 8) and wait for approval. A silently-substituted non-DS block is a contract breach.

## Step 7 — Validate the render (not just the rules)

Run the conformance checker on what you *rendered*:
`node node_modules/@mtdt/observeops-ds-spec/conformance/ds-conformance.mjs <page.html>` (or the MCP
`validate_render`). It scores 0–100 across **token · component · variant · philosophy · layout** and lists every
violation with the fix (off-token colour → nearest DS token, blue-instead-of-navy, `mds-*`, a raw
`<button>/<input>/<a>` or fabricated chip instead of an `obs-*` component, an invalid/invented variant name, an
icon-only control missing `aria-label`). Static rules ≠ rendered truth — this catches "chose right but rendered
approximately."

## Step 8 — Fix loop, then finalize

Iterate Step 5 ↔ Step 7 until conformance **≥ 90** and the which-variant-when judge passes (no semantically wrong
choice, e.g. an `error`-variant Save button). Then finalize and emit:

1. the page(s)/flow,
2. a **rationale summary** — for each screen: the shell + surface chosen (and why), and per element the
   component + variant + the one-line reason, citing the `decisionFlow`/`recipe`/`token`,
3. a **components manifest (REQUIRED)** — list every element as one of: (a) a real `obs-*` you used, (b) a
   **hand-composed reproduction** of a catalogued organism the elements package doesn't ship yet (table, drawer,
   modal, menu, toolbars/page-header, pagination, bulk-action-bar — these are *canonically known* gaps, so raw
   controls inside them are expected and are NOT a breach; the conformance checker scores but doesn't fail them),
   or (c) a **declared gap** — a whole archetype the DS lacks (chart/topology/widget canvas) that you STOP-and-ASK'd
   about. An undeclared archetype from (c) *is* a contract breach and `ds-conformance` hard-fails it; (b) is normal
   composition. Emitting this manifest is part of "done."

---

## The self-check (before you say "done")

- [ ] Screens enumerated; each has a shell + a **surface** chosen with a cited reason.
- [ ] Every element is a catalogued component built as the real `obs-*` — no raw controls, no look-alikes.
- [ ] Every component's **variant/state** chosen with a one-line rationale from `decisionFlow`/`usageRules`.
- [ ] Every colour is a resolved token (brand navy, not blue/cyan); no `mds-*`; spacing on the structural scale.
- [ ] Any missing building block was **asked** and put on the declared-gaps manifest — never substituted.
- [ ] `ds-conformance` ≥ 90 and the judge passes; violations fixed, not waived.
- [ ] Finalized with the rationale summary + declared-gaps manifest.
