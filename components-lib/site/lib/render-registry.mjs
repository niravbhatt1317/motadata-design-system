// registry/<id>.json field → HTML for the right-panel tabs. Renders structured JSON directly (no MDX).
import { esc } from './escape.mjs'

// Extract a display string from an item that may be a plain string OR a structured object
// (registries mix both — e.g. changelog {date,change}, issues {severity,issue}). Never stringify an object raw
// (that renders "[object Object]").
const text = (x) => {
  if (x == null) return ''
  if (typeof x === 'string') return x
  if (typeof x !== 'object') return String(x)
  return x.change || x.issue || x.note || x.what || x.text || x.value || x.label || x.title || x.description || JSON.stringify(x)
}

const list = (arr, cls = '') =>
  !arr || !arr.length ? '' : `<ul class="${cls}">${arr.map((x) => `<li>${esc(text(x))}</li>`).join('')}</ul>`

// A severity-tagged issue list (a11y issues + known issues) — accepts a STRING ("F1 (high): …" / "(low) …")
// OR an object ({ id?, severity?, issue|note|what|text }).
const issueItem = (v) => {
  if (v && typeof v === 'object') {
    const label = [v.id, v.severity].filter(Boolean).map((s) => esc(String(s))).join(' ')
    const sevClass = esc(String(v.severity || 'info').split(/[ ,]/)[0])
    const tag = label ? `<span class="sev sev-${sevClass}">${label}</span> ` : ''
    return `<li>${tag}${esc(text(v))}</li>`
  }
  const s = String(v)
  const m = s.match(/^(\w+[\d-]*)?\s*\(([^)]+)\)\s*[:\s]*/) // "F1 (high): …" or "(low) …"
  if (m) {
    const label = [m[1], m[2]].filter(Boolean).join(' ')
    return `<li><span class="sev sev-${esc(m[2].split(/[ ,]/)[0])}">${esc(label)}</span> ${esc(s.slice(m[0].length))}</li>`
  }
  return `<li>${esc(s)}</li>`
}
const issueList = (arr, cls = 'issues') =>
  !Array.isArray(arr) || !arr.length ? '' : `<ul class="${cls}">${arr.map(issueItem).join('')}</ul>`

const kv = (obj) =>
  !obj || !Object.keys(obj).length
    ? ''
    : `<dl class="kv">${Object.entries(obj)
        .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</dd>`)
        .join('')}</dl>`

const section = (title, body) => (body ? `<section class="rsec"><h4>${esc(title)}</h4>${body}</section>` : '')

/** Details tab body — props table + events + slots (controls are injected by the page template). */
export function propsTable(registry) {
  const props = registry.props || {}
  const rows = Object.entries(props)
    .map(([name, p]) => {
      const enumTxt = p.enum ? `<div class="muted enum">enum: ${esc(p.enum.join(', '))}</div>` : ''
      const note = p.note ? `<div class="muted">${esc(p.note)}</div>` : ''
      return `<tr><td><code>${esc(name)}</code>${enumTxt}${note}</td><td class="nowrap">${esc(p.type || '')}</td><td class="nowrap">${p.default === undefined ? '—' : `<code>${esc(JSON.stringify(p.default))}</code>`}</td></tr>`
    })
    .join('')
  const table = rows
    ? `<table class="props"><thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead><tbody>${rows}</tbody></table>`
    : '<p class="muted">No props.</p>'
  const events = Array.isArray(registry.events) ? list(registry.events) : ''
  const slots = !registry.slots
    ? ''
    : typeof registry.slots === 'string'
      ? `<li>${esc(registry.slots)}</li>`
      : Array.isArray(registry.slots)
        ? registry.slots.map((v) => `<li>${esc(v)}</li>`).join('')
        : Object.entries(registry.slots).map(([k, v]) => `<li><code>${esc(k)}</code> — ${esc(v)}</li>`).join('')
  return (
    table +
    section('Events', events) +
    section('Slots', slots ? `<ul>${slots}</ul>` : '') +
    section('Tokens used', list(registry.tokensUsed, 'chips')) +
    section('Anatomy', list(registry.anatomy))
  )
}

export function usageTab(registry) {
  const rules = registry.usageRules
    ? `<dl class="rules">${Object.entries(registry.usageRules)
        .map(
          ([k, r]) =>
            `<dt><code>${esc(k)}</code></dt><dd>${r.useWhen ? `<b>Use when:</b> ${esc(r.useWhen)}<br>` : ''}${r.dontUse ? `<b>Don't:</b> ${esc(r.dontUse)}<br>` : ''}${r.must ? `<b>Must:</b> ${esc(r.must)}<br>` : ''}${r.example ? `<span class="muted">e.g. ${esc(r.example)}</span>` : ''}</dd>`
        )
        .join('')}</dl>`
    : ''
  // returns '' when there's no usage data (so the tab is hidden — see tabsHtml)
  return (
    (registry.whenToUse ? `<p class="lead">${esc(registry.whenToUse)}</p>` : '') +
    section('Do', list(registry.do, 'do')) +
    section("Don't", list(registry.dont, 'dont')) +
    section('Where it’s used', list(registry.usedIn, 'usedin')) +
    section('Decision flow', registry.decisionFlow ? `<ol>${registry.decisionFlow.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : '') +
    section('Usage rules', rules) +
    section('Related', list(registry.related, 'chips'))
  )
}

export function a11yTab(registry) {
  const a = registry.a11y || {}
  const acc = registry.accessibility || {}
  return (
    (a.summary ? `<p class="lead">${esc(a.summary)}</p>` : '') +
    section('Known a11y issues', issueList(a.issues)) +
    section('Details', kv(acc))
  )
}

export function changelogTab(registry) {
  const cl = Array.isArray(registry.changelog) ? registry.changelog : []
  if (!cl.length) return ''
  const badge = registry.maturity || registry.status
  const item = (x) => {
    if (typeof x !== 'object' || x == null) return `<li>${esc(String(x))}</li>`
    const date = x.date ? `<span class="cl-date">${esc(x.date)}</span> ` : ''
    return `<li>${date}${esc(text(x))}</li>`
  }
  return (
    (badge ? `<span class="badge">${esc(badge)}</span>` : '') +
    `<ul class="changelog">${cl.slice().reverse().map(item).join('')}</ul>`
  )
}

export function knownIssuesTab(registry) {
  const raw = registry.knownIssues
  // accept an array of strings/objects OR an object keyed by id ({ F1: { severity, issue }, … })
  const issues = Array.isArray(raw)
    ? raw
    : (raw && typeof raw === 'object')
      ? Object.entries(raw).map(([id, v]) => (v && typeof v === 'object' ? { id, ...v } : { id, issue: String(v) }))
      : []
  return issueList(issues)
}

/** Variant captions keyed by name (for gallery captions). */
export function variantInfo(registry) {
  const map = {}
  for (const v of registry.variants || []) map[v.name] = v
  return map
}
