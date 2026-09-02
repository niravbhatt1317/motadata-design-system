#!/usr/bin/env node
/**
 * sanitize-fixture.mjs — turn a raw captured chart config into a publishable fixture.
 *
 *   node scripts/sanitize-fixture.mjs <raw.json> <out.json> [--label <name>]
 *
 * Raw captures come from a running host application and contain real infrastructure
 * identifiers. They must NEVER be committed. This strips every identifying field and
 * rewrites series names to generic hosts, while preserving array shape, point counts
 * and all visual configuration — the parts that make a fixture render identically.
 *
 * Functions (tooltip.formatter, labels.formatter, chart.events.*) cannot survive JSON.
 * They are replaced with the marker "«fn»" so the config diff can still assert that a
 * formatter EXISTS at that path, even though its body is not comparable.
 */
import fs from 'node:fs'

/** Keys removed outright — host/entity identifiers and runtime state. `formattedValues` is
 *  DELIBERATELY KEPT (moved out of this set): it holds the preformatted display strings the
 *  product tooltip shows ("57.86%", "1.24 GB"). They are derived display text with no identity,
 *  and they are the only way to reproduce the product tooltip outside the product. */
const STRIP = new Set([
  'counterRawName', 'ip', 'entity', 'monitor', 'id', 'guid',
  'resultByResolver', 'zoomInfo',
])

/** Generic replacement host names, assigned by series index. */
const HOSTS = [
  'web-01', 'web-02', 'db-01', 'db-02', 'cache-01',
  'queue-01', 'edge-01', 'edge-02', 'worker-01', 'worker-02',
]

const FN = '«fn»'

/**
 * Host-like strings appear as VALUES deep inside result payloads (grid rows, category
 * axes, drilldown keys), not just as object keys. Key-based stripping alone misses them.
 *
 * Mapping is stable per run: the same source host always maps to the same generic name,
 * so series count, grouping and repetition stay faithful.
 */
const FQDN = /\b[A-Za-z0-9][A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+)*\.(?:com|net|org|local|internal|lan|io|corp|intra)\b/gi
const HOSTISH = /\b[A-Z]{2,}[0-9]?-[0-9]{2,}(?:-[0-9]+)+\b/g

const hostMap = new Map()
function genericHost(original) {
  if (!hostMap.has(original)) hostMap.set(original, HOSTS[hostMap.size % HOSTS.length] + (hostMap.size >= HOSTS.length ? `-${Math.floor(hostMap.size / HOSTS.length)}` : ''))
  return hostMap.get(original)
}
/**
 * Dotted lowercase identifiers are the host's SERVER CONTRACT — metric namespaces
 * (`system.cpu.percent`) and column keys (`policy.name`, `policy.id`). Publishing them
 * publishes the backend API surface, so they are mapped to neutral equivalents.
 * Mapping is stable, so a key used in two places stays consistent across the fixture.
 */
const DOTTED = /\b[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+\b/g
const dottedMap = new Map()
function genericDotted(original) {
  if (!dottedMap.has(original)) {
    const depth = original.split('.').length
    dottedMap.set(original, depth > 2 ? `metric.series.v${dottedMap.size + 1}` : `field.v${dottedMap.size + 1}`)
  }
  return dottedMap.get(original)
}

const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
const ipMap = new Map()
function genericIp(original) {
  if (!ipMap.has(original)) ipMap.set(original, `198.51.100.${(ipMap.size % 254) + 1}`) // TEST-NET-2, RFC 5737
  return ipMap.get(original)
}
function scrubString(str) {
  return str
    .replace(IPV4, (m) => genericIp(m))
    .replace(FQDN, (m) => `${genericHost(m)}.example`)
    .replace(HOSTISH, (m) => genericHost(m))
    .replace(DOTTED, (m) => (/\.(example|com|net|org|local|internal|lan|io|corp|intra)$/i.test(m) ? m : genericDotted(m)))
}

function scrub(value, depth = 0) {
  if (typeof value === 'function') return FN
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1))
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      if (STRIP.has(k)) continue
      // Keys carry the contract too: result rows are keyed by server field names.
      out[scrubString(k)] = scrub(v, depth + 1)
    }
    return out
  }
  if (typeof value === 'string') return scrubString(value)
  return value
}

/** Series names leak the metric namespace AND the monitor identity. The product tooltip renders the
 *  series name verbatim in the shape "countername (monitorname) value" — so the replacement must
 *  KEEP that shape to stay tooltip-faithful: the counter part is scrubbed to the generic dotted
 *  form and the monitor part becomes a generic host in parentheses. */
function genericSeriesName(original, index) {
  const host = HOSTS[index % HOSTS.length] + (index >= HOSTS.length ? `-${Math.floor(index / HOSTS.length)}` : '')
  if (typeof original !== 'string') return `metric.series.v1 (${host})`
  const m = original.match(/^(.*?)\s*\([^)]*\)\s*$/)        // "counter.avg (monitor)"
  const bare = (m ? m[1] : original).trim()
  const counter = scrubString(bare) || 'metric.series.v1'    // system.cpu.percent.avg → metric.series.vN.avg
  return m ? `${counter} (${host})` : counter
}

/**
 * Result payloads can run to a megabyte of rows. Fixtures need enough rows to exercise
 * layout, not the whole dataset — and every extra row of free text is extra leak surface.
 * Truncating is therefore both a size and a safety measure.
 */
const MAX_ROWS = 25
function truncateRows(node) {
  if (Array.isArray(node)) {
    const kept = node.slice(0, MAX_ROWS).map(truncateRows)
    if (node.length > MAX_ROWS) kept.push(`«${node.length - MAX_ROWS} more rows truncated»`)
    return kept
  }
  if (node && typeof node === 'object') {
    const o = {}
    for (const [k, v] of Object.entries(node)) o[k] = truncateRows(v)
    return o
  }
  return node
}

export function sanitize(raw, label) {
  // Two capture shapes are supported:
  //   a bare chart configuration, or a richer envelope { widget, result, chartOptions }.
  const envelope = raw && typeof raw === 'object' && ('chartOptions' in raw || 'result' in raw)
  const source = envelope ? (raw.chartOptions || {}) : raw
  const cfg = scrub(source)
  const meta = envelope
    ? { widget: scrub(raw.widget || null), engines: raw.engines || null, result: truncateRows(scrub(raw.result || null)) }
    : null

  if (Array.isArray(cfg.series)) {
    cfg.series = cfg.series.map((s, i) => ({
      ...s,
      name: genericSeriesName(s.name, i),
      ...(s.counter ? { counter: 'metricValue' } : {}),
    }))
  }
  if (cfg.title && typeof cfg.title === 'object') cfg.title.text = label ?? null
  if (cfg.subtitle && typeof cfg.subtitle === 'object') cfg.subtitle.text = null

  return {
    $fixture: label ?? 'unnamed',
    $provenance: 'captured from a host rendering, then sanitised — see scripts/sanitize-fixture.mjs',
    $note: `"${FN}" marks a function that existed in the source config but cannot be serialised.`,
    ...(meta?.widget ? { variant: meta.widget } : {}),
    ...(meta?.engines ? { engines: meta.engines } : {}),
    config: cfg,
    ...(meta?.result ? { result: meta.result } : {}),
  }
}

/** Guard: refuse to emit anything still carrying an identifier or an IP-like string. */
export function assertClean(obj) {
  // Audit the payload only — the $-prefixed metadata is our own prose and would
  // otherwise trip the file-extension case of the dotted-identifier rule.
  const { $fixture, $provenance, $note, ...payload } = obj || {}
  const json = JSON.stringify(payload)
  const offenders = []
  for (const key of STRIP) {
    if (new RegExp(`"${key}"\\s*:`).test(json)) offenders.push(`key "${key}"`)
  }
  const ips = (json.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || []).filter((x) => !x.startsWith('198.51.100.'))
  if (ips.length) offenders.push(`IPv4-shaped string (${ips[0]})`)
  const fq = json.match(FQDN)
  const leftover = (fq || []).filter((h) => !/\.example$/i.test(h))
  if (leftover.length) offenders.push(`FQDN-shaped string (${leftover[0]})`)
  if (HOSTISH.test(json)) offenders.push('host-code-shaped string')
  const dotted = (json.match(DOTTED) || []).filter(
    (x) => !/^(metric\.series\.v\d+|field\.v\d+)$/.test(x) && !/\.(example|com|net|org|local|internal|lan|io|corp|intra)$/i.test(x)
  )
  if (dotted.length) offenders.push(`server-contract identifier (${dotted[0]})`)
  return offenders
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const [input, output] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const li = process.argv.indexOf('--label')
  const label = li > -1 ? process.argv[li + 1] : undefined
  if (!input || !output) {
    console.error('usage: sanitize-fixture.mjs <raw.json> <out.json> [--label <name>]')
    process.exit(1)
  }
  const raw = JSON.parse(fs.readFileSync(input, 'utf8'))
  const fixture = sanitize(raw, label)
  const offenders = assertClean(fixture)
  if (offenders.length) {
    console.error(`::error:: fixture still contains: ${offenders.join(', ')}`)
    process.exit(1)
  }
  fs.writeFileSync(output, JSON.stringify(fixture, null, 2) + '\n')
  const n = (fixture.config.series || []).length
  console.log(`✓ ${output}  (${n} series, ${JSON.stringify(fixture).length} bytes, clean)`)
}
