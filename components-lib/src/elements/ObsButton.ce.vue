<script setup>
// <obs-button> — the DS `button`, matched to Storybook (Atoms/Button). Exact product tokens.
// variants + sizes + loading + outline + square + block + icon shapes (circle/squared).
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  outline: { type: Boolean, default: false },
  square: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  shape: { type: String, default: '' }, // 'circle' → rounded-square icon button
  squared: { type: Boolean, default: false }, // .squared-button 35×35
})
</script>

<template>
  <button
    class="btn"
    :class="['v-' + variant, 's-' + size, { outline, block, square, squared, loading, 'shape-circle': shape === 'circle' }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spin" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<style>
:host([hidden]) { display: none !important; }
/* host is inline by default → block modifier's width:100% had nothing to fill; make the host span on [block] */
:host { display: inline-block; }
/* native form controls don't inherit font-family — force Poppins (else they render in the UA font, e.g. Arial) */
button, input, select, textarea { font-family: inherit; }
:host([block]) { display: block; width: 100%; }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: var(--font-family, 'Poppins', sans-serif); font-weight: 400; font-size: var(--text-sm, 0.8rem);
  cursor: pointer; white-space: nowrap; border: 1px solid transparent;
  border-radius: var(--btn-radius, 4px); height: var(--btn-height, 2.1rem); padding: 0 15px;
}
/* visible keyboard focus (WCAG 2.4.7) — only on keyboard focus, not mouse click */
.btn:focus-visible { outline: 2px solid var(--primary-alt, #3279be); outline-offset: 2px; }
.s-small { height: 24px; padding: 0 7px; font-size: var(--text-sm, 0.8rem); }
/* product `large` keeps the DEFAULT height/padding but bumps the font to --font-size-lg (1rem) — the product sets
   @font-size-lg: @text-regular and @btn-font-size-lg: @font-size-lg, so large = bigger text, NOT a taller box */
.s-large { height: var(--btn-height, 2.1rem); font-size: var(--font-size-lg, 1rem); }
.block { width: 100%; }
.square { border-radius: 0; }
.shape-circle, .squared { padding: 0; width: var(--btn-height, 2.1rem); }
.squared { width: 35px; height: 35px; }

/* ---- filled variants ---- */
.v-primary, .v-info, .v-neutral, .v-neutral-light, .v-warning { background: var(--primary-button-bg, #07101f); color: var(--primary-button-text, #fff); border-color: var(--primary-button-bg, #07101f); }
.v-primary:hover, .v-info:hover, .v-neutral:hover, .v-neutral-light:hover, .v-warning:hover { color: var(--primary-button-hover-text, #fff); background: var(--primary-button-hover-bg, rgba(7,16,31,0.7)); border-color: var(--primary-button-hover-bg, rgba(7,16,31,0.7)); }
.v-primary-alt { background: var(--primary-alt, #1d2a3e); color: var(--primary-button-text, #fff); border-color: var(--primary-alt, #1d2a3e); }
.v-success { background: var(--success-button-bg, #14b053); color: var(--success-button-text, #fff); border-color: var(--success-button-bg, #14b053); }
.v-success:hover { color: var(--success-button-hover-text, #fff); background: var(--success-button-hover-bg, var(--secondary-green, #14b053)); border-color: var(--success-button-bg, #14b053); }
.v-error { background: var(--error-button-bg, #ec5b5b); color: var(--error-button-text, #fff); border-color: var(--error-button-bg, #ec5b5b); }
.v-error:hover { color: var(--error-button-hover-text, #fff); background: var(--error-button-hover-bg, var(--secondary-red-dark, #c84235)); border-color: var(--error-button-bg, #ec5b5b); }
/* neutral-lighter / neutral-lightest are intentionally flat — no hover change (buttons.less) */
.v-neutral-lighter { background: var(--neutral-button-bg, #e3e8f2); color: var(--neutral-button-text, #7186a8); border-color: var(--neutral-button-bg, #e3e8f2); }
.v-neutral-lightest { background: var(--code-tag-background-color, #ecf1f9); color: var(--neutral-button-text, #7186a8); border-color: var(--code-tag-background-color, #ecf1f9); }

/* ---- bordered / text variants ---- */
.v-default { background: var(--default-button-bg, #fff); color: var(--default-button-text, #1d2a3e); border-color: var(--default-button-border, #e3e8f2); }
.v-default:hover, .v-default:active, .v-default:focus { color: var(--default-button-hover-text, var(--page-text-color, #1d2a3e)); background: var(--default-button-hover-bg, var(--neutral-lightest, #ecf1f9)); border-color: var(--outline-button-hover-border, rgba(17,28,44,0.5)); }
.v-danger { background: var(--default-button-bg, #fff); color: var(--error-outline-button-text, #ec5b5b); border-color: var(--default-button-border, #e3e8f2); }
.v-danger:hover { color: var(--error-button-text, #fff); background: var(--secondary-red-light, #f17a73); border-color: var(--secondary-red-light, #f17a73); }
.v-dashed { background: var(--default-button-bg, #fff); color: var(--default-button-text, #1d2a3e); border: 1px dashed var(--default-button-border, #e3e8f2); }
.v-dashed:hover { color: var(--button-accent-hover-color, #099dd9); border-color: var(--button-accent-hover-color, #099dd9); }
.v-ghost { background: transparent; color: var(--outline-button-text, #111c2c); border-color: var(--primary, #111c2c); }
.v-ghost:hover { color: var(--button-accent-hover-color, #099dd9); border-color: var(--button-accent-hover-color, #099dd9); }
.v-transparent { background: transparent; color: var(--button-transparent-text, #7186a8); border-color: transparent; }
.v-transparent:hover { color: var(--button-transparent-hover-text, #7186a8); }

/* ---- outline (ghost) modifier ---- */
.outline { background: var(--outline-button-bg, transparent) !important; box-shadow: none; }
.outline.v-primary, .outline.v-primary-alt { color: var(--outline-button-text, #111c2c); border-color: var(--primary, #111c2c); }
.outline.v-error { color: var(--error-outline-button-text, #ec5b5b); border-color: var(--error-outline-button-text, #ec5b5b); }
/* success ghost never overrides border-color in the product → keeps the dark/navy border, green text */
.outline.v-success { color: var(--success-outline-button-text, #14b053); border-color: var(--primary, #111c2c); }
.outline.v-default { color: var(--default-button-text, #1d2a3e); border-color: var(--default-button-border, #e3e8f2); }
.outline.v-default:hover { color: var(--default-button-hover-text, var(--page-text-color, #1d2a3e)); border-color: var(--outline-button-hover-border, rgba(17,28,44,0.5)); }
.outline.v-primary:hover, .outline.v-primary-alt:hover { color: var(--outline-button-hover-text, var(--primary, #111c2c)); background: var(--outline-button-hover-bg, #ecf1f9) !important; }
.outline.v-error:hover { color: var(--error-outline-button-hover-text, var(--secondary-red, #ec5b5b)); background: var(--error-outline-button-hover-bg, rgba(240,78,62,0.2)) !important; }
.outline.v-success:hover { color: var(--success-outline-button-hover-text, var(--secondary-green, #14b053)); background: var(--success-outline-button-hover-bg, #d1fae0) !important; }

/* ---- loading + disabled ---- */
.spin { width: 12px; height: 12px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: obsspin 0.7s linear infinite; }
@keyframes obsspin { to { transform: rotate(360deg); } }
.btn:disabled, .btn:disabled:hover {
  color: var(--button-disabled-text, rgba(0,0,0,0.5));
  background: var(--button-disabled-bg, #ecf1f9);
  border-color: var(--button-disabled-border, #e3e8f2);
  box-shadow: none;
  cursor: not-allowed;
}
.btn.loading:disabled { color: var(--primary-button-text, #fff); background: var(--primary-button-bg, #07101f); opacity: 0.75; }
</style>
