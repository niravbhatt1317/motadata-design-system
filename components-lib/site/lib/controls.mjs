// props → control widgets. Each widget carries a data- contract the runtime (app.js) reads to mutate
// the live element: data-attr (the attribute name), data-kind (bool|value|text), data-slot (sets text).
import { esc, kebab, titleize } from './escape.mjs'

/** Resolve the attribute name a control writes (manifest `attr` override, else kebab(prop)). */
export function controlAttr(control) {
  return control.attr || (control.slot ? '' : kebab(control.prop))
}

/** HTML for one control row. `regProp` = registry.props[control.prop] (for enum fallback + default). */
export function controlWidget(control, regProp = {}) {
  const label = esc(control.label || titleize(control.prop))
  const attr = controlAttr(control)

  if (control.slot) {
    const def = esc(control.default || '')
    return field(label, `<input type="text" class="ctl-input" data-slot="1" value="${def}" />`)
  }

  // slot-content presets: a select whose options carry raw HTML for the default slot. An option may ALSO carry
  // `attrs` (applied to the live element on select — e.g. a "Large" drawer type that also sets width + scrolled).
  if (control.slotPresets) {
    const options = control.slotPresets
      // `after` (optional) = markup rendered as a SIBLING right after the live element — e.g. a widget header's
      // chart body, so a "top chrome" variant (border-bottom none) reads as a complete card in the playground.
      .map((p, i) => `<option value="${i}" data-html="${esc(p.html)}" data-attrs="${esc(JSON.stringify(p.attrs || {}))}" data-after="${esc(p.after || '')}"${i === 0 ? ' selected' : ''}>${esc(p.label)}</option>`)
      .join('')
    return field(label, `<select class="ctl-select" data-slot-html="1">${options}</select>`)
  }

  if (control.type === 'toggle') {
    // a prop that DEFAULTS TO TRUE can't be turned off by adding/removing the attr (absent → default true), so mark it:
    // app.js then sets attr="false" when switched off, and shows it checked when it's not explicitly false.
    const defaultOn = control.defaultOn === true || regProp.default === true || regProp.default === 'true'
    return field(
      label,
      `<label class="ctl-toggle"><input type="checkbox" data-attr="${esc(attr)}" data-kind="bool"${defaultOn ? ' data-default-on="1"' : ''} /><span class="ctl-track"></span></label>`
    )
  }

  if (control.type === 'text') {
    const def = esc(control.default || '')
    return field(label, `<input type="text" class="ctl-input" data-attr="${esc(attr)}" data-kind="text" value="${def}" />`)
  }

  // default: select (enum)
  const opts = control.options || regProp.enum || []
  const def = control.default != null ? control.default : regProp.default
  const options = opts
    .map((o) => {
      const val = String(o)
      const labelTxt = val === '' ? '(none)' : val
      const sel = String(def) === val ? ' selected' : ''
      return `<option value="${esc(val)}"${sel}>${esc(labelTxt)}</option>`
    })
    .join('')
  return field(label, `<select class="ctl-select" data-attr="${esc(attr)}" data-kind="value">${options}</select>`)
}

function field(label, control) {
  return `<div class="ctl"><span class="ctl-label">${label}</span><span class="ctl-widget">${control}</span></div>`
}

/** All control rows for a component. */
export function controlsPanel(manifest, registry) {
  const props = registry.props || {}
  return (manifest.controls || []).map((c) => controlWidget(c, props[c.prop] || {})).join('\n')
}
