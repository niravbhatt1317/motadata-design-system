# Component Registry (machine-readable spec)

One JSON file per component — the **structured, AI-readable** source of truth that
mirrors each component's Storybook docs. Schema: see
[`../README.md`](../README.md#single-source-of-truth-a-component-registry).

Each entry: `name`, `display`, `tier`, `source`, `status`, `summary`, `props` (type /
default / enum), `events`, `states`, `do`, `dont`, `whenToUse`, `insteadOf`,
`tokensUsed`, `storybook` (sidebar path), `figma` (build status).

This feeds: (1) the AI design-system package (`llms.txt` will point here), (2) the
Figma build checklist (`figma.status`), (3) cross-checking the Storybook docs.

> **Resolving `tokensUsed` → real values:** every `--var` in a `tokensUsed` array resolves to its
> light + dark value via [`../../tokens/variables.json`](../../tokens/variables.json) (the as-is
> crosswalk; LESS `@vars` → [`../../tokens/structural.json`](../../tokens/structural.json)). An AI should
> load `variables.json` to render product-faithful colours. The `--primary` drift is resolved there
> (`--primary` = navy `#111c2c`, **not** cyan `#099dd9`).

## Coverage

| Component | Tier | Status | Storybook |
| --- | --- | --- | --- |
| Button | atom | ✅ full spec | Atoms/Button |
| Checkbox | atom | ✅ full spec | Atoms/Checkbox |
| Switch | atom | ✅ full spec | Atoms/Switch |
| Radio | atom | ✅ full spec | Atoms/Radio |
| Link | atom | ✅ full spec | Atoms/Link |
| Input | atom | ✅ full spec | Atoms/Input |
| Select | atom | ✅ full spec (⚠️ low-use) | Atoms/Select |
| Tag | atom | ✅ full spec | Atoms/Tag |
| Form Field | molecule | ✅ full spec | Molecules/FormItem |
| LooseTags | molecule | ✅ full spec | Molecules/LooseTags |
| TagsList | molecule | ✅ full spec (⚠️ dead code) | Molecules/TagsList |
| DropdownPicker | organism | ✅ full spec | Organisms/DropdownPicker |
| Modal | organism | ✅ full spec | Organisms/Modal |
| Drawer | organism | ✅ full spec | Organisms/Drawer |
| Tooltip | molecule | ✅ full spec | Molecules/Tooltip |
| Popover | molecule | ✅ full spec | Molecules/Popover |
| Table / Grid | organism | ✅ full spec | Organisms/Table |
| Grid Toolbar | organism | ✅ full spec | Organisms/Grid Toolbar |

Remaining atoms/molecules/organisms tracked in [`../inventory.md`](../inventory.md).
</content>
