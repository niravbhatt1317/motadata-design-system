#!/usr/bin/env node
/**
 * verify-component.js — Look·Feel verifier (step 5 of the conversion runbook).
 *
 * Drives Playwright to dump getComputedStyle (+ box size) for each probe from BOTH the rendered
 * Storybook element and the local demo's web component, across states (base/hover/focus), and prints
 * a markdown diff table. Turns "eyeball the screenshot" into a measured report.
 *
 * Usage:  node design-system/scripts/verify-component.js <id> [--write]
 *   reads  design-system/scripts/verify/<id>.config.js   (probe list — see switch.config.js)
 *   --write appends the report to design-system/strategy/coverage/<id>.md is NOT done automatically;
 *           it writes design-system/strategy/coverage/<id>.verify.md for you to merge.
 *
 * Config shape (module.exports):
 *   { storybookBase, demoUrl, props:[…cssProps], probes:[ { label, storyId, sb, mine, states:['base','hover'] } ] }
 *     sb   = CSS selector for the element in the Storybook story (Playwright pierces open shadow DOM)
 *     mine = CSS selector for the element in the demo (pierces into obs-* shadow roots automatically)
 */
'use strict'
const fs = require('fs')
const path = require('path')
const ROOT = path.resolve(__dirname, '..', '..')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright-core'))

const id = process.argv[2]
const doWrite = process.argv.includes('--write')
if (!id) { console.error('usage: node verify-component.js <id> [--write]'); process.exit(1) }
const cfgPath = path.join(__dirname, 'verify', `${id}.config.js`)
if (!fs.existsSync(cfgPath)) { console.error(`no config at ${path.relative(ROOT, cfgPath)}`); process.exit(1) }
const cfg = require(cfgPath)
const PROPS = cfg.props || ['fontFamily', 'fontSize', 'fontWeight', 'color', 'backgroundColor', 'borderRadius', 'boxShadow', 'height', 'width']

const pick = async (loc, states, page) => {
  const result = {}
  for (const state of states) {
    try {
      if (state === 'hover') await loc.hover({ timeout: 4000 })
      if (state === 'focus') await loc.evaluate((e) => e.focus && e.focus())
      await page.waitForTimeout(180)
      result[state] = await loc.evaluate((el, props) => {
        const c = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        const o = {}
        for (const p of props) o[p] = c[p]
        o.height = Math.round(r.height) + 'px'
        o.width = Math.round(r.width) + 'px'
        return o
      }, PROPS)
    } catch (e) { result[state] = { ERROR: e.message.split('\n')[0] } }
  }
  return result
}

;(async () => {
  const browser = await chromium.launch({ executablePath: CHROME })
  const demo = await browser.newPage({ viewport: { width: 1200, height: 2600 }, deviceScaleFactor: 1 })
  await demo.goto(cfg.demoUrl, { waitUntil: 'networkidle' }); await demo.waitForTimeout(500)
  const sb = await browser.newPage({ viewport: { width: 900, height: 500 }, deviceScaleFactor: 1 })

  let curStory = null
  const rows = []
  let mism = 0, total = 0
  for (const probe of cfg.probes) {
    if (probe.storyId !== curStory) {
      await sb.goto(`${cfg.storybookBase}?id=${probe.storyId}&viewMode=story`, { waitUntil: 'networkidle' })
      await sb.waitForTimeout(600); curStory = probe.storyId
    }
    const states = probe.states || ['base']
    const sbVals = await pick(sb.locator(probe.sb).first(), states, sb)
    const myVals = await pick(demo.locator(probe.mine).first(), states, demo)
    for (const st of states) {
      for (const p of PROPS.concat(['height', 'width'])) {
        const a = (sbVals[st] || {})[p]
        const b = (myVals[st] || {})[p]
        if (a === undefined && b === undefined) continue
        total++
        const ok = String(a) === String(b)
        if (!ok) mism++
        if (!ok) rows.push(`| ${probe.label} | ${st} | ${p} | \`${a}\` | \`${b}\` | ✗ |`)
      }
    }
  }
  await browser.close()

  const out = []
  out.push(`# verify-component — \`${id}\`  (Look·Feel computed-style diff)`)
  out.push('')
  out.push(`Storybook: ${cfg.storybookBase}`)
  out.push(`Demo: ${cfg.demoUrl}`)
  out.push('')
  out.push(`**${total - mism}/${total} properties match.** ${mism === 0 ? '✅ all clear' : `❌ ${mism} mismatches below — fix or document each.`}`)
  out.push('')
  if (mism) {
    out.push('| Probe | State | Property | Storybook | Mine | |')
    out.push('| --- | --- | --- | --- | --- | --- |')
    out.push(...rows)
  }
  out.push('')
  const text = out.join('\n')
  if (doWrite) {
    const p = path.join(ROOT, 'design-system', 'strategy', 'coverage', `${id}.verify.md`)
    fs.writeFileSync(p, text)
    console.error(`wrote ${path.relative(ROOT, p)}`)
  } else process.stdout.write(text + '\n')
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })
