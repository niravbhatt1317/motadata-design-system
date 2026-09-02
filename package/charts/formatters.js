/**
 * ObserveOps chart formatters — the standard label/tooltip formatters the product uses on its Highcharts widgets.
 *
 * WHY THIS EXISTS: a captured Highcharts config cannot carry its formatter FUNCTIONS through JSON — they were
 * serialised out and marked "«fn»". The shipped fixtures (charts/fixtures/*.json) have those markers REMOVED so the
 * config renders directly (`Highcharts.chart(el, config)` → engine-default number labels). Each fixture lists the
 * formatter slots that were stripped in its `$formatters` array. To get PRODUCT-ACCURATE, unit-aware labels
 * (bytes → GB, bits → Mbps, seconds → "2d 3h", etc.), re-attach one of these by the series' unit:
 *
 *   import { chartFormatters, attachFormatters } from '@mtdt/observeops-ds-spec/charts/formatters.js'
 *   // pick per unit:
 *   config.yAxis.labels.formatter = chartFormatters.bytes
 *   config.tooltip.formatter      = chartFormatters.tooltip(chartFormatters.bytes)
 *   // or bulk-attach the same value formatter to every stripped slot the fixture recorded:
 *   attachFormatters(config, fixture.$formatters, chartFormatters.bytes)
 *
 * Each formatter is a Highcharts-style function: `this` is the axis-label / point / data-label context, so
 * `this.value` (axis) and `this.y` (point) both resolve. All are pure and framework-agnostic.
 */

const nf = (v, d = 2) => (v == null || isNaN(v) ? '–' : Number(v).toLocaleString(undefined, { maximumFractionDigits: d }))
const scale = (v, step, units) => { let i = 0; v = Math.abs(Number(v) || 0); while (v >= step && i < units.length - 1) { v /= step; i++ } return nf(v, v < 10 ? 2 : v < 100 ? 1 : 0) + ' ' + units[i] }

/** value → the raw number (axis or point). */
const val = function () { return this && this.value != null ? this.value : this && this.y != null ? this.y : this }

export const chartFormatters = {
  /** plain number with thousands separators */
  number() { return nf(val.call(this)) },
  /** integer (no decimals) */
  integer() { return nf(val.call(this), 0) },
  /** percentage — value is already 0–100 */
  percent() { return nf(val.call(this), 1) + '%' },
  /** bytes → B / KB / MB / GB / TB / PB (binary 1024) */
  bytes() { return scale(val.call(this), 1024, ['B', 'KB', 'MB', 'GB', 'TB', 'PB']) },
  /** bits-per-second → bps / Kbps / Mbps / Gbps / Tbps (decimal 1000) */
  bitsPerSec() { return scale(val.call(this), 1000, ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps']) },
  /** count → K / M / B (decimal 1000) */
  count() { return scale(val.call(this), 1000, ['', 'K', 'M', 'B']).trim() },
  /** seconds → "Xd Yh Zm Ws" (uptime / duration) */
  duration() { let s = Math.max(0, Math.round(Number(val.call(this)) || 0)); const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); s %= 60; return [d && d + 'd', h && h + 'h', m && m + 'm', (s || (!d && !h && !m)) && s + 's'].filter(Boolean).join(' ') },
  /** epoch-ms → local date-time (x-axis timestamps) */
  dateTime() { const v = val.call(this); const dt = new Date(Number(v)); return isNaN(dt.getTime()) ? String(v) : dt.toLocaleString() },
  /**
   * wrap a value-formatter into a shared TOOLTIP formatter (series name + formatted value per point).
   *   config.tooltip.formatter = chartFormatters.tooltip(chartFormatters.bytes)
   */
  tooltip(valueFmt) {
    const f = valueFmt || chartFormatters.number
    return function () {
      const pts = this.points || [this]
      const head = this.x != null ? `<b>${this.x}</b><br/>` : ''
      return head + pts.map((p) => `${p.series ? p.series.name + ': ' : ''}${f.call({ value: p.y, y: p.y })}`).join('<br/>')
    }
  },
}

/** Attach the same value-formatter to every formatter slot a fixture recorded in `$formatters`. */
export function attachFormatters(config, formatterPaths, valueFmt) {
  const fmt = valueFmt || chartFormatters.number
  for (const p of formatterPaths || []) {
    const keys = p.replace(/^config\./, '').split('.')
    let o = config
    for (let i = 0; i < keys.length - 1; i++) { if (o[keys[i]] == null) o[keys[i]] = {}; o = o[keys[i]] }
    const leaf = keys[keys.length - 1]
    o[leaf] = leaf === 'formatter' && p.includes('tooltip') ? chartFormatters.tooltip(fmt) : fmt
  }
  return config
}
