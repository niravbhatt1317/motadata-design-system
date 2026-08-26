# Publishing — `@mtdt/observeops-ds-spec`

How to (re)publish the AI-consumable design-system spec package. **Any session touching the spec and
needing to ship it: read this.** The package is the machine-readable half of the DS (the other half is
the visual Storybook). It was first published **2026-06-18** as `@mtdt/observeops-ds-spec@0.1.0`.

## TL;DR — republish after changing the spec

```bash
# 1. bump "version" in design-system/package/package.json (semver), then:
bash design-system/scripts/publish-spec.sh
```

`publish-spec.sh` does it all in one shot: build from canonical sources → validate → **guard against
re-publishing an existing version** (clear message if you forgot to bump) → `npm publish` → print the
npm + CDN URLs. Run it from anywhere in the repo.

Prefer the manual steps? They're equivalent:

```bash
cd design-system/package
node ../scripts/build-spec-package.js     # reassemble package/ from canonical sources + manifest
node ../scripts/validate-spec.js          # gate — must print "OK"
npm publish                               # scoped + public is set via publishConfig in package.json
```

Then verify it's live (give the CDN a few minutes on a brand-new version):

```bash
npm view @mtdt/observeops-ds-spec version
curl -sI "https://cdn.jsdelivr.net/npm/@mtdt/observeops-ds-spec/llms.txt"   # expect HTTP 200
```

## Prerequisites

- **Logged in to npm** (`npm login`; `npm whoami` to check) as a member of the **`mtdt`** org.
- **Node 18** (`nvm use 18`).
- First-ever publish of the scope needed `--access public`; thereafter `publishConfig.access: public`
  in `package.json` handles it, so plain `npm publish` is enough.

## How it's built (don't hand-edit `package/` spec files)

The package is **assembled from canonical sources** — never edit the copied files under
`design-system/package/{components,tokens,layout,foundation}` or `package/{AGENTS.md,llms.txt}`; they
are overwritten on every build. Edit the **originals** in `design-system/` then rebuild.

- `scripts/build-spec-package.js` — copies the consumer-facing spec (index, 26 registries, recipes,
  specs, all tokens incl. flagged-future DTCG, layout, foundation, `AGENTS.md`, `llms.txt`) into
  `package/`, then writes `spec.manifest.json` (file list + sizes + sha256). Excludes Storybook and all
  internal process docs.
- `scripts/validate-spec.js` — the publish gate: every JSON parses · each index component has a
  registry · every `tokensUsed` resolves · every recipe `use` id is catalogued OR the region has a
  `$gap` · manifest checksums match. **Publishing a broken spec is blocked here.**
- Hand-authored (safe to edit): `package/package.json`, `package/index.js` (thin loader),
  `package/README.md`.

## Avoiding the npm 2FA browser prompt

By default npm asks for 2FA on every publish (the browser pop-up). To publish without it, use a
**granular access token with 2FA bypass** — the package's npm settings already permit this ("Require
2FA **or a granular access token with bypass 2FA enabled**"). One-time setup:

1. npmjs.com → avatar → **Access Tokens** → **Generate New Token** → **Granular Access Token**.
2. Set an **Expiration** (e.g. 90 days); **Packages and scopes** → `@mtdt/observeops-ds-spec` (or the
   `@mtdt` org); **Permissions: Read and write**.
3. Copy the `npm_…` token (shown once).
4. Add it to your **home** `~/.npmrc` — NOT the repo:

   ```text
   //registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxxxxx
   ```

   then `chmod 600 ~/.npmrc`.
5. `npm publish` / `publish-spec.sh` no longer prompt for 2FA.

**Security:** this token is a publish credential — keep it in `~/.npmrc` (home, not the repo), give it
an expiry, scope it to just this package, and revoke/rotate if leaked. Never commit it.

**Most robust (no local token):** GitHub Actions **OIDC "Trusted Publisher"** (in the package
Settings). Add a workflow that runs build → validate → `npm publish` on a version tag; publishing
happens in CI with no local token and no 2FA. More setup, but nothing sensitive on any machine and any
teammate can release by tagging.

## Versioning (semver)

- **patch** (0.1.0 → 0.1.1) — fixes, clarifications, token-note tweaks.
- **minor** (0.1.0 → 0.2.0) — added components / recipes / tokens (backward-compatible).
- **major** (0.1.0 → 1.0.0) — a breaking change to the spec shape consumers rely on.

Consumers pin a version, so a bump is what makes new spec reach them.

## Where it's published from

Publish from the **public** `niravbhatt1317/motadata-design-system` repo (built-output-only — the
private product source never goes there). The canonical spec lives in the private product repo under
`UI/design-system/`; the build copies the publishable subset out.

## Canonical URLs

- npm: <https://www.npmjs.com/package/@mtdt/observeops-ds-spec>
- Install: `npm i @mtdt/observeops-ds-spec`
- Web fetch (no install): `https://cdn.jsdelivr.net/npm/@mtdt/observeops-ds-spec/llms.txt`
  (also `/AGENTS.md`, `/components/index.json`, any path; unpkg works too)
- Visual reference (NOT a data source): <https://niravbhatt1317.github.io/motadata-design-system/>

## Troubleshooting

- **jsDelivr "Failed to fetch version info" right after publishing** — normal CDN propagation lag on a
  new version (usually minutes). The npm registry is the source of truth; if `npm view` shows the
  version, the publish worked. Retry the CDN, or use a version-pinned URL
  (`…/npm/@mtdt/observeops-ds-spec@<version>/llms.txt`).
- **`402 Payment Required`** — a scoped package tried to publish private; ensure `--access public`
  (or the `publishConfig` block) is in effect.
- **`403 Forbidden`** — not logged in, not a member of the `mtdt` org, or the version already exists
  (bump the version; you cannot republish the same version).
