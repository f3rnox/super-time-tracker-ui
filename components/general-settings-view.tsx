import { DefaultSheetSessionSetting } from '@/components/default-sheet-session-setting'
import { SettingsPageLayout } from '@/components/settings-page-layout'

interface GeneralSettingsViewProps {
  sheet_names: string[]
}

/**
 * Settings page: general tracker behavior.
 */
export function GeneralSettingsView({ sheet_names }: GeneralSettingsViewProps) {
  return (
    <SettingsPageLayout
      breadcrumb={{ current: 'General', parent: { label: 'Settings' } }}
      title="General"
      description="Tracker startup and session behavior."
    >
      <ul
        className="m-0 flex w-full list-none flex-col gap-2 p-0"
        aria-label="General settings"
      >
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <DefaultSheetSessionSetting sheet_names={sheet_names} />
        </li>
      </ul>
    </SettingsPageLayout>
  )
}
