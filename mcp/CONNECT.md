# Turning on the design-system helper in Claude Code (plain-English guide)

This is a simple, no-jargon guide to **Step 2**: switching on the design-system "helper" so Claude
uses your design system automatically. You only do this **once**.

## What this is, in plain words

You published a small program to the internet (`@mtdt/observeops-ds-mcp`). On its own it does nothing.
Step 2 *connects* it to Claude Code so that when you ask Claude to build a screen, Claude quietly looks
up your real components, colours, and rules — instead of making things up.

Think of it like installing a plugin: once it's on, it just works in the background.

## Where you type these things

In the **Terminal** — the same dark window where you ran the `npm publish` command. (On a Mac it's the
app called "Terminal".) You type/paste a line and press **Enter**.

## The one-time setup (2 lines)

> ⚠️ Do this only **after** I tell you the package is "live". If you run it too early you'll see a
> "not found" error — just wait a few minutes and try again.

**1. Turn the helper on** — paste this line and press Enter:

```bash
claude mcp add observeops-ds -s user -- npx -y @mtdt/observeops-ds-mcp
```

What it means in plain words: *"Claude, add a helper I'll call **observeops-ds**, available in all my
projects, by downloading and running the package we published."*

**2. Check it worked** — paste this and press Enter:

```bash
claude mcp list
```

You should see **observeops-ds** in the list (usually with a ✓ or the word "connected"). That's it —
the helper is on.

**3. Reopen Claude Code** (start a fresh chat) so it notices the new helper.

## How you actually use it

You don't do anything special — just talk to Claude normally. In a new chat, try:

```text
Using the observeops-ds design system, build a Users list page for ObserveOps.
```

Claude will now pull the right components and colours from your design system.

To see the "ask first" safety rule in action, try:

```text
Build a dashboard with a CPU line chart.
```

Claude should **pause and ask you**, because charts aren't in the design system yet — exactly the
behaviour we built. If it asks instead of inventing a chart, everything is working.

## What the scary words mean

- **Terminal** — the dark window where you type commands.
- **`claude mcp add`** — "add a helper to Claude."
- **`observeops-ds`** — the nickname for your design-system helper (you can call it anything).
- **`-s user`** — "make it available in all my projects" (just for you).
- **`npx -y @mtdt/observeops-ds-mcp`** — "download and run the helper we published."

## If something goes wrong

- **"could not determine executable" / "not found: @mtdt/observeops-ds-mcp"** → the package hasn't
  finished going live yet. Wait a few minutes, then re-run the line from step 1.
- **"command not found: claude"** → the command name for your setup may be different. Tell me and I'll
  give you the exact one.
- **Claude doesn't seem to use it** → make sure you started a **new** chat after step 2, and that
  `claude mcp list` shows it as connected.

## Optional (ignore unless asked)

There's also a "shared/hosted" way to run this for a whole team (the HTTP version). You do **not** need
it for your own use — the steps above are all you need. We can set that up later if the team wants it.
