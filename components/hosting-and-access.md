# Hosting the public Storybook + access gate

How to publish Storybook to a free public URL with a lightweight password gate that
humans hit but AI tools bypass.

## ✅ LIVE

- **URL:** <https://niravbhatt1317.github.io/motadata-design-system/>
- **Password:** `motadata` (default — change per below)
- **Repo (public, built output only):** <https://github.com/niravbhatt1317/motadata-design-system>
  (branch `gh-pages`). Product source is NOT here — it stays private on Azure DevOps.
- **Redeploy after changes:** `design-system/scripts/deploy-gh-pages.sh niravbhatt1317/motadata-design-system`
  (build → strip source maps → force-push `gh-pages`). Run under Node 18.
- **Host:** GitHub Pages (free, public repo). Chosen over Vercel (whose free tier is
  non-commercial-only).

## The access gate (what we built)

`.storybook/manager-head.html` injects a small script into Storybook's static
`index.html`. On open:

- If `localStorage['mds-storybook-gate']` holds the right hash → shows the catalog.
- Otherwise → a full-screen password overlay; on correct password it stores the hash in
  `localStorage` and reveals the catalog.

### Behavior (important clarifications)

- **localStorage persists across refresh AND hard-refresh AND browser restart.** You
  enter the password **once per browser** and won't be asked again until localStorage is
  cleared (or you open a different browser / incognito). This is *less* friction than
  "re-enter on hard refresh" — which is usually what you actually want. If you'd rather
  it forget when the tab/browser closes, switch `localStorage` → `sessionStorage` in the
  gate script.
- **AI tools pass through, no password.** The gate is JavaScript. AI tools / scripts that
  fetch the raw files (`index.json`, `iframe.html`, assets) don't execute it, so they're
  unaffected — exactly the requirement. (More on the right AI path below.)

### Change the password

Default is `motadata`. To change it, replace `EXPECTED_HASH` in
`.storybook/manager-head.html` with the SHA-256 of your password:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
```

### ⚠️ This is obfuscation, not security

A client-side gate keeps casual viewers out but is bypassable by anyone technical (the
static files are all served regardless). Fine for a design-system catalog. If you ever
need **real** protection that's still free: **Cloudflare Access** (Zero Trust) puts
server-side auth (email OTP / SSO) in front of the site, free for up to 50 users, and
you can issue a **service token** so AI/CI bypasses without a password.

## Deploy to a free public URL

Build first (Node 18):

```bash
nvm use 18
npm run build-storybook   # outputs ./storybook-static
```

Then pick a free host:

- **Netlify Drop (fastest, no CLI):** drag the `storybook-static` folder onto
  <https://app.netlify.com/drop> → instant public URL.
- **Netlify / Vercel CLI:** `netlify deploy --dir=storybook-static --prod` or
  `vercel deploy storybook-static --prod` (needs your account login — you run it).
- **Cloudflare Pages:** upload `storybook-static` (and optionally add Cloudflare Access).

> Deploying requires logging into your own hosting account, so that step is yours to run
> — the build + gate are ready.

## The right path for AI tools (don't point them at Storybook HTML)

The gate "lets AI through", but AI shouldn't scrape the Storybook UI anyway. Per the
distribution plan ([`../strategy/distribution.md`](../strategy/distribution.md)), AI
consumes the **separate public design-system package** — tokens + component registry +
rules + `llms.txt`. That's structured and stable; the Storybook is the human visual
reference. So: humans → gated Storybook; AI → open spec package.
</content>
