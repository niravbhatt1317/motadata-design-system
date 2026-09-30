## What & why

<!-- One or two lines: what changed and why. Name the component / page / token it affects. -->

## How I verified

<!-- For a VISUAL change: before/after screenshots in BOTH light and dark. -->
<!-- For a spec/registry change: paste the validator output. -->
<!-- If you matched a reference: say how (the numbers you measured). -->

## Checklist

- [ ] Registry updated **and** a dated `changelog` entry appended (if a component/spec changed)
- [ ] Showcase manifest + `components/index.json` in sync with the registry (variants/counts)
- [ ] `node scripts/validate-registries.mjs` — 0 errors
- [ ] `node scripts/validate-spec.js` — 0 errors
- [ ] Verified in a browser, **light and dark**
- [ ] No hardcoded colours (tokens only; a raw value only as `var(--token, fallback)`)
- [ ] Followed the **Non-negotiables** in `CONTRIBUTING.md`
