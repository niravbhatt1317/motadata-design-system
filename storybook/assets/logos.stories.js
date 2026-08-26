// Assets / Logos — the product's monitor-type / brand / integration logos, rendered as a native,
// reactive Vue story (not the static Elements HTML). Each cell merges the COLOUR logo with its
// monochrome LINE icon of the same name: shown side-by-side in "All", one at a time in Colour / Line.
// Toolbar: tabs (All · Colour logos · Line icons) · category dropdown · search. Hover a cell for
// per-variant Copy SVG / Copy PNG / Download SVG / Download PNG. Ported from the Elements
// `logosPageHtml` (site/lib/templates.mjs) — same markup, CSS, and behaviour, driven by Vue state.

import logosData from './logos.data.json'

const N_COLOR = logosData.logos.filter((l) => l.set === 'color').length
const N_LINE = logosData.logos.filter((l) => l.set === 'line').length

const ASSET_CSS = `
.lg-root { display: flex; flex-direction: column; min-height: 100vh; background: var(--page-background-color); color: var(--page-text-color); }
.lg-head { padding: 22px 28px 12px; }
.lg-head h1 { margin: 0 0 4px; font-size: 22px; }
.lg-head .muted { margin: 0; font-size: 13px; }
.lg-toolbar { padding: 12px 28px; position: sticky; top: 0; background: var(--page-background-color); z-index: 5; border-bottom: 1px solid var(--border-color); }
.lg-body { padding: 8px 28px 48px; }
.lg-row1 { display: flex; gap: 12px; align-items: center; flex-wrap: nowrap; }
.lg-right { display: flex; gap: 12px; align-items: center; margin-left: auto; }
.lg-tabs { display: inline-flex; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.lg-tab { font: inherit; font-size: 13px; padding: 7px 15px; border: none; border-right: 1px solid var(--border-color); background: var(--page-background-color); color: var(--neutral-light); cursor: pointer; }
.lg-tab:last-child { border-right: none; }
.lg-tab.active { background: var(--primary); color: var(--page-background-color); }
.lg-catfilter { position: relative; flex-shrink: 0; }
.lg-catbtn { display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; font: inherit; font-size: 13px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; }
.lg-catbtn:hover { border-color: var(--primary-alt); }
.lg-catbtn .chev { width: 8px; height: 8px; border-right: 1.5px solid var(--neutral-light); border-bottom: 1.5px solid var(--neutral-light); transform: translateY(-2px) rotate(45deg); }
.lg-catmenu { position: absolute; left: 0; top: 42px; z-index: 20; min-width: 240px; max-height: 360px; overflow: auto; background: var(--dropdown-background); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px var(--neutral-shadow-light); padding: 5px; }
.lg-catmenu[hidden] { display: none; }
.lg-catitem { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; box-sizing: border-box; padding: 8px 10px; border: none; border-radius: 6px; background: none; font: inherit; font-size: 13px; color: var(--page-text-color); cursor: pointer; text-align: left; }
.lg-catitem:hover { background: var(--dropdown-hover-background); }
.lg-catitem.active { color: var(--primary); font-weight: 500; }
.lg-catn { color: var(--neutral-light); font-size: 11px; }
.lg-searchbox { position: relative; flex: 0 0 auto; width: 460px; max-width: 44vw; }
.lg-searchbox input { width: 100%; height: 36px; box-sizing: border-box; padding: 0 12px 0 34px; font: inherit; font-size: 14px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--page-background-color); color: var(--page-text-color); outline: none; }
.lg-searchbox input:focus { border-color: var(--primary-alt); }
.lg-searchbox svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--neutral-light); }
.lg-scroll { display: block; }
.lg-group { margin-top: 20px; }
.lg-group-h { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; color: var(--neutral-light); }
.lg-group-n { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 18px; padding: 0 6px; border-radius: 100px; background: var(--code-tag-background-color); color: var(--neutral-regular); font-size: 11px; font-weight: 500; }
.lg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(152px, 1fr)); gap: 10px; }
.lg-cell { position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px 8px 11px; box-sizing: border-box; border: 1px solid var(--border-color); border-radius: 8px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; font: inherit; }
.lg-cell:hover { border-color: var(--primary-alt); }
.lg-arts { display: flex; align-items: center; justify-content: center; gap: 12px; height: 44px; }
.lg-art { display: flex; align-items: center; justify-content: center; }
.lg-art svg, .lg-art img { max-width: 54px; max-height: 42px; display: block; object-fit: contain; }
.lg-scroll[data-view="color"] .lg-line { display: none; }
.lg-scroll[data-view="line"] .lg-color { display: none; }
.lg-name { font-size: 11px; color: var(--neutral-light); text-align: center; word-break: break-word; line-height: 1.35; }
.lg-actions { position: absolute; inset: 0; display: flex; flex-direction: column; align-content: center; align-items: center; justify-content: center; gap: 8px; padding: 5px; background: var(--page-background-color); border-radius: 8px; overflow: auto; opacity: 0; visibility: hidden; transition: opacity .1s; }
.lg-cell:hover .lg-actions, .lg-cell:focus-within .lg-actions { opacity: 1; visibility: visible; }
.lg-vgroup { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 3px; }
.lg-vlabel { width: 100%; text-align: center; font-size: 8.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; color: var(--neutral-light); margin-bottom: 1px; }
.lg-scroll[data-view="color"] .v-line, .lg-scroll[data-view="line"] .v-color { display: none; }
.lg-scroll:not([data-view="all"]) .lg-vlabel { display: none; }
.lg-act { font-size: 9px; padding: 3px 4px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; }
.lg-act:hover { background: var(--dropdown-hover-background); color: var(--primary); border-color: var(--primary-alt); }
.lg-empty { padding: 30px; color: var(--neutral-light); font-size: 13px; display: none; }
.lg-toast { position: fixed; left: 50%; bottom: 26px; transform: translate(-50%, 12px); background: var(--primary); color: var(--page-background-color); padding: 9px 16px; border-radius: 8px; font-size: 13px; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; z-index: 100; box-shadow: 0 6px 20px var(--neutral-shadow-light); }
.lg-toast.show { opacity: 1; transform: translate(-50%, 0); }
`

export default {
  title: 'Assets/Logos',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Assets — the product\'s logo library: **' +
          N_COLOR +
          ' colour logos** + **' +
          N_LINE +
          ' monochrome line icons** (monitor types, brand & integrations), grouped by category. **All** shows the line icon beside its colour logo; **Colour** / **Line** show one variant at a time. Search by name, filter by category, and copy or download any variant as **SVG** or **PNG**.',
      },
    },
  },
}

export const Library = () => ({
  data() {
    // merge colour + line variants by name so one cell can hold BOTH (side by side in "All",
    // one at a time otherwise). A colour variant sets the category; a line-only entry uses its own.
    const byName = new Map()
    for (const l of logosData.logos) {
      if (!byName.has(l.n)) {
        byName.set(l.n, { n: l.n, cat: l.cat, color: null, line: null })
      }
      const e = byName.get(l.n)
      if (l.set === 'color') {
        e.color = l
        e.cat = l.cat
      } else {
        e.line = l
        if (!e.color) e.cat = l.cat
      }
    }
    const entries = Object.freeze([...byName.values()])
    const presentCats = Object.freeze(
      logosData.catOrder.filter((c) => entries.some((e) => e.cat === c))
    )
    return {
      entries,
      presentCats,
      nColor: N_COLOR,
      nLine: N_LINE,
      q: '',
      view: 'all',
      activeCat: 'all',
      catOpen: false,
      toast: '',
      _toastTimer: null,
      _outsideHandler: null,
    }
  },
  computed: {
    sections() {
      const q = this.q.trim().toLowerCase()
      const view = this.view
      const activeCat = this.activeCat
      const out = []
      for (const cat of this.presentCats) {
        if (activeCat !== 'all' && activeCat !== cat) continue
        const items = this.entries
          .filter((e) => {
            if (e.cat !== cat) return false
            const hasArt =
              view === 'all' ||
              (view === 'color' && !!e.color) ||
              (view === 'line' && !!e.line)
            if (!hasArt) return false
            if (q && e.n.indexOf(q) < 0) return false
            return true
          })
          .sort((a, b) => a.n.localeCompare(b.n))
        if (items.length) out.push({ cat, items })
      }
      return out
    },
  },
  watch: {
    // whenever the visible set changes (view / category / search) re-fit any newly rendered
    // line svgs — but not while lines are hidden (colour view), where getBBox returns 0.
    sections() {
      if (this.view !== 'color') this.$nextTick(this.fitLine)
    },
  },
  methods: {
    setView(v) {
      this.view = v
      if (v !== 'color') this.$nextTick(this.fitLine)
    },
    pickCat(c) {
      this.activeCat = c
      this.catOpen = false
    },
    catCount(c) {
      return this.entries.filter((e) => e.cat === c).length
    },
    colorArt(e) {
      if (!e.color) return ''
      return e.color.kind === 'img'
        ? '<img src="' + e.color.src + '" alt="' + e.n + '" loading="lazy"/>'
        : e.color.svg
    },
    // fit each line svg's viewBox to the path's REAL bbox (paths come at 48/256/512 scale).
    // Needs the svg visible; each svg is fitted once — remove data-fit after a successful fit.
    fitLine() {
      if (!this.$el) return
      const svgs = [].slice.call(
        this.$el.querySelectorAll('.lg-line svg[data-fit]')
      )
      svgs.forEach((svg) => {
        try {
          const p = svg.querySelector('path')
          const bb = p.getBBox()
          if (!bb.width || !bb.height) return
          const pad = Math.max(bb.width, bb.height) * 0.06
          svg.setAttribute(
            'viewBox',
            bb.x - pad +
              ' ' +
              (bb.y - pad) +
              ' ' +
              (bb.width + 2 * pad) +
              ' ' +
              (bb.height + 2 * pad)
          )
          svg.removeAttribute('data-fit')
        } catch (err) {
          /* getBBox can throw for a detached/hidden node — retry on next render */
        }
      })
    },
    svgStr(el) {
      if (!el || el.tagName.toLowerCase() !== 'svg') return null
      let s = el.outerHTML
      if (!/xmlns=/.test(s)) {
        s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
      }
      return s
    },
    rasterize(el, size) {
      size = size || 256
      return new Promise((resolve) => {
        if (!el) return resolve(null)
        const img = new Image()
        img.onload = function () {
          const c = document.createElement('canvas')
          c.width = size
          c.height = size
          const ctx = c.getContext('2d')
          const iw = img.naturalWidth || size
          const ih = img.naturalHeight || size
          const sc = Math.min(size / iw, size / ih)
          const w = iw * sc
          const h = ih * sc
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
          c.toBlob(resolve, 'image/png')
        }
        img.onerror = function () {
          resolve(null)
        }
        if (el.tagName.toLowerCase() === 'img') {
          img.src = el.src
        } else {
          let s = el.outerHTML
          const color =
            getComputedStyle(document.documentElement)
              .getPropertyValue('--page-text-color')
              .trim() || '#1d2a3e'
          s = s.replace(/currentColor/g, color)
          if (!/xmlns=/.test(s)) {
            s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
          }
          img.src =
            'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s)
        }
      })
    },
    dl(blob, filename) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(function () {
        URL.revokeObjectURL(url)
      }, 1000)
    },
    // the clicked action carries its variant (colour|line); pick THAT variant's art from the cell
    async act(e, variant, action, ev) {
      const cell = ev.target.closest('.lg-cell')
      const box = cell ? cell.querySelector('.lg-' + variant) : null
      const el = box ? box.querySelector('svg') || box.querySelector('img') : null
      const name = e.n + (variant === 'line' ? '-line' : '')
      const isCopy = action.charAt(0) === 'c'
      try {
        if (action === 'csvg') {
          const s = this.svgStr(el)
          if (!s) return this.showToast('PNG-only logo — use PNG')
          await navigator.clipboard.writeText(s)
          this.showToast('Copied ' + variant + ' SVG · ' + e.n)
        } else if (action === 'cpng') {
          const b = await this.rasterize(el)
          if (!b) return this.showToast('Could not render ' + name)
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': b }),
          ])
          this.showToast('Copied ' + variant + ' PNG · ' + e.n)
        } else if (action === 'dsvg') {
          const s2 = this.svgStr(el)
          if (!s2) return this.showToast('PNG-only logo — use ↓png')
          this.dl(new Blob([s2], { type: 'image/svg+xml' }), name + '.svg')
          this.showToast('Downloaded ' + name + '.svg')
        } else if (action === 'dpng') {
          const b2 = await this.rasterize(el)
          if (!b2) return this.showToast('Could not render ' + name)
          this.dl(b2, name + '.png')
          this.showToast('Downloaded ' + name + '.png')
        }
      } catch (err) {
        this.showToast(
          isCopy ? 'Clipboard blocked — use ⤓ to download' : 'Download failed'
        )
      }
    },
    showToast(m) {
      this.toast = m
      clearTimeout(this._toastTimer)
      this._toastTimer = setTimeout(() => {
        this.toast = ''
      }, 1500)
    },
  },
  mounted() {
    if (!document.getElementById('assets-logos-css')) { const st = document.createElement('style'); st.id = 'assets-logos-css'; st.textContent = ASSET_CSS; document.head.appendChild(st) }
    // default view is "all" → line arts are visible, so fit them now
    this.$nextTick(this.fitLine)
    this._outsideHandler = (e) => {
      if (!this.catOpen) return
      if (!e.target.closest('.lg-catfilter')) this.catOpen = false
    }
    document.addEventListener('click', this._outsideHandler)
  },
  beforeDestroy() {
    if (this._outsideHandler) {
      document.removeEventListener('click', this._outsideHandler)
    }
    clearTimeout(this._toastTimer)
  },
  template: `
<div class="lg-root">
  <div class="lg-scroll" :data-view="view">
    <div class="lg-head">
      <h1>Logos</h1>
      <p class="muted">The product's logo library — <b>{{ nColor }}</b> colour logos + <b>{{ nLine }}</b> monochrome line icons (monitor types, brand &amp; integrations), grouped by category. <b>All</b> shows the line icon beside its colour logo. Hover to copy the SVG/PNG or download.</p>
    </div>
    <div class="lg-toolbar">
      <div class="lg-row1">
        <div class="lg-tabs">
          <button class="lg-tab" :class="{ active: view === 'all' }" @click="setView('all')">All</button><button class="lg-tab" :class="{ active: view === 'color' }" @click="setView('color')">Colour logos</button><button class="lg-tab" :class="{ active: view === 'line' }" @click="setView('line')">Line icons</button>
        </div>
        <div class="lg-right">
          <div class="lg-catfilter">
            <button class="lg-catbtn" @click.stop="catOpen = !catOpen"><span>{{ activeCat === 'all' ? 'All categories' : activeCat }}</span><span class="chev"></span></button>
            <div class="lg-catmenu" v-show="catOpen">
              <button class="lg-catitem" :class="{ active: activeCat === 'all' }" @click="pickCat('all')">All categories<span class="lg-catn">{{ entries.length }}</span></button><button v-for="c in presentCats" :key="c" class="lg-catitem" :class="{ active: activeCat === c }" @click="pickCat(c)">{{ c }}<span class="lg-catn">{{ catCount(c) }}</span></button>
            </div>
          </div>
          <div class="lg-searchbox">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" v-model="q" placeholder="Search logos by name…" autocomplete="off" spellcheck="false" />
          </div>
        </div>
      </div>
    </div>
    <div class="lg-body">
      <section v-for="sec in sections" :key="sec.cat" class="lg-group">
        <h2 class="lg-group-h">{{ sec.cat }}<span class="lg-group-n">{{ sec.items.length }}</span></h2>
        <div class="lg-grid">
          <button v-for="e in sec.items" :key="e.n" class="lg-cell" :class="{ 'has-color': !!e.color, 'has-line': !!e.line }">
            <span class="lg-arts"><span v-if="e.color" class="lg-art lg-color" v-html="colorArt(e)"></span><span v-if="e.line" class="lg-art lg-line" v-html="e.line.svg"></span></span>
            <span class="lg-name">{{ e.n }}</span>
            <span class="lg-actions">
              <span v-if="e.color" class="lg-vgroup v-color"><span class="lg-vlabel">Colour</span><span class="lg-act" title="Copy SVG" @click.stop="act(e, 'color', 'csvg', $event)">SVG</span><span class="lg-act" title="Copy PNG" @click.stop="act(e, 'color', 'cpng', $event)">PNG</span><span class="lg-act" title="Download SVG" @click.stop="act(e, 'color', 'dsvg', $event)">↓svg</span><span class="lg-act" title="Download PNG" @click.stop="act(e, 'color', 'dpng', $event)">↓png</span></span><span v-if="e.line" class="lg-vgroup v-line"><span class="lg-vlabel">Line</span><span class="lg-act" title="Copy SVG" @click.stop="act(e, 'line', 'csvg', $event)">SVG</span><span class="lg-act" title="Copy PNG" @click.stop="act(e, 'line', 'cpng', $event)">PNG</span><span class="lg-act" title="Download SVG" @click.stop="act(e, 'line', 'dsvg', $event)">↓svg</span><span class="lg-act" title="Download PNG" @click.stop="act(e, 'line', 'dpng', $event)">↓png</span></span>
            </span>
          </button>
        </div>
      </section>
      <p class="lg-empty" v-if="sections.length === 0" style="display:block">No logos match.</p>
    </div>
  </div>
  <div class="lg-toast" :class="{ show: !!toast }">{{ toast }}</div>
</div>`,
})

Library.parameters = {
  controls: { disable: true },
  layout: 'fullscreen',
  docs: {
    description: {
      story:
        'The full logo library, live — **' +
        N_COLOR +
        '** colour logos + **' +
        N_LINE +
        '** monochrome line icons. **Tabs**: **All** (line icon beside its colour logo) · **Colour logos** · **Line icons**. Filter with the **category dropdown**, **search** by name, and **hover** any cell for per-variant **Copy SVG · Copy PNG · ↓svg · ↓png** (each action targets the colour or line variant it sits under). Line-icon viewBoxes are auto-fitted to their real path bbox on render. Copy falls back to a "Clipboard blocked" toast where the browser forbids it — use download instead.',
    },
  },
}
