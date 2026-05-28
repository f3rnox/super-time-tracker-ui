import { ClearTagFiltersOnSheetChangeSetting } from '@/components/clear-tag-filters-on-sheet-change-setting'
import { ConfirmBeforeCheckoutSetting } from '@/components/confirm-before-checkout-setting'
import { ConfirmDestructiveActionsSetting } from '@/components/confirm-destructive-actions-setting'
import { DebugLoggingSetting } from '@/components/debug-logging-setting'
import { DefaultSheetSessionSetting } from '@/components/default-sheet-session-setting'
import { SettingsPageLayout } from '@/components/settings-page-layout'

interface GeneralSettingsViewProps {
  sheet_names: string[]
}

/**
 * Settings page: general tracker behavior.
 */
export function GeneralSettingsView({
  sheet_names,
}: GeneralSettingsViewProps) {
  return (
    <SettingsPageLayout
      breadcrumb={{ current: 'General', parent: { label: 'Settings' } }}
      title="General"
      description="Tracker startup, confirmations, and session behavior."
    >
      <ul
        className="m-0 flex w-full list-none flex-col gap-2 p-0"
        aria-label="General settings"
      >
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <DefaultSheetSessionSetting sheet_names={sheet_names} />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <ConfirmBeforeCheckoutSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <ConfirmDestructiveActionsSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <ClearTagFiltersOnSheetChangeSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <DebugLoggingSetting />
        </li>
      </ul>
    </SettingsPageLayout>
  )
}
