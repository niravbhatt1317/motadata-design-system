// Showcase manifest for <obs-tooltip>.
const lbl = (t) => t ? `<div style="font-size:11px;color:var(--neutral-light,#6a7fa0);font-family:'JetBrains Mono',monospace;margin-bottom:6px">${t}</div>` : ''
const tip = (attrs, content) => `<obs-tooltip ${attrs}>${content}</obs-tooltip>`
// a roomy centered stage so an OPEN bubble has breathing room in every direction and never overlaps the label or a neighbour
const stage = (inner, pad = '70px 120px') => `<div style="display:flex;align-items:center;justify-content:center;min-height:150px;padding:${pad}">${inner}</div>`
const demo = (label, inner, usage, pad) => ({ html: `<div style="width:100%">${lbl(label)}${stage(inner, pad)}</div>`, usage })
// the rich-content host hover-card body (title + a few key/values)
const card = '<div style="min-width:180px;text-align:left"><div style="font-weight:600;margin-bottom:4px">web-server-01</div><div style="font-size:12px">IP: 10.0.0.12</div><div style="font-size:12px">Status: <span style="color:var(--secondary-green,#1aae9f)">Up</span></div></div>'
export default {
  el: 'obs-tooltip',
  display: 'Tooltip',
  controls: [
    { prop: 'placement', type: 'select', options: ['top', 'top-start', 'top-end', 'bottom', 'left', 'right'] },
    { prop: 'disabled', type: 'toggle' },
    { prop: 'chart-like', type: 'toggle', label: 'Chart-like (light)' },
    { prop: 'trigger-label', type: 'text', label: 'Trigger label (blank = ⓘ)' },
    { label: 'Content', slotPresets: [
      { label: 'Plain text', html: 'A tooltip — placement: top.' },
      { label: 'Rich (host hover-card)', html: card },
    ] },
  ],
  playground: { attrs: { 'trigger-label': 'Hover me', placement: 'top' }, text: 'A tooltip — placement: top.' },
  gallery: [
    { group: 'Default — the info-circle idiom (the 94× pattern); dark bubble', items: [
      demo('hover the ⓘ', tip('open placement="top-start"', 'How often the monitor is polled, in seconds.'), '73×'),
    ] },
    { group: 'Variant: chart-like (light chart-surface bubble)', items: [
      demo('overlay-class-name="chart-like-tooltip"', tip('open placement="top" chart-like trigger-label="chart-like (light)"', 'A chart-surface tooltip — light background, page text.'), '2×'),
    ] },
    { group: 'Rich content — the body is a slot (a title + a few key/values, like a host hover-card)', items: [
      { html: `<div style="width:100%">${lbl('placement="right" — keep it brief & non-interactive (for interactive panels use Popover)')}<div style="display:flex;align-items:center;justify-content:center;min-height:170px;padding:50px 70px 50px 70px">${tip('open placement="right" trigger-label="web-server-01"', card)}</div></div>` },
    ] },
    { group: 'Placements — top · bottom · left · right (each shown open)', items: [
      { html: `<div style="width:100%">${lbl('placement = top | bottom | left | right')}<div style="display:flex;flex-direction:column;gap:6px">${
        ['top', 'bottom', 'left', 'right'].map((p) => `<div style="display:flex;align-items:center;justify-content:center;min-height:120px;padding:56px 20px">${tip(`open placement="${p}" trigger-label="${p}"`, `Tooltip on the ${p}.`)}</div>`).join('')
      }</div></div>` },
    ] },
    { group: 'Disabled — trigger renders inline, no tooltip', items: [
      demo('', tip('disabled trigger-label="Disabled (no tooltip)"', "You won't see me."), undefined, '24px 20px'),
    ] },
  ],
}
