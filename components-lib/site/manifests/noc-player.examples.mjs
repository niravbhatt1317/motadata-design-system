// Showcase manifest for <obs-noc-player> — the NOC / wallboard rotator chrome (Playback & Timeline). A top bar that
// cycles dashboards on a countdown: logo · ‹ prev · title · next › · countdown + play/pause + exit, over a body slot
// that holds the current dashboard. Self-contained playback (timer + ←/→/space/Esc). Source: dashboard/noc-player.vue.
const J = (v) => JSON.stringify(v)
const DASH = J(['DB Activities', 'Network Overview', 'Server Health', 'Application Performance'])
// REUSE obs-logo (the DS logo element) for the brand — theme-aware (see the element's :host-context dark rule)
const LOGO = `<obs-logo slot="logo" name="motadata" size="26"></obs-logo>`
// a "kinda skeleton" dashboard grid (NO real chart) so the body reads like the product wallboard while it rotates
const SKEL = `<div class="pg-sk-grid"><div class="pg-sk"></div><div class="pg-sk"></div><div class="pg-sk"></div><div class="pg-sk tall"></div><div class="pg-sk wide"></div><div class="pg-sk"></div><div class="pg-sk wide"></div><div class="pg-sk"></div><div class="pg-sk"></div></div>`
// a compact one-line placeholder for the small gallery examples
const BODY = `<div style="height:180px" class="pg-sk"></div>`
const box = (label, inner, w = '') => ({ html:
  `<div><div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:10px">${label}</div><div style="${w}">${inner}</div></div>` })

export default {
  el: 'obs-noc-player',
  display: 'NOC Player',
  registry: 'noc-player',
  summary: 'The NOC / wallboard rotator chrome — a top bar that auto-cycles a set of dashboards on a countdown (logo · prev/title/next · countdown + play/pause + exit) over a body slot for the current dashboard. Self-contained playback: an internal timer advances; ←/→ step, space pauses, Esc exits. Part of the Playback & Timeline family. Watch it count down and rotate.',
  controls: [
    { label: 'Brand', slotPresets: [
      { label: 'With logo', attrs: { interval: '6', dashboards: DASH }, html: LOGO + SKEL },
      { label: 'No logo', attrs: { interval: '6', dashboards: DASH }, html: SKEL },
    ] },
    { prop: 'interval', type: 'text', default: '6', label: 'Interval (s)' },
    { prop: 'paused', type: 'toggle' },
  ],
  playground: {
    attrs: { interval: '6' },
    text: '',
    // full-height skeleton wallboard: obs-logo brand + rotating bar on top; the rest is skeleton dashboard tiles (⛶)
    live: `<obs-noc-player interval="6" dashboards='${DASH}'>${LOGO}${SKEL}</obs-noc-player>`,
  },
  gallery: [
    { group: 'Rotating (multiple dashboards) — the bar shows the current title with prev/next; the countdown ticks and auto-advances (here every 6s). Play/pause holds it; the ✕ exits. The body slot holds the current dashboard', items: [
      box('3 dashboards, 6s interval — watch it rotate', `<div style="border:1px solid var(--border-color,#e3e8f2);border-radius:8px;overflow:hidden"><obs-noc-player interval="6" dashboards='${DASH}'>${BODY}</obs-noc-player></div>`),
    ] },
    { group: 'With a logo — drop an obs-logo into the `logo` slot (theme-aware) for the brand on the left, like the product wallboard. For an arbitrary tenant image use the `logo` src prop instead', items: [
      box('obs-logo (motadata) + rotating', `<div style="border:1px solid var(--border-color,#e3e8f2);border-radius:8px;overflow:hidden"><obs-noc-player interval="8" dashboards='${DASH}'>${LOGO}${BODY}</obs-noc-player></div>`),
    ] },
    { group: 'Single dashboard — with only one dashboard there is nothing to rotate: no prev/next, no countdown, no play/pause — just the title and the exit control', items: [
      box('one dashboard (no rotation controls)', `<div style="border:1px solid var(--border-color,#e3e8f2);border-radius:8px;overflow:hidden"><obs-noc-player dashboards='${J(['Network Overview'])}'>${BODY}</obs-noc-player></div>`),
    ] },
    { group: 'Empty — no dashboards configured in the NOC shows a friendly placeholder', items: [
      box('no dashboards', `<div style="border:1px solid var(--border-color,#e3e8f2);border-radius:8px;overflow:hidden"><obs-noc-player dashboards='[]'></obs-noc-player></div>`),
    ] },
  ],
}
