// Atoms / Severity — the severity-LEVEL indicator (severity.vue + severity.less, 80×). The SAME
// severity classes render in several shapes: a DOT (2px coloured border + light centre), a SOLID chip
// (filled + white text), coloured TEXT (numeric, JetBrains Mono), and a BG-FILL row/cell (light tint +
// coloured border). Plus the family: stripe, picker, count-box, switch. Distinct from MStatusTag
// (status STRINGS → tag-* pill). Reproduced with the real --severity-* tokens.

// fill = -dot-box where it exists, else -lighter (up/down/disable have no -dot-box); down is a SOLID dot.
const LEVELS = [
  { l: 'up', base: '--severity-up', fill: '--severity-critical-dot-box', quirk: true }, // product: green ring + critical (light-red) centre (severity.less)
  { l: 'clear', base: '--severity-clear', fill: '--severity-clear-dot-box' },
  { l: 'critical', base: '--severity-critical', fill: '--severity-critical-dot-box' },
  { l: 'major', base: '--severity-major', fill: '--severity-major-dot-box' },
  { l: 'warning', base: '--severity-warning', fill: '--severity-warning-dot-box' },
  { l: 'down', base: '--severity-down', fill: '--severity-down', solid: true },
  { l: 'maintenance', base: '--severity-maintenance', fill: '--severity-maintenance-dot-box' },
  { l: 'unreachable', base: '--severity-unreachable', fill: '--severity-unreachable-dot-box' },
  { l: 'suspended', base: '--severity-suspended', fill: '--severity-suspended-dot-box' },
  { l: 'stop', base: '--severity-stop', fill: '--severity-stop-dot-box' },
  { l: 'disable', base: '--severity-disable', fill: '--severity-disable-lighter' },
  { l: 'none', base: '--severity-none', fill: '--severity-none-dot-box' },
  { l: 'unknown', base: '--severity-unknown', fill: '--severity-unknown-dot-box' },
]
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default {
  title: 'Atoms/Severity/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Core** · Atom — the **severity-LEVEL** indicator (`severity.vue` / `severity.less`, **80×**). The same severity classes render in several **shapes**: a **dot** (2px `--severity-<level>` border + a light `--severity-<level>-dot-box` centre), a **solid chip** (filled + white text), coloured **text** (numeric, JetBrains Mono), and a **bg-fill** row/cell (light `-lighter` tint + coloured border) — plus the **stripe / picker / count-box / switch** family. **Distinct from `MStatusTag`** (status *strings* → `tag-*` pill): use Severity for `critical / major / warning / clear / up / down / …`. Reproduced with the real `--severity-*` tokens.',
      },
    },
  },
}

function dotStyle(s, size) {
  const px = size || 14
  const common = `display:inline-block;vertical-align:middle;box-sizing:border-box;flex-shrink:0;width:${px}px;height:${px}px;border-radius:50%`
  if (s.solid) return `${common};background:var(${s.base})`
  return `${common};border:2px solid var(${s.base});background:var(${s.fill})`
}

// 1. Levels — the DOT (dark ring + light centre) for every level.
export const Levels = () => ({
  data: () => ({ levels: LEVELS }),
  methods: { cap, dotStyle: (s) => dotStyle(s, 14) },
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <strong>severity dot</strong> — a <strong>2px <code>--severity-&lt;level&gt;</code> border</strong> with a <strong>light <code>--severity-&lt;level&gt;-dot-box</code> centre</strong> (product-accurate: dark ring, lighter fill). <code>down</code> is a solid dot (0px border).</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(150px,1fr));gap:11px 24px;max-width:420px">
        <div v-for="s in levels" :key="s.l" class="flex items-center" style="gap:10px">
          <span :style="dotStyle(s)"></span><span style="font-size:13px">{{ cap(s.l) }}</span>
        </div>
      </div>
    </div>`,
})
Levels.parameters = { controls: { disable: true }, docs: { description: { story: 'All 13 levels as the **dot**: a coloured **ring** (`--severity-<level>`, 2px) around a **light centre** (`--severity-<level>-dot-box`, or `-lighter` where no dot-box) — matching the product (dark border, lighter fill). `down` (and the no-dot-box `disable`) render solid/tinted. **Mirrors a product quirk:** `up` uses a **green ring + a critical (light-red) centre** (`--severity-critical-dot-box`) — that\'s exactly what `severity.less` does for `up`. Real size in product is 11px.' } } }

// 2. Shapes — the SAME severity in its different render modes (answers "other ways severity is shown").
export const Shapes = () => ({
  data: () => ({ rows: [LEVELS[2], LEVELS[3], LEVELS[4], LEVELS[1], LEVELS[5]], headers: ['Dot', 'Solid chip', 'Coloured text', 'Bg-fill cell', 'Stripe'] }),
  methods: {
    cap, dotStyle: (s) => dotStyle(s, 14),
    chip: (s) => `display:inline-flex;align-items:center;padding:1px 10px;border-radius:10px;background:var(${s.base});color:var(--white-regular);font-size:12px`,
    txt: (s) => `color:var(${s.base});font-family:jetBrainsMono,monospace;font-weight:600;font-size:13px`,
    bg: (s) => `display:inline-flex;align-items:center;padding:3px 10px;border-radius:4px;background:var(${s.base}-lighter);border:1px solid var(${s.base});color:var(${s.base});font-size:12px`,
  },
  template: `
    <div style="color:var(--page-text-color)">
      <div class="text-neutral-light mb-3" style="font-size:12px">The same severity, in the <strong>shapes the product uses</strong> — all from the one <code>severity</code> class set (mode via class): <strong>dot</strong> · <strong>solid chip</strong> · <strong>coloured text</strong> (numeric) · <strong>bg-fill cell</strong> · <strong>stripe</strong>.</div>
      <table style="border-collapse:collapse;font-size:13px">
        <thead><tr><th style="text-align:left;padding:6px 16px 6px 0"></th><th v-for="h in headers" :key="h" style="text-align:left;padding:6px 16px;color:var(--neutral-light);font-weight:500;font-size:12px">{{ h }}</th></tr></thead>
        <tbody>
          <tr v-for="s in rows" :key="s.l" style="border-top:1px solid var(--border-color)">
            <td style="padding:9px 16px 9px 0;color:var(--neutral-light)">{{ cap(s.l) }}</td>
            <td style="padding:9px 16px"><span :style="dotStyle(s)"></span></td>
            <td style="padding:9px 16px"><span :style="chip(s)">{{ cap(s.l) }}</span></td>
            <td style="padding:9px 16px"><span :style="txt(s)">98.6</span></td>
            <td style="padding:9px 16px"><span :style="bg(s)">{{ cap(s.l) }}</span></td>
            <td style="padding:9px 16px"><span class="flex items-center" style="gap:8px"><span :style="{width:'4px',height:'18px',background:'var(' + s.base + ')',borderRadius:'2px'}"></span><span style="font-size:12px">row</span></span></td>
          </tr>
        </tbody>
      </table>
    </div>`,
})
Shapes.parameters = { controls: { disable: true }, docs: { description: { story: 'The product renders severity in **several shapes from the same `severity.less` class set** (the mode is a class on the element): **dot** (ring + light centre), **solid chip** (`background:--severity-<level>` + white text), **coloured text** (`.text` — numeric value in the severity colour, JetBrains Mono), and **bg-fill cell** (`generateSeverityBg` — `-lighter` tint + 1px coloured border), plus the **stripe** (left rule). Also rendered as: **count boxes** (alert dashboard), **graph-node colour** (topology), **map markers** (RUM apdex) and **heatmap cells** — those are owned by the chart/graph layer (see Data-Viz Tooltips / Table), using the same `--severity-*` tokens.' } } }

// 3. Stripe — coloured left rule per list row.
export const Stripe = () => ({
  data: () => ({ rows: [{ n: 'core-switch-01', s: LEVELS[2] }, { n: 'db-primary', s: LEVELS[5] }, { n: 'web-03', s: LEVELS[4] }, { n: 'cache-02', s: LEVELS[1] }, { n: 'lb-edge-1', s: LEVELS[6] }] }),
  methods: { dotStyle: (s) => dotStyle(s, 12) },
  template: `
    <div style="color:var(--page-text-color);max-width:340px">
      <div class="text-neutral-light mb-3" style="font-size:12px">The <code>severity-stripe</code> variant — a coloured left rule per list row (the row\\'s monitor severity).</div>
      <div style="border:1px solid var(--border-color);border-radius:6px;overflow:hidden">
        <div v-for="r in rows" :key="r.n" class="flex items-center" style="border-bottom:1px solid var(--border-color)">
          <span :style="{ width:'4px', alignSelf:'stretch', background: 'var(' + r.s.base + ')' }"></span>
          <span class="flex items-center" style="gap:8px;padding:10px 12px;font-size:13px"><span :style="dotStyle(r.s)"></span>{{ r.n }}</span>
        </div>
      </div>
    </div>`,
})
Stripe.parameters = { controls: { disable: true }, docs: { description: { story: 'The **`severity-stripe`** family member — a coloured **left rule** (`--severity-<level>`) down a list row/card. Siblings: `severity-picker` (choose a level), `severity-count-box` (counts per severity, alert dashboard), and `severity-switch` (the Alert severity toggle — see Atoms/Radio → Severity switch).' } } }
