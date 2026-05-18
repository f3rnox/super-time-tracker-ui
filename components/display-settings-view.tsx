import { AccentColorSetting } from '@/components/accent-color-setting'
import { CheckInFormCollapsedSetting } from '@/components/check-in-form-collapsed-setting'
import { CompactListsSetting } from '@/components/compact-lists-setting'
import { DefaultReportingSortSetting } from '@/components/default-reporting-sort-setting'
import { DurationFormatSetting } from '@/components/duration-format-setting'
import { SettingsPageLayout } from '@/components/settings-page-layout'
import { ThemeModeSetting } from '@/components/theme-mode-setting'
import { TimeFormatSetting } from '@/components/time-format-setting'
import { WeekStartsOnSetting } from '@/components/week-starts-on-setting'

/**
 * Settings page: display, layout, and formatting preferences.
 */
export function DisplaySettingsView() {
  return (
    <SettingsPageLayout
      breadcrumb={{
        current: 'Display & layout',
        parent: { label: 'Settings', href: '/settings' },
      }}
      title="Display & layout"
      description="How things look across the tracker, reporting, and entry lists."
    >
      <ul
        className="m-0 flex w-full list-none flex-col gap-2 p-0"
        aria-label="Display settings"
      >
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <ThemeModeSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <AccentColorSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <CompactListsSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <CheckInFormCollapsedSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <TimeFormatSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <DurationFormatSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <WeekStartsOnSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <DefaultReportingSortSetting />
        </li>
      </ul>
    </SettingsPageLayout>
  )
}
