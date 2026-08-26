// Small string utilities for the static generator (zero deps).

/** HTML-escape text for safe interpolation into element bodies/attributes. */
export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** camelCase → kebab-case (checkedText → checked-text). */
export function kebab(s) {
  return String(s).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** Title-case a slug-ish id for display fallback (selected-pills → Selected Pills). */
export function titleize(s) {
  return String(s).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Build a className string from a map of {name: truthy}. */
export function cx(map) {
  return Object.entries(map).filter(([, v]) => v).map(([k]) => k).join(' ')
}
