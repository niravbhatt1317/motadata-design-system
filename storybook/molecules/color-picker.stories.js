// Molecules / Color Picker — color-picker.vue (Group C: a swatch trigger opening a colour canvas + preset
// palette via MPopover + vue-color's Sketch). A settings/branding widget: pick a colour or "transparent".
export default { title: 'Molecules/Color Picker/Examples' }

// the product's 16 preset colours (color-picker.vue presetColors)
const PRESETS = ['#0D9488', '#F97316', '#9333EA', '#65A30D', '#DB2777', '#0891B2', '#CA8A04', '#EF4444',
  '#059669', '#C026D3', '#F59E0B', '#7C3AED', '#EA580C', '#14B8A6', '#E11D48', '#84CC16']

// a 20×20 swatch preview + chevron (the collapsed trigger)
const swatch = (color) => `<div style="display:inline-flex;align-items:center;gap:8px;cursor:pointer">`
  + (color === 'transparent'
    ? `<span style="width:20px;height:20px;border:1px solid var(--border-color);display:inline-flex;align-items:center;justify-content:center"><span style="width:1px;height:22px;background:var(--secondary-red);transform:rotate(135deg)"></span></span>`
    : `<span style="width:20px;height:20px;border-radius:2px;background:${color}"></span>`)
  + `<svg width="10" height="10" viewBox="0 0 48 48" fill="var(--neutral-light)" aria-hidden="true"><path d="M37.4,16.6c-.8-.8-2-.8-2.8,0l-10.6,10.6-10.6-10.6c-.8-.8-2-.8-2.8,0-.8,.8-.8,2,0,2.8l12,12c.8,.8,2,.8,2.8,0l12-12c.8-.8,.8-2,0-2.8Z"/></svg></div>`

export const ColorPicker = () => ({
  data: () => ({ value: '#0D9488', presets: PRESETS, open: true }),
  methods: { swatch, pick(c) { this.value = c } },
  template: `
    <div style="color:var(--page-text-color);max-width:360px">
      <div class="text-neutral-light mb-3" style="font-size:12px">A <strong>colour picker</strong> (<code>color-picker.vue</code>) — a swatch trigger opens a colour canvas + a <strong>16-colour preset palette</strong> (MPopover + vue-color Sketch). Used for branding / threshold / widget colours; supports <code>transparent</code>.</div>
      <div style="display:inline-block" v-html="swatch(value)" @click="open=!open"></div>
      <div v-if="open" style="margin-top:8px;width:220px;padding:12px;background:var(--page-background-color);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 6px 20px var(--neutral-shadow-light)">
        <div style="font-size:11px;color:var(--neutral-light);margin-bottom:8px;font-family:'JetBrains Mono',monospace">PRESETS</div>
        <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px">
          <span v-for="c in presets" :key="c" @click="pick(c)" :title="c"
            style="width:20px;height:20px;border-radius:3px;cursor:pointer;box-sizing:border-box"
            :style="{ background:c, outline: value===c ? '2px solid var(--primary)' : 'none', outlineOffset:'1px' }"></span>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:8px;font-size:12px">
          <span style="width:18px;height:18px;border-radius:3px;background:var(--code-tag-background-color);display:inline-flex;align-items:center;justify-content:center;color:var(--neutral-light);font-size:11px">#</span>
          <span style="font-family:'JetBrains Mono',monospace">{{ value }}</span>
        </div>
      </div>
    </div>`,
})
ColorPicker.parameters = { controls: { disable: true }, docs: { description: { story: 'The **colour picker** (`color-picker.vue`) — a **20×20 swatch preview + chevron** trigger opening an `MPopover` with a colour canvas (`vue-color` Sketch) and a **16-colour preset palette**. The selected preset shows a `--primary` outline; the current value is shown as a hex. `transparent` renders a swatch with a red diagonal line. Used for branding, widget, threshold and severity colour selection. Click a preset.' } } }
