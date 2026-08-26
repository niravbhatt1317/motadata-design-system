// Single open TOP-LAYER overlay at a time (obs-modal / obs-drawer). A native <dialog>.showModal() allows only
// ONE open modal in the top layer — opening a second while one is open THROWS and the caller's fallback
// `setAttribute('open')` renders an inline (backdrop-less) dialog that STACKS (the docs-page mess/hang). So an
// overlay calls takeOverlay(itsClose) before showModal(): that closes whichever overlay is currently open. On
// close it calls releaseOverlay(itsClose). Shared across ALL modal + drawer instances (one module, one var).
let activeClose = null

export function takeOverlay(closeFn) {
  if (activeClose && activeClose !== closeFn) { try { activeClose() } catch (e) { /* ignore */ } }
  activeClose = closeFn
}

export function releaseOverlay(closeFn) {
  if (activeClose === closeFn) activeClose = null
}
