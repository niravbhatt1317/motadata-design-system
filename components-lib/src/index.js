import { defineCustomElement } from 'vue'
import ObsButton from './elements/ObsButton.ce.vue'
import ObsTag from './elements/ObsTag.ce.vue'
import ObsCheckbox from './elements/ObsCheckbox.ce.vue'
import ObsSwitch from './elements/ObsSwitch.ce.vue'
import ObsSelectedPills from './elements/ObsSelectedPills.ce.vue'
import ObsRadio from './elements/ObsRadio.ce.vue'
import ObsInput from './elements/ObsInput.ce.vue'
import ObsLink from './elements/ObsLink.ce.vue'
import ObsLogo from './elements/ObsLogo.ce.vue'
import ObsSelect from './elements/ObsSelect.ce.vue'
import ObsSeverity from './elements/ObsSeverity.ce.vue'
import ObsTags from './elements/ObsTags.ce.vue'
import ObsLayoutAppShell from './elements/ObsLayoutAppShell.ce.vue'
import ObsLayoutGrid from './elements/ObsLayoutGrid.ce.vue'
import ObsLayoutRegions from './elements/ObsLayoutRegions.ce.vue'
import ObsLayoutShells from './elements/ObsLayoutShells.ce.vue'
import ObsLayoutPageTemplates from './elements/ObsLayoutPageTemplates.ce.vue'
import ObsLayoutPanels from './elements/ObsLayoutPanels.ce.vue'
import ObsTooltip from './elements/ObsTooltip.ce.vue'
import ObsDataVizTooltip from './elements/ObsDataVizTooltip.ce.vue'
import ObsDateTimePicker from './elements/ObsDateTimePicker.ce.vue'
import ObsFilters from './elements/ObsFilters.ce.vue'
import ObsDrawer from './elements/ObsDrawer.ce.vue'
import ObsIcon from './elements/ObsIcon.ce.vue'
import ObsGridSelect from './elements/ObsGridSelect.ce.vue'
import ObsMenu from './elements/ObsMenu.ce.vue'
import ObsColorPicker from './elements/ObsColorPicker.ce.vue'
import ObsTable from './elements/ObsTable.ce.vue'
import ObsModal from './elements/ObsModal.ce.vue'
import ObsMetricList from './elements/ObsMetricList.ce.vue'
import ObsKeyValue from './elements/ObsKeyValue.ce.vue'
import ObsDivider from './elements/ObsDivider.ce.vue'
import ObsBanner from './elements/ObsBanner.ce.vue'
import ObsBreadcrumbs from './elements/ObsBreadcrumbs.ce.vue'
import ObsSideMenu from './elements/ObsSideMenu.ce.vue'
import ObsSidebar from './elements/ObsSidebar.ce.vue'
import ObsTabs from './elements/ObsTabs.ce.vue'
import ObsSteps from './elements/ObsSteps.ce.vue'
import ObsUserMenu from './elements/ObsUserMenu.ce.vue'
import ObsNotificationMenu from './elements/ObsNotificationMenu.ce.vue'
import ObsCommandPalette from './elements/ObsCommandPalette.ce.vue'
import ObsPageHeader from './elements/ObsPageHeader.ce.vue'
import ObsAppHeader from './elements/ObsAppHeader.ce.vue'
import ObsToolbar from './elements/ObsToolbar.ce.vue'
import ObsMetricPicker from './elements/ObsMetricPicker.ce.vue'
import ObsNocPlayer from './elements/ObsNocPlayer.ce.vue'
import ObsTimelineScrollbar from './elements/ObsTimelineScrollbar.ce.vue'

const elements = {
  'obs-button': ObsButton,
  'obs-tag': ObsTag,
  'obs-checkbox': ObsCheckbox,
  'obs-switch': ObsSwitch,
  'obs-selected-pills': ObsSelectedPills,
  'obs-radio': ObsRadio,
  'obs-input': ObsInput,
  'obs-link': ObsLink,
  'obs-select': ObsSelect,
  'obs-severity': ObsSeverity,
  'obs-tags': ObsTags,
  'obs-layout-appshell': ObsLayoutAppShell,
  'obs-layout-grid': ObsLayoutGrid,
  'obs-layout-regions': ObsLayoutRegions,
  'obs-layout-shells': ObsLayoutShells,
  'obs-layout-page-templates': ObsLayoutPageTemplates,
  'obs-layout-panels': ObsLayoutPanels,
  'obs-tooltip': ObsTooltip,
  'obs-dataviz-tooltip': ObsDataVizTooltip,
  'obs-date-time-picker': ObsDateTimePicker,
  'obs-filters': ObsFilters,
  'obs-drawer': ObsDrawer,
  'obs-icon': ObsIcon,
  'obs-logo': ObsLogo,
  'obs-grid-select': ObsGridSelect,
  'obs-menu': ObsMenu,
  'obs-color-picker': ObsColorPicker,
  'obs-table': ObsTable,
  'obs-modal': ObsModal,
  'obs-metric-list': ObsMetricList,
  'obs-key-value': ObsKeyValue,
  'obs-divider': ObsDivider,
  'obs-banner': ObsBanner,
  'obs-breadcrumbs': ObsBreadcrumbs,
  'obs-side-menu': ObsSideMenu,
  'obs-sidebar': ObsSidebar,
  'obs-tabs': ObsTabs,
  'obs-steps': ObsSteps,
  'obs-user-menu': ObsUserMenu,
  'obs-notification-menu': ObsNotificationMenu,
  'obs-command-palette': ObsCommandPalette,
  'obs-page-header': ObsPageHeader,
  'obs-app-header': ObsAppHeader,
  'obs-toolbar': ObsToolbar,
  'obs-metric-picker': ObsMetricPicker,
  'obs-noc-player': ObsNocPlayer,
  'obs-timeline-scrollbar': ObsTimelineScrollbar,
}

/** Register every ObserveOps custom element (idempotent). Runs automatically on import. */
export function register() {
  for (const [name, comp] of Object.entries(elements)) {
    if (!customElements.get(name)) customElements.define(name, defineCustomElement(comp))
  }
}

register()
