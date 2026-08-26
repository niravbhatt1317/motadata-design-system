// verify-component config for `switch`. Compares the track (.ant-switch in the Storybook story vs the
// .sw track inside <obs-switch>'s shadow root in the Elements site page). Playwright pierces open shadow
// DOM, so `obs-switch >> nth=N >> .sw` reaches the inner track.
//
// `mine` targets the Elements site page (`switch.html`). Element order there: #live(0) + States gallery
// (off=1, on=2, disabled=3, disabled-checked=4, loading=5) + Sizes (small=6, default=7) + labels…
// Serve it first: `cd design-system/components-lib && npm run site:dev` (or python3 -m http.server on site/dist).
const SB = 'https://niravbhatt1317.github.io/motadata-design-system/iframe.html'
const STATES = 'atoms-switch-examples--states'
const SIZES = 'atoms-switch-examples--sizes'

module.exports = {
  storybookBase: SB,
  demoUrl: 'http://localhost:4185/switch.html',
  props: ['backgroundColor', 'borderTopWidth', 'borderTopColor', 'borderTopLeftRadius'],
  probes: [
    { label: 'off', storyId: STATES, sb: '.ant-switch >> nth=0', mine: 'obs-switch >> nth=1 >> .sw', states: ['base', 'hover', 'focus'] },
    { label: 'on', storyId: STATES, sb: '.ant-switch >> nth=1', mine: 'obs-switch >> nth=2 >> .sw', states: ['base'] },
    { label: 'disabled', storyId: STATES, sb: '.ant-switch >> nth=2', mine: 'obs-switch >> nth=3 >> .sw', states: ['base'] },
    { label: 'small', storyId: SIZES, sb: '.ant-switch >> nth=0', mine: 'obs-switch >> nth=6 >> .sw', states: ['base'] },
    { label: 'default', storyId: SIZES, sb: '.ant-switch >> nth=1', mine: 'obs-switch >> nth=7 >> .sw', states: ['base'] },
  ],
}
