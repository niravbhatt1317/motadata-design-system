<script setup>
// <obs-link> — DS `link` (FlotoLink). A NAVIGATION control. Default = inline text link (brand --primary navy,
// UNDERLINED at rest so it reads as a link — same colour as body text, so the underline is the affordance,
// matching the product); `external` = plain anchor + rel (opens new tab, no icon); `k-link` = subtle grid
// link (no underline until hover); `as-button` = button-styled CTA (any Button `variant`/`size`, no underline).
defineProps({
  href: { type: String },
  asButton: { type: Boolean, default: false },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'default' },
  external: { type: Boolean, default: false },
  kLink: { type: Boolean, default: false },
  muted: { type: Boolean, default: false }, // secondary/subdued link (e.g. a Cancel action) — lighter text, same dotted underline
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <a
    class="lnk"
    :class="[asButton ? ['as-btn', 'v-' + variant, 's-' + size] : null, { klink: kLink && !asButton, muted: muted && !asButton, disabled }]"
    :href="disabled ? undefined : (href || '#')"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  ><slot /></a>
</template>

<style>
:host([hidden]) { display: none !important; }
.lnk { font-family: var(--font-family, 'Poppins', sans-serif); font-size: var(--text-sm, 0.8rem);
  color: var(--primary, #111c2c); text-decoration: underline dotted; cursor: pointer; }
.lnk:hover { text-decoration: underline dotted; }
/* k-link: subtle grid/pagination link — no underline until hover */
.klink { color: var(--neutral-light, #7186a8); text-decoration: none; }
.klink:hover { color: var(--primary, #111c2c); text-decoration: underline dotted; }
/* muted: secondary/subdued link (e.g. Cancel) — lighter text, keeps the dotted underline */
.muted { color: var(--neutral-light, #7186a8); }
/* hover emphasises via --page-text-color (darker in light, LIGHTER in dark) — --neutral-dark would darken to
   near-black in dark mode and disappear. */
.muted:hover { color: var(--page-text-color, #1d2a3e); text-decoration: underline dotted; }
.disabled { color: var(--neutral-light, #8e9fbc); opacity: 0.6; cursor: not-allowed; pointer-events: none; text-decoration: none; }
/* ---- as-button: button-styled navigation CTA, matches <obs-button> variants ---- */
.as-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap;
  height: var(--btn-height, 2.1rem); padding: 0 15px; border: 1px solid transparent; border-radius: var(--btn-radius, 4px);
  font-weight: 500; text-decoration: none; }
.as-btn:hover { text-decoration: none; }
.as-btn.s-small { height: 24px; padding: 0 var(--padding-sm, 12px); }
/* as-button variants — mirror the full obs-button set so <obs-link as-button variant="…"> covers every variant */
.as-btn.v-primary, .as-btn.v-info, .as-btn.v-neutral, .as-btn.v-neutral-light, .as-btn.v-warning { background: var(--primary-button-bg, #07101f); color: var(--primary-button-text, #fff); border-color: var(--primary-button-bg, #07101f); }
.as-btn.v-primary:hover, .as-btn.v-info:hover, .as-btn.v-neutral:hover, .as-btn.v-neutral-light:hover, .as-btn.v-warning:hover { background: var(--primary-button-hover-bg, rgba(7, 16, 31, 0.7)); border-color: var(--primary-button-hover-bg, rgba(7, 16, 31, 0.7)); }
.as-btn.v-primary-alt { background: var(--primary-alt, #1d2a3e); color: var(--primary-button-text, #fff); border-color: var(--primary-alt, #1d2a3e); }
.as-btn.v-success { background: var(--success-button-bg, #14b053); color: var(--success-button-text, #fff); border-color: var(--success-button-bg, #14b053); }
.as-btn.v-success:hover { background: var(--success-button-hover-bg, var(--secondary-green, #14b053)); border-color: var(--success-button-bg, #14b053); }
.as-btn.v-error { background: var(--error-button-bg, #ec5b5b); color: var(--error-button-text, #fff); border-color: var(--error-button-bg, #ec5b5b); }
.as-btn.v-error:hover { background: var(--error-button-hover-bg, var(--secondary-red-dark, #c84235)); border-color: var(--error-button-bg, #ec5b5b); }
.as-btn.v-neutral-lighter { background: var(--neutral-button-bg, #e3e8f2); color: var(--neutral-button-text, #7186a8); border-color: var(--neutral-button-bg, #e3e8f2); }
.as-btn.v-neutral-lightest { background: var(--code-tag-background-color, #ecf1f9); color: var(--neutral-button-text, #7186a8); border-color: var(--code-tag-background-color, #ecf1f9); }
.as-btn.v-default { background: var(--default-button-bg, #fff); color: var(--default-button-text, #1d2a3e); border-color: var(--default-button-border, #e3e8f2); }
.as-btn.v-default:hover { background: var(--default-button-hover-bg, var(--neutral-lightest, #ecf1f9)); border-color: var(--outline-button-hover-border, rgba(17, 28, 44, 0.5)); }
.as-btn.v-danger { background: var(--default-button-bg, #fff); color: var(--error-outline-button-text, #ec5b5b); border-color: var(--default-button-border, #e3e8f2); }
.as-btn.v-danger:hover { color: var(--error-button-text, #fff); background: var(--secondary-red-light, #f17a73); border-color: var(--secondary-red-light, #f17a73); }
.as-btn.v-dashed { background: var(--default-button-bg, #fff); color: var(--default-button-text, #1d2a3e); border: 1px dashed var(--default-button-border, #e3e8f2); }
.as-btn.v-dashed:hover { color: var(--button-accent-hover-color, #099dd9); border-color: var(--button-accent-hover-color, #099dd9); }
.as-btn.v-ghost { background: transparent; color: var(--outline-button-text, #111c2c); border-color: var(--primary, #111c2c); }
.as-btn.v-transparent { background: transparent; color: var(--button-transparent-text, #7186a8); border-color: transparent; }
.as-btn.disabled { background: var(--button-disabled-bg, #ecf1f9); color: var(--button-disabled-text, rgba(0, 0, 0, 0.5)); border-color: var(--button-disabled-border, #e3e8f2); }
</style>
