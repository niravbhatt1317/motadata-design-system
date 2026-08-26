/* ObserveOps Elements showcase — runtime. Theme toggle, tabs, controls↔attributes, event log,
   copy snippet/link, measure (inspect), zoom, fullscreen. No deps. */
(function () {
  var root = document.documentElement

  // ---- theme (animated sun/moon button) ----
  if (localStorage.getItem('obs-theme') === 'dark') root.setAttribute('data-theme', 'dark-theme')
  var themeBtn = document.getElementById('theme-toggle')
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') !== 'dark-theme'
    root.setAttribute('data-theme', dark ? 'dark-theme' : '')
    localStorage.setItem('obs-theme', dark ? 'dark' : 'light')
  })

  // ---- sidebar search: filter the component nav + keyboard-navigate results (↑/↓, Enter) ----
  var search = document.getElementById('nav-search')
  var navEmpty = document.querySelector('.nav-empty')
  function visibleNav() {
    return [].slice.call(document.querySelectorAll('.nav-item')).filter(function (it) { return it.style.display !== 'none' })
  }
  function clearSel() { document.querySelectorAll('.nav-item.sel').forEach(function (it) { it.classList.remove('sel') }) }
  function setSel(item) { clearSel(); if (item) { item.classList.add('sel'); item.scrollIntoView({ block: 'nearest' }) } }
  function selected() { return document.querySelector('.nav-item.sel') }
  function moveSel(delta) {
    var vis = visibleNav(); if (!vis.length) return
    var cur = selected(), i = cur ? vis.indexOf(cur) : -1
    i = i < 0 ? (delta > 0 ? 0 : vis.length - 1) : (i + delta + vis.length) % vis.length
    setSel(vis[i])
  }
  function updateHeadings() { // hide a whole group/sub container when none of its items are visible (filtering)
    document.querySelectorAll('.nav-sub, .nav-grp').forEach(function (g) {
      var anyVisible = [].slice.call(g.querySelectorAll('.nav-item')).some(function (it) { return it.style.display !== 'none' })
      g.style.display = anyVisible ? '' : 'none'
    })
  }
  function runFilter() {
    var q = (search.value || '').trim().toLowerCase(), shown = 0
    var navE = document.querySelector('.nav'); if (navE) navE.classList.toggle('searching', !!q) // force groups open while searching
    document.querySelectorAll('.nav-item').forEach(function (it) {
      var ok = !q || it.textContent.toLowerCase().indexOf(q) >= 0
      it.style.display = ok ? '' : 'none'; if (ok) shown++
    })
    updateHeadings()
    if (navEmpty) navEmpty.style.display = (q && shown === 0) ? 'block' : 'none'
    setSel(q ? visibleNav()[0] : null) // highlight the first match so Enter / arrows have a starting point
    updateNavFades()
  }
  // ---- nav scroll affordances: top/bottom fades only when content is hidden that way; auto-hide thumb ----
  var navScroll = document.querySelector('.nav-scroll'), navEl = document.querySelector('.nav')
  function updateNavFades() {
    if (!navScroll || !navEl) return
    navScroll.classList.toggle('show-top', navEl.scrollTop > 2)
    navScroll.classList.toggle('show-bottom', navEl.scrollTop + navEl.clientHeight < navEl.scrollHeight - 2)
  }
  if (navEl) {
    var navScrollTO
    navEl.addEventListener('scroll', function () {
      updateNavFades()
      navEl.classList.add('scrolling'); clearTimeout(navScrollTO)
      navScrollTO = setTimeout(function () { navEl.classList.remove('scrolling') }, 900)
    })
    window.addEventListener('resize', updateNavFades)
    var activeItem = navEl.querySelector('.nav-item.active')
    if (activeItem) activeItem.scrollIntoView({ block: 'center' }) // center the current page's item so it stays clear of the edge fades
    updateNavFades()
  }
  // ---- collapsible groups: chevron headings, persisted state, active group always expanded ----
  if (navEl) {
    var COLL_KEY = 'obs-nav-collapsed'
    var grpKey = function (g) { var pg = g.parentElement.closest('.nav-grp'); return (pg ? pg.dataset.grp + '/' : '') + g.dataset.grp }
    var loadColl = function () { try { return new Set(JSON.parse(localStorage.getItem(COLL_KEY) || '[]')) } catch (e) { return new Set() } }
    var setExpanded = function (g, expanded) {
      g.classList.toggle('collapsed', !expanded)
      var h = g.querySelector(':scope > .nav-grp-h, :scope > .nav-sub-h'); if (h) h.setAttribute('aria-expanded', expanded ? 'true' : 'false')
    }
    var saved = loadColl()
    navEl.querySelectorAll('.nav-grp, .nav-sub').forEach(function (g) { if (saved.has(grpKey(g))) setExpanded(g, false) })
    // never start collapsed over the current page — expand every ancestor group of the active item
    var act = navEl.querySelector('.nav-item.active'), anc = act && act.parentElement
    while (anc && anc !== navEl) { if (anc.classList && (anc.classList.contains('nav-grp') || anc.classList.contains('nav-sub'))) setExpanded(anc, true); anc = anc.parentElement }
    navEl.addEventListener('click', function (e) {
      var h = e.target.closest('.nav-grp-h, .nav-sub-h'); if (!h || !navEl.contains(h)) return
      var g = h.parentElement, collapsed = g.classList.toggle('collapsed')
      h.setAttribute('aria-expanded', collapsed ? 'false' : 'true')
      var set = loadColl(); if (collapsed) set.add(grpKey(g)); else set.delete(grpKey(g))
      try { localStorage.setItem(COLL_KEY, JSON.stringify(Array.from(set))) } catch (e2) {}
      updateNavFades()
    })
  }
  function focusSearch() { if (search) { search.focus(); search.select() } }
  if (search) {
    search.addEventListener('input', runFilter)
    search.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1) }
      else if (e.key === 'Enter') { var t = selected() || visibleNav()[0]; if (t) location.href = t.href }
      else if (e.key === 'Escape') { search.value = ''; runFilter(); search.blur() }
    })
    search.addEventListener('blur', clearSel) // drop the highlight when search loses focus
  }

  // ---- keyboard shortcuts (single-letter; ignored while typing in a field) ----
  var helpOverlay = document.getElementById('kbd-overlay')
  function toggleHelp() { if (helpOverlay) helpOverlay.classList.toggle('on') }
  function closeHelp() { if (helpOverlay) helpOverlay.classList.remove('on') }
  if (helpOverlay) {
    helpOverlay.addEventListener('click', function (e) { if (e.target === helpOverlay) closeHelp() })
    var kc = document.getElementById('kbd-close'); if (kc) kc.addEventListener('click', closeHelp)
  }
  function isTyping() { var a = document.activeElement; return !!a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable) }
  function clickId(id) { var b = document.getElementById(id); if (b) b.click() }
  function goNav(dir) { var a = document.querySelector('.nav-arrows a[data-nav="' + dir + '"]'); if (a) location.href = a.href }
  function toggleView() {
    var ex = document.querySelector('.vt-btn[data-view="examples"]'), pg = document.querySelector('.vt-btn[data-view="playground"]')
    if (ex && pg) (ex.classList.contains('active') ? pg : ex).click()
  }
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); focusSearch(); return }
    if (e.key === 'Escape') { closeHelp(); return }
    if (isTyping() || e.metaKey || e.ctrlKey || e.altKey) return
    switch (e.key) {
      case '/': e.preventDefault(); focusSearch(); break
      case 'i': case 'I': clickId('inspect-toggle'); break
      case 'e': case 'E': toggleView(); break
      case 'f': case 'F': clickId('fullscreen-btn'); break
      case 't': case 'T': clickId('theme-toggle'); break
      case 'ArrowLeft': goNav('prev'); break
      case 'ArrowRight': goNav('next'); break
      case '+': case '=': clickId('zoom-in'); break
      case '-': case '_': clickId('zoom-out'); break
      case '0': clickId('zoom-reset'); break
      case '?': e.preventDefault(); toggleHelp(); break
    }
  })

  // ---- tabs: sliding underline + keep the selected tab (and its neighbours) in view ----
  document.querySelectorAll('.tabbar').forEach(function (bar) {
    var ink = document.createElement('span'); ink.className = 'tab-ink no-anim'; bar.insertBefore(ink, bar.firstChild)
    function moveInk(tab) { if (!tab) return; ink.style.left = tab.offsetLeft + 'px'; ink.style.width = tab.offsetWidth + 'px' }
    function centerTab(tab) { // scroll the bar so edge tabs reveal their neighbours
      var target = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2
      bar.scrollTo({ left: target, behavior: 'smooth' })
    }
    function activeTab() { return bar.querySelector('.tab.active') }
    function placeInk() { ink.classList.add('no-anim'); moveInk(activeTab()); requestAnimationFrame(function () { ink.classList.remove('no-anim') }) }
    moveInk(activeTab())
    requestAnimationFrame(function () { ink.classList.remove('no-anim') }) // enable animation after the first placement
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeInk) // realign once the web font loads (tab widths shift)
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab'); if (!btn) return
      bar.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t === btn) })
      document.querySelectorAll('.tabpanel').forEach(function (p) { p.classList.toggle('active', p.dataset.panel === btn.dataset.tab) })
      moveInk(btn); centerTab(btn)
    })
    window.addEventListener('resize', placeInk)
  })

  var wrap = document.getElementById('live-wrap')
  var live = wrap && wrap.firstElementChild // the live <obs-*> element (no id → avoids attr-fallthrough dup)
  if (!live) return // index page — nothing below applies

  // ---- center view toggle: Playground / Examples (one full-width view at a time; remembered across pages) ----
  var canvas = document.querySelector('.canvas'), vtbar = document.querySelector('.view-toggle')
  function setView(view) {
    if (!vtbar) return
    vtbar.querySelectorAll('.vt-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.view === view) })
    document.querySelectorAll('.view').forEach(function (v) { v.classList.toggle('active', v.classList.contains('view-' + view)) })
    if (canvas) canvas.classList.toggle('examples-view', view === 'examples')
  }
  if (vtbar) {
    if (localStorage.getItem('obs-view') === 'examples') setView('examples') // restore last choice (default = Playground)
    vtbar.addEventListener('click', function (e) {
      var btn = e.target.closest('.vt-btn'); if (!btn) return
      setView(btn.dataset.view); localStorage.setItem('obs-view', btn.dataset.view)
    })
  }

  // ---- copy link to this component page ----
  var copyLink = document.getElementById('copy-link')
  if (copyLink) copyLink.addEventListener('click', function () {
    navigator.clipboard.writeText(location.href).then(function () {
      copyLink.classList.add('copied'); copyLink.title = 'Copied!'
      setTimeout(function () { copyLink.classList.remove('copied'); copyLink.title = 'Copy link to this component' }, 1200)
    })
  })

  // ---- zoom ----
  var zoomVal = document.getElementById('zoom-val')
  var zoom = 1
  function applyZoom() { wrap.style.transform = 'scale(' + zoom + ')'; if (zoomVal) zoomVal.textContent = Math.round(zoom * 100) + '%' }
  byId('zoom-in', function () { zoom = Math.min(3, Math.round((zoom + 0.25) * 100) / 100); applyZoom() })
  byId('zoom-out', function () { zoom = Math.max(0.25, Math.round((zoom - 0.25) * 100) / 100); applyZoom() })
  byId('zoom-reset', function () { zoom = 1; applyZoom() })

  // ---- fullscreen (CSS overlay, Esc to exit) ----
  var stage = document.querySelector('.stage')
  byId('fullscreen-btn', function () { stage.classList.toggle('stage-full') })
  byId('stage-close', function () { stage.classList.remove('stage-full') })
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') stage.classList.remove('stage-full') })

  // ---- resizable right panel: drag the left-edge handle; min = default width, max = +60% ----
  var panelResizer = document.getElementById('panel-resizer')
  if (panelResizer) {
    var rootStyle = document.documentElement.style
    function panelW() { return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--panel')) || 404 }
    var MINP = panelW()                       // captured before any saved value is applied → the default width
    var MAXP = Math.round(MINP * 1.6)         // up to 60% wider
    function setPanelW(w) { w = Math.max(MINP, Math.min(MAXP, Math.round(w))); rootStyle.setProperty('--panel', w + 'px'); return w }
    var savedW = parseInt(localStorage.getItem('obs-panel-w'))
    if (savedW) setPanelW(savedW)
    var dragging = false, startX = 0, startW = 0
    panelResizer.addEventListener('mousedown', function (e) {
      dragging = true; startX = e.clientX; startW = panelW()
      panelResizer.classList.add('dragging'); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'
      e.preventDefault()
    })
    document.addEventListener('mousemove', function (e) { if (dragging) setPanelW(startW + (startX - e.clientX)) }) // drag left → wider
    document.addEventListener('mouseup', function () {
      if (!dragging) return
      dragging = false; panelResizer.classList.remove('dragging'); document.body.style.cursor = ''; document.body.style.userSelect = ''
      localStorage.setItem('obs-panel-w', panelW())
    })
    panelResizer.addEventListener('dblclick', function () { localStorage.setItem('obs-panel-w', setPanelW(MINP)) }) // reset to default
    panelResizer.addEventListener('keydown', function (e) { // accessible: ←/→ resize while focused
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault(); e.stopPropagation() // don't trigger prev/next-component navigation
      var step = e.shiftKey ? 48 : 16
      localStorage.setItem('obs-panel-w', setPanelW(panelW() + (e.key === 'ArrowLeft' ? step : -step)))
    })
  }

  // ---- inspect: rulers + crosshair guides + box-model + info tooltip (dimsum-style), scoped to .stage ----
  var inspect = document.getElementById('inspect-toggle')
  var layer = document.getElementById('inspect-layer')
  var SEL = live.tagName.toLowerCase() // the page's own custom element — works for every component, no static list to maintain
  var ORANGE = '#e8833a', MONO = "'JetBrains Mono', ui-monospace, monospace"
  var rTop = el('canvas', 'ruler ruler-top'), rLeft = el('canvas', 'ruler ruler-left')
  var segTop = el('div', 'rseg rseg-top'), segLeft = el('div', 'rseg rseg-left')
  var gv1 = el('div', 'guide gv'), gv2 = el('div', 'guide gv'), gh1 = el('div', 'guide gh'), gh2 = el('div', 'guide gh')
  var mMargin = el('div', 'm-region m-margin'), mBorder = el('div', 'm-region m-border')
  var mPadding = el('div', 'm-region m-padding'), mContent = el('div', 'm-region m-content'), tip = el('div', 'm-tip')
  var vals = []; for (var i = 0; i < 8; i++) { var vv = el('div', 'm-val'); vals.push(vv) }
  var gaps = []; for (var gp = 0; gp < 10; gp++) gaps.push({ line: el('div', 'm-gap'), lbl: el('div', 'm-gaplabel') })
  if (layer) {
    var nodes = [rTop, rLeft, segTop, segLeft, mMargin, mBorder, mPadding, mContent, gv1, gv2, gh1, gh2, tip].concat(vals)
    gaps.forEach(function (g) { nodes.push(g.line, g.lbl) })
    nodes.forEach(function (n) { layer.appendChild(n) })
  }

  function num(s) { return parseFloat(s) || 0 }
  function innerOf(t) { if (!t.shadowRoot) return t; var k = t.shadowRoot.children; for (var j = 0; j < k.length; j++) if (k[j].tagName !== 'STYLE') return k[j]; return t }
  function box4(t, r, b, l) { t = Math.round(t); r = Math.round(r); b = Math.round(b); l = Math.round(l); return (t === r && r === b && b === l) ? (t + 'px') : (t + 'px ' + r + 'px ' + b + 'px ' + l + 'px') }
  var ROLE = { button: 'button', a: 'link', summary: 'button', details: 'group', img: 'img', svg: 'img', ul: 'list', ol: 'list', li: 'listitem', input: 'textbox', select: 'combobox' }
  function roleOf(tag, node) { return (node.getAttribute && node.getAttribute('role')) || ROLE[tag] || 'generic' }
  function vis(c) { var b = c.getBoundingClientRect(); return b.width > 0 && b.height > 0 }
  function setBox(n, x, y, w, h) { n.style.left = x + 'px'; n.style.top = y + 'px'; n.style.width = w + 'px'; n.style.height = h + 'px' }

  function drawRulers() {
    var w = stage.clientWidth, h = stage.clientHeight, dpr = window.devicePixelRatio || 1
    ;[[rTop, w, 22, false], [rLeft, 22, h, true]].forEach(function (sp) {
      var cv = sp[0], cw = sp[1], ch = sp[2], vert = sp[3]
      cv.width = cw * dpr; cv.height = ch * dpr; cv.style.width = cw + 'px'; cv.style.height = ch + 'px'
      var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, cw, ch)
      ctx.strokeStyle = ORANGE; ctx.fillStyle = ORANGE; ctx.font = '9px ' + MONO; ctx.textBaseline = 'middle'
      var len = vert ? ch : cw
      for (var p = 0; p <= len; p += 10) {
        var major = p % 50 === 0
        ctx.beginPath()
        if (!vert) { ctx.moveTo(p + 0.5, 22); ctx.lineTo(p + 0.5, major ? 6 : 14) } else { ctx.moveTo(22, p + 0.5); ctx.lineTo(major ? 6 : 14, p + 0.5) }
        ctx.stroke()
        if (major && p > 0) { if (!vert) ctx.fillText(p, p + 2, 11); else ctx.fillText(p, 2, p + 1) }
      }
    })
  }

  function measure(inner) {
    var s = stage.getBoundingClientRect()
    var r = inner.getBoundingClientRect(), cs = getComputedStyle(inner)
    var x = r.left - s.left, y = r.top - s.top, w = r.width, h = r.height
    var mt = num(cs.marginTop), mr = num(cs.marginRight), mb = num(cs.marginBottom), ml = num(cs.marginLeft)
    var bt = num(cs.borderTopWidth), br = num(cs.borderRightWidth), bb = num(cs.borderBottomWidth), bl = num(cs.borderLeftWidth)
    var pt = num(cs.paddingTop), pr = num(cs.paddingRight), pb = num(cs.paddingBottom), pl = num(cs.paddingLeft)
    setBox(mMargin, x - ml, y - mt, w + ml + mr, h + mt + mb)
    setBox(mBorder, x, y, w, h)
    setBox(mPadding, x + bl, y + bt, w - bl - br, h - bt - bb)
    var cx = x + bl + pl, cy = y + bt + pt, cw = w - bl - br - pl - pr, ch = h - bt - bb - pt - pb
    setBox(mContent, cx, cy, cw, ch)
    gv1.style.left = x + 'px'; gv2.style.left = (x + w) + 'px'; gh1.style.top = y + 'px'; gh2.style.top = (y + h) + 'px'
    segTop.style.left = x + 'px'; segTop.style.width = w + 'px'; segLeft.style.top = y + 'px'; segLeft.style.height = h + 'px'
    var specs = [
      [pt, cx + cw / 2, y + bt + pt / 2], [pr, cx + cw + pr / 2, cy + ch / 2], [pb, cx + cw / 2, cy + ch + pb / 2], [pl, x + bl + pl / 2, cy + ch / 2],
      [mt, x + w / 2, y - mt / 2], [mr, x + w + mr / 2, y + h / 2], [mb, x + w / 2, y + h + mb / 2], [ml, x - ml / 2, y + h / 2],
    ]
    specs.forEach(function (sp, i) { var v = vals[i]; if (sp[0] > 0) { v.className = 'm-val ' + (i < 4 ? 'pad' : 'mar'); v.style.display = 'block'; v.style.left = sp[1] + 'px'; v.style.top = sp[2] + 'px'; v.textContent = Math.round(sp[0]) } else v.style.display = 'none' })
    var tag = inner.tagName.toLowerCase(), cls = (inner.className || '').split(' ').filter(Boolean)[0]
    var hostEl = inner.getRootNode && inner.getRootNode().host
    var title = hostEl ? hostEl.tagName.toLowerCase().replace(/^obs-/, '').replace(/-/g, ' ').toUpperCase() : (cls ? cls.split('-')[0].toUpperCase() : tag.toUpperCase())
    var role = roleOf(tag, inner)
    var isFG = cs.display.indexOf('flex') >= 0 || cs.display.indexOf('grid') >= 0
    var disp = isFG ? (cs.display.replace(/^inline-/, '') + ' ' + cs.flexDirection).trim() : ''
    tip.innerHTML = '<div class="t-tag">' + title + '</div><div>' + tag + (cls ? ('.' + cls) : '') + '</div>' +
      '<div class="t-mut">' + role + (disp ? (' · ' + disp) : '') + ' · <span class="t-dim">' + Math.round(w) + ' × ' + Math.round(h) + '</span></div>' +
      '<div class="t-mut">padding ' + box4(pt, pr, pb, pl) + ' · margin ' + box4(mt, mr, mb, ml) + '</div>'
    var th = tip.offsetHeight, tw = tip.offsetWidth
    var ty = y - th - 10; if (ty < 24) ty = y + h + 10
    var tx = Math.max(24, Math.min(x, stage.clientWidth - tw - 4))
    tip.style.left = tx + 'px'; tip.style.top = ty + 'px'

    // ---- gaps (purple): between this element's children AND to its adjacent siblings ----
    gaps.forEach(function (g) { g.line.style.display = 'none'; g.lbl.style.display = 'none' })
    var gi = 0
    function drawGap(aR, bR) {
      if (gi >= gaps.length) return
      var a = { x: aR.left - s.left, y: aR.top - s.top, right: aR.right - s.left, bottom: aR.bottom - s.top }
      var b = { x: bR.left - s.left, y: bR.top - s.top, right: bR.right - s.left, bottom: bR.bottom - s.top }
      var vO = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y), hO = Math.min(a.right, b.right) - Math.max(a.x, b.x), d = null
      if (vO > 2 && b.x >= a.right - 0.5) d = { dir: 'h', val: b.x - a.right, p: a.right, q: b.x, c: Math.max(a.y, b.y) + vO / 2 }
      else if (vO > 2 && b.right <= a.x + 0.5) d = { dir: 'h', val: a.x - b.right, p: b.right, q: a.x, c: Math.max(a.y, b.y) + vO / 2 }
      else if (hO > 2 && b.y >= a.bottom - 0.5) d = { dir: 'v', val: b.y - a.bottom, p: a.bottom, q: b.y, c: Math.max(a.x, b.x) + hO / 2 }
      else if (hO > 2 && b.bottom <= a.y + 0.5) d = { dir: 'v', val: a.y - b.bottom, p: b.bottom, q: a.y, c: Math.max(a.x, b.x) + hO / 2 }
      if (!d || d.val < 0.5 || d.val > 600) return
      var cc = gaps[gi++]
      if (d.dir === 'h') { cc.line.className = 'm-gap h'; cc.line.style.cssText = 'display:block;left:' + d.p + 'px;top:' + d.c + 'px;width:' + (d.q - d.p) + 'px'; cc.lbl.style.left = ((d.p + d.q) / 2) + 'px'; cc.lbl.style.top = d.c + 'px' }
      else { cc.line.className = 'm-gap v'; cc.line.style.cssText = 'display:block;left:' + d.c + 'px;top:' + d.p + 'px;height:' + (d.q - d.p) + 'px'; cc.lbl.style.left = d.c + 'px'; cc.lbl.style.top = ((d.p + d.q) / 2) + 'px' }
      cc.lbl.style.display = 'block'; cc.lbl.textContent = Math.round(d.val)
    }
    var kids = [].slice.call(inner.children).filter(vis)
    for (var ki = 0; ki < kids.length - 1; ki++) drawGap(kids[ki].getBoundingClientRect(), kids[ki + 1].getBoundingClientRect())
    if (inner.previousElementSibling && vis(inner.previousElementSibling)) drawGap(inner.previousElementSibling.getBoundingClientRect(), inner.getBoundingClientRect())
    if (inner.nextElementSibling && vis(inner.nextElementSibling)) drawGap(inner.getBoundingClientRect(), inner.nextElementSibling.getBoundingClientRect())
  }

  // drill into the shadow sub-element under the cursor (so box/label/pills are measurable individually);
  // walk up out of single-child decorative wrappers (e.g. the checkbox tick) for better sibling context.
  function deepTarget(host, cx, cy) {
    var d = host.shadowRoot ? host.shadowRoot.elementFromPoint(cx, cy) : null
    if (!d || d === host) d = innerOf(host) // null / over-slotted-content → the styled inner element
    // walk up out of single-child decorative wrappers, but never escape the component's shadow tree
    while (d.parentElement && d.parentElement !== host && d.parentElement.children.length === 1) d = d.parentElement
    return d
  }
  function onMove(e) {
    var host = e.target && e.target.closest && e.target.closest(SEL)
    if (!host || !stage.contains(host)) { layer.classList.remove('on'); return }
    if (!layer.classList.contains('on')) { drawRulers(); layer.classList.add('on') }
    measure(deepTarget(host, e.clientX, e.clientY))
  }
  function setInspect(on) {
    stage.classList.toggle('measuring', on) // crosshair only over the stage, not the whole page
    if (on) { drawRulers(); document.addEventListener('mousemove', onMove) }
    else { document.removeEventListener('mousemove', onMove); layer.classList.remove('on') }
  }
  if (inspect && layer) {
    inspect.addEventListener('change', function () { localStorage.setItem('obs-inspect', inspect.checked ? 'on' : 'off'); setInspect(inspect.checked) })
    if (localStorage.getItem('obs-inspect') === 'on') { inspect.checked = true; setInspect(true) } // persist across pages
  }
  window.addEventListener('resize', function () { if (layer && layer.classList.contains('on')) drawRulers() })

  // ---- controls → attributes ----
  var controls = document.querySelector('.controls')
  if (controls) controls.addEventListener('input', function (e) {
    var el = e.target
    if (el.dataset.slot) { live.textContent = el.value; return refreshSnippet() }
    if (el.dataset.slotHtml) {
      var o = el.options[el.selectedIndex]
      // a preset may also carry attrs (e.g. the "Large" drawer type sets width + scrolled-content + footer)
      if (o && o.dataset.attrs) {
        var aa = {}; try { aa = JSON.parse(o.dataset.attrs) } catch (e) {}
        Object.keys(aa).forEach(function (k) {
          var v = aa[k]
          if (v === '' || v == null || v === false) live.removeAttribute(k)
          else live.setAttribute(k, v === true ? '' : String(v))
        })
        // reflect the applied attrs back into the matching controls so the UI stays in sync
        if (controls) controls.querySelectorAll('[data-attr]').forEach(function (c) {
          var a = c.dataset.attr; if (!(a in aa)) return
          if (c.dataset.kind === 'bool') c.checked = c.dataset.defaultOn ? (live.getAttribute(a) !== 'false') : live.hasAttribute(a)
          else { var cv = live.getAttribute(a); c.value = cv == null ? '' : cv }
        })
      }
      live.innerHTML = (o && o.dataset.html) || ''
      // optional sibling (data-after): render/replace one node right after the live element so a "top chrome"
      // variant (e.g. widget header) shows a chart-body below it and reads as a complete card. Empty → remove it.
      var after = (o && o.dataset.after) || ''
      var sib = live.nextElementSibling && live.nextElementSibling.classList.contains('pg-after') ? live.nextElementSibling : null
      if (after) {
        if (!sib) { sib = document.createElement('div'); sib.className = 'pg-after'; live.parentNode.insertBefore(sib, live.nextSibling) }
        sib.innerHTML = after
      } else if (sib) { sib.remove() }
      return refreshSnippet()
    }
    var attr = el.dataset.attr, kind = el.dataset.kind; if (!attr) return
    // default-ON bool: OFF must set attr="false" (removing it would revert to the true default); ON removes it
    if (kind === 'bool' && el.dataset.defaultOn) el.checked ? live.removeAttribute(attr) : live.setAttribute(attr, 'false')
    else if (kind === 'bool') el.checked ? live.setAttribute(attr, '') : live.removeAttribute(attr)
    else if (el.value === '' || el.value == null) live.removeAttribute(attr)
    else live.setAttribute(attr, el.value)
    refreshSnippet()
  })
  // sync each control's initial state to the live element's playground attributes (so a default-on
  // toggle / a preset select value shows correctly instead of starting from the registry default).
  if (controls) controls.querySelectorAll('[data-attr]').forEach(function (el) {
    var attr = el.dataset.attr
    if (el.dataset.kind === 'bool') el.checked = el.dataset.defaultOn ? (live.getAttribute(attr) !== 'false') : live.hasAttribute(attr)
    else { var v = live.getAttribute(attr); if (v != null) el.value = v }
  })

  // ---- snippet ----
  var boolAttrs = {}
  if (controls) controls.querySelectorAll('input[data-kind="bool"]').forEach(function (i) { boolAttrs[i.dataset.attr] = 1 })
  function serializeLive() {
    var parts = []
    Array.prototype.forEach.call(live.attributes, function (a) {
      if (a.name === 'id') return
      if (a.value === '') { if (boolAttrs[a.name]) parts.push(' ' + a.name); return }
      parts.push(' ' + a.name + '="' + a.value + '"')
    })
    return '<' + live.tagName.toLowerCase() + parts.join('') + '>' + (live.innerHTML || '').trim() + '</' + live.tagName.toLowerCase() + '>'
  }
  var snippetEl = document.getElementById('snippet')
  function refreshSnippet() { if (snippetEl) snippetEl.textContent = serializeLive() }
  byId('copy-btn', function (b) { navigator.clipboard.writeText(serializeLive()).then(function () { flash(b, 'Copied!') }) })

  // ---- event log ----
  var page = window.__PAGE__ || { events: [] }, logEl = document.getElementById('eventlog')
  ;(page.events || []).forEach(function (ev) {
    document.querySelectorAll(page.el).forEach(function (node) {
      node.addEventListener(ev.name, function (e) {
        if (!logEl) return
        var d = document.createElement('div'); d.textContent = ev.name + ' → ' + JSON.stringify(e.detail)
        logEl.prepend(d); while (logEl.childNodes.length > 30) logEl.removeChild(logEl.lastChild)
      })
    })
  })

  // ---- helpers ----
  function byId(id, fn) { var b = document.getElementById(id); if (b) b.addEventListener('click', function () { fn(b) }) }
  function el(tag, cls) { var n = document.createElement(tag); n.className = cls || ''; return n }
  function flash(btn, txt) { var o = btn.textContent; btn.textContent = txt; setTimeout(function () { btn.textContent = o }, 1200) }
})()
