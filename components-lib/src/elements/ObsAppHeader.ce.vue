<script setup>
// <obs-app-header> — the product's GLOBAL top bar (layout/header.vue): the brand/logo on the left, and on the
// right a row of circular action icon-buttons (search / health / approval / notifications with a count badge),
// a BUILD version tag, and the user avatar/menu. It is the app CHROME present on every page — a SEPARATE
// archetype from obs-page-header (the per-page title bar). Pairs with obs-sidebar (the left nav).
// Values measured from the rendered story (organisms-toolbars-examples--app-header).
//
//   <obs-app-header brand="motadata" build="8.0.0" user="NB"
//     actions='[{"icon":"search","label":"Search"},{"icon":"bell","label":"Notifications","badge":3}]'></obs-app-header>
//   Slots: `brand` (a logo <img>) · default (extra actions) · `user` (a custom user menu, e.g. obs-menu).
import { computed } from 'vue'
const props = defineProps({
  brand: { type: String, default: '' },      // brand text; if empty AND no `brand` slot, the DEFAULT ObserveOps logo (obs-logo) renders
  actions: { type: String, default: '' },     // JSON [{icon,label,badge?,active?}] → circular icon buttons
  build: { type: String, default: '' },       // BUILD version tag text, e.g. "8.0.0" → "BUILD : 8.0.0"
  user: { type: String, default: '' },        // user initials for the avatar (or use the `user` slot)
})
const emit = defineEmits(['action', 'user'])
const onAction = (a, i) => emit('action', { icon: a.icon, label: a.label, index: i })
// the `user` fallback avatar is a REAL button that emits `user` on activation (G22) — the affordance is honest, not
// a dead role="button". For a full account menu, put obs-user-menu in the `user` slot instead.
const onUser = () => emit('user')
const actionItems = computed(() => {
  const raw = String(props.actions || '').trim()
  if (!raw || raw[0] !== '[') return []
  try {
    return JSON.parse(raw).map((a, i) => ({
      icon: a.icon || '', label: a.label || a.icon || `Action ${i + 1}`,
      badge: a.badge === 0 || a.badge ? a.badge : null,
      active: a.active === true || a.active === 'true',
    }))
  } catch (e) { return [] }
})
</script>

<template>
  <header class="app">
    <!-- brand: a custom logo via the `brand` slot > the `brand` text prop > the DEFAULT ObserveOps mark (obs-logo). -->
    <div class="brand"><slot name="brand"><span v-if="brand">{{ brand }}</span><obs-logo v-else name="motadata_full" size="36" label="ObserveOps" class="brand-mk"></obs-logo></slot></div>
    <div class="right">
      <button v-for="(a, i) in actionItems" :key="i" class="circ" :class="{ active: a.active }" type="button" :aria-label="a.label" :title="a.label" @click="onAction(a, i)">
        <obs-icon :name="a.icon" size="18"></obs-icon>
        <span v-if="a.badge !== null" class="badge">{{ a.badge }}</span>
      </button>
      <slot></slot>
      <span v-if="build" class="build">BUILD : {{ build }}</span>
      <slot name="user"><button v-if="user" type="button" class="avatar" aria-label="Account menu" @click="onUser">{{ user }}</button></slot>
    </div>
  </header>
</template>

<style>
:host([hidden]) { display: none !important; }
button { font-family: inherit; }
:host { display: block; }
.app {
  display: flex; align-items: center; justify-content: space-between;
  height: 50px; padding: 0 8px;
  background: var(--page-background-color, #fff); border-bottom: 1px solid var(--border-color, #e3e8f2);
  color: var(--page-text-color, #1d2a3e);
}
.brand { display: inline-flex; align-items: center; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; color: var(--primary-alt, #1d2a3e); }
.brand ::slotted(img) { height: 40px; display: block; }
.brand-mk { display: block; }  /* the default ObserveOps mark (obs-logo) when no brand slot/text is given */
.right { display: flex; align-items: center; gap: 4px; }
/* circular action icon-button (search / health / approval / notifications) */
.circ {
  position: relative; width: 36px; height: 36px; border: 0; border-radius: 50%; padding: 0;
  display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
  background: none; color: var(--neutral-light, #6a7fa0); transition: background 0.15s, color 0.15s;
}
.circ:hover { background: var(--neutral-lighter, #e3e8f2); }
.circ.active { color: var(--primary, #111c2c); }
.badge {
  position: absolute; top: 6px; right: 6px; width: 14px; height: 14px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--secondary-red, #ec5b5b); color: var(--white-regular, #fff); font-size: 9px; line-height: 1;
}
/* BUILD version tag */
.build {
  display: inline-flex; align-items: center; height: 22px; margin: 0 8px; padding: 0 8px;
  border-radius: 4px; font-size: 11px;
  background: var(--timerange-background-color, #e3e8f2); color: var(--primary, #111c2c);
}
/* user avatar (opens the account menu — use the `user` slot for an obs-menu) */
.avatar {
  width: 32px; height: 32px; border: 0; padding: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
  background: var(--primary, #111c2c); color: var(--white-regular, #fff); font-size: 12px; font-weight: 600; cursor: pointer;
}
.avatar:focus-visible { outline: 2px solid var(--primary-alt, #3279be); outline-offset: 2px; }
</style>
