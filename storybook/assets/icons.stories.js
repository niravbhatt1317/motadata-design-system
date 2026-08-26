// Assets / Icons — the product's real Font Awesome Light set, rendered as a native, reactive Vue
// story (not the static Elements HTML). Each cell shows the genuine inline SVG; hover reveals
// Copy SVG / Copy PNG / Download SVG / Download PNG. Toolbar: search · colour-wheel recolour
// (presets + custom + reset) · names toggle · S/M/L size. Ported from the Elements
// `iconsPageHtml` (site/lib/templates.mjs) — same markup, CSS, and behaviour, driven by Vue state.

import iconsData from './icons.data.json'

const ASSET_CSS = `
.ic-root { display: flex; flex-direction: column; min-height: 100vh; background: var(--page-background-color); color: var(--page-text-color); }
.ic-head { padding: 22px 28px 12px; }
.ic-head h1 { margin: 0 0 4px; font-size: 22px; }
.ic-head .muted { margin: 0; font-size: 13px; }
/* the toolbar sticks to the top of the viewport; the heading above it scrolls away */
.ic-toolbar { padding: 12px 28px; position: sticky; top: 0; background: var(--page-background-color); z-index: 5; border-bottom: 1px solid var(--border-color); }
.ic-row { display: flex; gap: 12px 16px; align-items: center; flex-wrap: wrap; }
.ic-searchbox { position: relative; flex: 1 1 260px; min-width: 200px; max-width: 460px; }
.ic-searchbox input { width: 100%; height: 36px; box-sizing: border-box; padding: 0 12px 0 34px; font: inherit; font-size: 14px;
  border: 1px solid var(--border-color); border-radius: 8px; background: var(--page-background-color); color: var(--page-text-color); outline: none; }
.ic-searchbox input:focus { border-color: var(--primary-alt); }
.ic-searchbox > svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--neutral-light); }
.ic-controls { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-left: auto; }
/* colour-wheel button + popover (with presets, a custom picker, and Reset inside it) */
.ic-colorwrap { position: relative; }
.ic-colorbtn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 30px; padding: 0; border: 1px solid var(--border-color); border-radius: 7px; background: var(--page-background-color); cursor: pointer; }
.ic-colorbtn:hover { border-color: var(--primary-alt); }
.ic-colorpop { position: absolute; right: 0; top: 38px; z-index: 30; width: 200px; box-sizing: border-box; background: var(--dropdown-background); border: 1px solid var(--border-color); border-radius: 10px; box-shadow: 0 8px 24px var(--neutral-shadow-light); padding: 12px; }
.ic-pop-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; color: var(--neutral-light); margin-bottom: 10px; }
.ic-swatches { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; margin-bottom: 12px; }
.ic-sw { width: 100%; aspect-ratio: 1; border: 1px solid var(--border-color); border-radius: 5px; cursor: pointer; padding: 0; }
.ic-sw:hover { outline: 2px solid var(--primary-alt); outline-offset: 1px; }
.ic-custom { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 12px; color: var(--page-text-color); margin-bottom: 10px; cursor: pointer; }
.ic-custom-sw { position: relative; width: 28px; height: 28px; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; }
.ic-custom-sw input { position: absolute; inset: -6px; width: 150%; height: 150%; border: none; padding: 0; cursor: pointer; background: none; }
.ic-reset { width: 100%; height: 32px; font: inherit; font-size: 12px; border: 1px solid var(--border-color); border-radius: 7px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; }
.ic-reset:hover { border-color: var(--primary-alt); color: var(--primary); }
.ic-toggle { display: inline-flex; align-items: center; gap: 8px; height: 30px; padding: 0 12px; font: inherit; font-size: 12px; border: 1px solid var(--border-color); border-radius: 7px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; }
.ic-toggle .dot { width: 26px; height: 15px; border-radius: 100px; background: var(--neutral-lighter); position: relative; transition: background .12s; flex-shrink: 0; }
.ic-toggle .dot::after { content: ""; position: absolute; top: 2px; left: 2px; width: 11px; height: 11px; border-radius: 50%; background: var(--page-background-color); transition: transform .12s; }
.ic-toggle[aria-pressed="true"] .dot { background: var(--primary); }
.ic-toggle[aria-pressed="true"] .dot::after { transform: translateX(11px); }
.ic-sizes { display: inline-flex; border: 1px solid var(--border-color); border-radius: 7px; overflow: hidden; }
.ic-size { width: 32px; height: 30px; font: inherit; font-size: 12px; border: none; border-right: 1px solid var(--border-color); background: var(--page-background-color); color: var(--neutral-light); cursor: pointer; }
.ic-size:last-child { border-right: none; }
.ic-size.active { background: var(--primary); color: var(--page-background-color); }
.ic-body { padding: 10px 28px 40px; }
.icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(116px, 1fr)); gap: 10px; --icon-color: var(--page-text-color); }
.icon-grid[data-size="s"] { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); }
.icon-grid[data-size="l"] { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.ic-cell { position: relative; display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 18px 8px 12px; box-sizing: border-box;
  border: 1px solid var(--border-color); border-radius: 8px; background: var(--page-background-color); cursor: pointer; font: inherit; }
.ic-cell:hover { border-color: var(--primary-alt); }
.ic-svg svg { width: 26px; height: 26px; display: block; color: var(--icon-color); }
.icon-grid[data-size="s"] .ic-svg svg { width: 22px; height: 22px; }
.icon-grid[data-size="l"] .ic-svg svg { width: 38px; height: 38px; }
.ic-name { font-size: 11px; color: var(--neutral-light); text-align: center; word-break: break-word; line-height: 1.35; }
.icon-grid.no-names .ic-name { display: none; }
.icon-grid.no-names .ic-cell { padding: 20px 8px; }
.ic-actions { position: absolute; inset: 0; display: flex; flex-wrap: wrap; align-content: center; align-items: center; justify-content: center; gap: 5px;
  padding: 6px; background: var(--page-background-color); border-radius: 8px; opacity: 0; visibility: hidden; transition: opacity .1s; }
.ic-cell:hover .ic-actions, .ic-cell:focus-within .ic-actions { opacity: 1; visibility: visible; }
.ic-act { font-size: 10px; padding: 4px 7px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--page-background-color); color: var(--page-text-color); cursor: pointer; }
.ic-act:hover { background: var(--dropdown-hover-background); color: var(--primary); border-color: var(--primary-alt); }
.ic-empty { padding: 30px; color: var(--neutral-light); font-size: 13px; }
.ic-toast { position: fixed; left: 50%; bottom: 26px; transform: translate(-50%, 12px); background: var(--primary); color: var(--page-background-color);
  padding: 9px 16px; border-radius: 8px; font-size: 13px; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; z-index: 100; box-shadow: 0 6px 20px var(--neutral-shadow-light); }
.ic-toast.show { opacity: 1; transform: translate(-50%, 0); }
`

export default {
  title: 'Assets/Icons',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Assets — the product\'s **' +
          iconsData.icons.length +
          ' Font Awesome Light (`fal`) glyphs**, extracted from `src/assets/icons/icons.js` and referenced in the app as `<MIcon name="…"/>`. Each cell renders the genuine inline `<svg fill="currentColor">`. **Search** by name, **recolour** (8 presets · custom picker · reset to theme), **resize** (S/M/L), and **copy or download** any glyph as **SVG** or **PNG**.',
      },
    },
  },
}

export const Library = () => ({
  data() {
    return {
      q: '',
      iconColor: null, // null = follow the theme; a hex string = recoloured
      showNames: true,
      size: 'm',
      colorOpen: false,
      toast: '',
      all: Object.freeze(iconsData.icons),
      prefix: iconsData.prefix,
      _toastTimer: null,
      _outsideHandler: null,
    }
  },
  computed: {
    filtered() {
      const q = this.q.trim().toLowerCase()
      if (!q) return this.all
      return this.all.filter((ic) => ic.n.indexOf(q) >= 0)
    },
  },
  methods: {
    svgStr(ic) {
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
        ic.w +
        ' ' +
        ic.h +
        '" fill="' +
        (this.iconColor || 'currentColor') +
        '"><path d="' +
        ic.p +
        '"' +
        (ic.fr ? ' fill-rule="' + ic.fr + '"' : '') +
        '/></svg>'
      )
    },
    toPng(ic, size) {
      size = size || 256
      const color =
        this.iconColor ||
        getComputedStyle(document.documentElement)
          .getPropertyValue('--page-text-color')
          .trim() ||
        '#1d2a3e'
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
        ic.w +
        ' ' +
        ic.h +
        '" fill="' +
        color +
        '"><path d="' +
        ic.p +
        '"' +
        (ic.fr ? ' fill-rule="' + ic.fr + '"' : '') +
        '/></svg>'
      const img = new Image()
      return new Promise((resolve, reject) => {
        img.onload = function () {
          const c = document.createElement('canvas')
          c.width = size
          c.height = size
          c.getContext('2d').drawImage(img, 0, 0, size, size)
          c.toBlob(resolve, 'image/png')
        }
        img.onerror = reject
        img.src =
          'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
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
    async copy(ic, kind) {
      try {
        if (kind === 'svg') {
          await navigator.clipboard.writeText(this.svgStr(ic))
          this.showToast('Copied SVG · ' + ic.n)
        } else {
          const blob = await this.toPng(ic)
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ])
          this.showToast('Copied PNG · ' + ic.n)
        }
      } catch (err) {
        this.showToast('Clipboard blocked — use ⤓ to download')
      }
    },
    async download(ic, kind) {
      try {
        if (kind === 'svg') {
          this.dl(
            new Blob([this.svgStr(ic)], { type: 'image/svg+xml' }),
            ic.n + '.svg'
          )
          this.showToast('Downloaded ' + ic.n + '.svg')
        } else {
          const blob = await this.toPng(ic, 256)
          this.dl(blob, ic.n + '.png')
          this.showToast('Downloaded ' + ic.n + '.png')
        }
      } catch (err) {
        this.showToast('Clipboard blocked — use ⤓ to download')
      }
    },
    setColor(hex) {
      this.iconColor = hex
    },
    resetColor() {
      this.iconColor = null
      this.colorOpen = false
      this.showToast('Colour reset')
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
    if (!document.getElementById('assets-icons-css')) { const st = document.createElement('style'); st.id = 'assets-icons-css'; st.textContent = ASSET_CSS; document.head.appendChild(st) }
    this._outsideHandler = (e) => {
      if (!this.colorOpen) return
      const wrap = this.$el.querySelector('.ic-colorwrap')
      if (wrap && !wrap.contains(e.target)) this.colorOpen = false
    }
    document.addEventListener('click', this._outsideHandler)
  },
  beforeDestroy() {
    if (this._outsideHandler)
      document.removeEventListener('click', this._outsideHandler)
    clearTimeout(this._toastTimer)
  },
  template: `
<div class="ic-root">
  <div class="ic-head">
    <h1>Icons</h1>
    <p class="muted">The product's icon set — <b>{{ all.length }}</b> {{ prefix }} glyphs from <code>src/assets/icons/icons.js</code>, referenced as <code>&lt;MIcon name="…"/&gt;</code>. Search, recolour, resize, and copy/download any as SVG or PNG.</p>
  </div>
  <div class="ic-toolbar">
    <div class="ic-row">
      <div class="ic-searchbox">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" v-model="q" :placeholder="'Search ' + all.length + ' icons by name…'" autocomplete="off" spellcheck="false" />
      </div>
      <div class="ic-controls">
        <div class="ic-colorwrap">
          <button class="ic-colorbtn" title="Recolour icons" aria-label="Recolour icons" @click.stop="colorOpen = !colorOpen">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 12L22 12A10 10 0 0 1 19.07 19.07Z" fill="#f04e3e"/><path d="M12 12L19.07 19.07A10 10 0 0 1 12 22Z" fill="#f78c1e"/><path d="M12 12L12 22A10 10 0 0 1 4.93 19.07Z" fill="#f5c518"/><path d="M12 12L4.93 19.07A10 10 0 0 1 2 12Z" fill="#14b053"/><path d="M12 12L2 12A10 10 0 0 1 4.93 4.93Z" fill="#12b5b0"/><path d="M12 12L4.93 4.93A10 10 0 0 1 12 2Z" fill="#099dd9"/><path d="M12 12L12 2A10 10 0 0 1 19.07 4.93Z" fill="#6a5acd"/><path d="M12 12L19.07 4.93A10 10 0 0 1 22 12Z" fill="#d63384"/><circle cx="12" cy="12" r="3.4" fill="var(--page-background-color,#fff)"/></svg>
          </button>
          <div class="ic-colorpop" v-show="colorOpen">
            <div class="ic-pop-title">Icon colour</div>
            <div class="ic-swatches">
              <button class="ic-sw" style="background:#111c2c" title="Navy" @click="setColor('#111c2c')"></button><button class="ic-sw" style="background:#000" title="Black" @click="setColor('#000000')"></button><button class="ic-sw" style="background:#6a7fa0" title="Grey" @click="setColor('#6a7fa0')"></button><button class="ic-sw" style="background:#ec5b5b" title="Red" @click="setColor('#ec5b5b')"></button><button class="ic-sw" style="background:#f78c1e" title="Orange" @click="setColor('#f78c1e')"></button><button class="ic-sw" style="background:#14b053" title="Green" @click="setColor('#14b053')"></button><button class="ic-sw" style="background:#099dd9" title="Blue" @click="setColor('#099dd9')"></button><button class="ic-sw" style="background:#6a5acd" title="Purple" @click="setColor('#6a5acd')"></button>
            </div>
            <label class="ic-custom"><span>Custom</span><span class="ic-custom-sw"><input type="color" :value="iconColor || '#1d2a3e'" @input="setColor($event.target.value)" /></span></label>
            <button class="ic-reset" @click="resetColor">Reset to theme colour</button>
          </div>
        </div>
        <button class="ic-toggle" :aria-pressed="showNames ? 'true' : 'false'" title="Show / hide names" @click="showNames = !showNames"><span class="dot"></span>Names</button>
        <div class="ic-sizes" role="group" aria-label="Icon size">
          <button class="ic-size" :class="{ active: size === 's' }" @click="size = 's'">S</button><button class="ic-size" :class="{ active: size === 'm' }" @click="size = 'm'">M</button><button class="ic-size" :class="{ active: size === 'l' }" @click="size = 'l'">L</button>
        </div>
      </div>
    </div>
  </div>
  <div class="ic-body">
    <div class="icon-grid" :data-size="size" :class="{ 'no-names': !showNames }" :style="{ '--icon-color': iconColor || undefined }">
      <button v-for="ic in filtered" :key="ic.n" class="ic-cell" :data-n="ic.n">
        <span class="ic-svg"><svg :viewBox="'0 0 ' + ic.w + ' ' + ic.h" fill="currentColor" aria-hidden="true"><path :d="ic.p" :fill-rule="ic.fr || null" :clip-rule="ic.fr || null"/></svg></span>
        <span class="ic-name">{{ ic.n }}</span>
        <span class="ic-actions">
          <span class="ic-act" title="Copy SVG" @click.stop="copy(ic, 'svg')">SVG</span><span class="ic-act" title="Copy PNG" @click.stop="copy(ic, 'png')">PNG</span><span class="ic-act" title="Download SVG" @click.stop="download(ic, 'svg')">⤓svg</span><span class="ic-act" title="Download PNG" @click.stop="download(ic, 'png')">⤓png</span>
        </span>
      </button>
    </div>
    <p class="ic-empty" v-if="filtered.length === 0">No icons match.</p>
  </div>
  <div class="ic-toast" :class="{ show: !!toast }">{{ toast }}</div>
</div>`,
})

Library.parameters = {
  controls: { disable: true },
  layout: 'fullscreen',
  docs: {
    description: {
      story:
        'The full **' +
        iconsData.icons.length +
        '**-glyph `fal` library, live. **Type** in the search box to filter by name. Click the **colour-wheel** to recolour — pick a preset swatch, use the **Custom** picker, or **Reset to theme colour**. Toggle **Names**, switch **S / M / L** size. **Hover** any cell for **Copy SVG · Copy PNG · ⤓svg · ⤓png** (copy falls back to a "Clipboard blocked" toast where the browser forbids it — use download instead).',
    },
  },
}
