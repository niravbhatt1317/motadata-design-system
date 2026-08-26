// Entry for the OPT-IN observeops-logos bundle. Loading this script makes the FULL 445-logo library available to
// <obs-logo> (colour + line). It's separate from the main elements bundle so pages that don't need every logo stay
// lean. Load it BEFORE (or alongside) the elements bundle:  <script src="observeops-logos.js"></script>
// obs-logo prefers this global registry, else its small built-in set, else the no-icon fallback.
import { LOGOS, LINE_LOGOS, LOGO_ALIASES } from './elements/_logos.full.js'

const g = typeof globalThis !== 'undefined' ? globalThis : window
g.__OBS_LOGOS__ = { LOGOS, LINE_LOGOS, LOGO_ALIASES }
// let any already-rendered <obs-logo> pick up the full set (it listens for this)
try { g.dispatchEvent(new Event('obs-logos-loaded')) } catch (e) { /* non-DOM env */ }
