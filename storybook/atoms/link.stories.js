// Atoms / Link — FlotoLink (_base-app-link.vue), 67×/48 files. A NAVIGATION control: default
// renders a RouterLink (an <a>); `as-button` renders an MButton that pushes the route on click.
// Its only own prop is `asButton`; everything else (to, target, variant when asButton) passes
// through via $attrs. (Storybook stubs RouterLink + $router so links render without a router.)

export default {
  title: 'Atoms/Link/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Atom — the **navigation** control (`FlotoLink`). Use it when something takes the user *somewhere* (route/URL). Default = a text link; `as-button` = a button that navigates. For an **action** (save/delete), use a **Button**, not a link.',
      },
    },
  },
  argTypes: {
    asButton: { control: 'boolean' },
    label: { control: 'text' },
    variant: { control: 'select', options: ['primary', 'primary-alt', 'default', 'transparent'] },
  },
  args: { asButton: false, label: 'View inventory', variant: 'primary' },
}

export const TextLink = () => ({
  template: `
    <div style="font-size:14px;color:var(--page-text-color)">
      Go to <FlotoLink to="/inventory" class="text-primary">the inventory list</FlotoLink> to see all monitors.
    </div>`,
})
TextLink.parameters = { docs: { description: { story: 'The default: an inline **text link** (renders a RouterLink → `<a>`). Use for navigation embedded in content, breadcrumbs, menu items, or a clickable value. Links inherit text color unless styled (here `text-primary`).' } } }

export const AsButton = () => ({
  template: `
    <div style="display:flex;gap:12px;align-items:center">
      <FlotoLink as-button to="/settings" variant="primary">Go to settings</FlotoLink>
      <FlotoLink as-button to="/dashboard" variant="default">Open dashboard</FlotoLink>
    </div>`,
})
AsButton.storyName = 'As button (navigation CTA)'
AsButton.parameters = { docs: { description: { story: 'With `as-button`, FlotoLink renders an **MButton** that navigates on click — a button-styled link. Use for a prominent navigation call-to-action (e.g., "Go to settings"). Takes any Button `variant`.' } } }

// External links can't use FlotoLink (RouterLink resolves INTERNAL routes only). The product
// uses a plain anchor with target="_blank" (147× across the app) — but 0 of them set
// rel="noopener noreferrer" (see SF-004). Always include rel on external/new-tab links.
export const ExternalLink = () => ({
  template: `
    <div style="font-size:14px;color:var(--page-text-color)">
      See the <a href="https://docs.example.com" target="_blank" rel="noopener noreferrer" class="text-primary">documentation</a> (opens in a new tab).
    </div>`,
})
ExternalLink.storyName = 'External link (plain anchor + rel)'
ExternalLink.parameters = { docs: { description: { story: 'For **external / new-tab** URLs use a plain `<a href target="_blank">` — `FlotoLink` (RouterLink) only resolves **internal** routes. ⚠️ Always add `rel="noopener noreferrer"`: the product has 147 `target="_blank"` links with **none** setting `rel` (SF-004; modern browsers mitigate this by default, but set it explicitly).' } } }

export const Playground = (args) => ({
  props: Object.keys(args),
  template: `
    <FlotoLink :as-button="asButton" to="/example" :variant="asButton ? variant : undefined" :class="asButton ? '' : 'text-primary'">
      {{ label }}
    </FlotoLink>`,
})
Playground.parameters = { docs: { description: { story: 'Toggle `asButton` to switch between a text link and a button-styled navigation link; pick a `variant` for the button form.' } } }

// Hide the Controls panel on static showcase stories (only Playground uses args).
TextLink.parameters = { ...(TextLink.parameters || {}), controls: { disable: true } }
AsButton.parameters = { ...(AsButton.parameters || {}), controls: { disable: true } }
ExternalLink.parameters = { ...(ExternalLink.parameters || {}), controls: { disable: true } }
