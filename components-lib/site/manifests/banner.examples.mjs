// Showcase manifest for <obs-banner> — the inline notice / callout (gap G2). Info uses the new --info-surface token.
export default {
  el: 'obs-banner',
  display: 'Banner',
  registry: 'banner',
  controls: [
    { label: 'Variant', prop: 'variant', type: 'select', options: ['info', 'note', 'success', 'warning', 'error'] },
    { prop: 'title', type: 'text' },
    { prop: 'closable', type: 'toggle', label: 'Closable' },
  ],
  playground: {
    attrs: { variant: 'info' },
    text: 'Visible to all users in the organization.',
    live: `<obs-banner variant="info" style="max-width:520px">Visible to all users in the organization.</obs-banner>`,
  },
  gallery: [
    { group: 'Intents — a tinted surface + status icon + message. `info` (DEFAULT) is the product subtle periwinkle notice (muted text); `note` is the emphasised brand-blue callout; success / warning / error use the severity surfaces', items: [
      { html: `<div style="display:flex;flex-direction:column;gap:10px;max-width:560px">
        <obs-banner variant="info">Anyone in the organization can view this dashboard. Edit access is limited to you and Dashboard Admins.</obs-banner>
        <obs-banner variant="note">Only the Users or User Profiles you add can view this dashboard.</obs-banner>
        <obs-banner variant="success">Sharing updated — 3 users can now view this.</obs-banner>
        <obs-banner variant="warning">This category is shared with 20+ users.</obs-banner>
        <obs-banner variant="error">At least one user is required when Private.</obs-banner>
      </div>` },
    ] },
    { group: 'With a title + dismiss — `title` adds a bold lead-in; `closable` shows a × (emits `close`, then hides itself)', items: [
      { html: `<obs-banner variant="warning" title="Heads up" closable style="max-width:560px">Only the Users or User Profiles you add can view this dashboard.</obs-banner>` },
    ] },
  ],
}
