// Resolves the PRODUCT (ObserveOps) checkout root, wherever it currently sits next to this repo.
// The DS must never vendor product assets — it reads them at build time, so the layout has to be discoverable.
// Probes (first hit wins):
//   1. OBSERVEOPS_ROOT env var (explicit override, e.g. CI or an unusual clone layout)
//   2. <repo>/../PROJECT/ObserveOps       — current layout (product repo two levels up, under PROJECT/)
//   3. <repo>/..                          — legacy layout (DS checked out inside the product root's parent)
// Presence of src/assets/icons/icons.js marks a valid product checkout.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const REPO = path.resolve(HERE, '..', '..', '..') // motadata-design-system/
const MARKER = path.join('src', 'assets', 'icons', 'icons.js')

export function productRoot() {
  const candidates = [
    process.env.OBSERVEOPS_ROOT,
    path.resolve(REPO, '..', 'PROJECT', 'ObserveOps'),
    path.resolve(REPO, '..'),
  ].filter(Boolean)
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, MARKER))) return c
  }
  return null // caller decides how to degrade (skip assets, warn)
}
