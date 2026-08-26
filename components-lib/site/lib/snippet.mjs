// Attribute serialization — the single source of truth for turning an {attrs, text} example into
// real markup AND into a copy-able code snippet. Mirrored at runtime in app.js (serializeLive).
import { esc, kebab } from './escape.mjs'

/**
 * Serialize attrs to a string of ` k="v"` / ` k` fragments.
 *   true            -> bare attribute (checked)
 *   false/null/''   -> omitted
 *   string/number   -> k="v"
 * Keys are written as given if they already contain '-', else kebab-cased.
 */
export function attrString(attrs = {}) {
  const parts = []
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null || v === '') continue
    const name = k.includes('-') ? k : kebab(k)
    if (v === true) parts.push(` ${name}`)
    else parts.push(` ${name}="${esc(v)}"`)
  }
  return parts.join('')
}

/** Full element markup for an example: <obs-button variant="primary">Label</obs-button> */
export function elMarkup(el, attrs = {}, text = '') {
  return `<${el}${attrString(attrs)}>${text == null ? '' : esc(text)}</${el}>`
}

/** Same, but for the live <script> snippet (kept identical to elMarkup so copy === render). */
export function snippet(el, attrs = {}, text = '') {
  return elMarkup(el, attrs, text)
}
