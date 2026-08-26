#!/usr/bin/env node
// icon-reuse-preflight.mjs — DEPLOY GATE (ratchet). Runs the match-component STRUCTURAL guard
// (icons must be <obs-icon>, no raw <button>/<input>/<select>) across every shipped element and
// compares the failing set to a checked-in baseline of KNOWN debt (.icon-debt-baseline.json).
//
//   • a NEW or newly-regressed element that fails  -> HARD FAIL (blocks the deploy). This is the
//     thing that kept slipping: a fresh component inlining SVG can no longer ship.
//   • a baselined element that now PASSES           -> HARD FAIL asking you to remove it from the
//     baseline (the ratchet only tightens — debt can shrink, never silently grow).
//   • baselined elements that still fail            -> printed LOUDLY as remaining debt, deploy proceeds.
//
// Run standalone: node design-system/scripts/icon-reuse-preflight.mjs   (exit 0 ok / 1 block)
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'; import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const UI = path.resolve(HERE, '../..')
const GUARDS = path.join(UI, '.claude/skills/match-component/guards.mjs')
const BASELINE = path.join(HERE, '..', '.icon-debt-baseline.json')

function failingIds() {
  let out = ''
  try { out = execFileSync('node', [GUARDS, '--all', '--structural'], { cwd: UI, encoding: 'utf8' }) }
  catch (e) { out = (e.stdout || '') + (e.stderr || '') } // guards exits 1 when any fail — that's expected
  return out.split('\n').filter((l) => l.startsWith('❌')).map((l) => l.replace(/^❌\s*/, '').trim()).sort()
}

const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')).knownDebt || [] : []
const failing = failingIds()
const baseSet = new Set(baseline)
const failSet = new Set(failing)

const novel = failing.filter((id) => !baseSet.has(id))        // NEW violations — must block
const fixed = baseline.filter((id) => !failSet.has(id))       // debt that got fixed — tighten the ratchet
const remaining = failing.filter((id) => baseSet.has(id))

console.log('\n=== icon/reuse deploy gate (match-component structural ratchet) ===')
if (remaining.length) console.log(`  ⚠ KNOWN icon-reuse debt (inline SVG instead of <obs-icon>): ${remaining.join(', ')} — burn these down.`)

let block = false
if (novel.length) {
  console.error(`\n  ❌ NEW icon/reuse violation(s): ${novel.join(', ')}`)
  console.error('     A shipped element inlines an SVG icon or a raw control. MANDATORY: compose <obs-icon name="…"> and DS components.')
  console.error(`     Run:  node ${path.relative(UI, GUARDS)} ${novel.join(' ')}   — fix, then re-deploy. (Do NOT add it to the baseline to bypass.)`)
  block = true
}
if (fixed.length) {
  console.error(`\n  ❌ ratchet: ${fixed.join(', ')} now PASS — remove them from design-system/.icon-debt-baseline.json so the gate stays tight.`)
  block = true
}
if (!block) console.log(remaining.length ? '  ✅ no new violations (existing debt tracked).' : '  ✅ clean — every element composes <obs-icon>.')
process.exit(block ? 1 : 0)
